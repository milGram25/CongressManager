import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDescription, MdFileDownload, MdAssignment, MdComment } from 'react-icons/md';

export default function DetalleRevisionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState('');

  // Mock de datos de la ponencia (esto vendría de una API o del estado global)
  const ponencia = {
    id: id,
    titulo: "Impacto de la Inteligencia Artificial en la Educación Superior 2026",
    autores: "Juan Pérez, Maria García",
    resumen: "Este trabajo explora cómo las herramientas de IA generativa están transformando los procesos de enseñanza-aprendizaje en las universidades de América Latina...",
    extenso: { nombre: "Extenso_Final.pdf", tamaño: "2.4 MB" },
    rubricas: [
      { id: 1, criterio: "Originalidad y relevancia del tema", opciones: ["Excelente", "Bueno", "Regular", "Insuficiente"] },
      { id: 2, criterio: "Calidad metodológica", opciones: ["Excelente", "Bueno", "Regular", "Insuficiente"] },
      { id: 3, criterio: "Claridad en la exposición de resultados", opciones: ["Excelente", "Bueno", "Regular", "Insuficiente"] },
      { id: 4, criterio: "Calidad de las referencias bibliográficas", opciones: ["Excelente", "Bueno", "Regular", "Insuficiente"] }
    ]
  };

  const handleAction = (decision) => {
    // Aquí iría la lógica para enviar la revisión al backend
    alert(`Revisión enviada como: ${decision}`);
    navigate('/revisor/revisiones');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Botón Volver */}
      <button 
        onClick={() => navigate('/revisor/revisiones')}
        className="text-sm font-bold text-[#148f96] hover:underline flex items-center gap-2"
      >
        ← Volver a Mis Revisiones
      </button>

      <div className="flex flex-col gap-6">
        <header>
          <span className="text-xs font-bold text-[#148f96] uppercase tracking-widest">Detalle de Revisión</span>
          <h1 className="text-3xl font-bold text-slate-800 mt-1">{ponencia.titulo}</h1>
          <p className="text-sm text-gray-400 font-mono mt-1">ID: {ponencia.id}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información y Documentos */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                <MdDescription size={20} />
                <span>Información General</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Autores</label>
                  <p className="text-sm text-slate-600">{ponencia.autores}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Resumen</label>
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{ponencia.resumen}"</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                <MdFileDownload size={20} />
                <span>Extenso</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-[#148f96]">{ponencia.extenso.nombre}</span>
                    <span className="text-[10px] text-gray-400">{ponencia.extenso.tamaño}</span>
                  </div>
                  <MdFileDownload className="text-gray-400 group-hover:text-[#148f96]" size={20} />
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Rúbricas y Comentarios */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b pb-2">
                <MdAssignment size={22} />
                <span>Rúbrica de Evaluación</span>
              </div>
              
              <div className="space-y-8">
                {ponencia.rubricas.map((rubrica) => (
                  <div key={rubrica.id} className="space-y-3">
                    <p className="text-sm font-bold text-slate-700">{rubrica.id}. {rubrica.criterio}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {rubrica.opciones.map((opcion) => (
                        <label key={opcion} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-teal-50 transition-all group has-[:checked]:bg-[#148f96] has-[:checked]:border-[#148f96]">
                          <input type="radio" name={`rubrica-${rubrica.id}`} className="hidden" />
                          <span className="text-xs font-semibold text-slate-500 group-hover:text-[#148f96] group-has-[:checked]:text-white mx-auto uppercase">
                            {opcion}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                <MdComment size={22} />
                <span>Comentarios del Revisor</span>
              </div>
              <textarea 
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Escriba aquí sus observaciones detalladas para los autores..."
                className="w-full h-40 p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#148f96] outline-none transition-all text-sm"
              ></textarea>
            </section>

            {/* Botones de Acción */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button 
                onClick={() => handleAction('ACEPTADO')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-wider text-sm"
              >
                Aceptar
              </button>
              <button 
                onClick={() => handleAction('SOLICITUD DE CAMBIOS')}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-100 transition-all active:scale-95 uppercase tracking-wider text-sm"
              >
                Solicitud de cambios
              </button>
              <button 
                onClick={() => handleAction('RECHAZADO')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 uppercase tracking-wider text-sm"
              >
                Rechazar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
