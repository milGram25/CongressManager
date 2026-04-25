import React, { useEffect, useState } from 'react';
import { MdDelete, MdAdd, MdEdit, MdSave } from 'react-icons/md';
import { HiDownload } from 'react-icons/hi';
import { createMesaApi, deleteMesaApi } from '../../../api/adminApi';

const CrearMesasFisicas = ({ idSede, listaMesas, onUpdate }) => {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    setMesas(listaMesas);
    if (listaMesas.length > 0 && !mesaSeleccionada) {
      setMesaSeleccionada(listaMesas[0].id_mesas_trabajo);
    }
  }, [listaMesas]);

  const mesaActual = mesas.find((m) => m.id_mesas_trabajo === mesaSeleccionada);

  const handleAgregarMesa = async () => {
    try {
        const nombre = `Nueva Mesa ${mesas.length + 1}`;
        await createMesaApi(accessToken, { 
            nombre: nombre,
            id_sede: idSede
        });
        if (onUpdate) onUpdate();
    } catch (error) {
        alert("Error al crear mesa.");
    }
  };

  const handleEliminarMesa = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta mesa?")) return;
    try {
        await deleteMesaApi(accessToken, id);
        if (onUpdate) onUpdate();
    } catch (error) {
        alert("Error al eliminar mesa.");
    }
  };

  const editarNombreMesa = (id, nuevoNombre) => {
    setMesas(mesas.map((m) => (m.id_mesas_trabajo === id ? { ...m, nombre: nuevoNombre } : m)));
  };

  const descargarMesas = () => {
    const csv = ['Nombre,Sede ID', ...mesas.map((m) => `"${m.nombre}","${m.id_sede}"`)].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'mesas_trabajo.csv';
    a.click();
  };

  return (
    <div className="w-full min-h-[400px] animate-in slide-in-from-bottom duration-700">
      {/* Header */}
      <div className="flex items-center justify-between bg-black text-white p-6 rounded-t-[32px] shadow-lg">
        <h2 className="text-xl font-bold uppercase tracking-tight">Mesas físicas</h2>
        <div className="flex gap-2">
          <button onClick={descargarMesas} className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer" title="Descargar CSV">
            <HiDownload size={20} />
          </button>
          <button onClick={handleAgregarMesa} className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-[#005a6a] hover:text-white transition-all cursor-pointer shadow-md" title="Agregar mesa">
            <MdAdd size={24} />
          </button>
        </div>
      </div>

      {/* Sección */}
      <div className="bg-white border border-gray-100 rounded-b-[32px] p-8 shadow-sm h-full">
        <div className="mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Inventario de Espacios</h3>
            <p className="text-sm text-gray-500 font-medium">
            Gestiona las mesas de trabajo físicas donde se llevarán a cabo las ponencias y talleres.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna Izquierda: Lista de Mesas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Listado de Mesas ({mesas.length})</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {mesas.length > 0 ? mesas.map((mesa) => (
                  <div
                    key={mesa.id_mesas_trabajo}
                    className={`flex gap-3 items-center p-3 rounded-2xl border transition-all cursor-pointer group ${mesaSeleccionada === mesa.id_mesas_trabajo ? 'bg-[#005a6a]/5 border-[#005a6a] shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                    onClick={() => setMesaSeleccionada(mesa.id_mesas_trabajo)}
                  >
                    <div className={`w-2 h-2 rounded-full ${mesaSeleccionada === mesa.id_mesas_trabajo ? 'bg-[#005a6a] animate-pulse' : 'bg-gray-300'}`} />

                    <input
                      type="text"
                      value={mesa.nombre}
                      onChange={(e) => editarNombreMesa(mesa.id_mesas_trabajo, e.target.value)}
                      readOnly={editandoId !== mesa.id_mesas_trabajo}
                      className={`flex-1 bg-transparent text-sm font-bold outline-none ${mesaSeleccionada === mesa.id_mesas_trabajo ? 'text-gray-900' : 'text-gray-500'}`}
                    />
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditandoId(editandoId === mesa.id_mesas_trabajo ? null : mesa.id_mesas_trabajo); }}
                          className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          {editandoId === mesa.id_mesas_trabajo ? <MdSave size={16}/> : <MdEdit size={16} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEliminarMesa(mesa.id_mesas_trabajo); }}
                          className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <MdDelete size={16} />
                        </button>
                    </div>
                  </div>
                )) : (
                <div className='flex flex-col items-center justify-center py-10 opacity-30'>
                  <MdAdd size={48} />
                  <p className='text-xs font-bold uppercase mt-2'>No hay mesas creadas</p>
                </div>
                )}
            </div>
          </div>

          {/* Columna Derecha: Características */}
          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
            <div className="mb-6">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Configuración Detallada</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Ajusta los atributos del espacio seleccionado</p>
            </div>

            {mesaActual ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nombre Identificador</label>
                  <input
                    className="w-full h-12 bg-white border border-gray-200 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                    value={mesaActual.nombre}
                    readOnly
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Asociado a Sede (ID)</label>
                  <div className="w-full h-12 bg-gray-100 border border-transparent px-6 rounded-2xl text-sm font-mono flex items-center text-gray-400">
                    {idSede || "N/A"}
                  </div>
                </div>

                <div className="pt-4 italic text-[10px] text-gray-400 text-center uppercase tracking-widest font-black">
                   Las mesas se vinculan automáticamente a la sede actual
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 text-center">
                  <MdEdit size={40} />
                  <p className="text-xs font-black uppercase mt-4 max-w-[200px]">Selecciona una mesa para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMesasFisicas;
