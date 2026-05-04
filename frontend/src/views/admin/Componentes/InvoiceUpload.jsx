import { useState, useEffect } from "react";
import { HiDocumentText, HiCheckCircle, HiX, HiMail } from "react-icons/hi";
import { MdReceipt, MdAccessTime } from "react-icons/md";
import { uploadFacturaApi } from "../../../api/adminApi";

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatMonto = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto ?? 0);

export default function InvoiceUpload({ selectedFactura, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    setFile(null);
    setSuccessMsg(false);
  }, [selectedFactura?.id_factura]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const isXmlFile = (f) =>
    f.type === 'text/xml' || f.type === 'application/xml' || f.name.toLowerCase().endsWith('.xml');

  const handleFile = (f) => {
    if (!f) return;
    if (f.type === 'application/pdf' || isXmlFile(f)) {
      setFile(f);
      setShowModal(true);
    } else {
      alert('Solo se aceptan archivos PDF o XML.');
    }
  };

  const handleConfirmSend = async () => {
    setIsUploading(true);
    try {
      await uploadFacturaApi(
        accessToken,
        selectedFactura.id_persona,
        selectedFactura.id_congreso,
        file,
      );
      setIsUploading(false);
      setShowModal(false);
      setFile(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      if (onUploadSuccess) onUploadSuccess(selectedFactura.id_factura);
    } catch {
      alert('Error al subir la factura.');
      setIsUploading(false);
    }
  };

  if (!selectedFactura) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-gray-300">
        <MdReceipt className="text-5xl" />
        <p className="text-sm font-semibold text-center">Selecciona una factura pendiente de la lista</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-in slide-in-from-left duration-400">
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-[#005a6a] to-[#007a8a] text-white p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/20">
              <MdReceipt />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base leading-tight truncate">{selectedFactura.nombre_completo}</h3>
              <p className="text-white/70 text-xs truncate mt-0.5">{selectedFactura.correo_electronico}</p>
              <p className="text-white/60 text-xs mt-1 font-semibold truncate">{selectedFactura.nombre_congreso}</p>
            </div>
          </div>

          {/* Datos fiscales */}
          <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/15 space-y-1">
            {selectedFactura.rfc && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">RFC</span>
                <span className="font-mono font-bold text-white">{selectedFactura.rfc}</span>
              </div>
            )}
            {selectedFactura.razon_social && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">Razón</span>
                <span className="font-semibold text-white/90 truncate">{selectedFactura.razon_social}</span>
              </div>
            )}
            {selectedFactura.regimen_fiscal && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">Régimen</span>
                <span className="text-white/80 text-[10px] truncate">{selectedFactura.regimen_fiscal}</span>
              </div>
            )}
            {selectedFactura.codigo_postal && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">C.P.</span>
                <span className="text-white/80">{selectedFactura.codigo_postal}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-white/10 mt-1">
              <MdAccessTime className="text-white/50 shrink-0" />
              <span className="text-white/60">Solicitada:</span>
              <span className="text-white/90 font-semibold">{formatFecha(selectedFactura.fecha_solicitud)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50 font-bold uppercase tracking-wider w-20">Pagado</span>
              <span className="text-yellow-300 font-black">{formatMonto(selectedFactura.monto_pagado)}</span>
            </div>
          </div>

          {successMsg && (
            <div className="mt-3 flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 rounded-xl px-3 py-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
              <HiCheckCircle className="text-lg shrink-0" /> Factura enviada correctamente
            </div>
          )}
        </div>

        {/* Zona de subida */}
        <div className="bg-white p-5">
          <label
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
              ${dragActive ? 'bg-[#005a6a]/5 border-[#005a6a] scale-[1.02]' : 'border-gray-200 hover:border-[#005a6a]/40 hover:bg-gray-50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <MdReceipt className={`text-4xl transition-colors ${dragActive ? 'text-[#005a6a]' : 'text-gray-300'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-600">Arrastra el PDF o XML de la factura aquí</p>
              <p className="text-xs text-gray-400 mt-0.5">o haz clic para explorar (PDF / XML)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.xml"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Modal confirmación */}
      {showModal && file && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <MdReceipt className="text-2xl text-[#005a6a]" />
                <div>
                  <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Confirmar Envío de Factura</h3>
                  <p className="text-xs text-gray-400">{selectedFactura.nombre_completo} — {selectedFactura.rfc || 'Sin RFC'}</p>
                </div>
              </div>
              <button onClick={() => !isUploading && setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <HiX className="text-xl text-gray-400" />
              </button>
            </div>

            <div className="flex-1 bg-neutral-200 overflow-auto p-6 flex items-start justify-center">
              {file.type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border-none shadow-lg" title="Vista previa" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12 bg-white rounded-2xl shadow-inner">
                  <HiDocumentText className="text-8xl text-[#005a6a]/40" />
                  <p className="font-bold text-gray-700 text-center">{file.name}</p>
                  <p className="text-xs text-gray-400">Archivo XML listo para enviar</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t flex gap-3 shrink-0">
              <button
                disabled={isUploading}
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={isUploading}
                onClick={handleConfirmSend}
                className="flex-1 py-2.5 bg-[#005a6a] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#004a5a] transition-all shadow-lg disabled:opacity-50"
              >
                {isUploading ? <span className="loading loading-spinner loading-sm" /> : <HiMail className="text-base" />}
                Confirmar y Enviar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
