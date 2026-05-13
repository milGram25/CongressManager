import { FaRegTrashAlt, FaRegUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MdFilterListAlt, MdAccessTime, MdInfoOutline } from "react-icons/md";
import { HiEye } from "react-icons/hi";
import VistaPreviewDocumento from "./VistaPreviewDocumento";


export default function ListaHistorial({ listaElementos, mostrarIndicadores = true, mostrarRol = false, mostrarInfoFecha = false, etiquetaFecha = "Fecha", tipo = "general" }) {
    const [listaFiltrada, setListaFiltrada] = useState(listaElementos);
    const [valorInput, setValorInput] = useState("");
    const [filtroCongreso, setFiltroCongreso] = useState("todos");
    const [filtroRol, setFiltroRol] = useState("todos");
    const [itemPreview, setItemPreview] = useState(null);
    const fechaActual = new Date();

    useEffect(() => {
        setListaFiltrada(listaElementos);
        setValorInput("");
        setFiltroCongreso("todos");
        setFiltroRol("todos");
    }, [listaElementos]);

    const congresos = [...new Set(listaElementos.map(i => i.congreso).filter(Boolean))];
    const rolesConstancia = ['Ponente', 'Tallerista', 'Dictaminador', 'Evaluador', 'Participante'];

    function getDiasDesde(fecha) {
        if (!fecha) return Infinity;
        return Math.abs(fechaActual - new Date(fecha)) / 1000 / 60 / 60 / 24;
    }

    function aplicarFiltros(nombre, secundario, rol) {
        let filtrados = listaElementos;
        if (nombre.trim()) {
            filtrados = filtrados.filter(i => i.nombre.toLowerCase().includes(nombre.toLowerCase()));
        }
        if (tipo === "facturas") {
            if (secundario !== "todos") {
                const dias = { hoy: 1, semana: 7, mes: 30, antiguo: Infinity };
                const limite = dias[secundario];
                filtrados = filtrados.filter(i => {
                    const d = getDiasDesde(i.fecha);
                    if (secundario === "antiguo") return d > 30;
                    return d <= limite;
                });
            }
        } else {
            if (secundario !== "todos") {
                filtrados = filtrados.filter(i => i.congreso === secundario);
            }
            if (rol !== "todos") {
                filtrados = filtrados.filter(i => i.rol?.toLowerCase() === rol.toLowerCase());
            }
        }
        return filtrados;
    }

    function busquedaInput(e) {
        const value = e.target.value;
        setValorInput(value);
        setListaFiltrada(aplicarFiltros(value, filtroCongreso, filtroRol));
    }

    function limpiarBusqueda() {
        setValorInput("");
        setListaFiltrada(aplicarFiltros("", filtroCongreso, filtroRol));
    }

    function handleFiltroCongreso(e) {
        const value = e.target.value;
        setFiltroCongreso(value);
        setListaFiltrada(aplicarFiltros(valorInput, value, filtroRol));
    }

    function handleFiltroRol(e) {
        const value = e.target.value;
        setFiltroRol(value);
        setListaFiltrada(aplicarFiltros(valorInput, filtroCongreso, value));
    }

    function handleColorFecha(fecha) {
        const fechaAccion = new Date(fecha);
        const diferenciaDias = Math.abs(fechaActual - fechaAccion) / 1000 / 60 / 60 / 24;
        if (diferenciaDias <= 1) return "bg-green-500";
        if (diferenciaDias <= 7) return "bg-yellow-500";
        if (diferenciaDias <= 30) return "bg-orange-500";
        return "bg-red-500";
    }
    function handleTemporalidadFecha(fecha) {
        const fechaAccion = new Date(fecha);
        const diferenciaDias = Math.abs(fechaActual - fechaAccion) / 1000 / 60 / 60 / 24;
        if (diferenciaDias <= 1) return "Hoy";
        if (diferenciaDias <= 7) return "Esta semana";
        if (diferenciaDias <= 30) return "Este mes";
        return "Más de un mes";
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
    function handleNombreImportancia(accion) {
        switch (accion) {
            case "crear taller":
            case "borrar usuario":
            case "modificar fecha evento":
            case "crear congreso": return "Crítico";
            case "crear area general":
            case "crear subarea especifica": return "Alta";
            case "revisar resumen":
            case "revisar extenso":
            case "solicitar ponencia": return "Media";
            case "emisión de factura":
            case "emisión de constancia":
            case "realizar pago": return "Baja";
            default: return "";
        }
    }

    function handleColorRol(rol) {
        const r = rol.toLowerCase();
        if (r.includes("ponente")) return "bg-orange-500";
        if (r.includes("tallerista")) return "bg-yellow-500";
        if (r.includes("dictaminador")) return "bg-blue-500";
        if (r.includes("evaluador")) return "bg-purple-500";
        return "bg-red-500";
    }

    function formatFecha(fecha) {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <>
        <div className="w-full flex flex-col gap-4">
            {/* Toolbar */}
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
                        onClick={limpiarBusqueda}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Filtro por periodo — solo facturas */}
                    {tipo === "facturas" && (
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-sm flex-1 sm:flex-none">
                            <MdFilterListAlt className="text-black text-lg" />
                            <select
                                className="bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer w-full"
                                value={filtroCongreso}
                                onChange={handleFiltroCongreso}
                            >
                                <option value="todos">Todos los periodos</option>
                                <option value="hoy">Hoy</option>
                                <option value="semana">Esta semana</option>
                                <option value="mes">Este mes</option>
                                <option value="antiguo">Más de un mes</option>
                            </select>
                        </div>
                    )}

                    {/* Filtros por congreso y rol — solo constancias */}
                    {tipo === "constancias" && (
                        <>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-sm flex-1 sm:flex-none">
                                <MdFilterListAlt className="text-black text-lg" />
                                <select
                                    className="bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer w-full"
                                    value={filtroCongreso}
                                    onChange={handleFiltroCongreso}
                                >
                                    <option value="todos">Todos los congresos</option>
                                    {congresos.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-sm flex-1 sm:flex-none">
                                <MdFilterListAlt className="text-black text-lg" />
                                <select
                                    className="bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer w-full"
                                    value={filtroRol}
                                    onChange={handleFiltroRol}
                                >
                                    <option value="todos">Todos los roles</option>
                                    {rolesConstancia.map(r => (
                                        <option key={r} value={r.toLowerCase()}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Listado */}
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
                                {mostrarIndicadores && <div className="hidden md:flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm group-hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-2" title={`Rol: ${item.rol}`}>
                                        <div className={`w-2 h-2 rounded-full ${handleColorRol(item.rol)}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.rol}</span>
                                        <FaRegUserCircle className="text-gray-500 text-sm" />
                                    </div>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5" title="Temporalidad">
                                        <div className={`w-2 h-2 rounded-full ${handleColorFecha(item.fecha)}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{handleTemporalidadFecha(item.fecha)}</span>
                                        <MdAccessTime className="text-gray-500 text-sm" />
                                    </div>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5" title="Importancia">
                                        <div className={`w-2 h-2 rounded-full ${handleColorImportancia(item.accion)}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{handleNombreImportancia(item.accion)}</span>
                                        <MdInfoOutline className="text-gray-500 text-sm" />
                                    </div>
                                </div>}

                                {/* Tarjeta de rol (solo constancias) */}
                                {mostrarRol && (
                                    <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm group-hover:border-gray-300 transition-colors" title={`Rol: ${item.rol}`}>
                                        <div className={`w-2 h-2 rounded-full ${handleColorRol(item.rol)}`}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.rol}</span>
                                        <FaRegUserCircle className="text-gray-500 text-sm" />
                                    </div>
                                )}

                                {/* Tarjeta de fecha */}
                                {mostrarInfoFecha && (
                                    <div className="hidden md:flex flex-col gap-1 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm group-hover:border-gray-300 transition-colors min-w-[160px]">
                                        <div className="flex items-center gap-1.5">
                                            <MdAccessTime className="text-[#005a6a] text-sm shrink-0" />
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{etiquetaFecha}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-700 leading-tight">{formatFecha(item.fecha)}</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => setItemPreview(item)}
                                    className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-[#005a6a] transition-all shadow-sm active:scale-90"
                                    title="Ver documento"
                                >
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

        {itemPreview && (
            <VistaPreviewDocumento
                item={itemPreview}
                etiquetaFecha={etiquetaFecha}
                onClose={() => setItemPreview(null)}
            />
        )}
        </>
    );
}
