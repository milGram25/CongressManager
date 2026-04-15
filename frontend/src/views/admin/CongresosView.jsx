import { useNavigate } from "react-router-dom";
import { MdInfo, MdAddCircle, MdPlace, MdEventAvailable, MdWork } from "react-icons/md";

export default function CongresosView() {
  const navigate = useNavigate();

  const opciones = [
    { id: 'lista', label: 'Lista', icon: MdInfo, desc: 'Ver todos los congresos registrados' },
    { id: 'sede', label: 'Sede', icon: MdPlace, desc: 'Ubicación y logística del evento' },
    { id: 'fechas', label: 'Fechas', icon: MdEventAvailable, desc: 'Cronograma y fechas importantes' },
    { id: 'tipos-trabajo', label: 'Tipos de Trabajo', icon: MdWork, desc: 'Categorías y modalidades aceptadas' }
  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      <h2 className="text-2xl font-bold mb-8 text-center">Gestión de Congresos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto py-10">
        {opciones.map((opc) => {
          const Icon = opc.icon;
          return (
            <button 
              key={opc.id}
              onClick={() => navigate(opc.id)}
              className="group p-6 bg-base-200 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon className="text-2xl" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{opc.label}</h3>
                <p className="text-[10px] text-base-content/50 mt-1">{opc.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
