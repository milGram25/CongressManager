import React from 'react';

export default function DetallesHistorial({ accion, onClose }) {
  // Proporciones exactas 538x748 sobre 1440x1200
  const containerStyle = {
    width: '37.36%',
    minHeight: '62.33%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #1A1A1A',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box'
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: '16px',
    marginTop: '0'
  };

  const fieldLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: '8px'
  };

  const fieldValueStyle = {
    backgroundColor: '#F5F5F5',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    color: '#666666',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box'
  };

  const fieldContainerStyle = {
    marginBottom: '12px'
  };

  // Si no hay acción seleccionada, no mostrar nada
  if (!accion) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <p style={{ color: '#999999', fontSize: '14px' }}>Selecciona una acción para ver los detalles</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Sección Detalles */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={sectionTitleStyle}>Detalles</h3>
        
        {/* Nombre */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Nombre</label>
          <div style={fieldValueStyle}>{accion.nombre || '-'}</div>
        </div>

        {/* Primer apellido */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Primer apellido</label>
          <div style={fieldValueStyle}>{accion.primerApellido || '-'}</div>
        </div>

        {/* Segundo apellido */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Segundo apellido</label>
          <div style={fieldValueStyle}>{accion.segundoApellido || '-'}</div>
        </div>

        {/* Correo electrónico */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Correo electrónico</label>
          <div style={fieldValueStyle}>{accion.correo || '-'}</div>
        </div>

        {/* Número de teléfono */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Número de teléfono</label>
          <div style={fieldValueStyle}>{accion.telefono || '-'}</div>
        </div>

        {/* CURP */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>CURP</label>
          <div style={fieldValueStyle}>{accion.curp || '-'}</div>
        </div>
      </div>

      {/* Divisor */}
      <div style={{ borderTop: '1px solid #E5E5E5', margin: '24px 0' }}></div>

      {/* Sección Acción */}
      <div>
        <h3 style={sectionTitleStyle}>Acción</h3>
        
        {/* Código de la acción */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Código de la acción</label>
          <div style={fieldValueStyle}>{accion.codigoAccion || '-'}</div>
        </div>

        {/* Nombre corto de la acción */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Nombre corto de la acción</label>
          <div style={fieldValueStyle}>{accion.accion || '-'}</div>
        </div>

        {/* Descripción de la acción */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Descripción de la acción</label>
          <div style={{ ...fieldValueStyle, minHeight: '80px', alignItems: 'flex-start', padding: '12px' }}>
            {accion.descripcionAccion || '-'}
          </div>
        </div>

        {/* Fecha y hora acción */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Fecha y hora acción</label>
          <div style={fieldValueStyle}>{accion.fecha || '-'}</div>
        </div>

        {/* Correo electrónico de la persona */}
        <div style={fieldContainerStyle}>
          <label style={fieldLabelStyle}>Correo electrónico de la persona</label>
          <div style={fieldValueStyle}>{accion.correoPersona || '-'}</div>
        </div>
      </div>
    </div>
  );
}
