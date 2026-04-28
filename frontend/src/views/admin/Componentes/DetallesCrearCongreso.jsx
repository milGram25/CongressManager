import { RiPencilFill, RiSave3Line } from "react-icons/ri";
import { useState, useMemo, useEffect } from "react";
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { IoIosCheckmark, IoMdAlert } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FiCalendar, FiClock, FiMapPin, FiCreditCard, FiTag, FiFileText } from "react-icons/fi";
import { getInstitucionesApi, createCongresoApi, updateCongresoApi, getCongresoByIdApi } from "../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <IoMdAlert size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
                    <div className="flex w-full gap-3">
                        <button onClick={onCancel} className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                        <button onClick={onConfirm} className="flex-1 px-6 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-md cursor-pointer">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DetallesCrearCongreso({ indexDatosModal, modificandoDatos = false, initialModificando = false, isFullPage = false }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [instituciones, setInstituciones] = useState([]);
    const [loading, setLoading] = useState(!!indexDatosModal);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('congress_access');

    const emptyFormData = {
        nombre_congreso: "",
        nombre_institucion: "",
        nombre_sede: "",
        pais: "",
        estado: "",
        ciudad: "",
        calle: "",
        numero_exterior: "",
        numero_interior: "",
        modulo_fisico: "",
        congreso_inicio: "",
        congreso_fin: "",
        envio_ponencias_inicio: "",
        envio_ponencias_fin: "",
        inscripcion_dictaminadores_inicio: "",
        inscripcion_dictaminadores_fin: "",
        revision_resumenes_inicio: "",
        revision_resumenes_fin: "",
        envio_extensos_inicio: "",
        envio_extensos_fin: "",
        inscripcion_evaluadores_inicio: "",
        inscripcion_evaluadores_fin: "",
        revision_extensos_inicio: "",
        revision_extensos_fin: "",
        subir_multimedia_inicio: "",
        subir_multimedia_fin: "",
        costo_asistente: "",
        costo_ponente: "",
        costo_miembro_comite: "",
        descuento_prepago: "",
        descuento_estudiante: "",
        cuenta_deposito: ""
    };

    const [formData, setFormData] = useState(emptyFormData);
    const [modificando, setModificando] = useState(initialModificando || modificandoDatos);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [instData] = await Promise.all([getInstitucionesApi(accessToken)]);
                setInstituciones(instData);

                if (indexDatosModal) {
                    const realCongreso = await getCongresoByIdApi(accessToken, indexDatosModal);
                    
                    const formatDate = (dateStr) => {
                        if (!dateStr) return "";
                        return dateStr.split('.')[0].substring(0, 16);
                    };

                    setFormData({
                        nombre_congreso: realCongreso.nombre_congreso || "",
                        nombre_institucion: realCongreso.nombre_institucion || "",
                        nombre_sede: realCongreso.nombre_sede || "",
                        pais: realCongreso.pais || "",
                        estado: realCongreso.estado || "",
                        ciudad: realCongreso.ciudad || "",
                        calle: realCongreso.calle || "",
                        numero_exterior: realCongreso.numero_exterior || "",
                        numero_interior: realCongreso.numero_interior || "",
                        modulo_fisico: realCongreso.modulo_fisico || "",
                        congreso_inicio: formatDate(realCongreso.congreso_inicio),
                        congreso_fin: formatDate(realCongreso.congreso_fin),
                        envio_ponencias_inicio: formatDate(realCongreso.envio_ponencias_inicio),
                        envio_ponencias_fin: formatDate(realCongreso.envio_ponencias_fin),
                        inscripcion_dictaminadores_inicio: formatDate(realCongreso.inscripcion_dictaminadores_inicio),
                        inscripcion_dictaminadores_fin: formatDate(realCongreso.inscripcion_dictaminadores_fin),
                        revision_resumenes_inicio: formatDate(realCongreso.revision_resumenes_inicio),
                        revision_resumenes_fin: formatDate(realCongreso.revision_resumenes_fin),
                        envio_extensos_inicio: formatDate(realCongreso.envio_extensos_inicio),
                        envio_extensos_fin: formatDate(realCongreso.envio_extensos_fin),
                        inscripcion_evaluadores_inicio: formatDate(realCongreso.inscripcion_evaluadores_inicio),
                        inscripcion_evaluadores_fin: formatDate(realCongreso.inscripcion_evaluadores_fin),
                        revision_extensos_inicio: formatDate(realCongreso.revision_extensos_inicio),
                        revision_extensos_fin: formatDate(realCongreso.revision_extensos_fin),
                        subir_multimedia_inicio: formatDate(realCongreso.subir_multimedia_inicio),
                        subir_multimedia_fin: formatDate(realCongreso.subir_multimedia_fin),
                        costo_asistente: realCongreso.costo_asistente || "",
                        costo_ponente: realCongreso.costo_ponente || "",
                        costo_miembro_comite: realCongreso.costo_miembro_comite || "",
                        descuento_prepago: realCongreso.descuento_prepago || "",
                        descuento_estudiante: realCongreso.descuento_estudiante || "",
                        cuenta_deposito: realCongreso.cuenta_deposito || ""
                    });
                }
            } catch (error) {
                console.error("Error cargando congreso:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [indexDatosModal, accessToken]);

    const options = useMemo(() => countryList().getData(), []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <span className="loading loading-spinner loading-lg text-black"></span>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Cargando congreso...</p>
        </div>
    );

    function handleCountryChange(value) {
        setFormData(prev => ({ ...prev, pais: value.label }));
    }

    function handleChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    async function handleConfirmSave() {
        try {
            if (indexDatosModal) {
                await updateCongresoApi(accessToken, indexDatosModal, formData);
                alert("¡Congreso actualizado exitosamente!");
            } else {
                await createCongresoApi(accessToken, formData);
                alert("¡Congreso creado exitosamente!");
            }
            setModificando(false);
            setShowConfirm(false);
            if (isFullPage) navigate('/admin/eventos/congresos/lista');
        } catch (error) {
            alert("Error al guardar: " + error.message);
        }
    }

    const inputClasses = `w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm ${!modificando ? 'bg-gray-50 border-transparent shadow-none cursor-default' : 'hover:border-gray-400 focus:border-black'}`;
    const labelClasses = "text-xs font-bold text-gray-500 mb-2 block ml-1 uppercase tracking-wider";
    const sectionTitleClasses = "text-xl font-bold text-gray-900 mb-6 flex items-center gap-3";
    const sectionContainerClasses = "bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm mb-8 transition-all hover:shadow-md";

    return (
        <div className={`w-full bg-gray-50/50 ${isFullPage ? '' : 'rounded-[32px] shadow-2xl'} overflow-hidden font-sans relative pb-20`}>
            <ConfirmDialog isOpen={showConfirm} onConfirm={handleConfirmSave} onCancel={() => setShowConfirm(false)} title="¿Confirmar cambios?" message="Estás a punto de actualizar la información del congreso." />

            {/* Header */}
            <div className="sticky top-0 bg-black text-white flex items-center justify-between px-8 py-5 z-40 shadow-xl rounded-t-[32px]">
                <div>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight">{modificando ? 'Panel de Edición' : 'Vista de Detalles'}</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{formData.nombre_congreso || 'Nuevo Congreso'}</p>
                </div>
                <div className="flex items-center gap-3">
                    {!modificando ? (
                        <button onClick={() => setModificando(true)} className="w-11 h-11 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer group">
                            <RiPencilFill size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    ) : (
                        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10 gap-1">
                            <button onClick={() => setModificando(false)} className="w-9 h-9 rounded-xl bg-black/40 text-white flex items-center justify-center hover:bg-red-500 transition-all cursor-pointer group"><RxCross2 size={20} /></button>
                            <button onClick={() => setShowConfirm(true)} className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center hover:bg-green-500 hover:text-white transition-all cursor-pointer group"><IoIosCheckmark size={28} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulario */}
            <div className={`p-6 md:p-10 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
                {/* Información General */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}><div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><FiFileText size={20} /></div> Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClasses}>Nombre del congreso</label>
                            <input id="nombre_congreso" value={formData.nombre_congreso} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div>
                            <label className={labelClasses}>Institución</label>
                            <select id="nombre_institucion" value={formData.nombre_institucion} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                <option value="">Selecciona institución</option>
                                {instituciones.map((inst, i) => <option key={i} value={inst.nombre}>{inst.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Ubicación */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}><div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><FiMapPin size={20} /></div> Sede y Ubicación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Nombre de la sede</label>
                            <input id="nombre_sede" value={formData.nombre_sede} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div>
                            <label className={labelClasses}>País</label>
                            {!modificando ? <input value={formData.pais} readOnly className={inputClasses} /> : 
                            <Select options={options} value={options.find(o => o.label === formData.pais)} onChange={handleCountryChange} />}
                        </div>
                        <div>
                            <label className={labelClasses}>Estado</label>
                            <input id="estado" value={formData.estado} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div>
                            <label className={labelClasses}>Ciudad</label>
                            <input id="ciudad" value={formData.ciudad} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div>
                            <label className={labelClasses}>Calle</label>
                            <input id="calle" value={formData.calle} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClasses}>Ext.</label><input id="numero_exterior" value={formData.numero_exterior} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                            <div><label className={labelClasses}>Int.</label><input id="numero_interior" value={formData.numero_interior} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Referencia (Edificio/Módulo)</label>
                            <input id="modulo_fisico" value={formData.modulo_fisico} onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                    </div>
                </section>

                {/* Cronograma */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}><div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><FiCalendar size={20} /></div> Cronograma</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                        {[
                            { label: "Duración del Congreso", s: "congreso_inicio", e: "congreso_fin" },
                            { label: "Envío de Ponencias", s: "envio_ponencias_inicio", e: "envio_ponencias_fin" },
                            { label: "Revisión de Resúmenes", s: "revision_resumenes_inicio", e: "revision_resumenes_fin" },
                            { label: "Carga de Extensos", s: "envio_extensos_inicio", e: "envio_extensos_fin" },
                            { label: "Revisión de Extensos", s: "revision_extensos_inicio", e: "revision_extensos_fin" },
                            { label: "Registro Dictaminadores", s: "inscripcion_dictaminadores_inicio", e: "inscripcion_dictaminadores_fin" },
                            { label: "Registro Evaluadores", s: "inscripcion_evaluadores_inicio", e: "inscripcion_evaluadores_fin" },
                            { label: "Carga Multimedia", s: "subir_multimedia_inicio", e: "subir_multimedia_fin" },
                        ].map((d, i) => {
                            const formatDisplayDate = (dateStr) => {
                                if (!dateStr) return "No definida";
                                try {
                                    return format(parseISO(dateStr), "eee d 'de' MMMM, yyyy - HH:mm 'hrs'", { locale: es });
                                } catch (e) {
                                    return dateStr;
                                }
                            };

                            return (
                                <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:border-black/10 transition-all group/card shadow-sm hover:shadow-md">
                                    <p className="text-[10px] font-black uppercase mb-4 opacity-40 group-hover/card:opacity-100 transition-opacity flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                        {d.label}
                                    </p>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Inicio</p>
                                            {modificando ? (
                                                <input type="datetime-local" id={d.s} value={formData[d.s]} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black transition-all shadow-inner" />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-900 bg-white/50 p-2 rounded-xl">
                                                    <FiClock className="opacity-30" size={14} />
                                                    <span className="text-xs font-bold capitalize leading-tight">{formatDisplayDate(formData[d.s])}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-center">
                                            <div className="h-4 w-px bg-gradient-to-b from-gray-300 to-transparent"></div>
                                        </div>
                                        
                                        <div className="relative">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Fin</p>
                                            {modificando ? (
                                                <input type="datetime-local" id={d.e} value={formData[d.e]} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black transition-all shadow-inner" />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-900 bg-white/50 p-2 rounded-xl">
                                                    <FiClock className="opacity-30" size={14} />
                                                    <span className="text-xs font-bold capitalize leading-tight">{formatDisplayDate(formData[d.e])}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Costos */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}><div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><FiCreditCard size={20} /></div> Costos y Recaudación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                            <div><label className={labelClasses}>Asistente</label><input type="number" id="costo_asistente" value={formData.costo_asistente} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                            <div><label className={labelClasses}>Ponente</label><input type="number" id="costo_ponente" value={formData.costo_ponente} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                            <div><label className={labelClasses}>Descuento Prepago %</label><input type="number" id="descuento_prepago" value={formData.descuento_prepago} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                            <div><label className={labelClasses}>Descuento Estudiante %</label><input type="number" id="descuento_estudiante" value={formData.descuento_estudiante} onChange={handleChange} className={inputClasses} readOnly={!modificando} /></div>
                        </div>
                        <div className="bg-black text-white p-6 rounded-3xl flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase opacity-50 mb-2">Cuenta Clabe / Depósito</label>
                            <input id="cuenta_deposito" value={formData.cuenta_deposito} onChange={handleChange} className="bg-transparent border-none text-lg font-mono tracking-tighter w-full focus:outline-none" readOnly={!modificando} />
                        </div>
                    </div>
                </section>

                {modificando && isFullPage && (
                    <div className="flex justify-center mt-10">
                        <button onClick={() => setShowConfirm(true)} className="bg-black text-white px-16 py-4 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl">GUARDAR CAMBIOS</button>
                    </div>
                )}
            </div>
        </div>
    );
}
