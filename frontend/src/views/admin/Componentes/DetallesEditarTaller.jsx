import React, { useState } from 'react';
import { FiEdit2, FiCopy, FiCalendar, FiClock, FiUsers, FiMapPin, FiUser } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

const DetallesEditarTaller = ({ tallerData, initialModificando = false, isFullPage = false }) => {
    // We use the data passed from the parent or a fallback for testing
    const initialData = tallerData || {
        id: 1,
        nombre_evento: "Taller de Ejemplo",
        nombre_congreso: "CIENU 2026",
        nombre_institucion: "CUALTOS",
        sede: "Sede Central",
        nombre_tallerista: "Dr. Juan Pérez",
        subarea: "Tecnología Educativa",
        cupos_maximos_taller: 25,
        nombre_taller: "Inteligencia Artificial en el Aula",
        tipo_participacion: "Híbrido",
        enlace_videollamada: "https://meet.google.com/abc-defg-hij",
        nombre_mesa: "Mesa A",
        cupos_mesa: 15,
        fecha_hora_inicio: "2026-04-12T11:00",
        fecha_hora_final: "2026-04-12T14:00"
    };

    const [formatData, setFormatData] = useState(initialData);
    const [modificando, setModificando] = useState(initialModificando);

    const instituciones = [
        {
            id:1,
            nombre_institucion: "CIENU"
        },
         {
            id:2,
            nombre_institucion: "RIDMAE"
        }
    ];

    const congresos = [
        {
            id:1,
            nombre_congreso: "CIENU 2026",
            ruta_imagen: "ruta 1"
        },
         {
            id:2,
            nombre_congreso: "RIDMAE 2026",
            ruta_imagen: "ruta 1"
        }
    ];
    const mesas = [
        {
            id:1,
            nombre_mesa: "Mesa A",
            
        },
         {
            id:2,
            nombre_mesa: "Mesa B"
        }
    ];

    const sedes = [
        
            "CUALTOS"
        
    ];

    const subareas = [
        {
            id:1,
            subarea:"Matemáticas"
        },
        {
            id:2,
            subarea:"Programación"
        },
        {
            id:3,
            subarea:"IA"
        }
    ];

    //Es necesario realizar una búsqueda de los datos una vez que se haya seleccionado la institución y congreso

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
    const selectClasses = `w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!modificando ? 'bg-base-200 cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`;

    return (
        <div className={`w-full bg-base-100 ${isFullPage ? '' : 'rounded-3xl shadow-2xl'} overflow-hidden font-sans`}>
            {/* Header del Modal/Vista */}
            {!isFullPage && (
                <div className='sticky top-0 bg-primary text-primary-content flex items-center justify-between px-6 py-4 z-40 shadow-lg'>
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4 uppercase tracking-wider">Detalles del Taller</h2>
                    <div className='flex items-center gap-2'>
                        {!modificando ? (
                            <button 
                                className="w-10 h-10 rounded-full bg-primary-content text-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer shadow-md" 
                                onClick={() => setModificando(true)}
                                title="Editar"
                            >
                                <FiEdit2 size={18} />
                            </button>
                        ) : (
                            <div className='flex bg-base-100 rounded-full p-1 gap-1 shadow-inner'>
                                <button 
                                    className="w-8 h-8 rounded-full bg-success text-success-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" 
                                    onClick={() => setModificando(false)}
                                    title="Guardar"
                                >
                                    <IoIosCheckmark size={24} />
                                </button>
                                <button 
                                    className="w-8 h-8 rounded-full bg-error text-error-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" 
                                    onClick={() => setModificando(false)}
                                    title="Cancelar"
                                >
                                    <RxCross2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Body del Modal/Vista */}
            <div className={`p-6 md:p-10 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
                
                {/* Sección Detalles Base */}
                <section>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Información del Congreso
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
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
                                        instituciones.map((item)=>(
                                            <option value={item.nombre_institucion}>{item.nombre_institucion}</option>
                                        ))
                                    }

                                </select>
                                
                            </div>
                            <div>
                                <label className={labelClasses}>Congreso</label>
                               
                                <select 
                                    id="nombre_congreso" 
                                    value={formatData.nombre_congreso}  
                                    className={inputClasses}
                                    onChange={handleChange} 
                                    disabled={!modificando}
                                    >
                                    {
                                        congresos.map((item)=>(
                                            <option value={item.nombre_congreso}>{item.nombre_congreso}</option>
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
                                    value={formatData.sede} 
                                    readOnly={true}//Solo debe mostrar los datos del congreso seleccionado
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6 group transition-all hover:border-primary/30 hover:bg-base-200/50">
                            <div className="w-full aspect-video bg-base-300 rounded-2xl flex items-center justify-center text-base-content/20 text-xs font-bold uppercase tracking-widest shadow-inner overflow-hidden">
                                <div className="text-center p-4">
                                    <FiMapPin size={32} className="mx-auto mb-2 opacity-20" />
                                    [ Imagen de la institución ]
                                    {/*Aquí insertar la imagen de la institución, que está en congresos.ruta_imagen*/}
                                </div>
                            </div>
                            <button className='w-full bg-primary text-primary-content rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20'>
                                Ver detalles del congreso
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección Detalles del Taller */}
                <section>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Detalles del Taller
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Nombre del tallerista</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiUser /></span>
                                <input 
                                    id="nombre_tallerista" 
                                    type="text" 
                                    placeholder="Nombre completo del instructor..."
                                    className={`${inputClasses} pl-11`} 
                                    value={formatData.nombre_tallerista} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className={labelClasses}>Nombre del taller</label>
                            <input 
                                id="nombre_taller" 
                                type="text" 
                                placeholder="Título del taller..."
                                className={inputClasses} 
                                value={formatData.nombre_taller} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
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
                                subareas.map((item)=>(
                                    <option value={item.subarea}>{item.subarea}</option>
                                ))
                            }
                            </select>
                        </div>

                        <div>
                            <label className={labelClasses}>Tipo de taller</label>
                            <select 
                                id="tipo_participacion" 
                                value={formatData.tipo_participacion}  
                                className={inputClasses}
                                onChange={handleChange} 
                                disabled={!modificando}
                            >
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClasses}>Cupos máximos</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiUsers /></span>
                                {/*El máximo son los cupos que hay en la mesa */}
                                <input 
                                    id="cupos_maximos_taller" 
                                    type="number" 
                                    placeholder="25"
                                    min="0" 
                                    className={`${inputClasses} pl-11 font-mono`} 
                                    value={formatData.cupos_maximos_taller} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Enlace a videollamada</label>
                            <div className='flex group'>
                                <input 
                                    id="enlace_videollamada" 
                                    className={`${inputClasses} rounded-r-none border-r-0`} 
                                    type="text" 
                                    placeholder="https://..."
                                    value={formatData.enlace_videollamada} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                                <button className='flex items-center justify-center w-12 bg-primary hover:brightness-110 text-primary-content rounded-r-xl transition-all active:scale-95'>
                                    <FiCopy />
                                </button>
                            </div>
                        </div>

                        <div className='md:col-span-2 flex justify-center pt-4'>
                            <button className='bg-primary text-primary-content px-10 py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20'>
                                Ver multimedia
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección Mesa */}
                <section className='mb-8'>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Ubicación Física (Mesa)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClasses}>Nombre de la mesa</label>
                            
                            <select 
                                id="nombre_mesa" 
                                value={formatData.nombre_mesa}  
                                className={inputClasses}
                                onChange={handleChange} 
                                disabled={!modificando}
                                >
                                {
                                    mesas.map((item)=>(
                                        <option value={item.nombre_mesa}>{item.nombre_mesa}</option>
                                    ))
                                }

                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Cupos de la mesa</label>
                            <input 
                                id="cupos_mesa" 
                                type="number"
                                placeholder="15"
                                className={`${inputClasses} font-mono`} 
                                value={formatData.cupos_mesa} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                                min="0"
                            />
                        </div>
                    </div>
                </section>

                {/* Sección Fechas */}
                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Fechas y Horarios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiCalendar className="text-success" size={14} />
                                <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Inicio del Taller</label>
                            </div>
                            <input 
                                type="datetime-local" 
                                id="fecha_hora_inicio" 
                                className={`${inputClasses} font-mono`} 
                                value={formatData.fecha_hora_inicio} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiClock className="text-error" size={14} />
                                <label className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Fin del Taller</label>
                            </div>
                            <input 
                                type="datetime-local" 
                                id="fecha_hora_final" 
                                className={`${inputClasses} font-mono`} 
                                value={formatData.fecha_hora_final} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DetallesEditarTaller;
