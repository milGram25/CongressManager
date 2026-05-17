import { useState, useMemo, useEffect } from "react";
import {
  MdReceipt,
  MdFileDownload,
  MdAccessTime,
  MdErrorOutline,
  MdBusiness,
  MdFilterList,
} from "react-icons/md";
import { getMisFacturasApi } from "../../api/pagosApi";
import { API_URL } from "../../api/constants";

export default function FacturasView() {
  const [misFacturas, setMisFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configFiltro, setConfigFiltro] = useState("todas_desc");

  useEffect(() => {
    const token = localStorage.getItem("congress_access");
    getMisFacturasApi(token)
      .then(setMisFacturas)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const facturasFiltradas = useMemo(() => {
    let resultado = [...misFacturas];
    const [estatus, orden] = configFiltro.split("_");

    if (estatus !== "todas") {
      resultado = resultado.filter(f => f.estatus === estatus);
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.fecha_solicitud);
      const dateB = new Date(b.fecha_solicitud);
      return orden === "desc" ? dateB - dateA : dateA - dateB;
    });

    return resultado;
  }, [misFacturas, configFiltro]);

  const pendientesCount = misFacturas.filter(f => f.estatus === "pendiente").length;

  const formatFecha = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  };

  const getDownloadUrl = (ruta) => ruta ? `${API_URL}${ruta}` : null;

  const getFileLabel = (ruta) => {
    if (!ruta) return "Descargar";
    if (ruta.toLowerCase().endsWith(".xml")) return "XML";
    return "PDF";
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 min-h-screen">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-base-300 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MdReceipt className="text-alt" /> Mis comprobantes fiscales
          </h2>
          <p className="text-sm text-neutral opacity-70">Historial de solicitudes y descargas XML/PDF.</p>
        </div>
      </div>

      <div className="bg-accent/20 border border-accent/50 p-4 rounded-xl flex items-start gap-3">
        <MdErrorOutline className="text-alt mt-1 size-3 shrink-0" />
        <p className="text-xs text-neutral leading-relaxed">
          <span className="font-bold text-primary">Nota importante:</span> El procesamiento de facturas toma de <b>24 a 72 horas hábiles</b>.
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl border border-base-300 shadow-sm">
        <div className="w-full md:w-72 border border-base-300 rounded-lg overflow-hidden bg-base-100/50">
          <div className="flex items-center gap-2 px-3 py-2 w-full">
            <MdFilterList className="text-alt shrink-0" />
            <select
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer w-full"
              value={configFiltro}
              onChange={(e) => setConfigFiltro(e.target.value)}
            >
              <optgroup label="Cronología general">
                <option value="todas_desc">Todas: Más recientes primero</option>
                <option value="todas_asc">Todas: Más antiguas primero</option>
              </optgroup>
              <optgroup label="Por estatus">
                <option value="enviada_desc">Completadas (Recientes)</option>
                <option value="pendiente_desc">Pendientes (Recientes)</option>
              </optgroup>
            </select>
          </div>
        </div>

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

      <div className="grid grid-cols-1 gap-4">
        {facturasFiltradas.length > 0 ? (
          facturasFiltradas.map((factura) => (
            <div
              key={factura.id_factura}
              className="bg-white border border-base-300 rounded-2xl p-6 hover:border-alt/40 transition-all shadow-sm group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded uppercase">
                      FAC-{factura.id_factura}
                    </span>
                    <div className={`badge badge-outline badge-xs font-bold px-2 py-2 ${
                      factura.estatus === 'enviada' ? 'text-success border-success' : 'text-neutral opacity-50'
                    }`}>
                      {factura.estatus === 'enviada' ? 'Completada' : 'Pendiente'}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                      <MdBusiness className="text-alt" /> {factura.nombre_congreso || "Congreso"}
                    </h3>
                    <p className="text-xs text-neutral font-medium opacity-60">
                      RFC: <span className="font-mono text-primary">{factura.rfc || "—"}</span>
                    </p>
                    {factura.razon_social && (
                      <p className="text-xs text-neutral font-medium opacity-60">
                        Razón social: <span className="font-semibold">{factura.razon_social}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-6 text-xs border-t border-dashed border-base-300 pt-3 text-neutral">
                    <p><b className="text-primary">Solicitud:</b> {formatFecha(factura.fecha_solicitud)}</p>
                    {factura.fecha_envio && (
                      <p><b className="text-primary">Procesada:</b> {formatFecha(factura.fecha_envio)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:border-l md:pl-6 border-base-200 min-w-[150px]">
                  {factura.estatus === "enviada" && factura.ruta_pdf_xml ? (
                    <div className="flex flex-col gap-2 w-full">
                      <a
                        href={getDownloadUrl(factura.ruta_pdf_xml)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs btn-ghost border-base-300 hover:bg-primary hover:text-white normal-case gap-2 w-full h-9 transition-all"
                      >
                        <MdFileDownload className="text-lg" /> {getFileLabel(factura.ruta_pdf_xml)}
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 bg-accent/40 rounded-xl w-full border-2 border-warning/30 border-dashed">
                      <MdAccessTime className="text-xl text-primary mb-1" />
                      <span className="text-[10px] font-black text-primary text-center uppercase tracking-tighter">
                        Generando factura
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
            <p className="text-neutral opacity-50 font-medium italic text-sm">
              {misFacturas.length === 0 ? "No tienes solicitudes de factura registradas." : "No hay resultados para esta búsqueda."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
