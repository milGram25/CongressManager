import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMisConstanciasApi } from "../../api/pagosApi";
import CertificateTemplate from "../admin/Componentes/CertificateTemplate";
import {
  MdReceipt,
  MdFileDownload,
  MdAccessTime,
  MdErrorOutline,
  MdBusiness,
  MdFilterList,
  MdClose,
  MdPrint,
} from "react-icons/md";

export default function ConstanciasView() {
  const { user } = useAuth();
  const accessToken = localStorage.getItem('congress_access');

  const [misConstancias, setMisConstancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConstancia, setModalConstancia] = useState(null);

  useEffect(() => {
    const fetchConstancias = async () => {
      try {
        const data = await getMisConstanciasApi(accessToken);
        setMisConstancias(data);
      } catch (err) {
        setError('No se pudieron cargar tus constancias.');
      } finally {
        setLoading(false);
      }
    };
    fetchConstancias();
  }, [accessToken]);

  const [configFiltro, setConfigFiltro] = useState("todas_desc");

  const constanciasFiltradas = useMemo(() => {
    let resultado = [...misConstancias];
    const [estatus, orden] = configFiltro.split("_");

    if (estatus !== "todas") {
      resultado = resultado.filter(c => c.estatus === estatus);
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.fechaEmision);
      const dateB = new Date(b.fechaEmision);
      return orden === "desc" ? dateB - dateA : dateA - dateB;
    });

    return resultado;
  }, [misConstancias, configFiltro]);

  const enProcesoCount = misConstancias.filter(c => c.estatus === "en_proceso").length;

  const handlePrintCertificate = () => {
    const el = document.getElementById('user-certificate-print');
    if (!el) return;
    const nombre = user?.nombre_completo?.replace(/\s/g, '_') || 'constancia';
    const printWindow = window.open('', '', 'width=1200,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Constancia_${nombre}</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: sans-serif; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); };<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  if (error) return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-error/10 border border-error/30 text-error p-4 rounded-xl text-sm font-medium">{error}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 min-h-screen">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-base-300 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MdReceipt className="text-alt" /> Mis constancias
          </h2>
          <p className="text-sm text-neutral opacity-70">
            Descarga tus constancias de participación en congresos.
          </p>
        </div>
      </div>

      {/* MENSAJE */}
      <div className="bg-accent/20 border border-accent/50 p-4 rounded-xl flex items-start gap-3">
        <MdErrorOutline className="text-alt mt-1 size-3 shrink-0" />
        <p className="text-xs text-neutral leading-relaxed">
          <span className="font-bold text-primary">Nota:</span> Las constancias pueden tardar
          <b> hasta 72 horas</b> después del evento en estar disponibles.
        </p>
      </div>

      {/* FILTRO + RESUMEN */}
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
                <option value="disponible_desc">Disponibles</option>
                <option value="en_proceso_desc">En proceso</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="badge badge-sm py-3 px-4 bg-alt text-white border-none font-bold">
            Total: {misConstancias.length}
          </div>
          {enProcesoCount > 0 && (
            <div className="badge badge-sm py-3 px-4 bg-accent text-primary border-none font-black flex gap-2">
              <MdAccessTime className="text-lg" /> {enProcesoCount} En proceso
            </div>
          )}
        </div>
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 gap-4">
        {constanciasFiltradas.length > 0 ? (
          <>
            {constanciasFiltradas.map((constancia) => (
              <div
                key={constancia.id}
                className="bg-white border border-base-300 rounded-2xl p-6 hover:border-alt/40 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded">
                        {constancia.id}
                      </span>
                      <div className={`badge badge-outline badge-xs font-bold px-2 py-2 capitalize ${
                        constancia.estatus === 'disponible'
                          ? 'text-success border-success'
                          : 'text-neutral opacity-50'
                      }`}>
                        {constancia.estatus.replace("_", " ")}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                        <MdBusiness className="text-alt" /> {constancia.congreso}
                      </h3>
                      <p className="text-xs text-neutral opacity-60">
                        Tipo: <span className="font-semibold text-primary">{constancia.tipo}</span>
                      </p>
                    </div>

                    <div className="flex gap-6 text-xs border-t border-dashed border-base-300 pt-3 text-neutral">
                      <p>
                        <b className="text-primary">Emisión:</b> {constancia.fechaEmision}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:border-l md:pl-6 border-base-200 min-w-[150px]">
                    {constancia.estatus === "disponible" ? (
                      <button
                        onClick={() => setModalConstancia(constancia)}
                        className="btn btn-xs btn-ghost border-base-300 hover:bg-primary hover:text-white normal-case gap-2 w-full h-9"
                      >
                        <MdFileDownload className="text-lg" /> Descargar PDF
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 bg-accent/40 rounded-xl w-full border-2 border-warning/30 border-dashed">
                        <MdAccessTime className="text-xl text-primary mb-1 animate-spin-slow" />
                        <span className="text-[10px] font-black text-primary text-center">
                          Generando constancia
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div>
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-base-300">
              <MdReceipt className="mx-auto text-5xl text-base-300 mb-4" />
              <p className="text-neutral opacity-50 italic text-sm">
                No hay constancias disponibles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CONSTANCIA */}
      {modalConstancia && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalConstancia(null)}
          ></div>
          <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
<<<<<<< HEAD
                <p className="font-black text-gray-800 text-sm uppercase tracking-tight">
=======
                <p className="font-black text-gray-800 text-sm tracking-tight">
>>>>>>> b3642985737c97cf2c3de9ab5edd4ab3c3cb7550
                  Constancia de participación
                </p>
                <p className="text-xs text-gray-400">
                  {modalConstancia.congreso} — {modalConstancia.tipo}
                </p>
              </div>
              <button
                onClick={() => setModalConstancia(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <MdClose className="text-xl text-gray-400" />
              </button>
            </div>

            {/* Vista previa */}
            <div className="flex-1 bg-neutral-200 overflow-auto p-6 flex items-start justify-center">
              <div id="user-certificate-print" className="w-full max-w-4xl shadow-2xl rounded-lg overflow-hidden">
                <CertificateTemplate
                  user={{
                    nombre: user?.nombre_completo,
                    rol: modalConstancia.tipo,
                    id: modalConstancia.id,
                  }}
                  signatures={{
                    organizador: modalConstancia.firmaOrganizador,
                    secretaria: modalConstancia.firmaSecretaria,
                  }}
                  congressName={modalConstancia.congreso}
                  sede={modalConstancia.sede}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setModalConstancia(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50 transition-all tracking-wide"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg tracking-wide"
              >
                <MdPrint className="text-base" /> Guardar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
