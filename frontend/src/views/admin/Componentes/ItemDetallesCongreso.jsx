import React from 'react';
import { FiDownload } from 'react-icons/fi';

const ItemDetallesCongreso = ({
                              selectedCongressId,
                              congressData = [
                                  {
                                      id: 1,
                                      nombre: "CIENU 2026",
                                      institucion: "CIENU",
                                      tipoTrabajo: "tesis",
                                      fechas: {
                                          local: { inicio: "15/noviembre/2026; 08:00", fin: "20/noviembre/2026; 18:00" },
                                          utc: { inicio: "15/noviembre/2026; 08:00", fin: "20/noviembre/2026; 18:00" }
                                      },
                                      estadisticas: {
                                          personas: { cupos: 300, asistentes: 290 },
                                          eventos: { ponencias: 20, talleres: 20 },
                                          dinero: 10000
                                      },
                                      sede: {
                                          edificio: "CUALTOS",
                                          calle: "Av. Ricardo",
                                          pais: "México",
                                          numExt: "N/A",
                                          numInt: "N/A",
                                          estado: "Jalisco",
                                          ciudad: "Tepatitlán",
                                          moduloFisico: "Edificio G-202"
                                      },
                                      pagos: {
                                          cuentaDestinataria: "123456789",
                                          costoPorEvento: 100,
                                          descuentoPrepago: "No especificado"
                                      }
                                  }
                              ],
                              onDownload
                          }) => {

    const congress = selectedCongressId
        ? congressData.find(c => c.id === selectedCongressId)
        : null;

    // 1. PRIMERO definimos el estilo del contenedor
    const containerStyle = {
        width: '39.10%',
        height: '68.75%',
        minWidth: '563px',
        minHeight: '825px',
        backgroundColor: '#F8F8F8',
        border: '1px solid #1A1A1A',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
        position: 'relative',
        overflowY: 'auto'
    };

    // 2. AHORA SÍ evaluamos si existe el congreso, porque containerStyle ya existe
    if (!congress) {
        return (
            <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666666'}}>
                Seleccione un congreso de la lista para ver los detalles.
            </div>
        );
    }

    // --- El resto de los estilos ---
    const titleStyle = {
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: '500',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    const dividerStyle = {
        height: '1px',
        backgroundColor: '#CCCCCC',
        margin: '8px 0',
        width: '100%'
    };

    const sectionTitleStyle = {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#666666',
        marginTop: '12px',
        marginBottom: '8px'
    };

    const detailGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingLeft: '12px'
    };

    const renderDetailItem = (label, value, bulletColor = '#006D75') => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1A1A1A' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: bulletColor, flexShrink: 0 }} />
            <div>
                <span style={{ fontWeight: '600' }}>{label}:</span> {value}
            </div>
        </div>
    );

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
    };

    const sedeGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
    };

    const downloadButtonStyle = {
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#F8F8F8',
        border: '2px solid #1A1A1A',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#006D75',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    };

    const internalDownloadIconStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#006D75',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>DETALLES DEL CONGRESO</h2>
            <div style={dividerStyle} />

            <h3 style={sectionTitleStyle}>Detalles</h3>
            <div style={detailGroupStyle}>
                {renderDetailItem("Nombre congreso", congress.nombre)}
                {renderDetailItem("Institución", congress.institucion)}
                {renderDetailItem("Tipo de trabajo", congress.tipoTrabajo)}
            </div>
            <div style={dividerStyle} />

            <h3 style={sectionTitleStyle}>Fechas y horas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ paddingLeft: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666666', fontWeight: '600' }}>Local (UTC+0)</h4>
                    <div style={detailGroupStyle}>
                        {renderDetailItem("Inicio", congress.fechas.local.inicio, '#27ae60')}
                        {renderDetailItem("Fin", congress.fechas.local.fin, '#e74c3c')}
                    </div>
                </div>
                <div style={{ paddingLeft: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666666', fontWeight: '600' }}>UTC</h4>
                    <div style={detailGroupStyle}>
                        {renderDetailItem("Inicio", congress.fechas.utc.inicio, '#27ae60')}
                        {renderDetailItem("Fin", congress.fechas.utc.fin, '#e74c3c')}
                    </div>
                </div>
            </div>
            <div style={dividerStyle} />

            <h3 style={sectionTitleStyle}>Estadísticas</h3>
            <div style={{...statsGridStyle, paddingLeft: '12px'}}>
                <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666666', fontWeight: '600' }}>Personas</h4>
                    {renderDetailItem("Cupos totales", congress.estadisticas.personas.cupos)}
                    {renderDetailItem("Asistentes", congress.estadisticas.personas.asistentes)}
                </div>
                <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666666', fontWeight: '600' }}>Eventos</h4>
                    {renderDetailItem("Ponencias", congress.estadisticas.eventos.ponencias)}
                    {renderDetailItem("Talleres", congress.estadisticas.eventos.talleres)}
                </div>
            </div>
            <div style={{...detailGroupStyle, marginTop: '8px', paddingLeft: '12px'}}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#666666', fontWeight: '600' }}>Dinero</h4>
                {renderDetailItem("Dinero recaudado", `$${congress.estadisticas.dinero}`)}
            </div>
            <div style={dividerStyle} />

            <h3 style={sectionTitleStyle}>Sede</h3>
            <div style={{...sedeGridStyle, paddingLeft: '12px'}}>
                <div>
                    {renderDetailItem("Nombre edificio", congress.sede.edificio)}
                    {renderDetailItem("País", congress.sede.pais)}
                    {renderDetailItem("Estado", congress.sede.estado)}
                    {renderDetailItem("Ciudad", congress.sede.ciudad)}
                </div>
                <div>
                    {renderDetailItem("Calle", congress.sede.calle)}
                    {renderDetailItem("Núm. ext.", congress.sede.numExt)}
                    {renderDetailItem("Núm. int.", congress.sede.numInt)}
                    {renderDetailItem("Módulo físico", congress.sede.moduloFisico)}
                </div>
            </div>
            <div style={dividerStyle} />

            <h3 style={sectionTitleStyle}>Pagos</h3>
            <div style={detailGroupStyle}>
                {renderDetailItem("Cuenta destinataria", congress.pagos.cuentaDestinataria)}
                {renderDetailItem("Costo por cada evento", `$${congress.pagos.costoPorEvento}`)}
                {renderDetailItem("Descuento por prepago", congress.pagos.descuentoPrepago)}
            </div>

            <button
                style={downloadButtonStyle}
                onClick={onDownload}
                title="Descargar detalles"
            >
                <div style={internalDownloadIconStyle}>
                    <FiDownload size={20} />
                </div>
            </button>
        </div>
    );
};

export default ItemDetallesCongreso;