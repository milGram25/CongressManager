import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";
import { getPonenciasApi, getCongresosApi, getInstitucionesApi, getPonenciasMagistralesApi } from "../../api/adminApi";

export default function PonenciasView() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const idCongreso = queryParams.get('id_congreso');
  const accessToken = localStorage.getItem('congress_access');

  const [listaEventos, setListaEventos] = useState([]);
  const [congresos, setCongresos] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ponenciasData, magistralesData, congresosData, instData] = await Promise.all([
          getPonenciasApi(accessToken, idCongreso),
          getPonenciasMagistralesApi(accessToken, idCongreso).catch(() => []),
          getCongresosApi(accessToken),
          getInstitucionesApi(accessToken)
        ]);

        const normales = ponenciasData.map(p => ({
          ...p,
          id: p.id_ponencia,
          tipo_ponencia: 'normal',
        }));

        const magistrales = magistralesData.map(m => ({
          ...m,
          id: m.id_ponencia_magistral,
          nombre_evento: m.titulo,
          nombre_ponente: (m.ponentes && m.ponentes.length > 0) ? m.ponentes[0].nombre_completo : null,
          fecha_hora_inicio: m.fecha_inicio,
          fecha_hora_final: m.fecha_fin,
          tipo_ponencia: 'magistral',
        }));

        setListaEventos([...normales, ...magistrales]);
        setCongresos(congresosData.map(c => ({ id: c.id_congreso, nombre: c.nombre_congreso })));
        setInstituciones(instData.map(i => ({ id: i.id_institucion, nombre: i.nombre })));
      } catch (error) {
        console.error("Error al cargar ponencias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idCongreso, accessToken]);

  if (loading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="w-full h-full p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate('/admin/eventos/congresos/lista')}
            className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
          >
            <MdArrowBack size={20} />
          </button>
          <h2 className="text-3xl font-bold uppercase tracking-tight">Gestión de Ponencias</h2>
        </div>
        <p className="text-sm text-base-content/50 ml-12">
          {idCongreso 
            ? "Filtrando ponencias del congreso seleccionado" 
            : "Aquí se gestionan todas las ponencias registradas"}
        </p>
      </div>

      <div className="mb-10">
        <MenuCrearBorrar 
            title={idCongreso ? "Ponencias Filtradas" : "Todas las Ponencias"} 
            listaElementos2={listaEventos} 
            definirTipoElemento="ponencia" 
        />
      </div>
    </div>
  );
}
