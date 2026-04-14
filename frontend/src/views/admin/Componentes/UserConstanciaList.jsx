import { BsFillPersonFill, BsPersonHearts, BsFillPersonLinesFill } from "react-icons/bs";
import { GrWorkshop } from "react-icons/gr";
import { MdPersonSearch, MdCheckCircle, MdTimer } from "react-icons/md";

export default function UserConstanciaList({ users, selectedUserId, onSelectUser }) {
  
  const getRoleIcon = (rol) => {
    switch(rol.toLowerCase()) {
      case 'ponente': return <GrWorkshop />;
      case 'tallerista': return <BsPersonHearts />;
      case 'dictaminador': return <BsFillPersonLinesFill />;
      case 'evaluador': return <MdPersonSearch />;
      default: return <BsFillPersonFill />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'green': 
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
            <MdCheckCircle /> ENVIADA
          </div>
        );
      case 'red': 
        return (
          <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100">
            <MdTimer /> PENDIENTE
          </div>
        );
      default: 
        return (
          <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-100">
            N/A
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div 
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`group flex items-center gap-4 p-4 cursor-pointer transition-all rounded-2xl border bg-white shadow-sm
            ${selectedUserId === user.id ? "border-[#005a6a] ring-1 ring-[#005a6a]/20" : "border-gray-100 hover:border-[#005a6a]/30"}`}
        >
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl transition-all shadow-sm
              ${selectedUserId === user.id ? "bg-[#005a6a] text-white" : "bg-gray-50 text-gray-500 group-hover:bg-gray-100"}`}>
              {getRoleIcon(user.rol)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-800 truncate">{user.nombre}</h4>
              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-500 text-[9px] font-black uppercase tracking-widest">{user.rol}</span>
            </div>
            <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(user.status)}
            <p className="text-[10px] font-bold text-gray-300 uppercase">{user.institucion}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
