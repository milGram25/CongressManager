import React, { useState, useEffect } from 'react';
import { FiTag, FiSettings, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { getTiposTrabajoApi, createTipoTrabajoApi, getRubricasApi, createRubricaApi } from '../../../api/adminApi';

export default function AjustesAcademicosModal({ idCongreso, nombreCongreso, initialTab = 'tipos', onClose }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tipos, setTipos] = useState([]);
    const [rubricas, setRubricas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTipo, setNewTipo] = useState('');
    const [newRubrica, setNewRubrica] = useState('');
    
    const accessToken = localStorage.getItem('congress_access');

    useEffect(() => {
        fetchData();
    }, [idCongreso]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tiposData, rubData] = await Promise.all([
                getTiposTrabajoApi(accessToken, idCongreso),
                getRubricasApi(accessToken, idCongreso)
            ]);
            setTipos(tiposData);
            setRubricas(rubData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTipo = async () => {
        if (!newTipo.trim()) return;
        try {
            await createTipoTrabajoApi(accessToken, { nombre: newTipo, id_congreso: idCongreso });
            setNewTipo('');
            fetchData();
        } catch (error) {
            alert("Error al crear tipo");
        }
    };

    const handleAddRubrica = async () => {
        if (!newRubrica.trim()) return;
        try {
            await createRubricaApi(accessToken, { nombre: newRubrica, id_congreso: idCongreso });
            setNewRubrica('');
            fetchData();
        } catch (error) {
            alert("Error al crear rúbrica");
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[600px] w-full max-w-2xl bg-white rounded-3xl overflow-hidden">
            {/* Header */}
            <header className="bg-black text-white p-6">
                <h2 className="text-xl font-bold uppercase tracking-tight">{nombreCongreso}</h2>
                <p className="text-xs text-gray-400 uppercase font-black mt-1">Ajustes Académicos</p>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('tipos')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tipos' ? 'border-b-4 border-[#005a6a] text-[#005a6a]' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    Tipos de Trabajo
                </button>
                <button 
                    onClick={() => setActiveTab('rubricas')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rubricas' ? 'border-b-4 border-[#005a6a] text-[#005a6a]' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    Rúbricas
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
                {loading ? (
                    <div className="flex justify-center p-10"><span className="loading loading-spinner text-[#005a6a]"></span></div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'tipos' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-2 mb-6">
                                    <input 
                                        value={newTipo}
                                        onChange={(e) => setNewTipo(e.target.value)}
                                        placeholder="Nuevo tipo (ej: Tesis, Poster...)"
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#005a6a] outline-none"
                                    />
                                    <button 
                                        onClick={handleAddTipo}
                                        className="bg-[#005a6a] text-white px-4 py-2 rounded-xl hover:brightness-110 transition-all active:scale-95"
                                    >
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                                <div className="grid gap-3">
                                    {tipos.map(t => (
                                        <div key={t.id_tipo_trabajo} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-[#005a6a]/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center"><FiTag size={14}/></div>
                                                <span className="text-sm font-bold text-gray-700">{t.nombre}</span>
                                            </div>
                                            <button className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <FiTrash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                    {tipos.length === 0 && <p className="text-center text-gray-400 text-sm italic py-10">No hay tipos de trabajo registrados.</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-2 mb-6">
                                    <input 
                                        value={newRubrica}
                                        onChange={(e) => setNewRubrica(e.target.value)}
                                        placeholder="Nombre de la nueva rúbrica..."
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#005a6a] outline-none"
                                    />
                                    <button 
                                        onClick={handleAddRubrica}
                                        className="bg-[#005a6a] text-white px-4 py-2 rounded-xl hover:brightness-110 transition-all active:scale-95"
                                    >
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                                <div className="grid gap-3">
                                    {rubricas.map(r => (
                                        <div key={r.id_rubrica} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-[#005a6a]/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center"><FiSettings size={14}/></div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700">{r.nombre}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black">{r.criterios?.length || 0} Criterios</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="text-gray-300 hover:text-[#005a6a] transition-colors"><FiSettings size={16}/></button>
                                                <button className="text-gray-300 hover:text-red-500 transition-colors"><FiTrash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {rubricas.length === 0 && <p className="text-center text-gray-400 text-sm italic py-10">No hay rúbricas registradas.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="p-6 bg-white border-t border-gray-100 flex justify-end">
                <button 
                    onClick={onClose}
                    className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-90 transition-all active:scale-95 shadow-lg"
                >
                    Cerrar
                </button>
            </footer>
        </div>
    );
}
