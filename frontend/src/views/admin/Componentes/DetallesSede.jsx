import { RiPencilFill } from "react-icons/ri";
import { useState } from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export default function DetallesSede({
    detalles = {
        nombre: "Cualtos",
        pais: "México",
        estado: "Jalisco",
        ciudad: "Tepayork",
        calle: "Av. Ricardo Alcalá",
        num_exterior: "100",
        num_interior: "15",
        mod_fisico: "Edificio G-205",
        cuenta_deposito: "123456789",
        costo_evento: 1000,
        descuento_prepago: 10,
        descuento_estudiante: 50,
        tipo_moneda: "MXN"
    }
}) {

    const [modificando, setModificando] = useState(true);
    const [formData, setFormData] = useState(detalles);

    const handleChange = (campo, valor) => {
        setFormData(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    return (

        <div className="w-full mb-10">
            <div className="flex items-center p-6 bg-black text-white rounded-t-lg">
                <p className="text-xl font-bold">Detalles de sede</p>
                <div className="flex flex-1 justify-end">
                    {modificando === true ? (

                        <button
                            className="flex justify-center rounded-full h-8 w-8 border-2 bg-black text-white border border-white items-center mr-4 hover:bg-gray-500 cursor-pointer transition-colors"
                            onClick={() => setModificando(!modificando)}
                        >
                            <RiPencilFill />


                        </button>) : (
                        <div className="flex bg-white rounded-full mr-4">
                            <button
                                className="flex justify-center rounded-full h-8 w-8 border-2 bg-black text-white items-center  hover:bg-gray-500 cursor-pointer"
                                onClick={() => setModificando(!modificando)}
                            >
                                <RxCross2 />


                            </button>
                            <button
                                className="flex justify-center rounded-full h-8 w-8 border-2 bg-black text-white   items-center hover:bg-gray-500 cursor-pointer"
                                onClick={() => setModificando(!modificando)}
                            >
                                <IoIosCheckmark />


                            </button>
                        </div>


                    )}

                </div>
            </div>


            <div className="w-full grid border rounded-b-lg">
                <div className="border-b p-4 mb-4 w-full">
                    <p className="text-gray-500">
                        Detalles del edificio
                    </p>
                    <div className="flex flex-1 items-center gap-4 h-15">
                        <p className="flex-1 text-center pl-4">Nombre del edificio</p>
                        <input
                            className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                            readOnly={modificando}
                            value={formData.nombre}
                            onChange={(e) => handleChange("nombre", e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex">
                    <div className="grid flex-1  pr-4 pl-4 pb-4">
                        <p className="pl-4 text-gray-500">Lugar</p>
                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">País</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.pais}
                                onChange={(e) => handleChange("pais", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">Estado</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.estado}
                                onChange={(e) => handleChange("estado", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">Ciudad</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.ciudad}
                                onChange={(e) => handleChange("ciudad", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">Calle</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.calle}
                                onChange={(e) => handleChange("calle", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">Núm. ext.</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.num_exterior}
                                onChange={(e) => handleChange("num_exterior", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-1 text-center">Núm. int.</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.num_interior}
                                onChange={(e) => handleChange("num_interior", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15">
                            <p className="flex-1 text-center">Mód. fís.</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.mod_fisico}
                                onChange={(e) => handleChange("mod_fisico", e.target.value)}
                            />
                        </div>
                    </div>

                    {/*<div className="grid flex-1 content-start pr-4 pl-4">
                        <p className="pl-4 text-gray-500">Otros detalles</p>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-2 text-center">Cuenta depósito</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.cuenta_deposito}
                                onChange={(e) => handleChange("cuenta_deposito", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-2 text-center">Costo evento ({formData.tipo_moneda})</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.costo_evento}
                                onChange={(e) => handleChange("costo_evento", e.target.value)}
                                type="number"
                                min="0"
                                
                            />
                        </div>

                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-2 text-center">Descuento prepago (%)</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.descuento_prepago}
                                onChange={(e) => handleChange("descuento_prepago", e.target.value)}
                                type="number"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="flex items-center gap-4 h-15 border-b border-gray-200">
                            <p className="flex-2 text-center">Descuento estudiante (%)</p>
                            <input
                                className="flex-[5] bg-white rounded-full h-10 pl-4 border"
                                readOnly={modificando}
                                value={formData.descuento_estudiante}
                                onChange={(e) => handleChange("descuento_estudiante", e.target.value)}
                                type="number"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>*/}
                </div>
            </div>
        </div>
    );
}