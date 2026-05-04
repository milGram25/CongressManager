import React, { useState } from 'react';
import { FiEdit2, FiImage, FiMapPin, FiFlag, FiCheck } from 'react-icons/fi';
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

const DetallesEditarInstitucion = ({ institucionData, onSave, onCancel }) => {
    const initialData = institucionData || {
        nombre_institucion: "",
        ubicacion: "",
        pais: "México",
        ruta_imagen: null
    };

    const [formData, setFormData] = useState(initialData);
    const [modificando, setModificando] = useState(!institucionData);

    function handleChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const inputClasses = `w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!modificando ? 'bg-base-200 cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`;
    const labelClasses = "text-[10px] font-bold text-base-content/40 mb-1 block ml-1 uppercase tracking-widest";

    return (
        <div className="w-full bg-base-100 rounded-3xl overflow-hidden font-sans">
            <div className='bg-primary text-primary-content flex items-center justify-between px-6 py-4 z-40 shadow-lg'>
                <h2 className="text-lg md:text-xl font-bold truncate pr-4 uppercase tracking-wider">
                    {institucionData ? 'Detalles de la Institución' : 'Nueva Institución'}
                </h2>
                <div className='flex items-center gap-2'>
                    {!modificando ? (
                        <button 
                            className="w-10 h-10 rounded-full bg-primary-content text-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer shadow-md" 
                            onClick={() => setModificando(true)}
                        >
                            <FiEdit2 size={18} />
                        </button>
                    ) : (
                        <div className='flex bg-base-100 rounded-full p-1 gap-1 shadow-inner'>
                            <button 
                                className="w-8 h-8 rounded-full bg-success text-success-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" 
                                onClick={() => {
                                    if(onSave) onSave(formData);
                                    setModificando(false);
                                }}
                            >
                                <IoIosCheckmark size={24} />
                            </button>
                            <button 
                                className="w-8 h-8 rounded-full bg-error text-error-content flex items-center justify-center hover:brightness-110 transition-all active:scale-95 cursor-pointer" 
                                onClick={() => {
                                    if(onCancel) onCancel();
                                    setModificando(false);
                                }}
                            >
                                <RxCross2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className={labelClasses}>Nombre de la Institución</label>
                        <input 
                            id="nombre_institucion" 
                            type="text" 
                            placeholder="Nombre oficial..."
                            className={inputClasses} 
                            value={formData.nombre_institucion} 
                            onChange={handleChange} 
                            readOnly={!modificando}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Ubicación / Ciudad</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiMapPin /></span>
                                <input 
                                    id="ubicacion" 
                                    type="text" 
                                    placeholder="Ej: Guadalajara, Jal."
                                    className={`${inputClasses} pl-11`} 
                                    value={formData.ubicacion} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>País</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><FiFlag /></span>
                                <input 
                                    id="pais" 
                                    type="text" 
                                    placeholder="México"
                                    className={`${inputClasses} pl-11`} 
                                    value={formData.pais} 
                                    onChange={handleChange} 
                                    readOnly={!modificando}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Logotipo / Imagen</label>
                        <div className={`flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-6 transition-all ${modificando ? 'hover:border-primary/30 cursor-pointer' : 'opacity-70'}`}>
                            <FiImage size={32} className="text-base-content/20 mb-2" />
                            <p className="text-xs text-base-content/40 font-bold uppercase">Subir Imagen</p>
                            {modificando && <input type="file" className="hidden" accept="image/*" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallesEditarInstitucion;
