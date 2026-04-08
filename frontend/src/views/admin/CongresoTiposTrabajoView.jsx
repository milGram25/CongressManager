import { useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdCheck, MdClose, MdDownload, MdKeyboardArrowDown } from "react-icons/md";
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_TIPOS = [
  {
    id: 1,
    nombre: "Avances de tesis",
    preguntas: ["¿Es conciso?", "¿Es relevante?", "¿Está relacionado con el tema?"],
    rubricas:  ["¿Es conciso?", "¿Es conciso?", "¿Es conciso?"],
  },
  {
    id: 2,
    nombre: "Investigaciones concluidas",
    preguntas: ["¿Tiene hipótesis clara?", "¿Los resultados son verificables?"],
    rubricas:  ["¿La metodología es adecuada?"],
  },
  {
    id: 3,
    nombre: "Experiencias de investigación",
    preguntas: ["¿Describe el proceso?"],
    rubricas:  [],
  },
];
 
function exportToCSV(tipos) {
  const rows = [["Tipo", "Pregunta", "Rúbrica"]];
  tipos.forEach(t => {
    const max = Math.max(t.preguntas.length, t.rubricas.length, 1);
    for (let i = 0; i < max; i++) {
      rows.push([t.nombre, t.preguntas[i] ?? "", t.rubricas[i] ?? ""]);
    }
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tipos_trabajo.csv"; a.click();
  URL.revokeObjectURL(url);
}
 
// ─── Editable List ────────────────────────────────────────────────────────────
function EditableList({ items, onAdd, onEdit, onDelete, placeholder }) {
  const [adding,  setAdding]  = useState(false);
  const [newVal,  setNewVal]  = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
 
  function confirmAdd() {
    if (newVal.trim()) { onAdd(newVal.trim()); setNewVal(""); setAdding(false); }
  }
  function confirmEdit() {
    if (editVal.trim()) { onEdit(editIdx, editVal.trim()); setEditIdx(null); }
  }
 
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {editIdx === i ? (
            <>
              <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditIdx(null); }}
                className="flex-1 border border-[#00868a] rounded-full px-3 py-1.5 text-sm focus:outline-none bg-white" />
              <button onClick={confirmEdit} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdCheck size={13} /></button>
              <button onClick={() => setEditIdx(null)} className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0"><MdClose size={13} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-700 bg-white truncate">{item}</span>
              <button onClick={() => onDelete(i)} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdDelete size={13} /></button>
              <button onClick={() => { setEditIdx(i); setEditVal(item); }} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdEdit size={13} /></button>
            </>
          )}
        </div>
      ))}
 
      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus placeholder={placeholder} value={newVal}
            onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") confirmAdd(); if (e.key === "Escape") { setAdding(false); setNewVal(""); } }}
            className="flex-1 border border-[#00868a] rounded-full px-3 py-1.5 text-sm focus:outline-none bg-white" />
          <button onClick={confirmAdd} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdCheck size={13} /></button>
          <button onClick={() => { setAdding(false); setNewVal(""); }} className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0"><MdClose size={13} /></button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-[#00868a] hover:text-[#006f73] font-semibold transition-colors mt-1">
          <MdAdd size={14} /> Agregar
        </button>
      )}
    </div>
  );
}
 
// ─── Single Tipo Row (con expand inline) ─────────────────────────────────────
function TipoRow({ tipo, isSelected, onSelect, onEdit, onDelete, onUpdateField }) {
  const [editMode, setEditMode] = useState(false);
  const [editVal,  setEditVal]  = useState(tipo.nombre);
 
  function confirmEdit() {
    if (editVal.trim()) { onEdit(editVal.trim()); setEditMode(false); }
  }
 
  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Row */}
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded-xl
          ${isSelected ? "bg-[#e8f5f5]" : "hover:bg-gray-50"}`}
        onClick={() => !editMode && onSelect()}
      >
        {editMode ? (
          <>
            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditMode(false); }}
              onClick={e => e.stopPropagation()}
              className="flex-1 border border-[#00868a] rounded-full px-3 py-1.5 text-sm focus:outline-none bg-white" />
            <button onClick={e => { e.stopPropagation(); confirmEdit(); }} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdCheck size={13} /></button>
            <button onClick={e => { e.stopPropagation(); setEditMode(false); }} className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0"><MdClose size={13} /></button>
          </>
        ) : (
          <>
            <span className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-700 bg-white truncate">{tipo.nombre}</span>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdDelete size={13} /></button>
            <button onClick={e => { e.stopPropagation(); setEditMode(true); setEditVal(tipo.nombre); }} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdEdit size={13} /></button>
            <MdKeyboardArrowDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isSelected ? "rotate-180" : ""}`} />
          </>
        )}
      </div>
 
      {/* Expanded panel */}
      {isSelected && !editMode && (
        <div className="mx-2 mb-3 mt-1 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200 bg-white">
            {/* Preguntas */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-gray-700">Creación de preguntas</h4>
                <button className="w-6 h-6 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73]" title="Descargar"><MdDownload size={12} /></button>
              </div>
              <p className="text-xs text-gray-400 mb-3 leading-tight">
                Asigna preguntas a esta área general para que los dictaminadores sepan cómo evaluar resúmenes de esta misma área
              </p>
              <EditableList
                items={tipo.preguntas}
                onAdd={v     => onUpdateField("preguntas", p => [...p, v])}
                onEdit={(i,v)=> onUpdateField("preguntas", p => p.map((x,j) => j===i?v:x))}
                onDelete={i  => onUpdateField("preguntas", p => p.filter((_,j) => j!==i))}
                placeholder="Nueva pregunta..."
              />
            </div>
 
            {/* Rúbricas */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-gray-700">Creación de rúbrica</h4>
                <button className="w-6 h-6 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73]" title="Descargar"><MdDownload size={12} /></button>
              </div>
              <p className="text-xs text-gray-400 mb-3 leading-tight">
                Asigna rubros a esta área general para que los evaluadores sepan cómo evaluar extensos de esta misma área
              </p>
              <EditableList
                items={tipo.rubricas}
                onAdd={v     => onUpdateField("rubricas", r => [...r, v])}
                onEdit={(i,v)=> onUpdateField("rubricas", r => r.map((x,j) => j===i?v:x))}
                onDelete={i  => onUpdateField("rubricas", r => r.filter((_,j) => j!==i))}
                placeholder="Nueva rúbrica..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CongresoTiposTrabajoView() {
  const [tipos,      setTipos]      = useState(INITIAL_TIPOS);
  const [selectedId, setSelectedId] = useState(null);
  const [adding,     setAdding]     = useState(false);
  const [newVal,     setNewVal]     = useState("");
  let nextId = Math.max(...tipos.map(t => t.id), 0) + 1;
 
  function addTipo() {
    if (!newVal.trim()) return;
    setTipos(t => [...t, { id: nextId++, nombre: newVal.trim(), preguntas: [], rubricas: [] }]);
    setNewVal(""); setAdding(false);
  }
 
  function editTipo(id, nombre) {
    setTipos(t => t.map(x => x.id === id ? { ...x, nombre } : x));
  }
 
  function deleteTipo(id) {
    setTipos(t => t.filter(x => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
 
  function updateField(id, field, fn) {
    setTipos(t => t.map(x => x.id === id ? { ...x, [field]: fn(x[field]) } : x));
  }
 
  return (
    <div className="w-full">
      {/* Title */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1.5 h-8 rounded-full bg-[#00868a]" />
        <h1 className="text-2xl font-extrabold text-gray-900">Tipo de trabajo</h1>
      </div>
      <p className="text-sm text-[#00868a] mb-5 pl-5">
        Aquí se crean las preguntas y rúbricas para el tipo de trabajo que manejan los congresos
      </p>
 
      {/* Card */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#00868a]">
          <span className="text-white font-bold text-sm">Tipos de trabajo</span>
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(tipos)} title="Descargar"
              className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <MdDownload size={15} />
            </button>
            <button onClick={() => { setAdding(true); setNewVal(""); }} title="Agregar tipo"
              className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <MdAdd size={17} />
            </button>
          </div>
        </div>
 
        {/* Card body */}
        <div className="bg-white p-3 space-y-1">
          {tipos.map(tipo => (
            <TipoRow
              key={tipo.id}
              tipo={tipo}
              isSelected={selectedId === tipo.id}
              onSelect={() => setSelectedId(id => id === tipo.id ? null : tipo.id)}
              onEdit={nombre => editTipo(tipo.id, nombre)}
              onDelete={() => deleteTipo(tipo.id)}
              onUpdateField={(field, fn) => updateField(tipo.id, field, fn)}
            />
          ))}
 
          {/* New tipo input */}
          {adding && (
            <div className="flex items-center gap-2 px-3 py-2">
              <input autoFocus placeholder="Nuevo tipo de trabajo..." value={newVal}
                onChange={e => setNewVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addTipo(); if (e.key === "Escape") { setAdding(false); setNewVal(""); } }}
                className="flex-1 border border-[#00868a] rounded-full px-3 py-1.5 text-sm focus:outline-none bg-white" />
              <button onClick={addTipo} className="w-7 h-7 rounded-full bg-[#00868a] text-white flex items-center justify-center hover:bg-[#006f73] flex-shrink-0"><MdCheck size={13} /></button>
              <button onClick={() => { setAdding(false); setNewVal(""); }} className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0"><MdClose size={13} /></button>
            </div>
          )}
 
          {tipos.length === 0 && !adding && (
            <p className="text-center py-6 text-sm text-gray-400 italic">Sin tipos de trabajo. Presiona + para agregar.</p>
          )}
        </div>
      </div>
    </div>
  );
}