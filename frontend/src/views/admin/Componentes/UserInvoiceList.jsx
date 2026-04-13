import { BsFillPersonFill, BsPersonHearts, BsFillPersonLinesFill } from "react-icons/bs";
import { GrWorkshop } from "react-icons/gr";
import { MdPersonSearch } from "react-icons/md";

export default function UserInvoiceList({ users, selectedUserId, onSelectUser }) {
  
  const getRoleIcon = (rol) => {
    switch(rol.toLowerCase()) {
      case 'ponente': return <GrWorkshop />;
      case 'tallerista': return <BsPersonHearts />;
      case 'dictaminador': return <BsFillPersonLinesFill />;
      case 'evaluador': return <MdPersonSearch />;
      default: return <BsFillPersonFill />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'green': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
      case 'red': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="divide-y divide-gray-50">
      {users.map((user) => (
        <div 
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50
            ${selectedUserId === user.id ? "bg-blue-50/50 border-l-4 border-l-[#005a6a]" : "border-l-4 border-l-transparent"}`}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-xl text-gray-600 group-hover:scale-110 transition-transform shadow-sm">
              {getRoleIcon(user.rol)}
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 truncate">{user.nombre}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="bg-[#005a6a]/10 px-2 py-0.5 rounded-md text-[#005a6a] font-medium">{user.rol}</span>
              <span className="truncate">RFC: {user.rfc} • {user.email}</span>
            </div>
            {user.razonSocial && user.razonSocial !== user.nombre && (
              <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">
                Facturar a: {user.razonSocial}
              </p>
            )}
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Institución</p>
            <p className="text-sm font-semibold text-gray-600">{user.institucion}</p>
          </div>

          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <span className="text-lg">→</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
