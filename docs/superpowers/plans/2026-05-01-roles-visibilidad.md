# Roles Visibilidad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar flags `es_dictaminador` y `es_evaluador` al JWT y a `/me` para que usuarios con rol por congreso vean las vistas correspondientes en el sidebar.

**Architecture:** Modificar `get_tokens_for_user` para incluir las nuevas flags revisando tanto tablas globales como `DictaminadorCongreso`/`EvaluadorCongreso`. Actualizar `UserSerializer` para incluir las flags. Actualizar `AuthContext` y `App.jsx` en frontend.

**Tech Stack:** Django REST Framework, simplejwt, React

---

### Task 1: Agregar flags al JWT y UserSerializer

**Files:**
- Modify: `backend/users/views.py` (función `get_tokens_for_user`, líneas ~303-323)
- Modify: `backend/users/serializers.py` (clase `UserSerializer`, líneas ~136-165)

- [ ] **Step 1: Escribir test para las nuevas flags**

Agregar en `backend/users/tests.py` al final del archivo:

```python
class TokenFlagsTests(TestCase):
    databases = ['default']

    def setUp(self):
        self.client = APIClient()
        self.user = _create_persona('flagtest@test.com', nombre='Flag', apellido='Test')
        self.congreso_id = _create_congreso('Congreso Flag Test')

    def test_no_flags_by_default(self):
        res = self.client.post('/api/users/login/', {
            'correo_electronico': 'flagtest@test.com',
            'contrasena': 'TestPass1234!'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.data['user']['es_dictaminador'])
        self.assertFalse(res.data['user']['es_evaluador'])

    def test_es_dictaminador_after_assign(self):
        DictaminadorCongreso.objects.create(id_persona=self.user, id_congreso_id=self.congreso_id)
        res = self.client.post('/api/users/login/', {
            'correo_electronico': 'flagtest@test.com',
            'contrasena': 'TestPass1234!'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['user']['es_dictaminador'])
        self.assertFalse(res.data['user']['es_evaluador'])

    def test_es_evaluador_after_assign(self):
        EvaluadorCongreso.objects.create(id_persona=self.user, id_congreso_id=self.congreso_id)
        res = self.client.post('/api/users/login/', {
            'correo_electronico': 'flagtest@test.com',
            'contrasena': 'TestPass1234!'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.data['user']['es_dictaminador'])
        self.assertTrue(res.data['user']['es_evaluador'])

    def test_me_includes_flags(self):
        DictaminadorCongreso.objects.create(id_persona=self.user, id_congreso_id=self.congreso_id)
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/users/me/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['es_dictaminador'])
        self.assertFalse(res.data['es_evaluador'])
```

- [ ] **Step 2: Correr tests para verificar que fallan**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py test users.tests.TokenFlagsTests -v 2
```

Esperado: FAIL — `es_dictaminador` / `es_evaluador` no existen en response

- [ ] **Step 3: Actualizar `UserSerializer` para incluir las nuevas flags**

En `backend/users/serializers.py`, la clase `UserSerializer` (líneas ~136-165):

```python
class UserSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    es_dictaminador = serializers.SerializerMethodField()
    es_evaluador = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = (
            'id_persona', 'correo_electronico', 'nombre', 'primer_apellido',
            'segundo_apellido', 'rol', 'nombre_completo',
            'es_dictaminador', 'es_evaluador',
        )

    def get_rol(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'administrador'
        try:
            obj.dictaminador; return 'dictaminador'
        except Exception:
            pass
        try:
            obj.evaluador; return 'revisor'
        except Exception:
            pass
        try:
            obj.ponente; return 'ponente'
        except Exception:
            pass
        return 'asistente'

    def get_nombre_completo(self, obj):
        return ' '.join(x for x in [obj.nombre, obj.primer_apellido, obj.segundo_apellido] if x).strip()

    def get_es_dictaminador(self, obj):
        from .models import Dictaminador, DictaminadorCongreso
        return (
            Dictaminador.objects.filter(id_persona=obj).exists() or
            DictaminadorCongreso.objects.filter(id_persona=obj).exists()
        )

    def get_es_evaluador(self, obj):
        from .models import Evaluador, EvaluadorCongreso
        return (
            Evaluador.objects.filter(id_persona=obj).exists() or
            EvaluadorCongreso.objects.filter(id_persona=obj).exists()
        )
```

Nota: `Dictaminador` y `Evaluador` están en `users/models.py` líneas ~45 y ~52.

- [ ] **Step 4: Correr tests para verificar que pasan**

```bash
python manage.py test users.tests.TokenFlagsTests -v 2
```

Esperado: PASS (4 tests)

- [ ] **Step 5: Correr suite completa de users**

```bash
python manage.py test users -v 2
```

Esperado: todos los tests previos siguen pasando

- [ ] **Step 6: Commit**

```bash
git add backend/users/serializers.py backend/users/tests.py
git commit -m "feat(users): agregar flags es_dictaminador/es_evaluador al serializer y tests"
```

---

### Task 2: Actualizar frontend — AuthContext y App.jsx

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Actualizar AuthContext para preservar las nuevas flags**

En `frontend/src/context/AuthContext.jsx`, el objeto `user` ya incluye las flags porque viene de `/me` o del response de login (vía `UserSerializer`). Solo necesitamos asegurarnos de que las flags se propaguen sin que `mapRol` las elimine.

Verificar que `setUser({ ...userData, rol: mapRol(userData.rol) })` preserva `es_dictaminador` y `es_evaluador` — ya lo hace con el spread. No requiere cambio si los datos vienen del backend ya con las flags.

Si el AuthContext usa decodificación de JWT directamente (no lo hace — usa `/me`), habría que agregar extracción de claims. En este proyecto, el `user` viene de `/me` response, así que el spread ya incluye las flags del `UserSerializer`.

**Sin cambio necesario en AuthContext.jsx.**

- [ ] **Step 2: Actualizar App.jsx para usar las flags en visibilidad de rutas**

En `frontend/src/App.jsx`, buscar líneas que condicionan visibilidad de revisores/dictaminadores (líneas ~99-115 y ~133-145):

Cambiar condición de sidebar para ponentes/asistentes que también tengan el rol por congreso:

```jsx
// En la sección del sidebar de ponente (líneas ~99-115):
// ANTES:
...(user?.rol === 'revisor' ? [{ to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview }] : []),
...(user?.rol === 'dictaminador' ? [{ to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel }] : []),

// DESPUÉS:
...(user?.rol === 'revisor' || user?.es_evaluador ? [{ to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview }] : []),
...(user?.rol === 'dictaminador' || user?.es_dictaminador ? [{ to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel }] : []),
```

Aplicar el mismo cambio en todas las ocurrencias similares en App.jsx (hay múltiples bloques de sidebar según el rol). Buscar con `grep -n "rol === 'revisor'\|rol === 'dictaminador'" frontend/src/App.jsx` para identificar todas las líneas a cambiar.

- [ ] **Step 3: Verificar que las rutas protegidas también permiten acceso**

Buscar `ProtectedRoute` en App.jsx y verificar que `allowedRole="revisor"` y `allowedRole="dictaminador"` también acepten las flags. Si `ProtectedRoute` solo checa `user.rol`, agregar la condición:

En el componente `ProtectedRoute` (buscar su definición en App.jsx o en un archivo separado), cambiar la lógica para que si `allowedRole === 'revisor'` también acepte cuando `user.es_evaluador === true`, y si `allowedRole === 'dictaminador'` también acepte `user.es_dictaminador === true`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat(frontend): visibilidad de vistas dictaminador/revisor con flags por congreso"
```

---

### Task 3: Prueba manual de integración

- [ ] **Step 1: Arrancar el servidor**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py runserver
```

- [ ] **Step 2: Verificar que un usuario sin roles no ve las vistas extra**

Login con un usuario sin roles asignados → confirmar que no aparece "Dictaminador" ni "Revisor" en sidebar.

- [ ] **Step 3: Asignar rol dictaminador desde /admin/procesos/roles y relogin**

Asignar el rol dictaminador al usuario desde la vista de roles → hacer logout + login → confirmar que aparece el link al sidebar de dictaminador.

- [ ] **Step 4: Commit final si todo ok**

```bash
git add -p
git commit -m "fix(frontend): ajustes post-prueba visibilidad roles por congreso"
```
