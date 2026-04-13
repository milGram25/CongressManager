import React from 'react';
import { MdVerified } from "react-icons/md";
import logoCienu from "../../../assets/CIENU.jpg";
import logoRidmae from "../../../assets/ridmae.jpg";

export default function CertificateTemplate({ user, congressName = "CIENU 2026", signatures = {} }) {
  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full aspect-[1.414/1] bg-white p-12 border-[16px] border-double border-[#005a6a] relative overflow-hidden shadow-2xl flex flex-col items-center text-center justify-between text-gray-800">
      {/* Marcas de agua de fondo */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <MdVerified className="text-[40rem]" />
      </div>

      {/* Header con Logos */}
      <div className="w-full flex justify-between items-center z-10">
        <img src={logoCienu} alt="Logo CIENU" className="h-20 object-contain" />
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-[#005a6a] tracking-tighter">CONGRESO INTERNACIONAL</h2>
          <p className="text-[12px] font-bold text-gray-400 tracking-[0.3em] uppercase">Excelencia Académica</p>
        </div>
        <img src={logoRidmae} alt="Logo RIDMAE" className="h-20 object-contain" />
      </div>

      {/* Cuerpo del Certificado */}
      <div className="z-10 flex flex-col gap-6 py-8">
        <h1 className="text-5xl font-serif italic text-gray-700">Otorga la presente</h1>
        <div className="flex flex-col gap-2">
          <span className="text-6xl font-black text-[#005a6a] uppercase tracking-tight break-words px-4 leading-tight">
            {user?.nombre || "Nombre del Participante"}
          </span>
          <div className="h-1.5 w-1/3 bg-yellow-400 mx-auto mt-2 rounded-full"></div>
        </div>
        
        <p className="text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600">
          Por su valiosa participación en calidad de <strong className="text-[#005a6a] uppercase font-black">{user?.rol || "Participante"}</strong> 
          en el marco del <strong className="italic text-gray-800">{congressName}</strong>, celebrado en las instalaciones de la 
          <span className="font-bold block text-gray-800 mt-1">{user?.institucion || "Institución Educativa"}</span>.
        </p>
      </div>

      {/* Footer y Firmas Dinámicas */}
      <div className="w-full flex justify-around items-end pb-6 z-10">
        {/* Firma 1 */}
        <div className="flex flex-col items-center min-w-[200px] group">
          <div className="h-24 w-48 flex items-center justify-center relative mb-2">
            {signatures.organizador ? (
              <img src={signatures.organizador} alt="Firma Organizador" className="max-h-full max-w-full object-contain animate-in fade-in zoom-in duration-700" />
            ) : (
              <div className="w-full border-b border-gray-200 border-dashed mb-4"></div>
            )}
          </div>
          <p className="text-[11px] font-black text-[#005a6a] uppercase tracking-widest leading-none">Comité Organizador</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Firma y Sello</p>
        </div>
        
        {/* Centro: Validación */}
        <div className="flex flex-col items-center px-8">
          <div className="mb-2 relative">
             <MdVerified className="text-5xl text-[#005a6a]/10 absolute -top-2 -left-2 animate-pulse" />
             <MdVerified className="text-5xl text-[#005a6a]/20" />
          </div>
          <p className="text-[9px] text-gray-400 font-mono font-bold tracking-tighter">ID: {user?.id || "000000"}</p>
          <p className="text-[10px] font-black text-gray-500 italic mt-1 leading-none">Expedido el {date}</p>
        </div>

        {/* Firma 2 */}
        <div className="flex flex-col items-center min-w-[200px] group">
          <div className="h-24 w-48 flex items-center justify-center relative mb-2">
            {signatures.secretaria ? (
              <img src={signatures.secretaria} alt="Firma Secretaría" className="max-h-full max-w-full object-contain animate-in fade-in zoom-in duration-700" />
            ) : (
              <div className="w-full border-b border-gray-200 border-dashed mb-4"></div>
            )}
          </div>
          <p className="text-[11px] font-black text-[#005a6a] uppercase tracking-widest leading-none">Secretaría Técnica</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Firma y Sello</p>
        </div>
      </div>
    </div>
  );
}
