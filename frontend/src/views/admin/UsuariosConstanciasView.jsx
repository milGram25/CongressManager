import { useState, useEffect, useMemo } from "react";
import { HiSearch, HiMail, HiFilter, HiExclamationCircle } from "react-icons/hi";
import { MdPeople } from "react-icons/md";
import ConstanciaUpload from "./Componentes/ConstanciaUpload";
import UserConstanciaList from "./Componentes/UserConstanciaList";
import FilterHeader from "./Componentes/FilterHeader";
import SignatureUpload from "./Componentes/SignatureUpload";
import { getParticipantsApi, bulkConstanciaActionApi, getCongresoSignaturesApi, getCongresosApi } from "../../api/adminApi";

export default function UsuariosConstanciasView() {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [signatures, setSignatures] = useState({ organizador: null, secretaria: null });
  const [areSignaturesValid, setAreSignaturesValid] = useState(false);
  const [congresos, setCongresos] = useState([]);
  const [filters, setFilters] = useState({ idCongreso: null, rol: null, institucion: null });
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchCongresos();
  }, []);

  useEffect(() => {
    fetchParticipants(filters);
  }, [filters.rol, filters.institucion, filters.idCongreso]);

  useEffect(() => {
    if (filters.idCongreso) {
      fetchSignatures(filters.idCongreso);
    } else {
      setSignatures({ organizador: null, secretaria: null });
      setAreSignaturesValid(false);
    }
  }, [filters.idCongreso]);

  const fetchCongresos = async () => {
    try {
      const data = await getCongresosApi(accessToken);
      setCongresos(data);
    } catch (error) {
      console.error(error);
    }
  };

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
      const mappedData = data.map(u => ({
        id: `${u.id_persona}_${u.rol}`,
        id_persona: u.id_persona,
        nombre: u.nombre_completo,
        email: u.correo_electronico,
        rol: u.rol,
        institucion: u.institucion,
        status: u.constancia?.estatus === 'enviada' ? 'green' : (u.constancia?.estatus === 'generada' ? 'yellow' : 'red'),
      }));
      setAllUsers(mappedData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSignatures = async (idCongreso) => {
    try {
      const data = await getCongresoSignaturesApi(accessToken, idCongreso);
      setSignatures({ organizador: data.firma_organizador, secretaria: data.firma_secretaria });
      setAreSignaturesValid(data.firmas_bloqueadas);
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
      u.rol.toLowerCase().includes(term)
    );
  }, [allUsers, searchTerm]);

  const pendingUsers = useMemo(() => filteredUsers.filter(u => u.status === 'red'), [filteredUsers]);

  const handleBulkSend = async () => {
    setShowConfirmSend(false);
    if (!areSignaturesValid) {
      alert("Debe confirmar y bloquear las firmas institucionales antes de realizar acciones masivas.");
      return;
    }
    if (!filters.idCongreso) {
      alert("Seleccione un congreso en el filtro para ejecutar acciones masivas.");
      return;
    }
    setIsBulkProcessing(true);
    setProcessedCount(0);

    try {
      const targetIds = [...new Set(pendingUsers.map(u => u.id_persona))];
      const total = pendingUsers.length;
      await bulkConstanciaActionApi(accessToken, 'send', filters.idCongreso, targetIds);
      await fetchParticipants();

      let count = 0;
      const interval = setInterval(() => {
        count = Math.min(count + Math.ceil(total / 10), total);
        setProcessedCount(count);
        if (count >= total) {
          clearInterval(interval);
          setTimeout(() => setIsBulkProcessing(false), 800);
        }
      }, 120);
    } catch (error) {
      alert("Error en envío masivo: " + error.message);
      setIsBulkProcessing(false);
    }
  };

  const pendingCount = filteredUsers.filter(u => u.status === 'red').length;
  const sentCount = filteredUsers.filter(u => u.status === 'green').length;

  const selectedCongreso = congresos.find(c => c.id_congreso === filters.idCongreso || c.id_congreso === Number(filters.idCongreso));

  return (
    <div className="flex flex-col h-full gap-6 p-2 md:p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Emisión de constancias</h1>
              <p className="text-sm text-gray-500">Genera y envía certificados a los participantes del congreso</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmSend(true)}
            disabled={isBulkProcessing || !areSignaturesValid || !filters.idCongreso || pendingCount === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-40
              ${(areSignaturesValid && filters.idCongreso && pendingCount > 0) ? 'bg-[#005a6a] text-white hover:bg-[#004a5a] shadow-blue-900/20' : 'bg-gray-400 text-gray-200 shadow-none cursor-not-allowed'}`}
            title={!filters.idCongreso ? "Seleccione un congreso" : !areSignaturesValid ? "Se requieren firmas confirmadas" : pendingCount === 0 ? "No hay pendientes" : ""}
          >
            <HiMail />
            Enviar a Todos {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        </div>

        <FilterHeader
          onFilterChange={handleFilterChange}
          congresos={congresos}
        />

        {allUsers.length > 0 && (
          <div className="flex gap-3 pt-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <MdPeople /> {filteredUsers.length} participantes
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              {pendingCount} pendientes
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              {sentCount} enviadas
            </span>
          </div>
        )}
      </div>

      {/* Alertas */}
      {!filters.idCongreso && !isBulkProcessing && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-blue-400 p-2 rounded-xl text-white"><HiFilter className="text-xl" /></div>
          <div>
            <p className="text-blue-800 font-bold text-sm">Selecciona un congreso</p>
            <p className="text-blue-600 text-xs">Usa el filtro de congreso para habilitar la generación y envío masivo de constancias.</p>
          </div>
        </div>
      )}

      {filters.idCongreso && !areSignaturesValid && !isBulkProcessing && (
        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-yellow-400 p-2 rounded-xl text-white"><HiExclamationCircle className="text-xl" /></div>
          <div>
            <p className="text-yellow-800 font-bold text-sm uppercase tracking-tight">Firmas requeridas</p>
            <p className="text-yellow-700 text-xs">Sube y <strong>confirma</strong> las firmas institucionales para habilitar la generación y envío.</p>
          </div>
        </div>
      )}

      {isBulkProcessing && (
        <div className="bg-[#005a6a] p-5 rounded-2xl text-white flex flex-col gap-3 animate-in slide-in-from-top duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <p className="font-black text-xs uppercase tracking-[0.2em]">Enviando constancias...</p>
            </div>
            <p className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">
              {processedCount} / {pendingCount}
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${pendingCount ? (processedCount / pendingCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <SignatureUpload
            idCongreso={filters.idCongreso}
            onSignaturesChange={(sigs) => {
              setSignatures(sigs);
              setAreSignaturesValid(!!(sigs.organizador && sigs.secretaria));
            }}
          />
          <ConstanciaUpload
            selectedUser={selectedUser}
            signatures={signatures}
            isSignatureLocked={areSignaturesValid}
            idCongreso={filters.idCongreso}
            congressName={selectedCongreso?.nombre_congreso}
            sede={selectedCongreso?.nombre_sede}
            onUploadSuccess={() => fetchParticipants(filters)}
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8 bg-gray-50/50 rounded-3xl shadow-inner border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              Pendientes
              <span className="bg-[#005a6a] text-white text-[10px] px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, rol..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm transition-all shadow-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 max-h-[480px]">
            {pendingUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-16">
                <MdPeople className="text-5xl opacity-30" />
                <p className="text-sm font-semibold">
                  {filteredUsers.length > 0 ? 'Todas las constancias han sido enviadas' : 'Sin participantes con los filtros actuales'}
                </p>
                <p className="text-xs">Ajusta los filtros o limpia la búsqueda</p>
              </div>
            ) : (
              <UserConstanciaList
                users={pendingUsers}
                selectedUserId={selectedUser?.id}
                onSelectUser={setSelectedUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmación envío masivo */}
      {showConfirmSend && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirmSend(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#005a6a]/10 rounded-xl flex items-center justify-center">
                <HiMail className="text-xl text-[#005a6a]" />
              </div>
              <h3 className="font-black text-gray-800">Confirmar envío masivo</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Se generarán y enviarán constancias para <strong>{pendingCount}</strong> participante{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSend(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkSend}
                className="flex-1 py-2.5 bg-[#005a6a] text-white rounded-xl text-sm font-bold hover:bg-[#004a5a] transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
