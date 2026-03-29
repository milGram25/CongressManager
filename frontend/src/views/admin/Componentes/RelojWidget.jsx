import React, { useState, useEffect } from 'react';

const RelojWidget = ({ isUTC = false, onSettingsClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Efecto para actualizar el reloj cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Funciones para formatear la fecha y hora
    const getHours = () => isUTC ? currentTime.getUTCHours() : currentTime.getHours();
    const getMinutes = () => isUTC ? currentTime.getUTCMinutes() : currentTime.getMinutes();
    const getDate = () => isUTC ? currentTime.getUTCDate() : currentTime.getDate();
    const getMonth = () => isUTC ? currentTime.getUTCMonth() : currentTime.getMonth();
    const getYear = () => isUTC ? currentTime.getUTCFullYear() : currentTime.getFullYear();

    // Lógica de AM/PM y formato de 12 horas
    const rawHours = getHours();
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    const displayHours = rawHours % 12 || 12; // Convierte el 0 a 12

    const strHours = displayHours.toString().padStart(2, '0');
    const strMinutes = getMinutes().toString().padStart(2, '0');

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const strDate = `${getDate().toString().padStart(2, '0')} / ${meses[getMonth()]} / ${getYear()}`;

    // Título dinámico dependiendo de la configuración
    const timezoneText = isUTC ? 'Tiempo Universal Coordinado (UTC)' : 'Fecha y hora local (México, UTC-6)';

    // --- Estilos ---
    const containerStyle = {
        width: '20.07%',
        height: '20.42%',
        backgroundColor: '#F9F8F8', // Fondo ligeramente gris/cálido
        border: '1px solid #1A1A1A',
        borderRadius: '24px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
        position: 'relative' // Para posicionar el botón de ajustes
    };

    const titleStyle = {
        fontSize: '12px',
        color: '#4A4A4A',
        fontWeight: '600',
        margin: '0 0 12px 0'
    };

    const timeRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '12px'
    };

    const timeBoxStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #1A1A1A',
        borderRadius: '8px',
        width: '70px',
        height: '70px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '42px',
        fontWeight: '400',
        color: '#1A1A1A'
    };

    const colonStyle = {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1A1A1A',
        paddingBottom: '8px'
    };

    const amPmContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #1A1A1A',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '70px',
        width: '45px'
    };

    const getAmPmStyle = (type) => ({
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: '#4A4A4A',
        backgroundColor: ampm === type
            ? (type === 'AM' ? '#FCE4EC' : '#E8EAF6') // Colores activos
            : '#F0F0F0', // Inactivo
        borderBottom: type === 'AM' ? '1px solid #1A1A1A' : 'none'
    });

    const dateBoxStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #1A1A1A',
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1A1A1A',
        width: '100%',
        boxSizing: 'border-box'
    };

    const settingsButtonStyle = {
        position: 'absolute',
        bottom: '-16px',
        right: '-16px',
        backgroundColor: '#005C70',
        border: '2px solid #1A1A1A',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#FFFFFF'
    };

    return (
        <div style={containerStyle}>
            <p style={titleStyle}>{timezoneText}</p>

            {/* Fila de la Hora */}
            <div style={timeRowStyle}>
                <div style={timeBoxStyle}>{strHours}</div>
                <span style={colonStyle}>:</span>
                <div style={timeBoxStyle}>{strMinutes}</div>

                {/* Indicador AM / PM */}
                <div style={amPmContainerStyle}>
                    <div style={getAmPmStyle('AM')}>AM</div>
                    <div style={getAmPmStyle('PM')}>PM</div>
                </div>
            </div>

            {/* Fila de la Fecha */}
            <div style={dateBoxStyle}>
                {strDate}
            </div>

            {/* Botón de Configuración */}
            <button
                style={settingsButtonStyle}
                onClick={onSettingsClick}
                aria-label="Configurar hora"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </button>
        </div>
    );
};

export default RelojWidget;