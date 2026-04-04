import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import ListaElementosCongresosComponente from "./Componentes/ListaElementosCongresosComponente";
import ListaHistorial from "./Componentes/ListaHistorial";

export default function CongresoDetallesView() {
  const navigate = useNavigate();
  const lista = [
        {
            id:1,
            nombre: "CIENU 2025",
            fecha_inicio: "2025-03-30 23:59:59.00000",
            fecha_final: "2025-03-31 23:59:59.00000"
        },
        {
            id:2,
            nombre: "CIENU 2026",
            fecha_inicio: "2026-02-28 23:59:59.00000",
            fecha_final: "2026-04-31 23:59:59.00000"
        },
        {
            id:3,
            nombre: "CIENU 2027",
            fecha_inicio: "2027-03-30 23:59:59.00000",
            fecha_final: "2027-03-31 23:59:59.00000"
        }
    ];
  return (
    

    <div className="flex bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      {/*Insertar detalles de congreso aquí*/}
      <ListaElementosCongresosComponente listaCongresos={lista}/>
      
    </div>
  );
}
