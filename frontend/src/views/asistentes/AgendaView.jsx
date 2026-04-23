import { useEffect, useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import AgendaList from "./components/AgendaList";
import { getAgendaHoyApi } from "../../api/agendaApi";

function mapBackendEventsToList(events) {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    author: event.author,
    time: event.time,
    date: event.start_iso,
    location: event.location,
    eje: event.eje,
    abstract: event.abstract,
    description: event.description,
  }));
}

export default function AgendaView() {
  // toggle de 'hoy' (list) y  'general' (calendar)
  const [activeView, setActiveView] = useState("hoy");
  const [todayEvents, setTodayEvents] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [todayError, setTodayError] = useState("");

  useEffect(() => {
    const loadToday = async () => {
      setLoadingToday(true);
      setTodayError("");
      try {
        const token = localStorage.getItem("congress_access");
        if (!token) throw new Error("No hay sesión activa.");
        const data = await getAgendaHoyApi(token);
        setTodayEvents(mapBackendEventsToList(data.events || []));
      } catch (err) {
        setTodayError(err.message || "No se pudo cargar la agenda de hoy.");
        setTodayEvents([]);
      } finally {
        setLoadingToday(false);
      }
    };

    loadToday();
  }, []);

  const hoyContent = useMemo(
    () => (
      <AgendaList
        events={todayEvents}
        loading={loadingToday}
        error={todayError}
      />
    ),
    [todayEvents, loadingToday, todayError],
  );

  return (
    <div className="w-full flex flex-col items-center pt-2">
      {/* Toggle de lista y calendario */}
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

      {/* Render condicional */}
      <div className="w-full transition-all duration-300">
        {activeView === "general" && <Calendar />}
        {activeView === "hoy" && hoyContent}
      </div>
    </div>
  );
}
