import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CongresoTiposTrabajoComponente from "./Componentes/TiposDeTrabajo";
import RubricasYPreguntas from "./Componentes/RubricasYPreguntas";

const MOCK_TIPOS = [
  "Avances de tesis",
  "Investigaciones concluidas",
  "Experiencias de investigación",
];

function exportToCSV(tipos) {
  const csv = ["Tipo de trabajo", ...tipos].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tipos_de_trabajo.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function CongresoTiposTrabajoView() {
  

  return (
    <div className=" overflow-hidden w-250" >

      <div className="flex gap-4">
        <div className="border bg-black rounded-full h-10 w-2"></div>
        <h2 className="flex-1 text-2xl font-bold text-start">Tipos de trabajo</h2>
      </div>
      <p className="pt-2 pl-12 text-start mb-4">
        Crea tipos de trabajo y añádeles preguntas o rúbricas para que los dictaminadores o evaluadores realicen sus revisiones, respectivamente
      </p>

      <CongresoTiposTrabajoComponente/>
      <RubricasYPreguntas/>



    </div>
  );
}