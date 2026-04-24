import { useCallback, useEffect, useMemo, useState } from "react";
import ListaExtensos from "./Componentes/ListaExtensos";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getAdminExtensos, getAdminEvaluadores, asignarEvaluador } from "../../api/ponenciasApi";

// Cuadrado de la rubrica con color segun calificacion
function RubricaStatusRow({ rubrica }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-700">{rubrica.texto}</span>
      <div className="flex items-center gap-3">
        {Array.from({ length: rubrica.maximo }, (_, index) => {
          const value = index + 1;
          const active = value <= rubrica.calificacion;
          return (
            <div
              key={value}
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${
                active ? "border-[#0b7c91] bg-[#0b7c91] text-white" : "border-slate-800 bg-white text-slate-700"
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

// Tarjeta de extenso seleccionado con detalles, asignación y rubricas
function ExtensoDetailCard({ extenso, revisores, evaluadores, onAsignar, asignando }) {
  const [selectedEvaluador, setSelectedEvaluador] = useState("");

  useEffect(() => { setSelectedEvaluador(""); }, [extenso?.id]);

  if (!extenso) {
    return (
      <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No hay un extenso seleccionado.</p>
      </article>
    );
  }

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6">
      <div className="space-y-6">

        {/* Info del extenso */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Informacion de extenso</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Titulo:</span> {extenso.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {extenso.autores.join(" / ")}</p>
            <p><span className="font-semibold text-slate-900">Evaluadores:</span> {revisores.length > 0 ? revisores.map((r) => r.nombre).join(" / ") : "Sin asignar"}</p>
            <p><span className="font-semibold text-slate-900">Subarea:</span> {extenso.subarea}</p>
            <p><span className="font-semibold text-slate-900">Tipo de trabajo:</span> {extenso.tipoTrabajo}</p>
          </div>
        </section>

        {/* Asignar Evaluador */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Asignar Evaluador</h3>
          <div className="mt-3 flex gap-2">
            <select
              value={selectedEvaluador}
              onChange={(e) => setSelectedEvaluador(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-black"
            >
              <option value="">Seleccionar evaluador...</option>
              {evaluadores.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
            <button
              onClick={() => onAsignar(extenso.id, selectedEvaluador)}
              disabled={!selectedEvaluador || asignando}
              className="rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {asignando ? "Asignando..." : "Asignar"}
            </button>
          </div>
          {extenso.asignado && (
            <p className="mt-2 text-xs font-medium text-green-600">✓ Ya tiene evaluador asignado</p>
          )}
        </section>

        {/* Rubricas de evaluacion */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Rubricas de evaluacion</h3>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Puntuacion</p>
              <p className="text-[34px] font-black leading-none text-slate-800">
                {extenso.puntuacion.obtenida}
                <span className="text-[22px] text-slate-500">/{extenso.puntuacion.total}</span>
              </p>
            </div>
          </div>
          <div className="mt-3">
            {extenso.rubricas.map((rubrica) => (
              <RubricaStatusRow key={rubrica.id} rubrica={rubrica} />
            ))}
          </div>
        </section>

        {/* Comentarios del evaluador */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Comentarios del evaluador</h3>
          <div className="mt-4 min-h-[120px] rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.comentario}
          </div>
        </section>

      </div>
    </article>
  );
}

// Vista principal de extensos
export default function ProcesosExtensosView() {
  const [items, setItems] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(false);

  const cargarDatos = useCallback(async () => {
    const token = localStorage.getItem("congress_access");
    try {
      const [extensos, evals] = await Promise.all([
        getAdminExtensos(token),
        getAdminEvaluadores(token),
      ]);
      setItems(extensos);
      setEvaluadores(evals);
      if (extensos.length > 0) setViewItem(extensos[0]);
    } catch (err) {
      console.error("Error al cargar datos de extensos:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem) return [];
    return evaluadores.filter((e) => viewItem.revisores.includes(e.id));
  }, [viewItem, evaluadores]);

  const handleAsignar = async (idExtenso, idEvaluador) => {
    if (!idEvaluador) return;
    setAsignando(true);
    try {
      const token = localStorage.getItem("congress_access");
      await asignarEvaluador(idExtenso, parseInt(idEvaluador), token);
      await cargarDatos();
    } catch (err) {
      console.error("Error al asignar evaluador:", err);
      alert("No se pudo asignar el evaluador. Intenta de nuevo.");
    } finally {
      setAsignando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-medium text-slate-400">Cargando extensos...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div className="h-12 w-1.5 rounded-full bg-[#000000]" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[42px] font-black leading-none tracking-tight text-[#000000]">Revision</h2>
          <p className="text-lg font-semibold text-slate-400">Evaluacion de extensos y asignacion de evaluadores</p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[52.5%_43.5%]">
        <ExtensoDetailCard
          extenso={viewItem}
          revisores={revisoresAsignados}
          evaluadores={evaluadores}
          onAsignar={handleAsignar}
          asignando={asignando}
        />

        <div className="space-y-4">
          <ListaExtensos
            listaElementos={items}
            dictaminadores={evaluadores}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ListaRevisores titulo="EVALUADORES" revisores={revisoresAsignados} />
        </div>
      </section>
    </div>
  );
}
