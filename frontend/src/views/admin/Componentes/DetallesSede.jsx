import { RiPencilFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { updateSedeApi } from "../../../api/adminApi";

export default function DetallesSede({ idSede, detalles, onUpdate }) {
    const [modificando, setModificando] = useState(false);
    const [formData, setFormData] = useState(detalles);
    const accessToken = localStorage.getItem('congress_access');

    useEffect(() => {
        setFormData(detalles);
    }, [detalles]);

    const handleChange = (campo, valor) => {
        setFormData(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleSave = async () => {
        try {
            await updateSedeApi(accessToken, idSede, {
                nombre_sede: formData.nombre,
                pais: formData.pais,
                estado: formData.estado,
                ciudad: formData.ciudad,
                calle: formData.calle,
                num_exterior: formData.num_exterior,
                num_interior: formData.num_interior,
                modulo_fisico: formData.mod_fisico
            });
            alert("Sede actualizada correctamente.");
            setModificando(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert("Error al actualizar sede.");
        }
    };

    const handleCancel = () => {
        setFormData(detalles);
        setModificando(false);
    };

    return (
        <div className="w-full mb-10 animate-in slide-in-from-top duration-500">
            <div className="flex items-center p-6 bg-black text-white rounded-t-[32px] shadow-lg">
                <p className="text-xl font-bold uppercase tracking-tight">Detalles de sede</p>
                <div className="flex flex-1 justify-end">
                    {!modificando ? (
                        <button
                            className="flex justify-center rounded-2xl h-10 w-10 bg-white/10 text-white border border-white/20 items-center hover:bg-white hover:text-black transition-all cursor-pointer shadow-md"
                            onClick={() => setModificando(true)}
                        >
                            <RiPencilFill size={20} />
                        </button>
                    ) : (
                        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10 gap-2">
                            <button
                                className="flex justify-center rounded-xl h-9 w-9 bg-black/40 text-white items-center hover:bg-red-500 transition-all cursor-pointer"
                                onClick={handleCancel}
                            >
                                <RxCross2 size={20} />
                            </button>
                            <button
                                className="flex justify-center rounded-xl h-9 w-9 bg-white text-black items-center hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                                onClick={handleSave}
                            >
                                <IoIosCheckmark size={28} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full grid bg-white border border-gray-100 rounded-b-[32px] shadow-sm p-8">
                <div className="border-b border-gray-100 pb-6 mb-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Información del Edificio</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <p className="w-full md:w-40 text-sm font-bold text-gray-600">Nombre del edificio</p>
                        <input
                            className={`flex-1 w-full bg-gray-50 border border-transparent rounded-2xl h-12 px-6 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white shadow-inner' : 'cursor-default'}`}
                            readOnly={!modificando}
                            value={formData.nombre || ""}
                            onChange={(e) => handleChange("nombre", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ubicación Geográfica</p>
                        
                        <div className="flex items-center gap-4">
                            <p className="w-24 text-xs font-bold text-gray-500 uppercase">País</p>
                            <input
                                className={`flex-1 bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                readOnly={!modificando}
                                value={formData.pais || ""}
                                onChange={(e) => handleChange("pais", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <p className="w-24 text-xs font-bold text-gray-500 uppercase">Estado</p>
                            <input
                                className={`flex-1 bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                readOnly={!modificando}
                                value={formData.estado || ""}
                                onChange={(e) => handleChange("estado", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <p className="w-24 text-xs font-bold text-gray-500 uppercase">Ciudad</p>
                            <input
                                className={`flex-1 bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                readOnly={!modificando}
                                value={formData.ciudad || ""}
                                onChange={(e) => handleChange("ciudad", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Dirección y Referencia</p>
                        
                        <div className="flex items-center gap-4">
                            <p className="w-24 text-xs font-bold text-gray-500 uppercase">Calle</p>
                            <input
                                className={`flex-1 bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                readOnly={!modificando}
                                value={formData.calle || ""}
                                onChange={(e) => handleChange("calle", e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Ext.</p>
                                <input
                                    className={`w-full bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                    readOnly={!modificando}
                                    value={formData.num_exterior || ""}
                                    onChange={(e) => handleChange("num_exterior", e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Int.</p>
                                <input
                                    className={`w-full bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                    readOnly={!modificando}
                                    value={formData.num_interior || ""}
                                    onChange={(e) => handleChange("num_interior", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <p className="w-24 text-xs font-bold text-gray-500 uppercase">Mód. fís.</p>
                            <input
                                className={`flex-1 bg-gray-50 border border-transparent rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all ${modificando ? 'border-gray-200 bg-white' : ''}`}
                                readOnly={!modificando}
                                value={formData.mod_fisico || ""}
                                onChange={(e) => handleChange("mod_fisico", e.target.value)}
                                placeholder="Ej: Edificio G, Salón 205"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
