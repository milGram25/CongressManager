import { useState, useEffect } from "react";
import CrearMesasFisicas from "./Componentes/CrearMesasFisicas";
import DetallesSede from "./Componentes/DetallesSede";
import { getSedesApi, getMesasApi } from "../../api/adminApi";

export default function CongresoSedeView() {
  const [sede, setSede] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchSedeData();
  }, []);

  const fetchSedeData = async () => {
    setLoading(true);
    try {
      const [sedesData, mesasData] = await Promise.all([
        getSedesApi(accessToken),
        getMesasApi(accessToken)
      ]);
      // Por ahora tomamos la primera sede o podrías filtrar por congreso si tuvieras el ID
      if (sedesData.length > 0) setSede(sedesData[0]);
      setMesas(mesasData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><span className="loading loading-spinner text-[#005a6a]"></span></div>;

  return (
    <div className="w-full space-y-8 pb-10 animate-in fade-in duration-500">
      <div>
        <div className="flex gap-4">
          <div className="border bg-[#005a6a] rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-black text-start uppercase tracking-tighter">Gestión de Sede y Logística</h2>
        </div>
        <p className="pl-12 text-start text-gray-500 text-sm font-medium">
          Configura los detalles de la ubicación principal y las mesas de trabajo físicas.
        </p>
      </div>

      <div className="space-y-10">
        <DetallesSede 
            idSede={sede?.id_sede}
            detalles={{
                nombre: sede?.nombre_sede,
                pais: sede?.pais,
                estado: sede?.estado,
                ciudad: sede?.ciudad,
                calle: sede?.calle,
                num_exterior: sede?.num_exterior,
                num_interior: sede?.num_interior,
                mod_fisico: sede?.modulo_fisico
            }} 
            onUpdate={fetchSedeData}
        />
        <CrearMesasFisicas 
            idSede={sede?.id_sede}
            listaMesas={mesas} 
            onUpdate={fetchSedeData}
        />
      </div>
    </div>
  );
}
