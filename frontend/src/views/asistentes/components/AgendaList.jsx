import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EventDetailModal from "../../../components/EventDetailModal";

export default function AgendaList() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const date = new Date();
  // Datos de ponencias registradas, obtener de la api
  const mockSchedule = [
    {
      id: 1,
      title: "Inteligencia Artificial y su Impacto en la Sociedad Digital",
      author: "Dr. Gabriel Mendoza",
      time: "09:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Auditorio A",
      abstract:
        "Este trabajo explora cómo los algoritmos de aprendizaje profundo están reconfigurando las interacciones sociales modernas.",
      description:
        "Una mirada profunda a la ética, los sesgos y el potencial transformador de la IA en la educación y el trabajo remoto.",
    },
    {
      id: 2,
      title: "Desarrollo Sostenible: Tecnologías Verdes del Futuro",
      author: "Ing. Elena Torres",
      time: "11:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Sala B",
      abstract:
        "Análisis de nuevos materiales semiconductores para paneles solares de alta eficiencia.",
      description:
        "Presentación de prototipos desarrollados para la monitorización de suelos en zonas rurales de Jalisco.",
    },
  ];

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    document.getElementById("detail_modal").showModal();
  };

  return (
    <div className="max-w-3xl mx-auto w-full bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
      {/*  Header */}
      <div className="bg-primary text-white p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span>MI AGENDA</span>
        </div>
        <h2 className="text-2xl font-bold">Titulo del congreso</h2>
        <p className="opacity-80 mt-1">
          {format(date, "d", { locale: es }) +
            " de " +
            format(date, "MMMMMM", { locale: es }) +
            " del " +
            format(date, "yyyy", { locale: es })}
        </p>
      </div>

      {/* Lista  */}
      <div className="p-6 md:p-8">
        <h3 className="font-medium text-lg mb-6">Ponencias Inscritas</h3>

        <div className="space-y-0">
          {mockSchedule.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className={`flex justify-between items-center py-4 cursor-pointer hover:bg-base-300 transition-colors px-2 rounded-lg ${index !== mockSchedule.length - 1 ? "border-b border-base-200" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-1 h-10 bg-base-300 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-base-content">
                    {item.title}
                  </h4>
                  <p className="text-sm opacity-60">{item.author}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-primary">
                  {item.time.split(" ")[0]}
                </span>
                <span className="text-xs opacity-60 block">
                  {item.time.split(" ")[1]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-base-200 text-center text-sm opacity-50">
          Total de ponencias: {mockSchedule.length}
        </div>
      </div>
      <EventDetailModal event={selectedEvent} />
    </div>
  );
}
