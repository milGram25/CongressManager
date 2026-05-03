import { useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import ListaResumenes from "./Componentes/ListaResumenes";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getCongresosApi, getDictaminadoresDisponiblesApi } from "../../api/adminApi";
import { getResumenesCongreso, asignarDictaminadorApi } from "../../api/ponenciasApi";

// Componente del LED de estado
function LedStatus({ label, active, neutral = false }) {
  const color = neutral ? 'bg-gray-400' : active ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}

function ResumenDetailCard({ resumen, revisores, dictaminadoresDisponibles, onAsignar }) {
  if (!resumen) return (
    <div className="flex items-center justify-center h-64 rounded-[26px] border border-black/20 bg-white text-gray-400 italic text-sm">
      Selecciona un resumen para ver el detalle
    </div>
  );

  return (
    <article className="rounded-[26px] border border-black/55 bg-white shadow-sm overflow-hidden">
      <header className="bg-black px-6 py-4">
        <h3 className="text-white font-bold text-lg">{resumen.title}</h3>
        <p className="text-gray-400 text-sm">{resumen.autores?.join(', ') || 'Sin autores'}</p>
      </header>

      <div className="p-6 space-y-6">
        {/* LEDs de estado */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl">
          <LedStatus label="Revisor asignado" active={resumen.asignado} />
          <LedStatus label="Revisado" active={resumen.revisado} />
          <LedStatus label="Aceptado" active={resumen.aceptado} neutral={resumen.estatus == null} />
        </div>

        {/* Asignación de dictaminador */}
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Dictaminador asignado</h4>
          <div className="flex gap-2 items-center">
            <select
              className="select select-bordered select-sm flex-1 rounded-xl"
              value={resumen.id_dictaminador ?? ''}
              onChange={e => onAsignar(resumen.id_resumen, e.target.value ? Number(e.target.value) : null)}
            >
              {dictaminadoresDisponibles?.length === 0 ? (
                <option value="" disabled>No hay dictaminadores en este congreso</option>
              ) : (
                <>
                  <option value="">Sin asignar</option>
                  {dictaminadoresDisponibles.map(d => (
                    <option key={d.id_dictaminador} value={d.id_dictaminador}>{d.nombre_completo}</option>
                  ))}
                </>
              )}
            </select>
            {dictaminadoresDisponibles?.length === 0 && (
              <p className="text-xs text-amber-600 italic mt-1">No hay dictaminadores asignados a este congreso.</p>
            )}
          </div>
        </section>

        {/* Respuestas del dictamen */}
        {resumen.preguntas && resumen.preguntas.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Respuestas del dictamen</h4>
            <div className="space-y-2">
              {resumen.preguntas.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {p.cumplio ? <MdCheckCircle className="text-green-500" size={16} /> : <MdCancel className="text-red-500" size={16} />}
                    <span className="text-sm font-medium">{p.pregunta}</span>
                  </div>
                  {p.comentario && <p className="text-xs text-gray-500 pl-6">{p.comentario}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {resumen.retroalimentacion && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Retroalimentación</h4>
            <div className="min-h-[80px] rounded-xl border border-black/20 bg-gray-50 p-3 text-sm text-slate-700">
              {resumen.retroalimentacion}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default function ProcesosResumenesView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [dictaminadores, setDictaminadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    Promise.all([
      getResumenesCongreso(accessToken, selectedCongreso.id_congreso),
      getDictaminadoresDisponiblesApi(accessToken, selectedCongreso.id_congreso),
    ])
      .then(([resData, dictData]) => {
        setItems(resData);
        setDictaminadores(dictData);
        setViewItem(resData[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem?.id_dictaminador) return [];
    return dictaminadores.filter(d => d.id_dictaminador === viewItem.id_dictaminador);
  }, [viewItem, dictaminadores]);

  const handleAsignar = async (idResumen, idDictaminador) => {
    try {
      await asignarDictaminadorApi(accessToken, idResumen, idDictaminador);
      setItems(prev => prev.map(item =>
        item.id_resumen === idResumen
          ? { ...item, asignado: idDictaminador != null, id_dictaminador: idDictaminador }
          : item
      ));
      if (viewItem?.id_resumen === idResumen) {
        setViewItem(prev => ({ ...prev, asignado: idDictaminador != null, id_dictaminador: idDictaminador }));
      }
    } catch (err) {
      console.error('Error asignando dictaminador:', err);
    }
  };

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de resúmenes</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">Aquí se gestiona la revisión de resúmenes.</p>
        </div>
        <select
          className="select select-bordered ml-auto rounded-xl"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found ?? null);
          }}
        >
          <option value="">Selecciona un congreso</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </section>

      {!selectedCongreso ? (
        <p className="text-center py-10 text-base-content/40 italic">Selecciona un congreso para ver los resúmenes.</p>
      ) : loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No hay ponencias con resumen en este congreso.</p>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ListaResumenes
              listaElementos={items}
              dictaminadores={dictaminadores}
              selectedId={viewItem?.id ?? null}
              onView={setViewItem}
            />
            <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />
          </div>
          <div>
            <ResumenDetailCard
              resumen={viewItem}
              revisores={revisoresAsignados}
              dictaminadoresDisponibles={dictaminadores}
              onAsignar={handleAsignar}
            />
          </div>
        </section>
      )}
    </div>
  );
}
