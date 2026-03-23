import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EventDetailModal from "./EventDetailModal";

export default function TodayEventsModal({ selectedDate, events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    const modal = document.getElementById("detail_modal");
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <dialog id="events_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-100">
        <h3 className="font-bold text-2xl border-b border-base-200 pb-4 mb-4 first-letter:uppercase text-primary">
          {selectedDate
            ? format(selectedDate, "EEEE d", { locale: es }) +
              " de " +
              format(selectedDate, "MMMM", { locale: es }) +
              " del " +
              format(selectedDate, "yyyy", { locale: es })
            : "Eventos"}
        </h3>

        <div className="space-y-0 my-6">
          {events && events.length > 0 ? (
            events.map((evt, i) => (
              <div
                key={i}
                onClick={() => handleOpenDetail(evt)}
                className={`flex justify-between items-center py-4 cursor-pointer hover:bg-base-300 transition-colors px-2 rounded-lg ${i !== events.length - 1 ? "border-b border-base-200" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 bg-base-300 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-base-content">
                      {evt.title}
                    </h4>
                    <p className="text-sm opacity-60">{evt.author || "Sin autor"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">
                    {evt.time.split(" ")[0]}
                  </span>
                  <span className="text-xs opacity-60 block">
                    {evt.time.split(" ")[1]}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 opacity-50">
              <p>No hay eventos programados para este día.</p>
            </div>
          )}
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary text-white px-8">Cerrar</button>
          </form>
        </div>
        
        {/* Detalle del evento seleccionado */}
        <EventDetailModal event={selectedEvent} />
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
