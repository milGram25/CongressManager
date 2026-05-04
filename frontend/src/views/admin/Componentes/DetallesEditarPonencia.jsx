import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiEdit2, FiCopy, FiCalendar, FiClock, FiUsers, FiMapPin, FiUser, FiAward, FiFileText, FiLink, FiSave, FiAlertCircle } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { getInstitucionesApi, getCongresosApi, getSubareasApi, getMesasApi, createPonenciaApi, getPonenciaByIdApi, getInscritosTallerApi } from '../../../api/adminApi';
import { API_URL } from '../../../api/constants';
import { useNavigate } from 'react-router-dom';

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
        fecha_hora_final: ""
    });

    const [modificando, setModificando] = useState(initialModificando);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [instituciones, setInstituciones] = useState([]);
    const [congresos, setCongresos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [subareas, setSubareas] = useState([]);
    const [inscritos, setInscritos] = useState([]);
    const [cuposMax, setCuposMax] = useState(0);
    const [loadingInscritos, setLoadingInscritos] = useState(false);

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
                    const realPonencia = await getPonenciaByIdApi(accessToken, realId);
                    
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
                        fecha_hora_final: formatDate(realPonencia.fecha_hora_final)
                    });
                    const idEvento = realPonencia.id_evento;
                    if (idEvento) {
                        setLoadingInscritos(true);
                        try {
                            const inscritosData = await getInscritosTallerApi(accessToken, idEvento);
                            setInscritos(inscritosData.inscritos || []);
                            setCuposMax(inscritosData.cupos_max || 0);
                        } catch {
                            // no bloquear la carga principal
                        } finally {
                            setLoadingInscritos(false);
                        }
                    }
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
    }, [formatData.id_congreso]);

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
                                <label className={labelClasses}>Congreso</label>
                                {congressLocked ? (
                                    <input 
                                        type="text" 
                                        className={inputClasses} 
                                        value={congresos.find(c => c.id_congreso === formatData.id_congreso)?.nombre_congreso || "Congreso seleccionado"} 
                                        readOnly 
                                    />
                                ) : (
                                    <select id="id_congreso" value={formatData.id_congreso} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                        <option value="">Selecciona un congreso</option>
                                        {congresos.map((item) => (
                                            <option key={item.id_congreso} value={item.id_congreso}>{item.nombre_congreso}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6 group hover:border-primary/30 transition-all">
                            <FiAward size={48} className="text-base-content/20" />
                            <p className='text-xs font-bold uppercase text-base-content/40'>Vista Previa</p>
                        </div>
                    </div>
                </section>

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
                            <label className={labelClasses}>Subárea Académica</label>
                            <select id="id_subarea" value={formatData.id_subarea} className={inputClasses} onChange={handleChange} disabled={!modificando}>
                                <option value="">Selecciona subárea</option>
                                {subareas.map((item) => (
                                    <option key={item.id_subareas} value={item.id_subareas}>{item.nombre}</option>
                                ))}
                            </select>
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
                            <label className={labelClasses}>Sinopsis / Resumen</label>
                            <textarea id="sinopsis" className={`${inputClasses} min-h-[120px] py-3 resize-none`} value={formatData.sinopsis} onChange={handleChange} readOnly={!modificando} placeholder="Escribe aquí el resumen..."></textarea>
                        </div>
                    </div>
                </section>

                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Programación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Mesa Asignada</label>
                            <select id="id_mesas_trabajo" value={formatData.id_mesas_trabajo} className={inputClasses} onChange={handleChange} disabled={!modificando}>
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

                {/* Sección Inscritos */}
                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <FiUsers className="text-primary" />
                        Asistentes Inscritos
                        {cuposMax > 0 && (
                            <span className="ml-auto text-sm font-normal text-base-content/60">
                                {inscritos.length} / {cuposMax} cupos
                            </span>
                        )}
                    </h3>

                    {cuposMax > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-base-content/50 mb-1">
                                <span>Ocupados: {inscritos.length}</span>
                                <span>Disponibles: {Math.max(0, cuposMax - inscritos.length)}</span>
                            </div>
                            <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${inscritos.length >= cuposMax ? "bg-error" : inscritos.length / cuposMax > 0.75 ? "bg-warning" : "bg-success"}`}
                                    style={{ width: `${Math.min(100, (inscritos.length / cuposMax) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {loadingInscritos ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-md text-primary" />
                        </div>
                    ) : inscritos.length === 0 ? (
                        <p className="text-sm text-base-content/40 text-center py-8">No hay asistentes inscritos aún.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-base-200">
                            <table className="table table-sm w-full">
                                <thead className="bg-base-200 text-[10px] uppercase tracking-widest text-base-content/50">
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Fecha de inscripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inscritos.map((p, i) => (
                                        <tr key={p.id} className="hover:bg-base-50">
                                            <td className="text-base-content/40 font-mono">{i + 1}</td>
                                            <td className="font-medium">{[p.nombre, p.primer_apellido, p.segundo_apellido].filter(Boolean).join(" ")}</td>
                                            <td className="text-base-content/70">{p.correo || "—"}</td>
                                            <td className="text-base-content/70">{p.telefono || "—"}</td>
                                            <td className="text-base-content/50 text-xs">
                                                {p.fecha_inscripcion ? new Date(p.fecha_inscripcion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
