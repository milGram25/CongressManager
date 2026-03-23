import { useState } from "react";
import Calendar from "../../components/Calendar";
import AgendaList from "./components/AgendaList";

export default function AgendaView() {
  // toggle de 'hoy' (list) y  'general' (calendar)
  const [activeView, setActiveView] = useState("hoy");

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
        {activeView === "hoy" && <AgendaList />}
      </div>
    </div>
  );
}
