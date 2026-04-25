import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import { getInstitucionesApi } from "../../api/adminApi";

export default function AjustesInstitucionesView() {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchInstituciones();
  }, []);

  const fetchInstituciones = async () => {
    try {
      const data = await getInstitucionesApi(accessToken);
      const mappedData = data.map(inst => ({
        ...inst,
        id: inst.id_institucion,
        nombre_institucion: inst.nombre,
        congresos_totales: 0, // Fallback if backend doesn't provide it
        congresos_activos: 0  // Fallback if backend doesn't provide it
      }));
      setInstituciones(mappedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <MenuCrearBorrar 
        title="Gestión de Instituciones" 
        listaElementos2={instituciones} 
        definirTipoElemento="institucion" 
      />
    </div>
  );
}
