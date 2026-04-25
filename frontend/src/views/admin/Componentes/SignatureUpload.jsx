import { useState, useEffect } from "react";
import { HiCloudUpload, HiCheckCircle, HiTrash, HiLockClosed, HiLockOpen } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import { getCongresoSignaturesApi, updateCongresoSignaturesApi } from "../../../api/adminApi";
import { API_URL } from "../../../api/constants";

export default function SignatureUpload({ onSignaturesChange }) {
  const [signatures, setSignatures] = useState({
    organizador: null,
    secretaria: null
  });
  const [isLocked, setIsLocked] = useState(false);
  const [idCongreso] = useState(1); // TODO

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    fetchSignatures();
  }, []);

  const fetchSignatures = async () => {
    try {
      const data = await getCongresoSignaturesApi(accessToken, idCongreso);
      const serverUrl = API_URL;
      setSignatures({
        organizador: data.firma_organizador ? (data.firma_organizador.startsWith('http') ? data.firma_organizador : `${serverUrl}${data.firma_organizador}`) : null,
        secretaria: data.firma_secretaria ? (data.firma_secretaria.startsWith('http') ? data.firma_secretaria : `${serverUrl}${data.firma_secretaria}`) : null
      });
      setIsLocked(data.firmas_bloqueadas);
      if (data.firmas_bloqueadas) {
        onSignaturesChange({
          organizador: data.firma_organizador ? (data.firma_organizador.startsWith('http') ? data.firma_organizador : `${serverUrl}${data.firma_organizador}`) : null,
          secretaria: data.firma_secretaria ? (data.firma_secretaria.startsWith('http') ? data.firma_secretaria : `${serverUrl}${data.firma_secretaria}`) : null
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e, type) => {
    if (isLocked) return;
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await updateCongresoSignaturesApi(accessToken, idCongreso, { [type === 'organizador' ? 'firma_organizador' : 'firma_secretaria']: file });
        const serverUrl = API_URL;
        setSignatures({
          organizador: data.firma_organizador ? (data.firma_organizador.startsWith('http') ? data.firma_organizador : `${serverUrl}${data.firma_organizador}`) : null,
          secretaria: data.firma_secretaria ? (data.firma_secretaria.startsWith('http') ? data.firma_secretaria : `${serverUrl}${data.firma_secretaria}`) : null
        });
      } catch (error) {
        alert("Error al subir firma");
      }
    }
  };

  const toggleLock = async () => {
    const nextLockedState = !isLocked;
    try {
      const data = await updateCongresoSignaturesApi(accessToken, idCongreso, { lock: nextLockedState });
      setIsLocked(data.firmas_bloqueadas);
      
      if (data.firmas_bloqueadas) {
        onSignaturesChange(signatures);
      }
    } catch (error) {
      alert("Error al cambiar estado de bloqueo");
    }
  };

  const areBothSigned = signatures.organizador && signatures.secretaria;

  return (
    <div className={`bg-white p-6 rounded-3xl border transition-all duration-500 ${isLocked ? 'border-green-500 shadow-lg shadow-green-100' : 'border-gray-100 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-6 rounded-full transition-colors ${isLocked ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
          <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Validación Institucional</h3>
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] bg-green-50 px-2 py-1 rounded-full animate-in fade-in zoom-in">
            <HiCheckCircle /> VALIDADO
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-300 ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
        {/* Firma Organizador */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter text-center">Firma Organizador</label>
          <div className={`relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${isLocked ? 'border-transparent' : 'border-gray-200 hover:border-[#005a6a]/30'}`}>
            {signatures.organizador ? (
              <>
                <img src={signatures.organizador} alt="Firma 1" className="h-full w-full object-contain p-2" />
                {!isLocked && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => removeSignature('organizador')} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"><HiTrash /></button>
                  </div>
                )}
              </>
            ) : (
              <label className={`flex flex-col items-center gap-1 ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}>
                <HiCloudUpload className="text-2xl text-gray-300" />
                <span className="text-[9px] font-bold text-gray-400 uppercase">Cargar</span>
                {!isLocked && <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'organizador')} />}
              </label>
            )}
          </div>
        </div>

        {/* Firma Secretaría */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter text-center">Firma Secretaría</label>
          <div className={`relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${isLocked ? 'border-transparent' : 'border-gray-200 hover:border-[#005a6a]/30'}`}>
            {signatures.secretaria ? (
              <>
                <img src={signatures.secretaria} alt="Firma 2" className="h-full w-full object-contain p-2" />
                {!isLocked && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => removeSignature('secretaria')} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"><HiTrash /></button>
                  </div>
                )}
              </>
            ) : (
              <label className={`flex flex-col items-center gap-1 ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}>
                <HiCloudUpload className="text-2xl text-gray-300" />
                <span className="text-[9px] font-bold text-gray-400 uppercase">Cargar</span>
                {!isLocked && <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'secretaria')} />}
              </label>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-3">
        {!isLocked ? (
          <button 
            onClick={toggleLock}
            disabled={!areBothSigned}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95
              ${areBothSigned ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-100' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            <HiLockClosed className="text-lg" /> Confirmar y Bloquear Firmas
          </button>
        ) : (
          <button 
            onClick={toggleLock}
            className="w-full py-3 bg-white border-2 border-gray-100 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-gray-600 transition-all shadow-sm active:scale-95"
          >
            <HiLockOpen className="text-lg" /> Modificar Firmas
          </button>
        )}
        <p className="text-[9px] text-gray-400 italic text-center uppercase font-bold tracking-tighter">
          {!isLocked ? "Sube ambas firmas para habilitar la validación masiva" : "Firmas bloqueadas para garantizar consistencia en el envío"}
        </p>
      </div>
    </div>
  );
}
