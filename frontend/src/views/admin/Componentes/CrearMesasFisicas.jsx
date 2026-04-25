import React, { useEffect, useState } from 'react';
import { MdDelete, MdAdd, MdEdit } from 'react-icons/md';
import { HiDownload } from 'react-icons/hi';

const CrearMesasFisicas = ({ listaMesas }) => {


  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    if (listaMesas && listaMesas.length > 0) {//si hay mesas
      setMesas(listaMesas);
      setMesaSeleccionada(listaMesas[0].id); //selecciona la primera mesa
    }
  }, []);


  const mesaActual = mesas.find((m) => m.id === mesaSeleccionada);


  const agregarMesa = () => {
    const nueva = { id: Date.now(), nombre: '', subarea: '', capacidad: '' }; //un id de la fecha para asegurarse de que nunca se repite
    setMesas([...mesas, nueva]);
    setMesaSeleccionada(nueva.id);
    setEditandoId(nueva.id);
  };

  const eliminarMesa = (id) => {
    const nuevas = mesas.filter((m) => m.id !== id); //implementar lógica en la base de datos
    setMesas(nuevas);
    if (mesaSeleccionada === id) {
      setMesaSeleccionada(nuevas[0]?.id || null);
    }
  };

  const editarNombreMesa = (id, nuevoNombre) => {
    setMesas(mesas.map((m) => (m.id === id ? { ...m, nombre: nuevoNombre } : m)));
  };

  const editarCaracteristica = (campo, valor) => {
    setMesas(mesas.map((m) => (m.id === mesaSeleccionada ? { ...m, [campo]: valor } : m)));
  };

  const descargarMesas = () => {
    const csv = ['Nombre,Subárea,Capacidad', ...mesas.map((m) => `"${m.nombre}","${m.subarea}","${m.capacidad}"`)].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'mesas.csv';
    a.click();
  };

  return (
    <div className="w-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-black text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-bold">Mesas físicas</h2>
        <div className="flex gap-2">
          <button onClick={descargarMesas} className="btn btn-sm btn-circle bg-black border-2 border-white text-white hover:bg-gray-800" title="Descargar">
            <HiDownload size={16} />
          </button>
          <button onClick={agregarMesa} className="btn btn-sm btn-circle bg-black border-2 border-white text-white hover:bg-gray-800" title="Agregar mesa">
            <MdAdd size={16} />
          </button>
        </div>
      </div>

      {/* Sección */}
      <div className="bg-base-100 border border-base-300 shadow-sm rounded-b-lg p-6 h-full">
        <h3 className="text-lg font-bold text-black mb-2">Mesas</h3>
        <p className="text-sm text-base-content/60 mb-6">
          Crea mesas de trabajo para posteriormente enlazar los eventos (ponencias y talleres) del congreso a un espacio físico (la mesa)
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/*columna izquierda:lista de mesas*/}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h4 className="font-semibold text-black mb-1">Creación de mesas</h4>
                <p className="text-xs text-base-content/60 mb-4">
                  Crea una mesa que deberá tener un análogo físico en la sede
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={descargarMesas} className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700" title="Descargar">
                  <HiDownload size={14} />
                </button>
                <button onClick={agregarMesa} className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700" title="Agregar">
                  <MdAdd size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3 pr-5 border-r">


              {
                mesas.length > 0 ? mesas.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="flex gap-2 items-center"
                    onClick={() => setMesaSeleccionada(mesa.id)}
                  >
                    {/* 
                  Indicador de selección*/}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 border ${mesaSeleccionada === mesa.id ? 'bg-black border-black' : 'bg-transparent border-gray-400'}`} />

                    <input
                      ref={editandoId === mesa.id ? (el) => el?.focus() : null}
                      type="text"
                      placeholder="Nombre de la mesa"
                      value={mesa.nombre}
                      onChange={(e) => editarNombreMesa(mesa.id, e.target.value)}
                      onBlur={() => setEditandoId(null)}
                      readOnly={editandoId !== mesa.id}
                      className={`input border border-black input-sm flex-1 rounded-full bg-white cursor-pointer ${mesaSeleccionada === mesa.id ? 'border-black border-2' : ''}`}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditandoId(editandoId === mesa.id ? null : mesa.id); }}
                      className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700"
                      title="Editar"
                    >
                      <MdEdit size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarMesa(mesa.id); }}
                      className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700"
                      title="Eliminar"
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                )) : <div className='text-gray-500 text-center'>
                  <br />
                  <p className=' italic text-sm'>Aún no hay mesas existentes: crea una</p>
                </div>}
            </div>
          </div>

          {/*columna derecha: atributos (subáreas y capacidad máxima, como aparece en la base de datos)*/}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h4 className="font-semibold text-black mb-1">Características de la mesa</h4>
                <p className="text-xs text-base-content/60 mb-4">
                  Asigna atributos a las mesas para restringir su alcance y que sea más fácil reconocerlas
                </p>
              </div>
              <button className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700" title="Descargar">
                <HiDownload size={14} />
              </button>
            </div>

            {mesaActual ? (
              <div className="space-y-4">
                {/*subárea*/}
                <div className="flex gap-3 items-center">
                  <label className="w-24 text-sm font-medium text-black flex-shrink-0">Subárea</label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      className="flex-1 h-9 bg-white border border-black pl-3 pr-3 rounded-full text-sm focus:outline-none focus:border-black"
                      placeholder="p. ej.: Programación estructurada"
                      type="text"
                      value={mesaActual.subarea}
                      onChange={(e) => editarCaracteristica('subarea', e.target.value)}
                    />
                    <button className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700 flex-shrink-0">
                      <MdEdit size={14} />
                    </button>
                  </div>
                </div>

                {/*capacidad máxima*/}
                <div className="flex gap-3 items-center">
                  <label className="w-24 text-sm font-medium text-black flex-shrink-0">Cap. máx.</label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      className="flex-1 h-9 bg-white border border-black pl-3 pr-3 rounded-full text-sm focus:outline-none focus:border-black"
                      placeholder="p. ej.: 50"
                      type="number"
                      value={mesaActual.capacidad}
                      onChange={(e) => editarCaracteristica('capacidad', e.target.value)}
                    />
                    <button className="btn btn-sm btn-circle bg-black text-white hover:bg-gray-700 flex-shrink-0">
                      <MdEdit size={14} />
                    </button>
                  </div>
                </div>

                {/*posiblemente agregar aquí un cupo máximo de eventos por mesa */}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Selecciona una mesa para ver sus características</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMesasFisicas;