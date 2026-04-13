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
      <div className="w-full h-full p-4 md:p-8">
        <MenuCrearBorrar
            title="Gestión de Talleres"
            listaElementos2={listaEventos}
            definirTipoElemento="taller"
            onViewItem={handleAbrirModal}
        />

        {/* Modal para ver/editar detalles */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
                <button
                    onClick={handleCerrarModal}
                    className="absolute top-4 right-6 text-white bg-black/50 hover:bg-black w-10 h-10 rounded-full flex items-center justify-center transition-all z-50 cursor-pointer"
                    title="Cerrar"
                >
                  ✕
                </button>
                
                <div className="overflow-y-auto h-full">
                  <DetallesEditarTaller
                      key={tallerSeleccionado?.id || 'new'} 
                      tallerData={tallerSeleccionado}
                  />
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
