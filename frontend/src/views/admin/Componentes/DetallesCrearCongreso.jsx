import { RiPencilFill, RiSave3Line } from "react-icons/ri";
import { useState, useMemo } from "react";
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { IoIosCheckmark, IoMdAlert } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FiCalendar, FiClock, FiMapPin, FiCreditCard, FiTag, FiFileText } from "react-icons/fi";

// Mini component for confirmation dialog
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
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-md cursor-pointer"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DetallesCrearCongreso({ indexDatosModal, listaRubricas, listaPreguntas, modificandoDatos = false, initialModificando = false, isFullPage = false }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const listaRubricasPrueba = [
        { nombre: "rúbrica 1" },
        { nombre: "rúbrica 2" },
        { nombre: "rúbrica 3" },
        { nombre: "rúbrica 4" }
    ];
    const listaTiposTrabajo = [
        { nombre: "Tesis" },
        { nombre: "Avances de investigación" },
        { nombre: "Otros laburos" }
    ];

    const listaInstituciones = [
        { nombre_institucion: "CIENU" },
        { nombre_institucion: "RIDMAE" },

    ];

    const emptyFormData = {
        nombre_congreso: "",
        nombre_institucion: "",
        imagen_institucion: "",
        nombre_sede: "",
        pais: "",
        estado: "",
        ciudad: "",
        calle: "",
        numero_exterior: "",
        numero_interior: "",
        modulo_fisico: "",
        tipo_trabajo: "",
        preguntas_referencia: "",
        rubrica_nombre: "",
        rubrica_referencia: "",
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
        prepago_inicio: "",
        prepago_fin: "",
        pagos_normales_inicio: "",
        pagos_normales_fin: "",
        costo_asistente: "",
        costo_ponente: "",
        costo_miembro_comite: "",
        descuento_prepago: "",
        descuento_estudiante: "",
        cuenta_deposito: ""
    };

    // Datos simulados basados en el ID
    const getMockData = (id) => {
        if (!id) return emptyFormData;
        if (id === "1") {
            return {
                nombre_congreso: "RIDMAE 2025",
                nombre_institucion: "RIDMAE",
                imagen_institucion: "ruta",
                nombre_sede: "CUALTOS",
                pais: "MÉXICO",
                estado: "JALISCO",
                ciudad: "TEPATITLÁN",
                calle: "AV RAFAEL",
                numero_exterior: "100",
                numero_interior: "",
                modulo_fisico: "EDIFICIO G-202",
                tipo_trabajo: "Avances de tesis",
                preguntas_referencia: "1",
                rubrica_nombre: "buena rúbrica",
                rubrica_referencia: "1",
                congreso_inicio: "2026-04-11T20:00",
                congreso_fin: "2026-04-13T20:00",
                envio_ponencias_inicio: "2026-04-13T20:00",
                envio_ponencias_fin: "2026-04-13T20:00",
                inscripcion_dictaminadores_inicio: "2026-04-13T20:00",
                inscripcion_dictaminadores_fin: "2026-04-13T20:00",
                revision_resumenes_inicio: "2026-04-13T20:00",
                revision_resumenes_fin: "2026-04-13T20:00",
                envio_extensos_inicio: "2026-04-13T20:00",
                envio_extensos_fin: "2026-04-13T20:00",
                inscripcion_evaluadores_inicio: "2026-04-13T20:00",
                inscripcion_evaluadores_fin: "2026-04-13T20:00",
                revision_extensos_inicio: "2026-04-13T20:00",
                revision_extensos_fin: "2026-04-13T20:00",
                subir_multimedia_inicio: "2026-04-13T20:00",
                subir_multimedia_fin: "2026-04-13T20:00",
                prepago_inicio: "2026-04-13T20:00",
                prepago_fin: "2026-04-13T20:00",
                pagos_normales_inicio: "2026-04-13T20:00",
                pagos_normales_fin: "2026-04-13T20:00",
                costo_asistente: "100",
                costo_ponente: "200",
                costo_miembro_comite: "300",
                descuento_prepago: "10",
                descuento_estudiante: "50",
                cuenta_deposito: "123456789"
            };
        }
        return {
            nombre_congreso: "CIENU 2026",
            nombre_institucion: "CIENU",
            imagen_institucion: "ruta",
            nombre_sede: "CUALTOS",
            pais: "MÉXICO",
            estado: "JALISCO",
            ciudad: "TEPATITLÁN",
            calle: "AV RAFAEL",
            numero_exterior: "100",
            numero_interior: "",
            modulo_fisico: "EDIFICIO G-202",
            tipo_trabajo: "Avances de tesis",
            preguntas_referencia: "1",
            rubrica_nombre: "buena rúbrica",
            rubrica_referencia: "1",
            congreso_inicio: "2026-04-11T20:00",
            congreso_fin: "2026-04-13T20:00",
            envio_ponencias_inicio: "2026-04-13T20:00",
            envio_ponencias_fin: "2026-04-13T20:00",
            inscripcion_dictaminadores_inicio: "2026-04-13T20:00",
            inscripcion_dictaminadores_fin: "2026-04-13T20:00",
            revision_resumenes_inicio: "2026-04-13T20:00",
            revision_resumenes_fin: "2026-04-13T20:00",
            envio_extensos_inicio: "2026-04-13T20:00",
            envio_extensos_fin: "2026-04-13T20:00",
            inscripcion_evaluadores_inicio: "2026-04-13T20:00",
            inscripcion_evaluadores_fin: "2026-04-13T20:00",
            revision_extensos_inicio: "2026-04-13T20:00",
            revision_extensos_fin: "2026-04-13T20:00",
            subir_multimedia_inicio: "2026-04-13T20:00",
            subir_multimedia_fin: "2026-04-13T20:00",
            prepago_inicio: "2026-04-13T20:00",
            prepago_fin: "2026-04-13T20:00",
            pagos_normales_inicio: "2026-04-13T20:00",
            pagos_normales_fin: "2026-04-13T20:00",
            costo_asistente: "100",
            costo_ponente: "200",
            costo_miembro_comite: "300",
            descuento_prepago: "10",
            descuento_estudiante: "50",
            cuenta_deposito: "123456789"
        };
    };

    const [formData, setFormData] = useState(getMockData(indexDatosModal));
    const [modificando, setModificando] = useState(initialModificando || modificandoDatos);

    const options = useMemo(() => countryList().getData(), []);

    function handleCountryChange(value) {
        setFormData(prev => ({
            ...prev,
            pais: value.label
        }));
    }

    function handleChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    function initiateSave() {
        setShowConfirm(true);
    }

    function handleConfirmSave() {
        console.log("Guardando cambios:", formData);
        setModificando(false);
        setShowConfirm(false);
        // Aquí iría la llamada a la API
    }

    function handleCancel() {
        setFormData(getMockData(indexDatosModal));
        setModificando(false);
    }

    const inputClasses = `w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm ${!modificando ? 'bg-gray-50 border-transparent shadow-none cursor-default' : 'hover:border-gray-400 focus:border-black'}`;
    const labelClasses = "text-xs font-bold text-gray-500 mb-2 block ml-1 uppercase tracking-wider";
    const sectionTitleClasses = "text-xl font-bold text-gray-900 mb-6 flex items-center gap-3";
    const sectionContainerClasses = "bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm mb-8 transition-all hover:shadow-md";

    return (
        <div className={`w-full bg-gray-50/50 ${isFullPage ? '' : 'rounded-[32px] shadow-2xl'} overflow-hidden font-sans relative`}>

            <ConfirmDialog
                isOpen={showConfirm}
                onConfirm={handleConfirmSave}
                onCancel={() => setShowConfirm(false)}
                title="¿Confirmar cambios?"
                message="Estás a punto de actualizar la información del congreso. Esta acción no se puede deshacer fácilmente."
            />

            {/* Header */}
            <div className="sticky top-0 bg-black text-white flex items-center justify-between px-8 py-5 z-40 shadow-xl rounded-t-[32px]">
                <div>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight">
                        {modificando ? 'Panel de Edición' : 'Vista de Detalles'}
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Gestión de Congreso</p>
                </div>
                <div className="flex items-center gap-3">
                    {!modificando ? (
                        <button
                            onClick={() => setModificando(true)}
                            className="w-11 h-11 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer group"
                            title="Modificar datos"
                        >
                            <RiPencilFill size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    ) : (
                        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10 gap-1">
                            <button
                                onClick={handleCancel}
                                className="w-9 h-9 rounded-xl bg-black/40 text-white flex items-center justify-center hover:bg-red-500 transition-all cursor-pointer group"
                                title="Cancelar cambios"
                            >
                                <RxCross2 size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>
                            <button
                                onClick={initiateSave}
                                className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center hover:bg-green-500 hover:text-white transition-all cursor-pointer group"
                                title="Aceptar cambios"
                            >
                                <IoIosCheckmark size={28} className="group-hover:scale-125 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className={`p-6 md:p-10 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>

                {/* Sección Congreso */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FiFileText size={20} />
                        </div>
                        Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <label htmlFor="nombre_congreso" className={labelClasses}>Nombre del congreso</label>
                            <input value={formData.nombre_congreso} id="nombre_congreso" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="nombre_institucion" className={labelClasses}>Institución</label>
                            {/*<input value={formData.nombre_institucion} id="nombre_institucion" onChange={handleChange} className={inputClasses} readOnly={!modificando} />*/}
                            <select id="nombre_institucion" value={formData.nombre_institucion} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                {listaInstituciones.map((item, index) => (
                                    <option key={index} value={item.nombre_institucion}>{item.nombre_institucion}</option>
                                ))}
                            </select>

                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClasses}>Logo Representativo</label>
                            <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl h-[46px] flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-tighter">
                                Seleccione una institución
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Sede */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FiMapPin size={20} />
                        </div>
                        Ubicación y Sede
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label htmlFor="nombre_sede" className={labelClasses}>Nombre de la sede principal</label>
                            <input value={formData.nombre_sede} id="nombre_sede" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2">
                            <div>
                                <label htmlFor="pais" className={labelClasses}>País</label>
                                {!modificando ? (
                                    <input value={formData.pais} id="pais" readOnly className={inputClasses} />
                                ) : (
                                    <Select
                                        options={options}
                                        value={options.find(opt => opt.label === formData.pais) || null}
                                        onChange={handleCountryChange}
                                        placeholder="Busca tu país..."
                                        noOptionsMessage={() => "No se encontraron resultados"}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '2px 8px',
                                                borderRadius: '1rem',
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                '&:hover': { borderColor: '#9ca3af' }
                                            }),
                                            placeholder: (base) => ({
                                                ...base,
                                                color: '#6b7280',
                                                fontSize: '0.875rem'
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                color: '#111827',
                                                fontSize: '0.875rem'
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                backgroundColor: 'white',
                                                borderRadius: '1rem',
                                                zIndex: 50
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isFocused ? '#f3f4f6' : 'transparent',
                                                color: '#111827',
                                                fontSize: '0.875rem',
                                                '&:active': {
                                                    backgroundColor: 'black',
                                                    color: 'white'
                                                }
                                            })
                                        }}
                                        className="w-full transition-all"
                                    />
                                )}
                            </div>
                            <div>
                                <label htmlFor="estado" className={labelClasses}>Estado / Región</label>
                                <input value={formData.estado} id="estado" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="ciudad" className={labelClasses}>Ciudad</label>
                                <input value={formData.ciudad} id="ciudad" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2">
                            <div className="sm:col-span-1">
                                <label htmlFor="calle" className={labelClasses}>Calle</label>
                                <input value={formData.calle} id="calle" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="numero_exterior" className={labelClasses}>Ext.</label>
                                <input value={formData.numero_exterior} id="numero_exterior" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="numero_interior" className={labelClasses}>Int.</label>
                                <input value={formData.numero_interior} id="numero_interior" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="modulo_fisico" className={labelClasses}>Referencia específica (Módulo/Edificio)</label>
                            <input value={formData.modulo_fisico} id="modulo_fisico" onChange={handleChange} className={inputClasses} readOnly={!modificando} placeholder="Edificio A, Salón 123, Auditorio Central, etc." />
                        </div>
                    </div>
                </section>

                {/* Sección Evaluaciones */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FiTag size={20} />
                        </div>
                        Evaluaciones y Rúbricas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label htmlFor="tipo_trabajo" className={labelClasses}>Tipos de trabajo</label>
                            <select id="tipo_trabajo" value={formData.tipo_trabajo} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                {listaTiposTrabajo.map((item, index) => (
                                    <option key={index} value={item.nombre}>{item.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Preguntas</label>
                            <button className="bg-black text-white w-full py-3 rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95 cursor-pointer">
                                GESTIONAR PREGUNTAS
                            </button>
                        </div>
                        <div>
                            <label htmlFor="rubrica_referencia" className={labelClasses}>Rúbrica de Evaluación</label>
                            <div className="flex flex-col gap-3">
                                <select id="rubrica_referencia" value={formData.rubrica_referencia} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                    {listaRubricasPrueba.map((item, index) => (
                                        <option key={index} value={item.nombre}>{item.nombre}</option>
                                    ))}
                                </select>
                                <button className="bg-black text-white w-full py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer uppercase tracking-wider active:scale-95">
                                    Ver rúbrica actual
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Fechas */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FiCalendar size={20} />
                        </div>
                        Cronograma de Actividades
                    </h3>

                    {/* Congreso Principal */}
                    <div className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-black rounded-full"></div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Congreso</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Inicio</label>
                                <input value={formData.congreso_inicio} id="congreso_inicio" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label className={labelClasses}>Fin</label>
                                <input value={formData.congreso_fin} id="congreso_fin" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>
                    </div>

                    {/* Flujos */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-black rounded-full"></div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Procesos Académicos</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {[
                                { label: "Inscripción de dictaminadores", startId: "inscripcion_dictaminadores_inicio", endId: "inscripcion_dictaminadores_fin" },
                                { label: "Inscripción evaluadores", startId: "inscripcion_evaluadores_inicio", endId: "inscripcion_evaluadores_fin" },
                                { label: "Convocatoria de ponencias", startId: "envio_ponencias_inicio", endId: "envio_ponencias_fin" },

                                { label: "Revisión Resúmenes", startId: "revision_resumenes_inicio", endId: "revision_resumenes_fin" },

                                { label: "Recepción de Extensos", startId: "envio_extensos_inicio", endId: "envio_extensos_fin" },
                                { label: "Revisión de extensos", startId: "revision_extensos_inicio", endId: "revision_extensos_fin" },
                                { label: "Carga Multimedia", startId: "subir_multimedia_inicio", endId: "subir_multimedia_fin" },
                            ].map((item, idx) => (
                                <div key={idx} className="group">
                                    <p className="text-[11px] font-extrabold text-gray-400 mb-3 ml-1 uppercase">{item.label}</p>
                                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-gray-100 group-hover:border-gray-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 text-[9px] font-bold text-gray-400">DESDE</div>
                                            <input value={formData[item.startId]} id={item.startId} onChange={handleChange} type="datetime-local" className="flex-1 bg-transparent text-xs outline-none focus:font-bold transition-all" readOnly={!modificando} />
                                        </div>
                                        <div className="w-full h-px bg-gray-50"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 text-[9px] font-bold text-gray-400">HASTA</div>
                                            <input value={formData[item.endId]} id={item.endId} onChange={handleChange} type="datetime-local" className="flex-1 bg-transparent text-xs outline-none focus:font-bold transition-all" readOnly={!modificando} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección Pagos y Costos */}
                <section className={sectionContainerClasses}>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                            <FiCreditCard size={20} />
                        </div>
                        Estructura de Costos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Costos */}
                        <div className="space-y-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">Inscripciones</p>
                            <div className="relative">
                                <label htmlFor="costo_asistente" className={labelClasses}>Asistente General</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                                    <input value={formData.costo_asistente} onChange={handleChange} type="number" id="costo_asistente" className={`${inputClasses} pl-8`} readOnly={!modificando} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="costo_ponente" className={labelClasses}>Ponente</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                                    <input value={formData.costo_ponente} onChange={handleChange} type="number" id="costo_ponente" className={`${inputClasses} pl-8`} readOnly={!modificando} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="costo_miembro_comite" className={labelClasses}>Miembro Comité</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                                    <input value={formData.costo_miembro_comite} onChange={handleChange} type="number" id="costo_miembro_comite" className={`${inputClasses} pl-8`} readOnly={!modificando} />
                                </div>
                            </div>
                        </div>

                        {/* Descuentos */}
                        <div className="space-y-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">Políticas de Descuento</p>
                            <div>
                                <label htmlFor="descuento_prepago" className={labelClasses}>Pronto Pago</label>
                                <div className="relative">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                                    <input value={formData.descuento_prepago} onChange={handleChange} type="number" id="descuento_prepago" className={inputClasses} readOnly={!modificando} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="descuento_estudiante" className={labelClasses}>Estudiantes</label>
                                <div className="relative">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                                    <input value={formData.descuento_estudiante} onChange={handleChange} type="number" id="descuento_estudiante" className={inputClasses} readOnly={!modificando} />
                                </div>
                            </div>
                        </div>

                        {/* Cuenta */}
                        <div className="space-y-5">
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">Recaudación</p>
                            <div className="p-6 bg-black text-white rounded-[32px] shadow-xl">
                                <label htmlFor="cuenta_deposito" className="text-[10px] font-bold text-gray-400 mb-3 block uppercase">Número de Cuenta / CLABE</label>
                                <div className="flex items-center gap-3 mb-6">
                                    <FiCreditCard className="text-white/40" size={24} />
                                    <input value={formData.cuenta_deposito} onChange={handleChange} id="cuenta_deposito" className="bg-transparent border-none text-xl font-mono tracking-[0.2em] w-full focus:outline-none" readOnly={!modificando} />
                                </div>
                                <div className="text-[9px] text-gray-400 italic">
                                    * Esta cuenta será visible para los usuarios en el panel de pagos.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Botón Final en modo creación (FullPage) */}
                {isFullPage && modificando && (
                    <div className="flex justify-center pt-4 pb-10">
                        <button
                            onClick={initiateSave}
                            className="bg-black text-white px-12 py-4 rounded-3xl font-bold text-lg hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 active:scale-95 flex items-center gap-3 cursor-pointer group"
                        >
                            <RiSave3Line size={24} className="group-hover:rotate-12 transition-transform" />
                            GUARDAR CONFIGURACIÓN FINAL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
