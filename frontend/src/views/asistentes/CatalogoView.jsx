// Aqui se inserta el apartado de catalogo

import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom'; // navegación entre componentes(ir a pagos)

export default function CatalogoView() {
  // Estado para navegar
  const navigate = useNavigate(); //
  //Estados agregados para botón registrar, controlando el flujo
  const [ponenciaARegistrar, setPonenciaARegistrar] = useState(null);
  const [pasoConfirmacion, setPasoConfirmacion] = useState(false);
  
  
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

  const manejarRegistro = (p) => {
    setPonenciaARegistrar(p);
    setPasoConfirmacion(false); // Reiniciamos al paso 1 (Confirmación)
  };

  const confirmarFinal = () => {
    setPasoConfirmacion(true); // Pasamos al paso 2 (Éxito)
  };

  const cerrarModal = () => {
    setPonenciaARegistrar(null);
    setPasoConfirmacion(false);
  };

  return (
    <div className="p-8 bg-base-100 min-h-full">
      {/* Encabezado de la página */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-neutral mb-2">Catálogo</h1>
        <h2 className="text-3xl font-bold text-left opacity-80 text-neutral">Disponibles</h2>
      </div>

      {/* Contenedor de las tarjetas */}
      <div className="flex flex-col items-center gap-8">
        {ponencias.map((p) => (
          <div key={p.id} className="card bg-base-100 border border-base-300 shadow-sm max-w-3xl w-full rounded-md p-8 hover:shadow-md transition-all">
            <div className="text-center space-y-4">
              <p className="text-xl font-bold leading-tight text-neutral">Título Ponencia: <span className="font-normal italic">"{p.titulo}"</span></p>
              <div className="text-neutral/90">
                <p className="font-bold">Nombre Ponente: <span className="font-normal">{p.ponente}</span></p>
                <p className="font-bold">Modalidad: <span className="font-normal">{p.modalidad}</span></p>
                <p className="font-bold">Lugar: <span className="font-normal">{p.lugar}</span></p>
              </div>
             {/* Separador visual usando base-200 */}
              <div className="flex justify-center gap-12 py-3 border-y border-base-200 bg-base-200/50 rounded-lg text neutral">
                <p className="font-bold">Fecha: <span className="font-normal">{p.fecha}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{p.hora}</span></p>
              </div>

              <p className="text-justify text-sm leading-relaxed text-neutral/80">
                <span className="font-bold">Sinopsis: </span>{p.sinopsis}
              </p>

              {/* Footer de la tarjeta con botón usando el color Primary (#001219) */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-200">
                <p className="text-2xl font-bold text-neutral">Costo: <span className="text-primary font-black">{p.costo}</span></p>
                
                {/* Botón de DaisyUI con color primary y efecto hover automático */}
                <button 
                onClick={() => manejarRegistro(p)}
                className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300">
                  Registrarme
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    
  {/* --- MODAL DE REGISTRO  --- */}
      {ponenciaARegistrar && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-neutral/40 backdrop-blur-sm" onClick={cerrarModal}></div>

          {/* Caja del Modal */}
          <div className="relative bg-base-100 border border-base-300 w-full max-w-md p-8 rounded-2xl shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            
            {!pasoConfirmacion ? (
              /* PASO 1: CONFIRMAR O RECHAZAR */
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary">Confirmar Registro</h3>
                <p className="text-neutral leading-relaxed">
                  ¿Estás seguro que deseas inscribirte a la ponencia: <br/>
                  <span className="font-bold italic">"{ponenciaARegistrar.titulo}"</span>?
                </p>
                <div className="flex gap-4 justify-center pt-2">
                  <button onClick={cerrarModal} className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300">
                    Rechazar
                  </button>
                  <button onClick={confirmarFinal} className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300">
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              /* PASO 2: ÉXITO Y REDIRECCIÓN */
              <div className="space-y-6">
                <div className="text-secondary text-6xl">✓</div>
                <h3 className="text-2xl font-bold text-neutral">¡Registro Exitoso!</h3>
                <p className="text-neutral text-sm opacity-90">
                  Tu inscripción se ha realizado correctamente. El cargo ya se encuentra reflejado en tu apartado de pagos.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => navigate('/asistente/pagos')}
                    className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300"
                  >
                    Ir a Pagos
                  </button>
                  <button onClick={cerrarModal} className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300">
                    Seguir aquí
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
