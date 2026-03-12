// Aqui se inserta el apartado de mis ponencias

import React, { useState } from 'react';

export default function MisPonenciasView() {
  // Estado para controlar el Modal
  const [ponenciaSeleccionada, setPonenciaSeleccionada] = useState(null);

  const misPonencias = [
    {
      id: 1,
      titulo: "Movilización del conocimiento y la ciencia abierta: Horizontes en el presente y futuro de la educación",
      lugar: "CUCEA Auditorio Central",
      fecha: "10 - Marzo - 2026",
      hora: "10:00 am",
      cupos: 40,
      resumen: "La conferencia “Movilización del conocimiento y la ciencia abierta: Horizontes en el presente y futuro de la educación” explorará cómo la ciencia abierta puede convertirse en un motor de transformación educativa. Se abordará la importancia de democratizar el acceso al conocimiento, fortalecer las competencias digitales de docentes y estudiantes, y construir políticas educativas inclusivas que respondan a los retos del futuro."
    },
    {
      id: 2,
      titulo: "Innovación educativa y transformación digital en la universidad contemporánea",
      lugar: "CUCEA Auditorio Central",
      fecha: "20 - Marzo - 2026",
      hora: "11:00 am",
      cupos: 30,
      resumen: "Aquí se abordan los retos y oportunidades que enfrentan las instituciones de educación superior en el contexto de la transformación digital. Se discutirá cómo las tecnologías emergentes, la educación en línea y los recursos abiertos están redefiniendo la enseñanza y el aprendizaje, así como el papel de los docentes en la creación de experiencias más flexibles e inclusivas.."
    }
  ];

  return (
    <div className="p-8 bg-base-100 min-h-full relative">
      <h1 className="text-4xl font-bold text-neutral mb-8">Mis Ponencias</h1>

      {/* Listado de Ponencias */}
      <div className="flex flex-col items-center gap-6">
        {misPonencias.map((p) => (
          <div key={p.id} className="card bg-base-100 border border-base-300 p-8 max-w-2xl w-full relative shadow-sm hover:shadow-md transition-all">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold italic">Título Ponencia: "{p.titulo}"</h3>
              <p className="font-bold">Lugar: <span className="font-normal">{p.lugar}</span></p>
              
              <div className="flex justify-center gap-10 py-2 border-y border-base-200">
                <p className="font-bold">Fecha: <span className="font-normal">{p.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{p.hora}</span></p>
              </div>
              
              <p className="font-bold">Cupos disponibles: <span className="font-normal">{p.cupos}</span></p>
            </div>

            {/* Botón + para abrir el modal */}
            <button 
            onClick={() => setPonenciaSeleccionada(p)}
            className="absolute bottom-4 right-4 btn btn-primary btn-circle btn-sm text-2xl pb-1"
            >
             +
            </button>
          </div>
        ))}
      </div>

      {/* --- VENTANA EMERGENTE (MODAL) --- */}
      {ponenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-box relative shadow-2xl p-10 flex flex-col items-center">
            
            {/* Botón de flecha atrás */}
            <button 
              onClick={() => setPonenciaSeleccionada(null)}
              className="absolute top-6 left-6 btn btn-ghost btn-circle text-3xl"
            >
              ←
            </button>

            <div className="text-center space-y-4 mt-6 w-full">
              <h2 className="font-bold text-lg text-primary uppercase tracking-wide">Título:</h2>
              <p className="italic font-medium text-xl">"{ponenciaSeleccionada.titulo}"</p>
              
              <p className="font-bold">Lugar: <span className="font-normal">{ponenciaSeleccionada.lugar}</span></p>
              
              <div className="flex justify-center gap-10 py-3 border-y border-base-200 w-full my-4">
                <p className="font-bold">Fecha: <span className="font-normal">{ponenciaSeleccionada.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{ponenciaSeleccionada.hora}</span></p>
              </div>

              <p className="font-bold">Cupos disponibles: <span className="font-normal">{ponenciaSeleccionada.cupos}</span></p>
              
              <div className="pt-4 text-justify w-full">
                <p className="font-bold text-center mb-2">Resumen:</p>
                <p className="leading-relaxed text-neutral text-sm">
                  {ponenciaSeleccionada.resumen}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
