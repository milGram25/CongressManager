import { AiFillEdit } from "react-icons/ai";
import { FaRegTrashAlt } from "react-icons/fa";
import {useState} from "react";
import { LuDownload } from "react-icons/lu";
import { MdFilterListAlt } from "react-icons/md";
import { HiEye, HiPlay, HiCheck } from "react-icons/hi";


export default function ListaElementosGenerica({listaCongresos}){
    //lista íconos debe de tener tres elementos
    const [ordenarItem, setOrdenarItem] = useState("todos");
    const fechaActual = new Date();
    
    const listaFiltrada = () => {
        let resultado = [...listaCongresos];

        switch(ordenarItem){
            case "iniciado":  resultado = resultado.filter((item) => fechaActual >= new Date(item.fecha_inicio));
            break;
            case "finalizado":  resultado = resultado.filter((item) => fechaActual >= new Date(item.fecha_final));
            break;
            case "asc":  resultado.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
            break;
            case "desc":  resultado.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
            break;
        }

        return resultado;
    };

    return(
        <div className="w-140 h-min-50 border border-b rounded-lg">
            {/*header*/}
            <div className="flex bg-black h-15 items-center rounded-t-lg">
                <div className="flex flex-1 bg-white m-2 border border-b h-10 rounded-full">
                    <input className="w-full pl-5" type="text" placeholder="Buscar congreso"/>

                </div>
                <div className="flex gap-3 h-12 text-center bg-white border border-b items-center pl-2 pr-2 rounded-full mr-3">
                    <button className="flex items-center justify-center w-10 h-10 rounded-full border border-b bg-black hover:bg-gray-500 ">
                        <AiFillEdit className="text-white flex-1"/>
                    </button>
                    <button className="flex items-center w-10 h-10 rounded-full border border-b bg-black hover:bg-gray-500 ">
                        <FaRegTrashAlt className="text-white flex-1" />
                    </button>
                
                </div>

            </div>
            {/*descripción y título*/}
            <div className="flex h-min-12 flex m-4 pb-4 border-b border-b">
                <div className="w-90 pr-4">
                    <h1>Congresos asignados</h1>
                    <div className="ml-4 text-gray-500">
                         Aquí se pueden encontrar todos los congresos creados por esta institución
                    </div>

                </div>
                <div className="flex flex-1">
                    <button>

                    </button>
                    <div className="flex gap-3 h-full items-center">
                        <button className="flex justify-center items-center bg-black rounded-full h-10 w-10 hover:bg-gray-500">
                            <LuDownload className="flex text-white" />
                        </button>
                        <div className="flex h-12 pl-3 pr-3 items-center justify-center gap-3 bg-gray-200 rounded-full border border-b">
                            <div className="flex h-10 w-10 bg-black rounded-full items-center justify-center">
                                <MdFilterListAlt className="text-white"/>

                            </div>
                            <select value={ordenarItem} onChange={(e)=>setOrdenarItem(e.target.value)}>
                                <optgroup label="General">
                                    <option value="todos">Todos</option>

                                </optgroup>
                                <optgroup label="Orden">
                                    <option value="desc">Recientes</option>
                                    <option value="asc">Antiguos</option>

                                </optgroup>
                                <optgroup label="Fechas">
                                    <option value="iniciado">Iniciados</option>
                                    <option value="finalizado">Finalizados</option>
                                    
                                </optgroup>
                                
                                
                                
                            </select>

                        </div>
                        
                        

                    </div>
                    

                </div>
                
                
                

            </div>
            {/*Lista de congresos actuales*/}
            <div>
                {listaFiltrada().map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 ml-4 mr-4">
                        
                        {/* Botón ver detalles */}
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-500 transition-colors">
                        <HiEye className="text-white text-xl" />
                        </button>

                        {/* Nombre */}
                        <h1 className="flex-1 ml-4 font-semibold text-gray-800">{item.nombre}</h1>

                        {/* Indicadores de fechas */}
                        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1">
                        {/* Punto fecha_inicio */}
                        <div className={`w-3 h-3 rounded-full ${fechaActual >= new Date(item.fecha_inicio) ? "bg-green-500" : "bg-red-500"}`}></div>

                        {/* Botón play */}
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-black transition-colors">
                            <HiPlay className="text-white text-sm" />
                        </button>

                        {/* Punto fecha_fin */}
                        <div className={`w-3 h-3 rounded-full ${fechaActual >= new Date(item.fecha_fin) ? "bg-green-500" : "bg-red-500"}`}></div>

                        {/* Botón check */}
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-black transition-colors">
                            <HiCheck className="text-white text-sm" />
                        </button>
                        </div>

                    </div>
                    ))}
            </div>

        </div>

    );
}