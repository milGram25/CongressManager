import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumenesPendientes } from '../../api/ponenciasApi';

const DictamenCard = ({ titulo, id, fechaAsignado, urgente, completado }) => {
  const navigate = useNavigate();

  const config = urgente
    ? { border: 'border-l-error', text: 'text-error', label: '¡URGENTE! - FECHA LÍMITE PRÓXIMA' }
    : { border: 'border-l-warning', text: 'text-warning', label: 'ESPERANDO DICTAMEN' };

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-base-100 p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border} transition-all hover:shadow-md`}>
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>
          {config.label}
        </span>
        <h3 className="text-lg font-semibold text-base-content leading-tight mb-1">{titulo}</h3>
        <p className="text-xs text-base-content/60 font-bold mb-2 uppercase tracking-tighter">ID: {id}</p>
        <div className="flex flex-wrap gap-4 md:gap-6 text-[11px] text-base-content/40 font-medium">
          <span>Resumen Recibido: {fechaAsignado}</span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/dictaminador/dictamen/${id.replace('#ART-', '')}`)}
        className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95"
      >
        EVALUAR
      </button>
    </div>
  );
};

export default function DictamenesView() {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosBackend = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await getResumenesPendientes(token);
        // Ahora el backend nos manda un objeto con { pendientes: [], completadas: [] }
        setPendientes(data.pendientes);
        setCompletadas(data.completadas);
      } catch (error) {
        console.error("Error al traer resúmenes", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosBackend();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      <div className="flex-grow">
        <h1 className="text-2xl font-semibold text-base-content mb-8">Ponencias por dictaminar</h1>

        <div className="flex border-b border-base-300 mb-8">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${activeTab === 'pendientes'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'
              }`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setActiveTab('completadas')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${activeTab === 'completadas'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'
              }`}
          >
            Completadas ({completadas.length})
          </button>
        </div>

        <div className="space-y-4">
          {cargando ? (
            <div className="text-center py-10 font-medium">Sincronizando con la base de datos...</div>
          ) : activeTab === 'pendientes' ? (
            pendientes.length === 0 ? (
              <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
                No tienes ningún resumen pendiente por revisar.
              </div>
            ) : (
              pendientes.map(res => (
                <DictamenCard key={res.id_resumen} titulo="Resumen Asignado - Pendiente" id={`#ART-${res.id_resumen}`} fechaAsignado={new Date(res.fecha_entrega).toLocaleDateString()} urgente={false} />
              ))
            )
          ) : (
            completadas.length === 0 ? (
              <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
                Aún no has completado ningún dictamen.
              </div>
            ) : (
              completadas.map(res => (
                <DictamenCard key={res.id_resumen} titulo={`Dictamen FINALIZADO: ${res.estatus.toUpperCase()}`} id={`#ART-${res.id_resumen}`} fechaAsignado={new Date(res.fecha_entrega).toLocaleDateString()} urgente={false} />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

