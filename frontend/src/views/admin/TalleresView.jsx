import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import DetallesEditarTaller from "./Componentes/DetallesEditarTaller.jsx";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";
import { getTalleresApi, getCongresosApi, getInstitucionesApi } from "../../api/adminApi";

export default function TalleresView() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const idCongreso = queryParams.get('id_congreso');
  const accessToken = localStorage.getItem('congress_access');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);
  const [listaEventos, setListaEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [congresos, setCongresos] = useState([]);
  const [instituciones, setInstituciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [talleresData, congresosData, instData] = await Promise.all([
          getTalleresApi(accessToken, idCongreso),
          getCongresosApi(accessToken),
          getInstitucionesApi(accessToken)
        ]);

        console.log("Talleres recibidos:", talleresData);

        const mappedTalleres = (talleresData || []).map(t => ({
            ...t,
            id: t.id_taller
        }));

        setListaEventos(mappedTalleres);
        setCongresos(congresosData.map(c => ({ id: c.id_congreso, nombre: c.nombre_congreso })));
        setInstituciones(instData.map(i => ({ id: i.id_institucion, nombre: i.nombre })));
      } catch (error) {
        console.error("Error al cargar talleres:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idCongreso, accessToken]);

  const handleAbrirModal = (taller) => {
    setTallerSeleccionado(taller);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setTallerSeleccionado(null), 200);
  };

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
          <h2 className="text-3xl font-bold uppercase tracking-tight">Gestión de Talleres</h2>
        </div>
        <p className="text-sm text-base-content/50 ml-12">
          {idCongreso 
            ? `Mostrando talleres para el congreso seleccionado` 
            : "Administra todos los talleres registrados en el sistema"}
        </p>
      </div>

      <div className="mb-10">
        <MenuCrearBorrar
          title={idCongreso ? "Talleres Filtrados" : "Todos los Talleres"}
          listaElementos2={listaEventos}
          definirTipoElemento="taller"
          onViewItem={handleAbrirModal}
        />
      </div>

      {/* Modal para ver/editar detalles */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              onClick={handleCerrarModal}
              className="absolute top-4 right-6 text-white bg-black/50 hover:bg-black w-10 h-10 rounded-full flex items-center justify-center transition-all z-50 cursor-pointer"
              title="Cerrar"
            >
              ✕
            </button>

            <div className="overflow-y-auto h-full">
              <DetallesEditarTaller
                key={tallerSeleccionado?.id || 'new'}
                tallerData={tallerSeleccionado}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
