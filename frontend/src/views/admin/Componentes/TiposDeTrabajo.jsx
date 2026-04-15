import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdDownload, MdAdd, MdDelete, MdEdit, MdCheck, MdClose } from "react-icons/md";

const MOCK_TIPOS = [
  "Avances de tesis",
  "Investigaciones concluidas",
  "Experiencias de investigación",
];

function exportToCSV(tipos) {
  const csv = ["Tipo de trabajo", ...tipos].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tipos_de_trabajo.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function CongresoTiposTrabajoComponente() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState(MOCK_TIPOS);
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");

  function startEdit(i) {
    setEditIdx(i);
    setEditVal(tipos[i]);
    setAdding(false);
  }

  function confirmEdit() {
    if (!editVal.trim()) return;
    setTipos(t => t.map((v, i) => i === editIdx ? editVal.trim() : v));
    setEditIdx(null);
  }

  function cancelEdit() { setEditIdx(null); }

  function deleteTipo(i) {
    setTipos(t => t.filter((_, idx) => idx !== i));
    if (editIdx === i) setEditIdx(null);
  }

  function startAdd() {
    setAdding(true);
    setNewVal("");
    setEditIdx(null);
  }

  function confirmAdd() {
    if (!newVal.trim()) return;
    setTipos(t => [...t, newVal.trim()]);
    setAdding(false);
    setNewVal("");
  }

  function cancelAdd() { setAdding(false); setNewVal(""); }

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden w-full mb-10" >

      {/* Header teal */}
      <div className="flex items-center justify-between px-5 py-4 bg-black">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white transition-colors mr-1"
            title="Regresar"
          >
            <MdArrowBack size={18} />
          </button>
          <h2 className="text-base font-bold text-white">Crear tipos de trabajo</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(tipos)}
            title="Descargar Excel/CSV"
            className="w-8 h-8 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <MdDownload size={16} />
          </button>
          <button
            onClick={startAdd}
            title="Agregar tipo"
            className="w-8 h-8 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <MdAdd size={18} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 240 }}>
        {tipos.map((tipo, i) => (
          <div key={i} className="border-b border-base-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              {editIdx === i ? (
                <>
                  <input
                    autoFocus
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                    className="flex-1 border border-black rounded-full px-3 py-1.5 text-sm focus:outline-none bg-white "
                  />
                  <button onClick={confirmEdit} className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
                    <MdCheck size={14} />
                  </button>
                  <button onClick={cancelEdit} className="w-7 h-7 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
                    <MdClose size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm text-base-content bg-white">
                    {tipo}
                  </span>
                  <button
                    onClick={() => deleteTipo(i)}
                    title="Eliminar"
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"
                  >
                    <MdDelete size={14} />
                  </button>
                  <button
                    onClick={() => startEdit(i)}
                    title="Editar"
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"
                  >
                    <MdEdit size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Fila para agregar */}
        {adding && (
          <div className="border-b border-base-200 pb-2">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                placeholder="Nuevo tipo de trabajo..."
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmAdd(); if (e.key === "Escape") cancelAdd(); }}
                className="flex-1 border border-b rounded-full px-3 py-1.5 text-sm focus:outline-none bg-base-100"
              />
              <button onClick={confirmAdd} className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
                <MdCheck size={14} />
              </button>
              <button onClick={cancelAdd} className="w-7 h-7 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
                <MdClose size={14} />
              </button>
            </div>
          </div>
        )}

        {tipos.length === 0 && !adding && (
          <p className="text-center py-6 text-sm text-base-content/40 italic">Sin tipos de trabajo. Presiona + para agregar.</p>
        )}
      </div>
    </div>
  );
}