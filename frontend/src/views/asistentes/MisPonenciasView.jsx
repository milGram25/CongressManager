import { useEffect, useState } from 'react';
import { getMisPonenciasPonenteApi } from '../../api/ponenciasApi';

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MisPonenciasView() {
  const accessToken = localStorage.getItem('congress_access');
  const [ponencias, setPonencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    getMisPonenciasPonenteApi(accessToken)
      .then(data => setPonencias(data.filter(p => p.estado === 'extenso_aceptado')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <div className="p-8 bg-base-100 min-h-full relative">
      <h1 className="text-4xl font-bold text-neutral mb-2">Mis ponencias</h1>
      <p className="text-sm text-slate-500 mb-8">Ponencias aceptadas para presentar en congreso.</p>

      {ponencias.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">
          Aún no tienes ponencias aceptadas.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {ponencias.map(p => (
            <div key={p.id_ponencia} className="card bg-base-100 border border-base-300 p-8 max-w-2xl w-full relative shadow-sm hover:shadow-md transition-all">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold italic">"{p.titulo}"</h3>
                <p className="font-bold text-sm">Congreso: <span className="font-normal">{p.evento?.congreso ?? '—'}</span></p>

                <div className="flex flex-wrap justify-center gap-6 py-3 border-y border-base-200 my-2">
                  <p className="font-bold text-sm">Inicio: <span className="font-normal">{formatFecha(p.evento?.fecha_inicio)}</span></p>
                  <p className="font-bold text-sm">Fin: <span className="font-normal">{formatFecha(p.evento?.fecha_fin)}</span></p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <p className="font-bold">Modalidad: <span className="font-normal capitalize">{p.tipo_participacion || '—'}</span></p>
                  {p.tipo_participacion === 'presencial' ? (
                    <p className="font-bold">Lugar: <span className="font-normal">{p.evento?.lugar || 'Por definir'}</span></p>
                  ) : p.evento?.enlace ? (
                    <p className="font-bold">Enlace: <a href={p.evento.enlace} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-normal">Ver enlace</a></p>
                  ) : null}
                </div>

                {p.evento?.sinopsis && (
                  <div className="mt-3 text-sm text-neutral/80 line-clamp-2 text-justify px-4">
                    {p.evento.sinopsis}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end w-full">
                <button
                  onClick={() => setSeleccionada(p)}
                  className="btn btn-primary btn-sm px-6 rounded-full shadow-sm"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-box relative shadow-2xl p-10 flex flex-col items-center">
            <button
              onClick={() => setSeleccionada(null)}
              className="absolute top-6 left-6 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all"
            >
              <span className="text-white text-4xl font-black leading-none -mt-1 select-none">←</span>
            </button>

            <div className="text-center space-y-4 mt-6 w-full">
              <h2 className="font-bold text-lg text-primary uppercase tracking-wide">Título:</h2>
              <p className="italic font-medium text-xl">"{seleccionada.titulo}"</p>

              <p className="font-bold text-sm">Congreso: <span className="font-normal">{seleccionada.evento?.congreso ?? '—'}</span></p>

              <div className="flex flex-wrap justify-center gap-8 py-3 border-y border-base-200 w-full my-4">
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Inicio</p>
                  <p className="text-sm">{formatFecha(seleccionada.evento?.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Fin</p>
                  <p className="text-sm">{formatFecha(seleccionada.evento?.fecha_fin)}</p>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Modalidad</p>
                  <p className="text-sm capitalize">{seleccionada.tipo_participacion || '—'}</p>
                </div>
                {seleccionada.tipo_participacion === 'presencial' ? (
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Lugar</p>
                    <p className="text-sm">{seleccionada.evento?.lugar || 'Por definir'}</p>
                  </div>
                ) : seleccionada.evento?.enlace ? (
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500">Enlace</p>
                    <a href={seleccionada.evento.enlace} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      Abrir enlace
                    </a>
                  </div>
                ) : null}
              </div>

              {seleccionada.evento?.sinopsis && (
                <div className="pt-2 text-justify w-full">
                  <p className="font-bold text-center mb-2 text-sm">Sinopsis</p>
                  <p className="leading-relaxed text-neutral text-sm">{seleccionada.evento.sinopsis}</p>
                </div>
              )}

              {/* Removido el boton duplicado de enlace ya que se agregó arriba */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
