import { useState } from "react";

export default function PagosComponente({ listaPagos }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [criterioOrden, setCriterioOrden] = useState({ criterio: "ninguno", valor: "todos" });
  //const [listaPagosFiltrada,setListaPagosFiltrada] = useState(listaPagos); //para aplicar filtros sobre filtros
  const datosOrdenados = () => { //esta función ordena la lista pagos según el criterio de selección: nombre, rol, fecha y estatus; aunque fecha está por verse después
    switch (criterioOrden.criterio) {
      case "nombre":
        return [...listaPagos].sort((a, b) => {
          switch (criterioOrden.valor) {
            case "asc":  return a.nombre.localeCompare(b.nombre);
            case "desc": return b.nombre.localeCompare(a.nombre);
            default: return 0;
          }
        });
      case "rol":
        return [...listaPagos].filter((item) => {
          if (criterioOrden.valor === "todos") return true;
          return item.rol.toLowerCase() === criterioOrden.valor.toLowerCase();
        });
      case "fecha":
        return [...listaPagos].sort((a, b) => { //aún no funciona, ya que Date no está recibiendo el valor en el formato correcto
        // (en vez de YYYY-MM-DDTHH-MM-SS, recibe algo como 28 / marzo / 2026 - 12:54; ya se verá en la base de datos)
          switch (criterioOrden.valor) {
            case "recientes": return new Date(b.fecha) - new Date(a.fecha);
            case "antiguos":  return new Date(a.fecha) - new Date(b.fecha);
            default: return 0;
          }
        });
      case "estatus":
        return [...listaPagos].filter((item) => {
          if (criterioOrden.valor === "todos") return true;
          return item.estatus.toLowerCase() === criterioOrden.valor.toLowerCase();
        });
      default:
        return listaPagos;
    }
  };

  return (
    <div className="mx-auto w-full p-4 bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      
      <div className="flex pb-4 pr-6 w-full border-b m-4 gap-4">

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Nombre</h1>

          <select className="rounded-full" onChange={(e) => setCriterioOrden({ criterio: "nombre", valor: e.target.value })}>
            <option value="todos">Todos</option>
            <option value="asc">Orden alfabético</option>
            <option value="desc">Orden alfabético inverso</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Rol</h1>
          <select className="rounded-full" onChange={(e) => setCriterioOrden({ criterio: "rol", valor: e.target.value })}>
            <option value="todos">Todos</option>
            <option value="comité académico">Comité académico</option>
            <option value="asistente">Asistentes</option>
            <option value="tallerista">Talleristas</option>
            <option value="ponente">Ponentes</option>
            <option value="dictaminador">Dictaminadores</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Fecha</h1>
          <select className="rounded-full" onChange={(e) => setCriterioOrden({ criterio: "fecha", valor: e.target.value })}>
            <option value="recientes">Recientes</option>
            <option value="antiguos">Antiguos</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-xl font-bold">Estatus</h1>
          <select className="rounded-full" onChange={(e) => setCriterioOrden({ criterio: "estatus", valor: e.target.value })}>
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagado">Pagados</option>
          </select>
        </div>

      </div>

      <div className="p-4 space-y-2 w-full">
        {datosOrdenados().map((item) => (
          <div
            key={item.id}
            className={`text-center flex justify-between p-3 border rounded-xl shadow-sm cursor-pointer transition-colors
              ${selectedPayment?.id === item.id ? "bg-blue-100 border-blue-400" : "hover:bg-base-200"}`}
            onClick={() => setSelectedPayment(selectedPayment?.id === item.id ? null : item)}
          >
            <div className="flex-1 flex">{item.nombre}</div>
            <div className="flex-1 flex">{item.rol}</div>
            <div className="flex-1 flex">{item.fecha}</div>
            <div className="flex-1 flex gap-3 items-center">
              <div className={`w-2 h-2 rounded-full ${item.estatus.toLowerCase() === "pagado" ? "bg-green-600" : "bg-red-600"}`}></div>
              {item.estatus}
            </div>
          </div>
        ))}
      </div>

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