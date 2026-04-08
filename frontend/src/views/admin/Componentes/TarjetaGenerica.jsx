import React from 'react';
import { FiEye, FiCopy, FiEdit2 } from 'react-icons/fi';

const TarjetaGenerica = ({
                             titulo,
                             botonPublicarTexto, // Si se envía este texto, aparece el botón central
                             onView,
                             onCopy,
                             onEdit,
                             onPublish,
                             children
                         }) => {

    const cardStyle = {
        // Proporciones basadas en 329x384 sobre 1440x1200
        width: '300px', // Usa 100% para que se adapte a la columna del Grid que hicimos antes
        minHeight: '384px',
        backgroundColor: '#F9F8F8',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
    };

    const headerStyle = {
        backgroundColor: 'black',
        color: '#FFFFFF',
        borderRadius: '30px',
        padding: '8px 16px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '16px',
        marginBottom: '16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const contentStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    };

    const footerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px'
    };

    const iconBtnStyle = {
        backgroundColor: 'black',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    };

    const publishBtnStyle = {
        backgroundColor: 'black',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '20px',
        //padding: '6px 16px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>{titulo}</div>

            <div style={contentStyle}>
                {children}
            </div>

            <div style={footerStyle}>
                <button style={iconBtnStyle} onClick={onView} title="Ver detalles">
                    <FiEye size={16} />
                </button>

                {botonPublicarTexto && (
                    <button style={publishBtnStyle} onClick={onPublish}>
                        {botonPublicarTexto}
                    </button>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={iconBtnStyle} onClick={onCopy} title="Duplicar">
                        <FiCopy size={16} />
                    </button>
                    <button style={iconBtnStyle} onClick={onEdit} title="Editar">
                        <FiEdit2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TarjetaGenerica;