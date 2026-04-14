import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdFileDownload, MdAssignment, MdComment, MdClose } from 'react-icons/md';
import EvaluationSuccessModal from '../../components/EvaluationSuccessModal';

export default function DetalleRevisionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState('');
  const [comentariosCriterios, setComentariosCriterios] = useState({});
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');

  // ESTADO PARA LA RÚBRICA VARIABLE
  const [rubricas, setRubricas] = useState([
    { id: 1, criterio: "Originalidad y relevancia del tema", opciones: [1, 2, 3, 4, 5] },
    { id: 2, criterio: "Calidad metodológica", opciones: [1, 2, 3, 4, 5] },
    { id: 3, criterio: "Claridad en la exposición de resultados", opciones: [1, 2, 3, 4, 5] },
    { id: 4, criterio: "Calidad de las referencias bibliográficas", opciones: [1, 2, 3, 4, 5] }
  ]);

  const handleCalificacionChange = (id, valor) => {
    setCalificaciones(prev => {
      // Si el valor ya estaba seleccionado, lo quitamos (Toggle)
      if (prev[id] === valor) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }
      // Si no, lo seleccionamos
      return { ...prev, [id]: valor };
    });
  };

  const clearCalificacion = (id) => {
    setCalificaciones(prev => {
      const newCalificaciones = { ...prev };
      delete newCalificaciones[id];
      return newCalificaciones;
    });
  };

  const calcularPromedio = () => {
    const keys = Object.keys(calificaciones);
    if (keys.length === 0) return "0.0";
    const suma = keys.reduce((acc, key) => acc + calificaciones[key], 0);
    // Cada criterio tiene un máximo de 5. Escalamos a base 10:
    // (Suma / (TotalCriterios * 5)) * 10
    return ((suma / (rubricas.length * 5)) * 10).toFixed(1);
  };

  const promedioCalculado = calcularPromedio();
  const porcentajeCalificacion = (parseFloat(promedioCalculado) / 10) * 100;
  const totalEvaluados = Object.keys(calificaciones).length;

  const toggleComentarioCriterio = (id) => {
    const hasContent = comentariosCriterios[id] && comentariosCriterios[id].trim().length > 0;
    
    if (comentariosCriterios[id] !== undefined && hasContent) {
      setConfirmingRemoval(id);
      return;
    }

    forceToggleComentario(id);
  };

  const forceToggleComentario = (id) => {
    setComentariosCriterios(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? '' : undefined
    }));
    setConfirmingRemoval(null);
  };

  const handleComentarioChange = (id, value) => {
    setComentariosCriterios(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Función para auto-ajustar la altura de los textareas
  const autoResize = (e) => {
    const element = e.target;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Mock de datos de la ponencia (esto vendría de una API o del estado global)
  const ponencia = {
    id: id,
    titulo: "Impacto de la Inteligencia Artificial en la Educación Superior 2026",
    autores: "Juan Pérez, Maria García",
    resumen: "Este trabajo explora cómo las herramientas de IA generativa están transformando los procesos de enseñanza-aprendizaje en las universidades de América Latina...",
    extenso: { nombre: "Extenso_Final.pdf", tamaño: "2.4 MB" }
  };

  const [showErrors, setShowErrors] = useState(false);

  const handleAction = (decision) => {
    if (totalEvaluados < rubricas.length) {
      setShowErrors(true);
      // Encontrar el primer criterio no evaluado para hacer scroll
      const primeroFaltante = rubricas.find(r => !calificaciones[r.id]);
      if (primeroFaltante) {
        const element = document.getElementById(`rubrica-${primeroFaltante.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    // Aquí iría la lógica para enviar la revisión al backend
    setFinalDecision(decision);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/revisor/revisiones');
  };

  return (
    <div className="space-y-8 pb-20">
      <EvaluationSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseModal} 
        decision={finalDecision} 
        type="revision" 
      />

      <div className="flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Detalle de Revisión</span>
            <h1 className="text-3xl font-bold text-base-content mt-1">{ponencia.titulo}</h1>
            <p className="text-sm text-base-content/40 font-mono mt-1">ID: {ponencia.id}</p>
          </div>
          
          {/* Extenso movido al header de forma compacta */}
          <div className="flex-shrink-0">
            <div className="bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer group">
              <div className="bg-base-200 p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                <MdFileDownload className="text-primary" size={24} />
              </div>
              <div className="flex flex-col pr-4">
                <span className="text-[10px] font-bold text-base-content/40 uppercase leading-none mb-1">Documento Extenso</span>
                <span className="text-sm font-bold text-base-content">{ponencia.extenso.nombre}</span>
                <span className="text-[10px] text-base-content/40">{ponencia.extenso.tamaño}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          
          {/* Rúbricas: Ahora ocupan todo el ancho */}
          <section className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
            <div className="flex items-center gap-2 mb-6 text-base-content font-bold border-b border-base-300 pb-2">
              <MdAssignment size={22} />
              <span>Rúbrica de Evaluación</span>
            </div>
            
            <div className="space-y-8">
              {rubricas.map((rubrica) => (
                <div 
                  key={rubrica.id} 
                  id={`rubrica-${rubrica.id}`}
                  className={`p-4 rounded-xl transition-all border ${
                    showErrors && !calificaciones[rubrica.id] 
                    ? 'border-error/50' 
                    : 'hover:bg-base-200 border-transparent hover:border-base-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-base-content">{rubrica.id}. {rubrica.criterio}</p>
                        {showErrors && !calificaciones[rubrica.id] && (
                          <span className="text-[10px] font-black text-error uppercase tracking-tighter bg-base-100 px-2 py-0.5 rounded-full border border-error/20">
                            ¡Falta responder!
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleComentarioCriterio(rubrica.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          comentariosCriterios[rubrica.id] !== undefined 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'border-base-300 text-base-content/40 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {comentariosCriterios[rubrica.id] !== undefined ? 'Quitar Comentario' : '+ Comentario'}
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 relative">
                          {rubrica.opciones.map((opcion) => (
                            <label key={opcion} className="relative group cursor-pointer">
                              <input 
                                type="radio" 
                                name={`rubrica-${rubrica.id}`} 
                                className="peer hidden" 
                                checked={calificaciones[rubrica.id] === opcion}
                                onChange={() => {}} // Se maneja en el onClick de la caja visual
                              />
                              <div 
                                onClick={() => {
                                  handleCalificacionChange(rubrica.id, opcion);
                                  if (showErrors && Object.keys(calificaciones).length + 1 === rubricas.length) {
                                    setShowErrors(false);
                                  }
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-base-200 text-sm font-bold text-base-content/40 transition-all 
                                peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white
                                hover:border-primary hover:text-primary peer-checked:hover:text-white group-active:scale-90">
                                {opcion}
                              </div>
                            </label>
                          ))}
                          
                          {/* Botón de limpiar minimalista */}
                          {calificaciones[rubrica.id] && (
                            <button 
                              onClick={() => clearCalificacion(rubrica.id)}
                              className="ml-1 p-1 text-base-content/20 hover:text-error transition-colors animate-in fade-in zoom-in duration-200"
                              title="Limpiar selección"
                            >
                              <MdClose size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confirmación integrada */}
                  {confirmingRemoval === rubrica.id && (
                    <div className="mt-4 pt-4 border-t border-primary/10 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
                          <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider">
                            ¿Deseas descartar el comentario escrito?
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setConfirmingRemoval(null)}
                            className="px-6 py-2 text-[10px] font-bold text-primary hover:bg-primary hover:text-white border border-primary rounded-lg transition-all uppercase w-28"
                          >
                            Mantener
                          </button>
                          <button 
                            onClick={() => forceToggleComentario(rubrica.id)}
                            className="px-6 py-2 text-[10px] font-bold text-error hover:bg-error hover:text-white border border-error rounded-lg transition-all uppercase w-28"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campo de comentario desplegable */}
                  {comentariosCriterios[rubrica.id] !== undefined && confirmingRemoval !== rubrica.id && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <textarea
                        value={comentariosCriterios[rubrica.id]}
                        onChange={(e) => handleComentarioChange(rubrica.id, e.target.value)}
                        onInput={autoResize}
                        placeholder={`Observación específica sobre: ${rubrica.criterio}...`}
                        className="w-full min-h-[6rem] p-4 bg-base-100 border-2 border-primary/10 rounded-xl outline-none focus:border-primary transition-all text-sm resize-none overflow-hidden"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>



          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sección de Promedio */}
            <section className="lg:col-span-1 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em] mb-4">Promedio de Revisión</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-base-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * porcentajeCalificacion) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute flex flex-col">
                  <span className="text-4xl font-black text-base-content">{promedioCalculado}</span>
                  <span className="text-[10px] font-bold text-base-content/40 uppercase">/ 10.0</span>
                </div>
              </div>
              <p className="mt-6 text-xs font-bold text-base-content/60">
                {totalEvaluados} de {rubricas.length} criterios evaluados
              </p>
            </section>

            {/* Comentarios del Revisor */}
            <section className="lg:col-span-3 bg-base-100 p-8 rounded-2xl shadow-sm border border-base-300">
              <div className="flex items-center gap-2 mb-4 text-base-content font-bold border-b border-base-300 pb-2">
                <MdComment size={22} />
                <span>Comentarios del Revisor</span>
              </div>
              <textarea 
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                onInput={autoResize}
                placeholder="Escriba aquí sus observaciones detalladas para los autores..."
                className="w-full min-h-[10rem] p-4 bg-base-200 rounded-2xl border-none focus:bg-base-100 focus:ring-2 focus:ring-primary outline-none transition-all text-sm resize-none overflow-hidden"
              ></textarea>
            </section>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              onClick={() => handleAction('ACEPTADO')}
              className="flex-1 bg-success hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-success/20 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Aceptar
            </button>
            <button 
              onClick={() => handleAction('SOLICITUD DE CAMBIOS')}
              className="flex-1 bg-warning hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-warning/20 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Solicitud de cambios
            </button>
            <button 
              onClick={() => handleAction('RECHAZADO')}
              className="flex-1 bg-error hover:brightness-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-error/20 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Rechazar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
