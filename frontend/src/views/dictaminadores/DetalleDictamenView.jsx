import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDescription, MdQuiz, MdCheckCircle, MdCancel, MdAssignment, MdComment, MdClose, MdFileDownload } from 'react-icons/md';
import EvaluationSuccessModal from '../../components/EvaluationSuccessModal';

export default function DetalleDictamenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ESTADO PARA LAS PREGUNTAS VARIABLES - Se carga de localStorage
  const [preguntas, setPreguntas] = useState(() => {
    // Cargamos la configuración del Administrador para el ID 1 (Avances de tesis)
    const savedData = localStorage.getItem('config_dictamen_1');
    if (savedData) {
      const savedPreguntas = JSON.parse(savedData);
      if (savedPreguntas && savedPreguntas.length > 0) {
        return savedPreguntas;
      }
    }
    // Fallback
    return [
      { id: 1, texto: "¿El resumen cumple con la extensión requerida?" },
      { id: 2, texto: "¿Los autores están correctamente adscritos?" },
      { id: 3, texto: "¿El tema es pertinente para el congreso?" },
      { id: 4, texto: "¿La bibliografía sigue el formato APA 7?" },
      { id: 5, texto: "¿Se adjuntaron todos los archivos necesarios?" }
    ];
  });

  // Datos de ejemplo
  const ponencia = {
    id: id || "ART-9920",
    titulo: "Impacto de la Inteligencia Artificial en la Educación Superior 2026",
    resumen: "Este trabajo explora cómo las herramientas de IA generativa están transformando los procesos de enseñanza-aprendizaje en las universidades de América Latina. Se analizan casos de estudio en México, Colombia y Argentina, destacando los retos éticos y las oportunidades de personalización educativa que estas tecnologías ofrecen al cuerpo docente y estudiantil.",
  };

  const [respuestas, setRespuestas] = useState({});
  const [comentariosCriterios, setComentariosCriterios] = useState({});
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');

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
    const total = preguntas.length;
    const respondidas = Object.keys(respuestas).length;
    const si = Object.values(respuestas).filter(v => v === 'Si').length;
    return {
      porcentaje: total > 0 ? (respondidas / total) * 100 : 0,
      cumplimiento: total > 0 ? (si / total) * 100 : 0,
      respondidas,
      total,
      si
    };
  };

  const progreso = calcularProgreso();

  const handleDecision = (decision) => {
    if (progreso.respondidas < progreso.total) {
      setShowErrors(true);
      const primeraFaltante = preguntas.find(p => !respuestas[p.id]);
      if (primeraFaltante) {
        const element = document.getElementById(`pregunta-${primeraFaltante.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    setFinalDecision(decision);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/dictaminador/dictamenes');
  };

  return (
    <div className="space-y-8 pb-20">
      <EvaluationSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseModal} 
        decision={finalDecision} 
        type="dictamen" 
      />

      <div className="flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Evaluación de Formato</span>
            <h1 className="text-3xl font-bold text-base-content mt-1">{ponencia.titulo}</h1>
            <p className="text-sm text-base-content/40 font-mono mt-1">ID: {ponencia.id}</p>
          </div>
        </header>

        <div className="space-y-6">
          <section className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
            <div className="flex items-center gap-2 mb-6 text-base-content font-bold border-b border-base-300 pb-3">
              <MdDescription size={22} className="text-primary" />
              <span>Información de la Ponencia</span>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block mb-2">Resumen</label>
                <div className="bg-base-200 p-5 rounded-2xl border border-base-300 italic text-base-content/80 text-sm leading-relaxed">
                  "{ponencia.resumen}"
                </div>
              </div>
            </div>
          </section>

          <section className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
            <div className="flex items-center gap-2 mb-6 text-base-content font-bold border-b border-base-300 pb-2">
              <MdAssignment size={22} className="text-primary" />
              <span>Criterios de Formato</span>
            </div>

            <div className="space-y-8">
              {preguntas.map((p, index) => (
                <div 
                  key={p.id} 
                  id={`pregunta-${p.id}`}
                  className={`p-4 rounded-xl transition-all border ${
                    showErrors && !respuestas[p.id] 
                    ? 'border-error/50' 
                    : 'hover:bg-base-200 border-transparent hover:border-base-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-base-content">{index + 1}. {p.texto}</p>
                        {showErrors && !respuestas[p.id] && (
                          <span className="text-[10px] font-black text-error uppercase tracking-tighter bg-base-100 px-2 py-0.5 rounded-full border border-error/20">
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
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'border-base-300 text-base-content/40 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {comentariosCriterios[p.id] !== undefined ? 'Quitar Comentario' : '+ Comentario'}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
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
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-error border-error text-white'
                                  : 'border-base-200 text-base-content/40 hover:border-primary hover:text-primary'
                              }`}
                            >
                              {opcion.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {confirmingRemoval === p.id && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider">¿Deseas descartar el comentario?</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setConfirmingRemoval(null)} className="px-6 py-2 text-[10px] font-bold text-primary border border-primary rounded-lg uppercase w-28">Mantener</button>
                          <button onClick={() => forceToggleComentario(p.id)} className="px-6 py-2 text-[10px] font-bold text-error border border-error rounded-lg uppercase w-28">Eliminar</button>
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
                        className="w-full min-h-[5rem] p-4 bg-base-100 border-2 border-primary/10 rounded-xl outline-none focus:border-primary transition-all text-sm resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <section className="lg:col-span-1 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em] mb-4">Cumplimiento</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-base-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
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
                  <span className="text-4xl font-black text-base-content">{progreso.si}</span>
                  <span className="text-[10px] font-bold text-base-content/40 uppercase">/ {progreso.total} SI</span>
                </div>
              </div>
              <p className="mt-6 text-xs font-bold text-base-content/60">
                {progreso.respondidas} de {progreso.total} criterios evaluados
              </p>
            </section>

            <section className="lg:col-span-3 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
              <div className="flex items-center gap-2 mb-4 text-base-content font-bold border-b border-base-300 pb-2">
                <MdComment size={22} className="text-primary" />
                <span>Observaciones Finales</span>
              </div>
              <textarea 
                value={comentariosGenerales}
                onChange={(e) => setComentariosGenerales(e.target.value)}
                onInput={autoResize}
                placeholder="Escriba aquí sus observaciones finales sobre el formato de la ponencia..."
                className="w-full min-h-[8rem] p-4 bg-base-200 rounded-2xl border-none focus:bg-base-100 focus:ring-2 focus:ring-primary outline-none transition-all text-sm resize-none"
              ></textarea>
            </section>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              onClick={() => handleDecision('ACEPTADO')}
              className="flex-1 bg-success hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-success/20 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <MdCheckCircle size={20} />
              Aceptar Formato
            </button>
            <button 
              onClick={() => handleDecision('SOLICITUD DE CAMBIOS')}
              className="flex-1 bg-warning hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-warning/20 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <MdAssignment size={20} />
              Solicitar Cambios
            </button>
            <button 
              onClick={() => handleDecision('RECHAZADO')}
              className="flex-1 bg-error hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-error/20 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
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
