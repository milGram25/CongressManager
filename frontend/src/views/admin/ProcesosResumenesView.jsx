import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import ListaElementosCongresosComponente from "./Componentes/ListaElementosCongresosComponente";

export default function ProcesosResumenesView() {
  const navigate = useNavigate();
  const lista = [
        {
            id:1,
            nombre: "CIENU 2025",
            fecha_inicio: "2025-03-30 23:59:59.00000 ",
            fecha_final: "2025-03-31 23:59:59.00000 "
        },
        {
            id:2,
            nombre: "CIENU 2026",
            fecha_inicio: "2026-02-28 23:59:59.00000 ",
            fecha_final: "2026-04-31 23:59:59.00000 "
        },
        {
            id:3,
            nombre: "CIENU 2027",
            fecha_inicio: "2027-03-30 23:59:59.00000 ",
            fecha_final: "2027-03-31 23:59:59.00000 "
        }
    ];

  return (
    <div>
      
      <ListaElementosCongresosComponente listaCongresos={lista}/>
      {/*<div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 p-2 hover:bg-base-200 rounded-full transition-colors flex items-center gap-2 text-base-content/70 hover:text-primary"
        title="Regresar a la vista anterior"
      >
        <MdArrowBack className="text-2xl" />
        <span className="text-sm font-medium">Regresar</span>
      </button>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Procesos: Resúmenes</h2>
        <p className="text-base-content/50 mt-2 italic">Sección en proceso de desarrollo...</p>
      </div>
    </div>*/}


    </div>
    
  );
}
