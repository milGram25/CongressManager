import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdAdd, MdDelete, MdEdit, MdCheck, MdClose } from "react-icons/md";
import Notification from "../../../components/Notification";

const MOCK_TIPOS = [
  "Avances de tesis",
  "Investigaciones concluidas",
  "Experiencias de investigación",
];

export default function CongresoTiposTrabajoComponente() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [tipos, setTipos] = useState(() => {
    const saved = localStorage.getItem("congreso_tipos_trabajo");
    return saved ? JSON.parse(saved) : MOCK_TIPOS;
  });
  
  // Estados para doble confirmación
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [isConfirmingAdd, setIsConfirmingAdd] = useState(false);
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
  
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");

  const updateTipos = (newTipos, actionMessage) => {
    setTipos(newTipos);
    localStorage.setItem("congreso_tipos_trabajo", JSON.stringify(newTipos));
    window.dispatchEvent(new Event('storage_tipos_trabajo'));
    if (actionMessage) setNotification({ message: actionMessage, type: 'success' });
  };

  function startEdit(i) {
    setEditIdx(i);
    setEditVal(tipos[i]);
    setAdding(false);
    setConfirmDeleteIdx(null);
    setIsConfirmingEdit(false);
  }

  function handleEditClick() {
    if (!editVal.trim()) return;
    if (isConfirmingEdit) {
      const newTipos = tipos.map((v, i) => i === editIdx ? editVal.trim() : v);
      updateTipos(newTipos, "Tipo de trabajo actualizado correctamente.");
      setEditIdx(null);
      setIsConfirmingEdit(false);
    } else {
      setIsConfirmingEdit(true);
    }
  }

  function handleDeleteClick(i) {
    if (confirmDeleteIdx === i) {
      const tipoEliminado = tipos[i];
      const newTipos = tipos.filter((_, idx) => idx !== i);
      updateTipos(newTipos, `Se eliminó "${tipoEliminado}".`);
      setConfirmDeleteIdx(null);
    } else {
      setConfirmDeleteIdx(i);
      setEditIdx(null);
      setAdding(false);
    }
  }

  function handleAddClick() {
    if (!newVal.trim()) return;
    if (isConfirmingAdd) {
      const newTipos = [...tipos, newVal.trim()];
      updateTipos(newTipos, "Nuevo tipo de trabajo agregado.");
      setAdding(false);
      setNewVal("");
      setIsConfirmingAdd(false);
    } else {
      setIsConfirmingAdd(true);
    }
  }

  // Cancelar estados de confirmación al escribir
  useEffect(() => {
    setIsConfirmingAdd(false);
  }, [newVal]);

  useEffect(() => {
    setIsConfirmingEdit(false);
  }, [editVal]);

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden w-250 mb-10 relative" >
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="flex items-center justify-between px-5 py-4 bg-black">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors mr-1">
            <MdArrowBack size={18} />
          </button>
          <h2 className="text-base font-bold text-white">Crear tipos de trabajo</h2>
        </div>
        <button onClick={() => { setAdding(true); setConfirmDeleteIdx(null); }} className="w-8 h-8 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
          <MdAdd size={18} />
        </button>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 300 }}>
        {tipos.map((tipo, i) => (
          <div key={i} className="border-b border-base-200 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              {editIdx === i ? (
                <>
                  <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} className="flex-1 border border-primary rounded-full px-3 py-1.5 text-sm bg-base-100" />
                  <button onClick={handleEditClick} className={`btn btn-xs rounded-full px-3 transition-all ${isConfirmingEdit ? 'bg-warning text-white border-none scale-105' : 'bg-black text-white border-none'}`}>
                    {isConfirmingEdit ? <><MdCheck size={14} /> ¿ACTUALIZAR?</> : <MdCheck size={14} />}
                  </button>
                  <button onClick={() => setEditIdx(null)} className="btn btn-xs btn-circle bg-base-300 text-base-content/50 border-none"><MdClose size={14} /></button>
                </>
              ) : (
                <>
                  <span className={`flex-1 border rounded-full px-3 py-1.5 text-sm transition-all ${confirmDeleteIdx === i ? 'border-error bg-error/5 text-error font-bold' : 'border-base-300 bg-base-100'}`}>
                    {tipo}
                  </span>
                  
                  {confirmDeleteIdx === i ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                      <button onClick={() => handleDeleteClick(i)} className="btn btn-xs bg-error text-white border-none rounded-full px-3 gap-1">
                        <MdDelete size={14} /> ¿ELIMINAR?
                      </button>
                      <button onClick={() => setConfirmDeleteIdx(null)} className="btn btn-xs btn-circle bg-base-300 border-none">
                        <MdClose size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleDeleteClick(i)} className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-error transition-colors"><MdDelete size={14} /></button>
                      <button onClick={() => startEdit(i)} className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-600 transition-colors"><MdEdit size={14} /></button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {adding && (
          <div className="border-b border-base-200 pb-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <input autoFocus placeholder="Nuevo tipo..." value={newVal} onChange={e => setNewVal(e.target.value)} className="flex-1 border border-primary rounded-full px-3 py-1.5 text-sm bg-base-100" />
              
              <button onClick={handleAddClick} className={`btn btn-xs rounded-full px-3 transition-all ${isConfirmingAdd ? 'bg-warning text-white border-none scale-105' : 'bg-black text-white border-none'}`}>
                {isConfirmingAdd ? <><MdCheck size={14} /> ¿AGREGAR?</> : <MdCheck size={14} />}
              </button>
              
              <button onClick={() => { setAdding(false); setIsConfirmingAdd(false); }} className="btn btn-xs btn-circle bg-base-300 border-none"><MdClose size={14} /></button>
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
