import { useState, useEffect, useMemo } from "react";
import { HiSearch, HiMail, HiFilter } from "react-icons/hi";
import { MdReceipt, MdPeople } from "react-icons/md";
import InvoiceUpload from "./Componentes/InvoiceUpload";
import UserInvoiceList from "./Componentes/UserInvoiceList";
import FilterHeader from "./Componentes/FilterHeader";
import { getParticipantsApi, getCongresosApi, bulkFacturaActionApi } from "../../api/adminApi";

export default function UsuariosFacturasView() {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [congresos, setCongresos] = useState([]);
  const [filters, setFilters] = useState({ idCongreso: null, rol: null, institucion: null });
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkCount, setBulkCount] = useState(0);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, []);

  useEffect(() => {
    fetchParticipants(filters);
  }, [filters.idCongreso, filters.rol, filters.institucion]);

  const fetchParticipants = async (currentFilters = filters) => {
    if (!currentFilters.idCongreso) {
      setAllUsers([]);
      return;
    }
    try {
      const data = await getParticipantsApi(accessToken, {
        idCongreso: currentFilters.idCongreso,
        rol: currentFilters.rol,
        institucion: currentFilters.institucion,
      });
      const mapped = data.map(u => ({
        id: u.id_persona,
        nombre: u.nombre_completo,
        email: u.correo_electronico,
        rol: u.rol,
        institucion: u.institucion,
        rfc: u.factura?.rfc || null,
        razonSocial: u.factura?.razon_social || null,
        codigoPostal: u.factura?.codigo_postal || null,
        regimenFiscal: u.factura?.regimen_fiscal || null,
        facturaEstatus: u.factura?.estatus || null,
        status: u.factura?.estatus === 'enviada' ? 'green' : u.factura?.estatus === 'pendiente' ? 'orange' : 'gray',
      }));
      setAllUsers(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterChange = (field, value) => {
    if (field === 'idCongreso') {
      setSelectedUser(null);
      setAllUsers([]);
    }
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const term = searchTerm.toLowerCase();
    return allUsers.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.rfc || '').toLowerCase().includes(term)
    );
  }, [allUsers, searchTerm]);

  const pendingUsers = filteredUsers.filter(u => u.status === 'orange');
  const sentUsers = filteredUsers.filter(u => u.status === 'green');

  const handleBulkSend = async () => {
    if (!filters.idCongreso) {
      alert("Selecciona un congreso primero.");
      return;
    }
    const pendingIds = pendingUsers.map(u => u.id);
    if (pendingIds.length === 0) {
      alert("No hay facturas pendientes en el filtro actual.");
      return;
    }
    setIsBulkSending(true);
    setBulkCount(0);
    try {
      await bulkFacturaActionApi(accessToken, filters.idCongreso, pendingIds);
      await fetchParticipants(filters);
      let c = 0;
      const interval = setInterval(() => {
        c = Math.min(c + Math.ceil(pendingIds.length / 8), pendingIds.length);
        setBulkCount(c);
        if (c >= pendingIds.length) {
          clearInterval(interval);
          setTimeout(() => setIsBulkSending(false), 700);
        }
      }, 120);
    } catch (error) {
      alert("Error al procesar facturas: " + error.message);
      setIsBulkSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-2 md:p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturas</h1>
              <p className="text-sm text-gray-500">Procesa y envía facturas a los participantes del congreso</p>
            </div>
          </div>
          <button
            onClick={handleBulkSend}
            disabled={isBulkSending || !filters.idCongreso || pendingUsers.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
              ${(filters.idCongreso && pendingUsers.length > 0 && !isBulkSending)
                ? 'bg-[#005a6a] text-white hover:bg-[#004a5a] shadow-lg shadow-[#005a6a]/20'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            title={!filters.idCongreso ? "Selecciona un congreso" : ""}
          >
            {isBulkSending ? <span className="loading loading-spinner loading-xs"></span> : <HiMail />}
            Enviar Pendientes {pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}
          </button>
        </div>

        <FilterHeader onFilterChange={handleFilterChange} congresos={congresos} />

        {allUsers.length > 0 && (
          <div className="flex gap-3 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <MdPeople /> {filteredUsers.length} participantes
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <MdReceipt /> {pendingUsers.length} pendientes
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              {sentUsers.length} enviadas
            </span>
          </div>
        )}
      </div>

      {/* Alerta sin congreso */}
      {!filters.idCongreso && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-blue-400 p-2 rounded-xl text-white"><HiFilter className="text-xl" /></div>
          <div>
            <p className="text-blue-800 font-bold text-sm">Selecciona una institución y un congreso</p>
            <p className="text-blue-600 text-xs">Usa los filtros para ver los participantes y gestionar sus facturas.</p>
          </div>
        </div>
      )}

      {/* Barra de progreso bulk */}
      {isBulkSending && (
        <div className="bg-[#005a6a] p-5 rounded-2xl text-white flex flex-col gap-3 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <p className="font-black text-xs uppercase tracking-[0.2em]">Procesando facturas pendientes...</p>
            </div>
            <p className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">
              {bulkCount} / {pendingUsers.length}
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300"
              style={{ width: `${pendingUsers.length ? (bulkCount / pendingUsers.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <InvoiceUpload
            selectedUser={selectedUser}
            idCongreso={filters.idCongreso}
            onUploadSuccess={() => fetchParticipants(filters)}
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8 bg-gray-50/50 rounded-3xl shadow-inner border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              Participantes
              <span className="bg-[#005a6a] text-white text-[10px] px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, RFC..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm bg-white shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-16">
                <MdReceipt className="text-5xl opacity-30" />
                <p className="text-sm font-semibold">
                  {filters.idCongreso ? 'Sin participantes con los filtros actuales' : 'Selecciona un congreso para ver participantes'}
                </p>
              </div>
            ) : (
              <UserInvoiceList
                users={filteredUsers}
                selectedUserId={selectedUser?.id}
                onSelectUser={(user) => setSelectedUser(selectedUser?.id === user?.id ? null : user)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
