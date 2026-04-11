import React, { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi'; // Quité FiCopy porque no se estaba usando

const DetallesEditarTaller = ({ tallerData }) => {

    // 1. Inicializamos los estados directamente sin usar useEffect.
    // Usamos el operador '?.' (optional chaining) para evitar errores si tallerData es nulo.
    const [workshopName, setWorkshopName] = useState(tallerData?.nombre_evento || '');
    const [tallerista, setTallerista] = useState(tallerData?.tallerista || 'Sin asignar');
    const [congresoName, setCongresoName] = useState(tallerData?.nombre_congreso || '');
    const [cupos, setCupos] = useState(tallerData?.cupos || '');

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
        backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '8px',
        padding: '8px 12px', fontSize: '14px', color: '#1A1A1A', width: '100%', boxSizing: 'border-box'
    };
    const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#666666', marginBottom: '4px', display: 'block' };
    const sectionTitleStyle = { fontSize: '18px', fontWeight: 'bold', color: '#333333', margin: '12px 0', borderBottom: '1px solid #CCCCCC', paddingBottom: '8px' };

    // 2. Eliminé 'buttonStyle' porque no se usaba en ningún lado.

    const pairedFieldsStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
    const pairedFieldItemStyle = { flex: '1 1 calc(50% - 12px)', minWidth: '200px' };

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#F0EFEF',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontFamily: 'sans-serif'
        }}>
            {/* Header del Modal */}
            <div style={{ backgroundColor: '#000000', color: '#FFFFFF', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Ver y modificar detalles de taller</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#000000', color: '#FFFFFF', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <FiEdit2 size={18} />
                </div>
            </div>

            {/* Body del Modal */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Sección Detalles Base */}
                <div>
                    <h3 style={sectionTitleStyle}>Detalles</h3>
                    <div style={pairedFieldsStyle}>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Congreso</label>
                            <input type="text" style={textInputStyle} value={congresoName} onChange={(e) => setCongresoName(e.target.value)} />
                        </div>
                        <div style={{...pairedFieldItemStyle, minWidth: '300px'}}>
                            <label style={labelStyle}>Imagen representativa</label>
                            <div style={{...textInputStyle, height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCCCCC'}}>Imagen del Taller</div>
                        </div>
                    </div>
                </div>

                {/* Sección Detalles del Taller */}
                <div>
                    <h3 style={sectionTitleStyle}>Detalles del taller</h3>
                    <div style={pairedFieldsStyle}>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre del tallerista</label>
                            <input type="text" style={textInputStyle} value={tallerista} onChange={(e) => setTallerista(e.target.value)} />
                        </div>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Nombre del taller</label>
                            <input type="text" style={textInputStyle} value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} />
                        </div>
                        <div style={pairedFieldItemStyle}>
                            <label style={labelStyle}>Cupos máximos</label>
                            <input type="text" style={textInputStyle} value={cupos} onChange={(e) => setCupos(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Sección Fechas */}
                <div>
                    <h3 style={sectionTitleStyle}>Fechas y Horarios</h3>
                    <div style={{ paddingLeft: '12px' }}>
                        <div style={{...pairedFieldsStyle, gap: '8px', marginBottom: '8px', alignItems: 'center'}}>
                            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#006D75', flexShrink: 0}}></div>
                            <label style={{...labelStyle, marginBottom: 0, fontWeight: 'bold'}}>Inicio:</label>
                            <div style={{...pairedFieldItemStyle, minWidth: '120px'}}><input type="date" style={textInputStyle} value={fechaInicio} onChange={(e)=>setFechaInicio(e.target.value)} /></div>
                            <div style={{...pairedFieldItemStyle, minWidth: '100px'}}><input type="time" style={textInputStyle} value={horaInicio} onChange={(e)=>setHoraInicio(e.target.value)} /></div>
                        </div>
                        <div style={{...pairedFieldsStyle, gap: '8px', alignItems: 'center'}}>
                            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#006D75', flexShrink: 0}}></div>
                            <label style={{...labelStyle, marginBottom: 0, fontWeight: 'bold'}}>Fin:</label>
                            <div style={{...pairedFieldItemStyle, minWidth: '120px'}}><input type="date" style={textInputStyle} value={fechaFin} onChange={(e)=>setFechaFin(e.target.value)} /></div>
                            <div style={{...pairedFieldItemStyle, minWidth: '100px'}}><input type="time" style={textInputStyle} value={horaFin} onChange={(e)=>setHoraFin(e.target.value)} /></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetallesEditarTaller;