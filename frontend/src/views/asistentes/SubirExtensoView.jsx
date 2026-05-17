import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { subirExtensoApi, getResumenDetalleApi, buildMediaUrl } from "../../api/ponenciasApi";
import { MdCloudUpload, MdFileDownload, MdInfoOutline, MdDescription } from "react-icons/md";

export default function SubirExtensoView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isCorreccion = searchParams.get('correccion') === 'true';
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('congress_access');

  const [archivo, setArchivo] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalles, setDetalles] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await getResumenDetalleApi(accessToken, id);
        setDetalles(data);
      } catch (err) {
        console.error("Error cargando detalles del resumen:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, accessToken]);

  const validateFile = (file) => {
    const validExtensions = ['.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValid) {
      setError('Formato no válido. Solo se permiten archivos de Word (.doc, .docx)');
      return false;
    }
    return true;
  };

  const handleFile = (file) => {
    setError(null);
    if (file && validateFile(file)) {
      setArchivo(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) { setError('Selecciona un archivo antes de continuar.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await subirExtensoApi(accessToken, id, archivo);
      navigate('/asistente/estatus-ponencia');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-base-100 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/asistente/estatus-ponencia')}
          className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
        >
          <span className="text-2xl font-bold leading-none select-none">←</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-neutral">
            {isCorreccion ? 'Subir corrección' : 'Subir extenso'}
          </h2>
          <p className="text-xs text-slate-500">ID de trabajo: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sección de descarga de formato */}
        <div className="bg-base-200 p-6 rounded-2xl border border-base-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary">
              <MdDescription className="text-xl" />
              <h3 className="font-bold">Formato guía</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Descarga el formato oficial para estructurar tu documento extenso según las normas del congreso.
            </p>
          </div>
          
          {detalles?.ruta_formato ? (
            <a
              href={buildMediaUrl(detalles.ruta_formato)}
              download
              className="btn btn-outline btn-primary btn-sm rounded-xl gap-2 w-full mt-auto"
            >
              <MdFileDownload className="text-lg" /> Descargar formato
            </a>
          ) : (
            <div className="bg-warning/10 border border-warning/30 p-3 rounded-xl flex items-start gap-2">
              <MdInfoOutline className="text-warning text-lg shrink-0 mt-0.5" />
              <p className="text-[10px] text-warning-content font-medium">
                No hay formatos disponibles para este congreso por el momento.
              </p>
            </div>
          )}
        </div>

        {/* Información del trabajo */}
        <div className="bg-white p-6 rounded-2xl border border-base-300">
          <h3 className="font-bold text-sm mb-2 opacity-50 uppercase tracking-widest text-neutral">Tu ponencia</h3>
          <p className="text-sm font-bold text-primary line-clamp-3 mb-2">
            "{detalles?.titulo || 'Cargando...'}"
          </p>
          <div className="badge badge-outline badge-sm capitalize">
            {detalles?.modalidad || 'Presencial'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-bold text-neutral mb-2 block px-1">Archivo de Word (.doc, .docx)</label>
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : archivo 
                  ? 'border-success/50 bg-success/5' 
                  : 'border-base-300 hover:border-primary/50 bg-base-100'
            }`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {archivo ? (
              <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-2 text-3xl">
                  <MdCloudUpload />
                </div>
                <p className="text-sm font-bold text-neutral truncate max-w-xs mx-auto">{archivo.name}</p>
                <p className="text-[10px] opacity-50">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setArchivo(null); }}
                  className="text-xs text-error font-bold hover:underline"
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <MdCloudUpload className="text-5xl mx-auto text-base-300" />
                <p className="text-neutral text-sm font-medium">Arrastra tu archivo aquí o haz clic para buscar</p>
                <p className="text-[10px] opacity-40">Solo archivos .doc y .docx son aceptados</p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              accept=".doc,.docx"
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
            {!archivo && (
              <label htmlFor="fileUpload" className="btn btn-neutral btn-sm mt-4 rounded-xl px-6">
                Seleccionar archivo
              </label>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error shadow-sm py-2 rounded-xl text-xs font-bold text-white border-none animate-in shake duration-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !archivo}
          className="w-full btn btn-primary rounded-2xl shadow-lg h-14 font-black text-lg disabled:opacity-50"
        >
          {submitting ? (
            <span className="loading loading-spinner" />
          ) : (
            isCorreccion ? 'Enviar corrección' : 'Subir extenso'
          )}
        </button>
        
        <p className="text-[10px] text-center opacity-40 italic">
          Asegúrate de que tu documento cumpla con todas las normas editoriales antes de enviarlo.
        </p>
      </form>
    </div>
  );
}

