import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack, MdDownload, MdFilterAlt, MdVisibility,
  MdPerson, MdPanTool, MdCheck, MdKeyboardArrowDown,
  MdSearch, MdClose, MdCalendarToday
} from "react-icons/md";

const MOCK_DICTAMINADORES = [
{
    id: 1,
    nombre: "Ana García",
    grado: "Dr. en Ciencias Computacionales",
    institucion: "UNAM",
    especialidad: "Inteligencia Artificial",
    perfil: "Investigadora con 15 años de experiencia en ML y redes neuronales.",
    email: "ana.garcia@unam.mx",
  },
  {
    id: 2,
    nombre: "Luis Martínez",
    grado: "M.C. en Ingeniería de Software",
    institucion: "IPN",
    especialidad: "Desarrollo de Software",
    perfil: "Docente e investigador enfocado en arquitecturas de software escalables.",
    email: "luis.martinez@ipn.mx",
  },
  {
    id: 3,
    nombre: "María Sánchez",
    grado: "Dra. en Bioinformática",
    institucion: "CINVESTAV",
    especialidad: "Biología Computacional",
    perfil: "Especialista en análisis genómico y modelado computacional de proteínas.",
    email: "m.sanchez@cinvestav.mx",
  },
  {
    id: 4,
    nombre: "Carlos López",
    grado: "ING en computacion",
    institucion: "Cualtos",
    especialidad: "RedesComputacionales",
    perfil: "Especialista en dispositivos Cisco",
    email: "carli_loi9@gmail.com",
  },
  {
  id: 5,
  nombre: "Pedro Ruiz",
  grado: "M.C. en Sistemas Computacionales",
  institucion: "ITESM",
  especialidad: "Ciberseguridad y Redes",
  perfil: "Consultor en seguridad informática con experiencia en protección de infraestructuras críticas.",
  email: "pedro.ruiz@itesm.mx",
  },
  {
  id: 6,
  nombre: "Elena Torres",
  grado: "Dra. en Matemáticas Aplicadas",
  institucion: "BUAP",
  especialidad: "Modelado Estadístico",
  perfil: "Investigadora en análisis de datos masivos y modelos predictivos aplicados a salud pública.",
  email: "e.torres@buap.mx",
  },
  {
  id: 7,
  nombre: "Roberto Díaz",
  grado: "Dr. en Ingeniería Eléctrica",
  institucion: "UAM Iztapalapa",
  especialidad: "Robótica e Automatización",
  perfil: "Especialista en diseño de sistemas embebidos y robótica industrial con enfoque en manufactura.",
  email: "r.diaz@uam.mx",
  },
];

const MOCK_RESUMENES = [
  {
    id: 1, title: "Internet de las cosas",
    asignado: true,  revisado: false, aceptado: false,
    revisores: [1,2],
    fechaLimite: "2026-04-15",
  },
  {
    id: 2, title: "Programación e inteligencia artificial",
    asignado: true,  revisado: false, aceptado: false,
    revisores: [4],
    fechaLimite: "2026-04-20",
  },
  {
    id: 3, title: "Biología y computadoras",
    asignado: true,  revisado: true,  aceptado: false,
    revisores: [3,5],
    fechaLimite: "2026-04-10",
  },
  {
    id: 4, title: "Análisis genéticos",
    asignado: false, revisado: false, aceptado: false,
    revisores: [],
    fechaLimite: "2026-05-01",
  },
  {
    id: 5, title: "Enfoque estructural de POO",
    asignado: true,  revisado: true,  aceptado: true,
    revisores: [6],
    fechaLimite: null,
  },
  {
    id: 6, title: "Las villas de California",
    asignado: true,  revisado: false, aceptado: false,
    revisores: [7],
    fechaLimite: "2026-04-28",
  },
];

const FILTER_OPTIONS = [
  { value: "todos",        label: "Todos" },
  { value: "pendientes",   label: "Pendientes" },
  { value: "asignados",    label: "Asignados" },
  { value: "no_asignados", label: "Sin asignar" },
  { value: "revisados",    label: "Revisados" },
  { value: "aceptados",    label: "Aceptados" },
];

function exportToCSV(items) {
  const header = ["ID", "Título", "Asignado", "Revisado", "Aceptado", "Revisores", "Fecha Límite"];
  const rows = items.map(i => [
    i.id, `"${i.title}"`,
    i.asignado ? "Sí" : "No", i.revisado ? "Sí" : "No", i.aceptado ? "Sí" : "No",
    `"${i.revisores.join(", ")}"`, i.fechaLimite ?? "—",
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "resumenes.csv"; a.click();
  URL.revokeObjectURL(url);
}

function formatDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function Popover({ children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute z-50 top-10 left-1/2 -translate-x-1/2 w-52 bg-base-100 border border-base-300 rounded-2xl shadow-xl p-3">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-base-100 border-l border-t border-base-300" />
      {children}
    </div>
  );
}

function StatusDot({ active }) {
  return <span className={`w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 ${active ? "bg-green-500" : "bg-red-500"}`} />;
}

function IconBtn({ active, title, popoverContent, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        title={title}
        onClick={() => setOpen(o => !o)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0
          ${active ? "bg-[#00868a] text-white hover:bg-[#006f73]" : "bg-base-300 text-base-content/40 hover:bg-base-400"}`}
      >
        {children}
      </button>
      {open && <Popover onClose={() => setOpen(false)}>{popoverContent}</Popover>}
    </div>
  );
}

function PopoverAsignado({ item, dictaminadores }) {
  const asignados = dictaminadores.filter(d => item.revisores.includes(d.id));
  return (
    <div>
      <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wide mb-2">Revisores asignados</p>
      {asignados.length === 0 ? (
        <p className="text-xs text-base-content/40 italic">Sin asignar todavía</p>
      ) : (
        <ul className="space-y-2">
          {asignados.map((d) => (
            <li key={d.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00868a] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {d.nombre.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-base-content font-semibold">{d.nombre}</p>
                <p className="text-[10px] text-base-content/50">{d.grado}</p>
                <p className="text-[10px] text-base-content/40">{d.institucion} · {d.especialidad}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PopoverRevisado({ item }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wide mb-2">Estado de revisión</p>
      {item.revisado ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><MdCheck size={13} className="text-green-600" /></div>
          <span className="text-xs text-green-700 font-semibold">Revisión completada</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><MdPanTool size={12} className="text-amber-600" /></div>
            <span className="text-xs text-amber-700 font-semibold">Pendiente de revisión</span>
          </div>
          {item.fechaLimite && (
            <div className="flex items-center gap-1.5 mt-2 bg-red-50 rounded-xl px-2 py-1.5">
              <MdCalendarToday size={12} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-red-400 font-medium">Fecha límite</p>
                <p className="text-xs text-red-600 font-bold">{formatDate(item.fechaLimite)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PopoverAceptado({ item }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wide mb-2">Estado de aceptación</p>
      {item.aceptado ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><MdCheck size={13} className="text-green-600" /></div>
          <span className="text-xs text-green-700 font-semibold">Aceptado</span>
        </div>
      ) : item.revisado ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><MdPanTool size={12} className="text-amber-600" /></div>
          <span className="text-xs text-amber-700 font-semibold">En espera de aceptación</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center"><MdClose size={12} className="text-base-content/40" /></div>
          <span className="text-xs text-base-content/50">Aún no revisado</span>
        </div>
      )}
    </div>
  );
}

function ResumenRow({ item, selected, onSelect, onView }) {
  return (
    <div className={`flex items-center gap-3 py-3 px-1 border-b border-base-200 last:border-0 transition-colors rounded-xl ${selected ? "bg-[#e8f5f5]" : "hover:bg-base-200/40"}`}>
      <input type="checkbox" checked={selected} onChange={() => onSelect(item.id)} className="checkbox checkbox-sm border-base-300" style={{ accentColor: "#00868a" }} />
      <button onClick={() => onView(item)} className="w-9 h-9 rounded-full bg-[#00868a] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#006f73] transition-colors" title="Ver resumen">
        <MdVisibility size={17} />
      </button>
      <span className="flex-1 text-sm font-medium text-base-content truncate">{item.title}</span>
      <div className="flex items-center gap-1.5 bg-base-200 rounded-full px-3 py-1.5 flex-shrink-0">
        <StatusDot active={item.asignado} />
        <IconBtn active={item.asignado} title="Ver revisores asignados" popoverContent={<PopoverAsignado item={item} dictaminadores={MOCK_DICTAMINADORES} />}>
        <MdPerson size={14} />
        </IconBtn>
        <StatusDot active={item.revisado} />
        <IconBtn active={item.revisado} title="Ver revisión" popoverContent={<PopoverRevisado item={item} />}><MdPanTool size={14} /></IconBtn>
        <StatusDot active={item.aceptado} />
        <IconBtn active={item.aceptado} title="Ver aceptación" popoverContent={<PopoverAceptado item={item} />}><MdCheck size={15} /></IconBtn>
      </div>
    </div>
  );
}

export default function ProcesosResumenesView() {
  const navigate = useNavigate();
  const [items] = useState(MOCK_RESUMENES);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("pendientes");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) list = list.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    switch (filter) {
      case "asignados":    return list.filter(i => i.asignado);
      case "no_asignados": return list.filter(i => !i.asignado);
      case "revisados":    return list.filter(i => i.revisado);
      case "aceptados":    return list.filter(i => i.aceptado);
      case "pendientes":   return list.filter(i => !i.aceptado);
      default:             return list;
    }
  }, [items, filter, search]);

  function toggleSelect(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleAll() {
    const ids = filtered.map(i => i.id);
    const allSel = ids.every(id => selected.includes(id));
    setSelected(allSel ? selected.filter(id => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }
  const allSelected = filtered.length > 0 && filtered.every(i => selected.includes(i.id));
  const filterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label ?? "Filtrar";

  return (
    <div className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm" style={{ width: 560 }}>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-[#00868a] transition-colors">
        <MdArrowBack size={18} /><span className="font-medium">Regresar</span>
      </button>

      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-2xl font-extrabold text-base-content tracking-tight">RESÚMENES</h2>
          <p className="text-xs text-base-content/50 mt-0.5 leading-tight">
            Aquí puede encontrar todos los resúmenes.<br />
            Para filtrarlos, escoja una opción del filtro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filtered)} title="Descargar CSV" className="w-9 h-9 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] transition-colors">
            <MdDownload size={18} />
          </button>
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)} className="flex items-center gap-1.5 border border-base-300 rounded-full px-3 py-1.5 text-sm font-medium bg-base-100 hover:border-[#00868a] transition-colors">
              <MdFilterAlt size={15} className="text-[#00868a]" />
              <span>{filterLabel}</span>
              <MdKeyboardArrowDown size={16} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-10 z-50 w-44 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                {FILTER_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setFilter(opt.value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-base-200 ${filter === opt.value ? "text-[#00868a] font-semibold bg-[#e8f5f5]" : "text-base-content/70"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-3 mb-2">
        <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-sm rounded-full border border-base-300 bg-base-200/50 focus:outline-none focus:border-[#00868a] transition-colors" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60"><MdClose size={14} /></button>}
      </div>

      <div className="flex items-center justify-between px-1 py-1.5 mb-1">
        <label className="flex items-center gap-2 text-xs text-base-content/50 cursor-pointer select-none">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="checkbox checkbox-xs" style={{ accentColor: "#00868a" }} />
          Seleccionar todos
        </label>
        <span className="text-xs text-base-content/40">
          {selected.length > 0 ? `${selected.length} seleccionado(s)` : `${filtered.length} resultado(s)`}
        </span>
      </div>

      <div className="border-t border-base-200 mb-1" />

      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-base-content/40 italic">No se encontraron resúmenes con ese filtro.</div>
        ) : (
          filtered.map(item => (
            <ResumenRow key={item.id} item={item} selected={selected.includes(item.id)} onSelect={toggleSelect} onView={setViewItem} />
          ))
        )}
      </div>

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewItem(null)}>
          <div className="bg-base-100 rounded-3xl shadow-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base-content">{viewItem.title}</h3>
              <button onClick={() => setViewItem(null)} className="text-base-content/30 hover:text-base-content/60 text-xl leading-none">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-base-content/60">Asignado</span><span className={`font-semibold ${viewItem.asignado ? "text-green-600" : "text-red-500"}`}>{viewItem.asignado ? "Sí" : "No"}</span></div>
              <div className="flex justify-between"><span className="text-base-content/60">Revisado</span><span className={`font-semibold ${viewItem.revisado ? "text-green-600" : "text-red-500"}`}>{viewItem.revisado ? "Sí" : "No"}</span></div>
              <div className="flex justify-between"><span className="text-base-content/60">Aceptado</span><span className={`font-semibold ${viewItem.aceptado ? "text-green-600" : "text-red-500"}`}>{viewItem.aceptado ? "Sí" : "No"}</span></div>
              {viewItem.fechaLimite && <div className="flex justify-between"><span className="text-base-content/60">Fecha límite</span><span className="font-semibold text-amber-600">{formatDate(viewItem.fechaLimite)}</span></div>}
              {viewItem.revisores.length > 0 && <div><p className="text-base-content/60 mb-1">Revisores</p>{viewItem.revisores.map((r,i) => <p key={i} className="text-xs font-medium text-base-content">• {r}</p>)}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}