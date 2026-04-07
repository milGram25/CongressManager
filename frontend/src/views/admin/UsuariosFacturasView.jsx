import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import AdjuntarFactura from "./Componentes/AdjuntarFactura";

export default function UsuariosFacturasView() {
  const navigate = useNavigate();
  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <AdjuntarFactura/>

    </div>
  );
}
