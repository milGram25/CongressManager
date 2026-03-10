// Aqui se inserta el apartado de catalogo
//export default function CatalogoView() {
  //return <div className="flex h-full items-center justify-center text-2xl opacity-50">Catálogo View</div>;
//}
import React from 'react';

export default function CatalogoView() {
  // Datos de las ponencias (puedes añadir más aquí siguiendo el mismo formato)
  const ponencias = [
    {
      id: 1,
      titulo: "Movilización del conocimiento y la ciencia abierta: Horizontes en el presente y futuro de la educación",
      ponente: "Juan González Ruiz",
      modalidad: "Presencial",
      lugar: "Centro Universitario de Ciencias Económico Administrativas (CUCEA)",
      fecha: "30 - Abril - 2026",
      hora: "10:00 am",
      sinopsis: "Se verá la importancia de compartir, difundir y aplicar el conocimiento científico de manera accesible y colaborativa. Analizaremos cómo la ciencia abierta transforma los procesos de enseñanza, aprendizaje e investigación.",
      costo: "$150 MXN"
    },
    {
      id: 2,
      titulo: "Ética, Regulación y Transparencia en los Sistemas de Inteligencia Artificial de Nueva Generación",
      ponente: "Luis Cabrera Donosa",
      modalidad: "Presencial",
      lugar: "Centro Universitario de los Altos (CUALTOS)",
      fecha: "13 - Mayo - 2026",
      hora: "12:00 pm",
      sinopsis: "Reunirá políticas públicas para analizar los desafíos éticos del uso creciente de la inteligencia artificial en sectores como salud, educación e industria.",
      costo: "$100 MXN"
    }
  ];

  return (
    <div className="flex flex-col min-h-full p-8 bg-white">
      {/* Encabezado de la página */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Catálogo</h1>
        <h2 className="text-3xl font-bold text-left text-gray-700">Disponibles</h2>
      </div>

      {/* Contenedor de las tarjetas */}
      <div className="flex flex-col items-center gap-10">
        {ponencias.map((p) => (
          <div key={p.id} className="border-2 border-gray-300 p-8 max-w-3xl w-full rounded-sm shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="text-center space-y-3">
              <p className="font-bold text-xl">Título Ponencia: <span className="font-normal italic">"{p.titulo}"</span></p>
              <p className="font-bold">Nombre Ponente: <span className="font-normal">{p.ponente}</span></p>
              <p className="font-bold">Modalidad: <span className="font-normal">{p.modalidad}</span></p>
              <p className="font-bold">Lugar: <span className="font-normal">{p.lugar}</span></p>
              
              {/* Sección de Fecha y Hora */}
              <div className="flex justify-center gap-16 py-3 border-y border-gray-100 my-4">
                <p className="font-bold">Fecha: <span className="font-normal">{p.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{p.hora}</span></p>
              </div>

              {/* Sinopsis */}
              <p className="text-justify leading-relaxed">
                <span className="font-bold">Sinopsis: </span>{p.sinopsis}
              </p>

              {/* Fila de Costo y Botón */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
                <p className="font-bold text-2xl">Costo: <span className="font-normal text-blue-600">{p.costo}</span></p>
                <button className="bg-gray-100 px-8 py-2 rounded-lg font-bold border border-gray-400 hover:bg-black hover:text-white transition-all uppercase text-sm">
                  Registrarme
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
