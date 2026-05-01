import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiEdit2, FiCopy, FiCalendar, FiClock, FiUsers, FiMapPin, FiUser, FiAward, FiFileText, FiLink, FiSave, FiAlertCircle } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { getInstitucionesApi, getCongresosApi, getSubareasApi, getMesasApi, createPonenciaApi, getPonenciaByIdApi, getParticipantsApi } from '../../../api/adminApi';
import { API_URL } from '../../../api/constants';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { FaLink } from "react-icons/fa";
import { LuCrown } from "react-icons/lu";

const DetallesEditarPonencia = forwardRef(({ ponenciaData, initialModificando = false, isFullPage = false }, ref) => {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('congress_access');

    const [formatData, setFormatData] = useState({
        id_congreso: "",
        nombre_evento: "",
        tipo_evento: "ponencia",
        id_subarea: "",
        cupos: 0,
        tipo_participacion: "Presencial",
        enlace: "",
        sinopsis: "",
        id_mesas_trabajo: "",
        fecha_hora_inicio: "",
        fecha_hora_final: "",
        institucion: "",
        tipo_trabajo: "",
        tipo_ponencia: "",
        ponente_principal: "",
        coautores: "",
        rubrica: "",
        preguntas: ""
    });

    const [modificando, setModificando] = useState(initialModificando);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [instituciones, setInstituciones] = useState([]);
    const [congresos, setCongresos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [subareas, setSubareas] = useState([]);
    const [personasOptions, setPersonasOptions] = useState([]);

    useImperativeHandle(ref, () => ({
        handleSave
    }));

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [instData, congData, subData] = await Promise.all([
                    getInstitucionesApi(accessToken),
                    getCongresosApi(accessToken),
                    getSubareasApi(accessToken)
                ]);
                setInstituciones(instData);
                setCongresos(congData);
                setSubareas(subData);

                const realId = ponenciaData?.id || ponenciaData?.id_ponencia;

                if (realId) {
                    console.log("Cargando ponencia ID:", realId);
                    const realPonencia = await getPonenciaByIdApi(accessToken, realId);
                    console.log("Datos recibidos:", realPonencia);

                    const formatDate = (dateStr) => {
                        if (!dateStr) return "";
                        return dateStr.substring(0, 16);
                    };

                    setFormatData({
                        ...realPonencia,
                        id: realId,
                        id_congreso: realPonencia.id_congreso || "",
                        id_mesas_trabajo: realPonencia.id_mesas_trabajo || "",
                        id_subarea: realPonencia.id_subarea || "",
                        fecha_hora_inicio: formatDate(realPonencia.fecha_hora_inicio),
                        fecha_hora_final: formatDate(realPonencia.fecha_hora_final),
                        institucion: realPonencia.institucion || "",
                        tipo_trabajo: realPonencia.tipo_trabajo || "",
                        tipo_ponencia: realPonencia.tipo_ponencia || "",
                        ponente_principal: realPonencia.ponente_principal || "",
                        coautores: realPonencia.coautores || "",
                        rubrica: realPonencia.rubrica || "",
                        preguntas: realPonencia.preguntas || ""
                    });
                } else if (ponenciaData?.id_congreso) {
                    setFormatData(prev => ({ ...prev, id_congreso: parseInt(ponenciaData.id_congreso) }));
                }
            } catch (err) {
                console.error("Error en DetallesEditarPonencia:", err);
                setError(err.message || "Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [ponenciaData?.id, ponenciaData?.id_ponencia, accessToken]);

    useEffect(() => {
        if (formatData.id_congreso) {
            getMesasApi(accessToken).then(setMesas).catch(console.error);
        }
    }, [formatData.id_congreso, accessToken]);

    useEffect(() => {
        getParticipantsApi(accessToken, { allUsers: true })
            .then(data => {
                const opts = data.map(u => ({
                    value: u.nombre_completo,
                    label: u.nombre_completo
                }));
                setPersonasOptions(opts);
            })
            .catch(console.error);
    }, [accessToken]);

    function handleChange(e) {
        const { id, value } = e.target;
        setFormatData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    async function handleSave() {
        if (!formatData.nombre_evento || !formatData.id_congreso) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        setSaving(true);
        try {
            if (ponenciaData?.id) {
                // Actualizar
                const res = await fetch(`${API_URL}/api/ponencias/lista/${ponenciaData.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formatData)
                });
                if (!res.ok) throw new Error('Error al actualizar la ponencia');
                alert("Ponencia actualizada con éxito");
            } else {
                // Crear
                await createPonenciaApi(accessToken, formatData);
                alert("Ponencia creada con éxito");
            }

            if (isFullPage) navigate(`/admin/eventos/congresos/lista`);
            else window.location.reload();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputClasses = `w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!modificando ? 'bg-base-200 cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`;
    const labelClasses = "text-[10px] font-bold text-base-content/40 mb-1 block ml-1 uppercase tracking-widest";
    const sectionTitleClasses = "text-lg font-bold text-primary flex items-center gap-2 mb-6 pb-2 border-b border-base-300 mt-8 first:mt-0";

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Cargando información...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4 text-error">
            <FiAlertCircle size={48} />
            <p className="font-bold uppercase tracking-widest">Error al cargar datos</p>
            <p className="text-sm opacity-70">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-outline btn-error btn-sm mt-4">Reintentar</button>
        </div>
    );

    const congressLocked = (!!ponenciaData?.id || !!ponenciaData?.id_congreso) && isFullPage;

    const selectedInst = instituciones.find(i => i.nombre === formatData.institucion || i.id_institucion === formatData.institucion);

    return (
        <div className={`w-full bg-base-100 ${isFullPage ? '' : 'rounded-3xl shadow-2xl'} overflow-hidden font-sans`}>
            {!isFullPage && (
                <div className='sticky top-0 bg-primary text-primary-content flex items-center justify-between px-6 py-4 z-40 shadow-lg'>
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4 uppercase tracking-wider">Detalles de la Ponencia</h2>
                    <div className='flex items-center gap-2'>
                        {!modificando ? (
                            <button className="w-10 h-10 rounded-full bg-primary-content text-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer shadow-md" onClick={() => setModificando(true)}>
                                <FiEdit2 size={18} />
                            </button>
                        ) : (
                            <div className='flex bg-base-100 rounded-full p-1 gap-1 shadow-inner'>
                                <button className="w-8 h-8 rounded-full bg-success text-success-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" onClick={handleSave} disabled={saving}>
                                    {saving ? <span className="loading loading-spinner loading-xs"></span> : <IoIosCheckmark size={24} />}
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
                <section className='mb-8'>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Información del Congreso
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Institución organizadora</label>
                                <div className="relative">
                                    <input id="institucion" type="text" className={`${inputClasses} pl-11 font-mono`} value={formatData.institucion} onChange={handleChange} readOnly={true} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Congreso</label>
                                {congressLocked ? (
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        value={congresos.find(c => c.id_congreso === formatData.id_congreso)?.nombre_congreso || "Congreso seleccionado"}
                                        readOnly
                                    />
                                ) : (
                                    <select id="id_congreso" value={formatData.id_congreso} className={`${inputClasses} font-mono`} onChange={handleChange} disabled={!modificando}>
                                        <option value="">Selecciona un congreso</option>
                                        {congresos.map((item) => (
                                            <option key={item.id_congreso} value={item.id_congreso}>{item.nombre_congreso}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className={labelClasses}>Tipo de trabajo</label>
                                <div className="relative">

                                    <input id="tipo_trabajo" type="text" className={`${inputClasses} pl-11 font-mono`} value={formatData.tipo_trabajo} onChange={handleChange} readOnly={true} />
                                </div>
                            </div>

                        </div>
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6 group hover:border-primary/30 transition-all overflow-hidden relative">
                            {selectedInst?.ruta_imagen ? (
                                <img src={`${API_URL}${selectedInst.ruta_imagen}`} alt="Vista Previa Institución" className="w-full h-full object-contain absolute inset-0 p-4" />
                            ) : (
                                <>
                                    <FiAward size={48} className="text-base-content/20" />
                                    <p className='text-xs font-bold uppercase text-base-content/40'>Vista Previa</p>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className='mb-8'>
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Detalles de la Ponencia
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="">
                            <label className={labelClasses}>Título de la ponencia</label>
                            <input id="nombre_evento" type="text" className={`${inputClasses} text-base`} value={formatData.nombre_evento} onChange={handleChange} readOnly={!modificando} />
                        </div>
                        <div>
                            <label className={labelClasses}>Tipo de ponencia</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><LuCrown /></span>
                                <select id="tipo_ponencia" className={`${inputClasses} pl-11 font-mono`} value={formatData.tipo_ponencia} onChange={handleChange} disabled={!modificando}>
                                    <option value="Ponencia magistral">
                                        Ponencia magistral

                                    </option>
                                    <option value="Ponencia normal">
                                        Ponencia normal

                                    </option>
                                </select>
                            </div>
                        </div>
                        <div className='flex flex-col '>
                            <label className={labelClasses}>Ponente principal</label>
                            <div className="relative flex flex-col w-full gap-4">

                                <CreatableSelect
                                    id="ponente_principal"
                                    isDisabled={!modificando}
                                    options={personasOptions}
                                    value={formatData.ponente_principal ? { label: formatData.ponente_principal, value: formatData.ponente_principal } : null}
                                    onChange={(selectedOption) => {
                                        handleChange({ target: { id: 'ponente_principal', value: selectedOption ? selectedOption.value : '' } });
                                    }}
                                    placeholder="Selecciona o escribe..."
                                    noOptionsMessage={() => "No se encontraron resultados"}
                                    formatCreateLabel={(inputValue) => `Usar nombre "${inputValue}"`}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            padding: '2px 8px',
                                            borderRadius: '0.75rem', // xl
                                            backgroundColor: !modificando ? 'var(--color-base-200)' : 'var(--color-base-100)',
                                            borderColor: 'var(--color-base-300)',
                                            opacity: !modificando ? 0.7 : 1,
                                            boxShadow: 'none',
                                            cursor: !modificando ? 'not-allowed' : 'default',
                                            '&:hover': {
                                                borderColor: modificando ? 'var(--color-primary)' : 'var(--color-base-300)'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 50,
                                            backgroundColor: 'var(--color-base-100)',
                                            borderRadius: '0.75rem'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? 'var(--color-base-200)' : 'transparent',
                                            color: 'var(--color-base-content)',
                                            '&:active': {
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'var(--color-primary-content)'
                                            }
                                        })
                                    }}
                                    className="w-full font-mono text-sm"
                                />

                            </div>
                        </div>
                        <div className='flex flex-col '>
                            <label className={labelClasses}>Coautores</label>
                            <div className="relative flex flex-col w-full gap-4">

                                <CreatableSelect
                                    id="coautores"
                                    isMulti
                                    isDisabled={!modificando}
                                    options={personasOptions.filter(opt => opt.value !== formatData.ponente_principal)}
                                    value={formatData.coautores ? formatData.coautores.split(',').map(c => ({ label: c.trim(), value: c.trim() })).filter(c => c.value !== '') : []}
                                    onChange={(selectedOptions) => {
                                        const val = selectedOptions ? selectedOptions.map(o => o.value).join(', ') : '';
                                        handleChange({ target: { id: 'coautores', value: val } });
                                    }}
                                    placeholder="Selecciona o escribe..."
                                    noOptionsMessage={() => "No se encontraron resultados"}
                                    formatCreateLabel={(inputValue) => `Agregar "${inputValue}"`}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            padding: '2px 8px',
                                            borderRadius: '0.75rem', // xl
                                            backgroundColor: !modificando ? 'var(--color-base-200)' : 'var(--color-base-100)',
                                            borderColor: 'var(--color-base-300)',
                                            opacity: !modificando ? 0.7 : 1,
                                            boxShadow: 'none',
                                            cursor: !modificando ? 'not-allowed' : 'default',
                                            '&:hover': {
                                                borderColor: modificando ? 'var(--color-primary)' : 'var(--color-base-300)'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 50,
                                            backgroundColor: 'var(--color-base-100)',
                                            borderRadius: '0.75rem'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? 'var(--color-base-200)' : 'transparent',
                                            color: 'var(--color-base-content)',
                                            '&:active': {
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'var(--color-primary-content)'
                                            }
                                        }),
                                        multiValue: (base) => ({
                                            ...base,
                                            backgroundColor: 'var(--color-base-200)',
                                            borderRadius: '0.5rem',
                                        }),
                                        multiValueLabel: (base) => ({
                                            ...base,
                                            color: 'var(--color-base-content)',
                                        }),
                                        multiValueRemove: (base) => ({
                                            ...base,
                                            color: 'var(--color-base-content)',
                                            ':hover': {
                                                backgroundColor: 'var(--color-error)',
                                                color: 'var(--color-error-content)',
                                            },
                                        }),
                                    }}
                                    className="w-full font-mono text-sm"
                                />

                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Subárea Académica</label>
                            <select id="id_subarea" value={formatData.id_subarea} className={`${inputClasses} font-mono`} onChange={handleChange} disabled={!modificando}>
                                <option value="">Selecciona subárea</option>
                                {subareas.map((item) => (
                                    <option key={item.id_subareas} value={item.id_subareas}>{item.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Tipo de Participación</label>
                            <select id="tipo_participacion" value={formatData.tipo_participacion} className={`${inputClasses} font-mono`} onChange={handleChange} disabled={!modificando}>
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
                        <div>
                            <label className={labelClasses}>Enlace</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FaLink /></span>
                                <input id="enlace" type="text" className={`${inputClasses} pl-11 font-mono`} value={formatData.enlace} onChange={handleChange} readOnly={!modificando} />
                            </div>
                        </div>

                        <div className='flex flex-col '>
                            <label className={labelClasses}>Preguntas</label>
                            <div className="relative flex flex-col items-center gap-4">

                                <input id="preguntas" type="text" className={`${inputClasses} font-mono`} value={formatData.preguntas} readOnly={true} />
                                <button
                                    type="button"
                                    onClick={() => formatData.id_congreso && navigate(`/admin/eventos/congresos/tipos-trabajo/${formatData.id_congreso}`)}
                                    className="w-full bg-black text-white font-bold border border-base-300 rounded-xl px-4 py-2 text-sm  outline-none transition-all hover:scale-98 hover:cursor-pointer disabled:opacity-50"
                                    disabled={!formatData.id_congreso}
                                >
                                    Ver preguntas
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col '>
                            <label className={labelClasses}>Rúbrica</label>
                            <div className="relative flex flex-col items-center gap-4">

                                <input id="rubrica" type="text" className={`${inputClasses} font-mono`} value={formatData.rubrica} readOnly={true} />
                                <button
                                    type="button"
                                    onClick={() => formatData.id_congreso && navigate(`/admin/eventos/congresos/tipos-trabajo/${formatData.id_congreso}`)}
                                    className="w-full bg-black text-white font-bold border border-base-300 rounded-xl px-4 py-2 text-sm  outline-none transition-all hover:scale-98 hover:cursor-pointer disabled:opacity-50"
                                    disabled={!formatData.id_congreso}
                                >
                                    Ver rúbrica
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Sinopsis / Resumen</label>
                            <textarea id="sinopsis" className={`${inputClasses} min-h-[120px] py-3 resize-none`} value={formatData.sinopsis} onChange={handleChange} readOnly={!modificando} placeholder="Escribe aquí el resumen..."></textarea>
                        </div>

                    </div>
                </section>

                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Configuración
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Mesa Asignada</label>
                            <select id="id_mesas_trabajo" value={formatData.id_mesas_trabajo} className={`${inputClasses} font-mono`} onChange={handleChange} disabled={!modificando}>
                                <option value="">Sin mesa asignada</option>
                                {mesas.map((item) => (
                                    <option key={item.id_mesas_trabajo} value={item.id_mesas_trabajo}>{item.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiCalendar className="text-success" size={14} />
                                <label className={labelClasses}>Inicio</label>
                            </div>
                            <input type="datetime-local" id="fecha_hora_inicio" className={`${inputClasses} font-mono`} value={formatData.fecha_hora_inicio} onChange={handleChange} readOnly={!modificando} />
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiClock className="text-error" size={14} />
                                <label className={labelClasses}>Fin</label>
                            </div>
                            <input type="datetime-local" id="fecha_hora_final" className={`${inputClasses} font-mono`} value={formatData.fecha_hora_final} onChange={handleChange} readOnly={!modificando} />
                        </div>
                    </div>
                </section>

                {isFullPage && modificando && (
                    <div className='flex justify-center mt-12'>
                        <button onClick={handleSave} disabled={saving} className="px-12 py-4 rounded-2xl bg-black text-white font-black shadow-xl hover:bg-[#005a6a] transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center gap-3 disabled:opacity-50">
                            {saving ? <span className="loading loading-spinner"></span> : <FiSave size={20} />}
                            Guardar Cambios
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DetallesEditarPonencia;
