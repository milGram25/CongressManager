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

    function handleChange(e) {
        const { id, value } = e.target;
        setFormatData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const inputClasses = `w-full bg-white border border-gray-900 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${!modificando ? 'bg-gray-50' : ''}`;
    const labelClasses = "text-xs font-bold text-gray-500 mb-1 block ml-1";
    const sectionTitleClasses = "text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300 mt-6";

    return (
        <div className={`w-full bg-[#F0EFEF] ${isFullPage ? '' : 'rounded-[24px] shadow-2xl'} overflow-hidden font-sans`}>
            {/* Header del Modal/Vista */}
            {!isFullPage && (
                <div className='sticky top-0 bg-black text-white flex items-center justify-between px-6 py-4 z-40'>
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4">Detalles del Taller</h2>
                    <div className='flex items-center gap-2'>
                        {!modificando ? (
                            <button 
                                className="w-10 h-10 rounded-full bg-black text-white border-2 border-white flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer" 
                                onClick={() => setModificando(true)}
                                title="Editar"
                            >
                                <FiEdit2 size={18} />
                            </button>
                        ) : (
                            <div className='flex bg-white rounded-full p-1 gap-1'>
                                <button 
                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer" 
                                    onClick={() => setModificando(false)}
                                    title="Guardar"
                                >
                                    <IoIosCheckmark size={24} />
                                </button>
                                <button 
                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer" 
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
            <div className={`p-6 md:p-8 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
                
                {/* Sección Detalles Base */}
                <section>
                    <h3 className={sectionTitleClasses}>Información del Congreso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Nombre del congreso</label>
                                <input 
                                    id="nombre_congreso" 
                                    type="text" 
                                    className={inputClasses} 
                                    value={formatData.nombre_congreso} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Institución</label>
                                <input 
                                    id="nombre_institucion" 
                                    type="text" 
                                    className={inputClasses} 
                                    value={formatData.nombre_institucion} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Sede</label>
                                <input 
                                    id="sede" 
                                    type="text" 
                                    className={inputClasses} 
                                    value={formatData.sede} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-gray-400 rounded-2xl p-6 gap-4">
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                                [ Imagen de la institución ]
                            </div>
                            <button className='w-full bg-black text-white rounded-full py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors'>
                                Ver detalles del congreso
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección Detalles del Taller */}
                <section>
                    <h3 className={sectionTitleClasses}>Detalles del Taller</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Nombre del tallerista</label>
                            <input 
                                id="nombre_tallerista" 
                                type="text" 
                                className={inputClasses} 
                                value={formatData.nombre_tallerista} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                        
                        <div>
                            <label className={labelClasses}>Nombre del taller</label>
                            <input 
                                id="nombre_taller" 
                                type="text" 
                                className={inputClasses} 
                                value={formatData.nombre_taller} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Subárea</label>
                            <input 
                                id="subarea" 
                                type="text" 
                                className={inputClasses} 
                                value={formatData.subarea} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
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
                            <input 
                                id="cupos_maximos_taller" 
                                type="number" 
                                className={inputClasses} 
                                value={formatData.cupos_maximos_taller} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Enlace a videollamada</label>
                            <div className='flex'>
                                <input 
                                    id="enlace_videollamada" 
                                    className="w-full bg-white border border-gray-900 rounded-l-2xl px-4 py-2 text-sm outline-none" 
                                    type="text" 
                                    value={formatData.enlace_videollamada} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                                <button className='flex items-center justify-center w-12 bg-black hover:bg-gray-800 text-white rounded-r-2xl transition-colors'>
                                    <FiCopy />
                                </button>
                            </div>
                        </div>

                        <div className='md:col-span-2 flex justify-center pt-2'>
                            <button className='bg-black text-white px-8 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center gap-2'>
                                Ver multimedia
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección Mesa */}
                <section>
                    <h3 className={sectionTitleClasses}>Mesa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Nombre de la mesa</label>
                            <input 
                                id="nombre_mesa" 
                                className={inputClasses} 
                                value={formatData.nombre_mesa} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Cupos de la mesa</label>
                            <input 
                                id="cupos_mesa" 
                                type="number"
                                className={inputClasses} 
                                value={formatData.cupos_mesa} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                    </div>
                </section>

                {/* Sección Fechas */}
                <section className="mb-8">
                    <h3 className={sectionTitleClasses}>Fechas y Horarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='w-2 h-2 rounded-full bg-teal-600'></div>
                                <label className="text-sm font-bold text-gray-700">Inicio</label>
                            </div>
                            <input 
                                type="datetime-local" 
                                id="fecha_hora_inicio" 
                                className={inputClasses} 
                                value={formatData.fecha_hora_inicio} 
                                onChange={handleChange} 
                                readOnly={!modificando}
                            />
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='w-2 h-2 rounded-full bg-red-600'></div>
                                <label className="text-sm font-bold text-gray-700">Fin</label>
                            </div>
                            <input 
                                type="datetime-local" 
                                id="fecha_hora_final" 
                                className={inputClasses} 
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
