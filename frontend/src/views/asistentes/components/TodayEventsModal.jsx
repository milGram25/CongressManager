import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TodayEventsModal({ selectedDate, events }) {
  return (
    <dialog id="events_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-100">
        <h3 className="font-bold text-2xl border-b border-base-200 pb-4 mb-4 first-letter:uppercase text-primary">
          {selectedDate
            ? format(selectedDate, "EEEE d", { locale: es }) +
              " de " +
              format(selectedDate, "MMMM", { locale: es })+
              " del " +
              format(selectedDate, "yyyy", { locale: es })
            : "es"}
        </h3>

        <div className="space-y-4 my-6">
          {events && events.length > 0 ? (
            events.map((evt, i) => (
              <div
                key={i}
                className="flex flex-col p-4 bg-base-200 rounded-lg border-l-4 border-primary shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-lg">{evt.title}</span>
                  <span className="badge badge-sm badge-outline uppercase opacity-70 border-primary text-primary">
                    {evt.type}
                  </span>
                </div>
                <span className="text-sm opacity-70 font-medium mb-2">
                  {evt.time}
                </span>

                <p className="text-sm opacity-80 leading-relaxed">
                  {evt.description}
                </p>
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
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
