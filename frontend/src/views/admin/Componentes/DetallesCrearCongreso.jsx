import { RiPencilFill } from "react-icons/ri";
import { useState } from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


export default function DetallesCrearCongreso({indexDatosModal,listaRubricas, listaPreguntas, modificandoDatos=false}){
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
        nombre_congreso: "CIENU 2026",
        nombre_institucion: "CIENU",
        imagen_institucion: "ruta",

        nombre_sede: "CUALTOS",

        pais: "MÉXICO",
        estado: "JALISCO",
        ciudad: "TEPATITLÁN",
        calle: "AV RAFAEL",
        numero_exterior: "100",
        numero_interior: "",
        modulo_fisico: "EDIFICIO G-202",

        tipo_trabajo: "Avances de tesis",
        preguntas_referencia: "1",
        rubrica_nombre: "buena rúbrica",
        rubrica_referencia: "1",

        congreso_inicio: "2026-04-11T20:00",
        congreso_fin: "2026-04-13T20:00",

        envio_ponencias_inicio: "2026-04-13T20:00",
        envio_ponencias_fin: "2026-04-13T20:00",
        inscripcion_dictaminadores_inicio: "2026-04-13T20:00",
        inscripcion_dictaminadores_fin: "2026-04-13T20:00",
        revision_resumenes_inicio: "2026-04-13T20:00",
        revision_resumenes_fin: "2026-04-13T20:00",
        envio_extensos_inicio: "2026-04-13T20:00",
        envio_extensos_fin: "2026-04-13T20:00",
        inscripcion_evaluadores_inicio: "2026-04-13T20:00",
        inscripcion_evaluadores_fin: "2026-04-13T20:00",
        revision_extensos_inicio: "2026-04-13T20:00",
        revision_extensos_fin: "2026-04-13T20:00",
        subir_multimedia_inicio: "2026-04-13T20:00",
        subir_multimedia_fin: "2026-04-13T20:00",

        prepago_inicio: "2026-04-13T20:00",
        prepago_fin: "2026-04-13T20:00",
        pagos_normales_inicio: "2026-04-13T20:00",
        pagos_normales_fin: "2026-04-13T20:00",

        costo_asistente: "100",
        costo_ponente: "200",
        costo_miembro_comite: "300",

        descuento_prepago: "10",
        descuento_estudiante: "50",
        

        cuenta_deposito: "123456789"
    };

    const [formData, setFormData] = useState(congreso);
    const [modificando, setModificando] = useState(modificandoDatos);

    function handleChange(e){
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    const [valorSelect, setValorSelect] = useState("1");
    

    return(
        
        <div className="flex justify-center items-center rounded-xl border mb-10">

            <div className="w-full bg-white rounded-xl">
                {/*header*/}

                <div className="sticky top-0 bg-black text-white flex items-center px-6 py-4 z-40 rounded-t-lg">
                    <p className="text-lg font-semibold flex-1">
                        Ver y modificar detalles de congreso
                    </p>
                    <div className="flex-1 flex justify-end">
                        
                        
                            {!modificando?(
                            <button onClick={(e)=>setModificando(!modificando)} className="border rounded-full p-2 hover:bg-gray-500 hover:cursor-pointer">
                                <RiPencilFill />
                            </button>):(                                
                            <div className="bg-white justify-end flex rounded-full gap-2">
                                
                                <button onClick={(e)=>setModificando(!modificando)} className="border bg-black rounded-full p-2 hover:bg-gray-500  hover:cursor-pointer">
                                    <RxCross2 /> {/*Implementar lógica para que no se guarden los datos */}
                                </button>
                                <button onClick={(e)=>setModificando(!modificando)} className="bg-black border rounded-full p-2 hover:bg-gray-500  hover:cursor-pointer">
                                    <IoIosCheckmark /> {/*Implementar lógica para que se guarden los datos */}
                                </button>
                            </div>)}
                        
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
                            <input value={formData.nombre_congreso} id="nombre_congreso" onChange={handleChange} className="w-full border rounded-full px-4 py-2"  readOnly={!modificando}/>
                        </div>

                        <div className="flex-1">
                            
                            <label htmlFor="nombre_institucion" className="text-sm text-gray-500">
                                Nombre de la institución
                            </label>
                            <input value={formData.nombre_institucion} id="nombre_institucion" onChange={handleChange} className="w-full border rounded-full px-4 py-2 "  readOnly={!modificando}/>
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
                                <input value={formData.nombre_sede} id="nombre_sede" onChange={handleChange} className="w-full border rounded-full px-4 py-2"  readOnly={!modificando}/>
                            </div>

                            <p className="font-semibold">Ubicación</p>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label htmlFor="pais" className="text-sm text-gray-500">País</label>
                                    <input value={formData.pais} id="pais" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="estado" className="text-sm text-gray-500">Estado</label>
                                    <input value={formData.estado}  id="estado" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="ciudad" className="text-sm text-gray-500">Ciudad</label>
                                    <input value={formData.ciudad}  id="ciudad" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="calle" className="text-sm text-gray-500">Calle</label>
                                    <input value={formData.calle}  id="calle" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="numero_exterior" className="text-sm text-gray-500">Número exterior</label>
                                    <input value={formData.numero_exterior} id="numero_exterior" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                                <div>
                                    <label htmlFor="numero_interior" className="text-sm text-gray-500">Número interior</label>
                                    <input value={formData.numero_interior} id="numero_interior" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                                </div>

                            </div>

                            <div>
                                <label htmlFor="modulo_fisico" className="text-sm text-gray-500">
                                    Módulo físico
                                </label>
                                <input value={formData.modulo_fisico} id="modulo_fisico" onChange={handleChange} className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                            </div>
                        </div>
                    </div>

                    {/*sección derecha*/}
                    <div className="col-span-1 flex flex-col gap-6 border-l pl-6">

                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Evaluaciones</p>

                            <div>
                                <label htmlFor="tipo_trabajo" className="text-sm text-gray-500">
                                    Tipo de trabajo
                                </label>
                               <select id="tipo_trabajo" value={formData.tipo_trabajo}  className="w-full border rounded-full px-4 py-2 mb-2" name="lista_rubricas" onChange={handleChange} disabled={!modificando}>
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
                                <label htmlFor="rubrica_referencia" className="text-sm text-gray-500">
                                    Nombre
                                </label>
                                <select id="rubrica_referencia" value={formData.rubrica_referencia}  className="w-full border rounded-full px-4 py-2 mb-2" name="lista_rubricas" onChange={handleChange} disabled={!modificando}>
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

                    
                    <div className="col-span-3 grid grid-cols-3 gap-6 border-t pt-6">

                        {/*fechas*/}
                        <div className="flex flex-col gap-4 col-span-2">
                            <p className="font-semibold">Fechas</p>

                            {/*congreso*/}
                            <div>
                                <p className="font-medium mb-2">Congreso</p>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inicio y fin del congreso</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="congreso_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.congreso_inicio}  id="congreso_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="congreso_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.congreso_fin} id="congreso_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                    
                                    
                                
                            </div>

                            {/*ponencias*/}
                            <div className="flex flex-col gap-2">
                                <p className="font-medium mb-2">Ponencias</p>
                               
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Envío de ponencias</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="envio_ponencias_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.envio_ponencias_inicio} id="envio_ponencias_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="envio_ponencias_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.envio_ponencias_fin} id="envio_ponencias_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inscripción dictaminadores</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inscripcion_dictaminadores_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.inscripcion_dictaminadores_inicio} id="inscripcion_dictaminadores_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="inscripcion_dictaminadores_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.inscripcion_dictaminadores_fin} id="inscripcion_dictaminadores_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Revisión de resúmenes</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="revision_resumenes_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.revision_resumenes_inicio} id="revision_resumenes_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="revision_resumenes_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.revision_resumenes_fin} id="revision_resumenes_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Envío de extensos</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="envio_extensos_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.envio_extensos_inicio} id="envio_extensos_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="envio_extensos_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.envio_extensos_fin} id="envio_extensos_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Inscripción de evaluadores</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="inscripcion_evaluadores_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.inscripcion_evaluadores_inicio} id="inscripcion_evaluadores_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="inscripcion_evaluadores_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.inscripcion_evaluadores_fin} id="inscripcion_evaluadores_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Revisión de extensos</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="revision_extensos_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.revision_extensos_inicio} id="revision_extensos_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="revision_extensos_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.revision_extensos_fin} id="revision_extensos_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Subir multimedia</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="subir_multimedia_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.subir_multimedia_inicio} id="subir_multimedia_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="subir_multimedia_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.subir_multimedia_fin} id="subir_multimedia_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
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
                                            <label htmlFor="prepago_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.prepago_inicio} id="prepago_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="prepago_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.prepago_fin} id="prepago_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
                                        </div>

                                    </div>

                                </div>
                                <div className="">
                                    <p className="text-sm mb-1 text-gray-500 ml-2">Fecha de pagos normales</p>
                                    <div className="flex gap-4 ml-5">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className=" h-2 w-2 bg-green-500 rounded-full border"></div>
                                            <label htmlFor="pagos_normales_inicio" className="text-sm text-gray-500 flex-1">Inicio</label>
                                            <input value={formData.pagos_normales_inicio} id="pagos_normales_inicio" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8"  readOnly={!modificando}/>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-500 rounded-full border"></div>
                                            <label htmlFor="pagos_normales_fin" className="text-sm text-gray-500 flex-1">Fin</label>
                                            <input value={formData.pagos_normales_fin} id="pagos_normales_fin" onChange={handleChange} type="datetime-local" className="border rounded-full px-4 py-2 flex-8" readOnly={!modificando}/>
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
                                <input value={formData.costo_asistente} onChange={handleChange} type="number" min="0" id="costo_asistente" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={!modificando}/>

                                <label  htmlFor="costo_ponente" className="text-sm text-gray-500">Costo por ponente</label>
                                <input value={formData.costo_ponente} onChange={handleChange} type="number" min="0" id="costo_ponente" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={!modificando}/>

                                <label htmlFor="costo_miembro_comite" className="text-sm text-gray-500">Costo por comité</label>
                                <input value={formData.costo_miembro_comite} onChange={handleChange} type="number" min="0" id="costo_miembro_comite" className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                            </div>
                            {/*Descuentos*/}

                            <div className=" border-b pb-4">
                                <p className="font-medium">Descuentos</p>

                                <label  htmlFor="descuento_prepago" className="text-sm text-gray-500">Descuento por prepago</label>
                                <input value={formData.descuento_prepago} onChange={handleChange} type="number" min="0" max="100" id="descuento_prepago" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={!modificando}/>

                                <label  htmlFor="descuento_estudiante" className="text-sm text-gray-500">Descuento estudiante</label>
                                <input value={formData.descuento_estudiante} onChange={handleChange} type="number" min="0" max="100" id="descuento_estudiante" className="border rounded-full px-4 py-2 w-full mb-2"  readOnly={!modificando}/>

                            </div>

                            <div>
                                <p className="font-medium">Cuenta</p>
                                <label htmlFor="cuenta_deposito" className="text-sm text-gray-500">Cuenta de depósito</label>
                                <input value={formData.cuenta_deposito} onChange={handleChange} id="cuenta_deposito" className="border rounded-full px-4 py-2 w-full"  readOnly={!modificando}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    



    );
}