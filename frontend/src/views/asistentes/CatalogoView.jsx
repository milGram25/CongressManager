import { useEffect, useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import { getAgendaHoyApi } from "../../api/agendaApi";
import { MdCalendarMonth, MdEvent } from "react-icons/md";

function formatDate(iso) {
  if (!iso) return "";

  // Evita el corrimiento de día por timezone cuando el backend manda "YYYY-MM-DD".
  const date =
    typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso)
      ? new Date(`${iso}T00:00:00`)
      : new Date(iso);

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHour(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Modal de detalles ────────────────────────────────────────────────────────
function EventoDetalleModal({ evento, onClose }) {
  if (!evento) return null;
  const tipoLabel = { ponencia: "Ponencia", taller: "Taller" }[evento.tipo] ?? evento.tipo;
  
  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box max-w-2xl bg-base-100 p-8 rounded-xl shadow-lg border border-base-200">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>

        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <h3 className="text-lg font-medium text-base-content leading-snug">
            <span className="font-bold">Título de la {tipoLabel.toLowerCase()}:</span> "{evento.titulo}"
          </h3>
          
          <p className="text-base text-base-content">
            <span className="font-bold">Nombre del {tipoLabel === 'Taller' ? 'tallerista' : 'ponente'}:</span> {evento.autor !== 'Por confirmar' ? evento.autor : 'Por confirmar'}
          </p>

          <p className="text-base text-base-content capitalize">
            <span className="font-bold">Modalidad:</span> {evento.modalidad || 'Presencial'}
          </p>

          <p className="text-base text-base-content">
            <span className="font-bold">Lugar:</span> {evento.ubicacion !== 'Por confirmar' ? evento.ubicacion : 'Por confirmar'}
          </p>

          <div className="flex justify-center gap-12 text-base text-base-content w-full">
            <p><span className="font-bold">Fecha:</span> {formatDate(evento.fecha_inicio)}</p>
            <p><span className="font-bold">Hora:</span> {formatHour(evento.fecha_inicio)}</p>
          </div>
        </div>

        <div className="mb-8 px-4">
          <span className="font-bold block text-base-content mb-2 text-center">Sinopsis:</span>
          <p className="text-sm leading-relaxed text-base-content/90 whitespace-pre-wrap text-justify">
            {evento.sinopsis || "Sinopsis no disponible."}
          </p>
        </div>

        {evento.enlace && (
          <div className="mb-6 text-center">
            <span className="font-bold block text-base-content mb-1">Enlace:</span>
            <a href={evento.enlace} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm break-all">
              {evento.enlace}
            </a>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </dialog>
  );
}

// ─── Lista de eventos personales ─────────────────────────────────────────────
function MisEventosHoy() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCongresoId, setSelectedCongresoId] = useState(null);
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [agendaDateIso, setAgendaDateIso] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        if (!token) throw new Error("No hay sesión activa.");
        const data = await getAgendaHoyApi(token);

        // La agenda de hoy viene en { date, events }.
        setAgendaDateIso(typeof data?.date === "string" ? data.date : "");

        const arr = Array.isArray(data?.events) ? data.events : [];
        const mapped = arr.map((e) => ({
          id: e.id,
          titulo: e.title,
          tipo: e.type,
          fecha_inicio: e.start_iso,
          fecha_fin: e.end_iso,
          sinopsis: e.sinopsis,
          congreso: e.congreso,
          id_congreso: e.id_congreso,
          sources: e.sources,
          autor: e.author,
          ubicacion: e.location,
          eje: e.eje,
          enlace: e.link,
        }));

        setEventos(mapped);
        if (mapped.length > 0) setSelectedCongresoId(mapped[0].id_congreso);
      } catch (err) {
        setError(err.message || "No se pudo cargar tu agenda.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const congresos = useMemo(() => {
    const map = new Map();
    eventos.forEach((e) => {
      if (!map.has(e.id_congreso)) map.set(e.id_congreso, e.congreso);
    });
    return [...map.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    if (selectedCongresoId === null) return eventos;
    return eventos.filter((e) => e.id_congreso === selectedCongresoId);
  }, [eventos, selectedCongresoId]);

  const selectedCongresoNombre =
    congresos.find((c) => c.id === selectedCongresoId)?.nombre ?? "Mi agenda";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
          <MdEvent className="w-4 h-4" />
          <span>Mi agenda</span>
        </div>
        <h2 className="text-2xl font-bold">{selectedCongresoNombre}</h2>
        {agendaDateIso && <p className="opacity-80 mt-1">{formatDate(agendaDateIso)}</p>}
      </div>

      {/* Filtro de congreso */}
      {congresos.length > 1 && (
        <div className="p-4 bg-base-200 border-b border-base-300 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max">
            <span className="text-xs font-bold opacity-50 uppercase flex items-center gap-1">
              <MdCalendarMonth /> Congreso:
            </span>
            <div className="flex gap-2">
              {congresos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCongresoId(c.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCongresoId === c.id
                      ? "bg-primary/80 text-white shadow-md"
                      : "bg-base-100 hover:bg-base-300 text-neutral border border-base-300"
                  }`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Encabezado de sección */}
      <div className="px-6 md:px-8 py-4 bg-base-100 flex justify-between items-center border-b border-base-200">
        <h3 className="font-medium text-lg text-neutral">Eventos registrados</h3>
        <div className="text-xs text-base-content/50">
          Total:{" "}
          <span className="font-bold text-primary">{eventosFiltrados.length}</span>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="px-6 md:px-8 pb-8">
        {eventosFiltrados.length === 0 ? (
          <div className="py-16 text-center opacity-50 italic">
            No tienes eventos registrados
            {congresos.length > 0 ? " para este congreso" : ""}.
          </div>
        ) : (
          <div className="space-y-0">
            {eventosFiltrados.map((evento, index) => {
              const tipoLabel =
                { ponencia: "Ponencia", taller: "Taller" }[evento.tipo] ?? evento.tipo;
              return (
                <div
                  key={evento.id}
                  onClick={() => setEventoDetalle(evento)}
                  className={`flex justify-between items-center py-4 cursor-pointer hover:bg-base-200 transition-colors px-2 rounded-lg ${
                    index !== eventosFiltrados.length - 1
                      ? "border-b border-base-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1 h-10 rounded-full ${
                        evento.tipo === "taller"
                          ? "bg-secondary/80"
                          : "bg-primary/80"
                      }`}
                    />
                    <div>
                      <h4 className="font-medium text-base-content">
                        {evento.titulo}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] badge badge-ghost uppercase opacity-70">
                          {tipoLabel}
                        </span>
                        <p className="text-sm opacity-60">
                          {formatDate(evento.fecha_inicio)}
                        </p>
                        {Array.isArray(evento.sources) && evento.sources.length > 0 && (
                          <div className="flex items-center gap-1">
                            {evento.sources.map((src) => (
                              <span
                                key={src}
                                className="inline-flex items-center rounded-full border border-base-300 bg-base-200 px-2 py-0.5 text-[10px] font-semibold text-base-content/70"
                              >
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-primary text-sm">
                      {formatHour(evento.fecha_inicio)}
                    </span>
                    <span className="text-xs opacity-40 block">Ver detalles</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EventoDetalleModal
        evento={eventoDetalle}
        onClose={() => setEventoDetalle(null)}
      />
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function CatalogoView() {
  const [activeView, setActiveView] = useState("hoy");

  return (
    <div className="w-full flex flex-col items-center pt-2">
      <div className="bg-base-200 rounded-full p-1 inline-flex mb-10 shadow-inner">
        <button
          onClick={() => setActiveView("hoy")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeView === "hoy"
              ? "bg-base-100 shadow text-primary"
              : "text-base-content opacity-60 hover:opacity-100"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setActiveView("general")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeView === "general"
              ? "bg-base-100 shadow text-primary"
              : "text-base-content opacity-60 hover:opacity-100"
          }`}
        >
          General
        </button>
      </div>

      <div className="w-full transition-all duration-300">
        {activeView === "general" && <Calendar />}
        {activeView === "hoy" && <MisEventosHoy />}
      </div>
    </div>
  );
}
