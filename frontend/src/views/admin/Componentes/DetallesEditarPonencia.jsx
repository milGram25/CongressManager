import React, { useState } from 'react';
import { FiEdit2, FiCopy, FiCalendar, FiClock, FiUsers, FiMapPin, FiUser, FiAward, FiFileText, FiLink } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

const DetallesEditarPonencia = ({ ponenciaData, initialModificando = false, isFullPage = false }) => {
    const initialData = ponenciaData || {
        nombre_congreso: "",
        nombre_institucion: "",
        sede: "",
        nombre_evento: "", // Título de la ponencia
        nombre_ponente: "",
        coautores: "",
        subarea: "",
        cupos: 0,
        tipo_participacion: "Presencial",
        enlace_videollamada: "",
        resumen: "",
        enlace_documento: "",
        nombre_mesa: "",
        fecha_hora_inicio: "",
        fecha_hora_final: ""
    };

    const [formatData, setFormatData] = useState(initialData);
    const [modificando, setModificando] = useState(initialModificando);

    function handleChange(e) {
        const { id, value } = e.target;
        setFormatData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const inputClasses = `w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!modificando ? 'bg-base-200 cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`;
    const labelClasses = "text-[10px] font-bold text-base-content/40 mb-1 block ml-1 uppercase tracking-widest";
    const sectionTitleClasses = "text-lg font-bold text-primary flex items-center gap-2 mb-6 pb-2 border-b border-base-300 mt-8 first:mt-0";

    const instituciones = [
        {
            id: 1,
            nombre_institucion: "CIENU"
        },
        {
            id: 2,
            nombre_institucion: "RIDMAE"
        }
    ];

    const congresos = [
        {
            id: 1,
            nombre_congreso: "CIENU 2026",
            ruta_imagen: "ruta 1"
        },
        {
            id: 2,
            nombre_congreso: "RIDMAE 2026",
            ruta_imagen: "ruta 1"
        }
    ];
    const mesas = [
        {
            id: 1,
            nombre_mesa: "Mesa A",

        },
        {
            id: 2,
            nombre_mesa: "Mesa B"
        }
    ];

    const sedes = [

        "CUALTOS"

    ];

    const subareas = [
        {
            id: 1,
            subarea: "Matemáticas"
        },
        {
            id: 2,
            subarea: "Programación"
        },
        {
            id: 3,
            subarea: "IA"
        }
    ];
    return (
        <div className={`w-full bg-base-100 ${isFullPage ? '' : 'rounded-3xl shadow-2xl'} overflow-hidden font-sans`}>
            {/* Header del Modal (Si no es página completa) */}
            {!isFullPage && (
                <div className='sticky top-0 bg-primary text-primary-content flex items-center justify-between px-6 py-4 z-40 shadow-lg'>
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4 uppercase tracking-wider">Detalles de la Ponencia</h2>
                    <div className='flex items-center gap-2'>
                        {!modificando ? (
                            <button
                                className="w-10 h-10 rounded-full bg-primary-content text-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer shadow-md"
                                onClick={() => setModificando(true)}
                            >
                                <FiEdit2 size={18} />
                            </button>
                        ) : (
                            <div className='flex bg-base-100 rounded-full p-1 gap-1 shadow-inner'>
                                <button className="w-8 h-8 rounded-full bg-success text-success-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" onClick={() => setModificando(false)}>
                                    <IoIosCheckmark size={24} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-error text-error-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" onClick={() => setModificando(false)}>
                                    <RxCross2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`p-6 md:p-10 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>

                {/* Sección Congreso */}
                <section className='mb-8'>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Información del Congreso
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Nombre del congreso</label>
                                <select
                                    id="nombre_congreso"
                                    value={formatData.nombre_congreso}
                                    className={inputClasses}
                                    onChange={handleChange}
                                    disabled={!modificando}
                                >
                                    {
                                        congresos.map((item) => (
                                            <option value={item.nombre_congreso}>{item.nombre_congreso}</option>
                                        ))
                                    }

                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Institución</label>
                                <select
                                    id="nombre_institucion"
                                    value={formatData.nombre_institucion}
                                    className={inputClasses}
                                    onChange={handleChange}
                                    disabled={!modificando}
                                >
                                    {
                                        instituciones.map((item) => (
                                            <option value={item.nombre_institucion}>{item.nombre_institucion}</option>
                                        ))
                                    }

                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Sede</label>
                                <input
                                    id="sede"
                                    type="text"
                                    placeholder="Lugar del evento..."
                                    className={inputClasses}
                                    value={sedes}//value={formatData.sede} 
                                    //onChange={handleChange} 
                                    readOnly={!modificando}//Solo debe mostrar los datos del congreso seleccionado
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6 group hover:border-primary/30 transition-all">
                            <FiAward size={48} className="text-base-content/20" />
                            <button className='w-full bg-primary text-primary-content rounded-xl py-3 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20'>
                                Cambiar Congreso
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección Ponencia */}
                <section className='mb-8'>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Detalles de la Ponencia
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Título de la ponencia</label>
                            <input id="nombre_evento" type="text" className={`${inputClasses} font-bold text-base`} value={formatData.nombre_evento} onChange={handleChange} readOnly={!modificando} />
                        </div>

                        <div>
                            <label className={labelClasses}>Ponente Principal</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiUser /></span>
                                <input id="nombre_ponente" type="text" className={`${inputClasses} pl-11`} value={formatData.nombre_ponente} onChange={handleChange} readOnly={!modificando} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Subárea</label>
                            <select
                                id="subarea"
                                value={formatData.subarea}
                                className={inputClasses}
                                onChange={handleChange}
                                disabled={!modificando}
                            >
                                {
                                    subareas.map((item) => (
                                        <option value={item.subarea}>{item.subarea}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Co-autores (Separados por coma)</label>
                            <input id="coautores" type="text" placeholder="Ej: Dr. García, Mtra. López..." className={inputClasses} value={formatData.coautores} onChange={handleChange} readOnly={!modificando} />
                        </div>

                        <div>
                            <label className={labelClasses}>Tipo de Participación</label>
                            <select id="tipo_participacion" value={formatData.tipo_participacion} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClasses}>Cupos</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiUsers /></span>
                                <input id="cupos" type="number" min="0" className={`${inputClasses} pl-11 font-mono`} value={formatData.cupos} onChange={handleChange} readOnly={!modificando} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Resumen / Abstract</label>
                            <textarea id="resumen" className={`${inputClasses} min-h-[120px] py-3 resize-none`} value={formatData.resumen} onChange={handleChange} readOnly={!modificando} placeholder="Escribe aquí el resumen de la ponencia..."></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Enlace al documento completo (Opcional)</label>
                            <div className='flex'>
                                <span className="flex items-center justify-center bg-base-300 px-4 rounded-l-xl border border-r-0 border-base-300 text-base-content/40"><FiLink /></span>
                                <input id="enlace_documento" type="text" className={`${inputClasses} rounded-l-none`} value={formatData.enlace_documento} onChange={handleChange} readOnly={!modificando} placeholder="https://drive.google.com/..." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Ubicación y Horarios */}
                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Programación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Mesa Asignada</label>
                            <div className="flex items-center justify-center">
                                <span className="mr-4 text-gray-500"><FiMapPin /></span>
                                <select
                                    id="nombre_mesa"
                                    value={formatData.nombre_mesa}
                                    className={inputClasses + "ml-4"}
                                    onChange={handleChange}
                                    disabled={!modificando}
                                >
                                    {
                                        mesas.map((item) => (
                                            <option value={item.nombre_mesa}>{item.nombre_mesa}</option>
                                        ))
                                    }

                                </select>
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiCalendar className="text-success" size={14} />
                                <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Inicio</label>
                            </div>
                            <input type="datetime-local" id="fecha_hora_inicio" className={`${inputClasses} font-mono`} value={formatData.fecha_hora_inicio} onChange={handleChange} readOnly={!modificando} />
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiClock className="text-error" size={14} />
                                <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Fin</label>
                            </div>
                            <input type="datetime-local" id="fecha_hora_final" className={`${inputClasses} font-mono`} value={formatData.fecha_hora_final} onChange={handleChange} readOnly={!modificando} />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DetallesEditarPonencia;