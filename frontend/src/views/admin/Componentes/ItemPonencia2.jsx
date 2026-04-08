import React from 'react';
import { FiAward, FiUser, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' };
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

            {/* Fila 3: Fecha inicio*/}
            <div className="flex "style={rowStyle}>
                <div className="h-10 text-black font-bold" style={labelContainer}>
                    <div style={iconCircleBox}><FiCalendar size={12}/></div>
                    <span>Inicio</span>
                    <input className='w-45 bg-white border rounded-full h-full pl-4' value={listaDatos.fecha_hora_inicio} type="datetime-local" readOnly/>
                    
                </div>      
            </div>

            {/* Fila 4: Fecha fin*/}
            <div className="flex "style={rowStyle}>
                <div className="h-10 text-black font-bold" style={labelContainer}>
                    <div style={iconCircleBox}><FiCalendar size={12}/></div>
                    <span>Inicio</span>
                    <input className='w-45 bg-white border rounded-full h-full pl-4' value={listaDatos.fecha_hora_final} type="datetime-local" readOnly/>
                    
                </div>      
            </div>

        </TarjetaGenerica>
    );
};

export default ItemPonencia;