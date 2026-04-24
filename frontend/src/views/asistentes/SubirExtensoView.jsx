import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDetallePonencia, subirExtenso } from "../../api/ponenciasApi";

export default function SubirExtensoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ponencia, setPonencia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tituloExtenso, setTituloExtenso] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        const data = await getDetallePonencia(id, token);
        setPonencia(data);
        setTituloExtenso(data.titulo_resumen || "");
      } catch (error) {
        console.error("Error al cargar detalles de ponencia", error);
        alert("No se pudieron cargar los detalles de la ponencia.");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const handleFileChange = (files) => {
    setArchivos(Array.from(files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (archivos.length === 0) {
      alert("Debes seleccionar el archivo del extenso.");
      return;
    }
    
    setEnviando(true);
    try {
      const token = localStorage.getItem("congress_access");
      await subirExtenso(id, tituloExtenso, token);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al subir el extenso.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="p-10 text-center">Cargando datos de la ponencia...</div>;
  if (!ponencia) return <div className="p-10 text-center text-error">Ponencia no encontrada.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all group"
        >
          <span className="text-white text-4xl font-black leading-none -mt-1 select-none">
            ←
          </span>
        </button>
        <h2 className="text-3xl font-bold">Subir Documento Extenso</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4 bg-base-200 p-6 rounded-2xl border border-base-300">
          <h3 className="font-bold uppercase text-xs tracking-widest text-primary">Detalles de la Ponencia</h3>
          <div className="text-sm space-y-2">
            <p><span className="font-bold">Título Propuesta:</span> {ponencia.titulo_resumen}</p>
            <p><span className="font-bold">ID:</span> #{ponencia.id}</p>
            <p><span className="font-bold">Dictaminador:</span> {ponencia.dictaminador}</p>
            <p><span className="font-bold">Estado:</span> <span className="badge badge-success text-white font-bold">{ponencia.estatus_resumen}</span></p>
          </div>
        </div>

        <div className="space-y-4 bg-base-200 p-6 rounded-2xl border border-base-300">
          <h3 className="font-bold uppercase text-xs tracking-widest text-primary">Retroalimentación</h3>
          <p className="text-sm italic">"{ponencia.retroalimentacion}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Título del Trabajo Extenso *</label>
          <input 
            type="text" 
            value={tituloExtenso}
            onChange={(e) => setTituloExtenso(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Ingrese el título definitivo de su trabajo"
            required
          />
        </div>

        <div 
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all ${
            dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-base-300 hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold">Arrastra tu archivo aquí</p>
              <p className="text-sm text-base-content/50">Formatos aceptados: .pdf, .doc, .docx (Max 10MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              id="fileUpload" 
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <label htmlFor="fileUpload" className="btn btn-primary btn-outline px-8">
              O selecciona desde tu equipo
            </label>
          </div>
        </div>

        {archivos.length > 0 && (
          <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="badge badge-success text-white">✓</div>
              <span className="font-medium text-sm">{archivos[0].name}</span>
            </div>
            <button type="button" onClick={() => setArchivos([])} className="text-error hover:underline text-xs font-bold">Quitar</button>
          </div>
        )}

        <button 
          type="submit" 
          disabled={enviando || archivos.length === 0}
          className="btn btn-primary btn-block h-16 text-lg font-black shadow-xl shadow-primary/20"
        >
          {enviando ? <span className="loading loading-spinner"></span> : "SUBIR DOCUMENTOS Y FINALIZAR"}
        </button>
      </form>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center p-10">
            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
            <h3 className="font-bold text-2xl">¡Envío Exitoso!</h3>
            <p className="py-4 text-base-content/60">
              Tu trabajo extenso ha sido recibido correctamente. Ahora será asignado a un revisor para su evaluación final.
            </p>
            <div className="modal-action justify-center">
              <button className="btn btn-primary btn-wide font-bold" onClick={() => navigate('/asistente/mis-ponencias')}>
                Volver a Mis Ponencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}