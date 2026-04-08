import React from 'react';
import { FiBookOpen, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';

// Reutilizamos los mismos estilos base definidos arriba para consistencia visual
// (En un proyecto real, estos estilos irían en un archivo CSS común o en variables)
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: '#005C70', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px' };
const valuePillStyle = { backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 12px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemCongreso = ({
                          nombreCongreso = "Congreso de Ejemplo",
                          siglas = "CIENU",
                          totalPonencias = "25",
                          coordinador = "Dr. Santos",
                          fechaInicio = "28 oct 2026",
                          fechaFin = "31 oct 2026",
                          listaDatos
                      }) => {
    return (
        <TarjetaGenerica titulo={listaDatos.nombre_congreso} botonPublicarTexto="Publicar">

            {/* Fila 1: Siglas */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiBookOpen size={12}/></div>
                    <span>Sede</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.sede}</div>
            </div>

            {/* Fila 2: Ponencias */}
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
            <div style={{...rowStyle, marginTop: 'auto'}}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiCalendar size={12}/></div>
                    <span>Inicio</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.fecha_hora_inicio}</div>
            </div>
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiCalendar size={12}/></div>
                    <span>Fin</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.fecha_hora_final}</div>
            </div>

        </TarjetaGenerica>
    );
};

export default ItemCongreso;