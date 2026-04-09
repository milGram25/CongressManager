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

      <MenuCrearBorrar title="Crear congresos" listaElementos2={listaEventos} definirTipoElemento="congreso"/>


      
    </div>
  );
}
