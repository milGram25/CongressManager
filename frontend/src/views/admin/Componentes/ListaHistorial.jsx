import { LuRefreshCcw } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import {useState} from "react";
import { LuDownload } from "react-icons/lu";
import { MdFilterListAlt } from "react-icons/md";
import { HiEye, HiPlay, HiCheck } from "react-icons/hi";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { IoWarningOutline } from "react-icons/io5";


export default function ListaHistorial({listaElementos, onSeleccionarAccion}){
    //lista íconos debe de tener tres elementos
    const listaAlt = 
        {
            alt1: "Importancia de rol",
            alt2: "Inmediatez temporal",
            alt3: "Importancia de acción"
            
        };
    const descripcion = "Aquí puede ver las acciones de todas las personas de la plataforma";
    const titulo = "Historial";
    const nombreBarraBusqueda = "Buscar persona";
    
    const [ordenarItem, setOrdenarItem] = useState("todos");
    const fechaActual = new Date();

    const [listaFiltrada,setListaFiltrada] = useState(listaElementos);
    const [valorInput, setValorInput] = useState("");

    
    
    function filtrar(valor){
        let resultado = [...listaElementos];
        setOrdenarItem(valor);

        switch(valor){
            case "iniciado":  resultado = resultado.filter((item) => fechaActual >= new Date(item.fecha_inicio));
            break;
            case "finalizado":  resultado = resultado.filter((item) => fechaActual >= new Date(item.fecha_final));
            break;
            case "asc":  resultado.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
            break;
            case "desc":  resultado.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
            break;
        }

        setListaFiltrada(resultado);
    };
    
    function busquedaInput(e) {
        const value = e.target.value;
        setValorInput(value);

        if (value.trim() === '') {
            setListaFiltrada(listaElementos);
            return;
        }

        busqueda(value);
    }

    // Esta función filtra la lista
    function busqueda(value) {
        const filtrados = listaElementos.filter((item) =>
            item.nombre.toLowerCase().includes(value.toLowerCase()) //todo en minúscula
        );
        setListaFiltrada(filtrados);
        
    }

    function restaurarBusqueda(){
        setValorInput("");
        setListaFiltrada(listaElementos);
    }

    function restaurarTodo(){
        setValorInput("");
        setListaFiltrada(listaElementos);
        setOrdenarItem("todos");
    }

    function handleColorFecha(fecha){
        const fechaActual = new Date();
        const fechaAccion = new Date(fecha);
        let color = "bg-red-500";
        const diferenciaDias = Math.abs(fechaActual-fechaAccion)/1000/60/60/24;

        if(diferenciaDias <= 1){
            color = "bg-green-500";   //hoy
        } else if(diferenciaDias <= 7){
            color = "bg-yellow-500";  //esta semana
        } else if(diferenciaDias <= 30){
            color = "bg-orange-500";  //este mes
        }

        return color;
    }

    function handleLejaniaFecha(fecha){
        const fechaActual = new Date();
        const fechaAccion = new Date(fecha);
        let lejania = "Mayor a un mes";
        const diferenciaDias = (fechaActual-fechaAccion)/1000/60/60/24;
        //alert(diferenciaDias);

        if(diferenciaDias <= 1){
            lejania = "Hoy";   //hoy
        } else if(diferenciaDias <= 7){
            lejania = "Esta semana";  //esta semana
        } else if(diferenciaDias <= 30){
            lejania = "Este mes";  //este mes
        }
        return lejania;
        
    }

    function handleColorImportancia(accion){

        /*
        rojo: crítico
        naranja: muy importante
        amarillo: medio importante
        verde: sin importancia
        */
        switch(accion){
            
            case "crear taller":
            case "borrar usuario":
            case "modificar fecha evento":
            case "crear congreso":
                return "bg-red-500";
                break;

            case "crear area general":
            case "crear subarea especifica":
                return "bg-orange-500";

            case "revisar resumen":
            case "revisar extenso":
            case "solicitar ponencia":
                return "bg-yellow-500";
                break;

            
            case "iniciar sesion":
            case "cerrar sesion":
            case "realizar pago":
                return "bg-green-500";
                break;
            default: return "bg-gray-500";
            
        }

    }

    function handleColorRol(rol){
        let color = "bg-green-500";

        switch(rol){
            case "comite academico":
                color = "bg-red-500";
            break;
            case "ponente":
                color = "bg-orange-500";
            break;
            case "tallerista":
                color = "bg-yellow-500";
            break;
            case "dictaminador":
                color = "bg-blue-500";
            break;
            case "evaluador":
                color = "bg-purple-500";
            break;
        }

        return color;

    }
    

    

    return(
        <div className="w-140 h-min-50 border border-b rounded-lg">
            {/*header*/}
            <div className="flex bg-black h-15 items-center rounded-t-lg">
                <div className="flex flex-1 bg-white m-2 border border-b h-10 rounded-full" title={"Barra de búsqueda"}>
                    <input className="w-full pl-5" type="text" placeholder={nombreBarraBusqueda} onChange={(e)=>busquedaInput(e)} value={valorInput}/>

                </div>
                <div className="flex gap-3 h-12 text-center bg-white border border-b items-center pl-2 pr-2 rounded-full mr-3">
                    
                    <div className="flex items-center w-10 h-10 rounded-full border border-b bg-black hover:bg-gray-500"  title={"Reiniciar búsqueda"}>
                        <FaRegTrashAlt className="text-white flex-1"  onClick={()=> restaurarBusqueda()}/>
                    </div>
                    <div className="flex items-center w-10 h-10 rounded-full border border-b bg-black hover:bg-gray-500 " title={"Restaurar a vista inicial"}>
                        <LuRefreshCcw className="text-white flex-1"  onClick={()=> restaurarTodo()}/>
                    </div>
                
                </div>

            </div>
            {/*descripción y título*/}
            <div className="flex h-min-12 flex m-4 pb-4 border-b border-b">
                <div className="w-90 pr-4">
                    <h1>{titulo}</h1>
                    <div className="ml-4 text-gray-500">
                         {descripcion}
                    </div>

                </div>
                <div className="flex flex-1">
                    <button>

                    </button>
                    <div className="flex gap-3 h-full items-center">
                        <button className="flex justify-center items-center bg-black rounded-full h-10 w-10 hover:bg-gray-500"  title={"Descargar en Excel"}>
                            <LuDownload className="flex text-white" />
                        </button>
                        <div className="flex h-12 pl-3 pr-3 items-center justify-center gap-3 bg-gray-200 rounded-full border border-b"   title={"Filtrar"}>
                            <div className="flex h-10 w-10 bg-black rounded-full items-center justify-center">
                                <MdFilterListAlt className="text-white"/>

                            </div>
                            <select value={ordenarItem} onChange={(e)=>filtrar(e.target.value)}>
                                <optgroup label="General">
                                    <option value="todos">Todos</option>

                                </optgroup>
                                <optgroup label="Rol">
                                    <option value="comite">Comité académico</option>
                                    <option value="ponente">Ponente</option>
                                    <option value="tallerista">Tallerista</option>
                                    <option value="dictaminador">Dictaminador</option>
                                    <option value="evaluador">Evaluador</option>
                                    <option value="asistente">Asistente</option>

                                </optgroup>
                                <optgroup label="Inmediatez temporal">
                                    <option value="hoy">Hoy</option>
                                    <option value="semana">Esta semana</option>
                                    <option value="mes">Este mes</option>

                                </optgroup>
                                <optgroup label="Importancia">
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baja">Baja</option>
                                    
                                </optgroup>
                                
                                
                                
                            </select>

                        </div>
                        
                        

                    </div>
                    

                </div>
                
                
                

            </div>
            {/*Lista de elementos actuales*/}
            <div>
                {
                listaFiltrada.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 ml-4 mr-4">
                        
                        {/* Botón ver detalles */}
                        <button 
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-500 transition-colors"  
                          title={"Ver detalles"}
                          onClick={() => onSeleccionarAccion && onSeleccionarAccion(item)}
                        >
                        <HiEye className="text-white text-xl" />
                        </button>

                        {/* Nombre */}
                        <h1 className="flex-1 ml-4 font-semibold text-gray-800">{item.nombre}</h1>

                        {/* Indicadores de fechas */}
                        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1">
                           {/*Rol */}
                            <div className={`w-3 h-3 rounded-full ${handleColorRol(item.rol)}`}></div>

                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black transition-colors"  title={"Rol: " + item.rol}>
                                <FaRegUserCircle className="text-white text-sm" />
                            </div>

                            {/*Inmediatez temporal */}
                            <div className={`w-3 h-3 rounded-full ${handleColorFecha(item.fecha)}`}></div>

                            {/*Importacia de acción*/}
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black transition-colors"  title={`Inmediatez temporal: ${handleLejaniaFecha(item.fecha)}`}>
                                <IoMdTime className="text-white text-sm" />
                            </div>

                            <div className={`w-3 h-3 rounded-full ${handleColorImportancia(item.accion)}`}></div>

                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black transition-colors"  title={"Acción (importancia): " + item.accion}>
                                <IoWarningOutline className="text-white text-sm" />
                            </div>
                        </div>

                    </div>
                    ))}
            </div>

        </div>

    );
}