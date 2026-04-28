import React from 'react';
import logoCienu from "../../../assets/CIENU.jpg";
import logoRidmae from "../../../assets/ridmae.jpg";

export default function CertificateTemplate({ user, congressName = "CIENU 2026", sede = null, signatures = {} }) {
  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="w-full aspect-[1.414/1] bg-white relative overflow-hidden flex flex-col select-none"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* ── Banda superior ── */}
      <div className="h-2.5 shrink-0 bg-gradient-to-r from-[#003d4a] via-[#c9a84c] to-[#003d4a]" />

      {/* ── Marca de agua central ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[52%] aspect-square rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,90,106,0.045) 0%, transparent 68%)' }}
        />
      </div>

      {/* ── Ornamentos de esquina ── */}
      {[
        'top-5 left-5 border-t-2 border-l-2',
        'top-5 right-5 border-t-2 border-r-2',
        'bottom-5 left-5 border-b-2 border-l-2',
        'bottom-5 right-5 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-14 h-14 pointer-events-none border-[#005a6a]/25 ${cls}`} />
      ))}
      {[
        'top-8 left-8 border-t border-l',
        'top-8 right-8 border-t border-r',
        'bottom-8 left-8 border-b border-l',
        'bottom-8 right-8 border-b border-r',
      ].map((cls, i) => (
        <div key={`g${i}`} className={`absolute w-8 h-8 pointer-events-none border-[#c9a84c]/60 ${cls}`} />
      ))}

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col px-20 pt-7 pb-5 z-10">

        {/* Header — logos en los extremos, título absolutamente centrado */}
        <div className="relative flex items-center justify-between mb-5">
          <img src={logoCienu} alt="CIENU" className="h-14 object-contain z-10" />

          {/* Título centrado en el ancho completo, independiente de los logos */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center text-center">
              <p style={{ fontFamily: 'sans-serif', letterSpacing: '0.45em', fontSize: '9px' }}
                 className="uppercase text-[#005a6a]/50 font-semibold mb-1">
                Congreso Internacional
              </p>
              <h1
                className="text-[22px] font-bold text-[#003d4a] uppercase"
                style={{ letterSpacing: '0.22em' }}
              >
                Constancia
              </h1>
              <div className="flex items-center gap-2.5 justify-center mt-1.5" style={{ minWidth: '200px' }}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c9a84c]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                <div className="w-1 h-1 rotate-45 bg-[#c9a84c]/40 mx-[-4px]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c9a84c]" />
              </div>
              <p style={{ fontFamily: 'sans-serif', letterSpacing: '0.38em', fontSize: '8.5px' }}
                 className="uppercase text-gray-400 font-medium mt-1.5">
                De Participación
              </p>
            </div>
          </div>

          <img src={logoRidmae} alt="RIDMAE" className="h-14 object-contain z-10" />
        </div>

        {/* Separador tenue */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#005a6a]/15 to-transparent mb-7" />

        {/* Cuerpo del certificado */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">

          <p className="text-[15px] text-gray-500 italic leading-relaxed">
            La presente constancia certifica que
          </p>

          {/* Nombre */}
          <div className="flex flex-col items-center gap-2.5">
            <h2
              className="font-bold text-[#003d4a] leading-tight px-4"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
            >
              {user?.nombre || "Nombre del Participante"}
            </h2>
            {/* Línea dorada */}
            <div className="flex items-center gap-2">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#c9a84c]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#c9a84c]" />
            </div>
          </div>

          {/* Texto de participación */}
          <p className="text-[14px] text-gray-600 max-w-[600px] leading-loose">
            ha participado en calidad de{' '}
            <span
              className="font-bold text-[#005a6a] uppercase"
              style={{ fontFamily: 'sans-serif', letterSpacing: '0.08em', fontSize: '13px' }}
            >
              {user?.rol || "Participante"}
            </span>
            {' '}en el{' '}
            <em className="font-semibold text-gray-800 not-italic">{congressName}</em>,
            {' '}celebrado en las instalaciones de{' '}
            <strong className="text-gray-800 font-semibold">{sede || "Sede del Congreso"}</strong>.
          </p>
        </div>

        {/* Separador tenue */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#005a6a]/15 to-transparent mt-5 mb-5" />

        {/* Pie: firmas */}
        <div className="flex items-end justify-between">

          {/* Firma organizador */}
          <div className="flex flex-col items-center gap-1 w-48">
            <div className="h-14 w-full flex items-end justify-center pb-1">
              {signatures.organizador
                ? <img src={signatures.organizador} alt="Firma Organizador" className="max-h-full max-w-full object-contain" />
                : <div className="w-36 border-b border-gray-300 border-dashed" />
              }
            </div>
            <div className="w-40 h-px bg-[#005a6a]/20" />
            <p style={{ fontFamily: 'sans-serif', letterSpacing: '0.18em', fontSize: '9px' }}
               className="uppercase font-bold text-[#005a6a] mt-0.5">
              Comité Organizador
            </p>
            <p style={{ fontFamily: 'sans-serif', fontSize: '8px', letterSpacing: '0.12em' }}
               className="uppercase text-gray-400">
              Firma y Sello
            </p>
          </div>

          {/* Centro: fecha + ID */}
          <div className="flex flex-col items-center gap-1 pb-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#c9a84c]/60" />
              <div className="w-1 h-1 rotate-45 bg-[#c9a84c]/80" />
              <div className="h-px w-6 bg-[#c9a84c]/60" />
            </div>
            <p className="text-[11px] text-gray-500 italic">Expedido el {date}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '9px' }}
               className="text-gray-400 tracking-tight mt-0.5">
              ID: {user?.id || "000000"}
            </p>
          </div>

          {/* Firma secretaría */}
          <div className="flex flex-col items-center gap-1 w-48">
            <div className="h-14 w-full flex items-end justify-center pb-1">
              {signatures.secretaria
                ? <img src={signatures.secretaria} alt="Firma Secretaría" className="max-h-full max-w-full object-contain" />
                : <div className="w-36 border-b border-gray-300 border-dashed" />
              }
            </div>
            <div className="w-40 h-px bg-[#005a6a]/20" />
            <p style={{ fontFamily: 'sans-serif', letterSpacing: '0.18em', fontSize: '9px' }}
               className="uppercase font-bold text-[#005a6a] mt-0.5">
              Secretaría Técnica
            </p>
            <p style={{ fontFamily: 'sans-serif', fontSize: '8px', letterSpacing: '0.12em' }}
               className="uppercase text-gray-400">
              Firma y Sello
            </p>
          </div>
        </div>
      </div>

      {/* ── Banda inferior ── */}
      <div className="h-2.5 shrink-0 bg-gradient-to-r from-[#003d4a] via-[#c9a84c] to-[#003d4a]" />
    </div>
  );
}
