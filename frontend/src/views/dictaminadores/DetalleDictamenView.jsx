import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDescription, MdQuiz, MdCheckCircle, MdCancel, MdAssignment, MdComment, MdClose, MdFileDownload } from 'react-icons/md';

export default function DetalleDictamenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Datos de ejemplo
  const ponencia = {
    id: id || "ART-9920",
    titulo: "Impacto de la Inteligencia Artificial en la Educación Superior 2026",
    resumen: "Este trabajo explora cómo las herramientas de IA generativa están transformando los procesos de enseñanza-aprendizaje en las universidades de América Latina. Se analizan casos de estudio en México, Colombia y Argentina, destacando los retos éticos y las oportunidades de personalización educativa que estas tecnologías ofrecen al cuerpo docente y estudiantil.",
    preguntas: [
      { id: 1, texto: "¿El resumen cumple con la extensión requerida?" },
      { id: 2, texto: "¿Los autores están correctamente adscritos?" },
      { id: 3, texto: "¿El tema es pertinente para el congreso?" },
      { id: 4, texto: "¿La bibliografía sigue el formato APA 7?" },
      { id: 5, texto: "¿Se adjuntaron todos los archivos necesarios?" }
    ]
  };

  const [respuestas, setRespuestas] = useState({});
  const [comentariosCriterios, setComentariosCriterios] = useState({});
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const handleRadioChange = (preguntaId, valor) => {
    setRespuestas(prev => {
      if (prev[preguntaId] === valor) {
        const newState = { ...prev };
        delete newState[preguntaId];
        return newState;
      }
      return { ...prev, [preguntaId]: valor };
    });
  };

  const clearRespuesta = (id) => {
    setRespuestas(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const toggleComentarioCriterio = (id) => {
    const hasContent = comentariosCriterios[id] && comentariosCriterios[id].trim().length > 0;
    if (comentariosCriterios[id] !== undefined && hasContent) {
      setConfirmingRemoval(id);
      return;
    }
    forceToggleComentario(id);
  };

  const forceToggleComentario = (id) => {
    setComentariosCriterios(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? '' : undefined
    }));
    setConfirmingRemoval(null);
  };

  const handleComentarioChange = (id, value) => {
    setComentariosCriterios(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const autoResize = (e) => {
    const element = e.target;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const calcularProgreso = () => {
    const total = ponencia.preguntas.length;
    const respondidas = Object.keys(respuestas).length;
    const si = Object.values(respuestas).filter(v => v === 'Si').length;
    return {
      porcentaje: (respondidas / total) * 100,
      cumplimiento: (si / total) * 100,
      respondidas,
      total,
      si
    };
  };

  const progreso = calcularProgreso();

  const handleDecision = (decision) => {
    if (progreso.respondidas < progreso.total) {
      setShowErrors(true);
      const primeraFaltante = ponencia.preguntas.find(p => !respuestas[p.id]);
      if (primeraFaltante) {
        const element = document.getElementById(`pregunta-${primeraFaltante.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
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

      <div className="flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#148f96] uppercase tracking-widest">Evaluación de Formato</span>
            <h1 className="text-3xl font-bold text-slate-800 mt-1">{ponencia.titulo}</h1>
            <p className="text-sm text-gray-400 font-mono mt-1">ID: {ponencia.id}</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Información de la Ponencia (Siempre visible) */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b pb-3">
              <MdDescription size={22} className="text-[#148f96]" />
              <span>Información de la Ponencia</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Resumen</label>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 italic text-slate-600 text-sm leading-relaxed">
                  "{ponencia.resumen}"
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b pb-2">
              <MdAssignment size={22} className="text-[#148f96]" />
              <span>Criterios de Formato</span>
            </div>

            <div className="space-y-8">
              {ponencia.preguntas.map((p) => (
                <div 
                  key={p.id} 
                  id={`pregunta-${p.id}`}
                  className={`p-4 rounded-xl transition-all border ${
                    showErrors && !respuestas[p.id] 
                    ? 'border-red-400' 
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-slate-700">{p.id}. {p.texto}</p>
                        {showErrors && !respuestas[p.id] && (
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full border border-red-100">
                            ¡Falta responder!
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleComentarioCriterio(p.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          comentariosCriterios[p.id] !== undefined 
                          ? 'bg-teal-50 border-teal-200 text-[#148f96]' 
                          : 'border-gray-200 text-gray-400 hover:border-[#148f96] hover:text-[#148f96]'
                        }`}
                      >
                        {comentariosCriterios[p.id] !== undefined ? 'Quitar Comentario' : '+ Comentario'}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 relative">
                          {['Si', 'No'].map((opcion) => (
                            <button
                              key={opcion}
                              onClick={() => {
                                handleRadioChange(p.id, opcion);
                                if (showErrors && Object.keys(respuestas).length + 1 === progreso.total) {
                                  setShowErrors(false);
                                }
                              }}
                              className={`w-16 h-10 flex items-center justify-center rounded-lg border-2 text-xs font-bold transition-all ${
                                respuestas[p.id] === opcion
                                  ? opcion === 'Si' 
                                    ? 'bg-[#148f96] border-[#148f96] text-white' 
                                    : 'bg-red-500 border-red-500 text-white'
                                  : 'border-gray-100 text-slate-400 hover:border-[#148f96] hover:text-[#148f96]'
                              }`}
                            >
                              {opcion.toUpperCase()}
                            </button>
                          ))}
                          
                          {respuestas[p.id] && (
                            <button 
                              onClick={() => clearRespuesta(p.id)}
                              className="ml-1 p-1 text-slate-300 hover:text-red-400 transition-colors"
                              title="Limpiar selección"
                            >
                              <MdClose size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {confirmingRemoval === p.id && (
                    <div className="mt-4 pt-4 border-t border-teal-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Deseas descartar el comentario?</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setConfirmingRemoval(null)} className="px-6 py-2 text-[10px] font-bold text-[#148f96] border border-[#148f96] rounded-lg uppercase w-28">Mantener</button>
                          <button onClick={() => forceToggleComentario(p.id)} className="px-6 py-2 text-[10px] font-bold text-red-500 border border-red-500 rounded-lg uppercase w-28">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {comentariosCriterios[p.id] !== undefined && confirmingRemoval !== p.id && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <textarea
                        value={comentariosCriterios[p.id]}
                        onChange={(e) => handleComentarioChange(p.id, e.target.value)}
                        onInput={autoResize}
                        placeholder={`Observación sobre: ${p.texto}...`}
                        className="w-full min-h-[5rem] p-4 bg-white border-2 border-teal-100 rounded-xl outline-none focus:border-[#148f96] transition-all text-sm resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <section className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Cumplimiento</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                  <circle
                    className="text-[#148f96] transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * progreso.cumplimiento) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute flex flex-col">
                  <span className="text-4xl font-black text-slate-800">{progreso.si}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">/ {progreso.total} SI</span>
                </div>
              </div>
              <p className="mt-6 text-xs font-bold text-slate-500">
                {progreso.respondidas} de {progreso.total} criterios evaluados
              </p>
            </section>

            <section className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b pb-2">
                <MdComment size={22} className="text-[#148f96]" />
                <span>Observaciones Finales</span>
              </div>
              <textarea 
                value={comentariosGenerales}
                onChange={(e) => setComentariosGenerales(e.target.value)}
                onInput={autoResize}
                placeholder="Escriba aquí sus observaciones finales sobre el formato de la ponencia..."
                className="w-full min-h-[8rem] p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#148f96] outline-none transition-all text-sm resize-none"
              ></textarea>
            </section>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              onClick={() => handleDecision('ACEPTADO')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <MdCheckCircle size={20} />
              Aceptar Formato
            </button>
            <button 
              onClick={() => handleDecision('SOLICITUD DE CAMBIOS')}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-100 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <MdAssignment size={20} />
              Solicitar Cambios
            </button>
            <button 
              onClick={() => handleDecision('RECHAZADO')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <MdCancel size={20} />
              Rechazar Formato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
