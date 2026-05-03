import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPonenciasPonenteApi } from '../../api/ponenciasApi';

const ESTADO_CONFIG = {
  pendiente_dictaminacion: { label: 'En espera de dictamen', border: 'border-l-gray-400', dot: 'bg-gray-400', text: 'text-gray-500' },
  resumen_rechazado:       { label: 'Resumen rechazado',    border: 'border-l-error',   dot: 'bg-error',   text: 'text-error' },
  pendiente_extenso:       { label: 'Resumen aceptado — sube tu extenso', border: 'border-l-primary', dot: 'bg-primary', text: 'text-primary' },
  en_revision:             { label: 'En revisión',          border: 'border-l-warning', dot: 'bg-warning', text: 'text-warning' },
  con_modificaciones:      { label: 'Con modificaciones',   border: 'border-l-warning', dot: 'bg-warning', text: 'text-warning' },
  extenso_aceptado:        { label: '¡Ponencia aceptada!',  border: 'border-l-success', dot: 'bg-success', text: 'text-success' },
  extenso_rechazado:       { label: 'Ponencia rechazada',   border: 'border-l-error',   dot: 'bg-error',   text: 'text-error' },
};

function PonenciaCard({ ponencia }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const config = ESTADO_CONFIG[ponencia.estado] ?? { label: ponencia.estado, border: 'border-l-gray-400', dot: 'bg-gray-400', text: 'text-gray-500' };
  const tieneFeedback = ponencia.retroalimentacion || ponencia.criterio_comentarios?.length > 0;

  return (
    <div className={`flex flex-col bg-white p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>{config.label}</span>
          <h3 className="text-lg font-semibold text-slate-700 leading-tight mb-1 truncate">{ponencia.titulo}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">ID: {ponencia.id_ponencia}</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {ponencia.estado === 'pendiente_extenso' && (
            <button className="btn btn-primary btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_resumen}`)}>
              Subir Extenso
            </button>
          )}
          {ponencia.estado === 'con_modificaciones' && (
            <>
              {tieneFeedback && (
                <button className="btn btn-outline btn-sm rounded-lg" onClick={() => setShowModal(true)}>
                  Ver retroalimentación
                </button>
              )}
              <button className="btn btn-warning btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_resumen}?correccion=true`)}>
                Subir Corrección
              </button>
            </>
          )}
          {(ponencia.estado === 'resumen_rechazado' || ponencia.estado === 'extenso_rechazado') && (
            <button className="btn btn-error btn-outline btn-sm rounded-lg" onClick={() => setShowModal(true)}>
              Ver motivo
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            {ponencia.estado === 'con_modificaciones' ? (
              <>
                <h3 className="font-bold text-lg text-warning mb-3">Retroalimentación del revisor</h3>
                {ponencia.retroalimentacion && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Comentario general</p>
                    <p className="text-sm text-slate-700 italic">"{ponencia.retroalimentacion}"</p>
                  </div>
                )}
                {ponencia.criterio_comentarios?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Comentarios por criterio</p>
                    <ul className="space-y-2">
                      {ponencia.criterio_comentarios.map((c, i) => (
                        <li key={i} className="border-l-2 border-warning/40 pl-3">
                          <p className="text-xs font-semibold text-slate-700">{c.criterio}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.comentario}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg text-error">Motivo de rechazo</h3>
                <p className="py-4 text-sm text-slate-700">{ponencia.retroalimentacion || 'Sin retroalimentación registrada.'}</p>
              </>
            )}
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EstatusPonenciaView() {
  const accessToken = localStorage.getItem('congress_access');
  const [ponencias, setPonencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMisPonenciasPonenteApi(accessToken)
      .then(setPonencias)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (error) return (
    <div className="p-8">
      <p className="text-error text-sm">Error al cargar estatus: {error}</p>
    </div>
  );

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Estatus de Ponencias</h1>
      <p className="text-sm text-slate-500 mb-6">Sigue el progreso de tus ponencias enviadas.</p>

      <div className="flex flex-row flex-wrap gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm">
        {Object.entries(ESTADO_CONFIG).map(([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${cfg.dot}`}></span>
            <p className="text-xs text-slate-600">{cfg.label}</p>
          </div>
        ))}
      </div>

      {ponencias.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No tienes ponencias registradas.</p>
      ) : (
        ponencias.map(p => <PonenciaCard key={p.id_ponencia} ponencia={p} />)
      )}
    </div>
  );
}
