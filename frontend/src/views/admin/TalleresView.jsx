import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import DetallesEditarTaller from "./Componentes/DetallesEditarTaller.jsx";


export default function TalleresView() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);

  const listaEventos = [
    {
      id:1,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T14:00",
      cupos:"40"
    },
    {
      id:2,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T13:00",
      cupos:"40"
    },
    {
      id:3,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T12:00",
      cupos:"40"
    },
    {
      id:4,
      nombre_congreso:"Hola mundo",
      nombre_evento:"mal taller",
      tallerista:"Yo mero",
      fecha_hora_inicio:"2026-04-08T10:00",
      fecha_hora_final:"2026-04-08T12:00",
      cupos:"40"
    },
    

  ];

  const handleAbrirModal = (taller) => {
    setTallerSeleccionado(taller);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setTallerSeleccionado(null), 200);
  };

  return (
      // Agregamos 'relative' por si acaso, aunque el fixed del modal cubre toda la pantalla
      <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px] relative">

        {/* 5. Pasamos la función onViewItem a tu menú */}
        <MenuCrearBorrar
            title="Crear taller"
            listaElementos2={listaEventos}
            definirTipoElemento="taller"
            onViewItem={handleAbrirModal}
        />

        {/* 6. RENDERIZADO DEL MODAL */}
        {isModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.6)', // Fondo oscuro
              zIndex: 9999, // Superposición máxima
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px', // Margen en pantallas más pequeñas
              boxSizing: 'border-box'
            }}>
              {/* Contenedor relativo para el componente y el botón de cerrar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '24px' }}>

                {/* Botón flotante para cerrar */}
                <button
                    onClick={handleCerrarModal}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '24px',
                      color: '#FFFFFF',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      zIndex: 10 // Por encima del header del modal
                    }}
                    className="hover:bg-gray-800 transition-colors"
                >
                  Cerrar ✕
                </button>

                {/* Inyectamos el componente limpio, ¡y le pasamos la 'key'! */}
                <DetallesEditarTaller
                    key={tallerSeleccionado?.id} // Obliga a React a re-montar el componente si el ID cambia
                    tallerData={tallerSeleccionado}
                />

              </div>
            </div>
        )}

      </div>
  );
}
