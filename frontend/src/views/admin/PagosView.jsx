import PagosComponente from "./Componentes/PagosComponente"
import ListaCongresos from  "./Componentes/ListaCongresosComponente"

export default function AdminPagosView() {
  //Estas listas hay que borrarlas, ya que solo están como ejemplos

   const listaPagos = [
    { id: "1", nombre: "Ernesto", rol: "Ponente", fecha:"28 / marzo / 2026 - 12:54", estatus: "pagado"},
    { id: "2", nombre: "Jimenita", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54",estatus: "pagado" },
    { id: "3", nombre: "Kaleb", rol: "Asistente", fecha:"28 / marzo / 2026 - 12:54", estatus: "pendiente" },
    { id: "4", nombre: "Gabriel", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54", estatus: "pendiente" },
    { id: "5", nombre: "Lalo", rol: "Miembro comité", fecha:"28 / marzo / 2026 - 12:54", estatus: "pagado" }
  ];


  return (
    
    
    <div>
      {/*<div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold">Pagos</h2>
      <p className="text-base-content/50 mt-2 italic">Sección en proceso de desarrollo...</p>
      
      
    </div>*/}
      <PagosComponente
        listaPagos={listaPagos}
        />


      </div>
  );
}
