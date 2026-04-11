import React from 'react';
import { FiBookOpen, FiFileText, FiUser, FiCalendar,FiClock } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos los mismos estilos base definidos arriba para consistencia visual
// (En un proyecto real, estos estilos irían en un archivo CSS común o en variables)
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px'};
const iconCircleBox = { backgroundColor: 'black', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px' };
const valuePillStyle = { backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 12px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemCongreso = ({
                          nombreCongreso = "Congreso de Ejemplo",
                          siglas = "CIENU",
                          totalPonencias = "25",
                          coordinador = "Dr. Santos",
                          fechaInicio = "28 oct 2026",
                          fechaFin = "31 oct 2026",
                          fecha = "31 oct 2026",
                          hora = "11:00 pm",
                          listaDatos
                          
                          
                      }) => {

    const fecha_inicio = listaDatos.fecha_hora_inicio.split("T")[0];
    const hora_inicio = listaDatos.fecha_hora_inicio.split("T")[1];

    const fecha_fin = listaDatos.fecha_hora_final.split("T")[0];
    const hora_fin = listaDatos.fecha_hora_final.split("T")[1];
    return (
        <TarjetaGenerica titulo={listaDatos.nombre_congreso} botonPublicarTexto="Publicar" indexDatosModal={listaDatos.id} definirTipoElemento="congreso"> 

            {/* Fila 1: Sede */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiBookOpen size={12}/></div>
                    <span>Sede</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.sede}</div>
            </div>

            {/* Fila 2: Eventos */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiFileText size={12}/></div>
                    <span>Eventos</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.cantidad_eventos}</div> {/*Esto se tendrá que calcular en base a los eventos enlazados al mismo congreso*/}
            </div>

            {/* Fila 3: Coordinador */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUser size={12}/></div>
                    <span>Institución</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.nombre_institucion}</div> {/*Es el nombre de la institución, solo que en la base de datos se le puso únicamente "nombre" al campo, así que hay que retornarlo correctamete cuando se llame a la base de datos*/}
            </div>

            {/* Fila 4 y 5: Fechas (como filas normales) */}

            
            {/* Fila 3: Fecha y Hora inicio */}
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de inicio del congreso">
                <p className='w-8 text-sm text-gray-700'>Inicio</p>
                <div className='flex gap-3'>
                    <div style={{ flex: 3, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <div style={{ backgroundColor: 'black', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiCalendar size={14} /></div>
                        <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{fecha_inicio}</div>
                    </div>
                    <div style={{ flex: 2, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <div style={{ backgroundColor: 'black', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiClock size={14} /></div>
                        <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{hora_inicio}</div>
                    </div>

                </div>
                
            </div>
            {/* Fila 4: Fecha y Hora final */}
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de fin del congreso">
                <p className='w-8 text-sm text-gray-700'>Fin</p>
                <div className='flex gap-3'>
                    <div style={{ flex: 3, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <div style={{ backgroundColor: 'black', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiCalendar size={14} /></div>
                        <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{fecha_fin}</div>
                    </div>
                    <div style={{ flex: 2, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <div style={{ backgroundColor: 'black', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiClock size={14} /></div>
                        <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{hora_fin}</div>
                    </div>

                </div>
                
            </div>

        </TarjetaGenerica>
    );
};

export default ItemCongreso;