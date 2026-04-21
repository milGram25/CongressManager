import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";

export default function UsuariosHistorialView() {
  const navigate = useNavigate();

  const listaEventos = [
    {
      id: 1,
      nombre_institucion: "CIENU",
      congresos_totales: 10,
      congresos_activos: 1,
      ruta_imagen: "ruta imagen"

    },
    {
      id: 2,
      nombre_institucion: "RIDMAE",
      congresos_totales: 10,
      congresos_activos: 1,
      ruta_imagen: "ruta imagen"

    }

  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">

      <MenuCrearBorrar title="Ver institución" listaElementos2={listaEventos} definirTipoElemento="institucion" />


    </div>
  );
}
