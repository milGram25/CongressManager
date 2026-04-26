import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import DetallesEditarTaller from "./Componentes/DetallesEditarTaller";

export default function TallerDetallesView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = new URLSearchParams(location.search).get('edit') === 'true';

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header con navegación */}
      <div className="flex items-center gap-4 mb-2">
          <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
          >
              <MdArrowBack size={20} />
          </button>
          <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Detalles del Taller</h2>
              <p className="text-sm text-base-content/50">Consulta o modifica la información del taller</p>
          </div>
      </div>

      <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden min-h-[400px]">
        <DetallesEditarTaller 
            key={id}
            tallerData={{ id: parseInt(id) }} 
            initialModificando={isEditing} 
            isFullPage={true} 
        />
      </div>
    </div>
  );
}
