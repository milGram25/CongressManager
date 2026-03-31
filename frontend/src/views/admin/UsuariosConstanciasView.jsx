import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import AdjuntarComponente from "./Componentes/AdjuntarComponente";

export default function UsuariosConstanciasView() {
  const navigate = useNavigate();
  return (
    <div>
      <AdjuntarComponente
      persona={""}
      nombreElementoSubir={"constancia"}
      />
      {/*<button 
        onClick={() => navigate(-1)} 
        className="mb-6 p-2 hover:bg-base-200 rounded-full transition-colors flex items-center gap-2 text-base-content/70 hover:text-primary"
        title="Regresar a la vista anterior"
      >
        <MdArrowBack className="text-2xl" />
        <span className="text-sm font-medium">Regresar</span>
      </button>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Usuarios: constancias</h2>
        <p className="text-base-content/50 mt-2 italic">Sección en proceso de desarrollo...</p>
      </div>*/}
    </div>
  );
}
