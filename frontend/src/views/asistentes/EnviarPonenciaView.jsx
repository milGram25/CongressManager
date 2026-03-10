// Aqui se inserta el apartado de enviar ponencia

import React, {useState} from 'react';
//campos a llenar 
export default function EnviarPonenciaView(){
  const [tipoParticipacion, setTipoParticipacion] = useState('');
  const [ejeTematico, setEjeTematico] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [palabrasClave, setPalabrasClaves] = useState('');
  const [resumen, setResumen] = useState('');

  const handleSubmit=(e) => {
    e.preventDefault();
    console.log(
      {
        tipoParticipacion,
        ejeTematico,
        tipoTrabajo,
        titulo,
        palabrasClave,
        resumen
      }
    );
  };
  return(
    <div classname="p-8 bg-white min-h-screen">
      <h1 classname="text-3xl font-inter mb-6">Enviar Ponencia</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">

        {/*espacio de la parte de tipo de participacin*/}
        <label className="font-bold">Tipo de participación *</label>
        <select value={tipoParticipacion} onChange={(e) => setTipoParticipacion(e.target.value)}
        className="border p-2" required>
          <option value="">Selecciona una opción</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
        {/*espacio de la parte de eje tematico*/}
        <label className="font-bold">Eje Temático *</label>
        <select value={ejeTematico} onChange={(e) => setEjeTematico(e.target.value)}
        className="border p-2" required>
          <option value="">Selecciona una opción</option>
          <option value="alfabetizacion digital">Alfabetización Digital</option>
          <option value="brecha digital">Brecha Digital</option>
          <option value="capacitacion y apoyo a docentes">Capacitación y apoyo a los docentes</option>
        </select>
        {/*espacio de la parte de tipo de trabajo*/}
        <label className="font-bold">Tipo de trabajo *</label>
        <select value={tipoTrabajo} onChange={(e) => setTipoTrabajo(e.target.value)}
        className="border p-2" required>
          <option value="">Selecciona una opción</option>
          <option value="reflexiones o experiencias">Reflexiones o experiencias</option>
          <option value="investigacion en educacion">Investigación en educación</option>
          <option value="avances tesis posgrado">Avances de tesis de posgrado</option>
        </select>
        {/*espacio de la parte de titulo*/}
        <label className="font-bold">Título *</label>
        <input
          type="text"
          placeholder="Título de la ponencia"
          value={titulo}
          onChange={(e)=>setTitulo(e.target.value)}
          className="border p-2"
          required
        />
        {/*espacio de la parte de palabras clave*/}
        <label className="font-bold">Palabras clave *</label>
        <input
          type="text"
          placeholder="Palabras clave"
          value={palabrasClave}
          onChange={(e)=>setPalabrasClaves(e.target.value)}
          className="border p-2"
          required
        />
        {/*espacio de la parte de resumen*/}
        <label className="font-bold">Resumen (abstract) *</label>
        <textarea
          placeholder="Escribe tu resumen (abstract) de máximo 250 palabras"
          value={resumen}
          onChange={(e)=>setResumen(e.target.value)}
          className="border p-2"
          rows={5}
          required
        />
        <p className="text-sm text-gray-500">{resumen.split('').filter(Boolean).length} /250 palabras</p>
        {/*espacio del boton enviar*/}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Enviar
        </button>
      </form>

    </div>
  );

}
