import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico"

export default function PonenciasView() {
  const navigate = useNavigate();

  const listaEventos = [
    {
      id:1,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mala ponencia",
      nombre_ponente:"Yo mero",
      cupos:10,
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T15:00"
    },
    {
      id:2,
      nombre_congreso:"Hola mundo 2",
      nombre_evento:"Buena ponencia",
      nombre_ponente:"Yo mero",
      cupos:20,
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T14:00"
    },
    {
      id:3,
      nombre_congreso:"Hola mundo 3",
      nombre_evento:"Buena ponencia",
      nombre_ponente:"Yo mero",
      cupos:30,
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T13:00"
    },
    {
      id:4,
      nombre_congreso:"Hola mundo 4",
      nombre_evento:"Buena ponencia",
      nombre_ponente:"Yo mero",
      cupos:30,
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T12:00"
    }
    

  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">

      <MenuCrearBorrar title="Ver ponencia" listaElementos2={listaEventos} definirTipoElemento="ponencia"/>
      
    </div>
  );
}
