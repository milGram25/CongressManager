import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RevisionCard = ({ titulo, id, fechaAsignado, fechaLimite, estado, urgente }) => {
  const navigate = useNavigate();
  const borderColor = urgente ? 'border-l-error' : 'border-l-warning';
  const labelColor = urgente ? 'text-error' : 'text-warning';

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-base-100 p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${borderColor} transition-all hover:shadow-md`}>
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>
          {urgente ? '¡URGENTE! - FECHA LÍMITE PRÓXIMA' : estado}
        </span>
        <h3 className="text-lg font-semibold text-base-content leading-tight mb-1">{titulo}</h3>
        <p className="text-xs text-base-content/60 font-bold mb-2 uppercase tracking-tighter">ID: {id}</p>
        <div className="flex flex-wrap gap-4 md:gap-6 text-[11px] text-base-content/40 font-medium">
          <span>Asignado: {fechaAsignado}</span>
          <span className={urgente ? "text-error font-bold underline decoration-error" : ""}>
            Límite: {fechaLimite}
          </span>
        </div>
      </div>
      <button 
        onClick={() => navigate(`/revisor/revision/${id.replace('#', '')}`)}
        className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95"
      >
        REVISAR
      </button>
    </div>
  );
};

export default function RevisionesView() {
  const [activeTab, setActiveTab] = useState('pendientes');

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      <div className="flex-grow">
        <h1 className="text-2xl font-semibold text-base-content mb-8">Extensos por revisar</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-base-300 mb-8">
          <button 
            onClick={() => setActiveTab('pendientes')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${
              activeTab === 'pendientes' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'
            }`}
          >
            Pendientes (3)
          </button>
          <button 
            onClick={() => setActiveTab('completadas')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${
              activeTab === 'completadas' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'
            }`}
          >
            Completadas (12)
          </button>
        </div>

        {/* Contenido Dinámico según Tab */}
        <div className="space-y-4">
          {activeTab === 'pendientes' ? (
            <>
              <RevisionCard 
                titulo="Impacto de la Inteligencia Artificial en la Educación Superior 2026"
                id="#ART-9920" 
                fechaAsignado="10 Feb 2026" 
                fechaLimite="05 Mar 2026"
                estado="ESPERANDO DICTAMEN" 
                urgente={false} 
              />
              <RevisionCard 
                titulo="Análisis de Redes Eléctricas en Zonas Rurales de Jalisco"
                id="#ART-8845" 
                fechaAsignado="01 Feb 2026" 
                fechaLimite="HOY"
                estado="URGENTE" 
                urgente={true} 
              />
              <RevisionCard 
                titulo="Nuevas tendencias en el desarrollo de software educativo"
                id="#ART-7712" 
                fechaAsignado="15 Feb 2026" 
                fechaLimite="10 Mar 2026"
                estado="ESPERANDO DICTAMEN" 
                urgente={false} 
              />
            </>
          ) : (
            <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
              Aquí aparecerán tus revisiones ya completadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
