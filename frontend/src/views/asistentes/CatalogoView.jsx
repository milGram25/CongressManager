// Aqui se inserta el apartado de catalogo

import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'; // navegación entre componentes(ir a pagos)
import { registrarPonenciaApi, obtenerCatalogoApi } from '../../api/ponenciasApi';

export default function CatalogoView() {
  // Estado para navegar
  const navigate = useNavigate(); //
  //Estados agregados para botón registrar, controlando el flujo
  const [ponenciaARegistrar, setPonenciaARegistrar] = useState(null);
  const [pasoConfirmacion, setPasoConfirmacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState(null);
  
  
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState(null);
  const [ponencias, setPonencias] = useState([]);

  useEffect(() => {
    const fetchPonencias = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await obtenerCatalogoApi(token);
        setPonencias(data);
      } catch (err) {
        setErrorCatalogo(err.message);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    fetchPonencias();
  }, []);

  const manejarRegistro = (p) => {
    setPonenciaARegistrar(p);
    setPasoConfirmacion(false); // Reiniciamos al paso 1 (Confirmación)
  };

  const confirmarFinal = async () => {
    setLoading(true);
    setErrorRegistro(null);
    try {
      const token = localStorage.getItem("congress_access");
      await registrarPonenciaApi(ponenciaARegistrar.id, token);
      setPasoConfirmacion(true); // Pasamos al paso 2 (Éxito)
      
      // Actualizar el estado local para mostrar el mensaje inmediatamente
      setPonencias((prevPonencias) => 
        prevPonencias.map((p) => 
          p.id === ponenciaARegistrar.id ? { ...p, registrado: true } : p
        )
      );
    } catch (err) {
      setErrorRegistro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setPonenciaARegistrar(null);
    setPasoConfirmacion(false);
    setErrorRegistro(null);
  };

  return (
    <div className="p-8 bg-base-100 min-h-full">
      {/* Encabezado de la página */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-neutral mb-2">Catálogo</h1>
        <h2 className="text-3xl font-bold text-left opacity-80 text-neutral">Disponibles</h2>
      </div>

      {/* Contenedor de las tarjetas */}
      {loadingCatalogo ? (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : errorCatalogo ? (
        <div className="text-center text-error font-bold">{errorCatalogo}</div>
      ) : ponencias.length === 0 ? (
        <div className="text-center text-neutral/70 font-bold py-10">No hay ponencias disponibles en este momento.</div>
      ) : (
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
              <div className="flex justify-end items-center mt-6 pt-4 border-t border-base-200">
                {p.registrado ? (
                  <div className="flex w-full justify-between items-center bg-alt/10 p-4 rounded-lg border border-alt/30">
                    <span className="text-alt font-bold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-alt" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ya estás registrado a este evento
                    </span>
                    <button 
                      onClick={() => navigate('/asistente/agenda')}
                      className="btn bg-transparent border-alt text-alt hover:bg-alt hover:text-white hover:border-alt uppercase font-bold px-6">
                      Ir a Agenda
                    </button>
                  </div>
                ) : (
                  <button 
                  onClick={() => manejarRegistro(p)}
                  className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300">
                    Registrarme
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    
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
                  <button onClick={cerrarModal} className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300" disabled={loading}>
                    Rechazar
                  </button>
                  <button onClick={confirmarFinal} className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300" disabled={loading}>
                    {loading ? 'Confirmando...' : 'Confirmar'}
                  </button>
                </div>
                {errorRegistro && (
                  <div className="text-error text-sm font-semibold mt-2">{errorRegistro}</div>
                )}
              </div>
            ) : (
              /* PASO 2: ÉXITO Y REDIRECCIÓN */
              <div className="space-y-6">
                <div className="text-secondary text-6xl">✓</div>
                <h3 className="text-2xl font-bold text-neutral">¡Registro Exitoso!</h3>
                <p className="text-neutral text-sm opacity-90">
                  Tu inscripción se ha realizado correctamente. Podrás ver el registro en tu Agenda.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => navigate('/asistente/agenda')}
                    className="btn btn-primary btn-outline uppercase font-bold px-8 border-base-300"
                  >
                    Ir a Agenda
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
