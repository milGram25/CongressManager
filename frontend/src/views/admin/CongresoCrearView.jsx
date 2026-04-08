import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";

export default function CongresoCrearView() {

  const navigate = useNavigate();

  const listaEventos = [
    {
      id:1,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00",
    },
    {
      id:2,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00",
    },
    {
      id:3,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00",
    },
    {
      id:4,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00",
    }
    

  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">

      <MenuCrearBorrar title="Ver ponencia" listaElementos2={listaEventos} definirTipoElemento="congreso"/>


      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 p-2 hover:bg-base-200 rounded-full transition-colors flex items-center gap-2 text-base-content/70 hover:text-primary"
        title="Regresar a la vista anterior"
      >
        <MdArrowBack className="text-2xl" />
        <span className="text-sm font-medium">Regresar</span>
      </button>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Congreso: Crear Nuevo</h2>
        <p className="text-base-content/50 mt-2 italic">Sección en proceso de desarrollo...</p>
      </div>
    </div>
  );
}
