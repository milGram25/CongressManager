import React, { useState, useEffect } from "react";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";
import { getCongresosApi, getInstitucionesApi } from "../../api/adminApi";

export default function CongresoListaView() {
  const [instituciones, setInstituciones] = useState([]);
  const [congresos, setCongresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInst, setSelectedInst] = useState("");
  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const instData = await getInstitucionesApi(accessToken);
      setInstituciones(instData);
      await fetchCongresos("");
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCongresos = async (instId) => {
    try {
      const congData = await getCongresosApi(accessToken, instId);
      setCongresos(congData);
    } catch (error) {
      console.error("Error al cargar congresos:", error);
    }
  };

  const handleSelectInstitucion = async (id) => {
    setSelectedInst(id);
    setLoading(true);
    await fetchCongresos(id);
    setLoading(false);
  };

  if (loading && instituciones.length === 0) return (
    <div className="flex justify-center items-center h-full">
      <span className="loading loading-spinner loading-lg text-[#005a6a]"></span>
    </div>
  );

  return (
    <div className="flex flex-col  w-full h-full p-4 md:p-8">
      <div>
        <div className="flex gap-4">
          <div className="border bg-black rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-bold text-start">Congresos</h2>
        </div>
        <p className="pl-12 text-start text-gray-500 mb-10">
          Aquí se crean, ven y modifican los congresos
        </p>
      </div>
      <div className="w-full px-30 mb-5 items-center justify-center ">
        <ListaDesplegableElementosGenerica 
          titulo={"Instituciones"} 
          lista={instituciones} 
          onSelect={handleSelectInstitucion}
          value={selectedInst}
        />
      </div>
      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner text-black"></span>
        </div>
      ) : (
        <MenuCrearBorrar
          title="Gestión de Congresos"
          listaElementos2={congresos}
          definirTipoElemento="congreso"
        />
      )}
    </div>
  );
}
