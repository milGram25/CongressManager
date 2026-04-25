import React, { useState, useEffect } from 'react';
import { MdDelete, MdAdd, MdSave, MdCheck } from 'react-icons/md';
import Notification from '../../../components/Notification';
import { getTiposTrabajoApi, getRubricasApi, createRubricaApi, getDictamenesApi } from '../../../api/adminApi';

const RubricasYPreguntas = ({ idCongreso }) => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE TIPOS DE TRABAJO ---
  const [tiposTrabajoDisponibles, setTiposTrabajoDisponibles] = useState([]);
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(null);

  // --- DATOS DEL BACKEND ---
  const [rubricas, setRubricas] = useState([]);
  const [dictamenes, setDictamenes] = useState([]);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchData();

    // Escuchar actualizaciones desde el componente de Tipos de Trabajo
    const handleStorageChange = () => fetchData();
    window.addEventListener('storage_tipos_trabajo', handleStorageChange);
    return () => window.removeEventListener('storage_tipos_trabajo', handleStorageChange);
  }, [idCongreso]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tiposData, rubData, dictData] = await Promise.all([
        getTiposTrabajoApi(accessToken, idCongreso),
        getRubricasApi(accessToken, idCongreso),
        getDictamenesApi(accessToken)
      ]);
      setTiposTrabajoDisponibles(tiposData);
      setRubricas(rubData);
      setDictamenes(dictData);

      if (tiposData.length > 0 && !selectedTipoTrabajo) {
        setSelectedTipoTrabajo(tiposData[0].id_tipo_trabajo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar rubricas y dictamenes por el tipo de trabajo seleccionado
  const currentRubrica = rubricas.find(r => r.tipo_trabajo === selectedTipoTrabajo);
  const currentDictamen = dictamenes.find(d => d.tipo_trabajo === selectedTipoTrabajo);

  return (
    <div className="w-full">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Selector de Tipo de Trabajo (DISEÑO ORIGINAL) */}
      <div className="bg-primary text-white p-6 rounded-t-3xl shadow-lg flex flex-col md:flex-row items-center gap-4">
        <h2 className="text-lg font-bold whitespace-nowrap">Selecciona un tipo de trabajo</h2>

        <select
          value={selectedTipoTrabajo || ''}
          onChange={(e) => setSelectedTipoTrabajo(Number(e.target.value))}
          className="h-10 pl-2 w-full md:w-80 bg-white text-gray-900 rounded-xl font-bold border-none"
        >
          {tiposTrabajoDisponibles.map((tipo) => (
            <option key={tipo.id_tipo_trabajo} value={tipo.id_tipo_trabajo} className="text-black">
              {tipo.tipo_trabajo}
            </option>
          ))}
          {tiposTrabajoDisponibles.length === 0 && <option value="">No hay tipos creados</option>}
        </select>
      </div>

      <div className="flex flex-col">
        {/* SECCIÓN DICTAMINACIÓN (DISEÑO ORIGINAL) */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Dictaminación (Preguntas)
            </h3>
          </div>

          <button className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl">
            <MdAdd size={18} /> Nueva Pregunta
          </button>

          <div className="space-y-3">
            {loading ? (
                <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
            ) : currentDictamen?.preguntas.map((p, i) => (
              <div key={p.id_pregunta} className="flex gap-2 items-center group">
                <span className="text-xs font-bold text-base-content/30 w-5">{i + 1}</span>
                <input
                  type="text"
                  value={p.descripcion}
                  className="input input-bordered input-sm flex-1 bg-white rounded-xl"
                  readOnly
                />
                <button className="btn btn-sm btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100">
                  <MdDelete size={18} />
                </button>
              </div>
            ))}
            {(!currentDictamen || currentDictamen.preguntas.length === 0) && !loading && (
                <p className="text-center py-4 text-xs italic text-base-content/40">No hay preguntas de formato.</p>
            )}
          </div>
        </div>

        {/* SECCIÓN REVISIÓN (DISEÑO ORIGINAL) */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit rounded-b-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Revisión (Rúbricas)
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-[10px] font-bold text-base-content/40 uppercase">
                Total: {currentRubrica?.criterios?.reduce((acc, c) => acc + c.puntaje_maximo, 0) || 0} pts
            </div>
          </div>

          <button className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl">
            <MdAdd size={18} /> Nuevo Criterio
          </button>

          <div className="space-y-6">
            {loading ? (
                 <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
            ) : currentRubrica?.criterios.map((c, i) => (
              <div key={c.id_criterio} className="bg-white p-4 rounded-xl border border-base-300 transition-all hover:shadow-sm">
                <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Criterio {i+1}</span>
                    <div className="flex items-center gap-2 bg-base-200 px-3 py-1 rounded-lg">
                        <span className="font-bold text-xs">{c.puntaje_maximo} PTS</span>
                    </div>
                </div>
                <p className="text-sm">{c.descripcion}</p>
              </div>
            ))}
            {(!currentRubrica || currentRubrica.criterios.length === 0) && !loading && (
                <p className="text-center py-10 text-xs italic text-base-content/40 uppercase tracking-widest">Sin criterios definidos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricasYPreguntas;
