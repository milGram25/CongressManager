import { useState, useMemo } from "react";
import { MdFilterAlt, MdKeyboardArrowDown, MdSearch, MdClose } from "react-icons/md";
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
export const listaPagos = [
  {
    orden: 1001,
    nombre: "Ernesto",
    primerApellido: "Villanueva",
    segundoApellido: "Ruiz",
    telefono: "333 111 2222",
    curp: "VIRE900101HJCLNR01",
    correo: "ernesto.v@gmail.com",
    rol: "Ponente",
    fecha: "2026-03-28T12:54:00",
    estatus: "Pagado",
    congreso: "CIENU 2026",
    sede: "CUALTOS",
    cuentaDeposito: "123456789",
    descuento: 0,
    monto: 100.00,
  },
  {
    orden: 1002,
    nombre: "Jimenita",
    primerApellido: "López",
    segundoApellido: "Soto",
    telefono: "333 222 3333",
    curp: "LOSJ950215MJCLPN02",
    correo: "jimenita.l@gmail.com",
    rol: "Comité académico",
    fecha: "2026-03-28T12:54:00",
    estatus: "Pagado",
    congreso: "CIENU 2026",
    sede: "CUALTOS",
    cuentaDeposito: "987654321",
    descuento: 10,
    monto: 90.00,
  },
  {
    orden: 1003,
    nombre: "Kaleb",
    primerApellido: "Martínez",
    segundoApellido: "García",
    telefono: "333 444 5555",
    curp: "MAGK010310HJCLRT03",
    correo: "kaleb.mg@outlook.com",
    rol: "Asistente",
    fecha: "2026-03-28T12:54:00",
    estatus: "Pendiente",
    congreso: "CIENU 2026",
    sede: "CUALTOS",
    cuentaDeposito: "111222333",
    descuento: 0,
    monto: 80.00,
  },
  {
    orden: 1004,
    nombre: "Gabriel",
    primerApellido: "Sánchez",
    segundoApellido: "Torres",
    telefono: "333 555 6666",
    curp: "SATG980720HJCLNB04",
    correo: "gabriel.st@hotmail.com",
    rol: "Comité académico",
    fecha: "2026-03-28T12:54:00",
    estatus: "Pendiente",
    congreso: "CIENU 2026",
    sede: "CUALTOS",
    cuentaDeposito: "444555666",
    descuento: 5,
    monto: 95.00,
  },
  {
    orden: 1005,
    nombre: "Lalo",
    primerApellido: "Díaz",
    segundoApellido: "Mendoza",
    telefono: "333 777 8888",
    curp: "DIML020505HJCLZL05",
    correo: "lalo.dm@gmail.com",
    rol: "Comité académico",
    fecha: "2026-03-28T12:54:00",
    estatus: "Pagado",
    congreso: "CIENU 2026",
    sede: "CUALTOS",
    cuentaDeposito: "777888999",
    descuento: 15,
    monto: 85.00,
  },
];
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(iso) {
  const d = new Date(iso);
  const dia  = String(d.getDate()).padStart(2, "0");
  const mes  = d.toLocaleString("es-MX", { month: "long" });
  const año  = d.getFullYear();
  const hora = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return `${dia}/${mes}/${año}, ${hora}`;
}
 
const ROLES    = ["Todos", "Ponente", "Asistente", "Comité académico"];
const FECHAS   = ["Recientes", "Más antiguos"];
const ESTATUS  = ["Todos", "Pagado", "Pendiente"];
 
// ─── Campo de detalle ─────────────────────────────────────────────────────────
function Campo({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-base-content/50 w-36 flex-shrink-0">{label}</span>
      <span className="flex-1 border border-base-300 rounded-full px-3 py-1 text-sm text-base-content bg-base-100 truncate">
        {value}
      </span>
    </div>
  );
}
 
// ─── Panel de detalle ─────────────────────────────────────────────────────────
function DetallePanel({ pago }) {
  if (!pago) return null;
  return (
    <div className="mt-4 border-t border-base-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-base-content">Detalles de pago</h3>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] transition-colors" title="Copiar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] transition-colors" title="Descargar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
 
      {/* Evento */}
      <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Pago de evento</p>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-base-content/50 w-16 flex-shrink-0">Evento</span>
        <span className="flex-1 border border-base-300 rounded-full px-3 py-1 text-sm text-base-content bg-base-100">{pago.congreso}</span>
      </div>
 
      {/* Dos columnas */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {/* Columna persona */}
        <div className="space-y-2">
          <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Persona</p>
          <Campo label="Nombre"            value={pago.nombre} />
          <Campo label="Primer apellido"   value={pago.primerApellido} />
          <Campo label="Segundo apellido"  value={pago.segundoApellido} />
          <Campo label="Núm. teléfono"     value={pago.telefono} />
          <Campo label="CURP"              value={pago.curp} />
          <Campo label="Correo electrónico" value={pago.correo} />
          <Campo label="Rol"               value={pago.rol} />
        </div>
 
        {/* Columna otros detalles */}
        <div className="space-y-2">
          <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Otros detalles</p>
          <Campo label="Sede destinatario" value={pago.sede} />
          <Campo label="Cuenta depósito"   value={`${pago.cuentaDeposito.slice(0, 9)}...`} />
          <Campo label="Fecha y hora pago" value={formatFecha(pago.fecha)} />
          <Campo label="Descuento"         value={`${pago.descuento} %`} />
          <Campo label="Monto"             value={`$${pago.monto.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}
 
// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PagosComponente({ listaPagos: propsPagos }) {
  const pagos = propsPagos ?? listaPagos;
 
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filtroRol,   setFiltroRol]   = useState("Todos");
  const [filtroFecha, setFiltroFecha] = useState("Recientes");
  const [filtroEst,   setFiltroEst]   = useState("Todos");
 
  const [openRol,  setOpenRol]  = useState(false);
  const [openFech, setOpenFech] = useState(false);
  const [openEst,  setOpenEst]  = useState(false);
 
  const filtrados = useMemo(() => {
    let list = [...pagos];
    if (search.trim()) list = list.filter(p => String(p.orden).includes(search) || p.nombre.toLowerCase().includes(search.toLowerCase()));
    if (filtroRol  !== "Todos")    list = list.filter(p => p.rol === filtroRol);
    if (filtroEst  !== "Todos")    list = list.filter(p => p.estatus === filtroEst);
    list.sort((a, b) => filtroFecha === "Recientes" ? b.orden - a.orden : a.orden - b.orden);
    return list;
  }, [pagos, search, filtroRol, filtroFecha, filtroEst]);
 
  function Dropdown({ label, value, options, open, onToggle, onSelect }) {
    return (
      <div className="relative">
        <button onClick={onToggle} className="flex items-center gap-1 text-sm text-base-content/70 hover:text-[#00868a] transition-colors">
          {value} <MdKeyboardArrowDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-7 z-50 w-44 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
            {options.map(o => (
              <button key={o} onClick={() => { onSelect(o); onToggle(); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 transition-colors ${value === o ? "text-[#00868a] font-semibold bg-[#e8f5f5]" : "text-base-content/70"}`}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
 
  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm p-5">
 
      {/* Filtros header */}
      <div className="grid grid-cols-4 gap-4 mb-2">
        <div>
          <p className="text-sm font-bold text-base-content mb-1">Orden de pago</p>
          <div className="relative">
            <MdSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1 text-sm border-b border-base-300 bg-transparent focus:outline-none focus:border-[#00868a] transition-colors"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-1 top-1/2 -translate-y-1/2 text-base-content/30"><MdClose size={12} /></button>}
          </div>
        </div>
 
        <div>
          <p className="text-sm font-bold text-base-content mb-1">Rol</p>
          <Dropdown label="Rol" value={filtroRol} options={ROLES} open={openRol}
            onToggle={() => { setOpenRol(o => !o); setOpenFech(false); setOpenEst(false); }}
            onSelect={setFiltroRol} />
        </div>
 
        <div>
          <p className="text-sm font-bold text-base-content mb-1">Fecha</p>
          <Dropdown label="Fecha" value={filtroFecha} options={FECHAS} open={openFech}
            onToggle={() => { setOpenFech(o => !o); setOpenRol(false); setOpenEst(false); }}
            onSelect={setFiltroFecha} />
        </div>
 
        <div>
          <p className="text-sm font-bold text-base-content mb-1">Estatus</p>
          <div className="relative">
            <select
              value={filtroEst}
              onChange={e => setFiltroEst(e.target.value)}
              className="w-full border border-base-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#00868a] bg-base-100 appearance-none"
            >
              {ESTATUS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
 
      <div className="border-t border-base-200 my-3" />
 
      {/* Lista */}
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 300 }}>
        {filtrados.length === 0 ? (
          <p className="text-center py-8 text-sm text-base-content/40 italic">Sin resultados</p>
        ) : filtrados.map(p => (
          <button
            key={p.orden}
            onClick={() => setSelected(s => s?.orden === p.orden ? null : p)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left
              ${selected?.orden === p.orden
                ? "border-[#00868a] bg-[#e8f5f5]"
                : "border-base-300 hover:border-[#00868a]/40 hover:bg-base-200/40"}`}
          >
            
            {/* Orden */}
            <span className="text-sm font-bold text-base-content flex-1">#{p.orden}</span>
            {/* Rol */}
            <span className="text-sm text-base-content/70 flex-1">{p.rol}</span>
            {/* Fecha */}
            <span className="text-sm text-base-content/60 flex-1">{formatFecha(p.fecha)}</span>
            {/* Estatus */}
            <div className="flex flex-1 items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.estatus === "Pagado" ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${p.estatus === "Pagado" ? "text-green-600" : "text-red-500"}`}>{p.estatus}</span>
            </div>
          </button>
        ))}
      </div>
 
      {/* Panel detalle */}
      <DetallePanel pago={selected} />
    </div>
  );
}