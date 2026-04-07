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
    <div className=" rounded-3xl overflow-hidden w-250" >
      <CongresoTiposTrabajoComponente/>
      <RubricasYPreguntas/>



    </div>
  );
}