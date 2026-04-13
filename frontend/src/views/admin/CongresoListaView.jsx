import React from "react";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";

export default function CongresoListaView() {
  const listaEventos = [
    {
      id: 1,
      nombre_congreso: "RIDMAE 2025",
      sede: "CUALTOS",
      cantidad_eventos: 100,
      nombre_institucion: "RIDMAE",
      fecha_hora_inicio: "2026-04-08T08:00",
      fecha_hora_final: "2026-04-08T10:00"
    },
    {
      id: 2,
      nombre_congreso: "CIENU 2026",
      sede: "CUALTOS",
      cantidad_eventos: 120,
      nombre_institucion: "CIENU",
      fecha_hora_inicio: "2026-05-10T09:00",
      fecha_hora_final: "2026-05-15T18:00"
    }
  ];

  return (
    <div className="w-full h-full p-4 md:p-8">
      <MenuCrearBorrar 
          title="Gestión de Congresos" 
          listaElementos2={listaEventos} 
          definirTipoElemento="congreso"
      />
    </div>
  );
}
