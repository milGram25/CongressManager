import { RiPencilFill } from "react-icons/ri";
import { useState } from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export default function DetallesCrearCongreso({ indexDatosModal, listaRubricas, listaPreguntas, modificandoDatos = false, isFullPage = false }) {
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

    const initialCongreso = {
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

    const [formData, setFormData] = useState(initialCongreso);
    const [modificando, setModificando] = useState(modificandoDatos);

    function handleChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const inputClasses = `w-full bg-white border border-gray-900 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${!modificando ? 'bg-gray-50' : ''}`;
    const labelClasses = "text-xs font-bold text-gray-500 mb-1 block ml-1";
    const sectionTitleClasses = "text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300 mt-6";

    return (
        <div className={`w-full bg-[#F0EFEF] ${isFullPage ? '' : 'rounded-[24px] shadow-2xl'} overflow-hidden font-sans`}>
            {/* Header */}
            {!isFullPage && (
                <div className="sticky top-0 bg-black text-white flex items-center justify-between px-6 py-4 z-40">
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4">Ver y modificar detalles de congreso</h2>
                    <div className="flex items-center gap-2">
                        {!modificando ? (
                            <button 
                                onClick={() => setModificando(true)} 
                                className="w-10 h-10 rounded-full bg-black text-white border-2 border-white flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer" 
                                title="Modificar datos"
                            >
                                <RiPencilFill size={18} />
                            </button>
                        ) : (
                            <div className="flex bg-white rounded-full p-1 gap-1">
                                <button 
                                    onClick={() => setModificando(false)} 
                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer" 
                                    title="Cancelar cambios"
                                >
                                    <RxCross2 size={18} />
                                </button>
                                <button 
                                    onClick={() => setModificando(false)} 
                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer" 
                                    title="Aceptar cambios"
                                >
                                    <IoIosCheckmark size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Body */}
            <div className={`p-6 md:p-8 ${isFullPage ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
                
                {/* Sección Congreso */}
                <section>
                    <h3 className={sectionTitleClasses}>Congreso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="nombre_congreso" className={labelClasses}>Nombre del congreso</label>
                            <input value={formData.nombre_congreso} id="nombre_congreso" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="nombre_institucion" className={labelClasses}>Nombre de la institución</label>
                            <input value={formData.nombre_institucion} id="nombre_institucion" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClasses}>Imagen representativa</label>
                            <div className="border border-dashed border-gray-400 bg-white rounded-2xl h-10 flex items-center justify-center text-gray-400 text-xs italic">
                                [ Imagen ]
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Sede */}
                <section>
                    <h3 className={sectionTitleClasses}>Sede</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="nombre_sede" className={labelClasses}>Nombre de la sede</label>
                            <input value={formData.nombre_sede} id="nombre_sede" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-2">
                            <div>
                                <label htmlFor="pais" className={labelClasses}>País</label>
                                <input value={formData.pais} id="pais" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="estado" className={labelClasses}>Estado</label>
                                <input value={formData.estado} id="estado" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="ciudad" className={labelClasses}>Ciudad</label>
                                <input value={formData.ciudad} id="ciudad" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="calle" className={labelClasses}>Calle</label>
                                <input value={formData.calle} id="calle" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="numero_exterior" className={labelClasses}>Num Exterior</label>
                                <input value={formData.numero_exterior} id="numero_exterior" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="numero_interior" className={labelClasses}>Num Interior</label>
                                <input value={formData.numero_interior} id="numero_interior" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="modulo_fisico" className={labelClasses}>Módulo físico</label>
                            <input value={formData.modulo_fisico} id="modulo_fisico" onChange={handleChange} className={inputClasses} readOnly={!modificando} />
                        </div>
                    </div>
                </section>

                {/* Sección Evaluaciones */}
                <section>
                    <h3 className={sectionTitleClasses}>Evaluaciones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="tipo_trabajo" className={labelClasses}>Tipo de trabajo</label>
                            <select id="tipo_trabajo" value={formData.tipo_trabajo} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                {listaTiposTrabajo.map((item, index) => (
                                    <option key={index} value={item.nombre}>{item.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Preguntas</label>
                            <button className="bg-black text-white w-full py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                                Ver preguntas
                            </button>
                        </div>
                        <div>
                            <label htmlFor="rubrica_referencia" className={labelClasses}>Rúbrica</label>
                            <div className="flex flex-col gap-2">
                                <select id="rubrica_referencia" value={formData.rubrica_referencia} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                    {listaRubricasPrueba.map((item, index) => (
                                        <option key={index} value={item.nombre}>{item.nombre}</option>
                                    ))}
                                </select>
                                <button className="bg-black text-white w-full py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                                    Ver rúbrica
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Fechas */}
                <section>
                    <h3 className={sectionTitleClasses}>Fechas y Horarios</h3>
                    
                    {/* Congreso */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Congreso</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Ponencias y otros */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-700">Flujo de Ponencias</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {[
                                { label: "Envío de ponencias", startId: "envio_ponencias_inicio", endId: "envio_ponencias_fin" },
                                { label: "Inscripción dictaminadores", startId: "inscripcion_dictaminadores_inicio", endId: "inscripcion_dictaminadores_fin" },
                                { label: "Revisión de resúmenes", startId: "revision_resumenes_inicio", endId: "revision_resumenes_fin" },
                                { label: "Envío de extensos", startId: "envio_extensos_inicio", endId: "envio_extensos_fin" },
                                { label: "Inscripción evaluadores", startId: "inscripcion_evaluadores_inicio", endId: "inscripcion_evaluadores_fin" },
                                { label: "Revisión de extensos", startId: "revision_extensos_inicio", endId: "revision_extensos_fin" },
                                { label: "Subir multimedia", startId: "subir_multimedia_inicio", endId: "subir_multimedia_fin" },
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-800 mb-2">{item.label}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 w-8">Inicio</span>
                                            <input value={formData[item.startId]} id={item.startId} onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 w-8">Fin</span>
                                            <input value={formData[item.endId]} id={item.endId} onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagos */}
                    <div className="mt-6 space-y-4">
                        <h4 className="text-sm font-bold text-gray-700">Fechas de Pagos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                                <p className="text-xs font-bold text-gray-800 mb-2">Prepago</p>
                                <div className="space-y-2">
                                    <input value={formData.prepago_inicio} id="prepago_inicio" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                    <input value={formData.prepago_fin} id="prepago_fin" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                </div>
                            </div>
                            <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                                <p className="text-xs font-bold text-gray-800 mb-2">Pagos Normales</p>
                                <div className="space-y-2">
                                    <input value={formData.pagos_normales_inicio} id="pagos_normales_inicio" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                    <input value={formData.pagos_normales_fin} id="pagos_normales_fin" onChange={handleChange} type="datetime-local" className={inputClasses} readOnly={!modificando} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Pagos y Costos */}
                <section className="mb-8">
                    <h3 className={sectionTitleClasses}>Pagos y Costos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Costos */}
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-700">Costos</p>
                            <div>
                                <label htmlFor="costo_asistente" className={labelClasses}>Asistente</label>
                                <input value={formData.costo_asistente} onChange={handleChange} type="number" id="costo_asistente" className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="costo_ponente" className={labelClasses}>Ponente</label>
                                <input value={formData.costo_ponente} onChange={handleChange} type="number" id="costo_ponente" className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="costo_miembro_comite" className={labelClasses}>Comité</label>
                                <input value={formData.costo_miembro_comite} onChange={handleChange} type="number" id="costo_miembro_comite" className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>

                        {/* Descuentos */}
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-700">Descuentos (%)</p>
                            <div>
                                <label htmlFor="descuento_prepago" className={labelClasses}>Prepago</label>
                                <input value={formData.descuento_prepago} onChange={handleChange} type="number" id="descuento_prepago" className={inputClasses} readOnly={!modificando} />
                            </div>
                            <div>
                                <label htmlFor="descuento_estudiante" className={labelClasses}>Estudiante</label>
                                <input value={formData.descuento_estudiante} onChange={handleChange} type="number" id="descuento_estudiante" className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>

                        {/* Cuenta */}
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-700">Cuenta</p>
                            <div>
                                <label htmlFor="cuenta_deposito" className={labelClasses}>Cuenta de depósito</label>
                                <input value={formData.cuenta_deposito} onChange={handleChange} id="cuenta_deposito" className={inputClasses} readOnly={!modificando} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
