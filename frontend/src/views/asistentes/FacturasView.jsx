import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  MdReceipt, 
  MdFileDownload, 
  MdAccessTime, 
  MdErrorOutline,
  MdBusiness,
  MdFilterList,
  MdSort
} from "react-icons/md";

export default function FacturasView() {
  const { user } = useAuth();

  const [misFacturas, setMisFacturas] = useState([
    {
      id: "INV-2026-001",
      congreso: "CIENU 2026",
      fechaSolicitud: "2026-03-15",
      monto: 1000.00,
      rfc: "XAXX010101000",
      estatus: "completada",
      pdfUrl: "#", 
      xmlUrl: "#",
    },
    {
      id: "INV-2026-002",
      congreso: "CIENU 2025",
      fechaSolicitud: "2025-03-30",
      monto: 2500.00,
      rfc: "ABC123456789",
      estatus: "pendiente",
      pdfUrl: null,
      xmlUrl: null,
    }
  ]);
 
  const [configFiltro, setConfigFiltro] = useState("todas_desc");

  const facturasFiltradas = useMemo(() => {
  let resultado = [...misFacturas];
  const [estatus, orden] = configFiltro.split("_");

  // Filtrado
  if (estatus !== "todas") {
    resultado = resultado.filter(f => f.estatus === estatus);
  }

  // Ordenamiento
  resultado.sort((a, b) => {
    const dateA = new Date(a.fechaSolicitud);
    const dateB = new Date(b.fechaSolicitud);
    return orden === "desc" ? dateB - dateA : dateA - dateB;
  });

  return resultado;
}, [misFacturas, configFiltro]);

  const pendientesCount = misFacturas.filter(f => f.estatus === "pendiente").length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 min-h-screen">
      
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-base-300 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MdReceipt className="text-alt" /> Mis Comprobantes Fiscales
          </h2>
          <p className="text-sm text-neutral opacity-70">Historial de solicitudes y descargas XML/PDF.</p>
        </div>
      </div>

      {/* 2. MENSAJE DE AYUDA */}
      <div className="bg-accent/20 border border-accent/50 p-4 rounded-xl flex items-start gap-3">
        <MdErrorOutline className="text-alt mt-1 size-3 shrink-0" />
        <p className="text-xs text-neutral leading-relaxed">
          <span className="font-bold text-primary">Nota importante:</span> El procesamiento de facturas toma de <b>24 a 72 horas hábiles</b>. 
          En caso de duda, contacta a <b className="text-alt underline">finanzas@cienu2026.com</b>
        </p>
      </div>

      {/* 3. BARRA DE CONTROL UNIFICADA (Filtros y Resumen) */}
<div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl border border-base-300 shadow-sm">
  
  {/* Grupo de Filtro (Izquierda) */}
  <div className="w-full md:w-72 border border-base-300 rounded-lg overflow-hidden bg-base-100/50">
    <div className="flex items-center gap-2 px-3 py-2 w-full">
      <MdFilterList className="text-alt shrink-0" />
      <select 
        className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer w-full"
        value={configFiltro}
        onChange={(e) => setConfigFiltro(e.target.value)}
      >
        <optgroup label="Cronología General">
          <option value="todas_desc">Todas: Más recientes primero</option>
          <option value="todas_asc">Todas: Más antiguas primero</option>
        </optgroup>
        <optgroup label="Por Estatus">
          <option value="completada_desc">Completadas (Recientes)</option>
          <option value="pendiente_desc">Pendientes (Recientes)</option>
        </optgroup>
      </select>
    </div>
  </div>

  {/* Resumen (Forzado a la derecha con justify-between en el padre) */}
  <div className="flex items-center gap-3 shrink-0 px-2 ml-auto">
    <div className="text-[11px] uppercase tracking-tighter font-black text-bg-primary hidden lg:block">
      Resumen:
    </div>
    <div className="badge badge-sm py-3 px-4 bg-alt text-white border-none font-bold">
      Total: {misFacturas.length}
    </div>
    {pendientesCount > 0 && (
      <div className="badge badge-sm py-3 px-4 bg-accent text-primary border-none font-black flex gap-2">
        <MdAccessTime className="text-lg" /> {pendientesCount} Pendientes
      </div>
    )}
  </div>
</div>

      {/* 4. LISTA DE CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {facturasFiltradas.length > 0 ? (
          facturasFiltradas.map((factura) => (
            <div 
              key={factura.id} 
              className="bg-white border border-base-300 rounded-2xl p-6 hover:border-alt/40 transition-all shadow-sm group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded uppercase">
                      {factura.id}
                    </span>
                    <div className={`badge badge-outline badge-xs font-bold px-2 py-2 ${
                      factura.estatus === 'completada' ? 'text-success border-success' : 'text-neutral opacity-50'
                    }`}>
                      {factura.estatus.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                      <MdBusiness className="text-alt" /> {factura.congreso}
                    </h3>
                    <p className="text-xs text-neutral font-medium opacity-60">RFC: <span className="font-mono text-primary">{factura.rfc}</span></p>
                  </div>

                  <div className="flex gap-6 text-xs border-t border-dashed border-base-300 pt-3 text-neutral">
                    <p><b className="text-primary">Solicitud:</b> {factura.fechaSolicitud}</p>
                    <p><b className="text-primary">Total:</b> ${factura.monto.toFixed(2)} MXN</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:border-l md:pl-6 border-base-200 min-w-[150px]">
                  {factura.estatus === "completada" ? (
                    <div className="flex flex-col gap-2 w-full">
                      <a href={factura.pdfUrl} className="btn btn-xs btn-ghost border-base-300 hover:bg-primary hover:text-white normal-case gap-2 w-full h-9 transition-all">
                        <MdFileDownload className="text-lg" /> PDF
                      </a>
                      <a href={factura.xmlUrl} className="btn btn-xs btn-ghost border-base-300 hover:bg-secondary hover:text-primary normal-case gap-2 w-full h-9 transition-all font-bold">
                        <MdFileDownload className="text-lg" /> XML
                      </a>
                    </div>
                  ) : (
                    /* Generando Factura con Resalte */
                    <div className="flex flex-col items-center justify-center p-3 bg-accent/40 rounded-xl w-full border-2 border-warning/30 border-dashed">
                      <MdAccessTime className="text-xl text-primary mb-1 animate-spin-slow" />
                      <span className="text-[10px] font-black text-primary text-center uppercase tracking-tighter">
                        Generando Factura
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-base-300">
            <MdReceipt className="mx-auto text-5xl text-base-300 mb-4" />
            <p className="text-neutral opacity-50 font-medium italic text-sm">No hay resultados para esta búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}