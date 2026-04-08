import React from 'react';
import { FiTarget, FiMapPin, FiFlag } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: '#005C70', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px' };
const valuePillStyle = { backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 12px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemInstitucion = ({
                             nombreInstitucion = "Universidad de Ejemplo",
                             sede = "Rectoría",
                             ubicacion = "Guadalajara, Jalisco",
                             pais = "México"
                         }) => {
    return (
        <TarjetaGenerica titulo={nombreInstitucion}> {/* Sin botón de publicar */}

            {/* Fila 1: Sede */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiTarget size={12}/></div>
                    <span>Sede</span>
                </div>
                <div style={valuePillStyle}>{sede}</div>
            </div>

            {/* Fila 2: Ubicación */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiMapPin size={12}/></div>
                    <span>Ubicación</span>
                </div>
                <div style={{...valuePillStyle, textAlign: 'left', flex: 1, maxWidth: '60%'}}>
                    {ubicacion} {/* No es una píldora tradicional, es texto alineado a la izquierda */}
                </div>
            </div>

            {/* Fila 3: País */}
            <div style={{...rowStyle, marginTop: 'auto'}}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiFlag size={12}/></div>
                    <span>País</span>
                </div>
                <div style={valuePillStyle}>{pais}</div>
            </div>

        </TarjetaGenerica>
    );
};

export default ItemInstitucion;