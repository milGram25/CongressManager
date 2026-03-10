// Aqui se inserta el apartado de mis ponencias
//export default function MisPonenciasView() {
  //return <div className="flex h-full items-center justify-center text-2xl opacity-50">Mis Ponencias View</div>;
//}

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
    <div className="p-8 bg-white min-h-full relative">
      <h1 className="text-4xl font-bold mb-8">Mis Ponencias</h1>

      {/* Listado de Ponencias */}
      <div className="flex flex-col items-center gap-6">
        {misPonencias.map((p) => (
          <div key={p.id} className="border border-gray-400 p-8 max-w-2xl w-full relative">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-medium px-4">Título Ponencia: "{p.titulo}"</h3>
              <p className="font-bold">Lugar: <span className="font-normal">{p.lugar}</span></p>
              
              <div className="flex justify-center gap-10">
                <p className="font-bold">Fecha: <span className="font-normal">{p.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{p.hora}</span></p>
              </div>
              
              <p className="font-bold">Cupos disponibles: <span className="font-normal">{p.cupos}</span></p>
            </div>

            {/* Botón + para abrir el modal */}
            <button 
            onClick={() => setPonenciaSeleccionada(p)}
            className="absolute bottom-4 right-4 text-white bg-teal-800 rounded-full w-10 h-10 flex items-center justify-center text-3xl pb-1 hover:bg-teal-700 transition-colors shadow-md"
            >
             +
            </button>
          </div>
        ))}
      </div>

      {/* --- VENTANA EMERGENTE (MODAL) --- */}
      {ponenciaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-400 p-8 max-w-2xl w-full relative shadow-2xl">
            
            {/* Botón de flecha atrás para cerrar */}
            <button 
              onClick={() => setPonenciaSeleccionada(null)}
              className="absolute top-10 left-[-40px] md:left-4 text-3xl hover:scale-110 transition-transform"
            >
              ←
            </button>

            <div className="text-center space-y-4">
              <h2 className="font-bold text-lg">Título:</h2>
              <p className="italic">"{ponenciaSeleccionada.titulo}"</p>
              
              <p className="font-bold">Lugar: <span className="font-normal">{ponenciaSeleccionada.lugar}</span></p>
              
              <div className="flex justify-center gap-10">
                <p className="font-bold">Fecha: <span className="font-normal">{ponenciaSeleccionada.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{ponenciaSeleccionada.hora}</span></p>
              </div>

              <p className="font-bold">Cupos disponibles: <span className="font-normal">{ponenciaSeleccionada.cupos}</span></p>
              
              <div className="pt-4 text-justify">
                <p className="font-bold text-center mb-2">Resumen:</p>
                <p className="leading-relaxed text-gray-700">{ponenciaSeleccionada.resumen}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
