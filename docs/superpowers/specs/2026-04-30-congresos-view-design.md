# Diseño: Vista /asistente/congresos — Opción B (Banner lateral + info grid)

**Fecha:** 2026-04-30  
**Archivo objetivo:** `frontend/src/views/asistentes/AgendaView.jsx`  
**Stack:** React + DaisyUI 5 + Tailwind CSS  
**Tema:** `congressTheme` — primary `#001219`, secondary `#94d2bd`, accent `#e9d8a6`

---

## Objetivo

Mejorar el diseño de ambas pantallas de la vista `/asistente/congresos` con tono institucional/profesional, jerarquía tipográfica clara (nombre e institución primero) y datos de fecha/lugar fáciles de leer.

---

## Pantalla 1 — Listado de congresos

### Header de página
- Título `"Congresos disponibles"` — `text-2xl font-bold`
- Contador muted a la derecha: `"X inscritos · Y disponibles"` — `text-sm text-base-content/50`

### CongresoCard
- **Franja izquierda** `w-1 bg-primary rounded-l-xl` — presente en todas las tarjetas
- **Fondo:** `bg-base-100` por defecto; `bg-primary/5` para congresos inscritos
- **Hover:** `border-primary/50 shadow-md` con `transition-all duration-200`
- **Badge "Inscrito":** posición top-right, estilo `bg-primary text-primary-content` (no outline)

**Layout interno:**
```
[franja] Nombre del Congreso            [badge Inscrito?]
         Institución (opacity 60%)
         ─────────────────────────────────────────
         📅 fecha inicio — fecha fin   📍 Ciudad, Estado
         ─────────────────────────────────────────
         [Inscribirme — ghost full-w]  [Ver eventos → primary full-w]
```

- Nombre: `text-lg font-bold leading-snug`
- Institución: `text-sm text-base-content/60`
- Separador: `divider my-2`
- Chips de datos: `flex gap-4 text-sm text-base-content/70` con iconos `MdCalendarMonth` y `MdLocationOn`
- Botones: cada uno `w-full btn-sm`; "Inscribirme" = `btn-ghost`, "Ver eventos" = `btn-primary`

---

## Pantalla 2 — Eventos de un congreso

### Banner de congreso
Fondo `bg-primary text-primary-content p-6 rounded-xl mb-6`  
Contiene:
- Botón `← Congresos` (link blanco, `btn-ghost btn-sm text-primary-content`)
- Nombre del congreso: `text-xl font-bold`
- Institución + rango de fechas: `text-sm opacity-70`

### Filtro de tipo
Pills debajo del banner:  
- "Todos" → `btn-primary` cuando activo  
- "Ponencias" → `btn-primary` cuando activo  
- "Talleres" → `btn-secondary` cuando activo  
- Inactivos: `btn-ghost`

### EventoCard
- **Franja izquierda 3px:** `bg-primary` para ponencias, `bg-secondary` para talleres
- **Badge tipo:** esquina superior derecha — `badge-primary` para ponencias, `badge-secondary` para talleres

**Layout interno:**
```
[franja] Título del evento              [badge Ponencia/Taller]
         📅 fecha · hora    🎫 X/Y cupos
         Sinopsis en máximo 2 líneas (line-clamp-2)
         ─────────────────────────────────────────
         [Ver detalles — ghost xs]      [Registrarme → primary xs]
                                    ✓ Registrado (success bg)
```

**Estados de cupos:**
- Normal: `text-base-content/60`
- ≤ 20% disponibles: `text-warning font-semibold`
- Lleno: `text-error font-semibold` + texto "Sin cupos"

**Estado "Registrado":**
- Fondo `bg-success/10` en la zona de acciones
- Texto `text-success font-semibold` con ícono `MdCheckCircle`

---

## Componentes a modificar

| Componente | Cambios |
|---|---|
| `AgendaView` (página) | Header con contador inscrito/disponible |
| `CongresoCard` | Franja, fondo diferenciado, badge, layout divider, botones full-width |
| `CongresoList` | Pasar contador de inscritos al header |
| `EventosCongreso` | Banner con info del congreso, filtro con colores por tipo |
| `EventoCard` | Franja de color por tipo, badge tipo, estado cupos con color, zona registrado con bg |

---

## Fuera de alcance
- No se cambia lógica de negocio ni llamadas a la API
- No se modifica el modal de detalles (`EventoDetalleModal`)
- No se tocan otras vistas (`CatalogoView`, admin, etc.)
