export default function EventDetailModal({ event }) {
  // if (!event) return null;

  return (
    <dialog id="detail_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-100 max-w-2xl">
        {/* header */}
        {event ? (
          <>
            <div className="flex justify-between items-start border-b border-base-200 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-2xl text-primary">
                  {event.title}
                </h3>
                <p className="text-sm opacity-70 mt-1">{event.author}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* info */}
              <div className="grid grid-cols-2 gap-4 bg-base-200 p-4 rounded-lg text-sm">
                <div>
                  <span className="font-bold block opacity-50 uppercase text-[10px]">
                    Fecha y Hora
                  </span>
                  <p>
                    {event.date} • {event.time}
                  </p>
                </div>
                <div>
                  <span className="font-bold block opacity-50 uppercase text-[10px]">
                    Lugar
                  </span>
                  <p>{event.location}</p>
                </div>
              </div>

              {/* abstract */}
              <div>
                <span className="font-bold block text-primary mb-2">
                  Abstract
                </span>
                <p className="text-sm leading-relaxed text-justify italic">
                  "{event.abstract}"
                </p>
              </div>

              {/* descripci[on*/}
              <div>
                <span className="font-bold block text-primary mb-2">
                  Descripción
                </span>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-10 text-center opacity-50">Cargando...</div>
        )}

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
