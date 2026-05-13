import { useState, useEffect, useMemo } from "react";
import { HiSearch, HiFilter, HiCollection } from "react-icons/hi";
import { MdReceipt } from "react-icons/md";
import InvoiceUpload from "./Componentes/InvoiceUpload";
import FacturaPendienteList from "./Componentes/FacturaPendienteList";
import FilterHeader from "./Componentes/FilterHeader";
import { getPendingFacturasApi, getCongresosApi } from "../../api/adminApi";

export default function UsuariosFacturasView() {
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [congresos, setCongresos] = useState([]);
  const [filters, setFilters] = useState({ idCongreso: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listingAll, setListingAll] = useState(false);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters.idCongreso) fetchPendientes(filters.idCongreso);
  }, [filters.idCongreso]);

  const fetchPendientes = async (idCongreso = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingFacturasApi(accessToken, idCongreso);
      setFacturasPendientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    if (field === 'idCongreso') {
      setSelectedFactura(null);
      setListingAll(false);
      setFacturasPendientes([]);
      setFilters(prev => ({ ...prev, idCongreso: value }));
    }
  };

  const handleListarTodas = () => {
    setListingAll(true);
    setSelectedFactura(null);
    setFilters({ idCongreso: null });
    fetchPendientes(null);
  };

  const handleUploadSuccess = (idFactura) => {
    setFacturasPendientes(prev => prev.filter(f => f.id_factura !== idFactura));
    setSelectedFactura(null);
  };

  const facturasFiltradas = useMemo(() => {
    if (!searchTerm) return facturasPendientes;
    const term = searchTerm.toLowerCase();
    return facturasPendientes.filter(f =>
      f.nombre_completo.toLowerCase().includes(term) ||
      (f.rfc || '').toLowerCase().includes(term) ||
      (f.nombre_congreso || '').toLowerCase().includes(term)
    );
  }, [facturasPendientes, searchTerm]);

  const sinFiltro = !filters.idCongreso && !listingAll;

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
            onClick={handleListarTodas}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
              ${listingAll
                ? 'bg-[#005a6a] text-white shadow-lg shadow-[#005a6a]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-[#005a6a]/10 hover:text-[#005a6a]'}`}
          >
            <HiCollection />
            Listar todas las pendientes
          </button>
        </div>

        <FilterHeader onFilterChange={handleFilterChange} congresos={congresos} />

        {facturasPendientes.length > 0 && (
          <div className="flex gap-3 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <MdReceipt /> {facturasFiltradas.length} pendientes
            </span>
          </div>
        )}
      </div>

      {/* Alerta sin filtro */}
      {sinFiltro && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-blue-400 p-2 rounded-xl text-white"><HiFilter className="text-xl" /></div>
          <div>
            <p className="text-blue-800 font-bold text-sm">Selecciona un congreso o lista todas las pendientes</p>
            <p className="text-blue-600 text-xs">Usa los filtros o el botón para ver facturas pendientes.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      {!sinFiltro && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <InvoiceUpload
              selectedFactura={selectedFactura}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8 bg-gray-50/50 rounded-3xl shadow-inner border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 border-b border-gray-100">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                Facturas Pendientes
                <span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {facturasFiltradas.length}
                </span>
              </h3>
              <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RFC, congreso..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm bg-white shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-h-[480px]">
              {loading ? (
                <div className="flex justify-center py-16">
                  <span className="loading loading-spinner loading-lg text-[#005a6a]" />
                </div>
              ) : facturasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-16">
                  <MdReceipt className="text-5xl opacity-30" />
                  <p className="text-sm font-semibold">Sin facturas pendientes</p>
                </div>
              ) : (
                <FacturaPendienteList
                  facturas={facturasFiltradas}
                  selectedId={selectedFactura?.id_factura}
                  onSelect={(f) => setSelectedFactura(
                    selectedFactura?.id_factura === f.id_factura ? null : f
                  )}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
