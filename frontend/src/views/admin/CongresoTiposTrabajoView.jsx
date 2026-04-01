import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import RubricasYPreguntas from "./Componentes/RubricasYPreguntas.jsx";

export default function CongresoTiposTrabajoView() {
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
      <RubricasYPreguntas />
    </div>
  );
}
