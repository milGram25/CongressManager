import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EventDetailModal from "../../../components/EventDetailModal";
import { MdFilterList } from "react-icons/md";

export default function AgendaList() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filtroEje, setFiltroEje] = useState("Todos");
  const date = new Date();

  // Ejes temáticos CIENU 2026 (Placeholders para filtro)
  const EJES_TEMATICOS = [
    "Todos",
    "Alfabetización Digital",
    "Brecha Digital",
    "Capacitación Docente",
    "Competencias Genéricas",
    "IA en Educación",
    "Educación para la Sostenibilidad",
    "Innovación Pedagógica",
    "Inclusión y Equidad",
    "Modalidades Educativas"
  ];

  // Datos de ponencias registrados (Mock ampliado con ejes)
  const mockSchedule = useMemo(() => [
    {
      id: 1,
      title: "Inteligencia Artificial y su Impacto en la Sociedad Digital",
      author: "Dr. Gabriel Mendoza",
      time: "09:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Auditorio A",
      eje: "IA en Educación",
      abstract: "Placeholdel abstract",
      description: "Placeholder description",
    },
    {
      id: 2,
      title: "Desarrollo Sostenible: Tecnologías Verdes del Futuro",
      author: "Ing. Elena Torres",
      time: "11:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Sala B",
      eje: "Educación para la Sostenibilidad",
      abstract: "Placeholdel abstract",
      description: "Placeholder description",
    },
    {
      id: 3,
      title: "Título de Ponencia sobre Brecha",
      author: "Autor Ejemplo",
      time: "12:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Virtual 1",
      eje: "Brecha Digital",
      abstract: "Placeholdel abstract",
      description: "Placeholder description",
    },
    {
      id: 4,
      title: "Innovación en el Aula",
      author: "Autor Ejemplo",
      time: "13:00 hrs",
      date: "28 de Febrero, 2026",
      location: "Sala C",
      eje: "Innovación Pedagógica",
      abstract: "Placeholdel abstract",
      description: "Placeholder description",
    }
  ], []);

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    document.getElementById("detail_modal").showModal();
  };

  const filteredSchedule = useMemo(() => {
    if (filtroEje === "Todos") return mockSchedule;
    return mockSchedule.filter(item => item.eje === filtroEje);
  }, [filtroEje, mockSchedule]);

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
            format(date, "MMMM", { locale: es }) +
            " del " +
            format(date, "yyyy", { locale: es })}
        </p>
      </div>

      {/* Selector de Ejes Temáticos */}
      <div className="p-4 bg-base-200 border-b border-base-300 overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          <span className="text-xs font-bold opacity-50 flex items-center gap-1 uppercase">
            <MdFilterList /> Filtrar por Eje:
          </span>
          <div className="flex gap-2">
            {EJES_TEMATICOS.map((eje) => (
              <button
                key={eje}
                onClick={() => setFiltroEje(eje)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filtroEje === eje
                    ? "bg-primary/80 text-white shadow-md"
                    : "bg-base-100 hover:bg-base-300 text-neutral border border-base-300"
                }`}
              >
                {eje}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de Filtro Activo */}
      <div className="px-6 md:px-8 py-4 bg-base-100 flex justify-between items-center">
         <h3 className="font-medium text-lg text-neutral">Ponencias Inscritas</h3>
         <div className="text-xs">
            Mostrando: <span className="font-bold text-primary">{filtroEje}</span>
         </div>
      </div>

      {/* Lista  */}
      <div className="px-6 md:px-8 pb-8">
        <div className="space-y-0">
          {filteredSchedule.length > 0 ? (
            filteredSchedule.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className={`flex justify-between items-center py-4 cursor-pointer hover:bg-base-200 transition-colors px-2 rounded-lg ${index !== filteredSchedule.length - 1 ? "border-b border-base-200" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 bg-primary/80 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-base-content">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] badge badge-ghost uppercase opacity-70">{item.eje}</span>
                       <p className="text-sm opacity-60">{item.author}</p>
                    </div>
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
            ))
          ) : (
            <div className="py-12 text-center opacity-50 italic">
               No hay ponencias registradas para este eje temático hoy.
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-base-200 text-center text-sm opacity-50">
          Total de ponencias: {filteredSchedule.length}
        </div>
      </div>
      <EventDetailModal event={selectedEvent} />
    </div>
  );
}
