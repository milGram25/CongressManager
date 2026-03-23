import { useNavigate } from "react-router-dom";
import { MdGroups, MdCoPresent, MdAccountBalance } from "react-icons/md";

export default function EventosView() {
  const navigate = useNavigate();

  const opciones = [
    { 
      id: 'talleres', 
      label: 'Talleres', 
      icon: MdGroups, 
      desc: 'Gestión de talleres y cursos prácticos' 
    },
    { 
      id: 'ponencias', 
      label: 'Ponencias', 
      icon: MdCoPresent, 
      desc: 'Administración de ponencias y presentaciones' 
    },
    { 
      id: 'congresos', 
      label: 'Congresos', 
      icon: MdAccountBalance, 
      desc: 'Configuración de congresos y eventos magnos' 
    }
  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <h2 className="text-2xl font-bold mb-8 text-center">Gestión de Eventos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto py-10">
        {opciones.map((opc) => {
          const Icon = opc.icon;
          return (
            <button 
              key={opc.id}
              onClick={() => navigate(opc.id)}
              className="group p-8 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon className="text-3xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{opc.label}</h3>
                <p className="text-xs text-base-content/50 mt-2">{opc.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
