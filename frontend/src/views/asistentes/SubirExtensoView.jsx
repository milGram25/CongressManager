import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { subirExtensoApi } from "../../api/ponenciasApi";

export default function SubirExtensoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('congress_access');

  const [archivo, setArchivo] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setArchivo(file);
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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/asistente/estatus-ponencia')}
          className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all"
        >
          <span className="text-white text-4xl font-black leading-none -mt-1 select-none">←</span>
        </button>
        <h2 className="text-xl font-bold">Subir extenso</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Archivo</label>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-primary/50'}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {archivo ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">{archivo.name}</p>
                <p className="text-xs text-slate-400">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <p className="text-primary text-sm">Arrastra tu archivo o haz clic para seleccionarlo</p>
            )}
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              accept=".pdf,.doc,.docx"
              onChange={e => e.target.files[0] && setArchivo(e.target.files[0])}
            />
            <label htmlFor="fileUpload" className="btn btn-outline btn-sm mt-4">
              Seleccionar archivo
            </label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-error bg-error/10 px-4 py-2 rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary rounded-xl disabled:opacity-50"
        >
          {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Subir extenso'}
        </button>
      </form>
    </div>
  );
}
