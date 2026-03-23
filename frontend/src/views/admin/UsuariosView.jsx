import { useNavigate } from "react-router-dom";
import { MdBadge, MdReceipt, MdHistory } from "react-icons/md";

export default function UsuariosView() {
  const navigate = useNavigate();

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <h2 className="text-2xl font-bold mb-8 text-center">Gestión de Usuarios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto py-10">
        {/* Opción Constancias */}
        <button 
          onClick={() => navigate('constancias')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdBadge className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Constancias</h3>
            <p className="text-sm text-base-content/50 mt-2">Gestión y generación de certificados</p>
          </div>
        </button>

        {/* Opción Facturas */}
        <button 
          onClick={() => navigate('facturas')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdReceipt className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Facturas</h3>
            <p className="text-sm text-base-content/50 mt-2">Control y revisión de facturación electrónica</p>
          </div>
        </button>

        {/* Opción Historial */}
        <button 
          onClick={() => navigate('historial')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdHistory className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Historial</h3>
            <p className="text-sm text-base-content/50 mt-2">Registro de actividades y cambios de usuarios</p>
          </div>
        </button>
      </div>
    </div>
  );
}
