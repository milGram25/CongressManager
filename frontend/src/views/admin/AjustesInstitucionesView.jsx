import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

export default function UsuariosHistorialView() {
  const navigate = useNavigate();
  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 p-2 hover:bg-base-200 rounded-full transition-colors flex items-center gap-2 text-base-content/70 hover:text-primary"
        title="Regresar a la vista anterior"
      >
        <MdArrowBack className="text-2xl" />
        <span className="text-sm font-medium">Regresar</span>
      </button>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Ajustes: Instituciones</h2>
        <p className="text-base-content/50 mt-2 italic">Sección en proceso de desarrollo...</p>
      </div>
    </div>
  );
}
