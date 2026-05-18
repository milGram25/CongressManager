import { useEffect } from "react";
import { HiDownload, HiX } from "react-icons/hi";
import { MdInsertDriveFile, MdPerson, MdCalendarToday, MdBusiness, MdBadge, MdReceiptLong } from "react-icons/md";
import { API_URL } from "../../../api/constants";

export default function VistaPreviewDocumento({ item, etiquetaFecha, onClose }) {
    const archivoUrl = item?.archivo || null;
    const archivoUrlDescarga = item?.archivo ? `${API_URL}${item.archivo}` : null;
    const archivoXmlDescarga = item?.archivo_xml ? `${API_URL}${item.archivo_xml}` : null;
    const esXml = item?.archivo?.toLowerCase().endsWith(".xml");

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    function formatFecha(fecha) {
        if (!fecha) return "—";
        const d = new Date(fecha);
        return d.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) +
            " · " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
                style={{ height: "88vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Sidebar izquierdo ── */}
                <div className="flex flex-col w-72 shrink-0 bg-[#005a6a] text-white">
                    {/* Header sidebar */}
                    <div className="px-6 pt-6 pb-5 border-b border-white/10">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[10px] font-bold text-white/50 mb-1">
                                    {item.accion}
                                </p>
                                <h2 className="text-base font-bold leading-snug text-white">
                                    {item.nombre}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Cerrar"
                                className="shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <HiX className="text-base" />
                            </button>
                        </div>
                    </div>

                    {/* Metadatos */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                        {item.fecha && (
                            <MetaItem icon={<MdCalendarToday />} label={etiquetaFecha} value={formatFecha(item.fecha)} />
                        )}
                        {item.rol && (
                            <MetaItem icon={<MdBadge />} label="Rol" value={item.rol} />
                        )}
                        {item.congreso && (
                            <MetaItem icon={<MdBusiness />} label="Congreso" value={item.congreso} />
                        )}
                        {item.rfc && (
                            <MetaItem icon={<MdReceiptLong />} label="RFC" value={item.rfc} mono />
                        )}
                        {item.razon_social && (
                            <MetaItem icon={<MdPerson />} label="Razón social" value={item.razon_social} />
                        )}
                    </div>

                    {/* Botones descarga */}
                    <div className="px-6 pb-6 shrink-0 flex flex-col gap-2">
                        {archivoUrlDescarga ? (
                            <a
                                href={archivoUrlDescarga}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-[#005a6a] text-sm font-bold hover:bg-white/90 transition-all active:scale-95 cursor-pointer"
                            >
                                <HiDownload className="text-lg" />
                                Descargar PDF
                            </a>
                        ) : (
                            <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 text-white/40 text-sm font-bold cursor-not-allowed">
                                <HiDownload className="text-lg" />
                                Sin PDF
                            </div>
                        )}
                        {archivoXmlDescarga && (
                            <a
                                href={archivoXmlDescarga}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-all active:scale-95 cursor-pointer border border-white/20"
                            >
                                <HiDownload className="text-lg" />
                                Descargar XML
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Panel PDF ── */}
                <div className="flex-1 bg-gray-100 flex flex-col min-w-0">
                    {!archivoUrl ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <MdInsertDriveFile className="text-7xl text-gray-300" />
                            <p className="text-sm font-medium">No hay archivo disponible para este documento.</p>
                        </div>
                    ) : esXml ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
                            <MdInsertDriveFile className="text-7xl text-[#005a6a]/30" />
                            <p className="text-sm font-semibold">Archivo XML</p>
                            <p className="text-xs text-gray-400">Este formato no tiene vista previa en el navegador.</p>
                            <a
                                href={archivoUrlDescarga}
                                download
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#005a6a] text-white text-sm font-bold rounded-xl hover:bg-[#004a58] transition-all cursor-pointer"
                            >
                                <HiDownload className="text-lg" /> Descargar XML
                            </a>
                        </div>
                    ) : (
                        <iframe
                            src={archivoUrl}
                            title={`Vista previa — ${item.nombre}`}
                            className="w-full h-full border-0"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function MetaItem({ icon, label, value, mono = false }) {
    return (
        <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 text-sm mt-0.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/40 mb-0.5">{label}</p>
                <p className={`text-sm font-semibold text-white leading-snug break-words ${mono ? "font-mono" : ""}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
