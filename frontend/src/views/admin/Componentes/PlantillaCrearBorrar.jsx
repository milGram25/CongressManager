import React from 'react';

const PlantillaCrearBorrar = ({
                               title = "Crear [insertar sustantivo]",
                               children,
                               onDownload,
                               onRemove,
                               onAdd
                           }) => {

    // Estilos basados en las proporciones requeridas (1094x964 sobre 1440x1200)
    const containerStyle = {
        width: '75.97%',
        height: '80.33%',
        border: '1px solid #4A4A4A', // Borde sutil exterior
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
    };

    const headerStyle = {
        backgroundColor: '#065F74', // Color base inspirado en la imagen
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        borderBottom: '1px solid #4A4A4A'
    };

    const titleStyle = {
        margin: 0,
        fontSize: '24px',
        fontWeight: '500',
        letterSpacing: '0.5px'
    };

    const contentAreaStyle = {
        flex: 1,
        padding: '24px',
        display: 'flex',
        flexWrap: 'wrap',          // Permite que los elementos bajen de línea
        flexDirection: 'row',      // De izquierda a derecha
        alignContent: 'flex-start',// De arriba hacia abajo sin estirarse
        gap: '16px',               // Espaciado entre los componentes almacenados
        overflowY: 'auto'          // Scroll si se llenan los componentes
    };

    // --- Estilos de los Botones ---
    const iconButtonStyle = {
        background: 'transparent',
        border: '2px solid #ffffff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#ffffff'
    };

    const pillContainerStyle = {
        backgroundColor: '#E5E5E5',
        border: '2px solid #4A4A4A',
        borderRadius: '30px',
        padding: '4px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    };

    const pillButtonStyle = {
        backgroundColor: '#065F74',
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
            {/* Cabecera */}
            <header style={headerStyle}>
                <h2 style={titleStyle}>{title}</h2>

                {/* Controles */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                    {/* Botón Descargar */}
                    <button
                        onClick={onDownload}
                        style={iconButtonStyle}
                        aria-label="Descargar información"
                        title="Descargar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>

                    {/* Grupo Píldora: Quitar / Poner */}
                    <div style={pillContainerStyle}>
                        <button
                            onClick={onRemove}
                            style={pillButtonStyle}
                            aria-label="Quitar componente"
                            title="Quitar"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>

                        <button
                            onClick={onAdd}
                            style={pillButtonStyle}
                            aria-label="Agregar componente"
                            title="Agregar"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Área de Componentes (Items hijos) */}
            <main style={contentAreaStyle}>
                {children}
            </main>
        </div>
    );
};

export default PlantillaCrearBorrar;