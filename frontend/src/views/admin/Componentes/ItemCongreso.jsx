import React from 'react';
import { FiBookOpen, FiFileText, FiUser, FiCalendar, FiClock, FiSettings, FiChevronDown } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ItemCongreso = ({ listaDatos }) => {
    const navigate = useNavigate();

    const formatParts = (dateStr) => {
        if (!dateStr) return { date: "N/A", time: "N/A" };
        try {
            const dateObj = parseISO(dateStr);
            return {
                date: format(dateObj, "dd/MM/yyyy"),
                time: format(dateObj, "HH:mm")
            };
        } catch (e) {
            return { date: "Error", time: "Error" };
        }
    };

    const inicio = formatParts(listaDatos.congreso_inicio);
    const fin = formatParts(listaDatos.congreso_fin);

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
            indexDatosModal={listaDatos.id_congreso}
            definirTipoElemento="congreso"
        >
            <Row icon={FiBookOpen} label="Sede" value={listaDatos.nombre_sede} />
            <Row icon={FiFileText} label="Eventos" value={listaDatos.cantidad_eventos} />
            <Row icon={FiUser} label="Institución" value={listaDatos.nombre_institucion} />

            <div className="mt-4 space-y-3">
                <DateTimeBox label="Inicio" date={inicio.date} time={inicio.time} />
                <DateTimeBox label="Fin" date={fin.date} time={fin.time} />
            </div>

            <div className="mt-6 pt-4 border-t border-base-300 space-y-3">
                {/* Botón de Eventos con Dropdown */}
                <div className="dropdown dropdown-top w-full">
                    <div 
                        tabIndex={0} 
                        role="button" 
                        className="w-full flex items-center justify-center gap-3 py-3 bg-base-200 text-base-content hover:bg-base-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                        <FiFileText size={16} /> Eventos <FiChevronDown />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-full mb-2 border border-base-300">
                        <li>
                            <button 
                                onClick={() => navigate(`/admin/eventos/talleres?id_congreso=${listaDatos.id_congreso}`)}
                                className="flex items-center gap-2 py-3 font-bold text-xs uppercase"
                            >
                                Talleres
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => navigate(`/admin/eventos/ponencias?id_congreso=${listaDatos.id_congreso}`)}
                                className="flex items-center gap-2 py-3 font-bold text-xs uppercase"
                            >
                                Ponencias
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Acceso a Configuración Académica */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/eventos/congresos/tipos-trabajo/${listaDatos.id_congreso}`);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white hover:bg-[#005a6a] rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
                >
                    <FiSettings size={16} /> Configuración Académica
                </button>
            </div>
        </TarjetaGenerica>
    );
};

export default ItemCongreso;
