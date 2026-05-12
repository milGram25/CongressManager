import React, { useState, useEffect } from 'react';
import { FiAward, FiUser, FiCalendar, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { LuCrown } from 'react-icons/lu';
import { getPonenciaMagistralByIdApi } from '../../../api/adminApi';

const DetallesPonenciaMagistral = ({ idPonenciaMagistral, isFullPage = false }) => {
    const accessToken = localStorage.getItem('congress_access');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await getPonenciaMagistralByIdApi(accessToken, idPonenciaMagistral);
                setData(result);
            } catch (err) {
                console.error('Error en DetallesPonenciaMagistral:', err);
                setError(err.message || 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };
        if (idPonenciaMagistral) fetchData();
    }, [idPonenciaMagistral, accessToken]);

    const formatDateTime = (value) => {
        if (!value) return '—';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const inputClasses = 'w-full bg-base-200 border border-base-300 rounded-xl px-4 py-2 text-sm cursor-not-allowed opacity-80';
    const labelClasses = 'text-[10px] font-bold text-base-content/40 mb-1 block ml-1 uppercase tracking-widest';
    const sectionTitleClasses = 'text-lg font-bold text-primary flex items-center gap-2 mb-6 pb-2 border-b border-base-300 mt-8 first:mt-0';

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

    if (!data) return null;

    const ponentes = Array.isArray(data.ponentes) ? data.ponentes : [];

    return (
        <div className={`w-full bg-base-100 ${isFullPage ? '' : 'rounded-3xl shadow-2xl'} overflow-hidden font-sans`}>
            {!isFullPage && (
                <div className='sticky top-0 bg-primary text-primary-content flex items-center justify-between px-6 py-4 z-40 shadow-lg'>
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4 uppercase tracking-wider flex items-center gap-2">
                        <LuCrown /> Detalles de la Ponencia Magistral
                    </h2>
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
                                <input type="text" className={inputClasses} value={data.nombre_congreso || '—'} readOnly />
                            </div>
                            <div>
                                <label className={labelClasses}>Subárea Académica</label>
                                <input type="text" className={inputClasses} value={data.nombre_subarea || '—'} readOnly />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-base-200 border-2 border-dashed border-base-300 rounded-3xl p-8 gap-6">
                            <LuCrown size={48} className="text-primary/40" />
                            <p className='text-xs font-bold uppercase text-primary/60'>Ponencia Magistral</p>
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
                            <input type="text" className={`${inputClasses} font-bold text-base`} value={data.titulo || '—'} readOnly />
                        </div>
                        <div>
                            <label className={labelClasses}>Tipo de ponencia</label>
                            <div className='relative'>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><LuCrown /></span>
                                <input type="text" className={`${inputClasses} pl-10`} value="Magistral" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Tipo de Participación</label>
                            <input type="text" className={inputClasses} value={data.tipo_participacion || '—'} readOnly />
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div> Programación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiCalendar className="text-success" size={14} />
                                <label className={labelClasses}>Inicio</label>
                            </div>
                            <input type="text" className={`${inputClasses} font-mono`} value={formatDateTime(data.fecha_inicio)} readOnly />
                        </div>
                        <div>
                            <div className='flex items-center gap-2 mb-2 ml-1'>
                                <FiClock className="text-error" size={14} />
                                <label className={labelClasses}>Fin</label>
                            </div>
                            <input type="text" className={`${inputClasses} font-mono`} value={formatDateTime(data.fecha_fin)} readOnly />
                        </div>
                    </div>
                </section>

                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <FiUser className="text-primary" /> Ponentes
                        <span className="ml-auto text-sm font-normal text-base-content/60">{ponentes.length}</span>
                    </h3>

                    {ponentes.length === 0 ? (
                        <p className="text-sm text-base-content/40 text-center py-8">No hay ponentes asignados.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-base-200">
                            <table className="table table-sm w-full">
                                <thead className="bg-base-200 text-[10px] uppercase tracking-widest text-base-content/50">
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ponentes.map((p, i) => (
                                        <tr key={p.id_persona || i} className="hover:bg-base-50">
                                            <td className="text-base-content/40 font-mono">{i + 1}</td>
                                            <td className="font-medium">{p.nombre_completo || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="mb-4">
                    <h3 className={sectionTitleClasses}>
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <FiUsers className="text-primary" /> Asistentes
                    </h3>
                    <p className='text-center text-slate-500 text-sm italic'>
                        Todos pueden asistir a las ponencias magistrales, por lo que no hay asistencias ni inscripciones a estas.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default DetallesPonenciaMagistral;
