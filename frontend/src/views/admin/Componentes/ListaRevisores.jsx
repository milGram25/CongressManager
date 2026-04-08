import React from 'react';
import { FiUser } from 'react-icons/fi';

const ListaRevisores = ({
                            titulo = "Evaluadores del extenso",
                            revisores = [
                                { id: 1, nombre: "Dr. Juan Pérez", especialidad: "Metodología" },
                                { id: 2, nombre: "Dra. Ana Gómez", especialidad: "Análisis de Datos" }
                            ]
                        }) => {

    const containerStyle = {
        // Proporciones exactas 560x182 sobre 1440x1200
        width: '38.88%',
        height: '15.16%',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
    };

    const headerStyle = {
        backgroundColor: '#005C70',
        color: '#FFFFFF',
        padding: '12px 16px',
        fontSize: '16px',
        fontWeight: '600',
        margin: 0
    };

    const listStyle = {
        flex: 1,
        padding: '12px 16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const itemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid #E5E5E5'
    };

    const btnStyle = {
        backgroundColor: '#E5E5E5',
        border: 'none',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        color: '#1A1A1A'
    };

    return (
        <div style={containerStyle}>
            <h3 style={headerStyle}>{titulo}</h3>

            <div style={listStyle}>
                {revisores.map((revisor) => (
                    <div key={revisor.id} style={itemStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ backgroundColor: '#F0F0F0', padding: '8px', borderRadius: '50%', color: '#005C70' }}>
                                <FiUser size={16} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1A1A1A' }}>{revisor.nombre}</div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>{revisor.especialidad}</div>
                            </div>
                        </div>
                        <button style={btnStyle} title={`Ver detalles de ${revisor.nombre}`}>
                            Ver detalles
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaRevisores;