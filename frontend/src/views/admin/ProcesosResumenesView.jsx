import { useEffect, useState } from "react";
import ListaResumenes from "./Componentes/ListaResumenes";
import { getCongresosApi, getDictaminadoresDisponiblesApi } from "../../api/adminApi";
import { getResumenesCongreso, asignarDictaminadorApi } from "../../api/ponenciasApi";
import BuscadorPersonal from "./Componentes/BuscadorPersonal";

function AsignarDictaminadorCard({ resumen, dictaminadores, onAsignado }) {
  const [sel, setSel] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setSel(resumen?.id_dictaminador ? String(resumen.id_dictaminador) : '');
    setMsg(null);
  }, [resumen?.id_resumen]);

  if (!resumen) return (
    <div className="flex items-center justify-center h-64 rounded-[26px] border border-black/20 bg-white text-gray-400 italic text-sm">
      Selecciona un resumen para ver el detalle
    </div>
  );

  const handleAsignar = async () => {
    if (!sel) return;
    setAssigning(true);
    setMsg(null);
    try {
      await asignarDictaminadorApi(localStorage.getItem('congress_access'), resumen.id_resumen, Number(sel));
      const d = dictaminadores.find(d => String(d.id_dictaminador) === sel);
      setMsg({ ok: true, text: 'Dictaminador asignado correctamente.' });
      onAsignado(resumen.id_resumen, Number(sel), d?.nombre_completo ?? '');
    } catch {
      setMsg({ ok: false, text: 'Error al asignar dictaminador.' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <article className="rounded-[26px] border border-black/55 bg-white shadow-sm">
      <header className="bg-black px-6 py-4 rounded-t-[25px]">
        <h3 className="text-white font-bold text-lg leading-tight">{resumen.title}</h3>
        <p className="text-gray-400 text-sm mt-0.5">{resumen.autores?.join(', ') || 'Sin autores'}</p>
      </header>

      <div className="p-6 space-y-5">
        {msg && (
          <div className={`text-sm px-4 py-2 rounded-xl ${msg.ok ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            {msg.text}
          </div>
        )}

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-1">Dictaminador actual</h4>
          <p className="text-sm text-slate-600">
            {resumen.nombre_dictaminador
              ? <span className="font-semibold">{resumen.nombre_dictaminador}</span>
              : <span className="italic text-slate-400">Sin dictaminador asignado</span>
            }
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">
            {resumen.asignado ? 'Reasignar dictaminador' : 'Asignar dictaminador'}
          </h4>
          {dictaminadores.length === 0 ? (
            <p className="text-xs text-amber-600 italic">No hay dictaminadores registrados en este congreso.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <BuscadorPersonal
                options={dictaminadores}
                value={sel}
                onChange={setSel}
                placeholder="Busca un dictaminador..."
              />
              <button
                onClick={handleAsignar}
                disabled={!sel || assigning}
                className="btn btn-black w-full rounded-xl disabled:opacity-50"
              >
                {assigning ? <span className="loading loading-spinner loading-xs" /> : 'Confirmar asignación'}
              </button>
            </div>
          )}
        </section>
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
      .then(([resumenes, dicts]) => {
        setItems(resumenes);
        setDictaminadores(dicts);
        setViewItem(resumenes[0] ?? null);
      })
      .catch(err => {
        console.error("Error al cargar datos de resúmenes:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const handleAsignado = (idResumen, idDictaminador, nombreDictaminador) => {
    const patch = { id_dictaminador: idDictaminador, nombre_dictaminador: nombreDictaminador, asignado: true };
    setItems(prev => prev.map(i => i.id_resumen === idResumen ? { ...i, ...patch } : i));
    if (viewItem?.id_resumen === idResumen) setViewItem(prev => ({ ...prev, ...patch }));
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
          <ListaResumenes
            listaElementos={items}
            dictaminadores={dictaminadores}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <AsignarDictaminadorCard
            resumen={viewItem}
            dictaminadores={dictaminadores}
            onAsignado={handleAsignado}
          />
        </section>
      )}
    </div>
  );
}
