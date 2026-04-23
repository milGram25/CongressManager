from datetime import datetime, timedelta
from calendar import monthrange
from django.db import connection, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


PONENTE_INCLUDED_PONENCIAS = 2
PONENTE_MAX_PONENCIAS = 5


def _get_user_role(user):
    if user.is_superuser or user.is_staff:
        return 'administrador'
    if hasattr(user, 'dictaminador'):
        return 'dictaminador'
    if hasattr(user, 'evaluador'):
        return 'revisor'
    if hasattr(user, 'ponente'):
        return 'ponente'
    return 'asistente'


def _get_latest_costos_congreso():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id_costos_congreso,
                   costo_congreso_asistente,
                   costo_congreso_ponente,
                   costo_congreso_comite,
                   descuento_prepago,
                   descuento_estudiante
            FROM costos_congreso
            ORDER BY id_costos_congreso DESC
            LIMIT 1
            """
        )
        row = cursor.fetchone()

    if not row:
        return None

    return {
        'id_costos_congreso': row[0],
        'costo_asistente': float(row[1]),
        'costo_ponente': float(row[2]),
        'costo_comite': float(row[3]),
        'descuento_prepago': float(row[4] or 0),
        'descuento_estudiante': float(row[5] or 0),
    }


def _get_ponente_id_for_user(user_id):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id_ponente FROM ponente WHERE id_persona = %s LIMIT 1",
            [user_id],
        )
        row = cursor.fetchone()
    return row[0] if row else None


def _count_ponente_ponencias(id_ponente):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM ponente_has_ponencia WHERE id_ponente = %s",
            [id_ponente],
        )
        row = cursor.fetchone()
    return int(row[0]) if row else 0


def _count_paid_ponente_slots(user_id):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM pagos
            WHERE id_persona = %s
              AND (
                concepto = 'inscripcion_ponente_base'
                OR concepto LIKE 'inscripcion_ponente_extra_%%'
              )
            """,
            [user_id],
        )
        row = cursor.fetchone()
    return int(row[0]) if row else 0


def _has_role_payment(user_id, concept):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM pagos WHERE id_persona = %s AND concepto = %s LIMIT 1",
            [user_id, concept],
        )
        return cursor.fetchone() is not None


def _build_payment_summary(user):
    costos = _get_latest_costos_congreso()
    if not costos:
        return None

    role = _get_user_role(user)

    payload = {
        'price_catalog': {
            'asistente': costos['costo_asistente'],
            'ponente': costos['costo_ponente'],
            'comite': costos['costo_comite'],
            'descuento_prepago_pct': costos['descuento_prepago'],
            'descuento_estudiante_pct': costos['descuento_estudiante'],
        },
        'user_payment': {
            'role': role,
            'costos_id': costos['id_costos_congreso'],
        },
    }

    if role == 'ponente':
        id_ponente = _get_ponente_id_for_user(user.id_persona)
        if not id_ponente:
            payload['user_payment'].update({
                'base_price': costos['costo_ponente'],
                'ponencias_count': 0,
                'included_ponencias': PONENTE_INCLUDED_PONENCIAS,
                'max_ponencias': PONENTE_MAX_PONENCIAS,
                'extra_ponencias_count': 0,
                'overflow_ponencias_count': 0,
                'required_slots': 1,
                'paid_slots': 0,
                'pending_slots': 1,
                'total_due': costos['costo_ponente'],
            })
            return payload

        ponencias_count = _count_ponente_ponencias(id_ponente)
        overflow_ponencias_count = max(ponencias_count - PONENTE_MAX_PONENCIAS, 0)
        capped_ponencias_count = min(ponencias_count, PONENTE_MAX_PONENCIAS)
        extra_ponencias_count = max(capped_ponencias_count - PONENTE_INCLUDED_PONENCIAS, 0)
        required_slots = 1 + extra_ponencias_count
        paid_slots = _count_paid_ponente_slots(user.id_persona)
        pending_slots = max(required_slots - paid_slots, 0)

        payload['user_payment'].update({
            'base_price': costos['costo_ponente'],
            'ponencias_count': ponencias_count,
            'included_ponencias': PONENTE_INCLUDED_PONENCIAS,
            'max_ponencias': PONENTE_MAX_PONENCIAS,
            'extra_ponencias_count': extra_ponencias_count,
            'overflow_ponencias_count': overflow_ponencias_count,
            'required_slots': required_slots,
            'paid_slots': paid_slots,
            'pending_slots': pending_slots,
            'total_due': pending_slots * costos['costo_ponente'],
        })
        return payload

    if role in ('dictaminador', 'revisor', 'administrador'):
        base_price = costos['costo_comite']
    else:
        base_price = costos['costo_asistente']

    concept = f'inscripcion_{role}'
    already_paid = _has_role_payment(user.id_persona, concept)

    payload['user_payment'].update({
        'concept': concept,
        'base_price': base_price,
        'already_paid': already_paid,
        'pending_slots': 0 if already_paid else 1,
        'total_due': 0 if already_paid else base_price,
    })
    return payload


def _concept_for_slot(slot):
    if slot == 1:
        return 'inscripcion_ponente_base'
    return f'inscripcion_ponente_extra_{slot + 1}'


def _is_close(value_a, value_b):
    return abs(float(value_a) - float(value_b)) < 0.01


def _fetch_events_between(start_dt, end_dt):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT DISTINCT ON (e.id_evento)
                   e.id_evento,
                   e.nombre_evento,
                   e.tipo_evento::text,
                   e.fecha_hora_inicio,
                   e.fecha_hora_final,
                   COALESCE(m.nombre, 'Por definir') AS lugar,
                   COALESCE(sa.nombre, 'Sin eje') AS eje,
                   COALESCE(TRIM(CONCAT(pers.nombre, ' ', pers.primer_apellido)), 'Sin autor') AS autor,
                   COALESCE(r.retroalimentacion, '') AS abstract_text,
                   COALESCE(e.enlace, '') AS enlace
            FROM evento e
            LEFT JOIN mesas_trabajo m ON m.id_mesas_trabajo = e.id_mesas_trabajo
            LEFT JOIN ponencia po ON po.id_evento = e.id_evento
            LEFT JOIN subareas sa ON sa.id_subareas = po.id_subarea
            LEFT JOIN resumen r ON r.id_resumen = po.id_resumen
            LEFT JOIN ponente_has_ponencia php ON php.id_ponencia = po.id_ponencia
            LEFT JOIN ponente p ON p.id_ponente = php.id_ponente
            LEFT JOIN persona pers ON pers.id_persona = p.id_persona
            WHERE e.fecha_hora_inicio >= %s
              AND e.fecha_hora_inicio < %s
            ORDER BY e.id_evento, e.fecha_hora_inicio ASC
            """,
            [start_dt, end_dt],
        )
        rows = cursor.fetchall()

    events = []
    for row in rows:
        event_id, title, event_type, start_at, end_at, location, eje, author, abstract_text, link = row
        time_text = start_at.strftime('%I:%M %p').lstrip('0')
        abstract_value = abstract_text if abstract_text else 'Sin abstract disponible.'
        description = f"{title} en {location}."
        if link:
            description = f"{description} Enlace: {link}"

        events.append({
            'id': event_id,
            'title': title,
            'type': event_type,
            'start_iso': start_at.isoformat(),
            'end_iso': end_at.isoformat(),
            'time': time_text,
            'location': location,
            'eje': eje,
            'author': author,
            'abstract': abstract_value,
            'description': description,
            'link': link,
        })

    return events


def _parse_month(month_value):
    if not month_value:
        today = timezone.localdate()
        return today.year, today.month

    try:
        parsed = datetime.strptime(month_value, '%Y-%m')
        return parsed.year, parsed.month
    except ValueError:
        return None, None


class PagosResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = _build_payment_summary(request.user)
        if not summary:
            return Response(
                {'detail': 'No hay configuración de costos registrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(summary, status=status.HTTP_200_OK)


class RegistrarPagoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        summary = _build_payment_summary(request.user)
        if not summary:
            return Response(
                {'detail': 'No hay configuración de costos registrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        requires_invoice = bool(request.data.get('requiere_factura', False))
        role = summary['user_payment']['role']
        costos_id = summary['user_payment']['costos_id']
        base_price = summary['user_payment']['base_price']

        if role == 'ponente':
            pending_slots = int(summary['user_payment']['pending_slots'])
            paid_slots = int(summary['user_payment']['paid_slots'])
            overflow_ponencias = int(summary['user_payment']['overflow_ponencias_count'])

            if overflow_ponencias > 0:
                return Response(
                    {'detail': 'El máximo de ponencias pagables por ponente es 5.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if pending_slots <= 0:
                return Response(
                    {'detail': 'No hay pagos pendientes para este ponente.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                with connection.cursor() as cursor:
                    for slot in range(paid_slots + 1, paid_slots + pending_slots + 1):
                        cursor.execute(
                            """
                            INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura)
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            [
                                request.user.id_persona,
                                base_price,
                                _concept_for_slot(slot),
                                costos_id,
                                requires_invoice,
                            ],
                        )

            updated_summary = _build_payment_summary(request.user)
            return Response(
                {
                    'detail': 'Pagos de ponente registrados correctamente.',
                    'registered_slots': pending_slots,
                    'summary': updated_summary,
                },
                status=status.HTTP_201_CREATED,
            )

        concept = f'inscripcion_{role}'
        already_paid = _has_role_payment(request.user.id_persona, concept)

        if already_paid:
            return Response(
                {'detail': 'Este usuario ya tiene un pago registrado para su rol.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_monto = request.data.get('monto')
        monto = base_price
        if raw_monto is not None:
            try:
                monto = float(raw_monto)
            except (TypeError, ValueError):
                return Response(
                    {'detail': 'El monto enviado no es válido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if monto <= 0:
                return Response(
                    {'detail': 'El monto debe ser mayor a cero.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if role == 'asistente':
            descuento_estudiante = base_price * 0.5
            if not (_is_close(monto, base_price) or _is_close(monto, descuento_estudiante)):
                return Response(
                    {'detail': 'Monto no válido para asistente.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif not _is_close(monto, base_price):
            return Response(
                {'detail': 'Monto no válido para este rol.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    [
                        request.user.id_persona,
                        monto,
                        concept,
                        costos_id,
                        requires_invoice,
                    ],
                )

        updated_summary = _build_payment_summary(request.user)
        return Response(
            {
                'detail': 'Pago registrado correctamente.',
                'summary': updated_summary,
            },
            status=status.HTTP_201_CREATED,
        )


class AgendaHoyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        start_dt = datetime.combine(today, datetime.min.time())
        end_dt = start_dt + timedelta(days=1)
        events = _fetch_events_between(start_dt, end_dt)

        return Response(
            {
                'date': today.isoformat(),
                'events': events,
            },
            status=status.HTTP_200_OK,
        )


class AgendaCalendarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month_value = request.query_params.get('month')
        year, month = _parse_month(month_value)

        if not year or not month:
            return Response(
                {'detail': 'Formato de mes inválido. Usa YYYY-MM.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_dt = datetime(year, month, 1)
        _, days = monthrange(year, month)
        end_dt = start_dt + timedelta(days=days)
        events = _fetch_events_between(start_dt, end_dt)

        return Response(
            {
                'month': f'{year:04d}-{month:02d}',
                'events': events,
            },
            status=status.HTTP_200_OK,
        )
