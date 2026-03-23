import { useNavigate } from "react-router-dom";
import { MdDescription, MdArticle } from "react-icons/md";

export default function ProcesosView() {
  const navigate = useNavigate();

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <h2 className="text-2xl font-bold mb-8 text-center">Seleccione el tipo de proceso</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-10">
        {/* Opción Resúmenes */}
        <button 
          onClick={() => navigate('resumenes')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdDescription className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Resúmenes</h3>
            <p className="text-sm text-base-content/50 mt-2">Gestión y revisión de propuestas iniciales</p>
          </div>
        </button>

        {/* Opción Extensos */}
        <button 
          onClick={() => navigate('extensos')}
          className="group p-10 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MdArticle className="text-4xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Extensos</h3>
            <p className="text-sm text-base-content/50 mt-2">Gestión de documentos finales y publicaciones</p>
          </div>
        </button>
      </div>
    </div>
  );
}
