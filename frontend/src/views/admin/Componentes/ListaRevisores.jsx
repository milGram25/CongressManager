import { FiUser } from "react-icons/fi";  //

// Info de ejemplo para dictaminadores
export default function ListaRevisores({
  titulo = "DICTAMINADORES",
  revisores = [],
  emptyMessage = "No hay evaluadores asignados para este elemento.",
}) {
  return (
    <section className="rounded-[24px] border border-black/55 bg-white px-4 py-4 shadow-sm md:px-5">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-[18px] font-semibold uppercase tracking-tight text-slate-800">{titulo}</h3>
      </div>

      <div className="space-y-3 pt-3">
        {revisores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm italic text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          revisores.map((revisor) => (
            <div key={revisor.id} className="flex items-center gap-3 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0b7c91] text-white">
                <FiUser size={15} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{revisor.nombre}</p>
                <p className="truncate text-xs uppercase tracking-wide text-slate-500">{revisor.especialidad}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
