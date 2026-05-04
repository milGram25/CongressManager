# Gestión de Roles por Congreso (/admin/procesos/roles) — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la vista `/admin/procesos/roles` que permite al administrador asignar y quitar roles (dictaminador, evaluador, administrador) a cualquier usuario del sistema, con los roles dictaminador/evaluador siendo específicos por congreso.

**Architecture:** Dos nuevas tablas `dictaminador_congreso` y `evaluador_congreso` (managed=True) almacenan roles por congreso. Tres endpoints nuevos en `users/` manejan listado y mutaciones. El frontend agrega una tarjeta en `ProcesosView` y una vista con selector de congreso, lista de usuarios con búsqueda, y un modal con toggles de roles y confirmación doble (simple o por contraseña según el rol). Nota: todos los demás modelos del proyecto son `managed=False`; los tests backend requieren `--keepdb` para que las tablas unmanaged existan en el DB de pruebas.

**Tech Stack:** Django REST Framework, `authenticate()` de Django, React, Tailwind CSS, DaisyUI (modal, toggle, badge, alert)

---

## File Map

| Archivo | Acción |
|---|---|
| `backend/users/models.py` | Modificar — agregar `DictaminadorCongreso`, `EvaluadorCongreso` |
| `backend/users/migrations/0003_*.py` | Crear — generado por `makemigrations` |
| `backend/users/views.py` | Modificar — agregar `AllUsersView`, `RoleAssignView`, `RoleRemoveView` |
| `backend/users/urls.py` | Modificar — registrar 3 rutas nuevas |
| `backend/users/tests.py` | Modificar — tests de los 3 endpoints |
| `frontend/src/api/adminApi.js` | Modificar — agregar `getAllUsersApi`, `assignRoleApi`, `removeRoleApi` |
| `frontend/src/views/admin/ProcesosView.jsx` | Modificar — agregar tarjeta "Roles" |
| `frontend/src/views/admin/ProcesosRolesView.jsx` | Crear — vista principal |
| `frontend/src/views/admin/Componentes/UserRolesModal.jsx` | Crear — modal de gestión de roles |
| `frontend/src/App.jsx` | Modificar — ruta + sub-ítem sidebar |
| `frontend/src/layouts/SidebarLayout.jsx` | Modificar — agregar `/admin/procesos/roles` a `menuRoutes` |

---

## Task 1: Modelos DictaminadorCongreso y EvaluadorCongreso

**Files:**
- Modify: `backend/users/models.py`
- Generate: `backend/users/migrations/0003_*.py`
- Modify: `database/congress.sql`

- [ ] **Step 1: Agregar los dos modelos al final de `backend/users/models.py`**

Después de la clase `HistorialAcciones`, agregar:

```python
class DictaminadorCongreso(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, db_column='id_persona')
    id_congreso = models.ForeignKey(Congreso, on_delete=models.CASCADE, db_column='id_congreso')

    class Meta:
        unique_together = ('id_persona', 'id_congreso')
        db_table = 'dictaminador_congreso'


class EvaluadorCongreso(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, db_column='id_persona')
    id_congreso = models.ForeignKey(Congreso, on_delete=models.CASCADE, db_column='id_congreso')

    class Meta:
        unique_together = ('id_persona', 'id_congreso')
        db_table = 'evaluador_congreso'
```

- [ ] **Step 2: Actualizar `database/congress.sql`**

En la sección `-- 5. ROLES Y LOGÍSTICA`, después de la tabla `dictaminador`, agregar las dos tablas nuevas (ya incluido en el archivo — verificar que estén presentes):

```sql
CREATE TABLE dictaminador_congreso (
    id SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso) ON DELETE CASCADE,
    UNIQUE(id_persona, id_congreso)
);

CREATE TABLE evaluador_congreso (
    id SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso) ON DELETE CASCADE,
    UNIQUE(id_persona, id_congreso)
);
```

- [ ] **Step 3: Generar y aplicar la migración**

```bash
cd backend && source venv/bin/activate
python manage.py makemigrations users
python manage.py migrate
```

Salida esperada: migración `0003_dictaminadorcongreso_evaluadorcongreso` creada y aplicada sin errores.

- [ ] **Step 4: Verificar que las tablas existen**

```bash
python manage.py dbshell
```

```sql
SELECT table_name FROM information_schema.tables WHERE table_name IN ('dictaminador_congreso','evaluador_congreso');
\q
```

Ambas tablas deben aparecer en el resultado.

- [ ] **Step 5: Commit**

```bash
git add backend/users/models.py backend/users/migrations/ database/congress.sql
git commit -m "feat: modelos DictaminadorCongreso y EvaluadorCongreso por congreso"
```

---

## Task 2: AllUsersView — test e implementación

**Files:**
- Modify: `backend/users/tests.py`
- Modify: `backend/users/views.py`

- [ ] **Step 1: Reemplazar `backend/users/tests.py` con los tests de AllUsersView**

```python
from django.test import TestCase
from django.db import connection
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from rest_framework import status
from .models import Persona, DictaminadorCongreso, EvaluadorCongreso


def _create_persona(correo, nombre='Test', apellido='User', is_staff=False, is_superuser=False):
    """Inserta una Persona vía SQL (modelo unmanaged) y la devuelve como instancia ORM."""
    hashed = make_password('TestPass1234!')
    with connection.cursor() as c:
        c.execute(
            """INSERT INTO persona
               (nombre, primer_apellido, correo_electronico, contrasena, is_active, is_staff, is_superuser)
               VALUES (%s, %s, %s, %s, TRUE, %s, %s)""",
            [nombre, apellido, correo, hashed, is_staff, is_superuser],
        )
        pk = c.lastrowid
    return Persona.objects.get(pk=pk)


def _create_congreso(nombre='Congreso Test'):
    """Inserta un Congreso vía SQL (modelo unmanaged) y devuelve su id."""
    with connection.cursor() as c:
        c.execute(
            "INSERT INTO congreso (nombre_congreso, descripcion) VALUES (%s, %s)",
            [nombre, 'desc'],
        )
        return c.lastrowid


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
```

- [ ] **Step 2: Correr los tests — deben fallar (endpoint no existe)**

```bash
cd backend && source venv/bin/activate
python manage.py test users.tests.AllUsersViewTests --keepdb -v 2
```

Salida esperada: error 404 o `ConnectionError` (la URL no existe aún).

- [ ] **Step 3: Actualizar el import de modelos en `backend/users/views.py`**

Cambiar la línea de import de modelos de:

```python
from .models import Persona, Asistente, Dictaminador, Evaluador, Ponente, Factura, Constancia, HistorialAcciones
```

a:

```python
from .models import Persona, Asistente, Dictaminador, Evaluador, Ponente, Factura, Constancia, HistorialAcciones, DictaminadorCongreso, EvaluadorCongreso
```

- [ ] **Step 4: Agregar `AllUsersView` al final de `backend/users/views.py`**

```python
class AllUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        personas = Persona.objects.all().order_by('nombre', 'primer_apellido')
        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))

        data = []
        for p in personas:
            nombre_completo = ' '.join(x for x in [p.nombre, p.primer_apellido, p.segundo_apellido] if x).strip()
            data.append({
                'id_persona': p.id_persona,
                'nombre_completo': nombre_completo,
                'correo_electronico': p.correo_electronico,
                'num_telefono': p.num_telefono or '',
                'genero': p.genero or '',
                'pais': p.pais or '',
                'roles': {
                    'dictaminador': p.id_persona in dict_ids,
                    'evaluador': p.id_persona in eval_ids,
                    'administrador': p.is_staff or p.is_superuser,
                },
            })
        return Response(data)
```

---

## Task 3: RoleAssignView y RoleRemoveView — test e implementación

**Files:**
- Modify: `backend/users/tests.py`
- Modify: `backend/users/views.py`

- [ ] **Step 1: Agregar tests al final de `backend/users/tests.py`**

```python
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
        self.target.is_staff = True; self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_admin_wrong_password(self):
        self.target.is_staff = True; self.target.is_superuser = True; self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador', 'password': 'wrongpass'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_remove_admin_correct_password(self):
        self.target.is_staff = True; self.target.is_superuser = True; self.target.save()
        res = self.client.post(
            f'/api/users/{self.target.pk}/role/remove/',
            {'rol': 'administrador', 'password': 'TestPass1234!'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['administrador'])
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_staff)
```

- [ ] **Step 2: Correr tests — deben fallar**

```bash
python manage.py test users.tests.RoleAssignViewTests users.tests.RoleRemoveViewTests --keepdb -v 2
```

Salida esperada: errores 404 (endpoints no existen aún).

- [ ] **Step 3: Agregar `RoleAssignView` al final de `backend/users/views.py`**

```python
class RoleAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        rol = request.data.get('rol')
        id_congreso = request.data.get('id_congreso')
        password = request.data.get('password', '')

        if rol not in ('dictaminador', 'evaluador', 'administrador'):
            return Response({'detail': 'Rol no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            persona = Persona.objects.get(pk=id_persona)
        except Persona.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if rol == 'administrador':
            if not password:
                return Response({'detail': 'Se requiere contraseña.'}, status=status.HTTP_400_BAD_REQUEST)
            user = authenticate(request, username=request.user.correo_electronico, password=password)
            if user is None:
                return Response({'detail': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)
            persona.is_staff = True
            persona.is_superuser = True
            persona.save()
        else:
            if not id_congreso:
                return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            if rol == 'dictaminador':
                DictaminadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)
            else:
                EvaluadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)

        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()

        return Response({
            'dictaminador': persona.id_persona in dict_ids,
            'evaluador': persona.id_persona in eval_ids,
            'administrador': persona.is_staff or persona.is_superuser,
        })
```

- [ ] **Step 4: Agregar `RoleRemoveView` al final de `backend/users/views.py`**

```python
class RoleRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        rol = request.data.get('rol')
        id_congreso = request.data.get('id_congreso')
        password = request.data.get('password', '')

        if rol not in ('dictaminador', 'evaluador', 'administrador'):
            return Response({'detail': 'Rol no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            persona = Persona.objects.get(pk=id_persona)
        except Persona.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if rol == 'administrador':
            if not password:
                return Response({'detail': 'Se requiere contraseña.'}, status=status.HTTP_400_BAD_REQUEST)
            user = authenticate(request, username=request.user.correo_electronico, password=password)
            if user is None:
                return Response({'detail': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)
            persona.is_staff = False
            persona.is_superuser = False
            persona.save()
        else:
            if not id_congreso:
                return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            if rol == 'dictaminador':
                DictaminadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()
            else:
                EvaluadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()

        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()

        return Response({
            'dictaminador': persona.id_persona in dict_ids,
            'evaluador': persona.id_persona in eval_ids,
            'administrador': persona.is_staff or persona.is_superuser,
        })
```

---

## Task 4: Registrar URLs y correr todos los tests

**Files:**
- Modify: `backend/users/urls.py`

- [ ] **Step 1: Actualizar imports en `backend/users/urls.py`**

```python
from .views import (
    RegisterView, LoginView, UserMeView,
    ParticipantsListView,
    ConstanciaUploadView, BulkConstanciaActionView,
    FacturaUploadView, BulkFacturaActionView,
    UserActionHistoryView,
    AllUsersView, RoleAssignView, RoleRemoveView,
)
```

- [ ] **Step 2: Agregar las 3 rutas al final de `urlpatterns`**

```python
    path('all/', AllUsersView.as_view(), name='all-users'),
    path('<int:id_persona>/role/assign/', RoleAssignView.as_view(), name='role-assign'),
    path('<int:id_persona>/role/remove/', RoleRemoveView.as_view(), name='role-remove'),
```

- [ ] **Step 3: Correr todos los tests — deben pasar**

```bash
cd backend && source venv/bin/activate
python manage.py test users --keepdb -v 2
```

Salida esperada: todos los tests en verde. Si alguno falla, corregir antes de continuar.

- [ ] **Step 4: Commit**

```bash
git add backend/users/
git commit -m "feat: endpoints AllUsersView RoleAssignView RoleRemoveView con roles por congreso"
```

---

## Task 5: Frontend — funciones de API

**Files:**
- Modify: `frontend/src/api/adminApi.js`

- [ ] **Step 1: Agregar las 3 funciones al final de `adminApi.js`**

```javascript
export async function getAllUsersApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/users/all/?id_congreso=${idCongreso}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al obtener usuarios.');
  return res.json();
}

export async function assignRoleApi(accessToken, idPersona, { rol, idCongreso, password }) {
  const body = { rol };
  if (idCongreso) body.id_congreso = idCongreso;
  if (password) body.password = password;
  const res = await fetch(`${API_URL}/api/users/${idPersona}/role/assign/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al asignar rol.');
  return data;
}

export async function removeRoleApi(accessToken, idPersona, { rol, idCongreso, password }) {
  const body = { rol };
  if (idCongreso) body.id_congreso = idCongreso;
  if (password) body.password = password;
  const res = await fetch(`${API_URL}/api/users/${idPersona}/role/remove/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al quitar rol.');
  return data;
}
```

- [ ] **Step 2: Verificar que Vite no muestra errores**

Revisar el terminal donde corre `npm run dev`. No debe haber errores de compilación.

---

## Task 6: ProcesosView — agregar tarjeta "Roles"

**Files:**
- Modify: `frontend/src/views/admin/ProcesosView.jsx`

- [ ] **Step 1: Reemplazar el contenido completo de `ProcesosView.jsx`**

```jsx
import { useNavigate } from "react-router-dom";
import { MdDescription, MdArticle, MdManageAccounts } from "react-icons/md";

export default function ProcesosView() {
  const navigate = useNavigate();

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <h2 className="text-2xl font-bold mb-8 text-center">Seleccione el tipo de proceso</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto py-10">
        <button
          onClick={() => navigate('resumenes')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdDescription className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Resúmenes</h3>
            <p className="text-sm text-base-content/50 mt-2">Gestión y revisión de propuestas iniciales</p>
          </div>
        </button>

        <button
          onClick={() => navigate('extensos')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdArticle className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Extensos</h3>
            <p className="text-sm text-base-content/50 mt-2">Gestión de documentos finales y publicaciones</p>
          </div>
        </button>

        <button
          onClick={() => navigate('roles')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdManageAccounts className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Roles</h3>
            <p className="text-sm text-base-content/50 mt-2">Asignación de roles por congreso</p>
          </div>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar en navegador**

Navegar a `http://localhost:5173/admin/procesos`. Deben verse tres tarjetas: Resúmenes, Extensos, Roles. Click en "Roles" falla aún (ruta no registrada) — es esperado.

---

## Task 7: Crear UserRolesModal

**Files:**
- Create: `frontend/src/views/admin/Componentes/UserRolesModal.jsx`

- [ ] **Step 1: Crear el archivo con el siguiente contenido**

```jsx
import { useState } from "react";
import { MdClose, MdLock, MdPerson, MdEmail, MdPhone, MdPublic, MdWc } from "react-icons/md";
import { assignRoleApi, removeRoleApi } from "../../../api/adminApi";

const ROLES = [
  { key: 'dictaminador',  label: 'Dictaminador' },
  { key: 'evaluador',     label: 'Evaluador' },
  { key: 'administrador', label: 'Administrador' },
];

export default function UserRolesModal({ user, congreso, onClose, onRolesUpdated }) {
  const [pendingAction, setPendingAction] = useState(null); // { rol, action: 'assign'|'remove' }
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const token = localStorage.getItem('congress_access');

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggle = (rol, currentValue) => {
    if (pendingAction) return;
    setPendingAction({ rol, action: currentValue ? 'remove' : 'assign' });
    setPassword('');
  };

  const handleCancel = () => {
    setPendingAction(null);
    setPassword('');
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { rol, action } = pendingAction;
    const needsPassword = rol === 'administrador';

    if (needsPassword && !password) {
      showFeedback('error', 'Ingresa tu contraseña para continuar.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rol,
        idCongreso: rol !== 'administrador' ? congreso?.id_congreso : undefined,
        password: needsPassword ? password : undefined,
      };
      const updatedRoles = action === 'assign'
        ? await assignRoleApi(token, user.id_persona, payload)
        : await removeRoleApi(token, user.id_persona, payload);

      onRolesUpdated(user.id_persona, updatedRoles);
      showFeedback('success', `Rol de ${ROLES.find(r => r.key === rol)?.label} ${action === 'assign' ? 'asignado' : 'quitado'} correctamente.`);
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setLoading(false);
      setPendingAction(null);
      setPassword('');
    }
  };

  const isAdmin = pendingAction?.rol === 'administrador';
  const confirmLabel = pendingAction?.action === 'assign' ? 'Asignar' : 'Quitar';

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-lg">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MdPerson className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{user.nombre_completo}</h3>
              <p className="text-xs text-base-content/50">Gestión de roles</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* Datos del usuario */}
        <div className="grid grid-cols-1 gap-2 mb-6 bg-base-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm">
            <MdEmail className="text-base-content/40 flex-shrink-0" />
            <span className="truncate">{user.correo_electronico}</span>
          </div>
          {user.num_telefono && (
            <div className="flex items-center gap-2 text-sm">
              <MdPhone className="text-base-content/40 flex-shrink-0" />
              <span>{user.num_telefono}</span>
            </div>
          )}
          {user.genero && (
            <div className="flex items-center gap-2 text-sm">
              <MdWc className="text-base-content/40 flex-shrink-0" />
              <span className="capitalize">{user.genero}</span>
            </div>
          )}
          {user.pais && (
            <div className="flex items-center gap-2 text-sm">
              <MdPublic className="text-base-content/40 flex-shrink-0" />
              <span>{user.pais}</span>
            </div>
          )}
        </div>

        {/* Contexto de congreso */}
        {congreso && (
          <p className="text-xs text-base-content/50 mb-3 font-semibold uppercase tracking-wider">
            Roles en: {congreso.nombre_congreso}
          </p>
        )}

        {/* Toggles de roles */}
        <div className="space-y-3 mb-6">
          {ROLES.map(({ key, label }) => {
            const active = user.roles[key];
            const isPending = pendingAction?.rol === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isPending ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'
                }`}
              >
                <span className="font-medium text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleToggle(key, active)}
                  className="toggle toggle-primary"
                  disabled={!!pendingAction && !isPending}
                />
              </div>
            );
          })}
        </div>

        {/* Panel de confirmación */}
        {pendingAction && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 mb-4">
            {isAdmin ? (
              <>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MdLock className="text-warning" />
                  {pendingAction.action === 'assign'
                    ? 'Ingresa tu contraseña para otorgar el rol de Administrador'
                    : 'Ingresa tu contraseña para quitar el rol de Administrador'}
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="Tu contraseña"
                  className="input input-bordered input-sm w-full mb-3"
                  autoFocus
                />
              </>
            ) : (
              <p className="text-sm font-semibold mb-3">
                ¿Confirmar{' '}
                <span className="text-primary">
                  {pendingAction.action === 'assign' ? 'asignar' : 'quitar'}
                </span>{' '}
                rol de{' '}
                <span className="text-primary">
                  {ROLES.find(r => r.key === pendingAction.rol)?.label}
                </span>?
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={handleCancel} className="btn btn-ghost btn-sm" disabled={loading}>
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-primary btn-sm"
                disabled={loading || (isAdmin && !password)}
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : confirmLabel}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} py-2 text-sm`}>
            {feedback.msg}
          </div>
        )}

      </div>
      <div className="modal-backdrop" onClick={!loading ? onClose : undefined} />
    </dialog>
  );
}
```

---

## Task 8: Crear ProcesosRolesView

**Files:**
- Create: `frontend/src/views/admin/ProcesosRolesView.jsx`

- [ ] **Step 1: Crear el archivo con el siguiente contenido**

```jsx
import { useState, useEffect, useMemo } from "react";
import { MdSearch, MdManageAccounts, MdPerson } from "react-icons/md";
import { getCongresosApi, getAllUsersApi } from "../../api/adminApi";
import UserRolesModal from "./Componentes/UserRolesModal";

const ROLE_COLORS = {
  dictaminador:  'badge-primary',
  evaluador:     'badge-secondary',
  administrador: 'badge-accent',
};

const ROLE_LABELS = {
  dictaminador:  'Dictaminador',
  evaluador:     'Evaluador',
  administrador: 'Admin',
};

export default function ProcesosRolesView() {
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem('congress_access');

  useEffect(() => {
    getCongresosApi(token).then(setCongresos).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCongreso) { setUsers([]); return; }
    setLoadingUsers(true);
    setSearchTerm('');
    getAllUsersApi(token, selectedCongreso.id_congreso)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [selectedCongreso]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => u.nombre_completo.toLowerCase().includes(term));
  }, [users, searchTerm]);

  const handleRolesUpdated = (idPersona, newRoles) => {
    setUsers(prev => prev.map(u => u.id_persona === idPersona ? { ...u, roles: newRoles } : u));
    setSelectedUser(prev => prev?.id_persona === idPersona ? { ...prev, roles: newRoles } : prev);
  };

  const activeRoles = user =>
    Object.entries(user.roles).filter(([, v]) => v).map(([k]) => k);

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <MdManageAccounts className="text-2xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Gestión de Roles</h2>
          <p className="text-xs text-base-content/50">Asigna roles a usuarios por congreso</p>
        </div>
      </div>

      {/* Selector de congreso */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1 text-base-content/70">Congreso</label>
        <select
          className="select select-bordered w-full max-w-sm"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found || null);
          }}
        >
          <option value="">Selecciona un congreso...</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </div>

      {/* Buscador */}
      {selectedCongreso && !loadingUsers && (
        <div className="relative mb-6 max-w-sm">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input input-bordered pl-10 w-full"
          />
        </div>
      )}

      {/* Sin congreso seleccionado */}
      {!selectedCongreso && (
        <div className="text-center py-20 text-base-content/40">
          <MdManageAccounts className="text-5xl mx-auto mb-3" />
          <p>Selecciona un congreso para gestionar roles</p>
        </div>
      )}

      {/* Loading */}
      {loadingUsers && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Lista de usuarios */}
      {!loadingUsers && selectedCongreso && (
        <>
          <p className="text-xs text-base-content/40 mb-4">{filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredUsers.map(user => {
              const roles = activeRoles(user);
              return (
                <div
                  key={user.id_persona}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-2xl hover:bg-base-300/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      <MdPerson className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user.nombre_completo}</p>
                      <p className="text-xs text-base-content/50 truncate">{user.correo_electronico}</p>
                      {roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {roles.map(r => (
                            <span key={r} className={`badge badge-sm ${ROLE_COLORS[r]}`}>
                              {ROLE_LABELS[r]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="btn btn-ghost btn-sm ml-2 flex-shrink-0"
                  >
                    Gestionar
                  </button>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-base-content/40">
              <MdPerson className="text-4xl mx-auto mb-2" />
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedUser && (
        <UserRolesModal
          user={selectedUser}
          congreso={selectedCongreso}
          onClose={() => setSelectedUser(null)}
          onRolesUpdated={handleRolesUpdated}
        />
      )}
    </div>
  );
}
```

---

## Task 9: Registrar ruta y sub-ítem en App.jsx + SidebarLayout

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/layouts/SidebarLayout.jsx`

- [ ] **Step 1: Agregar el import de `ProcesosRolesView` en `App.jsx`**

Justo después de `import ProcesosExtensosView from "./views/admin/ProcesosExtensosView";`, agregar:

```jsx
import ProcesosRolesView from "./views/admin/ProcesosRolesView";
```

- [ ] **Step 2: Agregar `MdManageAccounts` al grupo de imports de `react-icons/md`**

En el bloque `import { ..., MdLayers } from "react-icons/md";`, agregar `MdManageAccounts` a la lista.

- [ ] **Step 3: Agregar sub-ítem "Roles" al sidebar en `AdminLayoutWrapper`**

Localizar el bloque del sub-menú de Procesos (~línea 181) y reemplazarlo con:

```jsx
    { to: '/admin/procesos', label: 'Procesos', icon: MdAssignment },
    ...(pathname.includes('/admin/procesos') ? [
      { to: '/admin/procesos/resumenes', label: 'Resúmenes', icon: MdDescription, className: 'pl-9 opacity-70' },
      { to: '/admin/procesos/extensos', label: 'Extensos', icon: MdArticle, className: 'pl-9 opacity-70' },
      { to: '/admin/procesos/roles', label: 'Roles', icon: MdManageAccounts, className: 'pl-9 opacity-70' },
    ] : []),
```

- [ ] **Step 4: Agregar la ruta `roles` dentro del bloque `<Route path="procesos">`**

Localizar (~línea 374):

```jsx
            <Route path="procesos">
              <Route index element={<ProcesosView />} />
              <Route path="resumenes" element={<ProcesosResumenesView />} />
              <Route path="extensos" element={<ProcesosExtensosView />} />
            </Route>
```

Reemplazar con:

```jsx
            <Route path="procesos">
              <Route index element={<ProcesosView />} />
              <Route path="resumenes" element={<ProcesosResumenesView />} />
              <Route path="extensos" element={<ProcesosExtensosView />} />
              <Route path="roles" element={<ProcesosRolesView />} />
            </Route>
```

- [ ] **Step 5: Agregar `/admin/procesos/roles` a `menuRoutes` en `SidebarLayout.jsx`**

En `frontend/src/layouts/SidebarLayout.jsx`, en el array `menuRoutes` (~línea 41), agregar:

```javascript
    '/admin/procesos/roles',
```

- [ ] **Step 6: Verificar en navegador — flujo completo**

1. `http://localhost:5173/admin/procesos` → 3 tarjetas visibles (Resúmenes, Extensos, Roles)
2. Click "Roles" → carga vista con selector de congreso; el sidebar muestra sub-ítem "Roles" activo
3. Seleccionar un congreso → aparece lista de usuarios con buscador
4. Escribir en el buscador → la lista se filtra en tiempo real
5. Click "Gestionar" en un usuario → se abre el modal con datos del usuario
6. Click en toggle de Dictaminador (desactivado) → aparece panel "¿Confirmar asignar Dictaminador?"
7. Click "Confirmar" → badge "Dictaminador" aparece en la tarjeta; modal sigue abierto
8. Click en toggle de Administrador (desactivado) → aparece campo de contraseña
9. Ingresar contraseña correcta y click "Asignar" → rol otorgado, badge "Admin" visible
10. Ingresar contraseña incorrecta → mensaje de error en rojo, toggle sin cambio
11. Click en toggle de Dictaminador (activo) → panel "¿Confirmar quitar Dictaminador?"
12. Confirmar → badge desaparece; click fuera del modal → se cierra sin errores

- [ ] **Step 7: Commit final**

```bash
git add frontend/src/
git commit -m "feat: vista /admin/procesos/roles con gestion de roles por congreso"
```

---

## Self-Review

**Cobertura del spec:**
- ✅ Sub-ruta `/admin/procesos/roles` — Task 9
- ✅ Tarjeta "Roles" en ProcesosView — Task 6
- ✅ Sub-ítem "Roles" en sidebar de Procesos — Task 9
- ✅ Sin botón "Volver" en `/admin/procesos/roles` (agregado a `menuRoutes`) — Task 9
- ✅ Modelos `DictaminadorCongreso` y `EvaluadorCongreso` managed — Task 1
- ✅ `GET /api/users/all/?id_congreso=` — Tasks 2, 4
- ✅ `POST /api/users/{id}/role/assign/` — Tasks 3, 4
- ✅ `POST /api/users/{id}/role/remove/` — Tasks 3, 4
- ✅ Selector de congreso en la vista — Task 8
- ✅ Lista de todos los usuarios del sistema — Task 8
- ✅ Búsqueda por nombre en frontend — Task 8
- ✅ Modal con datos completos del usuario — Task 7
- ✅ Toggles de roles reflejando estado actual — Task 7
- ✅ Confirmación simple para dictaminador/evaluador — Task 7
- ✅ Contraseña para asignar administrador — Task 7
- ✅ Contraseña para quitar administrador — Task 7
- ✅ Actualización de estado local tras éxito — Tasks 7, 8 (`onRolesUpdated`)
- ✅ Toggle sin cambio ante error — Task 7 (el estado del usuario no cambia si hay error)
- ✅ Tests backend con `--keepdb` — Tasks 2, 3, 4

**Type consistency:**
- `id_congreso` (snake_case en backend) / `idCongreso` (camelCase en frontend) — consistente ✅
- `onRolesUpdated(idPersona, newRoles)` definida en modal e implementada en vista ✅
- `getAllUsersApi`, `assignRoleApi`, `removeRoleApi` — nombres idénticos en `adminApi.js` y en los componentes que los importan ✅
- `user.roles.dictaminador`, `user.roles.evaluador`, `user.roles.administrador` — estructura usada consistentemente en modal y vista ✅
