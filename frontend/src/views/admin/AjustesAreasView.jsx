import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack, MdAdd, MdEdit, MdDelete, MdAttachFile,
  MdCheck, MdClose, MdSettings, MdKeyboardArrowDown, MdKeyboardArrowUp
} from "react-icons/md";
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_AREAS = [
  { id: 1, nombre: "Investigación",  subAreas: ["Investigación básica", "Investigación aplicada"] },
  { id: 2, nombre: "Programación",   subAreas: ["Desarrollo web", "Móvil"] },
  { id: 3, nombre: "Biología",       subAreas: [] },
  { id: 4, nombre: "Computación",    subAreas: ["Redes", "Sistemas operativos"] },
  { id: 5, nombre: "Internet",       subAreas: ["IoT", "Seguridad web"] },
];
 
function exportToCSV(areas) {
  const rows = [["Área", "Subárea"]];
  areas.forEach(a => {
    if (a.subAreas.length === 0) rows.push([a.nombre, ""]);
    else a.subAreas.forEach(s => rows.push([a.nombre, s]));
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "areas_generales.csv"; a.click();
  URL.revokeObjectURL(url);
}
 
// ─── SubArea Row ──────────────────────────────────────────────────────────────
function SubAreaRow({ value, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
 
  function confirm() { if (val.trim()) { onEdit(val.trim()); setEditing(false); } }
  function cancel()  { setVal(value); setEditing(false); }
 
  return (
    <div className="flex items-center gap-2 ml-6 mt-1.5">
      <div className="w-3 h-px bg-base-300 flex-shrink-0" />
      {editing ? (
        <>
          <input autoFocus value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel(); }}
            className="flex-1 border border-[#000000] rounded-full px-3 py-1 text-xs focus:outline-none bg-base-100" />
          <button onClick={confirm} className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdCheck size={12} /></button>
          <button onClick={cancel}  className="w-6 h-6 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0"><MdClose size={12} /></button>
        </>
      ) : (
        <>
          <span className="flex-1 border border-base-200 rounded-full px-3 py-1 text-xs text-base-content/70 bg-base-100">{value}</span>
          <button onClick={() => setEditing(true)} className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdEdit size={11} /></button>
          <button onClick={onDelete}               className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500adtion-colors flex-shrink-0"><MdDelete size={11} /></button>
        </>
      )}
    </div>
  );
}
 
// ─── Area Row ─────────────────────────────────────────────────────────────────
function AreaRow({ area, onEdit, onDelete, onAddSubArea, onEditSubArea, onDeleteSubArea }) {
  const [editing,      setEditing]      = useState(false);
  const [val,          setVal]          = useState(area.nombre);
  const [showSubs,     setShowSubs]     = useState(false);
  const [addingSub,    setAddingSub]    = useState(false);
  const [newSubVal,    setNewSubVal]    = useState("");
 
  function confirmEdit() { if (val.trim()) { onEdit(val.trim()); setEditing(false); } }
  function cancelEdit()  { setVal(area.nombre); setEditing(false); }
 
  function confirmAddSub() {
    if (newSubVal.trim()) { onAddSubArea(newSubVal.trim()); setNewSubVal(""); setAddingSub(false); }
  }
  function cancelAddSub() { setNewSubVal(""); setAddingSub(false); }
 
  function handleClipClick() {
    setShowSubs(s => !s);
    if (!showSubs) setAddingSub(false);
  }
 
  return (
    <div className="border-b border-base-200 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input autoFocus value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
              className="flex-1 border border-[#000000] rounded-full px-3 py-2 text-sm focus:outline-none bg-base-100" />
            <button onClick={confirmEdit} className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdCheck size={14} /></button>
            <button onClick={cancelEdit}  className="w-8 h-8 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0"><MdClose size={14} /></button>
          </>
        ) : (
          <>
            <span className="flex-1 border border-base-300 rounded-full px-3 py-2 text-sm text-base-content bg-base-100 truncate">{area.nombre}</span>
            <button onClick={() => setEditing(true)} title="Editar área"
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdEdit size={14} /></button>
            <button onClick={onDelete} title="Eliminar área"
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdDelete size={14} /></button>
            <button onClick={handleClipClick} title="Ver/agregar subáreas"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0
                ${showSubs ? "bg-[#000000] text-white" : "bg-[#000000] text-white hover:bg-gray-500"}`}>
              <MdAttachFile size={14} />
            </button>
          </>
        )}
      </div>
 
      {/* SubAreas panel */}
      {showSubs && !editing && (
        <div className="mt-2 ml-2 pl-2 border-l-2 border-[#000000]/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-base-content/40 uppercase tracking-wide">
              Subáreas {area.subAreas.length > 0 && `(${area.subAreas.length})`}
            </span>
            <button onClick={() => setAddingSub(true)} title="Agregar subárea"
              className="flex items-center gap-1 text-[11px] text-[#000000] hover:text-gray-500 font-semibold transition-colors">
              <MdAdd size={13} /> Agregar
            </button>
          </div>
 
          {area.subAreas.length === 0 && !addingSub && (
            <p className="text-xs text-base-content/30 italic ml-6">Sin subáreas</p>
          )}
 
          {area.subAreas.map((s, i) => (
            <SubAreaRow key={i} value={s}
              onEdit={v => onEditSubArea(i, v)}
              onDelete={() => onDeleteSubArea(i)} />
          ))}
 
          {addingSub && (
            <div className="flex items-center gap-2 ml-6 mt-1.5">
              <div className="w-3 h-px bg-base-300 flex-shrink-0" />
              <input autoFocus placeholder="Nueva subárea..." value={newSubVal}
                onChange={e => setNewSubVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmAddSub(); if (e.key === "Escape") cancelAddSub(); }}
                className="flex-1 border border-[#000000] rounded-full px-3 py-1 text-xs focus:outline-none bg-base-100" />
              <button onClick={confirmAddSub} className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdCheck size={12} /></button>
              <button onClick={cancelAddSub} className="w-6 h-6 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0"><MdClose size={12} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AreasGeneralesView() {
  const navigate = useNavigate();
  const [areas,   setAreas]   = useState(MOCK_AREAS);
  const [adding,  setAdding]  = useState(false);
  const [newVal,  setNewVal]  = useState("");
  let nextId = Math.max(...areas.map(a => a.id), 0) + 1;
 
  function addArea() {
    if (!newVal.trim()) return;
    setAreas(a => [...a, { id: nextId++, nombre: newVal.trim(), subAreas: [] }]);
    setNewVal(""); setAdding(false);
  }
 
  function editArea(id, nombre) {
    setAreas(a => a.map(x => x.id === id ? { ...x, nombre } : x));
  }
 
  function deleteArea(id) {
    setAreas(a => a.filter(x => x.id !== id));
  }
 
  function addSubArea(id, sub) {
    setAreas(a => a.map(x => x.id === id ? { ...x, subAreas: [...x.subAreas, sub] } : x));
  }
 
  function editSubArea(id, idx, val) {
    setAreas(a => a.map(x => x.id === id ? { ...x, subAreas: x.subAreas.map((s, i) => i === idx ? val : s) } : x));
  }
 
  function deleteSubArea(id, idx) {
    setAreas(a => a.map(x => x.id === id ? { ...x, subAreas: x.subAreas.filter((_, i) => i !== idx) } : x));
  }
 
  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden" style={{ width: 565 }}>
 
      {/* Header teal */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#000000]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors" title="Regresar">
            <MdArrowBack size={18} />
          </button>
          <h2 className="text-base font-bold text-white">Áreas generales</h2>
        </div>
        <div className="flex gap-2">
          <button title="Configuración" className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <MdSettings size={15} />
          </button>
          <button onClick={() => { setAdding(true); setNewVal(""); }} title="Agregar área"
            className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <MdAdd size={18} />
          </button>
          <button onClick={() => exportToCSV(areas)} title="Descargar CSV"
            className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
 
      {/* Lista */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 600 }}>
 
        {/* Fila nueva área */}
        {adding && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-base-200">
            <input autoFocus placeholder="Nombre del área..." value={newVal}
              onChange={e => setNewVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addArea(); if (e.key === "Escape") { setAdding(false); setNewVal(""); } }}
              className="flex-1 border border-[#000000] rounded-full px-3 py-2 text-sm focus:outline-none bg-base-100" />
            <button onClick={addArea} className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"><MdCheck size={14} /></button>
            <button onClick={() => { setAdding(false); setNewVal(""); }} className="w-8 h-8 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0"><MdClose size={14} /></button>
          </div>
        )}
 
        {areas.length === 0 && !adding ? (
          <p className="text-center py-10 text-sm text-base-content/40 italic">Sin áreas. Presiona + para agregar.</p>
        ) : (
          areas.map(area => (
            <AreaRow
              key={area.id}
              area={area}
              onEdit={nombre => editArea(area.id, nombre)}
              onDelete={() => deleteArea(area.id)}
              onAddSubArea={sub => addSubArea(area.id, sub)}
              onEditSubArea={(idx, val) => editSubArea(area.id, idx, val)}
              onDeleteSubArea={idx => deleteSubArea(area.id, idx)}
            />
          ))
        )}
      </div>
 
      {/* Footer + button */}
      <div className="flex justify-center py-3 border-t border-base-200">
        <button onClick={() => { setAdding(true); setNewVal(""); }}
          className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors shadow-md"
          title="Agregar área">
          <MdAdd size={20} />
        </button>
      </div>
    </div>
  );
}
 