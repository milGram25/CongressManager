import { useEffect, useMemo, useState } from "react";
import ListaExtensos from "./Componentes/ListaExtensos";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getCongresosApi, getEvaluadoresDisponiblesApi } from "../../api/adminApi";
import { getExtensosCongreso, asignarEvaluadorApi } from "../../api/ponenciasApi";

//Componente para agrupar criterios de evaluación
function RubricaGrupoStatusRow({ grupo }) {
  const nombreGrupo = grupo.nombre_grupo || "";

  return (
    <div className="mb-5 ml-2">
      <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-1">
        {nombreGrupo}
      </h4>
      <div className="flex flex-col">
        {grupo.criterios?.map((criterio, i) => (
          <RubricaCriteriosStatusRow key={i} criterio={criterio} />
        ))}
      </div>
    </div>
  );
}

// Cuadrado de la rubrica con color segun calificacion
function RubricaCriteriosStatusRow({ criterio }) {
  const puntaje = criterio.puntaje ?? 0;
  const peso = criterio.peso ?? 0;

  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0 pl-2 ml-2">
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-700">{criterio.nombre_criterio}</span>
        {criterio.comentario_especifico && (
          <p className="text-xs text-slate-400 mt-0.5">{criterio.comentario_especifico}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {Array.from({ length: peso }, (_, index) => {
          const value = index + 1;
          const active = value <= puntaje;

          return (
            <div
              key={value}
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${active ? "bg-black text-white" : "border-slate-800 bg-white text-slate-700"
                }`}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tarjeta de extenso seleccionado con detalles y rubricas
function ExtensoDetailCard({ extenso, revisores, evaluadoresDisponibles, onAsignar }) {
  if (!extenso) {
    return (
      <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No hay un extenso seleccionado.</p>
      </article>
    );
  }

  const grupos = extenso.evaluacion?.grupos ?? null;

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6">
      <div className="space-y-6">
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Información de extenso</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Título:</span> {extenso.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {extenso.autores?.join(" / ") || 'Sin autores'}</p>
            <p><span className="font-semibold text-slate-900">Evaluadores:</span> {revisores.length > 0 ? revisores.map((r) => r.nombre_completo).join(" / ") : "Sin asignar"}</p>
          </div>
        </section>

        {/* Asignación de evaluador */}
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Evaluador asignado</h4>
          <div className="flex gap-2 items-center">
            <select
              className="select select-bordered select-sm flex-1 rounded-xl"
              value={extenso.id_evaluador ?? ''}
              onChange={e => onAsignar(extenso.id_extenso, e.target.value ? Number(e.target.value) : null)}
            >
              {evaluadoresDisponibles?.length === 0 ? (
                <option value="" disabled>No hay evaluadores en este congreso</option>
              ) : (
                <>
                  <option value="">Sin asignar</option>
                  {evaluadoresDisponibles.map(e => (
                    <option key={e.id_evaluador} value={e.id_evaluador}>{e.nombre_completo}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Rúbricas de evaluación</h3>
          </div>

          <div className="mt-3 overflow-y-auto max-h-[250px]">
            {grupos == null ? (
              <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
            ) : grupos.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
            ) : (
              grupos.map((grupo, i) => (
                <RubricaGrupoStatusRow key={i} grupo={grupo} />
              ))
            )}
          </div>
        </section>

        {extenso.evaluacion?.estatus && (
          <section>
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Estatus de evaluación</h3>
            <div className="mt-4 rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
              {extenso.evaluacion.estatus}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

//Vista de extensos con lista lateral y detalle central
export default function ProcesosExtensosView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    Promise.all([
      getExtensosCongreso(accessToken, selectedCongreso.id_congreso),
      getEvaluadoresDisponiblesApi(accessToken, selectedCongreso.id_congreso),
    ])
      .then(([extData, evalData]) => {
        setItems(extData);
        setEvaluadores(evalData);
        setViewItem(extData[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem?.id_evaluador) return [];
    return evaluadores.filter(e => e.id_evaluador === viewItem.id_evaluador);
  }, [viewItem, evaluadores]);

  const handleAsignar = async (idExtenso, idEvaluador) => {
    try {
      await asignarEvaluadorApi(accessToken, idExtenso, idEvaluador);
      setItems(prev => prev.map(item =>
        item.id_extenso === idExtenso
          ? { ...item, asignado: idEvaluador != null, id_evaluador: idEvaluador }
          : item
      ));
      if (viewItem?.id_extenso === idExtenso) {
        setViewItem(prev => ({ ...prev, asignado: idEvaluador != null, id_evaluador: idEvaluador }));
      }
    } catch (err) {
      console.error('Error asignando evaluador:', err);
    }
  };

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de extensos</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">Aquí se gestiona la revisión de extensos.</p>
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
        <p className="text-center py-10 text-base-content/40 italic">Selecciona un congreso para ver los extensos.</p>
      ) : loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No hay ponencias con extenso en este congreso.</p>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ListaExtensos
              listaElementos={items}
              dictaminadores={evaluadores}
              selectedId={viewItem?.id ?? null}
              onView={setViewItem}
            />
            <ListaRevisores titulo="EVALUADORES" revisores={revisoresAsignados} />
          </div>
          <ExtensoDetailCard
            extenso={viewItem}
            revisores={revisoresAsignados}
            evaluadoresDisponibles={evaluadores}
            onAsignar={handleAsignar}
          />
        </section>
      )}
    </div>
  );
}
