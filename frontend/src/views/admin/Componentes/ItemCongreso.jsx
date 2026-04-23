import React from 'react';
import { FiBookOpen, FiFileText, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

const ItemCongreso = ({ listaDatos }) => {

    const fecha_inicio = listaDatos.fecha_hora_inicio.split("T")[0];
    const hora_inicio = listaDatos.fecha_hora_inicio.split("T")[1];

    const fecha_fin = listaDatos.fecha_hora_final.split("T")[0];
    const hora_fin = listaDatos.fecha_hora_final.split("T")[1];

    const Row = ({ icon: Icon, label, value }) => (
        <div className="flex items-center justify-between gap-6 mb-3">
            <div className="flex items-center gap-3 text-base-content/60 min-w-[120px]">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-md">
                    <Icon size={18} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
            </div>
            <div className="bg-base-200/50 border border-base-300 rounded-xl px-4 py-2 text-sm font-bold text-base-content text-right flex-1 break-words leading-tight">
                {value}
            </div>
        </div>
    );

    const DateTimeBox = ({ label, date, time }) => (
        <div className="mt-2 group">
            <span className="text-[9px] font-black text-base-content/30 uppercase tracking-[0.2em] ml-1">{label}</span>
            <div className="flex gap-2 mt-1">
                <div className="flex-1 flex bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm group-hover:border-primary/30 transition-colors">
                    <div className="bg-black text-white px-2 flex items-center justify-center"><FiCalendar size={12} /></div>
                    <div className="flex-1 py-1.5 text-center text-[13px] font-mono font-bold">{date}</div>
                </div>
                <div className="w-20 flex bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm group-hover:border-primary/30 transition-colors h-10">
                    <div className="bg-black text-white px-2 flex items-center justify-center"><FiClock size={12} /></div>
                    <div className="flex-1 py-1.5 text-center text-[13px] font-mono font-bold ">{time}</div>
                </div>
            </div>
        </div>
    );

    return (
        <TarjetaGenerica
            titulo={listaDatos.nombre_congreso}

            indexDatosModal={listaDatos.id}
            definirTipoElemento="congreso"
        >
            <Row icon={FiBookOpen} label="Sede" value={listaDatos.sede} />
            <Row icon={FiFileText} label="Eventos" value={listaDatos.cantidad_eventos} />
            <Row icon={FiUser} label="Institución" value={listaDatos.nombre_institucion} />

            <div className="mt-4 space-y-3">
                <DateTimeBox label="Inicio" date={fecha_inicio} time={hora_inicio} />
                <DateTimeBox label="Fin" date={fecha_fin} time={hora_fin} />
            </div>
        </TarjetaGenerica>
    );
};

export default ItemCongreso;