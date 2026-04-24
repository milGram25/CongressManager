import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExtensosPendientes } from '../../api/ponenciasApi';

const RevisionCard = ({ titulo, id, fechaSubida, urgente }) => {
  const navigate = useNavigate();
  const config = urgente
    ? { border: 'border-l-error', text: 'text-error', label: '¡URGENTE! - FECHA LÍMITE PRÓXIMA' }
    : { border: 'border-l-warning', text: 'text-warning', label: 'ESPERANDO REVISIÓN' };

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-base-100 p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border} transition-all hover:shadow-md`}>
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>
          {config.label}
        </span>
        <h3 className="text-lg font-semibold text-base-content leading-tight mb-1">{titulo}</h3>
        <p className="text-xs text-base-content/60 font-bold mb-2 uppercase tracking-tighter">ID: {id}</p>
        <div className="flex flex-wrap gap-4 md:gap-6 text-[11px] text-base-content/40 font-medium">
          <span>Documento Recibido: {fechaSubida}</span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/revisor/revision/${id.replace('#EXT-', '')}`)}
        className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95"
      >
        REVISAR
      </button>
    </div>
  );
};

export default function RevisionesView() {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosBackend = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await getExtensosPendientes(token);
        setPendientes(data.pendientes);
        setCompletadas(data.completadas);
      } catch (error) {
        console.error("Error al traer extensos", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosBackend();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      <div className="flex-grow">
        <h1 className="text-2xl font-semibold text-base-content mb-8">Extensos por Revisar</h1>

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
          {/* AQUI ESTA TU PESTAÑA RECUPERADA */}
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
            <div className="text-center py-10 font-medium">Buscando documentos en la base de datos...</div>
          ) : activeTab === 'pendientes' ? (
            pendientes.length === 0 ? (
              <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
                ¡Excelente! No tienes ningún extenso pendiente por revisión profunda.
              </div>
            ) : (
              pendientes.map(ext => (
                <RevisionCard key={ext.id_extenso} titulo={ext.titulo} id={`#EXT-${ext.id_extenso}`} fechaSubida={new Date(ext.fecha_subida).toLocaleDateString()} urgente={false} />
              ))
            )
          ) : (
            completadas.length === 0 ? (
              <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
                Aún no has completado la evaluación de ningún extenso.
              </div>
            ) : (
              completadas.map(ext => (
                <RevisionCard key={ext.id_extenso} titulo={ext.titulo} id={`#EXT-${ext.id_extenso}`} fechaSubida={new Date(ext.fecha_subida).toLocaleDateString()} urgente={false} />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
