import { RiPencilFill } from "react-icons/ri";

export default function DetallesCrearCongreso({detallesCongreso={nombre_congreso: "",
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
        descuento_otro_estudiante: "",

        cuenta_deposito: ""


}}){

    const congreso = 
    {
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
        descuento_otro_estudiante: "",

        cuenta_deposito: ""
    };

    
    

    return(
        

        <div className="grid grid-cols-3 grid-rows-16 w-full h-300">

            

            {/*header*/}
            <div className="col-span-3 row-span-1 flex bg-black rounded-t-xl text-white p-6">
                <p className="flex-3 text-xl">Ver y modificar detalles de congreso</p>
                <div className="flex flex-4 justify-end ">
                    <button className="flex items-center justify-center bg-black text-white hover:bg-gray-500 border-2 border-white rounded-full h-8 w-8">
                        <RiPencilFill />

                    </button>
                </div>

            </div>
            {/*Body*/}
            <div className="col-span-3 row-span-12 bg-white p-6">
                {/*Detalles*/}
                <div className="col-span-3 row-span-3 flex">
                    <div className=" flex-1">
                        <h2 className="text-lg font-bold">Congreso</h2>
                        
                        <div className="flex w-full">
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>

                        </div>
                        
                    </div>
                    

                </div>
                {/*Sede y evaluaciones*/}
                <div className="col-span-3 row-span-7 flex">
                    <div className="flex-2 border-r">
                        <h2 className="text-lg font-bold">Congreso</h2>
                        
                        <div className="flex w-full">
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>

                        </div>
                        
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold">Congreso</h2>
                        
                        <div className="flex w-full">
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col h-15 gap-1">
                                <label className="text-gray-500" htmlFor="nombre_congreso">Nombre del congreso</label>
                                <input id="nombre_congreso" className="ml-5 h-8 rounded-full bg-white border" value={detallesCongreso.nombre_congreso}/>
                            </div>

                        </div>
                        
                    </div>
                    

                </div>

                {/*Fecha y pagos*/}
                <div>
                    <div>

                    </div>
                    <div>

                    </div>
                </div>
            </div>
        </div>


    );
}