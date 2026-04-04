import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import ListaHistorial from "./Componentes/ListaHistorial";

export default function UsuariosHistorialView() {
  const navigate = useNavigate();

  const lista = [
        {
            id:1,
            nombre: "Ernesto",
            fecha: "2025-03-30 23:59:59.00000",
            rol: "comite academico",
            accion: "modificar fecha evento"
        },
        {
            id:2,
            nombre: "Jimenita",
            fecha: "2026-04-04 10:59:59.00000",
            rol: "ponente",
            accion: "realizar pago"

        },
        {
            id:3,
            nombre: "Kaleb",
            fecha: "2026-03-15 23:59:59.00000",
            rol: "evaluador",
            accion: "cerrar sesion"

        },
        {
            id:3,
            nombre: "Forense",
            fecha: "2026-03-15 23:59:59.00000",
            rol: "dictaminador",
            accion: "solicitar ponencia"

        }
    ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <ListaHistorial listaElementos={lista}/>
     
    </div>
  );
}
