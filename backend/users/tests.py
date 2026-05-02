from django.test import TestCase
from django.db import connection
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from rest_framework import status
from .models import Persona, DictaminadorCongreso, EvaluadorCongreso


def _create_persona(correo, nombre='Test', apellido='User', is_staff=False, is_superuser=False):
    hashed = make_password('TestPass1234!')
    with connection.cursor() as c:
        c.execute(
            """INSERT INTO persona
               (nombre, primer_apellido, correo_electronico, contrasena, is_active, is_staff, is_superuser)
               VALUES (%s, %s, %s, %s, TRUE, %s, %s) RETURNING id_persona""",
            [nombre, apellido, correo, hashed, is_staff, is_superuser],
        )
        pk = c.fetchone()[0]
    return Persona.objects.get(pk=pk)


def _create_congreso(nombre='Congreso Test'):
    """Inserta un Congreso vía SQL creando todos los prerrequisitos NOT NULL."""
    with connection.cursor() as c:
        c.execute(
            """INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id_sede""",
            ['Sede Test', 'México', 'CDMX', 'Ciudad de México', 'Calle Test', 1],
        )
        id_sede = c.fetchone()[0]

        c.execute(
            "INSERT INTO institucion (nombre) VALUES (%s) RETURNING id_institucion",
            ['Institución Test'],
        )
        id_institucion = c.fetchone()[0]

        d = '2026-01-01'
        c.execute(
            """INSERT INTO fechas_congreso
               (fecha_inicio_evento, fecha_final_evento, fecha_inicio_pago_normal, fecha_fin_pago_normal,
                fecha_inicio_inscribir_dictaminador, fecha_fin_inscribir_dictaminador,
                fecha_inicio_inscribir_evaluador, fecha_fin_inscribir_evaluador,
                fecha_inicio_subida_ponencias, fecha_fin_subida_ponencias,
                fecha_inicio_evaluar_resumenes, fecha_final_evaluar_resumenes,
                fecha_inicio_evaluar_extensos, fecha_fin_evaluar_extensos,
                fecha_inicio_subir_multimedia, fecha_fin_subir_multimedia)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id_fechas_congreso""",
            [d] * 16,
        )
        id_fechas = c.fetchone()[0]

        c.execute(
            """INSERT INTO costos_congreso
               (cuenta_deposito, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
               VALUES (%s, %s, %s, %s) RETURNING id_costos_congreso""",
            ['001234', 500, 600, 700],
        )
        id_costos = c.fetchone()[0]

        c.execute(
            """INSERT INTO congreso
               (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso)
               VALUES (%s, %s, %s, %s, %s) RETURNING id_congreso""",
            [nombre, id_sede, id_institucion, id_fechas, id_costos],
        )
        return c.fetchone()[0]


class AllUsersViewTests(TestCase):
    databases = ['default']

    def setUp(self):
        self.client = APIClient()
        self.admin = _create_persona('admin_all@test.com', is_staff=True, is_superuser=True)
        self.user = _create_persona('user_all@test.com', nombre='Juan', apellido='Pérez')
        self.congreso_id = _create_congreso('Congreso All Test')
        self.client.force_authenticate(user=self.admin)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        res = self.client.get(f'/api/users/all/?id_congreso={self.congreso_id}')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_requires_staff(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(f'/api/users/all/?id_congreso={self.congreso_id}')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_id_congreso(self):
        res = self.client.get('/api/users/all/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_returns_all_users_with_roles(self):
        DictaminadorCongreso.objects.create(id_persona=self.user, id_congreso_id=self.congreso_id)
        res = self.client.get(f'/api/users/all/?id_congreso={self.congreso_id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [u['id_persona'] for u in res.data]
        self.assertIn(self.user.id_persona, ids)
        u = next(u for u in res.data if u['id_persona'] == self.user.id_persona)
        self.assertTrue(u['roles']['dictaminador'])
        self.assertFalse(u['roles']['evaluador'])


class RoleAssignViewTests(TestCase):
    databases = ['default']

    def setUp(self):
        self.client = APIClient()
        self.admin = _create_persona('admin_assign@test.com', is_staff=True, is_superuser=True)
        self.target = _create_persona('target_assign@test.com', nombre='Pedro', apellido='Ruiz')
        self.congreso_id = _create_congreso('Congreso Assign Test')
        self.client.force_authenticate(user=self.admin)

    def test_assign_dictaminador(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'dictaminador', 'id_congreso': self.congreso_id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['dictaminador'])
        self.assertTrue(DictaminadorCongreso.objects.filter(
            id_persona=self.target, id_congreso_id=self.congreso_id
        ).exists())

    def test_assign_evaluador(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'evaluador', 'id_congreso': self.congreso_id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['evaluador'])

    def test_assign_admin_requires_password(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'administrador'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_admin_wrong_password(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'administrador', 'password': 'wrongpass'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_assign_admin_correct_password(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'administrador', 'password': 'TestPass1234!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['administrador'])
        self.target.refresh_from_db()
        self.assertTrue(self.target.is_staff)

    def test_requires_staff(self):
        non_admin = _create_persona('nonadmin_assign@test.com')
        self.client.force_authenticate(user=non_admin)
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/assign/',
            {'rol': 'dictaminador', 'id_congreso': self.congreso_id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class RoleRemoveViewTests(TestCase):
    databases = ['default']

    def setUp(self):
        self.client = APIClient()
        self.admin = _create_persona('admin_remove@test.com', is_staff=True, is_superuser=True)
        self.target = _create_persona('target_remove@test.com', nombre='Ana', apellido='López')
        self.congreso_id = _create_congreso('Congreso Remove Test')
        DictaminadorCongreso.objects.create(id_persona=self.target, id_congreso_id=self.congreso_id)
        EvaluadorCongreso.objects.create(id_persona=self.target, id_congreso_id=self.congreso_id)
        self.client.force_authenticate(user=self.admin)

    def test_remove_dictaminador(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'dictaminador', 'id_congreso': self.congreso_id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['dictaminador'])
        self.assertFalse(DictaminadorCongreso.objects.filter(
            id_persona=self.target, id_congreso_id=self.congreso_id
        ).exists())

    def test_remove_evaluador(self):
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'evaluador', 'id_congreso': self.congreso_id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['evaluador'])

    def test_remove_admin_requires_password(self):
        self.target.is_staff = True
        self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_admin_wrong_password(self):
        self.target.is_staff = True
        self.target.is_superuser = True
        self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador', 'password': 'wrongpass'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_remove_admin_correct_password(self):
        self.target.is_staff = True
        self.target.is_superuser = True
        self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador', 'password': 'TestPass1234!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['administrador'])
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_staff)
