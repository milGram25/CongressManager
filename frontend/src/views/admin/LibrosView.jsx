import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica.jsx";
import { MdDelete, MdAdd, MdSave, MdCheck } from 'react-icons/md';
import { useState } from 'react';
import { FiEye, FiCopy, FiEdit2 } from 'react-icons/fi';
import { FaAngleDown, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import { MdOutlineChangeCircle } from "react-icons/md";


export default function LibrosView({ librosRecibidos, congreso }) {

    const MOCK_CONGRESOS = [
        {
            id: 1,
            nombre: "CIENU 2024",

        },
        {
            id: 2,
            nombre: "CIENU 2025",

        },
        {
            id: 3,
            nombre: "CIENU 2026",

        },
        {
            id: 4,
            nombre: "CIENU 2027",

        }
    ];

    const MOCK_INSTITUCIONES = [
        {
            id: 1,
            nombre: "CIENU",

        },
        {
            id: 2,
            nombre: "RIDMAE",

        }
    ];

    const MOCK_LIBROS = [
        {
            id: 1,
            titulo: "LIBRO CIENU 2024",
            descripcion: "Libro de memorias del CIENU 2024",
            fecha: "2024-10-10T:10:00",
            id_congreso: 1,
            ponencias: [
                {
                    nombre_ponencia: "Buena ponencia",
                    ponente: "El master",
                    subarea: "matemáticas"
                },
                {
                    nombre_ponencia: "Excelente ponencia",
                    ponente: "El master",
                    subarea: "matemáticas"
                },
                {
                    nombre_ponencia: "Preciosa ponencia",
                    ponente: "El master",
                    subarea: "matemáticas"
                }
            ]
        },
        {
            id: 2,
            titulo: "LIBRO CIENU 2025",
            descripcion: "Libro de memorias del CIENU 2025",
            fecha: "2024-10-10T:10:00",
            id_congreso: 1,
            ponencias: [
                {
                    nombre_ponencia: "Buena ponencia",
                    ponente: "El master",
                    subarea: "matemáticas"
                }
            ]
        },
        {
            id: 3,
            titulo: "LIBRO CIENU 2026",
            descripcion: "Libro de memorias del CIENU 2026",
            fecha: "2024-10-10T:10:00",
            id_congreso: 1,
            ponencias: [
                {
                    nombre_ponencia: "Buena ponencia",
                    ponente: "El master",
                    subarea: "matemáticas"
                }
            ]
        }
    ];

    const MOCK_TODAS_LAS_PONENCIAS = [
        {
            id: 1,
            nombre_ponencia: "Otras ponencias",
            ponente: "El master",
            subarea: "matemáticas"
        },
        {
            id: 2,
            nombre_ponencia: "Otras ponencias 2",
            ponente: "El master",
            subarea: "matemáticas"
        },
        {
            id: 3,
            nombre_ponencia: "Otras ponencias 3",
            ponente: "El master",
            subarea: "matemáticas"
        },
        {
            id: 4,
            nombre_ponencia: "Otras ponencias 4",
            ponente: "El master",
            subarea: "matemáticas"
        },
        {
            id: 5,
            nombre_ponencia: "Otras ponencias 5",
            ponente: "El master",
            subarea: "matemáticas"
        }
    ]
    const [libros, setLibros] = useState(MOCK_LIBROS); //por el momento, el mock pero debería ser la variable "Libros!"
    const [ponencias, setPonencias] = useState(MOCK_TODAS_LAS_PONENCIAS);
    const [congresoSelected, setCongresoSelected] = useState(congreso);
    const [editingLibro, setEditingLibro] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha: ''
    });
    const [mostrarPonenciasId, setMostrarPonenciasId] = useState(null);
    const [seleccionarPonenciasId, setSeleccionarPonenciasId] = useState(null);

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

    function handleAgregarLibro() {
        const nuevoIndex = libros.length;

        setLibros([
            ...libros,
            {
                id: Date.now(),
                titulo: '',
                descripcion: '',
                fecha: '',
                id_congreso: congresoSelected,
                ponencias: []
            }
        ]);

        setEditingLibro(nuevoIndex);
    };


    const inputStyle = "input input-bordered w-full max-w-xs rounded-full ml-2";
    const labelStyle = "text-gray-500 text-sm";
    const buttonStyle = "bg-black rounded-full h-8 w-8 text-white flex justify-center items-center hover:bg-gray-500 hover:cursor-pointer transition-colors";

    function agregarPonencia(libroIndex, e) {
        const ponenciaId = parseInt(e.target.value);
        if (!ponenciaId) return;

        const ponenciaToAdd = ponencias.find(p => p.id === ponenciaId);
        if (!ponenciaToAdd) return;

        setLibros(prevLibros => {
            const nuevosLibros = [...prevLibros];
            const libro = { ...nuevosLibros[libroIndex] };
            const ponenciasDelLibro = [...(libro.ponencias || [])];

            ponenciasDelLibro.unshift({ ...ponenciaToAdd });

            libro.ponencias = ponenciasDelLibro;
            nuevosLibros[libroIndex] = libro;
            return nuevosLibros;
        });

        e.target.value = "";
    }
    function moverPonencia(libroIndex, ponenciaIndex, direccion) {
        setLibros(prevLibros => {
            const nuevosLibros = [...prevLibros];
            const libro = { ...nuevosLibros[libroIndex] };
            const ponencias = [...(libro.ponencias || [])];

            if (direccion === "arriba" && ponenciaIndex > 0) {
                const temp = ponencias[ponenciaIndex - 1];
                ponencias[ponenciaIndex - 1] = ponencias[ponenciaIndex];
                ponencias[ponenciaIndex] = temp;
            } else if (direccion === "abajo" && ponenciaIndex < ponencias.length - 1) {
                const temp = ponencias[ponenciaIndex + 1];
                ponencias[ponenciaIndex + 1] = ponencias[ponenciaIndex];
                ponencias[ponenciaIndex] = temp;
            }

            libro.ponencias = ponencias;
            nuevosLibros[libroIndex] = libro;
            return nuevosLibros;
        });
    }

    function borrarPonencia(libroIndex, ponenciaIndex) {
        setLibros(prevLibros => {
            const nuevosLibros = [...prevLibros];
            const libro = { ...nuevosLibros[libroIndex] };
            const ponencias = [...(libro.ponencias || [])];

            ponencias.splice(ponenciaIndex, 1);

            libro.ponencias = ponencias;
            nuevosLibros[libroIndex] = libro;
            return nuevosLibros;
        });
    }
    const listaPonenciasLibro = (ponencia, index2, libroIndex) => {
        return (
            <div className="flex border-b pb-3 border-slate-200" key={index2}>
                <p className="mr-4">{index2 + 1}° </p>
                <div className="flex flex-1 gap-3">

                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Nombre ponencia</label>
                        <input
                            id="titulo"
                            readOnly={editingLibro !== index2}
                            value={ponencia.nombre_ponencia}
                            className={inputStyle}

                        />

                    </div>
                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Ponente</label>
                        <input
                            id="fecha"
                            type="datetime-local"
                            readOnly={editingLibro !== index2}
                            value={ponencia.ponente}
                            className={inputStyle}

                        />

                    </div>
                    <div className="flex-2">
                        <label htmlFor="" className={labelStyle}>Subárea</label>
                        <input
                            id="descripcion"
                            readOnly={editingLibro !== index2}
                            value={ponencia.subarea}
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
                        <button className={buttonStyle} title="Intercambiar esta ponencia con otra">
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

                <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={MOCK_INSTITUCIONES} onChange={(e) => seleccionarCongreso(e)} />
                <ListaDesplegableElementosGenerica titulo={"Congresos"} lista={MOCK_CONGRESOS} onChange={(e) => seleccionarInstitucion(e)} />
            </div>
            <div className="bg-base-100 rounded-3xl shadow-sm">
                {/*header*/}
                <div className="flex items-center bg-black h-20 rounded-t-lg text-white p-4">
                    <h3 className="text-xl font-bold">Crear libros</h3>

                </div>
                {/*Libros*/}
                <div className="bg-base-100 border border-base-300 p-6 flex flex-col h-fit rounded-b-3xl">
                    <div className="flex gap-10 items-center h-15">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <div className="w-2 h-6 bg-primary rounded-full"></div> Libros
                        </h3>
                        <button onClick={(e) => handleAgregarLibro(e, libros.length)} className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl">
                            <MdAdd size={18} /> Nuevo Libro
                        </button>

                    </div>

                    <div className="flex flex-col w-full gap-1">
                        {libros.map((libro, index) => (
                            <div className="grid border-b pb-3 border-slate-300" key={index}>
                                <p className="mr-4">{index + 1}° </p>
                                <div className="flex flex-1 gap-3">

                                    <div className="flex-2">
                                        <label htmlFor="" className={labelStyle}>Titulo</label>
                                        <input
                                            id="titulo"
                                            readOnly={editingLibro !== index}
                                            value={libro.titulo}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(e, index)}
                                        />

                                    </div>
                                    <div className="flex-2">
                                        <label htmlFor="" className={labelStyle}>Fecha de publicación</label>
                                        <input
                                            id="fecha"
                                            type="datetime-local"
                                            readOnly={editingLibro !== index}
                                            value={libro.fecha}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(e, index)}
                                        />

                                    </div>
                                    <div className="flex-2">
                                        <label htmlFor="" className={labelStyle}>Descripción</label>
                                        <input
                                            id="descripcion"
                                            readOnly={editingLibro !== index}
                                            value={libro.descripcion}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(e, index)}
                                        />

                                    </div>
                                    <div className="flex items-center gap-1 rounded-full h-10 p-1 pt-10">
                                        <button className={buttonStyle} onClick={() => index !== editingLibro ?
                                            setEditingLibro(index) : setEditingLibro(null)}>
                                            {index !== editingLibro ?
                                                <RiPencilFill /> :
                                                <MdCheck />
                                            }


                                        </button>

                                        <button className={buttonStyle}>
                                            {index !== editingLibro ?
                                                <MdDelete /> :
                                                <IoCloseOutline />
                                            }


                                        </button>
                                        <button className={buttonStyle} onClick={() => index !== mostrarPonenciasId ?
                                            setMostrarPonenciasId(index) : setMostrarPonenciasId(null)}>
                                            <FaAngleDown />

                                        </button>

                                    </div>

                                </div>
                                <div className="ml-6 mt-3 rounded-lg bg-gray-200">

                                    {index === mostrarPonenciasId ?
                                        <div className="pt-4">
                                            <div className="pl-2 flex items-center mb-4 h-15 bg-gray-100 rounded-lg p-2 m-4">
                                                <p className="flex-2">Agregue una ponencia al libro</p>
                                                <select className="flex-5 border rounded-full bg-white pl-5 h-10" onChange={(e) => agregarPonencia(index, e)} defaultValue="">
                                                    <option value="" disabled>Seleccione una ponencia...</option>
                                                    {
                                                        ponencias.filter(p => !libro.ponencias?.some(lp => lp.nombre_ponencia === p.nombre_ponencia))
                                                            .map((ponencia) => (
                                                                <option key={ponencia.id} value={ponencia.id}>{ponencia.nombre_ponencia}</option>
                                                            ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="border-l border-gray-200 pl-4   pr-3">
                                                {libro.ponencias?.map((ponencia, index2) => (
                                                    listaPonenciasLibro(ponencia, index2, index)

                                                ))}

                                            </div>
                                        </div>
                                        : ""
                                    }
                                </div>




                            </div>

                        ))}

                    </div>

                </div>

            </div>
        </div >
    );
}