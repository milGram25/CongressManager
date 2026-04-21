import { useState } from "react";
import DetallesAgenda from "./Componentes/detallesagenda"; //Enlace detallesagenda para poder ver los detalles de cada evento al hacer click en ellos
import { TbUpload } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";

const DAYS_HEADER = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MOCK_CONGRESOS = [
  {
    id: 1,
    nombre: "CIENU 2024",

  },
  {
    id: 2,
    nombre: "CIENU 2025",

  },
  {
    id: 3,
    nombre: "CIENU 2026",

  },
  {
    id: 4,
    nombre: "CIENU 2027",

  }
]

const MOCK_INSTITUCIONES = [
  {
    id: 1,
    nombre: "CIENU",

  },
  {
    id: 2,
    nombre: "RIDMAE",

  }
];
const MOCK_EVENTS = {//estos eventos deben surgir de un congreso específico, el cual es único en la institución
  "2026-4-6": [
    {
      id: 4,
      title: "Ponencia: IA aplicada a la gestion de congresos",
      description: "Sesión enfocada en automatización, seguimiento de asistentes y herramientas digitales para la administración del evento.",
      cupos: 100,
      lugar: "Auditorio Principal",
      fecha: "06 / Abril / 2026",
      hora: "12:00 PM",
      enlace: "https://meet.ejemplo.com/agenda-abril-6",
    },
  ],
  "2026-3-17": [
    {
      id: 1,
      title: "Ponencia: Innovación en educación",
      description: "Presentación sobre nuevas metodologías de aprendizaje digital.",
      cupos: 80,
      lugar: "Auditorio A",
      fecha: "17 / Marzo / 2026",
      hora: "10:00 AM",
      enlace: "https://meet.ejemplo.com/sala-1",
    },
    {
      id: 2,
      title: "Taller: Herramientas digitales",
      description: "Taller práctico sobre el uso de plataformas educativas.",
      cupos: 30,
      lugar: "Sala B",
      fecha: "17 / Marzo / 2026",
      hora: "03:00 PM",
      enlace: "https://meet.ejemplo.com/sala-2",
    },
  ],
  "2026-3-22": [
    {
      id: 3,
      title: "Conferencia Magistral",
      description: "Conferencia sobre tendencias globales en educación superior.",
      cupos: 120,
      lugar: "Teatro Central",
      fecha: "22 / Marzo / 2026",
      hora: "09:00 AM",
      enlace: "https://meet.ejemplo.com/sala-3",
    },
  ],
};

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

function ClockDisplay({ label, timezone }) {
  const [time, setTime] = useState(new Date());

  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

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

function EventCard({ event, onClose }) {
  const fields = [
    { icon: "👥", label: "Cupos", value: event.cupos },
    { icon: "📍", label: "Lugar", value: event.lugar },
    { icon: "🕐", label: "Fecha y hora", value: `${event.fecha} – ${event.hora}` },
    { icon: "🔗", label: "Enlace", value: event.enlace },
  ];

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-base-content">{event.title}</h3>
          <p className="text-xs text-base-content/50 mt-0.5">{event.description}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-base-content/30 hover:text-base-content/60 ml-2 text-lg leading-none">×</button>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#e8f5f5] flex items-center justify-center text-xs">{f.icon}</div>
            <span className="text-xs text-base-content/70 flex-1 truncate">{f.label}</span>
            <span className="text-xs font-medium bg-base-200 rounded-full px-3 py-0.5 max-w-[130px] truncate">{f.value}</span>
            <button className="w-6 h-6 rounded-full border border-base-300 flex items-center justify-center text-base-content/40 hover:text-black hover:border-black transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button className="w-6 h-6 rounded-full border border-base-300 flex items-center justify-center text-base-content/40 hover:text-black hover:border-black transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button className="w-7 h-7 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-red transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>
        <button className="w-7 h-7 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function AdminAgendaView() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const selectedDate = new Date(viewYear, viewMonth, selectedDay);
  const dayName = formatDayName(selectedDate).charAt(0).toUpperCase() + formatDayName(selectedDate).slice(1);
  const dateLabel = `${dayName} - ${String(selectedDay).padStart(2, "0")} / ${MONTHS[viewMonth]} / ${viewYear}`;

  const eventKey = `${viewYear}-${viewMonth + 1}-${selectedDay}`;
  const dayEvents = MOCK_EVENTS[eventKey] || [];
  const selectedEvent = dayEvents[selectedEventIdx] || null;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(1);
    setSelectedEventIdx(0);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(1);
    setSelectedEventIdx(0);
  }

  function selectDay(day) {
    setSelectedDay(day);
    setSelectedEventIdx(0);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const hasEvent = (day) => !!MOCK_EVENTS[`${viewYear}-${viewMonth + 1}-${day}`];

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm p-6 w-full" style={{ maxWidth: 820 }}>
      <div className="flex justify-center gap-10 mb-4">

        <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={MOCK_INSTITUCIONES} />
        <ListaDesplegableElementosGenerica titulo={"Congresos"} lista={MOCK_CONGRESOS} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-base-content">Agenda</h2>
          <div className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
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
        {/* Calendar Column */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            {/* Selected date label */}
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

            {/* Month/year selector */}
            <div className="flex items-center gap-1 mb-3">
              <button className="text-sm font-medium text-base-content flex items-center gap-1 hover:text-black transition-colors">
                {MONTHS[viewMonth]} {viewYear}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </div>

            {/* Days grid */}
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

          {/* Download buttons */}
          <div className="flex gap-2 mt-3">
            <button className="w-8 h-8 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
              <FiDownload />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#e8f5f5] flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
              <TbUpload />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3" style={{ width: 175 }}>
          <ClockDisplay label="Fecha y hora local (Mexico, UTC-6)" timezone="America/Mexico_City" />
          <ClockDisplay label="Fecha y hora mundial (UTC)" timezone="UTC" />
        </div>
      </div>

      {/* Event section */}
      <div className="mt-4">
        {dayEvents.length === 0 ? (
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
                    {idx + 1}. {ev.title.slice(0, 20)}…
                  </button>
                ))}
              </div>
            )}
            {selectedEvent && <DetallesAgenda event={selectedEvent} />}
          </div>
        )}
      </div>
    </div>
  );
}
