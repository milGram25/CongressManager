import { useState, useEffect } from "react";
import { HiSearch, HiSparkles, HiMail, HiCheckCircle } from "react-icons/hi";
import ConstanciaUpload from "./Componentes/ConstanciaUpload";
import UserConstanciaList from "./Componentes/UserConstanciaList";
import FilterHeader from "./Componentes/FilterHeader";
import SignatureUpload from "./Componentes/SignatureUpload";
import { getParticipantsApi, bulkConstanciaActionApi, getCongresoSignaturesApi, updateCongresoSignaturesApi } from "../../api/adminApi";

export default function UsuariosConstanciasView() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null); 
  const [processedCount, setProcessedCount] = useState(0);
  const [signatures, setSignatures] = useState({ organizador: null, secretaria: null });
  const [areSignaturesValid, setAreSignaturesValid] = useState(false);
  const [idCongreso] = useState(1); // TODO: Obtener del contexto del congreso actual

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchParticipants();
    fetchSignatures();
  }, []);

  const fetchParticipants = async () => {
    try {
      const data = await getParticipantsApi(accessToken, idCongreso);
      const mappedData = data.map(u => ({
        id: u.id_persona,
        nombre: u.nombre_completo,
        email: u.correo_electronico,
        rol: u.rol,
        institucion: u.institucion,
        status: u.constancia?.estatus === 'enviada' ? 'green' : (u.constancia?.estatus === 'generada' ? 'yellow' : 'red')
      }));
      setUsers(mappedData);
      if (!selectedUser && mappedData.length > 0) setSelectedUser(mappedData[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSignatures = async () => {
    try {
      const data = await getCongresoSignaturesApi(accessToken, idCongreso);
      setSignatures({
        organizador: data.firma_organizador,
        secretaria: data.firma_secretaria
      });
      setAreSignaturesValid(data.firmas_bloqueadas);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkAction = async (type) => {
    if (!areSignaturesValid) {
      alert("⚠️ Error: Debe confirmar y bloquear las firmas institucionales antes de realizar acciones masivas.");
      return;
    }
    setBulkActionType(type);
    setIsBulkProcessing(true);
    setProcessedCount(0);

    try {
      if (type === 'send') {
        await bulkConstanciaActionApi(accessToken, 'send', idCongreso, users.map(u => u.id));
        await fetchParticipants();
      }
      // Simulación visual de progreso
      let count = 0;
      const interval = setInterval(() => {
        count += 5;
        if (count >= users.length) {
          setProcessedCount(users.length);
          clearInterval(interval);
          setTimeout(() => {
            setIsBulkProcessing(false);
            setBulkActionType(null);
          }, 800);
        } else {
          setProcessedCount(count);
        }
      }, 100);
    } catch (error) {
      alert("Error en acción masiva");
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-2 md:p-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Emisión de Constancias</h1>
              <p className="text-sm text-gray-500">Genera y envía certificados a todos los participantes</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => handleBulkAction('generate')}
              disabled={isBulkProcessing || !areSignaturesValid}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 
                ${areSignaturesValid ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100' : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'}`}
              title={!areSignaturesValid ? "Se requieren firmas confirmadas" : ""}
            >
              {bulkActionType === 'generate' ? <span className="loading loading-spinner loading-xs"></span> : <HiSparkles />}
              Generar Todas
            </button>
            <button 
              onClick={() => handleBulkAction('send')}
              disabled={isBulkProcessing || !areSignaturesValid}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50
                ${areSignaturesValid ? 'bg-[#005a6a] text-white hover:bg-[#004a5a] shadow-blue-900/20' : 'bg-gray-400 text-gray-200 shadow-none cursor-not-allowed'}`}
              title={!areSignaturesValid ? "Se requieren firmas confirmadas" : ""}
            >
              {bulkActionType === 'send' ? <span className="loading loading-spinner loading-xs"></span> : <HiMail />}
              Enviar a Todos
            </button>
          </div>
        </div>
        
        <FilterHeader />
      </div>

      {!areSignaturesValid && !isBulkProcessing && (
        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-yellow-400 p-2 rounded-xl text-white">
            <HiSparkles className="text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-yellow-800 font-bold text-sm uppercase tracking-tight">Acciones bloqueadas</p>
            <p className="text-yellow-700 text-xs">Debe subir y <strong>confirmar</strong> las firmas institucionales en el panel izquierdo para habilitar la generación y envío de constancias.</p>
          </div>
        </div>
      )}

      {isBulkProcessing && (
        <div className="bg-[#005a6a] p-5 rounded-2xl text-white flex flex-col gap-3 animate-in slide-in-from-top duration-300 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <p className="font-black text-xs uppercase tracking-[0.2em]">
                {bulkActionType === 'generate' ? "Motor de Plantillas: Generando Documentos" : "Servidor de Correo: Enviando Constancias"}
              </p>
            </div>
            <p className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">
              {processedCount} / {users.length} COMPLETADOS
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-400 h-full transition-all duration-300 ease-out" 
              style={{ width: `${(processedCount / users.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <SignatureUpload 
            onSignaturesChange={(sigs) => {
              setSignatures(sigs);
              setAreSignaturesValid(!!(sigs.organizador && sigs.secretaria));
            }} 
          />
          <ConstanciaUpload 
            selectedUser={selectedUser} 
            signatures={signatures}
            isSignatureLocked={areSignaturesValid}
            onUploadSuccess={() => {
              const updated = users.map(u => u.id === selectedUser.id ? { ...u, status: "green" } : u);
              setUsers(updated);
            }} 
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8 bg-gray-50/50 rounded-3xl shadow-inner border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              Participantes del Congreso
              <span className="bg-[#005a6a] text-white text-[10px] px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o rol..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm transition-all shadow-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <UserConstanciaList 
              users={filteredUsers} 
              selectedUserId={selectedUser?.id}
              onSelectUser={setSelectedUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
