import React, { useState } from 'react';

const GenericDateComponent = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    horaInicio: '',
    fechaFin: '',
    horaFin: '',
  });

  const [guardados, setGuardados] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.nombre.trim()) return;
    setGuardados([...guardados, { ...formData, id: Date.now() }]);
    setFormData({
      nombre: '',
      descripcion: '',
      fechaInicio: '',
      horaInicio: '',
      fechaFin: '',
      horaFin: '',
    });
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const date = new Date(fechaStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0b1a1c] text-white p-6 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h2 className="text-2xl font-bold">Nueva Fecha Programada</h2>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase tracking-wider">Nombre del Evento</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej. Recepción de trabajos"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1] focus:ring-1 focus:ring-[#4299e1] text-gray-900 placeholder-gray-400 transition-colors"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase tracking-wider">Descripción</label>
                <textarea
                  name="descripcion"
                  placeholder="Detalles adicionales..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full flex-1 min-h-[120px] px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1] focus:ring-1 focus:ring-[#4299e1] text-gray-900 placeholder-gray-400 resize-none transition-colors"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-800">Inicio</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#4299e1]"
                    />
                  </div>
                  <div className="w-1/3">
                    <input
                      type="time"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#4299e1]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-800">Fin (Opcional)</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="date"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#4299e1]"
                    />
                  </div>
                  <div className="w-1/3">
                    <input
                      type="time"
                      name="horaFin"
                      value={formData.horaFin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#4299e1]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-auto w-full py-3 bg-[#0b1a1c] text-white font-bold rounded-lg hover:bg-[#1a2f33] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Añadir Fecha
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#0b1a1c]">Fechas Guardadas</h3>
          <span className="text-sm text-gray-500 font-medium">Total: <span className="text-gray-900">{guardados.length}</span></span>
        </div>
        
        {guardados.length === 0 ? (
          <div className="text-center py-10 text-gray-400 flex flex-col items-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>No hay fechas guardadas aún.</p>
            <p className="text-sm mt-1">Utiliza el formulario de arriba para añadir nuevas fechas al congreso.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {guardados.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0b1a1c]"></div>
                
                <div className="pl-4 flex-1 mb-3 sm:mb-0">
                  <h4 className="text-lg font-bold text-[#0b1a1c]">{item.nombre}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-[#0b1a1c] bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider border border-gray-300">
                      PROGRAMADO
                    </span>
                    {item.descripcion && (
                      <span className="text-sm text-gray-500 truncate max-w-md">
                        {item.descripcion}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-6 pl-4 sm:pl-0 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Inicio</span>
                    <div className="text-sm font-bold text-gray-800">
                      {formatFecha(item.fechaInicio) || '--'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {item.horaInicio ? `${item.horaInicio} hrs` : '--:--'}
                    </div>
                  </div>
                  
                  {(item.fechaFin || item.horaFin) && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Fin</span>
                      <div className="text-sm font-bold text-gray-800">
                        {formatFecha(item.fechaFin) || '--'}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {item.horaFin ? `${item.horaFin} hrs` : '--:--'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericDateComponent;