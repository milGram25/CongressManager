import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisResumenes } from '../../api/ponenciasApi';

function DictamenCard({ item }) {
  const navigate = useNavigate();
  const pendiente = !item.revisado;
  const config = pendiente
    ? { border: 'border-l-warning', text: 'text-warning', label: 'ESPERANDO DICTAMEN' }
    : { border: 'border-l-success', text: 'text-success', label: item.estatus?.toUpperCase() ?? 'COMPLETADO' };

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-base-100 p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border} transition-all hover:shadow-md`}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>{config.label}</span>
        <h3 className="text-lg font-semibold text-base-content leading-tight mb-1 truncate">{item.titulo}</h3>
        <p className="text-xs text-base-content/60 font-bold uppercase tracking-tighter">Congreso: {item.congreso}</p>
      </div>
      {pendiente && (
        <button
          onClick={() => navigate(`/dictaminador/dictamen/${item.id_resumen}`)}
          className="mt-4 md:mt-0 md:ml-6 bg-primary hover:bg-primary/90 text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          DICTAMINAR
        </button>
      )}
    </div>
  );
}

export default function DictamenesView() {
  const accessToken = localStorage.getItem('congress_access');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes');

  useEffect(() => {
    getMisResumenes(accessToken)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  const pendientes = items.filter(i => !i.revisado);
  const completados = items.filter(i => i.revisado);

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <h1 className="text-2xl font-semibold text-base-content mb-8">Ponencias por dictaminar</h1>
      <div className="flex border-b border-base-300 mb-8">
        {[['pendientes', `Pendientes (${pendientes.length})`], ['completadas', `Completadas (${completados.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${activeTab === key ? 'border-primary text-primary font-bold' : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : activeTab === 'pendientes' ? (
        pendientes.length === 0
          ? <p className="py-10 text-center text-base-content/40 italic">No tienes resúmenes pendientes de dictamen.</p>
          : pendientes.map(i => <DictamenCard key={i.id_resumen} item={i} />)
      ) : (
        completados.length === 0
          ? <p className="py-10 text-center text-base-content/40 italic">Aquí aparecerán tus dictámenes completados.</p>
          : completados.map(i => <DictamenCard key={i.id_resumen} item={i} />)
      )}
    </div>
  );
}
