import React, { useState, useEffect, useCallback } from 'react';
import { MdDelete, MdAdd, MdCheck, MdClose } from 'react-icons/md';
import Notification from '../../../components/Notification';
import {
  getTiposTrabajoApi, getRubricasApi, createRubricaApi,
  createRubricaGrupoApi, updateRubricaGrupoApi, deleteRubricaGrupoApi,
  createRubricaCriterioApi, updateRubricaCriterioApi, deleteRubricaCriterioApi,
  getDictamenesConFiltroApi, createDictamenApi,
  createDictamenPreguntaApi, updateDictamenPreguntaApi, deleteDictamenPreguntaApi,
} from '../../../api/adminApi';

function InlineEdit({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex gap-1 items-center flex-1">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          className={`input input-bordered input-sm flex-1 rounded-lg ${className}`}
        />
        <button onClick={save} className="btn btn-xs btn-success rounded-lg"><MdCheck size={14} /></button>
        <button onClick={cancel} className="btn btn-xs btn-ghost rounded-lg"><MdClose size={14} /></button>
      </div>
    );
  }
  return (
    <span
      className={`flex-1 cursor-pointer hover:bg-base-200 px-2 py-1 rounded ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || <span className="italic text-base-content/40">Sin nombre</span>}
    </span>
  );
}

const RubricasYPreguntas = ({ idCongreso }) => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiposTrabajoDisponibles, setTiposTrabajoDisponibles] = useState([]);
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(null);
  const [rubricas, setRubricas] = useState([]);
  const [dictamenes, setDictamenes] = useState([]);
  const accessToken = localStorage.getItem('congress_access');

  const showNotif = (message, type = 'success') => setNotification({ message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tiposData, rubData] = await Promise.all([
        getTiposTrabajoApi(accessToken, idCongreso),
        getRubricasApi(accessToken, idCongreso),
      ]);
      setTiposTrabajoDisponibles(tiposData);
      setRubricas(rubData);
      const firstTipo = tiposData.length > 0 ? tiposData[0].id_tipo_trabajo : null;
      if (firstTipo) {
        setSelectedTipoTrabajo(prev => prev ?? firstTipo);
        const dictData = await getDictamenesConFiltroApi(accessToken, firstTipo);
        setDictamenes(dictData);
      }
    } catch {
      showNotif('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [idCongreso, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTipoChange = async (idTipo) => {
    setSelectedTipoTrabajo(Number(idTipo));
    try {
      const dictData = await getDictamenesConFiltroApi(accessToken, idTipo);
      setDictamenes(dictData);
    } catch {
      showNotif('Error cargando dictámenes', 'error');
    }
  };

  const currentRubrica = rubricas.find(r => r.tipo_trabajo === selectedTipoTrabajo);
  const currentDictamen = dictamenes.find(d => d.tipo_trabajo === selectedTipoTrabajo);

  // ── RÚBRICA ──────────────────────────────────────────────────────

  const crearRubrica = async () => {
    if (!selectedTipoTrabajo) return showNotif('Selecciona un tipo de trabajo primero', 'error');
    try {
      const nueva = await createRubricaApi(accessToken, {
        nombre: 'Nueva Rúbrica',
        id_congreso: idCongreso,
        tipo_trabajo: selectedTipoTrabajo,
      });
      setRubricas(prev => [...prev, { ...nueva, grupos: [] }]);
      showNotif('Rúbrica creada');
    } catch { showNotif('Error creando rúbrica', 'error'); }
  };

  const crearGrupo = async (idRubrica) => {
    try {
      const nuevo = await createRubricaGrupoApi(accessToken, { id_rubrica: idRubrica, nombre_grupo: 'Nuevo grupo' });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? { ...r, grupos: [...(r.grupos || []), { ...nuevo, criterios: [] }] } : r
      ));
      showNotif('Grupo creado');
    } catch { showNotif('Error creando grupo', 'error'); }
  };

  const actualizarNombreGrupo = async (idRubrica, idGrupo, nombre_grupo) => {
    try {
      await updateRubricaGrupoApi(accessToken, idGrupo, { nombre_grupo });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g => g.id_grupo === idGrupo ? { ...g, nombre_grupo } : g)
        } : r
      ));
    } catch { showNotif('Error actualizando grupo', 'error'); }
  };

  const eliminarGrupo = async (idRubrica, idGrupo) => {
    if (!window.confirm('¿Eliminar este grupo y todos sus criterios?')) return;
    try {
      await deleteRubricaGrupoApi(accessToken, idGrupo);
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? { ...r, grupos: r.grupos.filter(g => g.id_grupo !== idGrupo) } : r
      ));
      showNotif('Grupo eliminado');
    } catch { showNotif('Error eliminando grupo', 'error'); }
  };

  const crearCriterio = async (idRubrica, idGrupo) => {
    try {
      const nuevo = await createRubricaCriterioApi(accessToken, { id_grupo: idGrupo, descripcion: 'Nuevo criterio', peso: '1.00' });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? { ...g, criterios: [...(g.criterios || []), nuevo] } : g
          )
        } : r
      ));
      showNotif('Criterio creado');
    } catch { showNotif('Error creando criterio', 'error'); }
  };

  const actualizarCriterio = async (idRubrica, idGrupo, idCriterio, field, value) => {
    try {
      await updateRubricaCriterioApi(accessToken, idCriterio, { [field]: value });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? {
              ...g,
              criterios: g.criterios.map(c =>
                c.id_criterio === idCriterio ? { ...c, [field]: value } : c
              )
            } : g
          )
        } : r
      ));
    } catch { showNotif('Error actualizando criterio', 'error'); }
  };

  const eliminarCriterio = async (idRubrica, idGrupo, idCriterio) => {
    if (!window.confirm('¿Eliminar este criterio?')) return;
    try {
      await deleteRubricaCriterioApi(accessToken, idCriterio);
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? { ...g, criterios: g.criterios.filter(c => c.id_criterio !== idCriterio) } : g
          )
        } : r
      ));
      showNotif('Criterio eliminado');
    } catch { showNotif('Error eliminando criterio', 'error'); }
  };

  // ── DICTAMEN ─────────────────────────────────────────────────────

  const crearDictamen = async () => {
    if (!selectedTipoTrabajo) return showNotif('Selecciona un tipo de trabajo primero', 'error');
    try {
      const nuevo = await createDictamenApi(accessToken, {
        nombre: 'Nuevo Dictamen',
        tipo_trabajo: selectedTipoTrabajo,
      });
      setDictamenes(prev => [...prev, { ...nuevo, preguntas: [] }]);
      showNotif('Dictamen creado');
    } catch { showNotif('Error creando dictamen', 'error'); }
  };

  const crearPregunta = async (idDictamen) => {
    try {
      const nueva = await createDictamenPreguntaApi(accessToken, { id_dictamen: idDictamen, descripcion: 'Nueva pregunta' });
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? { ...d, preguntas: [...(d.preguntas || []), nueva] } : d
      ));
      showNotif('Pregunta creada');
    } catch { showNotif('Error creando pregunta', 'error'); }
  };

  const actualizarPregunta = async (idDictamen, idPregunta, descripcion) => {
    try {
      await updateDictamenPreguntaApi(accessToken, idPregunta, { descripcion });
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? {
          ...d,
          preguntas: d.preguntas.map(p => p.id_pregunta === idPregunta ? { ...p, descripcion } : p)
        } : d
      ));
    } catch { showNotif('Error actualizando pregunta', 'error'); }
  };

  const eliminarPregunta = async (idDictamen, idPregunta) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    try {
      await deleteDictamenPreguntaApi(accessToken, idPregunta);
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? { ...d, preguntas: d.preguntas.filter(p => p.id_pregunta !== idPregunta) } : d
      ));
      showNotif('Pregunta eliminada');
    } catch { showNotif('Error eliminando pregunta', 'error'); }
  };

  return (
    <div className="w-full">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-primary text-white p-6 rounded-t-3xl shadow-lg flex flex-col md:flex-row items-center gap-4">
        <h2 className="text-lg font-bold whitespace-nowrap">Selecciona un tipo de trabajo</h2>
        <select
          value={selectedTipoTrabajo || ''}
          onChange={e => handleTipoChange(e.target.value)}
          className="h-10 pl-2 w-full md:w-80 bg-white text-gray-900 rounded-xl font-bold border-none"
        >
          {tiposTrabajoDisponibles.map(tipo => (
            <option key={tipo.id_tipo_trabajo} value={tipo.id_tipo_trabajo}>{tipo.tipo_trabajo}</option>
          ))}
          {tiposTrabajoDisponibles.length === 0 && <option value="">No hay tipos creados</option>}
        </select>
      </div>

      <div className="flex flex-col">
        {/* DICTAMINACIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Dictaminación (Preguntas)
            </h3>
            {!currentDictamen && (
              <button onClick={crearDictamen} className="btn btn-sm btn-primary gap-2 rounded-xl">
                <MdAdd size={18} /> Crear Dictamen
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
          ) : currentDictamen ? (
            <>
              <button
                onClick={() => crearPregunta(currentDictamen.id_dictamen)}
                className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl"
              >
                <MdAdd size={18} /> Nueva Pregunta
              </button>
              <div className="space-y-3">
                {currentDictamen.preguntas?.map((p, i) => (
                  <div key={p.id_pregunta} className="flex gap-2 items-center group">
                    <span className="text-xs font-bold text-base-content/30 w-5">{i + 1}</span>
                    <InlineEdit
                      value={p.descripcion}
                      onSave={v => actualizarPregunta(currentDictamen.id_dictamen, p.id_pregunta, v)}
                    />
                    <button
                      onClick={() => eliminarPregunta(currentDictamen.id_dictamen, p.id_pregunta)}
                      className="btn btn-sm btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
                {(!currentDictamen.preguntas || currentDictamen.preguntas.length === 0) && (
                  <p className="text-center py-4 text-xs italic text-base-content/40">No hay preguntas aún.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-xs italic text-base-content/40">
              No hay dictamen para este tipo de trabajo.
            </p>
          )}
        </div>

        {/* REVISIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Revisión (Rúbricas)
            </h3>
            {!currentRubrica && (
              <button onClick={crearRubrica} className="btn btn-sm btn-primary gap-2 rounded-xl">
                <MdAdd size={18} /> Crear Rúbrica
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
          ) : currentRubrica ? (
            <>
              <button
                onClick={() => crearGrupo(currentRubrica.id_rubrica)}
                className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl"
              >
                <MdAdd size={18} /> Nuevo Grupo
              </button>
              <div className="space-y-4">
                {currentRubrica.grupos?.map(grupo => (
                  <div key={grupo.id_grupo} className="bg-base-200 p-4 rounded-2xl border border-base-300">
                    <div className="flex items-center gap-2 mb-3 group">
                      <InlineEdit
                        value={grupo.nombre_grupo}
                        onSave={v => actualizarNombreGrupo(currentRubrica.id_rubrica, grupo.id_grupo, v)}
                        className="font-bold text-sm"
                      />
                      <button
                        onClick={() => eliminarGrupo(currentRubrica.id_rubrica, grupo.id_grupo)}
                        className="btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>

                    <div className="space-y-2 pl-2">
                      {grupo.criterios?.map((c, i) => (
                        <div key={c.id_criterio} className="flex items-center gap-2 group bg-white p-2 rounded-xl">
                          <span className="text-xs text-base-content/30 w-4">{i + 1}</span>
                          <InlineEdit
                            value={c.descripcion}
                            onSave={v => actualizarCriterio(currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio, 'descripcion', v)}
                            className="text-sm"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              value={c.peso ? Math.round(parseFloat(c.peso) * 100) : ''}
                              onChange={e => actualizarCriterio(
                                currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio,
                                'peso', (parseFloat(e.target.value || 0) / 100).toFixed(2)
                              )}
                              className="input input-bordered input-xs w-16 rounded-lg text-center"
                              min="0" max="100" placeholder="%"
                            />
                            <span className="text-xs text-base-content/40">%</span>
                          </div>
                          <button
                            onClick={() => eliminarCriterio(currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio)}
                            className="btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                          >
                            <MdDelete size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => crearCriterio(currentRubrica.id_rubrica, grupo.id_grupo)}
                        className="btn btn-xs btn-ghost gap-1 mt-1 rounded-xl"
                      >
                        <MdAdd size={14} /> Criterio
                      </button>
                    </div>
                  </div>
                ))}
                {(!currentRubrica.grupos || currentRubrica.grupos.length === 0) && (
                  <p className="text-center py-10 text-xs italic text-base-content/40 uppercase tracking-widest">
                    Sin grupos definidos.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-xs italic text-base-content/40">
              No hay rúbrica para este tipo de trabajo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RubricasYPreguntas;
