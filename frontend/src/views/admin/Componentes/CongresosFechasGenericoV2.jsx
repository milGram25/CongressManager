import React, { useState } from 'react';

const GenericDateComponent = ({titulo, descripcion_fecha}) => {
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 font-sans mb-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex w-full h-10 items-center border border-gray-300 rounded-lg text-center justify-center">
                <p>
                  {titulo}
                </p>
                
              </div>
              <div className="flex w-full flex-1 border border-gray-300 rounded-lg justify-start p-4 text-left">
                <p>
                  {descripcion_fecha}
                </p>
                
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
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-800">Fin</h3>
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

            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default GenericDateComponent;