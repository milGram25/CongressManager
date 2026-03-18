import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDescription, MdQuiz, MdCheckCircle, MdCancel } from 'react-icons/md';

export default function DetalleDictamenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Datos de ejemplo
  const ponencia = {
    id: id || "ART-9920",
    titulo: "Impacto de la Inteligencia Artificial en la Educación Superior 2026",
    autores: "Juan Pérez, Maria García",
    resumen: "Este trabajo explora cómo las herramientas de IA generativa están transformando los procesos de enseñanza-aprendizaje en las universidades de América Latina. Se analizan casos de estudio en México, Colombia y Argentina, destacando los retos éticos y las oportunidades de personalización educativa que estas tecnologías ofrecen al cuerpo docente y estudiantil.",
    institucion: "Universidad de Guadalajara",
    preguntas: [
      { id: 1, texto: "¿El resumen cumple con la extensión requerida?" },
      { id: 2, texto: "¿Los autores están correctamente adscritos?" },
      { id: 3, texto: "¿El tema es pertinente para el congreso?" },
      { id: 4, texto: "¿La bibliografía sigue el formato APA 7?" },
      { id: 5, texto: "¿Se adjuntaron todos los archivos necesarios?" }
    ]
  };

  const [respuestas, setRespuestas] = useState({});

  const handleRadioChange = (preguntaId, valor) => {
    setRespuestas({ ...respuestas, [preguntaId]: valor });
  };

  const handleDecision = (decision) => {
    alert(`Dictamen enviado: ${decision}`);
    navigate('/dictaminador/dictamenes');
  };

  return (
    <div className="space-y-8 pb-20">
      <button 
        onClick={() => navigate('/dictaminador/dictamenes')}
        className="text-sm font-bold text-[#148f96] hover:underline flex items-center gap-2"
      >
        ← Volver a Mis Dictámenes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Información de la Ponencia */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b pb-3">
              <MdDescription size={24} className="text-[#148f96]" />
              <span className="text-xl">Información de la Ponencia</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título</label>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{ponencia.titulo}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Registro</label>
                  <p className="text-sm font-mono text-slate-600">{ponencia.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institución</label>
                  <p className="text-sm text-slate-600">{ponencia.institucion}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Autores</label>
                <p className="text-sm text-slate-600 font-medium">{ponencia.autores}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 italic text-slate-600">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 not-italic">Resumen</label>
                <p className="text-sm leading-relaxed">"{ponencia.resumen}"</p>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Preguntas de Si/No */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b pb-3">
              <MdQuiz size={24} className="text-[#148f96]" />
              <span className="text-xl">Evaluación de Formato</span>
            </div>

            <div className="space-y-8">
              {ponencia.preguntas.map((p) => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                  <p className="text-sm font-semibold text-slate-700 md:max-w-[70%]">{p.id}. {p.texto}</p>
                  <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => handleRadioChange(p.id, 'Si')}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                        respuestas[p.id] === 'Si' ? 'bg-white text-[#148f96] shadow-sm' : 'text-gray-400'
                      }`}
                    >
                      SI
                    </button>
                    <button
                      onClick={() => handleRadioChange(p.id, 'No')}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                        respuestas[p.id] === 'No' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de Acción Final */}
            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => handleDecision('ACEPTADO')}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                <MdCheckCircle size={18} />
                Aceptar
              </button>
              <button 
                onClick={() => handleDecision('RECHAZADO')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                <MdCancel size={18} />
                Rechazar
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
