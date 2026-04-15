import React, { useState } from 'react';
import { MdDelete, MdAdd, MdEdit } from 'react-icons/md';
import { HiDownload } from 'react-icons/hi';
import { IoMdCheckmark } from "react-icons/io";

const RubricasYPreguntas = ({ tipoTrabajoId }) => {
  const tiposTrabajoDisponibles = [
    { id: 1, nombre: 'Ponencia' },
    { id: 2, nombre: 'Taller' },
    { id: 3, nombre: 'Póster' },
    { id: 4, nombre: 'Mesa redonda' },
  ];

  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(tiposTrabajoDisponibles[0].id);
  const [editingId, setEditingId] = useState(null);
  const [editingIdPregunta, setEditingIdPregunta] = useState(null);
  const [editingIdCriterio, setEditingIdCriterio] = useState(null);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  
  const [preguntas, setPreguntas] = useState([
    { id: 1, texto: '¿Es conciso?' },
    { id: 2, texto: '¿Es relevante?' },
    { id: 3, texto: '¿Está relacionado con el tema?' },
  ]);

  const [grupos, setGrupos] = useState([
    {
      id: 1,
      texto: 'Concisión',
      criterios: [
        { id: 1, texto: 'Es conciso', valor: '1.00' },
        { id: 2, texto: 'No divaga de más', valor: '1.00' },
        { id: 3, texto: 'Cantidad de contenido', valor: '1.00' }
      ]
    },
    {
      id: 2,
      texto: 'Relevancia',
      criterios: [
        { id: 1, texto: 'Es bueno', valor: '1.00' },
        { id: 2, texto: 'Es bonito', valor: '1.00' },
        { id: 3, texto: 'Es barato', valor: '10.00' }
      ]
    },
    {
      id: 3,
      texto: 'Estructuración',
      criterios: []
    }
  ]);

  const grupoActual = grupos.find(g => g.id === grupoSeleccionado);

  const agregarPregunta = () => {
    const newPregunta = {
      id: Date.now(),
      texto: '',
    };
    setPreguntas([...preguntas, newPregunta]);
  };

  const eliminarPregunta = (id) => {
    setPreguntas(preguntas.filter((p) => p.id !== id));
  };

  const editarPregunta = (id, nuevoTexto) => {
    setPreguntas(
      preguntas.map((p) => (p.id === id ? { ...p, texto: nuevoTexto } : p))
    );
  };

  const agregarGrupo = () => {
    const newGrupo = {
      id: Date.now(),
      texto: '',
      criterios: []
    };
    setGrupos([...grupos, newGrupo]);
  };

  const eliminarGrupo = (id) => {
    setGrupos(grupos.filter((g) => g.id !== id));
    if (grupoSeleccionado === id) setGrupoSeleccionado(null);
  };

  const editarGrupo = (id, nuevoTexto) => {
    setGrupos(
      grupos.map((g) => (g.id === id ? { ...g, texto: nuevoTexto } : g))
    );
  };

  const agregarCriterio = () => {
    if (!grupoSeleccionado) return;

    const newCriterio = {
      id: Date.now(),
      texto: '',
      valor: '1.00',
    };

    setGrupos(grupos.map(g =>
      g.id === grupoSeleccionado
        ? { ...g, criterios: [...g.criterios, newCriterio] }
        : g
    ));
  };

  const eliminarCriterio = (id) => {
    setGrupos(grupos.map(g =>
      g.id === grupoSeleccionado
        ? { ...g, criterios: g.criterios.filter(c => c.id !== id) }
        : g
    ));
  };

  const editarCriterio = (id, nuevoTexto, nuevoValor) => {
    setGrupos(grupos.map(g =>
      g.id === grupoSeleccionado
        ? {
            ...g,
            criterios: g.criterios.map(c =>
              c.id === id ? { ...c, texto: nuevoTexto, valor: nuevoValor } : c
            )
          }
        : g
    ));
  };

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

  return (
    <div className="w-full space-y-6">
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

      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-primary mb-2">
            Creación de preguntas
          </h3>
          <p className="text-sm text-base-content/60">
            Asigna preguntas a este área general para que los dictaminadores sepan cómo evaluar resúmenes de esta misma área
          </p>
        </div>

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
            <div
              key={pregunta.id}
              className={`flex gap-2 items-center rounded-full py-1 px-3 cursor-pointer
                ${editingIdPregunta === pregunta.id ? 'bg-gray-300' : 'hover:bg-gray-200'}
              `}
            >
              <input
                ref={editingIdPregunta === pregunta.id ? (el) => el?.focus() : null}
                type="text"
                placeholder="¿Es conciso?"
                value={pregunta.texto}
                onChange={(e) => editarPregunta(pregunta.id, e.target.value)}
                className="input input-bordered input-sm flex-1 bg-white"
                readOnly={editingIdPregunta !== pregunta.id}
              />
              <button
                onClick={() =>
                  setEditingIdPregunta(
                    editingIdPregunta === pregunta.id ? null : pregunta.id
                  )
                }
                className="btn btn-sm btn-circle btn-primary text-white"
                title="Editar"
              >
                {editingIdPregunta === pregunta.id ? (
                  <IoMdCheckmark />
                ) : (
                  <MdEdit size={16} />
                )}
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

      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-2">
          Creación de rúbricas
        </h3>
        <p className="text-sm text-base-content/60 mb-6">
          Crea rúbricas para que los evaluadores sepan en base a qué grupos, rubros y ponderaciones deben calificar los extensos
        </p>

        <div className="grid grid-cols-2 gap-6">
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

            <div className="my-0.5">
              {grupos.map((grupo) => (
                <div
                  key={grupo.id}
                  className={`flex gap-2 items-center rounded-full py-1 px-3 cursor-pointer
                    ${grupoSeleccionado === grupo.id ? 'bg-gray-300' : 'hover:bg-gray-200'}
                  `}
                  onClick={() => setGrupoSeleccionado(grupo.id)}
                >
                  <input
                    ref={editingId === grupo.id ? (el) => el?.focus() : null}
                    type="text"
                    placeholder="Nombre del grupo"
                    value={grupo.texto}
                    onChange={(e) => editarGrupo(grupo.id, e.target.value)}
                    className="input input-bordered input-sm flex-1 bg-white"
                    readOnly={editingId !== grupo.id}
                  />
                  <button
                    onClick={() =>
                      setEditingId(editingId === grupo.id ? null : grupo.id)
                    }
                    className="btn btn-sm btn-circle btn-primary text-white"
                  >
                    {editingId === grupo.id ? (
                      <IoMdCheckmark />
                    ) : (
                      <MdEdit size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => eliminarGrupo(grupo.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              {grupoActual?.criterios.map((criterio) => (
                <div key={criterio.id}
                  className={`flex gap-2 items-center rounded-full py-1 px-3 cursor-pointer
                    ${editingIdCriterio === criterio.id ? 'bg-gray-300' : 'hover:bg-gray-200'}
                  `}>
                  <input
                    ref={editingIdCriterio === criterio.id ? (el) => el?.focus() : null}
                    type="text"
                    placeholder="Criterio"
                    value={criterio.texto}
                    onChange={(e) =>
                      editarCriterio(criterio.id, e.target.value, criterio.valor)
                    }
                    className="input input-bordered input-sm flex-1 bg-white"
                    readOnly={editingIdCriterio !== criterio.id}
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
                    readOnly={editingIdCriterio !== criterio.id}
                  />
                  <button
                    onClick={() =>
                      setEditingIdCriterio(
                        editingIdCriterio === criterio.id ? null : criterio.id
                      )
                    }
                    className="btn btn-sm btn-circle btn-primary text-white"
                  >
                    {editingIdCriterio === criterio.id ? (
                      <IoMdCheckmark />
                    ) : (
                      <MdEdit size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => eliminarCriterio(criterio.id)}
                    className="btn btn-sm btn-circle btn-primary text-white"
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