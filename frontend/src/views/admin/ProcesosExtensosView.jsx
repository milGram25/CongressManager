import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdDownload, MdFilterAlt, MdVisibility, MdPerson, MdPanTool, MdCheck, MdKeyboardArrowDown, MdSearch, MdClose } from "react-icons/md";
 
// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_EXTENSOS = [
  { id: 1, title: "Internet de las cosas", asignado: true,  revisado: false, aceptado: false },
  { id: 2, title: "Programación e inteligencia artificial", asignado: true,  revisado: false, aceptado: false },
  { id: 3, title: "Biología y computadoras", asignado: true,  revisado: false, aceptado: false },
  { id: 4, title: "Análisis genéticos", asignado: false, revisado: false, aceptado: false },
  { id: 5, title: "Enfoque estructural de POO", asignado: true,  revisado: false, aceptado: false },
  { id: 6, title: "Las villas de California", asignado: true,  revisado: false, aceptado: false },
];
 
const FILTER_OPTIONS = [
  { value: "todos",        label: "Todos" },
  { value: "pendientes",   label: "Pendientes" },
  { value: "asignados",    label: "Asignados" },
  { value: "no_asignados", label: "Sin asignar" },
  { value: "revisados",    label: "Revisados" },
  { value: "aceptados",    label: "Aceptados" },
];
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
function exportToCSV(items) {
  const header = ["ID", "Título", "Asignado", "Revisado", "Aceptado"];
  const rows = items.map(i => [
    i.id,
    `"${i.title}"`,
    i.asignado  ? "Sí" : "No",
    i.revisado  ? "Sí" : "No",
    i.aceptado  ? "Sí" : "No",
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "extensos.csv";
  a.click();
  URL.revokeObjectURL(url);
}
 
function StatusDot({ active }) {
  return (
    <span className={`w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 ${active ? "bg-green-500" : "bg-red-500"}`} />
  );
}
 
function IconBtn({ active, children, title }) {
  return (
    <button
      title={title}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0
        ${active ? "bg-[#00868a] text-white" : "bg-base-300 text-base-content/40 cursor-default"}`}
    >
      {children}
    </button>
  );
}
 
// ─── Single Row ───────────────────────────────────────────────────────────────
function ExtensoRow({ item, selected, onSelect, onView }) {
  return (
    <div
      className={`flex items-center gap-3 py-3 px-1 border-b border-base-200 last:border-0 transition-colors
        ${selected ? "bg-[#e8f5f5] rounded-xl" : "hover:bg-base-200/40 rounded-xl"}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
        className="checkbox checkbox-sm border-base-300 checked:border-[#00868a]"
        style={{ accentColor: "#00868a" }}
      />
 
      {/* View btn */}
      <button
        onClick={() => onView(item)}
        className="w-9 h-9 rounded-full bg-[#00868a] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#006f73] transition-colors"
        title="Ver extensor"
      >
        <MdVisibility size={17} />
      </button>
 
      {/* Title */}
      <span className="flex-1 text-sm font-medium text-base-content truncate">{item.title}</span>
 
      {/* Status pills */}
      <div className="flex items-center gap-1.5 bg-base-200 rounded-full px-3 py-1.5 flex-shrink-0">
        <StatusDot active={item.asignado} />
        <IconBtn active={item.asignado} title="Asignado a revisor">
          <MdPerson size={14} />
        </IconBtn>
 
        <StatusDot active={item.revisado} />
        <IconBtn active={item.revisado} title="Revisado">
          <MdPanTool size={14} />
        </IconBtn>
 
        <StatusDot active={item.aceptado} />
        <IconBtn active={item.aceptado} title="Aceptado">
          <MdCheck size={15} />
        </IconBtn>
      </div>
    </div>
  );
}
 
// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProcesosExtensosView() {
  const navigate = useNavigate();
 
  const [items, setItems]           = useState(MOCK_EXTENSOS);
  const [selected, setSelected]     = useState([]);
  const [filter, setFilter]         = useState("pendientes");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch]         = useState("");
  const [viewItem, setViewItem]     = useState(null);
 
  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      list = list.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
    switch (filter) {
      case "asignados":    return list.filter(i => i.asignado);
      case "no_asignados": return list.filter(i => !i.asignado);
      case "revisados":    return list.filter(i => i.revisado);
      case "aceptados":    return list.filter(i => i.aceptado);
      case "pendientes":   return list.filter(i => !i.aceptado);
      default:             return list;
    }
  }, [items, filter, search]);
 
  // ── Selection ──────────────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }
  function toggleAll() {
    const ids = filtered.map(i => i.id);
    const allSelected = ids.every(id => selected.includes(id));
    setSelected(allSelected ? selected.filter(id => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }
  const allSelected = filtered.length > 0 && filtered.every(i => selected.includes(i.id));
 
  const filterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label ?? "Filtrar";
 
  return (
    <div className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm" style={{ width: 560 }}>
 
      {/* ── Back ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-[#00868a] transition-colors"
      >
        <MdArrowBack size={18} />
        <span className="font-medium">Regresar</span>
      </button>
 
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-2xl font-extrabold text-base-content tracking-tight">EXTENSOS</h2>
          <p className="text-xs text-base-content/50 mt-0.5 leading-tight">
            Aquí puede encontrar todos los extensos.<br />
            Para filtrarlos, escoja una opción del filtro
          </p>
        </div>
 
        <div className="flex items-center gap-2">
          {/* Download */}
          <button
            onClick={() => exportToCSV(filtered)}
            title="Descargar como CSV/Excel"
            className="w-9 h-9 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] transition-colors flex-shrink-0"
          >
            <MdDownload size={18} />
          </button>
 
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-1.5 border border-base-300 rounded-full px-3 py-1.5 text-sm font-medium bg-base-100 hover:border-[#00868a] transition-colors"
            >
              <MdFilterAlt size={15} className="text-[#00868a]" />
              <span>{filterLabel}</span>
              <MdKeyboardArrowDown size={16} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-10 z-50 w-44 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilter(opt.value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-base-200
                      ${filter === opt.value ? "text-[#00868a] font-semibold bg-[#e8f5f5]" : "text-base-content/70"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="relative mt-3 mb-2">
        <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-sm rounded-full border border-base-300 bg-base-200/50 focus:outline-none focus:border-[#00868a] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60">
            <MdClose size={14} />
          </button>
        )}
      </div>
 
      {/* ── Select all + count ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 py-1.5 mb-1">
        <label className="flex items-center gap-2 text-xs text-base-content/50 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="checkbox checkbox-xs"
            style={{ accentColor: "#00868a" }}
          />
          Seleccionar todos
        </label>
        <span className="text-xs text-base-content/40">
          {selected.length > 0 ? `${selected.length} seleccionado(s)` : `${filtered.length} resultado(s)`}
        </span>
      </div>
 
      <div className="border-t border-base-200 mb-1" />
 
      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-base-content/40 italic">
            No se encontraron extensos con ese filtro.
          </div>
        ) : (
          filtered.map(item => (
            <ExtensoRow
              key={item.id}
              item={item}
              selected={selected.includes(item.id)}
              onSelect={toggleSelect}
              onView={setViewItem}
            />
          ))
        )}
      </div>
 
      {/* ── View Modal ───────────────────────────────────────────────────── */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-base-100 rounded-3xl shadow-2xl p-6 w-80"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base-content text-base">{viewItem.title}</h3>
              <button onClick={() => setViewItem(null)} className="text-base-content/30 hover:text-base-content/60 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Asignado a revisor", val: viewItem.asignado,  icon: <MdPerson size={15} /> },
                { label: "Revisado",            val: viewItem.revisado, icon: <MdPanTool size={15} /> },
                { label: "Aceptado",            val: viewItem.aceptado, icon: <MdCheck size={15} /> },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <span className="text-[#00868a]">{r.icon}</span>
                    {r.label}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-0.5 rounded-full ${r.val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                    {r.val ? "Sí" : "No"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-base-200 flex justify-end">
              <span className="text-[11px] text-base-content/40 italic">Documento: PDF pendiente</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}