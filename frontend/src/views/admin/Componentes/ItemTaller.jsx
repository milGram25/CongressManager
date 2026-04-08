import React from 'react';
import { FiMapPin, FiUser, FiUsers, FiCalendar, FiClock } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Definimos estilos reutilizables para las filas de información dentro de este archivo
const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
};

const labelContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4A4A4A', // Gris oscuro para la etiqueta
    fontSize: '14px'
};

const iconCircleBox = {
    backgroundColor: '#005C70', // Teal
    color: '#FFFFFF',
    padding: '6px',
    borderRadius: '50%', // Círculo perfecto
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px'
};

const valuePillStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #1A1A1A',
    borderRadius: '16px',
    padding: '4px 12px',
    color: '#1A1A1A',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: '60px' // Asegura un ancho mínimo para los valores cortos
};

const ItemTaller = ({
                        nombreTaller = "Taller de Ejemplo",
                        congreso = "CIENU",
                        tallerista = "Dr. Santos",
                        cupos = "100/100",
                        fecha = "30 oct 2026",
                        hora = "15:00",
                        listaDatos
                    }) => {
    return (
        <TarjetaGenerica titulo={listaDatos.nombre_evento.trim()!==""?listaDatos.nombre_evento:"Undefined"} botonPublicarTexto="Publicar">
            {/* Contenido Central */}

            {/* Fila 1: Congreso */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiMapPin size={12}/></div>
                    <span>Congreso</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.nombre_congreso}</div>
            </div>

            {/* Fila 2: Tallerista */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUser size={12}/></div>
                    <span>Tallerista</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.tallerista.trim()!==""?listaDatos.tallerista:"Undefined"}</div>
            </div>

            {/* Fila 3: Cupos */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiUsers size={12}/></div>
                    <span>Cupos</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.cupos}</div>
            </div>

            {/* Fila 4: Fecha y Hora (Combinadas en cajas rectangulares al fondo) */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
                <div style={{ flex: 1, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                    <div style={{ backgroundColor: '#005C70', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiCalendar size={14} /></div>
                    <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{fecha}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', border: '1px solid #1A1A1A', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                    <div style={{ backgroundColor: '#005C70', color: '#FFFFFF', padding: '6px 10px', display: 'flex', alignItems: 'center' }}><FiClock size={14} /></div>
                    <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: '#1A1A1A' }}>{hora}</div>
                </div>
            </div>

        </TarjetaGenerica>
    );
};

export default ItemTaller;