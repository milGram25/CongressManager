import { useCallback, useEffect, useMemo, useState } from "react";
import ListaResumenes from "./Componentes/ListaResumenes";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getAdminResumenes, getAdminDictaminadores, asignarDictaminador } from "../../api/ponenciasApi";

// Apartado de preguntas con estatus aprobado o no aprobado
function QuestionStatusRow({ pregunta }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-700">{pregunta.texto}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estatus</span>
        <span className={`h-2.5 w-2.5 rounded-full ${pregunta.aprobado ? "bg-green-500" : "bg-red-500"}`} />
      </div>
    </div>
  );
}

// Tarjeta de resumen seleccionado con detalles, asignación y comentarios
function ResumenDetailCard({ resumen, revisores, dictaminadores, onAsignar, asignando }) {
  const [selectedDictaminador, setSelectedDictaminador] = useState("");

  // Resetear selector al cambiar resumen
  useEffect(() => { setSelectedDictaminador(""); }, [resumen?.id]);

  if (!resumen) {
    return (
      <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No hay un resumen seleccionado.</p>
      </article>
    );
  }

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6">
      <div className="space-y-6">

        {/* Info del resumen */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Informacion de resumen</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Titulo:</span> {resumen.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {resumen.autores.join(" / ")}</p>
            <p><span className="font-semibold text-slate-900">Dictaminadores:</span> {revisores.length > 0 ? revisores.map((r) => r.nombre).join(" / ") : "Sin asignar"}</p>
            <p><span className="font-semibold text-slate-900">Subarea:</span> {resumen.subarea}</p>
            <p><span className="font-semibold text-slate-900">Tipo de trabajo:</span> {resumen.tipoTrabajo}</p>
          </div>
        </section>

        {/* Asignar Dictaminador */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Asignar Dictaminador</h3>
          <div className="mt-3 flex gap-2">
            <select
              value={selectedDictaminador}
              onChange={(e) => setSelectedDictaminador(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-black"
            >
              <option value="">Seleccionar dictaminador...</option>
              {dictaminadores.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            <button
              onClick={() => onAsignar(resumen.id, selectedDictaminador)}
              disabled={!selectedDictaminador || asignando}
              className="rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {asignando ? "Asignando..." : "Asignar"}
            </button>
          </div>
          {resumen.asignado && (
            <p className="mt-2 text-xs font-medium text-green-600">✓ Ya tiene dictaminador asignado</p>
          )}
        </section>

        {/* Preguntas de evaluacion */}
        {resumen.preguntas && resumen.preguntas.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Preguntas de evaluacion</h3>
              <div className="text-right">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Puntuacion</p>
                <p className="text-[34px] font-black leading-none text-slate-800">
                  {resumen.puntuacion.obtenida}
                  <span className="text-[22px] text-slate-500">/{resumen.puntuacion.total}</span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              {resumen.preguntas.map((pregunta) => (
                <QuestionStatusRow key={pregunta.id} pregunta={pregunta} />
              ))}
            </div>
          </section>
        )}

        {/* Comentarios del dictaminador */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Comentarios del dictaminador</h3>
          <div className="mt-4 min-h-[120px] rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {resumen.comentario}
          </div>
        </section>

      </div>
    </article>
  );
}

// Vista principal de resúmenes
export default function ProcesosResumenesView() {
  const [items, setItems] = useState([]);
  const [dictaminadores, setDictaminadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(false);

  const cargarDatos = useCallback(async () => {
    const token = localStorage.getItem("congress_access");
    try {
      const [resumenes, dicts] = await Promise.all([
        getAdminResumenes(token),
        getAdminDictaminadores(token),
      ]);
      setItems(resumenes);
      setDictaminadores(dicts);
      if (resumenes.length > 0) setViewItem(resumenes[0]);
    } catch (err) {
      console.error("Error al cargar datos de resúmenes:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem) return [];
    return dictaminadores.filter((d) => viewItem.revisores.includes(d.id));
  }, [viewItem, dictaminadores]);

  const handleAsignar = async (idResumen, idDictaminador) => {
    if (!idDictaminador) return;
    setAsignando(true);
    try {
      const token = localStorage.getItem("congress_access");
      await asignarDictaminador(idResumen, parseInt(idDictaminador), token);
      await cargarDatos(); // recarga para reflejar cambio
    } catch (err) {
      console.error("Error al asignar dictaminador:", err);
      alert("No se pudo asignar el dictaminador. Intenta de nuevo.");
    } finally {
      setAsignando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-medium text-slate-400">Cargando resúmenes...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div className="h-12 w-1.5 rounded-full bg-[#000000]" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[42px] font-black leading-none tracking-tight text-[#000000]">Revision</h2>
          <p className="text-lg font-semibold text-slate-400">Evaluacion de resumenes y asignacion de evaluadores</p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[52.5%_43.5%]">
        <ResumenDetailCard
          resumen={viewItem}
          revisores={revisoresAsignados}
          dictaminadores={dictaminadores}
          onAsignar={handleAsignar}
          asignando={asignando}
        />

        <div className="space-y-4">
          <ListaResumenes
            listaElementos={items}
            dictaminadores={dictaminadores}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />
        </div>
      </section>
    </div>
  );
}
