import React from 'react';
import { FiMapPin, FiUser, FiUsers, FiCalendar, FiClock } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Definimos estilos reutilizables para las filas de información dentro de este archivo
const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '4px'
};

const labelContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4A4A4A', // Gris oscuro para la etiqueta
    fontSize: '14px'
};

const iconCircleBox = {
    backgroundColor: 'black', // Teal
    color: '#FFFFFF',
    padding: '6px',
    borderRadius: '50%', // Círculo perfecto
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px'
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

    const fecha_inicio = listaDatos.fecha_hora_inicio.split("T")[0];
    const hora_inicio = listaDatos.fecha_hora_inicio.split("T")[1];

    const fecha_fin = listaDatos.fecha_hora_final.split("T")[0];
    const hora_fin = listaDatos.fecha_hora_final.split("T")[1];

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

            {/* Fila 4: Fecha y Hora inicio */}
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de inicio del taller">
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
            <div style={{ gap: '8px', paddingTop: '2px' }}  title="Fecha y hora de fin del taller">
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

export default ItemTaller;