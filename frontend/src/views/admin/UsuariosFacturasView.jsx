import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import AdjuntarFactura from "./Componentes/AdjuntarFactura";

export default function UsuariosFacturasView() {
  const navigate = useNavigate();
  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">

      <div className="flex gap-4">
        <div className="border bg-black rounded-full h-10 w-2"></div>
        <h2 className="flex-1 text-2xl font-bold text-start">Adjuntar factura</h2>
      </div>
      <p className="pt-2 pl-12 text-start mb-4">
        Selecciona a la persona y gestiona las facturas según sus roles de este congreso
      </p>

      <AdjuntarFactura/>

    </div>
  );
}
