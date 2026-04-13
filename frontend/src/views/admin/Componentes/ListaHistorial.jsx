import { LuRefreshCcw, LuDownload } from "react-icons/lu";
import { FaRegTrashAlt, FaRegUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MdFilterListAlt, MdAccessTime, MdInfoOutline } from "react-icons/md";
import { HiEye } from "react-icons/hi";

export default function ListaHistorial({ listaElementos }) {
    const [ordenarItem, setOrdenarItem] = useState("todos");
    const [listaFiltrada, setListaFiltrada] = useState(listaElementos);
    const [valorInput, setValorInput] = useState("");
    const fechaActual = new Date();

    // Sincronizar cuando la lista padre cambia (por las pestañas)
    useEffect(() => {
        setListaFiltrada(listaElementos);
    }, [listaElementos]);

    function busquedaInput(e) {
        const value = e.target.value;
        setValorInput(value);
        if (value.trim() === '') {
            setListaFiltrada(listaElementos);
            return;
        }
        const filtrados = listaElementos.filter((item) =>
            item.nombre.toLowerCase().includes(value.toLowerCase())
        );
        setListaFiltrada(filtrados);
    }

    function handleColorFecha(fecha) {
        const fechaAccion = new Date(fecha);
        const diferenciaDias = Math.abs(fechaActual - fechaAccion) / 1000 / 60 / 60 / 24;
        if (diferenciaDias <= 1) return "bg-green-500";
        if (diferenciaDias <= 7) return "bg-yellow-500";
        if (diferenciaDias <= 30) return "bg-orange-500";
        return "bg-red-500";
    }

    function handleColorImportancia(accion) {
        switch (accion) {
            case "crear taller":
            case "borrar usuario":
            case "modificar fecha evento":
            case "crear congreso": return "bg-red-500";
            case "crear area general":
            case "crear subarea especifica": return "bg-orange-500";
            case "revisar resumen":
            case "revisar extenso":
            case "solicitar ponencia": return "bg-yellow-500";
            case "emisión de factura":
            case "emisión de constancia":
            case "realizar pago": return "bg-green-500";
            default: return "bg-gray-400";
        }
    }

    function handleColorRol(rol) {
        const r = rol.toLowerCase();
        if (r.includes("comite")) return "bg-red-500";
        if (r.includes("ponente")) return "bg-orange-500";
        if (r.includes("tallerista")) return "bg-yellow-500";
        if (r.includes("dictaminador")) return "bg-blue-500";
        if (r.includes("evaluador")) return "bg-purple-500";
        return "bg-green-500";
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Toolbar superior estilizada con bordes resaltados */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <input 
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm transition-all bg-white" 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        onChange={busquedaInput} 
                        value={valorInput}
                    />
                    <FaRegTrashAlt 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                        onClick={() => { setValorInput(""); setListaFiltrada(listaElementos); }}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-sm flex-1 sm:flex-none">
                        <MdFilterListAlt className="text-[#005a6a] text-lg" />
                        <select 
                            className="bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer w-full"
                            value={ordenarItem} 
                            onChange={(e) => setOrdenarItem(e.target.value)}
                        >
                            <option value="todos">Todos los roles</option>
                            <option value="hoy">Hoy</option>
                            <option value="importancia">Alta importancia</option>
                        </select>
                    </div>

                    <button className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-all active:scale-95" title="Descargar reporte">
                        <LuDownload />
                    </button>
                    <button 
                        className="p-2.5 bg-[#005a6a] border border-[#005a6a] text-white rounded-xl hover:bg-[#004a5a] shadow-sm transition-all active:scale-95"
                        onClick={() => { setValorInput(""); setListaFiltrada(listaElementos); setOrdenarItem("todos"); }}
                        title="Refrescar lista"
                    >
                        <LuRefreshCcw />
                    </button>
                </div>
            </div>

            {/* Listado Fluido con filas resaltadas */}
            <div className="flex flex-col gap-3 mt-2">
                {listaFiltrada.length > 0 ? (
                    listaFiltrada.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#005a6a]/40 hover:bg-gray-50/50 transition-all shadow-sm">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[#005a6a] group-hover:scale-110 transition-all shadow-sm">
                                    <FaRegUserCircle className="text-xl" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.nombre}</h4>
                                    <p className="text-[11px] text-[#005a6a] font-bold uppercase mt-0.5 tracking-wide">{item.accion}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                                {/* Indicadores en cápsula */}
                                <div className="hidden md:flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm group-hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-2" title={`Rol: ${item.rol}`}>
                                        <div className={`w-2 h-2 rounded-full ${handleColorRol(item.rol)}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.rol}</span>
                                    </div>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5" title="Temporalidad">
                                        <div className={`w-2 h-2 rounded-full ${handleColorFecha(item.fecha)}`}></div>
                                        <MdAccessTime className="text-gray-500 text-sm" />
                                    </div>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5" title="Importancia">
                                        <div className={`w-2 h-2 rounded-full ${handleColorImportancia(item.accion)}`}></div>
                                        <MdInfoOutline className="text-gray-500 text-sm" />
                                    </div>
                                </div>

                                <button className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#005a6a] hover:text-white hover:border-[#005a6a] transition-all shadow-sm active:scale-90" title="Ver detalles">
                                    <HiEye className="text-lg" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-gray-400 italic bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                        No se encontraron registros que coincidan con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
