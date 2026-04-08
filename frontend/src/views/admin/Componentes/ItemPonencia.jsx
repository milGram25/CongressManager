import React from 'react';
import { FiAward, FiUser, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: '#005C70', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px' };
const valuePillStyle = { backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 12px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemPonencia = ({
                          nombrePonencia = "Ponencia de Ejemplo",
                          congreso = "CIENU",
                          ponente = "Dr. Santos",
                          fecha = "30 oct 2026",
                          hora = "11:00",
                          estatus = "Aceptado"
                      }) => {
    return (
        <TarjetaGenerica className="w-60"  titulo={nombrePonencia}> {/* Sin botón de publicar según la imagen */}

            {/* Fila 1: Congreso */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiAward size={12}/></div>
                    <span>Congreso</span>
                </div>
                <div style={valuePillStyle}>{congreso}</div>
            </div>

            {/* Fila 2: Ponente */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUser size={12}/></div>
                    <span>Ponente</span>
                </div>
                <div style={valuePillStyle}>{ponente}</div>
            </div>

            {/* Fila 3: Fecha */}
            <div className="flex "style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiCalendar size={12}/></div>
                    <span>Fecha</span>
                    
                </div>
                
                <div style={valuePillStyle}>{fecha}</div>
                
            </div>

            {/* Fila 4: Hora */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiClock size={12}/></div>
                    <span>Hora</span>
                </div>
                <div style={valuePillStyle}>{hora}</div>
            </div>

           

        </TarjetaGenerica>
    );
};

export default ItemPonencia;