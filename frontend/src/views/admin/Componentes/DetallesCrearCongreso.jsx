import { RiPencilFill } from "react-icons/ri";
import { useState } from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


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


},listaRubricas, listaPreguntas}){
    const listaRubricasPrueba = [
        {
            nombre: "rúbrica 1"
        },
        {
            nombre: "rúbrica 2"
        },
        {
            nombre: "rúbrica 3"
        },
        {
            nombre: "rúbrica 4"
        }
    ];
    const listaTiposTrabajo = [
        {
            nombre: "Tesis"
        },
        {
            nombre: "Avances de investigación"
        },
        {
            nombre: "Otros laburos"
        }
    ];

    

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

    const [modificando, setModificando] = useState(true);

    function handleModificar(){

    }
    const [valorSelect, setValorSelect] = useState("1"); //que elija el que la base de datos determine
    

    return(
        
        <div className="bg-black bg-opacity-50 flex justify-center items-center rounded-xl border mb-10">

            <div className="w-full bg-white rounded-xl overflow-hidden">
                {/*header*/}

                <div className="bg-black text-white flex items-center px-6 py-4">
                    <p className="text-lg font-semibold flex-1">
                        Ver y modificar detalles de congreso
                    </p>
                    <div className="flex-1 flex justify-end">
                        
                        
                            {modificando?
                            <button onClick={(e)=>setModificando(!modificando)} className="border rounded-full p-2 hover:bg-gray-500 hover:cursor-pointer"> {/*Agregar funciones para editar */}
                                <RiPencilFill />
                            </button>:
                                
                            <div className="bg-white justify-end flex rounded-full">
                                
                                <button onClick={(e)=>setModificando(!modificando)} className="border bg-black rounded-full p-2 hover:bg-gray-500  hover:cursor-pointer"> {/*Agregar funciones para editar */}
                                    <RxCross2 />
                                </button>:
                                <button onClick={(e)=>setModificando(!modificando)} className="bg-black border rounded-full p-2 hover:bg-gray-500  hover:cursor-pointer"> {/*Agregar funciones para editar */}
                                    <IoIosCheckmark />
                                </button>:
                            </div>}
                        
                    </div>
                    
                </div>

                {/*Detalles de congreso, institución e imagen representativa*/}
                <div className="flex flex-col gap-6 border-b pb-4 m-5">
                    <p className="flex-1 font-semibold">Congreso</p>
                    <div className="flex flex-1 items-center gap-4">
                        <div className="flex-1">
                        
                            <label htmlFor="nombre_congreso" className="text-sm text-gray-500">
                                Nombre del congreso
                            </label>
                            <input id="nombre_congreso" className="w-full border rounded-full px-4 py-2"  readOnly={modificando}/>
                        </div>

                        <div className="flex-1">
                            
                            <label htmlFor="nombre_institucion" className="text-sm text-gray-500">
                                Nombre de la institución
                            </label>
                            <input id="nombre_institucion" className="w-full border rounded-full px-4 py-2 "  readOnly={modificando}/>
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Imagen representativa</p>
                            <div className="border rounded-full h-10"></div>
                        </div>

                    </div>
                    

                </div>
                {/*resto del body*/}

                <div className="p-6 grid grid-cols-3 gap-6">
                    {/*izquierdo*/}

                    <div className="col-span-2 flex flex-col gap-6">

                        

                        {/* Sede */}
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Sede</p>

                            <div>
                                <label htmlFor="nombre_sede" className="text-sm text-gray-500">
                                    Nombre de la sede
                                </label>
                                <input id="nombre_sede" className="w-full border rounded-full px-4 py-2"  readOnly={modificando}/>
                            </div>

                            <p className="font-semibold">Ubicación</p>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label htmlFor="pais" className="text-sm text-gray-500">País</label>
                                    <input id="pais" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="estado" className="text-sm text-gray-500">Estado</label>
                                    <input id="estado" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="ciudad" className="text-sm text-gray-500">Ciudad</label>
                                    <input id="ciudad" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="calle" className="text-sm text-gray-500">Calle</label>
                                    <input id="calle" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="num_ext" className="text-sm text-gray-500">Número exterior</label>
                                    <input id="num_ext" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="num_int" className="text-sm text-gray-500">Número interior</label>
                                    <input id="num_int" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                                </div>

                            </div>

                            <div>
                                <label htmlFor="modulo" className="text-sm text-gray-500">
                                    Módulo físico
                                </label>
                                <input id="modulo" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                            </div>
                        </div>
                    </div>

                    {/*derecho*/}
                    <div className="col-span-1 flex flex-col gap-6 border-l pl-6">

                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Evaluaciones</p>

                            <div>
                                <label htmlFor="tipo_trabajo" className="text-sm text-gray-500">
                                    Tipo de trabajo
                                </label>
                               <select value={valorSelect} className="w-full border rounded-full px-4 py-2 mb-2" name="lista_rubricas" onChange={(e) => {
                                    if (!modificando) {
                                        setValorSelect(e.target.value);
                                    } }}>
                                    {listaTiposTrabajo.map((item, index)=>(
                                        <option key={index}value={item.nombre}>{item.nombre} </option>
                                    ))}
                                    
                                </select>
                            </div>

                            <div>
                                <p className="font-semibold mb-3">Preguntas</p>
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500 w-full  hover:cursor-pointer">
                                    Ver preguntas
                                </button>
                            </div>

                            <div>
                                <p className="font-semibold  mb-3">Rúbrica</p>
                                <label htmlFor="nombre_rubrica" className="text-sm text-gray-500">
                                    Nombre
                                </label>
                                <select value={valorSelect} className="w-full border rounded-full px-4 py-2 mb-2" name="lista_rubricas" onChange={(e) => {
                                    if (!modificando) {
                                        setValorSelect(e.target.value);
                                    } }}>
                                    {listaRubricasPrueba.map((item, index)=>(
                                        <option key={index}value={item.nombre}>{item.nombre} </option>
                                    ))}
                                    
                                </select>
                                
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500 w-full  hover:cursor-pointer">
                                    Ver rúbrica
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR */}
                    <div className="col-span-3 grid grid-cols-3 gap-6 border-t pt-6">

                        {/*fechas*/}
                        <div className="flex flex-col gap-4 col-span-2">
                            <p className="font-semibold">Fechas</p>

                            {/*congreso*/}
                            <div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inicio y fin del congreso</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_congreso" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_congreso" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_congreso" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_congreso" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                    
                                    
                                
                            </div>

                            {/*ponencias*/}
                            <div className="flex flex-col gap-2">
                                <p className="font-medium mb-2">Ponencia</p>
                               
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Envío de ponencias</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_ponencia" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_ponencia" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_ponencia" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_ponencia" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inscripción dictaminadores</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_inscripcion_dictaminador" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_inscripcion_dictaminador" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_inscripcion_dictaminador" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_inscripcion_dictaminador" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Revisión de resúmenes</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_revision_resumenes" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_revision_resumenes" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_revision_resumenes" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_revision_resumenes" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Envío de extensos</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_envio_extensos" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_envio_extensos" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_envio_extensos" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_envio_extensos" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inscripción de evaluadores</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_inscripcion_evaluador" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_inscripcion_evaluador" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_inscripcion_evaluador" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_inscripcion_evaluador" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Revisión de extensos</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_revision_extensos" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_revision_extensos" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_revision_extensos" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_revision_extensos" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Subir multimedia</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_subir_multimedia" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_subir_multimedia" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_subir_multimedia" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_subir_multimedia" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>

                                
                            </div>
                            {/*pagos*/}
                            <div className="flex flex-col gap-2">
                                <p className="font-medium mb-2">Pagos</p>
                               
                                    <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Fecha de prepago</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_prepago" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_prepago" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_prepago" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_prepago" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Fecha de pagos normales</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inicio_pago_normal" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input id="inicio_pago_normal" type="datetime-local" className="border rounded-full px-4 py-2 w-60"  readOnly={modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="fin_pago_normal" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input id="fin_pago_normal" type="datetime-local" className="border rounded-full px-4 py-2 w-60" readOnly={modificando}/>
                                        </div>

                                    </div>

                                </div>
                                    
                                    
                                
                            </div>


                        </div>

                        {/*pagos*/}
                        <div className="col-span-1 flex flex-col gap-4 border-l pl-6">
                            <p className="font-semibold">Pagos</p>

                            <div className=" border-b pb-4">
                                <p className="font-medium">Costos</p>

                                <label htmlFor="costo_asistente" className="text-sm text-gray-500">Costo por asistente</label>
                                <input type="number" min="0" id="costo_asistente" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={modificando}/>

                                <label  htmlFor="costo_ponente" className="text-sm text-gray-500">Costo por ponente</label>
                                <input type="number" min="0" id="costo_ponente" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={modificando}/>

                                <label htmlFor="costo_comite" className="text-sm text-gray-500">Costo por comité</label>
                                <input type="number" min="0" id="costo_comite" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                            </div>
                            {/*Descuentos*/}

                            <div className=" border-b pb-4">
                                <p className="font-medium">Descuentos</p>

                                <label  htmlFor="prepago" className="text-sm text-gray-500">Descuento por prepago</label>
                                <input type="number" min="0" max="100" id="prepago" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={modificando}/>

                                <label  htmlFor="estudiante" className="text-sm text-gray-500">Descuento estudiante</label>
                                <input type="number" min="0" max="100" id="estudiante" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={modificando}/>

                            </div>

                            <div>
                                <p className="font-medium">Cuenta</p>
                                <label htmlFor="cuenta" className="text-sm text-gray-500">Cuenta de depósito</label>
                                <input id="cuenta" className="border rounded-full px-4 py-2 w-full"  readOnly={modificando}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    



    );
}