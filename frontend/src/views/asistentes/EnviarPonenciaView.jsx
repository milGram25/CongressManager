import React, { useState, useEffect } from 'react';
import { FaTrashCan } from "react-icons/fa6";
import { MdLock, MdLibraryBooks, MdWarningAmber } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { getMisInscripcionesApi } from '../../api/agendaApi';
import { getPagosResumenApi } from '../../api/pagosApi';
import { API_URL } from '../../api/constants';

export default function EnviarPonenciaView() {
  const accessToken = localStorage.getItem('congress_access');
  const navigate = useNavigate();

  const [congresosInscritos, setCongresosInscritos] = useState([]);
  const [loadingCongresos, setLoadingCongresos] = useState(true);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [userPayment, setUserPayment] = useState(null);

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
      .then(data => {
        const list = data.congresos ?? [];
        setCongresosInscritos(list);

        // Lógica de default: el más cercano a futuro o actual
        if (list.length > 0) {
            const now = new Date();
            const future = list.filter(c => new Date(c.fecha_fin) >= now);
            future.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
            
            if (future.length > 0) {
                setSelectedCongreso(future[0].id_congreso);
            } else {
                setSelectedCongreso(list[0].id_congreso);
            }
        }
      })
      .catch(() => setCongresosInscritos([]))
      .finally(() => setLoadingCongresos(false));
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) {
      setTiposTrabajo([]);
      setUserPayment(null);
      return;
    }
    setLoadingTipos(true);
    setTipoTrabajo('');

    // Cargar resumen de pagos para el congreso seleccionado
    getPagosResumenApi(accessToken, selectedCongreso)
      .then(data => setUserPayment(data.user_payment))
      .catch(err => console.error("Error al cargar pagos:", err));

    fetch(`${API_URL}/api/congresos/tipos-trabajo/?id_congreso=${selectedCongreso}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setTiposTrabajo(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setTiposTrabajo([]))
      .finally(() => setLoadingTipos(false));
  }, [selectedCongreso, accessToken]);

  const hasHitLimit = userPayment && userPayment.total_ponencias_count >= (userPayment.paid_slots * 2); // Cada pago base cubre 2 ponencias


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
        setTitulo('');
        setAutor('');
        setCoautores([]);
        setMostrarCoautores(false);
        setTipoParticipacion('');
        setEjeTematico('');
        setTipoTrabajo('');
        setPalabrasClaves('');
        setResumen('');
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
          {hasHitLimit && (
            <div className="alert alert-warning shadow-sm border-none bg-warning/20 text-warning-content rounded-2xl mb-4">
              <MdWarningAmber className="text-2xl shrink-0" />
              <div className="text-xs">
                <p className="font-black uppercase tracking-tight mb-0.5">Aviso de Límite de Pago</p>
                <p>
                  Has alcanzado el límite de ponencias cubiertas por tu pago actual.
                  <b> Puedes enviar esta ponencia</b>, pero no podrá ser aceptada hasta que realices el pago adicional.
                </p>
              </div>
            </div>
          )}
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
            className="input input-bordered w-full" required>
            <option value="">Selecciona una opción</option>
            <option value="alfabetizacion digital">Alfabetización Digital</option>
            <option value="brecha digital">Brecha Digital</option>
            <option value="capacitacion en el proceso de enseñanza">Capacitación en el proceso de enseñanza-aprendizaje de profesores en servicio</option>
            <option value="capacitacion y apoyo a docentes">Capacitación y apoyo a los docentes</option>
            <option value="Competencias genericas">Competencias genéricas</option>
            <option value="competencias genericas y habilidades">Competencias genéricas y habilidades para su desarrollo</option>
            <option value="cara a cara al aprendizaje remoto">De cara a cara al aprendizaje remoto</option>
            <option value="competencias digitales en profesores">Desarrollo de competencias digitales en profesores</option>
            <option value="digitalizacion de la educacion">Digitalización de la educación</option>
            <option value="diseño instruccional">Diseño instruccional y prioridades del plan de estudios</option>
            <option value="educacion continua y desarrollo profesional">Educación continua y desarrollo profesional</option>
            <option value="educacion de posgrado">Educación de posgrado</option>
            <option value="educacion de pregrado">Educación de pregrado</option>
            <option value="fomento de cultura de paz">Educación para el fomento para una Cultura de Paz y la prevención de violencia</option>
            <option value="educacion para la paz">Educación para la paz y Objetivos del Desarrollo Sostenible</option>
            <option value="educacion para la sostenibilidad">Educación para la sostenibilidad</option>
            <option value="estrategias de diseño curricular">Estrategias de diseño curricular, principios y desafíos</option>
            <option value="estudios multidisciplinarios">Estudios Multidisciplinarios</option>
            <option value="evaluacion del aprendizaje">Evaluación del Aprendizaje</option>
            <option value="evalucaion de entorno e-learning">Evaluación en entornos de e-learning</option>
            <option value="evaluacion y aseguramiento de la calidad">Evaluación y aseguramiento de la calidad en la educación</option>
            <option value="experiencias educativas steam">Experiencias educativas STEAM</option>
            <option value="flexibilidad cuurricular">Flexibilidad Curricular</option>
            <option value="fomento carreras steam">Fomento de carreras STEAM en estudios pre-universitarios</option>
            <option value="gestion institucional y gobernanza">Gestión institucional y gobernanza de la educación</option>
            <option value="inclusion y equidad">Inclusión y equidad en la educación</option>
            <option value="ia en la educacion">Inteligencia Artificial en educación</option>
            <option value="modalidades">Modalidades</option>
            <option value="necesidad del mercado laboral">Necesidades del mercado laboral</option>
            <option value="nuevos desafios para la educacion superior">Nuevos desafíos para el área de educación superior</option>
            <option value="politica institucional de cultura de paz">Políticas institucionales universitarias de Cultura de Paz</option>
            <option value="practicas de innovacion pedagogico-didactica">Prácticas de innovación pedagógico-didáctica</option>
            <option value="practicas educativas, tendencias y problemas">Prácticas educativas, tendencias y problemas</option>
            <option value="problemas y tendencias en educacion tecnologica">Problemas y tendencias en educación tecnológica</option>
            <option value="problemas y tendencias de empleabilidad">Problemas y tendencias de empleabilidad</option>
            <option value="realidad aumentada o virtual">Realidad aumentada o virtual</option>
            <option value="redes universitarias">Redes universitarias</option>
            <option value="retos del desarrollo de habilidades del siglo XXI">Retos del desarrollo de habilidades del siglo XXI</option>
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
