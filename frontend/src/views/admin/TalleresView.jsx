import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";


export default function TalleresView() {
  const navigate = useNavigate();
  const listaEventos = [
    {
      id:1,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T10:00",
      cupos:"40"
    },
    {
      id:2,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T10:00",
      cupos:"40"
    },
    {
      id:3,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T10:00",
      cupos:"40"
    },
    {
      id:4,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T10:00",
      cupos:"40"
    },
    

  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <MenuCrearBorrar title="Ver ponencia" listaElementos2={listaEventos} definirTipoElemento="taller"/>

    
      
    </div>
  );
}
