import React from 'react';
import { FiDownload, FiMinus, FiPlus } from 'react-icons/fi';

const MenuCrearBorrarGenerico = ({
                                     title = "Crear [insertar sustantivo]",
                                     children,
                                     onDownload,
                                     onRemove,
                                     onAdd
                                 }) => {

    const containerStyle = {
        width: '74.03%',
        height: '82%',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
    };

    const headerStyle = {
        backgroundColor: '#005C70',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
    };

    const titleStyle = {
        margin: 0,
        fontSize: '24px',
        fontWeight: '500',
    };

    const contentAreaStyle = {
        flex: 1,
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'max-content',
        gap: '16px',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
    };

    const iconButtonStyle = {
        background: 'transparent',
        border: '2px solid #ffffff',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#ffffff'
    };

    const pillContainerStyle = {
        backgroundColor: '#E5E5E5',
        borderRadius: '30px',
        padding: '4px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
    };

    const pillButtonStyle = {
        backgroundColor: '#005C70',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#ffffff'
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2 style={titleStyle}>{title}</h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={onDownload} style={iconButtonStyle} title="Descargar">
                        {/* Ícono de descarga */}
                        <FiDownload size={18} strokeWidth={2} />
                    </button>

                    <div style={pillContainerStyle}>
                        <button onClick={onRemove} style={pillButtonStyle} title="Quitar">
                            {/* Ícono de menos */}
                            <FiMinus size={16} strokeWidth={3} />
                        </button>
                        <button onClick={onAdd} style={pillButtonStyle} title="Agregar">
                            {/* Ícono de más */}
                            <FiPlus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </header>

            <main style={contentAreaStyle}>
                {children}
            </main>
        </div>
    );
};

export default MenuCrearBorrarGenerico;