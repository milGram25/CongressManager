// Aqui se inserta el apartado de mis ponencias

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPonencias } from '../../api/ponenciasApi';

export default function MisPonenciasView() {
  const [ponenciaSeleccionada, setPonenciaSeleccionada] = useState(null);
  const [misPonencias, setMisPonencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarMisPonencias = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await getMisPonencias(token);
        setMisPonencias(data);
      } catch (error) {
        console.error("Error al cargar ponencias del asistente", error);
      } finally {
        setCargando(false);
      }
    };
    cargarMisPonencias();
  }, []);

  return (
    <div className="p-8 bg-base-100 min-h-full relative">
      <h1 className="text-4xl font-bold text-neutral mb-8">Mis Ponencias</h1>

      {/* Listado de Ponencias */}
      <div className="flex flex-col items-center gap-6">
        {cargando ? (
           <p className="py-10">Conectando con Servidor...</p>
        ) : misPonencias.length === 0 ? (
           <p className="py-10 text-base-content/50 italic bg-base-100 p-8 rounded-xl shadow-sm border border-dashed border-base-300">
             Aún no has registrado ninguna ponencia en el congreso.
           </p>
        ) : (
          misPonencias.map((relacion) => {
            const p = relacion.ponencia_detalle || {};
            const e = relacion.evento_info || {};
            const estatus = (p.resumen_detalle?.estatus || '').toLowerCase();
            const tieneExtenso = p.id_extenso !== null;

            return (
              <div key={relacion.id_ponente_has_ponencia} className="card bg-base-100 border border-base-300 p-8 max-w-2xl w-full relative shadow-sm hover:shadow-md transition-all">
                <div className="text-center space-y-4">
                  {/* Se extrae titulo de extenso si lo hay o de evento, si no, uno general */}
                  <h3 className="text-xl font-bold italic">Título Ponencia: "{p.extenso_detalle?.titulo || e.nombre || 'Propuesta en Revisión'}"</h3>
                  <p className="font-bold">Lugar: <span className="font-normal">{'TBD...'}</span></p>
                  
                  <div className="flex justify-center gap-10 py-2 border-y border-base-200">
                    <p className="font-bold">Fecha: <span className="font-normal">{e.fecha_hora ? new Date(e.fecha_hora).toLocaleDateString() : 'Pendiente'}</span></p>
                    <p className="font-bold">Hora: <span className="font-normal">{e.fecha_hora ? new Date(e.fecha_hora).toLocaleTimeString() : 'Pendiente'}</span></p>
                  </div>
                  
                  <p className="font-bold">Cupos disponibles: <span className="font-normal">{e.cupos || '0'}</span></p>
                  
                  {/* Etiqueta para Estatus de Dictamen */}
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Estado del Dictamen:</span>
                    <div className={`badge badge-lg mt-2 font-bold uppercase ${estatus === 'aceptado' ? 'badge-success text-white' : 'bg-base-200'}`}>
                      {p.resumen_detalle?.estatus || 'EN REVISIÓN'}
                    </div>
                  </div>

                  {/* Botón para subir extenso condicional */}
                  {estatus === 'aceptado' && !tieneExtenso && (
                    <div className="pt-4">
                      <button 
                        onClick={() => navigate(`/asistente/subir-extenso/${p.id_ponencia}`)}
                        className="btn btn-primary btn-wide font-bold"
                      >
                        Subir Extenso
                      </button>
                    </div>
                  )}
                  {tieneExtenso && (
                    <div className="pt-2 text-xs font-bold text-success uppercase">
                      ✓ Documento Extenso Entregado
                    </div>
                  )}
                </div>

                {/* Botón + para abrir el modal */}
                <button 
                  onClick={() => setPonenciaSeleccionada(relacion)}
                  className="absolute bottom-4 right-4 btn btn-primary btn-circle btn-sm text-2xl pb-1"
                >
                 +
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* --- VENTANA EMERGENTE (MODAL) --- */}
      {ponenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-box relative shadow-2xl p-10 flex flex-col items-center">
            
          {/* Botón de regreso */}
          <button 
            type="button" 
            onClick={() => setPonenciaSeleccionada(null)} 
            className="absolute top-6 left-6 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all group"
          >
            <span className="text-white text-4xl font-black leading-none -mt-1 select-none">
              ←
            </span>
          </button>

            <div className="text-center space-y-4 mt-6 w-full">
              <h2 className="font-bold text-lg text-primary uppercase tracking-wide">Título:</h2>
              <p className="italic font-medium text-xl">"{ponenciaSeleccionada.ponencia_detalle?.extenso_detalle?.titulo || ponenciaSeleccionada.evento_info?.nombre || 'Propuesta'}"</p>
              
              <p className="font-bold">Lugar: <span className="font-normal">{'TBD...'}</span></p>
              
              <div className="flex justify-center gap-10 py-3 border-y border-base-200 w-full my-4">
                <p className="font-bold">Fecha: <span className="font-normal">{ponenciaSeleccionada.evento_info?.fecha_hora ? new Date(ponenciaSeleccionada.evento_info.fecha_hora).toLocaleDateString() : 'Pendiente'}</span></p>
                <p className="font-bold">Hora: <span className="font-normal">{ponenciaSeleccionada.evento_info?.fecha_hora ? new Date(ponenciaSeleccionada.evento_info.fecha_hora).toLocaleTimeString() : 'Pendiente'}</span></p>
              </div>

              <p className="font-bold">Cupos disponibles: <span className="font-normal">{ponenciaSeleccionada.evento_info?.cupos || '0'}</span></p>
              
              <div className="pt-4 text-justify w-full">
                <p className="font-bold text-center mb-2">Comentarios / Retroalimentación de los Jueces:</p>
                <p className="leading-relaxed text-neutral text-sm bg-base-200 p-4 rounded-xl border border-base-300">
                  {ponenciaSeleccionada.ponencia_detalle?.resumen_detalle?.retroalimentacion || 
                   "Tu documento está siendo procesado por el equipo de revisión. Recibirás comentarios pronto..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
