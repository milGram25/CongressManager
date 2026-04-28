import { useState, useEffect } from "react";
import ListaHistorial from "./Componentes/ListaHistorial";
import { MdReceipt, MdBadge } from "react-icons/md";
import { getUserHistoryApi } from "../../api/adminApi";

export default function UsuariosHistorialView() {
  const [activeTab, setActiveTab] = useState("facturas");
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [constanciaHistory, setConstanciaHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [invData, constData] = await Promise.all([
          getUserHistoryApi(accessToken, 'facturas'),
          getUserHistoryApi(accessToken, 'constancias')
        ]);
        setInvoiceHistory(invData);
        setConstanciaHistory(constData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Título y Tabs */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Usuarios</h1>
            <p className="text-sm text-gray-500">Consulta el registro de documentos emitidos y acciones realizadas</p>
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("facturas")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "facturas" ? "bg-white text-[#005a6a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdReceipt className="text-xl" />
            Historial de Facturas
          </button>
          <button 
            onClick={() => setActiveTab("constancias")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "constancias" ? "bg-white text-[#005a6a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdBadge className="text-xl" />
            Historial de Constancias
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-center min-h-[500px]">
        {activeTab === "facturas" ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
             <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-700">Registro de Facturación</h3>
                <p className="text-sm text-gray-400">Listado de facturas enviadas y pagos registrados</p>
             </div>
             <ListaHistorial listaElementos={invoiceHistory}/>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-700">Registro de Constancias</h3>
                <p className="text-sm text-gray-400">Listado de certificados y reconocimientos emitidos</p>
             </div>
            <ListaHistorial listaElementos={constanciaHistory}/>
          </div>
        )}
      </div>
    </div>
  );
}
