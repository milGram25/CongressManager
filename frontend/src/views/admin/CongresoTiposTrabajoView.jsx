import { useState } from "react";
import CongresoTiposTrabajoComponente from "./Componentes/TiposDeTrabajo";
import RubricasYPreguntas from "./Componentes/RubricasYPreguntas";

const MOCK_TIPOS = [
  { id: 1, nombre: "Avances de tesis",            tipo: "rubrica",  count: 3 },
  { id: 2, nombre: "Investigaciones concluidas",   tipo: "none",     count: 0 },
  { id: 3, nombre: "Experiencias de investigación", tipo: "pregunta", count: 1 },
];

function getBadge(tipo, count) {
  if (tipo === "rubrica")
    return <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">{count} rúbricas</span>;
  if (tipo === "pregunta")
    return <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{count} pregunta{count !== 1 ? "s" : ""}</span>;
  return <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">Sin rúbricas</span>;
}

function exportToCSV(tipos) {
  const csv = ["Tipo de trabajo", ...tipos.map(t => t.nombre)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tipos_de_trabajo.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function CongresoTiposTrabajoView() {
  const [tipos, setTipos] = useState(MOCK_TIPOS);
  const [selectedId, setSelectedId] = useState(1);

  return (
    <div className=" overflow-hidden">

  {/* IZQUIERDA */}
  {/*<div className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-800">Tipos de trabajo</span>
      <button className="text-xs border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50">
        + Agregar
      </button>
    </div>

    <div className="flex flex-col gap-2 flex-1">
      {tipos.map(t => (
        <div
          key={t.id}
          onClick={() => setSelectedId(t.id)}
          className={`
            flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
            ${selectedId === t.id 
              ? "border border-purple-200 bg-purple-50" 
              : "bg-gray-50 hover:bg-gray-100 border border-transparent"}
          `}
        >
          <span className="text-sm text-gray-800">{t.nombre}</span>
          {getBadge(t.tipo, t.count)}
        </div>
      ))}
    </div>
  </div>*/}

  {/* DERECHA */}
  <div className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col">
    <div className="flex-1 overflow-hidden">
      <CongresoTiposTrabajoComponente selectedId={selectedId} />
      <RubricasYPreguntas selectedId={selectedId} />
    </div>
  </div>

</div>
  );
}