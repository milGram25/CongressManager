import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack, MdAdd, MdEdit, MdDelete, MdAccountTree,
  MdCheck, MdClose, MdRefresh,
} from "react-icons/md";
import {
  obtenerAreasApi, crearAreaApi, editarAreaApi, eliminarAreaApi,
  crearSubareaApi, editarSubareaApi, eliminarSubareaApi,
} from "../../api/areasApi";
import { getCongresosApi } from "../../api/adminApi";

function exportToCSV(areas) {
  const rows = [["Área", "Subárea"]];
  areas.forEach(a => {
    if (a.subAreas.length === 0) rows.push([a.nombre, ""]);
    else a.subAreas.forEach(s => rows.push([a.nombre, s.nombre]));
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "areas_generales.csv"; link.click();
  URL.revokeObjectURL(url);
}

// ─── SubArea Row ──────────────────────────────────────────────────────────────
function SubAreaRow({ subarea, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(subarea.nombre);
  const [saving, setSaving] = useState(false);

  function confirm() {
    if (!val.trim() || saving) return;
    setSaving(true);
    onEdit(val.trim()).finally(() => { setSaving(false); setEditing(false); });
  }
  function cancel() { setVal(subarea.nombre); setEditing(false); }

  return (
    <div className="flex items-center gap-2 ml-6 mt-1.5">
      <div className="w-3 h-px bg-base-300 flex-shrink-0" />
      {editing ? (
        <>
          <input
            autoFocus value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel(); }}
            className="flex-1 border border-[#000000] rounded-full px-3 py-1 text-xs focus:outline-none bg-base-100"
            disabled={saving}
          />
          <button onClick={confirm} disabled={saving}
            className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
            <MdCheck size={12} />
          </button>
          <button onClick={cancel} disabled={saving}
            className="w-6 h-6 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
            <MdClose size={12} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 border border-base-200 rounded-full px-3 py-1 text-xs text-base-content/70 bg-base-100">
            {subarea.nombre}
          </span>
          <button onClick={() => setEditing(true)} title="Editar subárea"
            className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
            <MdEdit size={11} />
          </button>
          <button onClick={onDelete} title="Eliminar subárea"
            className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
            <MdDelete size={11} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Area Row ─────────────────────────────────────────────────────────────────
function AreaRow({ area, onEdit, onDelete, onAddSubArea, onEditSubArea, onDeleteSubArea }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(area.nombre);
  const [showSubs, setShowSubs] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [newSubVal, setNewSubVal] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingSub, setSavingSub] = useState(false);

  function confirmEdit() {
    if (!val.trim() || savingEdit) return;
    setSavingEdit(true);
    onEdit(val.trim()).finally(() => { setSavingEdit(false); setEditing(false); });
  }
  function cancelEdit() { setVal(area.nombre); setEditing(false); }

  function confirmAddSub() {
    if (!newSubVal.trim() || savingSub) return;
    setSavingSub(true);
    onAddSubArea(newSubVal.trim()).finally(() => {
      setSavingSub(false); setNewSubVal(""); setAddingSub(false);
    });
  }
  function cancelAddSub() { setNewSubVal(""); setAddingSub(false); }

  return (
    <div className="border-b border-base-200 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              autoFocus value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
              className="flex-1 border border-[#000000] rounded-full px-3 py-2 text-sm focus:outline-none bg-base-100"
              disabled={savingEdit}
            />
            <button onClick={confirmEdit} disabled={savingEdit}
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
              <MdCheck size={14} />
            </button>
            <button onClick={cancelEdit} disabled={savingEdit}
              className="w-8 h-8 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
              <MdClose size={14} />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 border border-base-300 rounded-full px-3 py-2 text-sm text-base-content bg-base-100 truncate">
              {area.nombre}
            </span>
            <button onClick={() => setEditing(true)} title="Editar área"
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
              <MdEdit size={14} />
            </button>
            <button onClick={onDelete} title="Eliminar área"
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
              <MdDelete size={14} />
            </button>
            <button onClick={() => setShowSubs(s => !s)} title="Ver/agregar subáreas"
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
              <MdAccountTree size={14} />
            </button>
          </>
        )}
      </div>

      {showSubs && !editing && (
        <div className="mt-2 ml-2 pl-2 border-l-2 border-[#000000]/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-base-content/40  tracking-wide">
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

          {area.subAreas.map(s => (
            <SubAreaRow
              key={s.id}
              subarea={s}
              onEdit={v => onEditSubArea(s.id, v)}
              onDelete={() => onDeleteSubArea(s.id)}
            />
          ))}

          {addingSub && (
            <div className="flex items-center gap-2 ml-6 mt-1.5">
              <div className="w-3 h-px bg-base-300 flex-shrink-0" />
              <input
                autoFocus placeholder="Nueva subárea..." value={newSubVal}
                onChange={e => setNewSubVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmAddSub(); if (e.key === "Escape") cancelAddSub(); }}
                className="flex-1 border border-[#000000] rounded-full px-3 py-1 text-xs focus:outline-none bg-base-100"
                disabled={savingSub}
              />
              <button onClick={confirmAddSub} disabled={savingSub}
                className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
                <MdCheck size={12} />
              </button>
              <button onClick={cancelAddSub} disabled={savingSub}
                className="w-6 h-6 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
                <MdClose size={12} />
              </button>
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
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);

  const getToken = () => localStorage.getItem("congress_access");

  useEffect(() => {
    getCongresosApi(getToken())
      .then(data => setCongresos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCongreso) cargarAreas();
    else setAreas([]);
  }, [selectedCongreso]);

  async function cargarAreas() {
    if (!selectedCongreso) return;
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerAreasApi(getToken(), selectedCongreso);
      setAreas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function agregarArea() {
    if (!newVal.trim() || savingNew) return;
    setSavingNew(true);
    try {
      const creada = await crearAreaApi(newVal.trim(), getToken(), selectedCongreso);
      setAreas(prev => [...prev, creada]);
      setNewVal(""); setAdding(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingNew(false);
    }
  }

  async function editarArea(id, nombre) {
    try {
      await editarAreaApi(id, nombre, getToken());
      setAreas(prev => prev.map(a => a.id === id ? { ...a, nombre } : a));
    } catch (e) {
      alert(e.message);
      throw e;
    }
  }

  async function eliminarArea(id) {
    try {
      await eliminarAreaApi(id, getToken());
      setAreas(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  async function agregarSubarea(areaId, nombre) {
    try {
      const creada = await crearSubareaApi(areaId, nombre, getToken());
      setAreas(prev => prev.map(a =>
        a.id === areaId ? { ...a, subAreas: [...a.subAreas, creada] } : a
      ));
    } catch (e) {
      alert(e.message);
      throw e;
    }
  }

  async function editarSubarea(areaId, subId, nombre) {
    try {
      await editarSubareaApi(subId, nombre, getToken());
      setAreas(prev => prev.map(a =>
        a.id === areaId
          ? { ...a, subAreas: a.subAreas.map(s => s.id === subId ? { ...s, nombre } : s) }
          : a
      ));
    } catch (e) {
      alert(e.message);
      throw e;
    }
  }

  async function eliminarSubarea(areaId, subId) {
    try {
      await eliminarSubareaApi(subId, getToken());
      setAreas(prev => prev.map(a =>
        a.id === areaId
          ? { ...a, subAreas: a.subAreas.filter(s => s.id !== subId) }
          : a
      ));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden w-full">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#000000]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors" title="Regresar">
            <MdArrowBack size={18} />
          </button>
          <h2 className="text-base font-bold text-white">Áreas generales</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarAreas} title="Recargar"
            className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <MdRefresh size={15} />
          </button>
          <button onClick={() => { setAdding(true); setNewVal(""); }} title="Agregar área"
            className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <MdAdd size={18} />
          </button>
          <button onClick={() => exportToCSV(areas)} title="Descargar CSV"
            className="w-8 h-8 rounded-full border-2 border-white/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Selector de congreso */}
      <div className="px-4 pt-4 pb-2 border-b border-base-200">
        <select
          className="select select-bordered select-sm w-full rounded-xl"
          value={selectedCongreso ?? ''}
          onChange={e => setSelectedCongreso(e.target.value || null)}
        >
          <option value="">Selecciona un congreso...</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 600 }}>

        {loading && (
          <p className="text-center py-10 text-sm text-base-content/40">Cargando áreas...</p>
        )}

        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-sm text-error mb-3">{error}</p>
            <button onClick={cargarAreas} className="btn btn-sm btn-outline">Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {!selectedCongreso ? (
              <p className="text-center py-10 text-sm text-base-content/40 italic">
                Selecciona un congreso para gestionar sus áreas.
              </p>
            ) : (
              <>
                {adding && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-base-200">
                    <input
                      autoFocus placeholder="Nombre del área..." value={newVal}
                      onChange={e => setNewVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") agregarArea();
                        if (e.key === "Escape") { setAdding(false); setNewVal(""); }
                      }}
                      className="flex-1 border border-[#000000] rounded-full px-3 py-2 text-sm focus:outline-none bg-base-100"
                      disabled={savingNew}
                    />
                    <button onClick={agregarArea} disabled={savingNew}
                      className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0">
                      <MdCheck size={14} />
                    </button>
                    <button onClick={() => { setAdding(false); setNewVal(""); }} disabled={savingNew}
                      className="w-8 h-8 rounded-full bg-base-300 text-base-content/50 flex items-center justify-center hover:bg-base-400 transition-colors flex-shrink-0">
                      <MdClose size={14} />
                    </button>
                  </div>
                )}
                {areas.length === 0 && !adding ? (
                  <p className="text-center py-10 text-sm text-base-content/40 italic">Sin áreas. Presiona + para agregar.</p>
                ) : (
                  areas.map(area => (
                    <AreaRow
                      key={area.id}
                      area={area}
                      onEdit={nombre => editarArea(area.id, nombre)}
                      onDelete={() => eliminarArea(area.id)}
                      onAddSubArea={nombre => agregarSubarea(area.id, nombre)}
                      onEditSubArea={(subId, nombre) => editarSubarea(area.id, subId, nombre)}
                      onDeleteSubArea={subId => eliminarSubarea(area.id, subId)}
                    />
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
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
