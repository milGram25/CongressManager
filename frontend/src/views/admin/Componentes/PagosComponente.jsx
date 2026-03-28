import { useState } from "react";

export default function PagosComponente() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const date = new Date();
  const mockSchedule = [
    { id: "1", nombre: "Ernesto", rol: "Ponente", fecha:"28 / marzo / 2026 - 12:54", estatus: "pagado"},
    { id: "2", nombre: "Jimenita", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54",estatus: "pagado" },
    { id: "3", nombre: "Kaleb", rol: "Asistente", fecha:"28 / marzo / 2026 - 12:54", estatus: "pendiente" },
    { id: "4", nombre: "Gabriel", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54", estatus: "pendiente" },
    { id: "5", nombre: "Lalo", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54", estatus: "pagado" }
  ];

  return (

    <div className="mx-auto w-full p-4 bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      {/*header*/}
      <div className="flex pb-4 pr-6 w-full border-b m-4 gap-4">
  
        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Nombre</h1>
          <select className="rounded-full">
            <option value="Todos">Todos</option>
            <option value="Orden alfabético">Orden alfabético</option>
            <option value="Orden alfabético inverso">Orden alfabético inverso</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Fecha</h1>
          <select className="rounded-full">
            <option value="Recientes">Recientes</option>
            <option value="Antiguos">Antiguos</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Rol</h1>
          <select className="rounded-full">
            <option value="Todos">Todos</option>
            <option value="Comité académico">Comité académico</option>
            <option value="Asistentes">Asistentes</option>
            <option value="Talleristas">Talleristas</option>
            <option value="Ponentes">Ponentes</option>
            <option value="Dictaminadores">Dictaminadores</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Estatus</h1>
          <select className="rounded-full">
            <option value="Todos">Todos</option>
            <option value="Pendientes">Pendientes</option>
            <option value="Pagados">Pagados</option>
          </select>
        </div>

      </div>
      {/*valores*/}
      <div className="p-4 space-y-2 w-full">
        {mockSchedule.map((item) => (
          <div
            key={item.id}
            className={`text-center flex justify-between p-3 border rounded-xl shadow-sm cursor-pointer transition-colors
              ${selectedPayment?.id === item.id
                ? "bg-blue-100 border-blue-400"  //resalta el seleccionado
                : "hover:bg-base-200"
              }`}
            onClick={() =>
              setSelectedPayment(selectedPayment?.id === item.id ? null : item) //toggle
            }
          >
            <div className="flex-1 flex">{item.nombre}</div>
            <div className="flex-1 flex">{item.rol}</div>
            <div className="flex-1 flex">{item.fecha}</div>
            <div className="flex-1 flex gap-3 items-center">
              <div className={`w-2 h-2  rounded-full ${item.estatus === "pagado" ? "bg-green-600" : "bg-red-600"}`}></div>{item.estatus}</div>
          </div>
        ))}
      </div>

      {/*Panel de detalle del pago seleccionado. BORRAR, ya que solo es para ver si funciona*/}
      {selectedPayment && (
        <div className="p-4 border-t bg-base-200">
          <h2 className="font-semibold mb-1">Detalle</h2>
          <p>Nombre: {selectedPayment.nombre}</p>
          <p>Rol: {selectedPayment.rol}</p>
          <p>Estatus: {selectedPayment.estatus}</p>
        </div>
      )}
    </div>
  );
}