import { MdReceipt, MdAccessTime } from "react-icons/md";

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatMonto = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto ?? 0);

export default function FacturaPendienteList({ facturas, selectedId, onSelect }) {
  return (
    <div className="divide-y divide-gray-50">
      {facturas.map((factura) => (
        <div
          key={factura.id_factura}
          onClick={() => onSelect(factura)}
          className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50
            ${selectedId === factura.id_factura
              ? 'bg-blue-50/50 border-l-4 border-l-[#005a6a]'
              : 'border-l-4 border-l-transparent'}`}
        >
          <div className="w-10 h-10 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MdReceipt className="text-orange-400 text-xl" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 truncate">{factura.nombre_completo}</h4>
            <p className="text-xs text-gray-500 font-mono">RFC: {factura.rfc || '—'}</p>
            <p className="text-xs text-[#005a6a] font-semibold truncate">{factura.nombre_congreso || '—'}</p>
          </div>

          <div className="text-right hidden sm:flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <MdAccessTime />
              {formatFecha(factura.fecha_solicitud)}
            </div>
            <span className="text-sm font-bold text-[#005a6a]">{formatMonto(factura.monto_pagado)}</span>
          </div>

          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">→</div>
          </div>
        </div>
      ))}
    </div>
  );
}
