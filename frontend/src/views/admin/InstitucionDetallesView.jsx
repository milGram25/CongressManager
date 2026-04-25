import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiImage, FiMapPin, FiFlag, FiSave, FiTrash2 } from 'react-icons/fi';
import { getInstitucionesApi, createInstitucionApi, updateInstitucionApi } from '../../api/adminApi';
import { API_URL } from '../../api/constants';

export default function InstitucionDetallesView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const accessToken = localStorage.getItem('congress_access');

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        ubicacion: "",
        pais: "México",
        ruta_imagen: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!isNew) {
            fetchInstitucion();
        }
    }, [id]);

    const fetchInstitucion = async () => {
        try {
            const data = await getInstitucionesApi(accessToken);
            const inst = data.find(i => i.id_institucion === parseInt(id));
            if (inst) {
                setFormData({
                    nombre: inst.nombre,
                    ubicacion: inst.ubicacion || "",
                    pais: inst.pais || "México",
                    ruta_imagen: inst.ruta_imagen
                });
                if (inst.ruta_imagen) {
                    setPreviewImage(inst.ruta_imagen.startsWith('http') ? inst.ruta_imagen : `${API_URL}${inst.ruta_imagen}`);
                }
            }
        } catch (error) {
            console.error("Error al cargar institución:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre) {
            alert("El nombre de la institución es obligatorio.");
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                await createInstitucionApi(accessToken, formData);
            } else {
                await updateInstitucionApi(accessToken, id, formData);
            }
            navigate('/admin/ajustes/instituciones');
        } catch (error) {
            alert(error.message || "Error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header con navegación */}
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={() => navigate('/admin/ajustes/instituciones')}
                    className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
                    disabled={saving}
                >
                    <FiArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-bold uppercase tracking-tight">
                    {isNew ? 'Nueva Institución' : 'Editar Institución'}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Imagen */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm">
                        <label className="text-[10px] font-black text-base-content/30 uppercase tracking-[0.2em] mb-4 block ml-1">
                            Logotipo Institucional
                        </label>
                        
                        <div className="relative group aspect-square bg-base-200 rounded-2xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                            {previewImage ? (
                                <>
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <button 
                                            onClick={() => {setPreviewImage(null); setFormData(p => ({...p, imageFile: null}))}}
                                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl active:scale-90 transition-all"
                                            disabled={saving}
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="flex flex-col items-center gap-3 cursor-pointer p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center text-base-content/20">
                                        <FiImage size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-base-content/60">Subir imagen</p>
                                        <p className="text-[10px] text-base-content/30 uppercase font-black">PNG, JPG hasta 5MB</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={saving} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-base-100 p-8 md:p-10 rounded-3xl border border-base-300 shadow-sm space-y-8">
                        {/* Información General */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-base-content/70">Información General</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-base-content/40 uppercase tracking-widest ml-1">Nombre de la Institución</label>
                                    <input 
                                        name="nombre"
                                        type="text" 
                                        placeholder="Ej: Universidad de Guadalajara"
                                        className="w-full bg-base-200/50 border border-base-300 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
                                        value={formData.nombre} 
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-widest ml-1">Ubicación / Sede</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/30" />
                                            <input 
                                                name="ubicacion"
                                                type="text" 
                                                placeholder="Ej: Guadalajara, Jalisco"
                                                className="w-full bg-base-200/50 border border-base-300 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:bg-base-100 focus:border-primary outline-none transition-all" 
                                                value={formData.ubicacion} 
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-widest ml-1">País</label>
                                        <div className="relative">
                                            <FiFlag className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/30" />
                                            <input 
                                                name="pais"
                                                type="text" 
                                                placeholder="México"
                                                className="w-full bg-base-200/50 border border-base-300 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:bg-base-100 focus:border-primary outline-none transition-all" 
                                                value={formData.pais} 
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Botones de acción */}
                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-primary text-primary-content py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {saving ? <span className="loading loading-spinner loading-xs"></span> : <FiSave size={18} />} 
                                {isNew ? 'Registrar Institución' : 'Guardar Cambios'}
                            </button>
                            <button 
                                onClick={() => navigate('/admin/ajustes/instituciones')}
                                className="px-8 bg-base-200 text-base-content py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-base-300 active:scale-95 transition-all"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
