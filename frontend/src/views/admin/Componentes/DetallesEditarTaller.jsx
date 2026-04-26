import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiEdit2, FiCopy, FiCalendar, FiClock, FiUsers, FiMapPin, FiUser, FiSave } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { getInstitucionesApi, getCongresosApi, getSubareasApi, getMesasApi, createTallerApi, getTallerByIdApi } from '../../../api/adminApi';
import { useNavigate } from 'react-router-dom';

const DetallesEditarTaller = forwardRef(({ tallerData, initialModificando = false, isFullPage = false }, ref) => {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('congress_access');
    
    // We use the data passed from the parent or a fallback for testing
    const initialData = {
        nombre_evento: "",
        id_congreso: "",
        id_institucion: "",
        id_sede: "",
        tallerista: "",
        id_subarea: "",
        cupos: 0,
        tipo_participacion: "Presencial",
        enlace: "",
        id_mesas_trabajo: "",
        fecha_hora_inicio: "",
        fecha_hora_final: "",
        sinopsis: ""
    };

    const [formatData, setFormatData] = useState(initialData);
    const [modificando, setModificando] = useState(initialModificando);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!tallerData?.id);

    const [instituciones, setInstituciones] = useState([]);
    const [congresos, setCongresos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [subareas, setSubareas] = useState([]);

    useImperativeHandle(ref, () => ({
        handleSave
    }));

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [instData, congData, subData] = await Promise.all([
                    getInstitucionesApi(accessToken),
                    getCongresosApi(accessToken),
                    getSubareasApi(accessToken)
                ]);
                setInstituciones(instData);
                setCongresos(congData);
                setSubareas(subData);

                // Si hay un ID, cargar los datos específicos del taller
                if (tallerData?.id) {
                    const realTaller = await getTallerByIdApi(accessToken, tallerData.id);

                    const formatDate = (dateStr) => {
                        if (!dateStr) return "";
                        return dateStr.substring(0, 16);
                    };

                    setFormatData({
                        ...realTaller,
                        id_congreso: realTaller.id_congreso || realTaller.id_evento?.id_congreso || "",
                        id_mesas_trabajo: realTaller.id_mesas_trabajo || realTaller.id_evento?.id_mesas_trabajo || "",
                        id_subarea: realTaller.id_subarea || "",
                        fecha_hora_inicio: formatDate(realTaller.fecha_hora_inicio),
                        fecha_hora_final: formatDate(realTaller.fecha_hora_final)
                    });
                }
 else if (tallerData?.id_congreso) {
                    // Si no hay ID pero si id_congreso (caso crear desde congreso)
                    setFormatData(prev => ({ ...prev, id_congreso: parseInt(tallerData.id_congreso) }));
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [tallerData?.id, accessToken]);

    // Determinar si el congreso debe estar bloqueado
    const congressLocked = (!!tallerData?.id || !!tallerData?.id_congreso) && isFullPage;

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Cargando información...</p>
        </div>
    );

    function handleChange(e) {
        const { id, value } = e.target;
        setFormatData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const handleSave = async () => {
        if (!formatData.nombre_evento || !formatData.id_congreso) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        setSaving(true);
        try {
            await createTallerApi(accessToken, formatData);
            alert("Taller creado con éxito");
            if (isFullPage) navigate('/admin/eventos/congresos/lista');
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const inputClasses = `w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!modificando ? 'bg-base-200 cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`;
    const labelClasses = "text-[10px] font-bold text-base-content/40 mb-1 block ml-1 uppercase tracking-widest";
    const sectionTitleClasses = "text-lg font-bold text-primary flex items-center gap-2 mb-6 pb-2 border-b border-base-300 mt-8 first:mt-0";

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
                                    onClick={handleSave}
                                    disabled={saving}
                                    title="Guardar"
                                >
                                    {saving ? <span className="loading loading-spinner loading-xs"></span> : <IoIosCheckmark size={24} />}
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
                                <label className={labelClasses}>Congreso</label>
                                {congressLocked ? (
                                    <input 
                                        type="text" 
                                        className={inputClasses} 
                                        value={congresos.find(c => c.id_congreso === formatData.id_congreso)?.nombre_congreso || "Cargando..."} 
                                        readOnly 
                                    />
                                ) : (
                                    <select 
                                        id="id_congreso" 
                                        value={formatData.id_congreso}  
                                        className={inputClasses}
                                        onChange={handleChange} 
                                        disabled={!modificando}
                                        >
                                        <option value="">Selecciona un congreso</option>
                                        {
                                            congresos.map((item)=>(
                                                <option key={item.id_congreso} value={item.id_congreso}>{item.nombre_congreso}</option>
                                            ))
                                        }
                                    </select>
                                )}
                            </div>
                            
                            <div>
                                <label className={labelClasses}>Nombre del Taller (Evento)</label>
                                <input 
                                    id="nombre_evento" 
                                    type="text" 
                                    placeholder="Nombre público del taller..."
                                    className={inputClasses} 
                                    value={formatData.nombre_evento} 
                                    onChange={handleChange}
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6 group transition-all hover:border-primary/30 hover:bg-base-200/50">
                            <div className="w-full aspect-video bg-base-300 rounded-2xl flex items-center justify-center text-base-content/20 text-xs font-bold uppercase tracking-widest shadow-inner overflow-hidden">
                                <div className="text-center p-4">
                                    <FiMapPin size={32} className="mx-auto mb-2 opacity-20" />
                                    Vista Previa
                                </div>
                            </div>
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
                                    id="tallerista" 
                                    type="text" 
                                    placeholder="Nombre completo del instructor..."
                                    className={`${inputClasses} pl-11`} 
                                    value={formatData.tallerista} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className={labelClasses}>Subárea Académica</label>
                            <select 
                                id="id_subarea" 
                                value={formatData.id_subarea}  
                                className={inputClasses}
                                onChange={handleChange} 
                                disabled={!modificando}
                            >
                                <option value="">Selecciona subárea</option>
                                {
                                    subareas.map((item)=>(
                                        <option key={item.id_subareas} value={item.id_subareas}>{item.nombre}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label className={labelClasses}>Tipo de participación</label>
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
                            <label className={labelClasses}>Cupos disponibles</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiUsers /></span>
                                <input 
                                    id="cupos" 
                                    type="number" 
                                    placeholder="25"
                                    min="0" 
                                    className={`${inputClasses} pl-11 font-mono`} 
                                    value={formatData.cupos} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Enlace / URL (si es virtual)</label>
                            <div className='flex group'>
                                <input 
                                    id="enlace" 
                                    className={`${inputClasses} rounded-r-none border-r-0`} 
                                    type="text" 
                                    placeholder="https://..."
                                    value={formatData.enlace} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                                <button className='flex items-center justify-center w-12 bg-primary hover:brightness-110 text-primary-content rounded-r-xl transition-all active:scale-95'>
                                    <FiCopy />
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Sinopsis / Descripción</label>
                            <textarea 
                                id="sinopsis" 
                                className={`${inputClasses} h-24 py-3`} 
                                placeholder="Breve descripción del contenido del taller..."
                                value={formatData.sinopsis} 
                                onChange={handleChange}
                                readOnly={!modificando}
                            ></textarea>
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
                            <label className={labelClasses}>Asignar Mesa de Trabajo</label>
                            <select 
                                id="id_mesas_trabajo" 
                                value={formatData.id_mesas_trabajo}  
                                className={inputClasses}
                                onChange={handleChange} 
                                disabled={!modificando}
                                >
                                <option value="">Sin mesa asignada</option>
                                {
                                    mesas.map((item)=>(
                                        <option key={item.id_mesas_trabajo} value={item.id_mesas_trabajo}>{item.nombre}</option>
                                    ))
                                }
                            </select>
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

                {isFullPage && modificando && (
                    <div className='flex justify-center mt-12'>
                         <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-12 py-4 rounded-2xl bg-black text-white font-black shadow-xl hover:bg-[#005a6a] transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <span className="loading loading-spinner"></span> : <FiSave size={20} />}
                            Guardar Taller
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DetallesEditarTaller;
