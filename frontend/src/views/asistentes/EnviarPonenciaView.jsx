// Aqui se inserta el apartado de enviar ponencia

import React, { useState, useEffect } from 'react';
import { FaTrashCan } from "react-icons/fa6";
//campos a llenar 
export default function EnviarPonenciaView() {
  const [tipoParticipacion, setTipoParticipacion] = useState('');
  const [ejeTematico, setEjeTematico] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState('');
  const [autor, setAutor] = useState('');
  const [titulo, setTitulo] = useState('');
  const [palabrasClave, setPalabrasClaves] = useState('');
  const [resumen, setResumen] = useState('');
  //coautor(es)
  const [coautores, setCoautores] = useState([]);
  const [mostrarCoautores, setMostrarCoautores] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Limpiar el mensaje despues de 5 segundos
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ texto: '', tipo: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  //inicia coautores, crea un espacio vacio para que aparezca el primer input
  const parteCoautores = () => {
    setMostrarCoautores(true);
    if (coautores.length == 0) {
      setCoautores([{ nombre: '', email: '' }]);
    }
  }
  //se agregan al arreglo los coautores que se necesiten
  const agregarCoautor = () => {
    setCoautores([...coautores, { nombre: '', email: '' }]);
  };
  //actualiza el arreglo para ir agregando los nuevos
  const actualizaCoautor = (index, campo, valor) => {
    const nuevos = [...coautores];
    nuevos[index][campo] = valor;
    setCoautores(nuevos);
  };
  //elimina los coautores por posicion
  const eliminarCoautor = (indexEliminar) => {
    const nuevos = coautores.filter((_, index) => index !== indexEliminar);
    setCoautores(nuevos);
    //por si no hay coautores regresa al boton inicial de agregar coautores
    if (nuevos.length == 0) {
      setMostrarCoautores(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numPalabras > 250) {
      setMensaje({ texto: 'El resumen no puede exceder las 250 palabras.', tipo: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          'Authorization': `Bearer ${localStorage.getItem('congress_access')}`
        },
        body: JSON.stringify({
          titulo,
          autor,
          coautores: validCoautores,
          tipoParticipacion,
          ejeTematico,
          tipoTrabajo,
          palabrasClave,
          resumen
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

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Enviar Ponencia</h1>
      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
          <span>{mensaje.texto}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

        {/*espacio de la parte de autor*/}
        <label className="font-bold">Autor *</label>
        <input
          type="text"
          placeholder="Autor de la ponencia"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        {/*espacio, boton para coautor o caoutores*/}
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
        {/*espacio de la parte de titulo*/}
        <label className="font-bold">Título *</label>
        <input
          type="text"
          placeholder="Título de la ponencia"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        {/*espacio de la parte de tipo de participacin*/}
        <label className="font-bold">Tipo de participación *</label>
        <select value={tipoParticipacion} onChange={(e) => setTipoParticipacion(e.target.value)}
          className="input input-bordered w-full" required>
          <option value="">Selecciona una opción</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
        {/*espacio de la parte de eje tematico*/}
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
          <option value="educacion para la paz">Educación para la paz y Objetivos del Desarrollo Sostenible (Agenda 2023)</option>
          <option value="educacion para la sostenibilidad">Educación para la sostenibilidad</option>
          <option value="estrategias de diseño curricular">Estrategias de diseño curricular, principios y desafíos</option>
          <option value="estudios multidisciplinarios">Estudios Multidisciplinarios</option>
          <option value="evaluacion del aprendizaje">Evaluación del Aprendizaje</option>
          <option value="evalucaion de entorno e-learning">Evaluación en entornos de e-learning</option>
          <option value="evaluacion y aseguramiento de la calidad">Evaluación y aseguramiento de la calidad en la educación: Marcos Normativos</option>
          <option value="experiencias educativas steam">Experiencias educativas STEAM</option>
          <option value="flexibilidad cuurricular">Flexibilidad Curricular</option>
          <option value="fomento carreras steam">Fomento de carreras STEAM en estudios pre-universitarios</option>
          <option value="gestion institucional y gobernanza">Gestión institucional y gobernanza de la educación</option>
          <option value="inclusion y equidad">Inclusión y equidad en la educación</option>
          <option value="ia en la educacion">Inteligencia Artificial en educación</option>
          <option value="modalidades">Modalidades</option>
          <option value="necesidad del mercado laboral">Necesidades del mercado laboral</option>
          <option value="nuevos desafios para la educacion superior">Nuevos desafíos para el área de educación superior</option>
          <option value="politica institucional de cultura de paz y la prevencion de violencia">Políticas institucionales universitarias de Cultura de Paz y la prevención de violencia</option>
          <option value="practicas de innovacion pedagogico-didactica">Prácticas de innovación pedagógico-didáctica</option>
          <option value="practicas educativas, tendencias y problemas">Prácticas educativas, tendencias y problemas</option>
          <option value="problemas y tendencias en educacion tecnologica">Problemas y tendencias en educación tecnológica</option>
          <option value="problemas y tendencias de empleabilidad">Problemas y tendencias de empleabilidad</option>
          <option value="realidad aumentada o virtual">Realidad aumentada o virtual</option>
          <option value="redes universitarias">Redes universitarias</option>
          <option value="retos del desarrollo de habilidades del siglo XXI">Retos del desarrollo de habilidades del siglo XXI</option>
        </select>
        {/*espacio de la parte de tipo de trabajo*/}
        <label className="font-bold">Tipo de trabajo *</label>
        <select value={tipoTrabajo} onChange={(e) => setTipoTrabajo(e.target.value)}
          className="input input-bordered w-full" required>
          <option value="">Selecciona una opción</option>
          <option value="reflexiones o experiencias">Reflexiones o experiencias: expondrán observaciones, experiencias y conclusiones de los autores sobre la docencia universitaria y media superior. Para el caso de las experiencias se puede integrar</option>
          <option value="Investigacion en educacion">Investigación en educación: trabajos de investigaciones concluidas.</option>
          <option value="avances de tesis">Avances de tesis de posgrado (no protocolos) únicamente que traten temas del ámbito educativo.</option>
        </select>
        {/*espacio de la parte de palabras clave*/}
        <label className="font-bold">Palabras clave *</label>
        <input
          type="text"
          placeholder="Palabras clave"
          value={palabrasClave}
          onChange={(e) => setPalabrasClaves(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        {/*espacio de la parte de resumen*/}
        <label className="font-bold">Resumen (abstract) *</label>
        <textarea
          placeholder="Escribe tu resumen (abstract) de máximo 250 palabras"
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          className={`textarea textarea-bordered w-full ${numPalabras > 250 ? 'textarea-error focus:border-red-500 focus:ring-red-500 border-red-500' : ''}`}
          rows={5}
          required
        />
        <p className={`text-sm ${numPalabras > 250 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
          {numPalabras} / 250 palabras
          {numPalabras > 250 && " (Has excedido el límite de 250 palabras)"}
        </p>
        {/*espacio del boton enviar*/}
        <button type="submit" className="btn btn-primary">
          Enviar
        </button>
      </form>

    </div>
  );
}