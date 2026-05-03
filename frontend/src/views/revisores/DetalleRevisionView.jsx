import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdAssignment, MdComment } from 'react-icons/md';
import EvaluationSuccessModal from '../../components/EvaluationSuccessModal';
import { getRubricaExtenso, enviarEvaluacionApi } from '../../api/ponenciasApi';

export default function DetalleRevisionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('congress_access');

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState({});
  const [comentariosCriterios, setComentariosCriterios] = useState({});
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRubricaExtenso(accessToken, id)
      .then(setGrupos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const criterios = grupos.flatMap(g => g.criterios);

  const handleCalificacion = (idCriterio, valor) => {
    setCalificaciones(prev => prev[idCriterio] === valor ? (({ [idCriterio]: _, ...rest }) => rest)(prev) : { ...prev, [idCriterio]: valor });
    if (showErrors) setShowErrors(false);
  };

  const toggleComentario = (idCriterio) => {
    setComentariosCriterios(prev => ({ ...prev, [idCriterio]: prev[idCriterio] === undefined ? '' : undefined }));
  };

  const calcularPromedio = () => {
    if (criterios.length === 0) return '0.0';
    let suma = 0, pesoTotal = 0;
    criterios.forEach(c => {
      pesoTotal += c.peso;
      if (calificaciones[c.id_criterio]) suma += (calificaciones[c.id_criterio] / 5) * c.peso;
    });
    return pesoTotal === 0 ? '0.0' : ((suma / pesoTotal) * 10).toFixed(1);
  };

  const promedio = calcularPromedio();
  const porcentaje = (parseFloat(promedio) / 10) * 100;
  const totalEvaluados = Object.keys(calificaciones).length;

  const ESTATUS_MAP = {
    'ACEPTADO': 'aceptado',
    'CAMBIOS MENORES': 'aceptado con ligeras modificaciones',
    'CAMBIOS MAYORES': 'aceptado con modificaciones mayores',
    'RECHAZADO': 'rechazado',
  };

  const handleAction = async (decision) => {
    if (totalEvaluados < criterios.length) {
      setShowErrors(true);
      const primero = criterios.find(c => !calificaciones[c.id_criterio]);
      if (primero) document.getElementById(`criterio-${primero.id_criterio}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      await enviarEvaluacionApi(accessToken, id, {
        estatus: ESTATUS_MAP[decision] ?? 'aceptado',
        retroalimentacion_general: retroalimentacion,
        criterios: criterios.map(c => ({
          id_criterio: c.id_criterio,
          puntaje: calificaciones[c.id_criterio] ?? 0,
          comentario: comentariosCriterios[c.id_criterio] ?? '',
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
      <EvaluationSuccessModal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); navigate('/revisor/revisiones'); }} decision={finalDecision} type="revision" />

      <header>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Detalle de Revisión</span>
        <h1 className="text-3xl font-bold text-base-content mt-1">Extenso #{id}</h1>
      </header>

      <section className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-6 font-bold border-b border-base-300 pb-2">
          <MdAssignment size={22} />
          <span>Rúbrica de Evaluación</span>
        </div>
        {grupos.length === 0 ? (
          <p className="text-sm text-base-content/40 italic">No hay rúbrica configurada para este tipo de trabajo.</p>
        ) : (
          <div className="space-y-12">
            {grupos.map(grupo => (
              <div key={grupo.id_grupo} className="space-y-4">
                <div className="flex items-center gap-3 bg-base-200/50 p-3 rounded-xl border border-base-300">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h4 className="font-bold text-sm text-primary uppercase tracking-wider">{grupo.nombre_grupo}</h4>
                </div>
                <div className="space-y-6 pl-4">
                  {grupo.criterios.map(criterio => (
                    <div
                      key={criterio.id_criterio}
                      id={`criterio-${criterio.id_criterio}`}
                      className={`p-4 rounded-xl transition-all border ${showErrors && !calificaciones[criterio.id_criterio] ? 'border-error/50' : 'hover:bg-base-200 border-transparent hover:border-base-300'}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="max-w-xl">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-sm font-bold text-base-content">{criterio.descripcion}</p>
                            {showErrors && !calificaciones[criterio.id_criterio] && (
                              <span className="text-[10px] font-black text-error uppercase tracking-tighter bg-base-100 px-2 py-0.5 rounded-full border border-error/20">¡Falta responder!</span>
                            )}
                          </div>
                          <p className="text-[10px] text-base-content/40 uppercase font-bold tracking-widest">Peso: {(criterio.peso * 100).toFixed(0)}%</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleComentario(criterio.id_criterio)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${comentariosCriterios[criterio.id_criterio] !== undefined ? 'bg-primary/10 border-primary/20 text-primary' : 'border-base-300 text-base-content/40 hover:border-primary hover:text-primary'}`}
                          >
                            {comentariosCriterios[criterio.id_criterio] !== undefined ? 'Quitar comentario' : '+ Comentario'}
                          </button>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(v => (
                              <div
                                key={v}
                                onClick={() => handleCalificacion(criterio.id_criterio, v)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${calificaciones[criterio.id_criterio] === v ? 'bg-primary border-primary text-white' : 'border-base-200 text-base-content/40 hover:border-primary hover:text-primary'}`}
                              >
                                {v}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {comentariosCriterios[criterio.id_criterio] !== undefined && (
                        <div className="mt-4">
                          <textarea
                            value={comentariosCriterios[criterio.id_criterio]}
                            onChange={e => setComentariosCriterios(prev => ({ ...prev, [criterio.id_criterio]: e.target.value }))}
                            placeholder={`Observación sobre: ${criterio.descripcion}...`}
                            className="w-full min-h-[5rem] p-4 bg-base-100 border-2 border-primary/10 rounded-xl outline-none focus:border-primary transition-all text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <section className="lg:col-span-1 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em] mb-4">Promedio</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-base-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
              <circle className="text-primary transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * porcentaje) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
            </svg>
            <div className="absolute flex flex-col">
              <span className="text-4xl font-black text-base-content">{promedio}</span>
              <span className="text-[10px] font-bold text-base-content/40 uppercase">/ 10.0</span>
            </div>
          </div>
          <p className="mt-6 text-xs font-bold text-base-content/60">{totalEvaluados} de {criterios.length} evaluados</p>
        </section>

        <section className="lg:col-span-3 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
          <div className="flex items-center gap-2 mb-4 font-bold border-b border-base-300 pb-2">
            <MdComment size={22} />
            <span>Retroalimentación general</span>
          </div>
          <textarea
            value={retroalimentacion}
            onChange={e => setRetroalimentacion(e.target.value)}
            placeholder="Observaciones generales para los autores..."
            className="w-full min-h-[10rem] p-4 bg-base-200 rounded-2xl border-none focus:bg-base-100 focus:ring-2 focus:ring-primary outline-none transition-all text-sm resize-none"
          />
        </section>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        {[
          { label: 'Aceptar', decision: 'ACEPTADO', cls: 'bg-success shadow-success/20' },
          { label: 'Cambios menores', decision: 'CAMBIOS MENORES', cls: 'bg-warning shadow-warning/20' },
          { label: 'Cambios mayores', decision: 'CAMBIOS MAYORES', cls: 'bg-orange-500 shadow-orange-500/20' },
          { label: 'Rechazar', decision: 'RECHAZADO', cls: 'bg-error shadow-error/20' },
        ].map(({ label, decision, cls }) => (
          <button
            key={decision}
            onClick={() => handleAction(decision)}
            disabled={submitting}
            className={`flex-1 ${cls} hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider text-sm disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
