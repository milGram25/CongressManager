import React from "react";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";

export default function CongresoListaView() {

  const MOCK_INSTITUCIONES = [
    { id: 1, nombre: "CIENU" },
    { id: 2, nombre: "RIDMAE" }
  ];
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
    <div className="flex flex-col  w-full h-full p-4 md:p-8">

      <div>
        <div className="flex gap-4">
          <div className="border bg-black rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-bold text-start">Congresos</h2>
        </div>
        <p className="pl-12 text-start text-gray-500 mb-10">
          Aquí se crean, ven y modifican los congresos
        </p>
      </div>
      <div className="w-full px-30 mb-5 items-center justify-center ">
        <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={MOCK_INSTITUCIONES} />

      </div>
      <MenuCrearBorrar
        title="Gestión de Congresos"
        listaElementos2={listaEventos}
        definirTipoElemento="congreso"
      />
    </div>
  );
}
