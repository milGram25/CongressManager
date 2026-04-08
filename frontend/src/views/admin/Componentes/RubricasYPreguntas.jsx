import React, { useState } from 'react';
import { MdDelete, MdAdd, MdEdit } from 'react-icons/md';
import { HiDownload } from 'react-icons/hi';

const RubricasYPreguntas = ({ tipoTrabajoId }) => {
  // Lista de tipos de trabajo disponibles
  const tiposTrabajoDisponibles = [
    { id: 1, nombre: 'Ponencia' },
    { id: 2, nombre: 'Taller' },
    { id: 3, nombre: 'Póster' },
    { id: 4, nombre: 'Mesa redonda' },
  ];

  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(tiposTrabajoDisponibles[0].id);
  const [editingId, setEditingId] = useState(null);
  
  // Estado para preguntas
  const [preguntas, setPreguntas] = useState([
    { id: 1, texto: '¿Es conciso?' },
    { id: 2, texto: '¿Es relevante?' },
    { id: 3, texto: '¿Está relacionado con el tema?' },
  ]);

  // Estado para rúbricas - grupos
  const [grupos, setGrupos] = useState([
    { id: 1, texto: 'Concisión' },
    { id: 2, texto: 'Relevancia' },
    { id: 3, texto: 'Estructuración' },
  ]);

  // Estado para rúbricas - criterios
  const [criterios, setCriterios] = useState([
    { id: 1, texto: 'Es conciso', valor: '1.00' },
    { id: 2, texto: 'No divaga de más', valor: '1.00' },
    { id: 3, texto: 'Cantidad de contenido', valor: '1.00' },
  ]);

  // Agregar pregunta
  const agregarPregunta = () => {
    const newPregunta = {
      id: Date.now(),
      texto: '',
    };
    setPreguntas([...preguntas, newPregunta]);
  };

  // Eliminar pregunta
  const eliminarPregunta = (id) => {
    setPreguntas(preguntas.filter((p) => p.id !== id));
  };

  // Editar pregunta
  const editarPregunta = (id, nuevoTexto) => {
    setPreguntas(
      preguntas.map((p) => (p.id === id ? { ...p, texto: nuevoTexto } : p))
    );
  };

  // Agregar grupo
  const agregarGrupo = () => {
    const newGrupo = {
      id: Date.now(),
      texto: '',
    };
    setGrupos([...grupos, newGrupo]);
  };

  // Eliminar grupo
  const eliminarGrupo = (id) => {
    setGrupos(grupos.filter((g) => g.id !== id));
  };

  // Editar grupo
  const editarGrupo = (id, nuevoTexto) => {
    setGrupos(
      grupos.map((g) => (g.id === id ? { ...g, texto: nuevoTexto } : g))
    );
  };

  // Agregar criterio
  const agregarCriterio = () => {
    const newCriterio = {
      id: Date.now(),
      texto: '',
      valor: '1.00',
    };
    setCriterios([...criterios, newCriterio]);
  };

  // Eliminar criterio
  const eliminarCriterio = (id) => {
    setCriterios(criterios.filter((c) => c.id !== id));
  };

  // Editar criterio
  const editarCriterio = (id, nuevoTexto, nuevoValor) => {
    setCriterios(
      criterios.map((c) =>
        c.id === id ? { ...c, texto: nuevoTexto, valor: nuevoValor } : c
      )
    );
  };

  // Descargar preguntas
  const descargarPreguntas = () => {
    const csvContent = [
      'Pregunta',
      ...preguntas.map((p) => `"${p.texto}"`),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute('download', `preguntas.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectedTipoTrabajoNombre = tiposTrabajoDisponibles.find(
    (t) => t.id === selectedTipoTrabajo
  )?.nombre;

  return (
    <div className="w-full space-y-6">
      {/* Header con Selector */}
      <div className="flex items-center justify-between bg-primary text-white p-6 rounded-lg g-10">
        <h2 className="w-100 text-xl font-bold">Seleccionar tipo de trabajo</h2>
        <select
          value={selectedTipoTrabajo}
          onChange={(e) => setSelectedTipoTrabajo(Number(e.target.value))}
          className="select select-bordered select-sm w-full bg-white text-base-content rounded-full pl-4"
        >
          {tiposTrabajoDisponibles.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Sección Preguntas */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-primary mb-2">
            Creación de preguntas
          </h3>
          <p className="text-sm text-base-content/60">
            Asigna preguntas a este área general para que los dictaminadores sepan cómo evaluar resúmenes de esta misma área
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={agregarPregunta}
            className="btn btn-sm btn-primary text-white gap-2"
          >
            <MdAdd size={18} />
            Agregar
          </button>
          <button
            onClick={descargarPreguntas}
            className="btn btn-sm btn-outline btn-primary gap-2"
          >
            <HiDownload size={18} />
            Descargar
          </button>
        </div>

        <div className="space-y-3">
          {preguntas.map((pregunta) => (
            <div key={pregunta.id} className="flex gap-2 items-center">
              <input
                ref={editingId === pregunta.id ? (el) => el?.focus() : null}
                type="text"
                placeholder="¿Es conciso?"
                value={pregunta.texto}
                onChange={(e) => editarPregunta(pregunta.id, e.target.value)}
                className="input input-bordered input-sm flex-1 bg-white"
              />
              <button
                onClick={() => setEditingId(editingId === pregunta.id ? null : pregunta.id)}
                className="btn btn-sm btn-circle btn-primary text-white"
                title="Editar"
              >
                <MdEdit size={16} />
              </button>
              <button
                onClick={() => eliminarPregunta(pregunta.id)}
                className="btn btn-sm btn-circle btn-primary text-white"
                title="Eliminar"
              >
                <MdDelete size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Rúbricas */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-2">
          Creación de rúbricas
        </h3>
        <p className="text-sm text-base-content/60 mb-6">
          Crea rúbricas para que los evaluadores sepan en base a qué grupos, rubros y ponderaciones deben calificar los extensos
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Columna Izquierda: Grupos */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Creación de grupos</h4>
            <p className="text-xs text-base-content/60 mb-4">
              Crea grupos temáticos para saber a qué subtemas específicos pertenece cada criterio de rúbrica.
            </p>

            <button
              onClick={agregarGrupo}
              className="btn btn-sm btn-primary text-white gap-2 mb-4"
            >
              <MdAdd size={16} />
              Agregar
            </button>

            <div className="space-y-3">
              {grupos.map((grupo) => (
                <div key={grupo.id} className="flex gap-2 items-center">
                  <input
                    ref={editingId === grupo.id ? (el) => el?.focus() : null}
                    type="text"
                    placeholder="Nombre del grupo"
                    value={grupo.texto}
                    onChange={(e) => editarGrupo(grupo.id, e.target.value)}
                    className="input input-bordered input-sm flex-1 bg-white"
                  />
                  <button
                    onClick={() => setEditingId(editingId === grupo.id ? null : grupo.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
                    title="Editar"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    onClick={() => eliminarGrupo(grupo.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
                    title="Eliminar"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Criterios */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Creación de criterios de rúbrica</h4>
            <p className="text-xs text-base-content/60 mb-4">
              Crea criterios con ponderaciones específicas para asignarle a un grupo de rúbrica
            </p>

            <button
              onClick={agregarCriterio}
              className="btn btn-sm btn-primary text-white gap-2 mb-4"
            >
              <MdAdd size={16} />
              Agregar
            </button>

            <div className="space-y-3">
              {criterios.map((criterio) => (
                <div key={criterio.id} className="flex gap-2 items-center">
                  <input
                    ref={editingId === criterio.id ? (el) => el?.focus() : null}
                    type="text"
                    placeholder="Criterio"
                    value={criterio.texto}
                    onChange={(e) =>
                      editarCriterio(criterio.id, e.target.value, criterio.valor)
                    }
                    className="input input-bordered input-sm flex-1 bg-white"
                  />
                  <input
                    type="number"
                    placeholder="1.00"
                    value={criterio.valor}
                    onChange={(e) =>
                      editarCriterio(criterio.id, criterio.texto, e.target.value)
                    }
                    className="input input-bordered input-sm w-20 bg-white"
                    step="0.01"
                  />
                  <button
                    onClick={() => setEditingId(editingId === criterio.id ? null : criterio.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
                    title="Editar"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    onClick={() => eliminarCriterio(criterio.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
                    title="Eliminar"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricasYPreguntas;
