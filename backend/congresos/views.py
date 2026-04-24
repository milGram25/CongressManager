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


# =============================================================================
# CRUD de Congresos (Eventos > Congresos > Lista)
# =============================================================================

FECHA_FIELDS = [
    'fecha_inicio_evento',
    'fecha_final_evento',
    'fecha_inicio_prepago',
    'fecha_fin_prepago',
    'fecha_inicio_pago_normal',
    'fecha_fin_pago_normal',
    'fecha_inicio_inscribir_dictaminador',
    'fecha_fin_inscribir_dictaminador',
    'fecha_inicio_inscribir_evaluador',
    'fecha_fin_inscribir_evaluador',
    'fecha_inicio_subida_ponencias',
    'fecha_fin_subida_ponencias',
    'fecha_inicio_evaluar_resumenes',
    'fecha_final_evaluar_resumenes',
    'fecha_inicio_evaluar_extensos',
    'fecha_fin_evaluar_extensos',
    'fecha_inicio_subir_multimedia',
    'fecha_fin_subir_multimedia',
    'fecha_inicio_subir_extenso_final',
    'fecha_fin_subir_extenso_final',
]


def _serialize_congreso_row(row):
    return {
        'id_congreso': row[0],
        'nombre_congreso': row[1],
        'id_sede': row[2],
        'nombre_sede': row[3],
        'id_institucion': row[4],
        'nombre_institucion': row[5],
        'ruta_imagen': row[6] or '',
        'cantidad_eventos': row[7] or 0,
        'fecha_hora_inicio': row[8].isoformat() if row[8] else '',
        'fecha_hora_final': row[9].isoformat() if row[9] else '',
    }


class ListarInstitucionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id_institucion, nombre, ruta_imagen FROM institucion ORDER BY nombre"
            )
            rows = cursor.fetchall()

        data = [
            {'id': row[0], 'nombre': row[1], 'ruta_imagen': row[2] or ''}
            for row in rows
        ]
        return Response(data, status=status.HTTP_200_OK)


class ListarCongresosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id_institucion = request.query_params.get('id_institucion')

        base_sql = """
            SELECT c.id_congreso,
                   c.nombre_congreso,
                   s.id_sede,
                   s.nombre_sede,
                   i.id_institucion,
                   i.nombre,
                   i.ruta_imagen,
                   (SELECT COUNT(*) FROM evento e WHERE e.id_congreso = c.id_congreso) AS cantidad_eventos,
                   f.fecha_inicio_evento,
                   f.fecha_final_evento
            FROM congreso c
            JOIN sede s ON s.id_sede = c.id_sede
            JOIN institucion i ON i.id_institucion = c.id_institucion
            JOIN fechas_congreso f ON f.id_fechas_congreso = c.id_fechas_congreso
        """

        params = []
        if id_institucion:
            try:
                params.append(int(id_institucion))
            except (TypeError, ValueError):
                return Response(
                    {'detail': 'id_institucion inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            base_sql += " WHERE c.id_institucion = %s"

        base_sql += " ORDER BY c.id_congreso DESC"

        with connection.cursor() as cursor:
            cursor.execute(base_sql, params)
            rows = cursor.fetchall()

        data = [_serialize_congreso_row(r) for r in rows]
        return Response(data, status=status.HTTP_200_OK)


class DetalleCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id_congreso):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT c.id_congreso, c.nombre_congreso,
                       i.id_institucion, i.nombre, i.ruta_imagen,
                       s.id_sede, s.nombre_sede, s.pais, s.estado, s.ciudad,
                       s.calle, s.num_exterior, s.num_interior, s.modulo_fisico,
                       f.id_fechas_congreso,
                       f.fecha_inicio_evento, f.fecha_final_evento,
                       f.fecha_inicio_prepago, f.fecha_fin_prepago,
                       f.fecha_inicio_pago_normal, f.fecha_fin_pago_normal,
                       f.fecha_inicio_inscribir_dictaminador, f.fecha_fin_inscribir_dictaminador,
                       f.fecha_inicio_inscribir_evaluador, f.fecha_fin_inscribir_evaluador,
                       f.fecha_inicio_subida_ponencias, f.fecha_fin_subida_ponencias,
                       f.fecha_inicio_evaluar_resumenes, f.fecha_final_evaluar_resumenes,
                       f.fecha_inicio_evaluar_extensos, f.fecha_fin_evaluar_extensos,
                       f.fecha_inicio_subir_multimedia, f.fecha_fin_subir_multimedia,
                       f.fecha_inicio_subir_extenso_final, f.fecha_fin_subir_extenso_final,
                       co.id_costos_congreso, co.cuenta_deposito,
                       co.descuento_prepago, co.descuento_estudiante,
                       co.costo_congreso_asistente, co.costo_congreso_ponente, co.costo_congreso_comite,
                       c.id_rubrica_default
                FROM congreso c
                JOIN institucion i ON i.id_institucion = c.id_institucion
                JOIN sede s ON s.id_sede = c.id_sede
                JOIN fechas_congreso f ON f.id_fechas_congreso = c.id_fechas_congreso
                JOIN costos_congreso co ON co.id_costos_congreso = c.id_costos_congreso
                WHERE c.id_congreso = %s
                """,
                [id_congreso],
            )
            row = cursor.fetchone()

        if not row:
            return Response(
                {'detail': 'Congreso no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        def iso(dt):
            return dt.isoformat() if dt else ''

        data = {
            'id_congreso': row[0],
            'nombre_congreso': row[1],
            'id_institucion': row[2],
            'nombre_institucion': row[3],
            'ruta_imagen': row[4] or '',
            'id_sede': row[5],
            'nombre_sede': row[6],
            'pais': row[7],
            'estado': row[8],
            'ciudad': row[9],
            'calle': row[10],
            'num_exterior': row[11],
            'num_interior': row[12],
            'modulo_fisico': row[13] or '',
            'id_fechas_congreso': row[14],
            'fecha_inicio_evento': iso(row[15]),
            'fecha_final_evento': iso(row[16]),
            'fecha_inicio_prepago': iso(row[17]),
            'fecha_fin_prepago': iso(row[18]),
            'fecha_inicio_pago_normal': iso(row[19]),
            'fecha_fin_pago_normal': iso(row[20]),
            'fecha_inicio_inscribir_dictaminador': iso(row[21]),
            'fecha_fin_inscribir_dictaminador': iso(row[22]),
            'fecha_inicio_inscribir_evaluador': iso(row[23]),
            'fecha_fin_inscribir_evaluador': iso(row[24]),
            'fecha_inicio_subida_ponencias': iso(row[25]),
            'fecha_fin_subida_ponencias': iso(row[26]),
            'fecha_inicio_evaluar_resumenes': iso(row[27]),
            'fecha_final_evaluar_resumenes': iso(row[28]),
            'fecha_inicio_evaluar_extensos': iso(row[29]),
            'fecha_fin_evaluar_extensos': iso(row[30]),
            'fecha_inicio_subir_multimedia': iso(row[31]),
            'fecha_fin_subir_multimedia': iso(row[32]),
            'fecha_inicio_subir_extenso_final': iso(row[33]),
            'fecha_fin_subir_extenso_final': iso(row[34]),
            'id_costos_congreso': row[35],
            'cuenta_deposito': row[36],
            'descuento_prepago': float(row[37] or 0),
            'descuento_estudiante': float(row[38] or 0),
            'costo_congreso_asistente': float(row[39]),
            'costo_congreso_ponente': float(row[40]),
            'costo_congreso_comite': float(row[41]),
            'id_rubrica_default': row[42],
        }
        return Response(data, status=status.HTTP_200_OK)


def _extract_congreso_payload(data):
    required_text = ['nombre_congreso', 'id_institucion', 'nombre_sede', 'pais',
                     'estado', 'ciudad', 'calle', 'num_exterior', 'cuenta_deposito']
    missing = [f for f in required_text if data.get(f) in (None, '')]
    if missing:
        return None, f"Faltan campos obligatorios: {', '.join(missing)}"

    fechas = {}
    for field in FECHA_FIELDS:
        raw = data.get(field)
        if raw in (None, ''):
            if field in ('fecha_inicio_prepago', 'fecha_fin_prepago'):
                fechas[field] = None
                continue
            return None, f"Falta la fecha '{field}'."
        fechas[field] = raw

    try:
        num_exterior = int(data.get('num_exterior'))
    except (TypeError, ValueError):
        return None, 'num_exterior debe ser un número entero.'

    num_interior_raw = data.get('num_interior')
    try:
        num_interior = int(num_interior_raw) if num_interior_raw not in (None, '') else None
    except (TypeError, ValueError):
        return None, 'num_interior debe ser un número entero.'

    try:
        payload = {
            'nombre_congreso': str(data['nombre_congreso']).strip(),
            'id_institucion': int(data['id_institucion']),
            'id_rubrica_default': int(data['id_rubrica_default']) if data.get('id_rubrica_default') not in (None, '') else None,
            'sede': {
                'nombre_sede': str(data['nombre_sede']).strip(),
                'pais': str(data['pais']).strip(),
                'estado': str(data['estado']).strip(),
                'ciudad': str(data['ciudad']).strip(),
                'calle': str(data['calle']).strip(),
                'num_exterior': num_exterior,
                'num_interior': num_interior,
                'modulo_fisico': str(data.get('modulo_fisico') or '').strip() or None,
            },
            'costos': {
                'cuenta_deposito': str(data['cuenta_deposito']).strip(),
                'descuento_prepago': float(data.get('descuento_prepago') or 0),
                'descuento_estudiante': float(data.get('descuento_estudiante') or 0),
                'costo_congreso_asistente': float(data.get('costo_congreso_asistente') or 0),
                'costo_congreso_ponente': float(data.get('costo_congreso_ponente') or 0),
                'costo_congreso_comite': float(data.get('costo_congreso_comite') or 0),
            },
            'fechas': fechas,
        }
    except (TypeError, ValueError) as exc:
        return None, f'Valor numérico inválido: {exc}'

    return payload, None


class CrearCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload, error = _extract_congreso_payload(request.data)
        if error:
            return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            with connection.cursor() as cursor:
                sede = payload['sede']
                cursor.execute(
                    """
                    INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, num_interior, modulo_fisico)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id_sede
                    """,
                    [sede['nombre_sede'], sede['pais'], sede['estado'], sede['ciudad'],
                     sede['calle'], sede['num_exterior'], sede['num_interior'], sede['modulo_fisico']],
                )
                id_sede = cursor.fetchone()[0]

                fechas = payload['fechas']
                cursor.execute(
                    f"""
                    INSERT INTO fechas_congreso ({', '.join(FECHA_FIELDS)})
                    VALUES ({', '.join(['%s'] * len(FECHA_FIELDS))})
                    RETURNING id_fechas_congreso
                    """,
                    [fechas[f] for f in FECHA_FIELDS],
                )
                id_fechas = cursor.fetchone()[0]

                costos = payload['costos']
                cursor.execute(
                    """
                    INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante,
                                                 costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_costos_congreso
                    """,
                    [costos['cuenta_deposito'], costos['descuento_prepago'], costos['descuento_estudiante'],
                     costos['costo_congreso_asistente'], costos['costo_congreso_ponente'], costos['costo_congreso_comite']],
                )
                id_costos = cursor.fetchone()[0]

                cursor.execute(
                    """
                    INSERT INTO congreso (nombre_congreso, id_sede, id_institucion,
                                          id_fechas_congreso, id_costos_congreso, id_rubrica_default)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_congreso
                    """,
                    [payload['nombre_congreso'], id_sede, payload['id_institucion'],
                     id_fechas, id_costos, payload['id_rubrica_default']],
                )
                id_congreso = cursor.fetchone()[0]

        return Response(
            {'detail': 'Congreso creado correctamente.', 'id_congreso': id_congreso},
            status=status.HTTP_201_CREATED,
        )


class ActualizarCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id_congreso):
        payload, error = _extract_congreso_payload(request.data)
        if error:
            return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id_sede, id_fechas_congreso, id_costos_congreso FROM congreso WHERE id_congreso = %s",
                [id_congreso],
            )
            row = cursor.fetchone()

        if not row:
            return Response({'detail': 'Congreso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        id_sede, id_fechas, id_costos = row

        with transaction.atomic():
            with connection.cursor() as cursor:
                sede = payload['sede']
                cursor.execute(
                    """
                    UPDATE sede
                    SET nombre_sede=%s, pais=%s, estado=%s, ciudad=%s, calle=%s,
                        num_exterior=%s, num_interior=%s, modulo_fisico=%s
                    WHERE id_sede=%s
                    """,
                    [sede['nombre_sede'], sede['pais'], sede['estado'], sede['ciudad'],
                     sede['calle'], sede['num_exterior'], sede['num_interior'],
                     sede['modulo_fisico'], id_sede],
                )

                fechas = payload['fechas']
                set_clause = ', '.join(f"{f}=%s" for f in FECHA_FIELDS)
                cursor.execute(
                    f"UPDATE fechas_congreso SET {set_clause} WHERE id_fechas_congreso=%s",
                    [fechas[f] for f in FECHA_FIELDS] + [id_fechas],
                )

                costos = payload['costos']
                cursor.execute(
                    """
                    UPDATE costos_congreso
                    SET cuenta_deposito=%s, descuento_prepago=%s, descuento_estudiante=%s,
                        costo_congreso_asistente=%s, costo_congreso_ponente=%s, costo_congreso_comite=%s
                    WHERE id_costos_congreso=%s
                    """,
                    [costos['cuenta_deposito'], costos['descuento_prepago'], costos['descuento_estudiante'],
                     costos['costo_congreso_asistente'], costos['costo_congreso_ponente'],
                     costos['costo_congreso_comite'], id_costos],
                )

                cursor.execute(
                    """
                    UPDATE congreso
                    SET nombre_congreso=%s, id_institucion=%s, id_rubrica_default=%s
                    WHERE id_congreso=%s
                    """,
                    [payload['nombre_congreso'], payload['id_institucion'],
                     payload['id_rubrica_default'], id_congreso],
                )

        return Response(
            {'detail': 'Congreso actualizado correctamente.', 'id_congreso': id_congreso},
            status=status.HTTP_200_OK,
        )


class EliminarCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id_congreso):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM evento WHERE id_congreso = %s",
                [id_congreso],
            )
            eventos_asociados = cursor.fetchone()[0]

        if eventos_asociados:
            return Response(
                {'detail': f'No se puede eliminar: el congreso tiene {eventos_asociados} evento(s) asociado(s).'},
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM congreso WHERE id_congreso = %s",
                    [id_congreso],
                )
                if cursor.rowcount == 0:
                    return Response(
                        {'detail': 'Congreso no encontrado.'},
                        status=status.HTTP_404_NOT_FOUND,
                    )

        return Response(
            {'detail': 'Congreso eliminado correctamente.'},
            status=status.HTTP_200_OK,
        )


class ListarTiposTrabajoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id_tipo_trabajo, tipo_trabajo FROM tipo_trabajo ORDER BY tipo_trabajo"
            )
            rows = cursor.fetchall()
        return Response(
            [{'id': r[0], 'nombre': r[1]} for r in rows],
            status=status.HTTP_200_OK,
        )


class ListarRubricasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id_rubrica, nombre, tipo_trabajo, esta_activo
                FROM rubrica
                WHERE esta_activo = true
                ORDER BY nombre
                """
            )
            rows = cursor.fetchall()
        return Response(
            [{'id': r[0], 'nombre': r[1], 'id_tipo_trabajo': r[2]} for r in rows],
            status=status.HTTP_200_OK,
        )
