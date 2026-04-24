import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdDownload,
  MdFilterAlt,
  MdKeyboardArrowDown,
  MdPanTool,
  MdPerson,
  MdSearch,
  MdVisibility,
} from "react-icons/md";

// Opciones de filtro para el listado lateral
const FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pendientes", label: "Pendientes" },
  { value: "asignados", label: "Asignados" },
  { value: "no_asignados", label: "Sin asignar" },
  { value: "revisados", label: "Revisados" },
  { value: "aceptados", label: "Aceptados" },
];

// Exportar a CSV la lista de resumenes
function exportToCSV(items) {
  const header = ["ID", "Titulo", "Asignado", "Revisado", "Aceptado", "Revisores", "Fecha limite"];
  const rows = items.map((item) => [
    item.id,
    `"${item.title}"`,
    item.asignado ? "Si" : "No",
    item.revisado ? "Si" : "No",
    item.aceptado ? "Si" : "No",
    `"${item.revisores.join(", ")}"`,
    item.fechaLimite ?? "-",
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "resumenes.csv";
  link.click();
  URL.revokeObjectURL(url);
}


//formato de fecha
function formatDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
// Info al clickear iconos
function Popover({ children, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-11 z-50 w-60 rounded-3xl border border-base-300 bg-base-100 p-3 shadow-xl">
      {children}
    </div>
  );
}

// Info de la calificacion
function StatusDot({ active }) {
  return <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />;
}


function IconBtn({ active, title, popoverContent, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        onClick={() => setOpen((state) => !state)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${active
          ? "bg-[#000000] text-white hover:bg-gray-500"
          : "bg-[#e6eaed] text-slate-500 hover:bg-[#d8dde2]"
          }`}
      >
        {children}
      </button>
      {open ? <Popover onClose={() => setOpen(false)}>{popoverContent}</Popover> : null}
    </div>
  );
}

function PopoverAsignado({ item, dictaminadores }) {
  const asignados = dictaminadores.filter((dictaminador) => item.revisores.includes(dictaminador.id));

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">Revisores asignados</p>
      {asignados.length === 0 ? (
        <p className="text-xs italic text-base-content/50">Sin asignar todavia.</p>
      ) : (
        <ul className="space-y-2.5">
          {asignados.map((dictaminador) => (
            <li key={dictaminador.id} className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#000000] text-[11px] font-semibold text-white">
                {dictaminador.nombre.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-base-content">{dictaminador.nombre}</p>
                <p className="text-[11px] text-base-content/60">{dictaminador.grado}</p>
                <p className="text-[11px] text-base-content/45">
                  {dictaminador.institucion} / {dictaminador.especialidad}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Info de si ya se reviso el resumen, si esta pendiente o fecha limite
function PopoverRevisado({ item }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">Estado de revision</p>
      {item.revisado ? (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            <MdCheck size={14} className="text-green-600" />
          </div>
          <span className="text-xs font-semibold text-green-700">Revision completada</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
              <MdPanTool size={13} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-amber-700">Pendiente de revision</span>
          </div>
          {item.fechaLimite ? (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-2.5 py-2">
              <MdCalendarToday size={13} className="text-red-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-red-400">Fecha limite</p>
                <p className="text-xs font-bold text-red-600">{formatDate(item.fechaLimite)}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

//Info de si ya lo aprobaron o aun esta pendiente o sin revisar
function PopoverAceptado({ item }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">Estado de aceptacion</p>
      {item.aceptado ? (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            <MdCheck size={14} className="text-green-600" />
          </div>
          <span className="text-xs font-semibold text-green-700">Aceptado</span>
        </div>
      ) : item.revisado ? (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
            <MdPanTool size={13} className="text-amber-600" />
          </div>
          <span className="text-xs font-semibold text-amber-700">En espera de aceptacion</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-base-200">
            <MdClose size={13} className="text-base-content/40" />
          </div>
          <span className="text-xs text-base-content/55">Aun no revisado</span>
        </div>
      )}
    </div>
  );
}

// Info de ejemplo para resumenes
function ResumenRow({ item, dictaminadores, selected, onView }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-colors ml-1 ${selected ? "bg-[#eef8fa] ring-1 ring-[#0b7c91]/25" : "hover:bg-base-200/50"}`}>
      <button
        type="button"
        onClick={() => onView(item)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#000000] text-white transition-colors hover:bg-gray-500"
        title={`Ver informacion de ${item.title}`}
      >
        <MdVisibility size={18} />
      </button>

      <button type="button" onClick={() => onView(item)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
      </button>

      <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#f0f2f4] px-3 py-1.5">
        <StatusDot active={item.asignado} />
        <IconBtn active={item.asignado} title="Ver revisores asignados" popoverContent={<PopoverAsignado item={item} dictaminadores={dictaminadores} />}>
          <MdPerson size={15} />
        </IconBtn>

        <StatusDot active={item.revisado} />
        <IconBtn active={item.revisado} title="Ver estado de revision" popoverContent={<PopoverRevisado item={item} />}>
          <MdPanTool size={15} />
        </IconBtn>

        <StatusDot active={item.aceptado} />
        <IconBtn active={item.aceptado} title="Ver estado de aceptacion" popoverContent={<PopoverAceptado item={item} />}>
          <MdCheck size={16} />
        </IconBtn>
      </div>
    </div>
  );
}

export default function ListaResumenes({ listaElementos = [], dictaminadores = [], selectedId = null, onView = () => { } }) {
  const [ordenarItem, setOrdenarItem] = useState("pendientes");
  const [valorInput, setValorInput] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const listaFiltrada = useMemo(() => {
    const normalizedSearch = valorInput.trim().toLowerCase();
    let resultado = listaElementos;

    if (normalizedSearch) {
      resultado = resultado.filter((item) => item.title.toLowerCase().includes(normalizedSearch));
    }

    switch (ordenarItem) {
      case "asignados":
        return resultado.filter((item) => item.asignado);
      case "no_asignados":
        return resultado.filter((item) => !item.asignado);
      case "revisados":
        return resultado.filter((item) => item.revisado);
      case "aceptados":
        return resultado.filter((item) => item.aceptado);
      case "pendientes":
        return resultado.filter((item) => !item.aceptado);
      default:
        return resultado;
    }
  }, [listaElementos, ordenarItem, valorInput]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (listaFiltrada.length > 0 && !listaFiltrada.some((item) => item.id === selectedId)) {
      onView(listaFiltrada[0]);
    }
  }, [listaFiltrada, onView, selectedId]);

  const filterLabel = FILTER_OPTIONS.find((option) => option.value === ordenarItem)?.label ?? "Filtrar";

  function restaurarBusqueda() {
    setValorInput("");
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/55 bg-white shadow-sm">
      <div className="flex items-center gap-3 bg-[#000000] px-3 py-2.5">
        <label className="relative flex-1">
          <MdSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-full border border-slate-300 bg-white pl-11 pr-12 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-500 focus:border-[#000000]"
            type="text"
            placeholder="Buscar resumen"
            onChange={(event) => setValorInput(event.target.value)}
            value={valorInput}
          />
          {valorInput ? (
            <button
              type="button"
              onClick={restaurarBusqueda}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Limpiar busqueda"
            >
              <MdClose size={16} />
            </button>
          ) : null}
        </label>

        <button
          type="button"
          onClick={restaurarBusqueda}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/70 text-white transition-colors hover:bg-white/10"
          title="Restablecer busqueda"
        >
          <MdClose size={18} />
        </button>
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[280px]">
            <h3 className="text-[30px] font-black tracking-tight text-slate-900">RESÚMENES</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Aquí puede encontrar todos los resúmenes.
              <br />
              Para filtrarlos, escoja una opción del filtro
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportToCSV(listaFiltrada)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#000000] text-white transition-colors hover:bg-gray-500"
              title="Descargar CSV"
            >
              <MdDownload size={20} />
            </button>

            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((state) => !state)}
                className="flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#000000]"
              >
                <MdFilterAlt size={18} className="text-[#]" />
                <span>{filterLabel}</span>
                <MdKeyboardArrowDown size={18} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>

              {filterOpen ? (
                <div className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setOrdenarItem(option.value);
                        setFilterOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${ordenarItem === option.value
                        ? "bg-[#eef8fa] font-semibold text-[#000000]"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Lista disponible</span>
          <span className="text-xs font-medium text-slate-400">{listaFiltrada.length} resultado(s)</span>
        </div>

        <div className="max-h-[395px] space-y-2 overflow-y-auto pr-1 pb-1 pt-1">
          {listaFiltrada.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm italic text-slate-400">
              No se encontraron resumenes con ese filtro.
            </div>
          ) : (
            listaFiltrada.map((item) => (
              <ResumenRow
                key={item.id}
                item={item}
                dictaminadores={dictaminadores}
                selected={item.id === selectedId}
                onView={onView}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
