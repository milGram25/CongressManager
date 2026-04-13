import { useState } from "react";
import { HiCloudUpload, HiDocumentText, HiTrash, HiCheckCircle } from "react-icons/hi";

export default function InvoiceUpload({ selectedUser }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

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
      setFile(e.dataTransfer.files[0]);
    }
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
                onChange={(e) => setFile(e.target.files[0])}
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
            <button className="w-full mt-6 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg">
              <HiCheckCircle className="text-xl" /> Confirmar y Enviar
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex justify-between items-center text-xs opacity-70">
          <span>Participante ID: #{selectedUser?.id.toString().padStart(4, '0')}</span>
          <span>{selectedUser?.rol}</span>
        </div>
      </div>
    </div>
  );
}
