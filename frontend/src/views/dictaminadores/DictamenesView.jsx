import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DictamenCard = ({ titulo, id, fechaAsignado, fechaLimite, estado, urgente }) => {
  const navigate = useNavigate();
  const borderColor = urgente ? 'border-l-[#D32F2F]' : 'border-l-[#FBC02D]';
  const labelColor = urgente ? 'text-[#D32F2F]' : 'text-[#AF8905]';

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${borderColor} transition-all hover:shadow-md`}>
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>
          {urgente ? '¡URGENTE! - FECHA LÍMITE PRÓXIMA' : estado}
        </span>
        <h3 className="text-lg font-semibold text-slate-700 leading-tight mb-1">{titulo}</h3>
        <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-tighter">ID: {id}</p>
        <div className="flex flex-wrap gap-4 md:gap-6 text-[11px] text-gray-400 font-medium">
          <span>Asignado: {fechaAsignado}</span>
          <span className={urgente ? "text-red-600 font-bold underline decoration-red-600" : ""}>
            Límite: {fechaLimite}
          </span>
        </div>
      </div>
      <button 
        onClick={() => navigate(`/dictaminador/dictamen/${id.replace('#', '')}`)}
        className="mt-4 md:mt-0 bg-[#008B8B] hover:bg-[#007A7A] text-white px-7 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95"
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
        <h1 className="text-2xl font-semibold text-gray-700 mb-8">Ponencias por dictaminar</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('pendientes')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${
              activeTab === 'pendientes' 
                ? 'border-[#008B8B] text-[#008B8B] font-bold' 
                : 'border-transparent text-gray-400 font-semibold hover:text-gray-600'
            }`}
          >
            Pendientes (2)
          </button>
          <button 
            onClick={() => setActiveTab('completadas')}
            className={`px-8 py-3 border-b-2 text-sm transition-all ${
              activeTab === 'completadas' 
                ? 'border-[#008B8B] text-[#008B8B] font-bold' 
                : 'border-transparent text-gray-400 font-semibold hover:text-gray-600'
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
            <div className="py-10 text-center text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-200">
              Aquí aparecerán tus dictámenes ya completados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
