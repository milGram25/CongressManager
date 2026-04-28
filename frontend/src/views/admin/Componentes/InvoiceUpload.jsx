import { useState, useEffect } from "react";
import { HiCloudUpload, HiDocumentText, HiTrash, HiCheckCircle, HiX, HiMail } from "react-icons/hi";
import { MdReceipt, MdPerson, MdBusiness } from "react-icons/md";
import { BsFillPersonFill, BsFillPersonLinesFill } from "react-icons/bs";
import { uploadFacturaApi } from "../../../api/adminApi";

const ROL_COLORS = {
  Dictaminador: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Evaluador:    { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Ponente:      { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
  Asistente:    { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200'   },
  default:      { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'   },
};

const STATUS_BADGE = {
  pendiente: { label: 'Pendiente',  cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  enviada:   { label: 'Enviada',    cls: 'bg-green-50  text-green-600  border-green-200'  },
};

export default function InvoiceUpload({ selectedUser, idCongreso, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const accessToken = localStorage.getItem('congress_access');
  const rolColors = ROL_COLORS[selectedUser?.rol] || ROL_COLORS.default;
  const facturaBadge = STATUS_BADGE[selectedUser?.facturaEstatus] || null;

  useEffect(() => {
    setFile(null);
    setSuccessMsg(false);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type === 'application/pdf' || f.type.startsWith('image/')) {
      setFile(f);
      setShowModal(true);
    } else {
      alert("Solo se aceptan archivos PDF o imagen.");
    }
  };

  const handleConfirmSend = async () => {
    setIsUploading(true);
    try {
      await uploadFacturaApi(accessToken, selectedUser.id, idCongreso, file);
      setIsUploading(false);
      setShowModal(false);
      setFile(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      alert("Error al subir la factura.");
      setIsUploading(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-gray-300">
        <MdReceipt className="text-5xl" />
        <p className="text-sm font-semibold text-center">Selecciona un participante de la lista</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-in slide-in-from-left duration-400">
        {/* Cabecera participante */}
        <div className="bg-gradient-to-br from-[#005a6a] to-[#007a8a] text-white p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/20">
              {selectedUser.rol === 'Dictaminador' ? <BsFillPersonLinesFill /> : <BsFillPersonFill />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base leading-tight truncate">{selectedUser.nombre}</h3>
              <p className="text-white/70 text-xs truncate mt-0.5">{selectedUser.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rolColors.bg} ${rolColors.text} ${rolColors.border}`}>
                  {selectedUser.rol}
                </span>
                {facturaBadge && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${facturaBadge.cls}`}>
                    {facturaBadge.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Datos fiscales */}
          {(selectedUser.rfc || selectedUser.razonSocial) && (
            <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/15 space-y-1">
              {selectedUser.rfc && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50 font-bold uppercase tracking-wider w-14">RFC</span>
                  <span className="font-mono font-bold text-white">{selectedUser.rfc}</span>
                </div>
              )}
              {selectedUser.razonSocial && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50 font-bold uppercase tracking-wider w-14">Razón</span>
                  <span className="font-semibold text-white/90 truncate">{selectedUser.razonSocial}</span>
                </div>
              )}
              {selectedUser.regimenFiscal && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50 font-bold uppercase tracking-wider w-14">Régimen</span>
                  <span className="text-white/80 text-[10px] truncate">{selectedUser.regimenFiscal}</span>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mt-3 flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 rounded-xl px-3 py-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
              <HiCheckCircle className="text-lg shrink-0" /> Factura enviada correctamente
            </div>
          )}
        </div>

        {/* Zona de subida */}
        <div className="bg-white p-5">
          {selectedUser.facturaEstatus === 'enviada' && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold">
              <HiCheckCircle className="text-xl shrink-0" /> Factura ya enviada — puedes reemplazarla subiendo un nuevo archivo
            </div>
          )}

          <label
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
              ${dragActive ? 'bg-[#005a6a]/5 border-[#005a6a] scale-[1.02]' : 'border-gray-200 hover:border-[#005a6a]/40 hover:bg-gray-50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <MdReceipt className={`text-4xl transition-colors ${dragActive ? 'text-[#005a6a]' : 'text-gray-300'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-600">Arrastra el PDF de la factura aquí</p>
              <p className="text-xs text-gray-400 mt-0.5">o haz clic para explorar (PDF / imagen)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>

          {!idCongreso && (
            <p className="mt-3 text-center text-xs text-orange-500 font-semibold">Selecciona un congreso en el filtro para habilitar el envío</p>
          )}
        </div>
      </div>

      {/* Modal previsualización */}
      {showModal && file && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <MdReceipt className="text-2xl text-[#005a6a]" />
                <div>
                  <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Confirmar Envío de Factura</h3>
                  <p className="text-xs text-gray-400">{selectedUser.nombre} — {selectedUser.rfc || 'Sin RFC'}</p>
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
                <img src={previewUrl} alt="Vista previa" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg" />
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
                disabled={isUploading || !idCongreso}
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
