import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import DetallesAgenda from "./Componentes/detallesagenda";
import { TbUpload } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";
import { getCongresosApi, getInstitucionesApi } from "../../api/adminApi.js";
import { getEventosCongresoApi } from "../../api/agendaApi.js";

const DAYS_HEADER = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDayName(date) {
  return date.toLocaleDateString("es-MX", { weekday: "long" });
}

function formatFullDate(day, month, year) {
  return `${String(day).padStart(2, "0")} / ${MONTHS[month]} / ${year}`;
}

function extractCongresoId(congreso) {
  return congreso?.id_congreso ?? congreso?.id ?? null;
}

function ClockDisplay({ label, timezone }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const options = { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true };
  const formatted = time.toLocaleTimeString("es-MX", options);
  const [timePart, period] = formatted.split(" ");
  const [hh, mm] = timePart.split(":");

  const dateOptions = { timeZone: timezone, day: "2-digit", month: "long", year: "numeric" };
  const dateStr = time.toLocaleDateString("es-MX", dateOptions);

  return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm">
        <p className="text-[11px] font-medium text-base-content/60 mb-2">{label}</p>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <span className="bg-base-200 rounded-lg px-2 py-1 text-2xl font-bold font-mono tracking-wider text-base-content">{hh}</span>
            <span className="text-2xl font-bold text-base-content">:</span>
            <span className="bg-base-200 rounded-lg px-2 py-1 text-2xl font-bold font-mono tracking-wider text-base-content">{mm}</span>
          </div>
          <div className="flex flex-col gap-1 ml-1">
            <button className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${period?.toUpperCase() === "AM" ? "bg-[#e8f5f5] text-black border-black" : "bg-base-200 text-base-content/40 border-base-300"}`}>AM</button>
            <button className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${period?.toUpperCase() === "PM" ? "bg-[#e8f5f5] text-black border-black" : "bg-base-200 text-base-content/40 border-base-300"}`}>PM</button>
          </div>
        </div>
        <div className="mt-2 bg-base-200 rounded-lg text-center py-1 text-[11px] font-medium text-base-content/70">
          {dateStr}
        </div>
        <div className="flex justify-end mt-1">
          <button className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
          </button>
        </div>
      </div>
  );
}

export default function AdminAgendaView() {
  const { user: _user } = useAuth();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const [instituciones, setInstituciones] = useState([]);
  const [congresos, setCongresos] = useState([]);
  const [selectedInstitucion, setSelectedInstitucion] = useState("");
  const [selectedCongreso, setSelectedCongreso] = useState("");
  const [eventosMap, setEventosMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const selectedDate = selectedDay ? new Date(viewYear, viewMonth, selectedDay) : null;
  const dayName = selectedDate
      ? formatDayName(selectedDate).charAt(0).toUpperCase() + formatDayName(selectedDate).slice(1)
      : "";
  const dateLabel = selectedDate
      ? `${dayName} - ${String(selectedDay).padStart(2, "0")} / ${MONTHS[viewMonth]} / ${viewYear}`
      : `${MONTHS[viewMonth]} / ${viewYear}`;

  const accessToken = typeof window !== "undefined" ? localStorage.getItem("congress_access") : null;

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([getInstitucionesApi(accessToken), getCongresosApi(accessToken)])
        .then(([institucionesData, congresosData]) => {
          setInstituciones(Array.isArray(institucionesData) ? institucionesData : []);
          setCongresos(Array.isArray(congresosData) ? congresosData : []);
        })
        .catch((err) => {
          console.error(err);
          setError("No se pudieron cargar instituciones y congresos.");
        });
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    getCongresosApi(accessToken, selectedInstitucion || null)
        .then((data) => setCongresos(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error(err);
          setError("No se pudieron cargar los congresos.");
        });
  }, [accessToken, selectedInstitucion]);

  useEffect(() => {
    async function loadEventos() {
      if (!accessToken) {
        setEventosMap({});
        return;
      }

      const idsCongresos = selectedCongreso
          ? [selectedCongreso]
          : congresos
              .map((c) => extractCongresoId(c))
              .filter((id) => id !== null && id !== undefined && id !== "");

      if (idsCongresos.length === 0) {
        setEventosMap({});
        return;
      }

      setLoading(true);
      try {
        const responses = await Promise.all(
            idsCongresos.map((idCongreso) => getEventosCongresoApi(accessToken, idCongreso))
        );
        const data = responses.flat();
        const map = {};

        (data || []).forEach((ev) => {
          const start = ev.fecha_inicio || ev.start_iso;
          let d = null;
          try {
            d = start ? new Date(start) : null;
          } catch {
            d = null;
          }
          if (!d) return;

          const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          const normalized = {
            id: ev.id,
            title: ev.titulo || ev.title || ev.nombre_evento || "",
            description: ev.sinopsis || ev.description || "",
            cupos: ev.cupos ?? ev.cupos_disponibles ?? null,
            lugar: ev.ubicacion || ev.lugar || "",
            fecha: formatFullDate(d.getDate(), d.getMonth(), d.getFullYear()),
            hora: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            enlace: ev.enlace || ev.link || ""
          };

          if (!map[key]) map[key] = [];
          map[key].push(normalized);
        });

        setEventosMap(map);
        setSelectedEventIdx(0);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar eventos del congreso.");
      } finally {
        setLoading(false);
      }
    }

    loadEventos();
  }, [accessToken, selectedCongreso, congresos]);

  function resolveSelectedDayForMonth(targetYear, targetMonth) {
    const maxDay = getDaysInMonth(targetYear, targetMonth);
    const isCurrentMonth =
        targetYear === today.getFullYear() && targetMonth === today.getMonth();

    if (isCurrentMonth) {
      return Math.min(today.getDate(), maxDay);
    }

    return null;
  }

  function prevMonth() {
    const targetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const targetYear = viewMonth === 0 ? viewYear - 1 : viewYear;

    setViewMonth(targetMonth);
    setViewYear(targetYear);
    setSelectedDay(resolveSelectedDayForMonth(targetYear, targetMonth));
    setSelectedEventIdx(0);
  }

  function nextMonth() {
    const targetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const targetYear = viewMonth === 11 ? viewYear + 1 : viewYear;

    setViewMonth(targetMonth);
    setViewYear(targetYear);
    setSelectedDay(resolveSelectedDayForMonth(targetYear, targetMonth));
    setSelectedEventIdx(0);
  }

  function selectDay(day) {
    setSelectedDay(day);
    setSelectedEventIdx(0);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyForDay = (day) => `${viewYear}-${viewMonth + 1}-${day}`;
  const hasEvent = (day) => !!eventosMap[keyForDay(day)] && eventosMap[keyForDay(day)].length > 0;
  const isToday = (day) =>
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear();

  const dayEvents = selectedDay ? (eventosMap[keyForDay(selectedDay)] || []) : [];
  const selectedEvent = dayEvents[selectedEventIdx] || null;

  return (
      <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm p-6 w-full" style={{ maxWidth: 820 }}>
        <div className="flex justify-center gap-10 mb-4">
          <ListaDesplegableElementosGenerica
              titulo={"Instituciones"}
              lista={instituciones}
              value={selectedInstitucion}
              onSelect={(value) => {
                setSelectedInstitucion(value);
                setSelectedCongreso("");
                setEventosMap({});
              }}
          />
          <ListaDesplegableElementosGenerica
              titulo={"Congresos"}
              lista={congresos}
              value={selectedCongreso}
              onSelect={(value) => {
                setSelectedCongreso(value);
                setSelectedEventIdx(0);
              }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-base-content">Agenda</h2>
            <div className="relative">
              <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-500 transition-colors relative"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center">3</span>
              </button>
              {notifOpen && (
                  <div className="absolute left-0 top-10 z-50 w-64 bg-base-100 border border-base-300 rounded-2xl shadow-lg p-3">
                    <p className="text-xs font-semibold text-base-content/60 mb-2">Notificaciones</p>
                    {["Ponencia confirmada para el 17/Mar", "Nuevo taller registrado", "Recordatorio: evento mañana"].map((n, i) => (
                        <div key={i} className="flex items-start gap-2 py-2 border-b border-base-200 last:border-0">
                          <div className="w-2 h-2 rounded-full bg-black mt-1 flex-shrink-0" />
                          <span className="text-xs text-base-content/70">{n}</span>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 hover:bg-[#e8f5f5] hover:text-black transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>
            <button className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 hover:bg-[#e8f5f5] hover:text-black transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 10 12 15 7 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-base-content">{dateLabel}</h3>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 hover:bg-[#e8f5f5] hover:text-black transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 hover:bg-[#e8f5f5] hover:text-black transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <button className="text-sm font-medium text-base-content flex items-center gap-1 hover:text-black transition-colors">
                  {MONTHS[viewMonth]} {viewYear}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {DAYS_HEADER.map((d, i) => (
                    <div key={i} className="text-center text-[11px] font-semibold text-base-content/40 pb-1">{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const active = day === selectedDay;
                  const todayMark = isToday(day);
                  const hasEv = hasEvent(day);
                  return (
                      <button
                          key={day}
                          onClick={() => selectDay(day)}
                          className={`
                      relative mx-auto w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-all
                      ${active ? "bg-black text-white shadow-md" : todayMark ? "border-2 border-black text-black" : "text-base-content/70 hover:bg-base-200"}
                    `}
                      >
                        {day}
                        {hasEv && !active && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                        )}
                      </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="w-8 h-8 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
                <FiDownload />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
                <TbUpload />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3" style={{ width: 175 }}>
            <ClockDisplay label="Fecha y hora local (Mexico, UTC-6)" timezone="America/Mexico_City" />
            <ClockDisplay label="Fecha y hora mundial (UTC)" timezone="UTC" />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
              <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/40">
                Cargando eventos...
              </div>
          ) : !selectedDay ? (
              <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/40">
                Selecciona un día para ver sus eventos
              </div>
          ) : dayEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/40">
                No hay eventos para este día
              </div>
          ) : (
              <div>
                {dayEvents.length > 1 && (
                    <div className="flex gap-2 mb-3">
                      {dayEvents.map((ev, idx) => (
                          <button
                              key={ev.id}
                              onClick={() => setSelectedEventIdx(idx)}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border ${selectedEventIdx === idx ? "bg-black text-white border-black" : "bg-base-200 text-base-content/60 border-base-300 hover:border-black hover:text-black"}`}
                          >
                            {idx + 1}. {ev.title.slice(0, 20)}...
                          </button>
                      ))}
                    </div>
                )}
                {selectedEvent && <DetallesAgenda event={selectedEvent} />}
              </div>
          )}
        </div>

        {error && (
            <div className="mt-3 text-sm text-red-500">
              {error}
            </div>
        )}
      </div>
  );
}