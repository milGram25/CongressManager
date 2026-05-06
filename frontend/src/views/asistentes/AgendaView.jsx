import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdCalendarMonth, MdLocationOn, MdCheckCircle } from "react-icons/md";
import { getCongresosApi } from "../../api/adminApi";
import { getEventosCongresoApi, getMisInscripcionesApi } from "../../api/agendaApi";
import { registrarPonenciaApi } from "../../api/ponenciasApi";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatHour(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

// ─── Modal de detalles del evento ────────────────────────────────────────────
function EventoDetalleModal({ evento, onClose, onRegistrar, registrando }) {
  if (!evento) return null;
  const tipoLabel = { ponencia: "Ponencia", taller: "Taller" }[evento.tipo] ?? evento.tipo;
  
  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box max-w-2xl bg-base-100 p-8 rounded-xl shadow-lg border border-base-200">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>

        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <h3 className="text-lg font-medium text-base-content leading-snug">
            <span className="font-bold">Título {tipoLabel}:</span> "{evento.titulo}"
          </h3>
          
          <p className="text-base text-base-content">
            <span className="font-bold">Nombre {tipoLabel === 'Taller' ? 'Tallerista' : 'Ponente'}:</span> {evento.autor !== 'Por confirmar' ? evento.autor : 'Por confirmar'}
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

        <div className="flex justify-between items-center mt-6 pt-2">
          <div className="text-lg font-bold">
            {/* Costo: $150 MXN (Placeholder si se requiriera, por ahora no mostramos costo por evento individual) */}
          </div>
          <div>
            {evento.registrado ? (
              <span className="flex items-center gap-1 font-semibold text-primary">
                 Registrado
              </span>
            ) : evento.lleno ? (
              <span className="font-semibold text-error">Cupo lleno</span>
            ) : onRegistrar ? (
              <button
                className="btn btn-neutral rounded-full px-8 font-bold text-sm tracking-wide"
                disabled={registrando === evento.id}
                onClick={() => onRegistrar(evento)}
              >
                {registrando === evento.id ? "REGISTRANDO..." : "REGISTRARME"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </dialog>
  );
}

// ─── Tarjeta de congreso ──────────────────────────────────────────────────────
function CongresoCard({ congreso, inscrito, onVerEventos, onInscribirse }) {
  return (
    <div
      className={`card bg-base-100 shadow-md border transition-shadow duration-200 hover:shadow-lg ${
        inscrito ? "border-primary/40" : "border-base-200"
      }`}
    >
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base font-semibold leading-snug flex-1">
            {congreso.nombre_congreso}
          </h2>
          {inscrito && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">
              <MdCheckCircle className="text-sm" /> Inscrito
            </span>
          )}
        </div>

        {congreso.nombre_institucion && (
          <p className="text-sm text-base-content/60">{congreso.nombre_institucion}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/70">
          {(congreso.congreso_inicio || congreso.congreso_fin) && (
            <span className="flex items-center gap-1">
              <MdCalendarMonth className="text-primary" />
              {formatDate(congreso.congreso_inicio)}
              {congreso.congreso_fin && ` — ${formatDate(congreso.congreso_fin)}`}
            </span>
          )}
          {congreso.ciudad && (
            <span className="flex items-center gap-1">
              <MdLocationOn className="text-primary" />
              {[congreso.ciudad, congreso.estado].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        <div className="card-actions justify-end mt-1 gap-2">
          {!inscrito && (
            <button className="btn btn-outline btn-sm" onClick={() => onInscribirse(congreso)}>
              Inscribirme
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => onVerEventos(congreso)}>
            Ver eventos
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lista de congresos ───────────────────────────────────────────────────────
function CongresoList({ inscritos, onVerEventos, onInscribirse }) {
  const [congresos, setCongresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        if (!token) throw new Error("No hay sesión activa.");
        const data = await getCongresosApi(token);
        setCongresos(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        setError(err.message || "No se pudieron cargar los congresos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  if (error)
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-8">
        <span>{error}</span>
      </div>
    );
  if (congresos.length === 0)
    return (
      <div className="text-center text-base-content/50 py-16">
        No hay congresos disponibles.
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {congresos.map((c) => (
        <CongresoCard
          key={c.id_congreso}
          congreso={c}
          inscrito={inscritos.has(c.id_congreso)}
          onVerEventos={onVerEventos}
          onInscribirse={onInscribirse}
        />
      ))}
    </div>
  );
}

// ─── Tarjeta de evento ────────────────────────────────────────────────────────
function EventoCard({ evento, onRegistrar, registrando, onVerDetalles }) {
  const tipoLabel = { ponencia: "Ponencia", taller: "Taller" }[evento.tipo] ?? evento.tipo;
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug flex-1">{evento.titulo}</h3>
          <span className="badge badge-ghost text-xs shrink-0">{tipoLabel}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/60">
          {evento.fecha_inicio && (
            <span>
              {formatDate(evento.fecha_inicio)} · {formatHour(evento.fecha_inicio)}
            </span>
          )}
          {evento.ubicacion && evento.ubicacion !== "Por confirmar" && (
            <span className="flex items-center gap-1">
              <MdLocationOn className="text-primary" /> {evento.ubicacion}
            </span>
          )}
          {evento.cupos > 0 && (
            <span className={evento.lleno ? "text-error font-semibold" : ""}>
              {evento.lleno
                ? "Sin cupos"
                : `${evento.cupos_disponibles} / ${evento.cupos} cupos`}
            </span>
          )}
        </div>

        {evento.autor && evento.autor !== "Por confirmar" && (
          <p className="text-xs text-base-content/70">
            <span className="font-semibold">Autor/Tallerista:</span> {evento.autor}
          </p>
        )}

        {evento.sinopsis && (
          <div className="mt-1">
            <span className="font-bold text-[10px] uppercase opacity-50 block mb-0.5">Resumen</span>
            <p className="text-xs text-base-content/80 whitespace-pre-wrap line-clamp-3">{evento.sinopsis}</p>
          </div>
        )}

        <div className="card-actions justify-between mt-1 items-center">
          <div>
            {evento.registrado ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <MdCheckCircle /> Ya estás registrado
              </span>
            ) : evento.lleno ? (
              <span className="text-xs font-semibold text-error">Cupo lleno</span>
            ) : (
              <button
                className="btn btn-primary btn-xs"
                disabled={registrando === evento.id}
                onClick={() => onRegistrar(evento)}
              >
                {registrando === evento.id ? "Registrando..." : "Registrarme"}
              </button>
            )}
          </div>
          <button
            className="btn btn-ghost btn-xs text-black font-extrabold uppercase"
            onClick={() => onVerDetalles(evento)}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vista de eventos de un congreso ─────────────────────────────────────────
function EventosCongreso({ congreso, onBack }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrando, setRegistrando] = useState(null);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [eventoDetalle, setEventoDetalle] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await getEventosCongresoApi(token, congreso.id_congreso);
        setEventos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [congreso.id_congreso]);

  const handleRegistrar = async (evento) => {
    const token = localStorage.getItem("congress_access");
    setRegistrando(evento.id);
    setErrorRegistro("");
    try {
      await registrarPonenciaApi(evento.id, token);
      setEventos((prev) =>
        prev.map((e) =>
          e.id === evento.id
            ? {
                ...e,
                registrado: true,
                cupos_disponibles: Math.max(0, (e.cupos_disponibles ?? 1) - 1),
                cupos_ocupados: (e.cupos_ocupados ?? 0) + 1,
              }
            : e
        )
      );
    } catch (err) {
      setErrorRegistro(err.message || "No se pudo completar el registro.");
    } finally {
      setRegistrando(null);
    }
  };

  const tipos = [...new Set(eventos.map((e) => e.tipo))].filter(Boolean);
  const eventosFiltrados =
    filtro === "todos" ? eventos : eventos.filter((e) => e.tipo === filtro);

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm gap-1">
          <MdArrowBack className="text-lg" /> Congresos
        </button>
        <h2 className="text-base font-semibold text-base-content truncate">
          {congreso.nombre_congreso}
        </h2>
      </div>

      {tipos.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFiltro("todos")}
            className={`btn btn-sm rounded-full ${filtro === "todos" ? "btn-primary" : "btn-ghost"}`}
          >
            Todos
          </button>
          {tipos.map((t) => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`btn btn-sm rounded-full capitalize ${filtro === t ? "btn-primary" : "btn-ghost"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {errorRegistro && (
        <div className="alert alert-error mb-4">
          <span>{errorRegistro}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {!loading && !error && eventosFiltrados.length === 0 && (
        <p className="text-center text-base-content/50 py-16">
          No hay eventos disponibles.
        </p>
      )}
      {!loading && !error && eventosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventosFiltrados.map((e) => (
            <EventoCard
              key={e.id}
              evento={e}
              onRegistrar={handleRegistrar}
              registrando={registrando}
              onVerDetalles={setEventoDetalle}
            />
          ))}
        </div>
      )}

      <EventoDetalleModal
        evento={eventoDetalle}
        onClose={() => setEventoDetalle(null)}
        onRegistrar={handleRegistrar}
        registrando={registrando}
      />
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function AgendaView() {
  const navigate = useNavigate();
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [inscritos, setInscritos] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("congress_access");
    getMisInscripcionesApi(token)
      .then((data) => setInscritos(new Set(data.inscripciones ?? [])))
      .catch(() => setInscritos(new Set()));
  }, []);

  const handleInscribirse = (congreso) => {
    const params = new URLSearchParams({
      id_congreso: congreso.id_congreso,
      nombre: congreso.nombre_congreso,
    });
    navigate(`/asistente/pagos?${params.toString()}`);
  };

  if (selectedCongreso) {
    return (
      <div className="w-full pt-2">
        <EventosCongreso
          congreso={selectedCongreso}
          onBack={() => setSelectedCongreso(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pt-2">
      <h1 className="text-xl font-bold mb-6 self-start">Congresos disponibles</h1>
      <CongresoList
        inscritos={inscritos}
        onVerEventos={setSelectedCongreso}
        onInscribirse={handleInscribirse}
      />
    </div>
  );
}
