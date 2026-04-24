import { useState, useEffect } from "react";
import { HiCloudUpload, HiDocumentText, HiTrash, HiCheckCircle, HiX, HiEye } from "react-icons/hi";

export default function InvoiceUpload({ selectedUser, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Generar vista previa del archivo
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (newFile) => {
    if (newFile && (newFile.type === "application/pdf" || newFile.type.startsWith("image/"))) {
      setFile(newFile);
    } else {
      alert("Por favor sube un archivo válido (PDF o Imagen)");
    }
  };

  const handleConfirmSend = () => {
    setIsUploading(true);

    // Simulación de envío y actualización de localStorage
    setTimeout(() => {
      const allRequests = JSON.parse(localStorage.getItem("invoice_requests") || "[]");
      const updatedRequests = allRequests.map(req => {
        if (req.id === selectedUser.id) {
          return { ...req, status: "green", fechaEnvio: new Date().toISOString() };
        }
        return req;
      });

      localStorage.setItem("invoice_requests", JSON.stringify(updatedRequests));

      setIsUploading(false);
      setShowConfirmModal(false);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();

      // Feedback opcional (podría ser un toast)
      console.log("Factura enviada con éxito");
    }, 1500);
  };

  return (
    <div className="bg-[#005a6a] text-white p-8 rounded-3xl shadow-xl h-full flex flex-col gap-6 animate-in slide-in-from-left duration-500">
      <div>
        <h3 className="text-xl font-bold mb-1">Subir Factura</h3>
        <p className="text-blue-100 text-sm italic">
          Asignando documento a: <span className="font-bold underline">{selectedUser?.nombre}</span>
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 text-center min-h-[250px]
          ${dragActive ? "bg-white/10 border-white scale-105" : "border-white/30 hover:border-white/60"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <HiCloudUpload className="text-4xl text-white" />
            </div>
            <div>
              <p className="font-semibold text-lg">Arrastra tu archivo aquí</p>
              <p className="text-xs text-blue-200 mt-1">Soporta PDF, JPG o PNG (Max 5MB)</p>
            </div>
            <label className="mt-2 px-6 py-2 bg-white text-[#005a6a] rounded-full font-bold text-sm cursor-pointer hover:bg-blue-50 transition-colors shadow-lg">
              Seleccionar Archivo
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
                accept=".pdf,.jpg,.png"
              />
            </label>
          </>
        ) : (
          <div className="w-full animate-in zoom-in duration-300">
            <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4 text-left border border-white/20">
              <HiDocumentText className="text-4xl text-blue-200" />
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">{file.name}</p>
                <p className="text-xs text-blue-200">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                <HiTrash className="text-xl text-red-300" />
              </button>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-6 py-3 bg-white text-[#005a6a] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg active:scale-95"
            >
              <HiEye className="text-xl" /> Revisar y Confirmar Envío
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex justify-between items-center text-xs opacity-70">
          <span>Participante ID: #{selectedUser?.id.toString().substring(0, 6)}</span>
          <span>{selectedUser?.rol}</span>
        </div>
      </div>

      {/* MODAL DE SEGUNDA CONFIRMACIÓN CON PREVIEW */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isUploading && setShowConfirmModal(false)}
          ></div>

          <div className="relative bg-white text-gray-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-[#005a6a]">Confirmar Envío de Factura</h3>
              </div>
              <button
                onClick={() => !isUploading && setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <HiX className="text-xl text-gray-400" />
              </button>
            </div>

            <div className="p-4 overflow-hidden flex-1 bg-gray-100 flex flex-col gap-3">
              {/* Información del Destinatario Compacta */}
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-800">{selectedUser?.nombre}</p>
                  <span className="text-xs text-gray-400">|</span>
                  <p className="text-xs text-[#005a6a] font-medium">{selectedUser?.email}</p>
                </div>
                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">RFC:</p>
                  <p className="font-mono font-bold text-gray-700">{selectedUser?.rfc}</p>
                </div>
              </div>

              {/* Área de Preview Maximizada */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-1 flex items-center justify-center overflow-hidden shadow-inner">
                {file.type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full rounded-lg border-none"
                    title="Vista previa PDF"
                  />
                ) : (
                  <img src={previewUrl} alt="Vista previa" className="max-w-full max-h-full object-contain rounded-lg" />
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t flex flex-col sm:flex-row gap-3">
              <button
                disabled={isUploading}
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-6 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-600 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                disabled={isUploading}
                onClick={handleConfirmSend}
                className="flex-1 py-3 bg-[#005a6a] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-blue-900/20 disabled:bg-gray-400 order-1 sm:order-2"
              >
                {isUploading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <HiCheckCircle className="text-xl" />
                )}
                <span className="text-base">{isUploading ? "Procesando..." : "Confirmar y Enviar Factura"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
