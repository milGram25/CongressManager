import React, { useState, useEffect } from 'react';
import { FaTrashCan } from "react-icons/fa6";
import { MdLock, MdLibraryBooks } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { getMisInscripcionesApi } from '../../api/agendaApi';
import { API_URL } from '../../api/constants';
import { useAuth } from '../../context/AuthContext';

export default function EnviarPonenciaView() {
  const accessToken = localStorage.getItem('congress_access');
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  const [congresosInscritos, setCongresosInscritos] = useState([]);
  const [loadingCongresos, setLoadingCongresos] = useState(true);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [subareas, setSubareas] = useState([]);
  const [loadingSubareas, setLoadingSubareas] = useState(false);

  const [tipoParticipacion, setTipoParticipacion] = useState('');
  const [ejeTematico, setEjeTematico] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState('');
  const [autor, setAutor] = useState('');
  const [titulo, setTitulo] = useState('');
  const [palabrasClave, setPalabrasClaves] = useState('');
  const [resumen, setResumen] = useState('');
  const [coautores, setCoautores] = useState([]);
  const [mostrarCoautores, setMostrarCoautores] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    getMisInscripcionesApi(accessToken)
      .then(data => setCongresosInscritos(data.congresos ?? []))
      .catch(() => setCongresosInscritos([]))
      .finally(() => setLoadingCongresos(false));
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) { setTiposTrabajo([]); return; }
    setLoadingTipos(true);
    setTipoTrabajo('');
    fetch(`${API_URL}/api/congresos/tipos-trabajo/?id_congreso=${selectedCongreso}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setTiposTrabajo(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setTiposTrabajo([]))
      .finally(() => setLoadingTipos(false));
  }, [selectedCongreso, accessToken]);

  useEffect(() => {
    setLoadingSubareas(true);
    fetch(`${API_URL}/api/congresos/subareas/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setSubareas(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setSubareas([]))
      .finally(() => setLoadingSubareas(false));
  }, [accessToken]);

  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const parteCoautores = () => {
    setMostrarCoautores(true);
    if (coautores.length === 0) setCoautores([{ nombre: '', email: '' }]);
  };

  const agregarCoautor = () => setCoautores([...coautores, { nombre: '', email: '' }]);

  const actualizaCoautor = (index, campo, valor) => {
    const nuevos = [...coautores];
    nuevos[index][campo] = valor;
    setCoautores(nuevos);
  };

  const eliminarCoautor = (indexEliminar) => {
    const nuevos = coautores.filter((_, i) => i !== indexEliminar);
    setCoautores(nuevos);
    if (nuevos.length === 0) setMostrarCoautores(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numPalabras > 250) {
      setMensaje({ texto: 'El resumen no puede exceder las 250 palabras.', tipo: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!selectedCongreso) {
      setMensaje({ texto: 'Selecciona un congreso.', tipo: 'error' });
      return;
    }
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });
    try {
      const validCoautores = coautores.filter(c => c.nombre.trim() !== '' || c.email.trim() !== '');
      const response = await fetch('http://localhost:8000/api/ponencias/enviar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          titulo,
          autor,
          coautores: validCoautores,
          tipoParticipacion,
          ejeTematico,
          tipoTrabajo,
          palabrasClave,
          resumen,
          id_congreso: selectedCongreso,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje({ texto: 'Ponencia enviada exitosamente', tipo: 'success' });
        await refreshSession();
        setTitulo('');
        setAutor('');
        setCoautores([]);
        setMostrarCoautores(false);
        setTipoParticipacion('');
        setEjeTematico('');
        setTipoTrabajo('');
        setPalabrasClaves('');
        setResumen('');
        navigate('/ponente/estatus-ponencia');
      } else if (response.status === 402) {
        const congreso = congresosInscritos.find(c => String(c.id_congreso) === String(selectedCongreso));
        const nombre = congreso?.nombre_congreso || '';
        navigate(`/asistente/pagos?id_congreso=${selectedCongreso}&nombre=${encodeURIComponent(nombre)}`);
        return;
      } else {
        setMensaje({ texto: data.detail || 'Error al enviar la ponencia', tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión. Intenta de nuevo.', tipo: 'error' });
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const numPalabras = resumen.trim() === '' ? 0 : resumen.trim().split(/\s+/).length;

  if (loadingCongresos) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (congresosInscritos.length === 0) {
    return (
      <div className="p-8 bg-base-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Enviar Ponencia</h1>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="p-5 bg-base-200 rounded-full">
            <MdLock className="text-5xl text-base-content/40" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Inscripción requerida</h2>
            <p className="text-slate-500 max-w-sm">
              Para enviar una ponencia debes estar inscrito y haber pagado en al menos un congreso.
            </p>
          </div>
          <a href="/ponente/pagos" className="btn btn-primary rounded-xl gap-2">
            <MdLibraryBooks size={18} />
            Ver congresos disponibles
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Enviar Ponencia</h1>

      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
          <span>{mensaje.texto}</span>
        </div>
      )}

      <div className="mb-6 p-5 bg-white rounded-2xl shadow-sm border border-black/10">
        <label className="font-bold block mb-2">Congreso al que envías tu ponencia *</label>
        <select
          className="select select-bordered w-full rounded-xl"
          value={selectedCongreso ?? ''}
          onChange={e => setSelectedCongreso(e.target.value || null)}
          required
        >
          <option value="">Selecciona un congreso</option>
          {congresosInscritos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </div>

      {selectedCongreso && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <label className="font-bold">Autor *</label>
          <input
            type="text"
            placeholder="Autor de la ponencia"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          {!mostrarCoautores && (
            <button type="button" onClick={parteCoautores} className="btn btn-primary w-fit">
              Agregar Coautor
            </button>
          )}
          {mostrarCoautores && (
            <div className="flex flex-col gap-2">
              {coautores.map((coautor, index) => (
                <div key={index} className='flex items-center gap-2 mb-2'>
                  <label className="font-bold">{index + 1}.</label>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder={`Nombre coautor ${index + 1}`}
                      value={coautor.nombre}
                      onChange={(e) => actualizaCoautor(index, 'nombre', e.target.value)}
                      className="input input-bordered w-full"
                    />
                    <input
                      type="email"
                      placeholder={`Correo Electrónico Coautor ${index + 1}`}
                      value={coautor.email}
                      onChange={(e) => actualizaCoautor(index, 'email', e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <button type="button" onClick={() => eliminarCoautor(index)} className="btn btn-base btn-sm">
                    <FaTrashCan />
                  </button>
                </div>
              ))}
              <button type="button" onClick={agregarCoautor} className="btn btn-primary w-fit">
                Agregar otro coautor
              </button>
            </div>
          )}

          <label className="font-bold">Título *</label>
          <input
            type="text"
            placeholder="Título de la ponencia"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          <label className="font-bold">Tipo de participación *</label>
          <select value={tipoParticipacion} onChange={(e) => setTipoParticipacion(e.target.value)}
            className="input input-bordered w-full" required>
            <option value="">Selecciona una opción</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>

          <label className="font-bold">Eje Temático *</label>
          <select value={ejeTematico} onChange={(e) => setEjeTematico(e.target.value)}
            className="input input-bordered w-full" required disabled={loadingSubareas}>
            <option value="">
              {loadingSubareas ? 'Cargando...' : subareas.length === 0 ? 'Sin ejes temáticos configurados' : 'Selecciona una opción'}
            </option>
            {subareas.map(sub => (
              <option key={sub.id_subareas} value={sub.nombre}>{sub.nombre}</option>
            ))}
          </select>

          <label className="font-bold">Tipo de trabajo *</label>
          <select value={tipoTrabajo} onChange={(e) => setTipoTrabajo(e.target.value)}
            className="input input-bordered w-full" required disabled={loadingTipos}>
            <option value="">
              {loadingTipos ? 'Cargando...' : tiposTrabajo.length === 0 ? 'Sin tipos configurados para este congreso' : 'Selecciona una opción'}
            </option>
            {tiposTrabajo.map(t => (
              <option key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>{t.tipo_trabajo}</option>
            ))}
          </select>

          <label className="font-bold">Palabras clave *</label>
          <input
            type="text"
            placeholder="Palabras clave"
            value={palabrasClave}
            onChange={(e) => setPalabrasClaves(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          <label className="font-bold">Resumen (abstract) *</label>
          <textarea
            placeholder="Escribe tu resumen (abstract) de máximo 250 palabras"
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            className={`textarea textarea-bordered w-full ${numPalabras > 250 ? 'textarea-error focus:border-red-500 border-red-500' : ''}`}
            rows={5}
            required
          />
          <p className={`text-sm ${numPalabras > 250 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {numPalabras} / 250 palabras
            {numPalabras > 250 && " (Has excedido el límite de 250 palabras)"}
          </p>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Enviar'}
          </button>
        </form>
      )}

      {!selectedCongreso && (
        <div className="text-center py-10 text-base-content/40 italic">
          Selecciona un congreso para continuar.
        </div>
      )}
    </div>
  );
}
