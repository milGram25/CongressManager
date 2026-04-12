import React, { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi'; // Quité FiCopy porque no se estaba usando
import { FiCopy } from "react-icons/fi";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


const DetallesEditarTaller = ({ tallerData }) => {

    // 1. Inicializamos los estados directamente sin usar useEffect.
    // Usamos el operador '?.' (optional chaining) para evitar errores si tallerData es nulo.
    const [workshopName, setWorkshopName] = useState(tallerData?.nombre_evento || '');
    const [tallerista, setTallerista] = useState(tallerData?.tallerista || 'Sin asignar');
    const [congresoName, setCongresoName] = useState(tallerData?.nombre_congreso || '');
    const [cupos, setCupos] = useState(tallerData?.cupos || '');
    const [nombreTaller,setNombreTaller] = useState()

    // Procesamos las fechas directamente en la inicialización
    const initialFechaI = tallerData?.fecha_hora_inicio ? tallerData.fecha_hora_inicio.split('T')[0] : '';
    const initialHoraI = tallerData?.fecha_hora_inicio ? tallerData.fecha_hora_inicio.split('T')[1] : '';
    const [fechaInicio, setFechaInicio] = useState(initialFechaI);
    const [horaInicio, setHoraInicio] = useState(initialHoraI);

    const initialFechaF = tallerData?.fecha_hora_final ? tallerData.fecha_hora_final.split('T')[0] : '';
    const initialHoraF = tallerData?.fecha_hora_final ? tallerData.fecha_hora_final.split('T')[1] : '';
    const [fechaFin, setFechaFin] = useState(initialFechaF);
    const [horaFin, setHoraFin] = useState(initialHoraF);



    // --- Estilos ---
    const textInputStyle = {
        backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '20px',
        padding: '8px 12px', fontSize: '14px', color: '#1A1A1A', width: '100%', boxSizing: 'border-box', marginLeft:'10px'
    };
    const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#666666', marginBottom: '4px', display: 'block' };
    const sectionTitleStyle = { fontSize: '18px', fontWeight: 'bold', color: '#333333', margin: '12px 0', borderBottom: '1px solid #CCCCCC', paddingBottom: '8px' };

    // 2. Eliminé 'buttonStyle' porque no se usaba en ningún lado.

    const pairedFieldsStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
    const pairedFieldItemStyle = { flex: '1 1 calc(50% - 12px)' };

    //const [formatData, setFormatData] = useState(tallerData);
    const [formatData, setFormatData] = useState({
        id:1,
        nombre_evento: "buen nombre",
        nombre_congreso: "CIENU 2020",
        nombre_institucion: "CIENU",
        sede: "cualtos",
        enlace_imagen: "ruta 1",
        nombre_tallerista: "yo mero caguamero",
        subarea: "Avances en tecnología",
        cupos_maximos_taller: 10,
        nombre_taller: "brutal",
        tipo_taller: "Programación",
        enlace_videollamada: "ruta video",
        nombre_mesa:"Mesa A",
        cupos_mesa:10,
        fecha_hora_inicio:"2026-04-12T11:51",
        fecha_hora_final:"2026-04-14T11:51"


    });

    const [modificando, setModificando] = useState(false);
    
    function handleChange(e){
        const { id, value } = e.target;
        setFormatData(prev => ({
            ...prev,
            [id]: value
        }));

    }

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#F0EFEF',
            borderRadius: '24px',
           
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontFamily: 'sans-serif'
        }}>
            {/* Header del Modal */}
            <div className='sticky top-0 bg-black text-white flex items-center px-6 py-4 z-40 rounded-t-lg'>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Ver y modificar detalles de taller</span>
                <div className='flex flex-1 justify-end'>
                    {!modificando?(
                        <button className="hover:bg-gray-500" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#000000', color: '#FFFFFF', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={()=>setModificando(!modificando)}>
                            <FiEdit2 size={18} />
                        </button>

                    ):(
                        <div className='flex bg-white rounded-full gap-2 p-1'>
                            <button className="hover:bg-gray-500" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={()=>setModificando(!modificando)}>
                                <IoIosCheckmark size={18} />
                            </button>
                            <button className="hover:bg-gray-500" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={()=>setModificando(!modificando)}>
                                <RxCross2 size={18} />
                            </button>

                        </div>

                    )}

                </div>
                
            </div>

            {/* Body del Modal */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}> {/*<div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>*/}

                {/* Sección Detalles Base */}
                <h3 style={sectionTitleStyle}>Detalles</h3>
                <p>Congreso</p>
                <div className='grid grid-cols-2 gap-10 ml-4'>
                    <div className='flex flex-col gap-3'>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre del congreso</label>
                            <input id="nombre_congreso" type="text" style={textInputStyle} value={formatData.nombre_congreso} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre de la institución</label>
                            <input id="nombre_institucion" type="text" style={textInputStyle} value={formatData.nombre_institucion} onChange={(e) =>handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Sede</label>
                            <input id="sede" type="text" style={textInputStyle} value={formatData.sede} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        
                    </div>
                    
                    <div className="flex flex-col items-center justify-center" style={pairedFieldsStyle}>
                        
                        <div className="w-full" style={{...pairedFieldItemStyle, minWidth: '300px'}}>
                            <label style={labelStyle}>Imagen representativa</label>
                            <div style={{...textInputStyle, height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCCCCC'}}>Imagen de la institución</div>
                        </div>
                        <div>
                            <p className='text-gray-500 text-xs font-bold'>Congreso</p>
                             <button className='bg-black text-white w-50 rounded-full h-10 hover:bg-gray-500 hover:cursor-pointer text-white '>Ver detalles congreso</button>
                        </div>
                       
                    </div>
                </div>

                {/* Sección Detalles del Taller */}
                <hr></hr>
                <div className='grid grid-cols-2 justify-start'>
                    <h3 className="col-span-3" style={sectionTitleStyle}>Detalles del taller</h3>
                    <div className='grid col-span-3 grid-cols-2' style={pairedFieldsStyle}>
                        <div className='col-span-2' style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre del tallerista</label>
                            <input id="nombre_tallerista" type="text" style={textInputStyle} value={formatData.nombre_tallerista} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='col-span-1' style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Subárea</label>
                            <input id="subarea" type="text" style={textInputStyle} value={formatData.subarea} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='col-span-1' style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Cupos máximos del taller</label>
                            <input id="cupos_maximos_taller" type="text" style={textInputStyle} value={formatData.cupos_maximos_taller} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='col-span-1'style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre del taller</label>
                            <input id="nombre_taller" type="text" style={textInputStyle} value={formatData.nombre_taller} onChange={(e) => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='col-span-1'style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Tipo de taller</label>
                            <input id="tipo_taller" type="text" style={textInputStyle} value={formatData.tipo_taller} onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='col-span-1'style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Enlace a videollamada</label>
                            <div className='flex'>
                                <input id="enlace_videollamada" className="pl-4 flex-1 bg-white border rounded-l-full ml-4" type="text" value={formatData.enlace_videollamada} onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                                <button className='flex items-center justify-center h-10 w-10 bg-black hover:bg-gray-500 hover:cursor-pointer text-white  text-white rounded-r-full'><FiCopy /></button>

                            </div>
                             </div>
                        <div className='col-span-2 flex justify-center items-center'>
                            <div className='flex-1 flex flex-col'>
                                <p style={labelStyle}>Nombre del taller</p>
                                <button className='h-10 w-50 bg-black hover:bg-gray-500 hover:cursor-pointer text-white rounded-xl'>Ver multimedia</button>

                            </div>
                            
                        </div>
                    </div>
                </div>
                <hr/>
                {/*Mesa*/}
                <div>
                    <h3>Mesa</h3>
                    <div className='flex'>
                        
                        <div className='flex-1 ml-4 flex flex-col'>
                            
                            <label forHtml="nombre_mesa" className='text-gray-500 text-xs font-bold'>Nombre de la mesa</label>
                            <input id="nombre_mesa" className='pl-4 h-10 bg-white border rounded-full' value={formatData.nombre_mesa} onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                        </div>
                        <div className='flex-1 ml-4 flex flex-col'>
                            
                            <label forHtml="nombre_mesa" className='text-gray-500 text-xs font-bold'>Cupos máximos de la mesa</label>
                            <input id="cupos_mesa" className='pl-4 h-10 bg-white border rounded-full' value={formatData.cupos_mesa}onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                        </div>

                    </div>

                </div>
                <hr/>

                {/* Sección Fechas */}
                <div>
                    <h3 style={sectionTitleStyle}>Fechas y Horarios</h3>
                    <div className="pl-[12px] flex"style={{ paddingLeft: '12px' }}>
                        <div className='flex-1 ml-4 flex flex-col'>
                            <div className='flex'>
                                <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#006D75', flexShrink: 0}}></div>
                                <label style={{...labelStyle, marginBottom: 0, fontWeight: 'bold'}}>Inicio:</label>
                            </div>
                            
                             <input type="datetime-local" id="fecha_hora_inicio" className='pl-4 h-10 bg-white border rounded-full' value={formatData.fecha_hora_inicio}onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                            
                        </div>
                        <div className='flex-1 ml-4 flex flex-col'>
                            <div className='flex'>
                                <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#006D75', flexShrink: 0}}></div>
                             <label style={{...labelStyle, marginBottom: 0, fontWeight: 'bold'}}>Fin:</label>
                            </div>

                            
                            <input type="datetime-local" id="fecha_hora_final" className='pl-4 h-10 bg-white border rounded-full' value={formatData.fecha_hora_final}onChange={(e)  => handleChange(e)} readOnly={!modificando}/>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetallesEditarTaller;