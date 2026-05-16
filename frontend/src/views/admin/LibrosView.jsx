import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica.jsx";
import { MdDelete, MdAdd, MdSave, MdCheck } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { FiEye, FiCopy, FiEdit2 } from 'react-icons/fi';
import { FaAngleDown, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import { MdOutlineChangeCircle } from "react-icons/md";
import {
    getCongresosApi, getInstitucionesApi, getLibrosApi, getPonenciasApi, getLibroHasPonenciaApi,
    createLibroApi, updateLibroApi, deleteLibroApi,
    addPonenciaToLibroApi, removePonenciaFromLibroApi, transferPonenciaApi
} from "../../api/adminApi";





export default function LibrosView({ librosRecibidos, congreso }) {
    const accessToken = localStorage.getItem('congress_access');
    const [loading, setLoading] = useState(null);
    const [instituciones, setInstituciones] = useState([]);
    const [congresos, setCongresos] = useState([]);
    const [instId, setInstId] = useState(0);
    const [selectedInst, setSelectedInst] = useState(null);
    const [selectedCongId, setSelectedCongId] = useState(null);
    const [libroHasPonencia, setLibroHasPonencia] = useState([]);
    const [libros, setLibros] = useState([]); //por el momento, el mock pero debería ser la variable "Libros!"
    //const [ponencias, setPonencias] = useState(MOCK_TODAS_LAS_PONENCIAS);
    const [ponencias, setPonencias] = useState([]);
    const [congresoSelected, setCongresoSelected] = useState(congreso);
    const [editingLibro, setEditingLibro] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha: ''
    });


    const [mostrarPonenciasIdVisual, setMostrarPonenciasIdVisual] = useState(null);
    const [mostrarPonenciasIdReal, setMostrarPonenciasIdReal] = useState(null);
    const [seleccionarPonenciasId, setSeleccionarPonenciasId] = useState(null);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [swapData, setSwapData] = useState({ ponencia: null, currentLibroIndex: null, currentPonenciaIndex: null });
    const [loadingPonencias, setLoadingPonencias] = useState(false);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const instData = await getInstitucionesApi(accessToken);
            setInstituciones(instData);
            //await fetchCongresos("");
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {



            setLoading(false);
        }
    };
    const fetchCongresos = async (instId) => {
        try {
            const congData = await getCongresosApi(accessToken, instId);
            setCongresos(congData);
        } catch (error) {
            console.error("Error al cargar congresos:", error);
        }

    };
    const fetchLibros = async (selectedCongId) => {
        try {
            const congData = await getLibrosApi(accessToken, selectedCongId);
            setLibros(congData);
        } catch (error) {
            console.error("Error al cargar libros:", error);
        }

    };

    const fetchPonencias = async (selectedCongId) => {
        try {
            const ponenciasData = await getPonenciasApi(accessToken, selectedCongId);
            setPonencias(ponenciasData);

        }
        catch (error) {
            console.error("Error al cargar ponencias:", error);
        }
    };

    const fetchLibroHasPonencia = async (mostrarPonenciasIdReal) => {
        try {
            const libroHasPonenciaData =
                await getLibroHasPonenciaApi(
                    accessToken,
                    mostrarPonenciasIdReal
                );

            const nuevasPonencias = libroHasPonenciaData
                .map((lhp) =>
                    ponencias.find(
                        p => p.id_ponencia === lhp.id_ponencia
                    )
                )
                .filter(Boolean);

            setLibroHasPonencia(nuevasPonencias);
        } catch (error) {
            console.error("Error al cargar detalles de las ponencias del libro:", error);
        } finally {
            setLoadingPonencias(false);
        }
    };

    useEffect(() => {
        fetchInitialData();

    }, []);

    useEffect(() => {
        fetchCongresos(instId);

    }, [instId]);

    useEffect(() => {
        if (selectedCongId !== null && selectedCongId !== undefined) {
            fetchLibros(selectedCongId);
            fetchPonencias(selectedCongId);
        }
    }, [selectedCongId]);

    useEffect(() => {
        if (mostrarPonenciasIdReal !== null && mostrarPonenciasIdReal !== undefined) {
            fetchLibroHasPonencia(mostrarPonenciasIdReal);
        }

    }, [mostrarPonenciasIdReal])


    const totalPonenciasAsignadas = libros.reduce((acc, libro) => acc + (libro.ponencias?.length || 0), 0);
    const totalPonenciasDisponibles = ponencias.length;


    function handleMostrarPonencias(index, libro) {
        if (index !== mostrarPonenciasIdVisual) {
            setLibroHasPonencia([]); // Limpiar para evitar inconsistencia visual
            setLoadingPonencias(true);
            setMostrarPonenciasIdVisual(index);
            setMostrarPonenciasIdReal(libro.id_libro);
        } else {
            setMostrarPonenciasIdVisual(null);
            setMostrarPonenciasIdReal(null);
        }
    }


    function handleChange(e, index) {
        const { id, value } = e.target;

        setLibros(prevLibros =>
            prevLibros.map((libro, i) =>
                i === index
                    ? { ...libro, [id]: value }
                    : libro
            )
        );
    };

    const handleSelectInstitucion = async (instId) => {
        setSelectedInst(instId);
        setLoading(true);
        await fetchCongresos(instId);
        setLoading(false);

    }

    const handleSelectCongreso = (selectedCongId) => {
        setSelectedCongId(selectedCongId);

    }

    async function handleAgregarLibro() {
        if (!selectedCongId) {
            alert("Por favor seleccione un congreso primero.");
            return;
        }

        try {
            const data = {
                titulo: 'Nuevo Libro',
                descripcion: 'Descripción del libro',
                fecha_publicacion: new Date().toISOString().split('T')[0]
            };
            const nuevoLibro = await createLibroApi(accessToken, selectedCongId, data);
            setLibros([...libros, nuevoLibro]);
            setEditingLibro(libros.length);
        } catch (error) {
            console.error("Error al crear libro:", error);
            alert("No se pudo crear el libro en la base de datos.");
        }
    };


    const inputStyle = "input input-bordered w-full max-w-xs rounded-full ml-2";
    const labelStyle = "text-gray-500 text-sm";
    const buttonStyle = "bg-black rounded-full h-8 w-8 text-white flex justify-center items-center hover:bg-gray-500 hover:cursor-pointer transition-colors";

    async function agregarPonencia(libroIndex, e) {
        const ponenciaId = parseInt(e.target.value);
        if (!ponenciaId) return;

        const libro = libros[libroIndex];
        const ponenciaToAdd = ponencias.find(p => p.id_ponencia === ponenciaId);
        if (!ponenciaToAdd) return;

        try {
            await addPonenciaToLibroApi(accessToken, {
                id_libro: libro.id_libro,
                id_ponencia: ponenciaId,
                orden: (libro.ponencias?.length || 0) + 1
            });

            setLibros(prevLibros => {
                const nuevosLibros = [...prevLibros];
                const libroToUpdate = { ...nuevosLibros[libroIndex] };
                const ponenciasIds = [...(libroToUpdate.ponencias || [])];
                ponenciasIds.unshift(ponenciaId);
                libroToUpdate.ponencias = ponenciasIds;
                nuevosLibros[libroIndex] = libroToUpdate;
                return nuevosLibros;
            });

            if (mostrarPonenciasIdVisual === libroIndex) {
                setLibroHasPonencia(prev => [ponenciaToAdd, ...prev]);
            }

            e.target.value = "";
        } catch (error) {
            console.error("Error al asignar ponencia:", error);
            alert("No se pudo asignar la ponencia en la base de datos.");
        }
    }
    function moverPonencia(libroIndex, ponenciaIndex, direccion) {
        setLibroHasPonencia(prev => {
            const nuevasPonencias = [...prev];
            if (direccion === "arriba" && ponenciaIndex > 0) {
                [nuevasPonencias[ponenciaIndex - 1], nuevasPonencias[ponenciaIndex]] = [nuevasPonencias[ponenciaIndex], nuevasPonencias[ponenciaIndex - 1]];
            } else if (direccion === "abajo" && ponenciaIndex < nuevasPonencias.length - 1) {
                [nuevasPonencias[ponenciaIndex + 1], nuevasPonencias[ponenciaIndex]] = [nuevasPonencias[ponenciaIndex], nuevasPonencias[ponenciaIndex + 1]];
            }
            return nuevasPonencias;
        });

        // También sincronizar con el estado de libros (IDs)
        setLibros(prevLibros => {
            const nuevosLibros = [...prevLibros];
            const libro = { ...nuevosLibros[libroIndex] };
            const ponenciasIds = [...(libro.ponencias || [])];
            if (direccion === "arriba" && ponenciaIndex > 0) {
                [ponenciasIds[ponenciaIndex - 1], ponenciasIds[ponenciaIndex]] = [ponenciasIds[ponenciaIndex], ponenciasIds[ponenciaIndex - 1]];
            } else if (direccion === "abajo" && ponenciaIndex < ponenciasIds.length - 1) {
                [ponenciasIds[ponenciaIndex + 1], ponenciasIds[ponenciaIndex]] = [ponenciasIds[ponenciaIndex], ponenciasIds[ponenciaIndex + 1]];
            }
            libro.ponencias = ponenciasIds;
            nuevosLibros[libroIndex] = libro;
            return nuevosLibros;
        });
    }

    async function borrarPonencia(libroIndex, ponenciaIndex) {
        const ponenciaABorrar = libroHasPonencia[ponenciaIndex];
        if (!ponenciaABorrar) return;

        try {
            await removePonenciaFromLibroApi(accessToken, ponenciaABorrar.id_ponencia);

            setLibroHasPonencia(prev => {
                const nuevasPonencias = [...prev];
                nuevasPonencias.splice(ponenciaIndex, 1);
                return nuevasPonencias;
            });

            setLibros(prevLibros => {
                const nuevosLibros = [...prevLibros];
                const libro = { ...nuevosLibros[libroIndex] };
                const ponenciasIds = [...(libro.ponencias || [])];
                const idABorrar = ponenciaABorrar.id_ponencia;
                libro.ponencias = ponenciasIds.filter(id => id !== idABorrar);
                nuevosLibros[libroIndex] = libro;
                return nuevosLibros;
            });
        } catch (error) {
            console.error("Error al quitar ponencia:", error);
            alert("No se pudo quitar la ponencia de la base de datos.");
        }
    }

    function openSwapModal(libroIndex, ponenciaIndex, ponencia) {
        setSwapData({ ponencia, currentLibroIndex: libroIndex, currentPonenciaIndex: ponenciaIndex });
        setIsSwapModalOpen(true);
    }

    async function transferirPonencia(targetLibroIndex) {
        const { ponencia, currentLibroIndex, currentPonenciaIndex } = swapData;
        if (!ponencia || targetLibroIndex === currentLibroIndex) return;

        const ponenciaId = ponencia.id_ponencia;
        const targetLibro = libros[targetLibroIndex];

        try {
            await transferPonenciaApi(accessToken, ponenciaId, targetLibro.id_libro);

            setLibros(prevLibros => {
                const nuevosLibros = [...prevLibros];

                // Quitar del libro actual
                const currentLibro = { ...nuevosLibros[currentLibroIndex] };
                currentLibro.ponencias = (currentLibro.ponencias || []).filter(id => id !== ponenciaId);
                nuevosLibros[currentLibroIndex] = currentLibro;

                // Añadir al libro destino
                const targetLibroUpdate = { ...nuevosLibros[targetLibroIndex] };
                targetLibroUpdate.ponencias = [ponenciaId, ...(targetLibroUpdate.ponencias || [])];
                nuevosLibros[targetLibroIndex] = targetLibroUpdate;

                return nuevosLibros;
            });

            // Si el libro actual es el que se está mostrando, actualizar libroHasPonencia
            if (currentLibroIndex === mostrarPonenciasIdVisual) {
                setLibroHasPonencia(prev => prev.filter(p => p.id_ponencia !== ponenciaId));
            }

            setIsSwapModalOpen(false);
            setSwapData({ ponencia: null, currentLibroIndex: null, currentPonenciaIndex: null });
        } catch (error) {
            console.error("Error al transferir ponencia:", error);
            alert("No se pudo transferir la ponencia en la base de datos.");
        }
    }

    async function handleToggleEdit(index) {
        if (editingLibro === index) {
            // Guardar cambios
            const libro = libros[index];
            try {
                await updateLibroApi(accessToken, libro.id_libro, {
                    titulo: libro.titulo,
                    descripcion: libro.descripcion,
                    fecha_publicacion: libro.fecha_publicacion
                });
                setEditingLibro(null);
            } catch (error) {
                console.error("Error al actualizar libro:", error);
                alert("No se pudieron guardar los cambios en la base de datos.");
            }
        } else {
            setEditingLibro(index);
        }
    }

    async function borrarLibro(index) {
        if (!window.confirm("¿Está seguro de que desea eliminar este libro? Se eliminarán todas sus ponencias asignadas de este libro (quedarán disponibles para otros libros).")) return;
        const libro = libros[index];
        try {
            await deleteLibroApi(accessToken, libro.id_libro);
            setLibros(prevLibros => prevLibros.filter((_, i) => i !== index));
            if (mostrarPonenciasIdVisual === index) {
                setMostrarPonenciasIdVisual(null);
                setMostrarPonenciasIdReal(null);
            }
        } catch (error) {
            console.error("Error al eliminar libro:", error);
            alert("No se pudo eliminar el libro de la base de datos.");
        }
    }
    const listaPonenciasLibro = (ponencia, index2, libroIndex) => {
        console.log("PONENCIA COMPLETA:", ponencia);
        return (
            <div className="flex border-b pb-3 border-slate-200" key={index2}>
                <p className="mr-4">{index2 + 1}° </p>
                <div className="flex flex-1 gap-3">

                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Nombre ponencia</label>
                        <input
                            id="titulo"
                            readOnly
                            value={ponencia.nombre_evento || ''}
                            className={inputStyle}

                        />

                    </div>
                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Ponente</label>
                        <input
                            id="ponente"
                            type="text"
                            readOnly
                            value={ponencia.nombres_ponentes?.join(', ') || 'Sin ponente'}
                            className={inputStyle}

                        />

                    </div>
                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Subárea</label>
                        <input
                            id="descripcion"
                            readOnly
                            value={ponencia.nombre_subarea || ''}
                            className={inputStyle}

                        />

                    </div>
                    <div className="flex items-center gap-1 rounded-full h-10 p-1 pt-10">
                        <button className={buttonStyle} onClick={() => moverPonencia(libroIndex, index2, "arriba")} title="Subir ponencia de puesto">
                            <FaCaretUp />
                        </button>
                        <button className={buttonStyle} onClick={() => moverPonencia(libroIndex, index2, "abajo")} title="Bajar ponencia de puesto">
                            <FaCaretDown />
                        </button>
                        <button className={buttonStyle} onClick={() => borrarPonencia(libroIndex, index2)} title="Eliminar ponencia de este libro">
                            <MdDelete />
                        </button>
                        <button className={buttonStyle} onClick={() => openSwapModal(libroIndex, index2, ponencia)} title="Intercambiar esta ponencia con otra">
                            <MdOutlineChangeCircle />
                        </button>
                    </div>

                </div>


            </div>
        );
    };
    return (
        <div>
            <div className="">
                <div className="flex gap-4">
                    <div className="border bg-black rounded-full h-10 w-2"></div>
                    <h2 className="flex-1 text-2xl font-bold text-start">Libros</h2>
                </div>
                <p className="pl-12 text-start text-gray-500 mb-3">
                    Aquí se crean los libros de los congresos
                </p>
            </div>
            <div className="flex justify-center gap-10 mb-4">

                <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={instituciones} onSelect={handleSelectInstitucion} value={selectedInst} />
                <ListaDesplegableElementosGenerica titulo={"Congresos"} lista={congresos} onSelect={handleSelectCongreso} value={(selectedCongId)} />
            </div>
            <div className="bg-base-100 rounded-3xl shadow-sm">
                {/*header*/}
                <div className="flex items-center bg-black h-20 rounded-t-lg text-white p-4">
                    <h3 className="text-xl font-bold">Crear libros</h3>

                </div>
                {/*Libros*/}
                <div className="bg-base-100 border border-base-300 p-6 flex flex-col h-fit rounded-b-3xl">
                    <div className="flex gap-10 items-center h-15">
                        <div className="flex flex-col border-r pr-6 border-slate-200">
                            <h2 className="text-sm font-bold text-gray-400">Ponencias asignadas</h2>
                            <p className="text-2xl font-black text-primary">{totalPonenciasAsignadas} <span className="text-sm font-normal text-gray-400">/ {totalPonenciasDisponibles}</span></p>
                        </div>
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <div className="w-2 h-6 bg-primary rounded-full"></div> Libros
                        </h3>
                        <button onClick={(e) => handleAgregarLibro(e, libros.length)} className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl">
                            <MdAdd size={18} /> Nuevo libro
                        </button>

                    </div>

                    <div className="flex flex-col w-full gap-1">

                        {libros.length > 0 ? libros.map((libro, index) => (
                            <div className="flex flex-col border-b pb-3 border-slate-300" key={index}>
                                <div>
                                    <p className="mr-4">{index + 1}° </p>

                                </div>

                                <div className="flex flex-1 gap-3">

                                    <div className="flex-3">
                                        <label htmlFor="" className={labelStyle}>Titulo</label>
                                        <input
                                            id="titulo"
                                            readOnly={editingLibro !== index}
                                            value={libro.titulo}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(e, index)}
                                            title={libro.titulo}
                                        />

                                    </div>
                                    <div className="flex-2">
                                        <label htmlFor="" className={labelStyle}>Fecha de publicación</label>
                                        <input
                                            id="fecha_publicacion"
                                            type="date"
                                            readOnly={editingLibro !== index}
                                            value={libro.fecha_publicacion}
                                            className={inputStyle + " flex justify-center"}
                                            onChange={(e) => handleChange(e, index)}
                                            title={libro.fecha_publicacion}
                                        />

                                    </div>
                                    <div className="flex-4">
                                        <label htmlFor="" className={labelStyle}>Descripción</label>
                                        <input
                                            id="descripcion"
                                            readOnly={editingLibro !== index}
                                            value={libro.descripcion}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(e, index)}
                                            title={libro.descripcion}
                                        />

                                    </div>
                                    <div className="flex-1" title="Número de ponencias asignadas a este libro">
                                        <label htmlFor="" className={labelStyle}>N° Ponencias</label>
                                        <input
                                            id="numero_ponencias"
                                            readOnly
                                            value={libro.ponencias?.length || 0}
                                            className={inputStyle + " flex text-center"}
                                        />

                                    </div>
                                    <div className="flex items-center gap-1 rounded-full h-10 p-1 pt-11">

                                        <button className={buttonStyle} onClick={() => handleToggleEdit(index)}>
                                            {index !== editingLibro ?
                                                <RiPencilFill /> :
                                                <MdCheck />
                                            }


                                        </button>

                                        <button className={buttonStyle} onClick={() => index !== editingLibro ?
                                            borrarLibro(index) : setEditingLibro(null)}>
                                            {index !== editingLibro ?
                                                <MdDelete /> :
                                                <IoCloseOutline />
                                            }


                                        </button>
                                        <button className={buttonStyle} onClick={() => handleMostrarPonencias(index, libro)}>
                                            <FaAngleDown />

                                        </button>

                                    </div>

                                </div>
                                <div className="ml-6 mt-3 rounded-lg bg-gray-200">

                                    {index === mostrarPonenciasIdVisual ?
                                        <div className="pt-4">
                                            {loadingPonencias ? (
                                                <div className="flex justify-center items-center py-10 text-gray-400 animate-pulse">
                                                    <p className="italic">Cargando ponencias...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="pl-2 flex items-center mb-4 h-15 bg-gray-100 rounded-lg p-2 m-4">
                                                        <p className="flex-2">Agregue una ponencia al libro</p>
                                                        <select className="flex-5 border rounded-full bg-white pl-5 h-10" onChange={(e) => agregarPonencia(index, e)} defaultValue="">
                                                            <option value="" disabled>Seleccione una ponencia...</option>

                                                            {
                                                                ponencias.filter(p => !libros.some(l => l.ponencias?.includes(p.id_ponencia)))
                                                                    .map((ponencia) => (
                                                                        <option key={ponencia.id_ponencia} value={ponencia.id_ponencia}>
                                                                            {ponencia.nombre_evento}
                                                                        </option>
                                                                    ))
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="border-l border-gray-200 pl-4   pr-3">
                                                        {libroHasPonencia.map((ponencia, index2) => (
                                                            listaPonenciasLibro(ponencia, index2, index)
                                                        ))}

                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        : null
                                    }
                                </div>




                            </div>

                        )) : <div className="flex-1 items-center justify-center text-slate-500 text-lg">Aún no hay libros creados para este congreso</div>}


                    </div>

                </div>

            </div>

            {/* Modal de Intercambio */}
            {isSwapModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Transferir Ponencia</h3>
                            <button onClick={() => setIsSwapModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IoCloseOutline size={28} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Ponencia seleccionada:</p>
                            <p className="font-semibold text-gray-800">{swapData.ponencia?.nombre_evento}</p>
                        </div>

                        <p className="text-sm font-medium text-gray-600 mb-3">Seleccione el libro destino:</p>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {libros.map((l, idx) => (
                                idx !== swapData.currentLibroIndex && (
                                    <button
                                        key={l.id_libro}
                                        onClick={() => transferirPonencia(idx)}
                                        className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all group flex items-center justify-between"
                                    >
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">{l.titulo || 'Sin título'}</span>
                                        <MdAdd className="text-gray-300 group-hover:text-blue-500" size={20} />
                                    </button>
                                )
                            ))}
                            {libros.filter((_, idx) => idx !== swapData.currentLibroIndex).length === 0 && (
                                <p className="text-center text-gray-400 py-4 italic">No hay otros libros disponibles.</p>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setIsSwapModalOpen(false)}
                                className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}