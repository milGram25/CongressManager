import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPonenciasPonenteApi, buildMediaUrl, actualizarEnlacePonenciaApi } from '../../api/ponenciasApi';
import { getPagosResumenApi } from '../../api/pagosApi';
import { MdWarningAmber } from 'react-icons/md';

const ESTADO_CONFIG = {
  pendiente_dictaminacion: { label: 'En espera de dictamen', border: 'border-l-gray-400', dot: 'bg-gray-400', text: 'text-gray-500' },
  resumen_rechazado: { label: 'Resumen rechazado', border: 'border-l-error', dot: 'bg-error', text: 'text-error' },
  pendiente_extenso: { label: 'Resumen aceptado — sube tu extenso', border: 'border-l-primary', dot: 'bg-primary', text: 'text-primary' },
  en_revision: { label: 'En revisión', border: 'border-l-warning', dot: 'bg-warning', text: 'text-warning' },
  con_modificaciones: { label: 'Con modificaciones', border: 'border-l-warning', dot: 'bg-warning', text: 'text-warning' },
  extenso_aceptado: { label: '¡Ponencia aceptada!', border: 'border-l-success', dot: 'bg-success', text: 'text-success' },
  extenso_rechazado: { label: 'Ponencia rechazada', border: 'border-l-error', dot: 'bg-error', text: 'text-error' },
};

function EnlaceMultimediaForm({ ponencia }) {
  const accessToken = localStorage.getItem('congress_access');
  const [enlace, setEnlace] = useState(ponencia.enlace_multimedia ?? '');
  const [saved, setSaved] = useState(!!ponencia.enlace_multimedia);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleGuardar = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await actualizarEnlacePonenciaApi(accessToken, ponencia.id_ponencia, enlace);
      setSaved(true);
      setMsg({ ok: true, text: 'Enlace guardado correctamente.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border-t border-success/20 pt-4">
      <p className="text-xs font-bold tracking-widest text-slate-500 mb-2">Enlace / ruta a multimedia</p>
      {!saved && (
        <p className="text-xs text-slate-400 mb-3">Agrega el enlace a tu presentación, video u otro recurso multimedia que se mostrará en el evento.</p>
      )}
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="url"
          className="input input-bordered input-sm flex-1 rounded-lg min-w-0"
          placeholder="https://..."
          value={enlace}
          onChange={e => { setEnlace(e.target.value); setSaved(false); }}
        />
        <button
          className="btn btn-sm btn-success rounded-lg"
          disabled={saving}
          onClick={handleGuardar}
        >
          {saving ? 'Guardando...' : saved ? 'Modificar' : 'Guardar'}
        </button>
      </div>
      {msg && (
        <p className={`text-xs mt-2 font-medium ${msg.ok ? 'text-success' : 'text-error'}`}>{msg.text}</p>
      )}
    </div>
  );
}

function PonenciaCard({ ponencia, requiresPayment }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const config = ESTADO_CONFIG[ponencia.estado] ?? { label: ponencia.estado, border: 'border-l-gray-400', dot: 'bg-gray-400', text: 'text-gray-500' };
  const tieneFeedback = ponencia.retroalimentacion || ponencia.criterio_comentarios?.length > 0;

  return (
    <div className={`flex flex-col bg-white p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border} relative overflow-hidden`}>
      {requiresPayment && (
        <div className="absolute top-0 right-0 bg-warning/20 px-3 py-1 rounded-bl-xl flex items-center gap-1.5 border-b border-l border-warning/30">
          <MdWarningAmber className="text-warning text-sm" />
          <span className="text-[9px] font-black text-warning-content tracking-tighter">Pendiente de pago</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className={`text-[10px] font-bold tracking-widest ${config.text}`}>{config.label}</span>
          <h3 className="text-lg font-semibold text-slate-700 leading-tight mb-1 truncate">{ponencia.titulo}</h3>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-400 font-bold tracking-tighter">ID: {ponencia.id_ponencia}</p>
            <span className="text-[10px] text-slate-300 font-medium italic">— {ponencia.evento?.congreso || ponencia.congreso || 'Congreso'}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-wrap gap-2">
          {ponencia.estado === 'pendiente_extenso' && (
            <>
              {ponencia.ruta_formato && (
                <a
                  href={buildMediaUrl(ponencia.ruta_formato)}
                  download
                  className="btn btn-outline btn-sm rounded-lg gap-1"
                >
                  Descargar formato
                </a>
              )}
              <button className="btn btn-primary btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_resumen}`)}>
                Subir extenso
              </button>
            </>
          )}
          {ponencia.estado === 'con_modificaciones' && (
            <>
              {tieneFeedback && (
                <button className="btn btn-outline btn-sm rounded-lg" onClick={() => setShowModal(true)}>
                  Ver retroalimentación
                </button>
              )}
              <button className="btn btn-warning btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_resumen}?correccion=true`)}>
                Subir corrección
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

      {ponencia.estado === 'extenso_aceptado' && ponencia.publicado && (
        <EnlaceMultimediaForm ponencia={ponencia} />
      )}

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            {ponencia.estado === 'con_modificaciones' ? (
              <>
                <h3 className="font-bold text-lg text-warning mb-3">Retroalimentación del revisor</h3>
                {ponencia.retroalimentacion && (
                  <div className="mb-4">
                    <p className="text-xs font-bold tracking-wider text-slate-500 mb-1">Comentario general</p>
                    <p className="text-sm text-slate-700 italic">"{ponencia.retroalimentacion}"</p>
                  </div>
                )}
                {ponencia.criterio_comentarios?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold tracking-wider text-slate-500 mb-2">Comentarios por criterio</p>
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
  const [congressPayments, setCongressPayments] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMisPonenciasPonenteApi(accessToken);
        setPonencias(data);

        // Cargar info de pagos para cada congreso único
        const uniqueCongresses = [...new Set(data.map(p => p.id_congreso || p.evento?.id_congreso))].filter(Boolean);
        const payments = {};
        for (const cid of uniqueCongresses) {
          try {
            const summ = await getPagosResumenApi(accessToken, cid);
            payments[cid] = summ.user_payment;
          } catch (e) {
            console.error("Error loading payment for congress", cid, e);
          }
        }
        setCongressPayments(payments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  // Lógica para determinar si una ponencia está cubierta por el pago
  const isPonenciaCovered = (ponencia, allPonencias) => {
    const cid = ponencia.id_congreso || ponencia.evento?.id_congreso;
    const payment = congressPayments[cid];
    if (!payment) return true; // Si no hay info, no alarmar

    const congressPonencias = allPonencias
      .filter(p => (p.id_congreso || p.evento?.id_congreso) === cid)
      .sort((a, b) => a.id_ponencia - b.id_ponencia); // Ordenar por ID para consistencia

    const index = congressPonencias.findIndex(p => p.id_ponencia === ponencia.id_ponencia);
    const coverage = payment.paid_slots * 2; // Cada slot cubre 2 ponencias

    return index < coverage;
  };

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
      <h1 className="text-3xl font-bold mb-2">Estatus de ponencias</h1>
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
        ponencias.map(p => (
          <PonenciaCard
            key={p.id_ponencia}
            ponencia={p}
            requiresPayment={!isPonenciaCovered(p, ponencias)}
          />
        ))
      )}
    </div>
  );
}
