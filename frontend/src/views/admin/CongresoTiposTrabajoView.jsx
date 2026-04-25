import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CongresoTiposTrabajoComponente from "./Componentes/TiposDeTrabajo";
import RubricasYPreguntas from "./Componentes/RubricasYPreguntas";
import { getTiposTrabajoApi, getCongresosApi } from "../../api/adminApi";

export default function CongresoTiposTrabajoView() {
  const { id } = useParams();
  const [congreso, setCongreso] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    const fetchCongresoInfo = async () => {
      try {
        const list = await getCongresosApi(accessToken);
        const current = list.find(c => c.id_congreso.toString() === id.toString());
        setCongreso(current);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCongresoInfo();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="w-full animate-in fade-in duration-500" >
      <div className="mb-10">
        <div className="flex gap-4">
          <div className="border bg-[#005a6a] rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-black text-start uppercase tracking-tighter">
            Configuración Académica: {congreso?.nombre_congreso || "Cargando..."}
          </h2>
        </div>
        <p className="pl-12 text-start text-gray-500 text-sm font-medium">
          Gestiona los tipos de trabajo, rúbricas y bancos de preguntas para este congreso específico.
        </p>
      </div>
      
      <div className="flex flex-col gap-10">
        <CongresoTiposTrabajoComponente idCongreso={id} />
        <RubricasYPreguntas idCongreso={id} />
      </div>
    </div>
  );
}
