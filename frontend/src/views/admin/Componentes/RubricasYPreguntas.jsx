
import React, { useState, useEffect } from 'react';
import { MdDelete, MdAdd, MdSave, MdCheck } from 'react-icons/md';
import Notification from '../../../components/Notification';

const RubricasYPreguntas = () => {
  const [notification, setNotification] = useState(null);

  // --- ESTADOS DE TIPOS DE TRABAJO ---
  const [tiposTrabajoDisponibles, setTiposTrabajoDisponibles] = useState(() => {
    const saved = localStorage.getItem("congreso_tipos_trabajo");
    const mock = ["Avances de tesis", "Investigaciones concluidas", "Experiencias de investigación"];
    const tipos = saved ? JSON.parse(saved) : mock;
    return tipos.map((nombre, index) => ({ id: index + 1, nombre }));
  });

  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(() => {
    return tiposTrabajoDisponibles.length > 0 ? tiposTrabajoDisponibles[0].id : null;
  });

  // --- ESTADOS DE DICTAMINACIÓN ---
  const [preguntas, setPreguntas] = useState([]);
  const [initialPreguntas, setInitialPreguntas] = useState([]);
  const [isConfirmingDictamen, setIsConfirmingDictamen] = useState(false);

  // --- ESTADOS DE REVISIÓN ---
  const [grupos, setGrupos] = useState([]);
  const [initialGrupos, setInitialGrupos] = useState([]);
  const [isConfirmingRevision, setIsConfirmingRevision] = useState(false);

  // ESCUCHAR CAMBIOS EN LOS TIPOS DE TRABAJO (Sincronización)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("congreso_tipos_trabajo");
      if (saved) {
        const nuevosTipos = JSON.parse(saved).map((nombre, index) => ({ id: index + 1, nombre }));
        setTiposTrabajoDisponibles(nuevosTipos);

        // Si el tipo seleccionado ya no existe, seleccionar el primero
        if (nuevosTipos.length > 0) {
          const existe = nuevosTipos.find(t => t.id === selectedTipoTrabajo);
          if (!existe) setSelectedTipoTrabajo(nuevosTipos[0].id);
        } else {
          setSelectedTipoTrabajo(null);
        }
      }
    };

    window.addEventListener('storage_tipos_trabajo', handleStorageChange);
    return () => window.removeEventListener('storage_tipos_trabajo', handleStorageChange);
  }, [selectedTipoTrabajo]);

  // CARGAR DATOS AL CAMBIAR TIPO SELECCIONADO
  useEffect(() => {
    if (!selectedTipoTrabajo) return;

    // Cargar Dictaminación
    const savedDictamen = localStorage.getItem(`config_dictamen_${selectedTipoTrabajo}`);
    const dataDictamen = savedDictamen ? JSON.parse(savedDictamen) : [];
    setPreguntas(dataDictamen);
    setInitialPreguntas(JSON.parse(JSON.stringify(dataDictamen)));

    // Cargar Revisión
    const savedRevision = localStorage.getItem(`config_revision_${selectedTipoTrabajo}`);
    const dataRevision = savedRevision ? JSON.parse(savedRevision) : [];
    setGrupos(dataRevision);
    setInitialGrupos(JSON.parse(JSON.stringify(dataRevision)));

    setIsConfirmingDictamen(false);
    setIsConfirmingRevision(false);
  }, [selectedTipoTrabajo]);

  // DETECCIÓN DE CAMBIOS
  const hasChangesDictamen = JSON.stringify(preguntas) !== JSON.stringify(initialPreguntas);
  const hasChangesRevision = JSON.stringify(grupos) !== JSON.stringify(initialGrupos);

  // --- FUNCIONES DE DICTAMINACIÓN ---
  const guardarDictamen = () => {
    if (!isConfirmingDictamen) {
      setIsConfirmingDictamen(true);
      return;
    }
    localStorage.setItem(`config_dictamen_${selectedTipoTrabajo}`, JSON.stringify(preguntas));
    setInitialPreguntas(JSON.parse(JSON.stringify(preguntas)));
    setIsConfirmingDictamen(false);
    setNotification({ message: 'Preguntas de dictaminación guardadas.', type: 'success' });
  };

  const agregarPregunta = () => setPreguntas([...preguntas, { id: Date.now(), texto: '' }]);
  const eliminarPregunta = (id) => setPreguntas(preguntas.filter(p => p.id !== id));
  const editarPregunta = (id, texto) => setPreguntas(preguntas.map(p => p.id === id ? { ...p, texto } : p));

  // --- FUNCIONES DE REVISIÓN ---
  const guardarRevision = () => {
    if (!isConfirmingRevision) {
      setIsConfirmingRevision(true);
      return;
    }
    localStorage.setItem(`config_revision_${selectedTipoTrabajo}`, JSON.stringify(grupos));
    setInitialGrupos(JSON.parse(JSON.stringify(grupos)));
    setIsConfirmingRevision(false);
    setNotification({ message: 'Rúbrica de revisión guardada.', type: 'success' });
  };

  const agregarGrupo = () => setGrupos([...grupos, { id: Date.now(), texto: '', criterios: [] }]);
  const eliminarGrupo = (id) => setGrupos(grupos.filter(g => g.id !== id));
  const editarGrupo = (id, texto) => setGrupos(grupos.map(g => g.id === id ? { ...g, texto } : g));

  const agregarCriterio = (grupoId) => setGrupos(grupos.map(g =>
    g.id === grupoId ? { ...g, criterios: [...g.criterios, { id: Date.now(), texto: '', valor: '1.00' }] } : g
  ));
  const eliminarCriterio = (grupoId, cId) => setGrupos(grupos.map(g =>
    g.id === grupoId ? { ...g, criterios: g.criterios.filter(c => c.id !== cId) } : g
  ));
  const editarCriterio = (gId, cId, texto, valor) => setGrupos(grupos.map(g =>
    g.id === gId ? { ...g, criterios: g.criterios.map(c => c.id === cId ? { ...c, texto, valor } : c) } : g
  ));

  const totalPuntos = grupos.reduce((acc, g) =>
    acc + g.criterios.reduce((accC, c) => accC + parseFloat(c.valor || 0), 0)
    , 0).toFixed(2);

  return (
    <div className="w-full">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Selector de Tipo de Trabajo */}
      <div className="bg-primary text-white p-6 rounded-t-3xl shadow-lg flex flex-col md:flex-row items-center gap-4">
        <h2 className="text-lg font-bold whitespace-nowrap">Selecciona un tipo de trabajo</h2>

        <select
          value={selectedTipoTrabajo || ''}
          onChange={(e) => setSelectedTipoTrabajo(Number(e.target.value))}
          className="h-10 pl-2 w-full md:w-80 bg-white text-base-content rounded-xl font-normal"
        >
          {tiposTrabajoDisponibles.map((tipo) => (
            <option key={tipo.id} value={tipo.id} className="text_left">{tipo.nombre}</option>
          ))}
          {tiposTrabajoDisponibles.length === 0 && <option value="">No hay tipos creados</option>}
        </select>
      </div>


      <div className="flex flex-col">
        {/* SECCIÓN DICTAMINACIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Dictaminación (Preguntas)
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {hasChangesDictamen && (
                <button
                  onClick={() => { setPreguntas(JSON.parse(JSON.stringify(initialPreguntas))); setIsConfirmingDictamen(false); }}
                  className="btn btn-sm btn-ghost text-error font-bold rounded-xl px-4"
                >
                  DESCARTAR
                </button>
              )}
              <button
                onClick={guardarDictamen}
                disabled={!hasChangesDictamen}
                className={`btn btn-sm rounded-xl px-4 transition-all duration-300 border-none ${!hasChangesDictamen ? 'bg-base-200 text-base-content/40 cursor-not-allowed' : isConfirmingDictamen ? 'bg-warning text-white' : 'bg-success text-white'
                  }`}
              >
                {isConfirmingDictamen ? '¿CONFIRMAR?' : hasChangesDictamen ? 'GUARDAR SECCIÓN' : 'SIN CAMBIOS'}

              </button>
            </div>
          </div>

          <button onClick={agregarPregunta} className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl">
            <MdAdd size={18} /> Nueva Pregunta
          </button>

          <div className="space-y-3">
            {preguntas.map((p, i) => (
              <div key={p.id} className="flex gap-2 items-center group">
                <span className="text-xs font-bold text-base-content/30 w-5">{i + 1}</span>
                <input
                  type="text"
                  placeholder="Ej: ¿Cumple con formato APA?"
                  value={p.texto}
                  onChange={(e) => { editarPregunta(p.id, e.target.value); setIsConfirmingDictamen(false); }}
                  className="input input-bordered input-sm flex-1 bg-white rounded-xl"
                />
                <button onClick={() => eliminarPregunta(p.id)} className="btn btn-sm btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100">
                  <MdDelete size={18} />
                </button>
              </div>
            ))}
            {preguntas.length === 0 && <p className="text-center py-4 text-xs italic text-base-content/40">No hay preguntas de formato.</p>}
          </div>
        </div>


        {/* SECCIÓN REVISIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit rounded-b-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Revisión (Rúbricas)
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-[10px] font-bold text-base-content/40 uppercase">Total: {totalPuntos} pts</div>
              {hasChangesRevision && (
                <button
                  onClick={() => { setGrupos(JSON.parse(JSON.stringify(initialGrupos))); setIsConfirmingRevision(false); }}
                  className="btn btn-sm btn-ghost text-error font-bold rounded-xl px-4"
                >
                  DESCARTAR
                </button>
              )}
              <button
                onClick={guardarRevision}
                disabled={!hasChangesRevision}
                className={`btn btn-sm rounded-xl px-4 transition-all duration-300 border-none ${!hasChangesRevision ? 'bg-base-200 text-base-content/40 cursor-not-allowed' : isConfirmingRevision ? 'bg-warning text-white' : 'bg-success text-white'
                  }`}
              >
                {isConfirmingRevision ? '¿CONFIRMAR?' : hasChangesRevision ? 'GUARDAR SECCIÓN' : 'SIN CAMBIOS'}
              </button>
            </div>
          </div>

          <button onClick={agregarGrupo} className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl" title="Crea un grupo lógico para agrupar criterios de rúbrica">
            <MdAdd size={18} /> Nuevo Grupo
          </button>

          <div className="space-y-6">
            {grupos.map((g) => (
              <div key={g.id} className="bg-base-200/50 rounded-2xl border border-base-300 overflow-hidden">
                <div className="bg-base-300/50 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del grupo..."
                    value={g.texto}
                    onChange={(e) => { editarGrupo(g.id, e.target.value); setIsConfirmingRevision(false); }}
                    className="input input-bordered input-sm flex-1 font-bold bg-white rounded-xl"
                  />
                  <button onClick={() => agregarCriterio(g.id)} className="btn btn-xs btn-primary text-white px-3 rounded-lg" title="Añade un criterio de rúbrica a este grupo">Criterio</button>
                  <button onClick={() => eliminarGrupo(g.id)} className="btn btn-xs btn-ghost text-error"><MdDelete size={16} /></button>

                </div>
                <div className="p-3 space-y-3">
                  {g.criterios.map((c) => (
                    <div key={c.id} className="bg-white p-3 rounded-xl border border-base-300 group/item transition-all hover:shadow-sm">
                      <div className="flex gap-2 mb-2">
                        <textarea
                          placeholder="Descripción del criterio..."
                          value={c.texto}
                          onChange={(e) => { editarCriterio(g.id, c.id, e.target.value, c.valor); setIsConfirmingRevision(false); }}
                          className="textarea textarea-bordered textarea-sm flex-1 bg-base-100 rounded-lg text-xs min-h-[60px] leading-tight"
                        />
                        <button
                          onClick={() => eliminarCriterio(g.id, c.id)}
                          className="btn btn-xs btn-circle btn-ghost text-error shrink-0"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 pl-1">
                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Ponderación:</span>
                        <div className="flex items-center gap-2 bg-base-200 px-3 py-1 rounded-lg border border-base-300">
                          <input
                            type="number"
                            value={c.valor}
                            onChange={(e) => { editarCriterio(g.id, c.id, c.texto, e.target.value); setIsConfirmingRevision(false); }}
                            className="w-16 bg-transparent text-center font-bold text-xs outline-none"
                            step="0.5"
                          />
                          <span className="text-[10px] font-bold text-base-content/40">PTS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {g.criterios.length === 0 && (
                    <p className="text-center py-2 text-[10px] italic text-base-content/40 uppercase tracking-widest">Sin criterios definidos</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricasYPreguntas;