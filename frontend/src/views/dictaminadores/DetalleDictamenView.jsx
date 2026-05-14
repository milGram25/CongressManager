import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDescription, MdAssignment, MdComment, MdCheckCircle, MdCancel } from 'react-icons/md';
import EvaluationSuccessModal from '../../components/EvaluationSuccessModal';
import { getPreguntasResumen, enviarDictamenApi } from '../../api/ponenciasApi';

export default function DetalleDictamenView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('congress_access');

  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState({});
  const [comentariosCriterios, setComentariosCriterios] = useState({});
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPreguntasResumen(accessToken, id)
      .then(setPreguntas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const handleRespuesta = (idPregunta, valor) => {
    setRespuestas(prev => prev[idPregunta] === valor ? (({ [idPregunta]: _, ...rest }) => rest)(prev) : { ...prev, [idPregunta]: valor });
    if (showErrors) setShowErrors(false);
  };

  const toggleComentario = (idPregunta) => {
    setComentariosCriterios(prev => ({ ...prev, [idPregunta]: prev[idPregunta] === undefined ? '' : undefined }));
  };

  const respondidas = Object.keys(respuestas).length;
  const siCount = Object.values(respuestas).filter(v => v === true).length;
  const cumplimiento = preguntas.length > 0 ? (siCount / preguntas.length) * 100 : 0;

  const handleDecision = async (decision) => {
    if (respondidas < preguntas.length) {
      setShowErrors(true);
      const primera = preguntas.find(p => respuestas[p.id_pregunta] === undefined);
      if (primera) document.getElementById(`pregunta-${primera.id_pregunta}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      await enviarDictamenApi(accessToken, id, {
        estatus: decision === 'ACEPTADO' ? 'aceptado' : 'rechazado',
        retroalimentacion_general: retroalimentacion,
        respuestas: preguntas.map(p => ({
          id_pregunta: p.id_pregunta,
          cumplio: respuestas[p.id_pregunta] ?? false,
          comentario: comentariosCriterios[p.id_pregunta] ?? '',
        })),
      });
      setFinalDecision(decision);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <EvaluationSuccessModal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); navigate('/dictaminador/dictamenes'); }} decision={finalDecision} type="dictamen" />

      <header>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Evaluación de formato</span>
        <h1 className="text-3xl font-bold text-base-content mt-1">Resumen #{id}</h1>
      </header>

      <section className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-6 font-bold border-b border-base-300 pb-2">
          <MdAssignment size={22} className="text-primary" />
          <span>Criterios de formato</span>
        </div>
        {preguntas.length === 0 ? (
          <p className="text-sm text-base-content/40 italic">No hay preguntas de dictamen configuradas.</p>
        ) : (
          <div className="space-y-8">
            {preguntas.map((p, index) => (
              <div
                key={p.id_pregunta}
                id={`pregunta-${p.id_pregunta}`}
                className={`p-4 rounded-xl transition-all border ${showErrors && respuestas[p.id_pregunta] === undefined ? 'border-error/50' : 'hover:bg-base-200 border-transparent hover:border-base-300'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-base-content">{index + 1}. {p.descripcion}</p>
                      {showErrors && respuestas[p.id_pregunta] === undefined && (
                        <span className="text-[10px] font-black text-error uppercase tracking-tighter bg-base-100 px-2 py-0.5 rounded-full border border-error/20">¡Falta responder!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleComentario(p.id_pregunta)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${comentariosCriterios[p.id_pregunta] !== undefined ? 'bg-primary/10 border-primary/20 text-primary' : 'border-base-300 text-base-content/40 hover:border-primary hover:text-primary'}`}
                    >
                      {comentariosCriterios[p.id_pregunta] !== undefined ? 'Quitar comentario' : '+ Comentario'}
                    </button>
                    <div className="flex gap-2">
                      {[{ label: 'SÍ', value: true }, { label: 'NO', value: false }].map(({ label, value }) => (
                        <button
                          key={label}
                          onClick={() => handleRespuesta(p.id_pregunta, value)}
                          className={`w-16 h-10 flex items-center justify-center rounded-lg border-2 text-xs font-bold transition-all ${
                            respuestas[p.id_pregunta] === value
                              ? value ? 'bg-primary border-primary text-white' : 'bg-error border-error text-white'
                              : 'border-base-200 text-base-content/40 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {comentariosCriterios[p.id_pregunta] !== undefined && (
                  <div className="mt-4">
                    <textarea
                      value={comentariosCriterios[p.id_pregunta]}
                      onChange={e => setComentariosCriterios(prev => ({ ...prev, [p.id_pregunta]: e.target.value }))}
                      placeholder={`Observación sobre: ${p.descripcion}...`}
                      className="w-full min-h-[5rem] p-4 bg-base-100 border-2 border-primary/10 rounded-xl outline-none focus:border-primary transition-all text-sm resize-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <section className="lg:col-span-1 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em] mb-4">Cumplimiento</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-base-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
              <circle className="text-primary transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * cumplimiento) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
            </svg>
            <div className="absolute flex flex-col">
              <span className="text-4xl font-black text-base-content">{siCount}</span>
              <span className="text-[10px] font-bold text-base-content/40 uppercase">/ {preguntas.length} SÍ</span>
            </div>
          </div>
          <p className="mt-6 text-xs font-bold text-base-content/60">{respondidas} de {preguntas.length} respondidas</p>
        </section>

        <section className="lg:col-span-3 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
          <div className="flex items-center gap-2 mb-4 font-bold border-b border-base-300 pb-2">
            <MdComment size={22} className="text-primary" />
            <span>Observaciones finales</span>
          </div>
          <textarea
            value={retroalimentacion}
            onChange={e => setRetroalimentacion(e.target.value)}
            placeholder="Observaciones finales sobre el resumen..."
            className="w-full min-h-[8rem] p-4 bg-base-200 rounded-2xl border-none focus:bg-base-100 focus:ring-2 focus:ring-primary outline-none transition-all text-sm resize-none"
          />
        </section>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <button onClick={() => handleDecision('ACEPTADO')} disabled={submitting} className="flex-1 bg-success hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-success/20 transition-all active:scale-95 uppercase tracking-wider text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          <MdCheckCircle size={20} /> Aceptar
        </button>
        <button onClick={() => handleDecision('RECHAZADO')} disabled={submitting} className="flex-1 bg-error hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-error/20 transition-all active:scale-95 uppercase tracking-wider text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          <MdCancel size={20} /> Rechazar
        </button>
      </div>
    </div>
  );
}
