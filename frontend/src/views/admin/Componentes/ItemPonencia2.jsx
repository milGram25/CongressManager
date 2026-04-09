import React from 'react';
import { FiAward, FiUser, FiCalendar, FiClock, FiCheckCircle,FiUsers } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: 'black', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px' };
const valuePillStyle = { backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 12px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemPonencia = ({
                        listaDatos,
                          nombrePonencia = "Ponencia de Ejemplo",
                          congreso = "CIENU",
                          ponente = "Dr. Santos",
                          fecha = "30 oct 2026",
                          hora = "11:00",
                          estatus = "Aceptado"
                      }) => {

    const fecha_inicio = listaDatos.fecha_hora_inicio.split("T")[0];
    const hora_inicio = listaDatos.fecha_hora_inicio.split("T")[1];

    const fecha_fin = listaDatos.fecha_hora_final.split("T")[0];
    const hora_fin = listaDatos.fecha_hora_final.split("T")[1];

    return (
        <TarjetaGenerica className="w-60"  titulo={listaDatos.nombre_evento}> {/* Sin botón de publicar según la imagen */}

            {/* Fila 1: Congreso */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiAward size={12}/></div>
                    <span>Congreso</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.nombre_congreso}</div>
            </div>

            {/* Fila 2: Ponente */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUser size={12}/></div>
                    <span>Ponente</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.nombre_ponente}</div>
            </div>

            {/* Fila 3: Ponente */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUsers size={12}/></div>
                    <span>Cupos</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.cupos}</div>
            </div>


            {/* Fila 4: Fecha y Hora inicio */}
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de inicio de la ponencia">
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

            {/* Fila 5: Fecha y Hora final */}
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de inicio de la ponencia">
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

export default ItemPonencia;