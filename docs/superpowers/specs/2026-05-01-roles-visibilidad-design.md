# Diseño: Subsistema A — Visibilidad de Vistas por Rol de Congreso

## Resumen

Cuando un usuario tiene el rol de dictaminador o evaluador en **cualquier** congreso (tablas `DictaminadorCongreso`/`EvaluadorCongreso`), debe ver en el sidebar las vistas `/dictaminador/dictamenes` y/o `/revisor/revisiones`. Actualmente el JWT solo revisa las tablas globales `dictaminador`/`evaluador`, ignorando los roles por congreso. La corrección es mínima: agregar dos flags booleanos al token y al endpoint `/me`.

---

## Arquitectura

### Backend

**`users/views.py` — `get_tokens_for_user`**

Agregar al payload del JWT:
- `es_dictaminador`: `True` si existe fila en `dictaminador` (global) **o** en `DictaminadorCongreso` para ese usuario
- `es_evaluador`: `True` si existe fila en `evaluador` (global) **o** en `EvaluadorCongreso` para ese usuario

Estas flags son **aditivas** — un ponente que también es dictaminador tendrá `rol = 'ponente'` y `es_dictaminador = True`. El campo `rol` mantiene la lógica actual para las vistas principales; las nuevas flags habilitan vistas adicionales.

```python
from .models import DictaminadorCongreso, EvaluadorCongreso
from congresos.models import Dictaminador, Evaluador  # tablas globales

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    # ... lógica rol existente ...
    refresh['es_dictaminador'] = (
        Dictaminador.objects.filter(id_persona=user).exists() or
        DictaminadorCongreso.objects.filter(id_persona=user).exists()
    )
    refresh['es_evaluador'] = (
        Evaluador.objects.filter(id_persona=user).exists() or
        EvaluadorCongreso.objects.filter(id_persona=user).exists()
    )
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}
```

**`users/views.py` — `UserMeView`**

Agregar al response los mismos campos calculados en tiempo real (no depender solo del JWT en caché):

```python
# Dentro del serializer o response de /me
{
  ...,
  "es_dictaminador": Dictaminador.objects.filter(id_persona=user).exists() or DictaminadorCongreso.objects.filter(id_persona=user).exists(),
  "es_evaluador": Evaluador.objects.filter(id_persona=user).exists() or EvaluadorCongreso.objects.filter(id_persona=user).exists(),
}
```

### Frontend

**`src/context/AuthContext.jsx` (o donde se decodifica el token)**

Al decodificar el JWT access token, extraer `es_dictaminador` y `es_evaluador` y guardarlos en el contexto de usuario.

**`src/App.jsx`**

Cambiar las condiciones de visibilidad del sidebar/rutas:
- Antes: `user.rol === 'dictaminador'`
- Después: `user.rol === 'dictaminador' || user.es_dictaminador`
- Antes: `user.rol === 'revisor'`
- Después: `user.rol === 'revisor' || user.es_evaluador`

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/users/views.py` | Agregar flags `es_dictaminador`/`es_evaluador` en `get_tokens_for_user` y `UserMeView` |
| `frontend/src/context/AuthContext.jsx` | Extraer y guardar las nuevas flags del token |
| `frontend/src/App.jsx` | Condiciones de ruta/sidebar actualizadas |

---

## Seguridad

- Las vistas de dictaminador/evaluador siguen protegidas por sus propias guards — solo se muestra el link en sidebar
- Los flags se calculan en tiempo real en `/me` para evitar desfase con JWT en caché

---

## Lo que NO incluye

- Re-login forzado tras asignar rol (el usuario verá el cambio en próximo login o refresh de token)
- Filtrar ponencias por congreso específico dentro de las vistas de dictaminador/evaluador (eso es subsistema D)
