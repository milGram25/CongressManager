import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DictamenCard = ({ titulo, id, fechaAsignado, fechaLimite, estado, urgente }) => {
  const navigate = useNavigate();
  
  // Mapeo de colores basado en urgencia
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
          <span>Asignado: {fechaAsignado}</span>
          <span className={urgente ? "text-error font-bold underline decoration-error" : ""}>
            Límite: {fechaLimite}
          </span>
        </div>
      </div>
      <button 
        onClick={() => navigate(`/dictaminador/dictamen/${id.replace('#', '')}`)}
        className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95"
      >
        DICTAMINAR
      </button>
    </div>
  );
};

export default function DictamenesView() {
  const [activeTab, setActiveTab] = useState('pendientes');

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      <div className="flex-grow">
        <h1 className="text-2xl font-semibold text-base-content mb-8">Ponencias por dictaminar</h1>
        
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
            Pendientes (2)
          </button>
          <button 
            onClick={() => setActiveTab('completadas')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${
              activeTab === 'completadas' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-base-content/40 font-semibold hover:text-base-content/60'
            }`}
          >
            Completadas (8)
          </button>
        </div>

        {/* Contenido Dinámico según Tab */}
        <div className="space-y-4">
          {activeTab === 'pendientes' ? (
            <>
              <DictamenCard 
                titulo="Propuesta de Innovación Tecnológica en el Agro Mexicano"
                id="#ART-1122" 
                fechaAsignado="12 Mar 2026" 
                fechaLimite="15 Mar 2026"
                estado="REVISIÓN TÉCNICA" 
                urgente={true} 
              />
              <DictamenCard 
                titulo="Estudio de Caso: Energías Renovables en Zonas Costeras"
                id="#ART-3344" 
                fechaAsignado="10 Mar 2026" 
                fechaLimite="20 Mar 2026"
                estado="REVISIÓN TÉCNICA" 
                urgente={false} 
              />
            </>
          ) : (
            <div className="py-10 text-center text-base-content/40 italic bg-base-100 rounded-xl border border-dashed border-base-300">
              Aquí aparecerán tus dictámenes ya completados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
