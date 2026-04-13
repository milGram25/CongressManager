import { useState, useEffect } from "react";
import { HiSearch } from "react-icons/hi";
import InvoiceUpload from "./Componentes/InvoiceUpload";
import UserInvoiceList from "./Componentes/UserInvoiceList";
import FilterHeader from "./Componentes/FilterHeader";

export default function UsuariosFacturasView() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadRequests = () => {
    const savedRequests = JSON.parse(localStorage.getItem("invoice_requests") || "[]");
    const pendingRequests = savedRequests.filter(req => req.status === "red");
    setUsers(pendingRequests);
    
    // Si ya hay un seleccionado, actualizamos su objeto por si cambió el estatus o si ya no está en la lista de pendientes
    if (selectedUser) {
      const updated = pendingRequests.find(u => u.id === selectedUser.id);
      setSelectedUser(updated || (pendingRequests.length > 0 ? pendingRequests[0] : null));
    } else if (pendingRequests.length > 0) {
      setSelectedUser(pendingRequests[0]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 p-2 md:p-4 animate-in fade-in duration-500">
      {/* Header con Título y Filtros */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturación</h1>
            <p className="text-sm text-gray-500">Administra y asigna facturas a los participantes del congreso</p>
          </div>
        </div>
        
        <FilterHeader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        {/* Panel Izquierdo: Carga de Factura */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          {selectedUser ? (
            <InvoiceUpload selectedUser={selectedUser} onUploadSuccess={loadRequests} />
          ) : (
            <div className="bg-[#005a6a]/10 border-2 border-dashed border-[#005a6a]/30 rounded-3xl h-full flex items-center justify-center p-8 text-center">
              <p className="text-[#005a6a] font-medium italic">Selecciona una solicitud del listado para gestionar su factura</p>
            </div>
          )}
        </div>

        {/* Panel Derecho: Lista de Usuarios */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
            <h3 className="font-bold text-gray-700">Facturas pendientes</h3>
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {users.length > 0 ? (
              <UserInvoiceList 
                users={filteredUsers} 
                selectedUserId={selectedUser?.id}
                onSelectUser={setSelectedUser}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-lg">No hay solicitudes de factura pendientes</p>
                <p className="text-sm">Las solicitudes aparecerán aquí cuando los asistentes completen sus pagos</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Mostrando {filteredUsers.length} registros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
