import { useMemo, useState } from "react";
import ListaResumenes from "./Componentes/ListaResumenes";
import ListaRevisores from "./Componentes/ListaRevisores";

// Datos de ejemplo para dictaminadores
const MOCK_DICTAMINADORES = [
  { id: 1, nombre: "Ana Garcia", grado: "Dr. en Ciencias Computacionales", institucion: "UNAM", especialidad: "Inteligencia Artificial" },
  { id: 2, nombre: "Luis Martinez", grado: "M.C. en Ingenieria de Software", institucion: "IPN", especialidad: "Desarrollo de Software" },
  { id: 3, nombre: "Maria Sanchez", grado: "Dra. en Bioinformatica", institucion: "CINVESTAV", especialidad: "Biologia Computacional" },
  { id: 4, nombre: "Carlos Lopez", grado: "Ing. en Computacion", institucion: "Cualtos", especialidad: "Redes Computacionales" },
  { id: 5, nombre: "Pedro Ruiz", grado: "M.C. en Sistemas Computacionales", institucion: "ITESM", especialidad: "Ciberseguridad y Redes" },
  { id: 6, nombre: "Elena Torres", grado: "Dra. en Matematicas Aplicadas", institucion: "BUAP", especialidad: "Modelado Estadistico" },
  { id: 7, nombre: "Roberto Diaz", grado: "Dr. en Ingenieria Electrica", institucion: "UAM Iztapalapa", especialidad: "Robotica y Automatizacion" },
];

// Datos de ejemplo para resumenes
const MOCK_RESUMENES = [
  {
    id: 1,
    title: "Internet de las cosas",
    asignado: true,
    revisado: false,
    aceptado: false,
    revisores: [1, 2],
    fechaLimite: "2026-04-15",
    autores: ["Jose Camacho Hernandez", "Arturo Gonzalez"],
    subarea: "Tecnologia",
    tipoTrabajo: "tesis",
    puntuacion: { obtenida: 2, total: 3 },
    preguntas: [
      { id: 1, texto: "¿Es conciso?", aprobado: false, comentario: "Es conciso, pero falla en aterrizar el punto" },
      { id: 2, texto: "¿Es util?", aprobado: true, comentario: "En relación al congreso, es bastante relevante" },
      { id: 3, texto: "¿Es claro?", aprobado: true, comentario: "Hay ciertas inconsistencias en la redacción" },
    ],
  },
  {
    id: 2,
    title: "Programacion e inteligencia artificial",
    asignado: true,
    revisado: false,
    aceptado: false,
    revisores: [4],
    fechaLimite: "2026-04-20",
    autores: ["Marina Orozco", "Pablo Nunez"],
    subarea: "Inteligencia artificial",
    tipoTrabajo: "prototipo",
    puntuacion: { obtenida: 1, total: 3 },
    preguntas: [
      { id: 1, texto: "Es conciso?", aprobado: false, comentario: "Bastante" },
      { id: 2, texto: "Es util?", aprobado: false, comentario: "Mucho" },
      { id: 3, texto: "Es claro?", aprobado: true, comentario: "Bien" },
    ],

  },
  {
    id: 3,
    title: "Biologia y computadoras",
    asignado: true,
    revisado: true,
    aceptado: false,
    revisores: [3, 5],
    fechaLimite: "2026-04-10",
    autores: ["Laura Mendez", "Rosa Ibarra"],
    subarea: "Biologia computacional",
    tipoTrabajo: "investigacion",
    puntuacion: { obtenida: 3, total: 3 },
    preguntas: [
      { id: 1, texto: "Es conciso?", aprobado: true, comentario: "Excelente" },
      { id: 2, texto: "Es util?", aprobado: true, comentario: "Muy util" },
      { id: 3, texto: "Es claro?", aprobado: true, comentario: "Muy claro" },
    ],
  },
  {
    id: 4,
    title: "Analisis geneticos",
    asignado: false,
    revisado: false,
    aceptado: false,
    revisores: [],
    fechaLimite: "2026-05-01",
    autores: ["Marta Salinas"],
    subarea: "Biotecnologia",
    tipoTrabajo: "articulo breve",
    puntuacion: { obtenida: 0, total: 3 },
    preguntas: [
      { id: 1, texto: "Es conciso?", aprobado: false, comentario: "Excelente" },
      { id: 2, texto: "Es util?", aprobado: false, comentario: "No es tan útil" },
      { id: 3, texto: "Es claro?", aprobado: false, comentario: "Más o menos" },
    ],
  },
  {
    id: 5,
    title: "Enfoque estructural de POO",
    asignado: true,
    revisado: true,
    aceptado: true,
    revisores: [6],
    fechaLimite: null,
    autores: ["Daniel Ramirez", "Eva Suarez"],
    subarea: "Ingenieria de software",
    tipoTrabajo: "estudio de caso",
    puntuacion: { obtenida: 3, total: 3 },
    preguntas: [
      { id: 1, texto: "Es conciso?", aprobado: true, comentario: "Bien" },
      { id: 2, texto: "Es util?", aprobado: true, comentario: "Bien" },
      { id: 3, texto: "Es claro?", aprobado: true, comentario: "Bien" },
    ],
  },
  {
    id: 6,
    title: "Las villas de California",
    asignado: true,
    revisado: false,
    aceptado: false,
    revisores: [7],
    fechaLimite: "2026-04-28",
    autores: ["Renata Moreno", "Diego Morales"],
    subarea: "Historia y patrimonio",
    tipoTrabajo: "revision documental",
    puntuacion: { obtenida: 2, total: 3 },
    preguntas: [
      { id: 1, texto: "Es conciso?", aprobado: true, comentario: "Bien" },
      { id: 2, texto: "Es util?", aprobado: false, comentario: "Meh" },
      { id: 3, texto: "Es claro?", aprobado: true, comentario: "Claro" },
      { id: 3, texto: "Es relevante?", aprobado: true, comentario: "Le falta" },
    ],
  },
];

// Apartado de preguntas con estatus aprobado o no aprobado
function QuestionStatusRow({ pregunta }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-200 py-3 last:border-b-0">
      <div className="flex flex-1 items-center gap-2">
        <span className="flex-1 text-sm font-medium text-slate-700">{pregunta.texto}</span>
        <input
          className="flex-[3] text-sm  text-black bg-white border border-slate-400 rounded-full px-3 mr-2 py-1 placeholder:text-slate-400 text-gray-800"
          value={pregunta.comentario || ""} //Comentario específico
          placeholder="Sin comentarios"
          readOnly
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estatus</span>
        <span className={`h-2.5 w-2.5 rounded-full ${pregunta.aprobado ? "bg-green-500" : "bg-red-500"}`} />
      </div>
    </div>
  );
}

// Tarjeta de resumen seleccionado con detalles, preguntas y comentarios del dictaminador
function ResumenDetailCard({ resumen, revisores }) {
  if (!resumen) {
    return (
      <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No hay un resumen seleccionado.</p>
      </article>
    );
  }

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6">
      <div className="space-y-6">
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Información de resumen</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Título:</span> {resumen.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {resumen.autores.join(" / ")}</p>
            <p><span className="font-semibold text-slate-900">Dictaminadores:</span> {revisores.length > 0 ? revisores.map((revisor) => revisor.nombre).join(" / ") : "Sin asignar"}</p>
            <p><span className="font-semibold text-slate-900">Subárea:</span> {resumen.subarea}</p>
            <p><span className="font-semibold text-slate-900">Tipo de trabajo:</span> {resumen.tipoTrabajo}</p>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Preguntas de evaluación</h3>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Puntuación</p>
              <p className="text-[34px] font-black leading-none text-slate-800">
                {resumen.puntuacion.obtenida}
                <span className="text-[22px] text-slate-500">/{resumen.puntuacion.total}</span>
              </p>
            </div>
          </div>

          <div className="mt-3 max-h-[200px] overflow-y-auto">
            {resumen.preguntas.map((pregunta) => (
              <QuestionStatusRow key={pregunta.id} pregunta={pregunta} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Comentarios del dictaminador</h3>
          <div className="mt-4 min-h-[180px] rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {resumen.comentario}
          </div>
        </section>
      </div>
    </article>
  );
}

// Vista de resumenes con lista lateral y detalle central
export default function ProcesosResumenesView() {
  const [items] = useState(MOCK_RESUMENES);
  const [viewItem, setViewItem] = useState(MOCK_RESUMENES[0] ?? null);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem) return [];
    return MOCK_DICTAMINADORES.filter((dictaminador) => viewItem.revisores.includes(dictaminador.id));
  }, [viewItem]);

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revision de resúmenes</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">
            Aquí se gestiona la revisión de resúmenes.
          </p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-2">


        <div className="space-y-4">
          <ListaResumenes
            listaElementos={items}
            dictaminadores={MOCK_DICTAMINADORES}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />

        </div>
        <div className="">
          <ResumenDetailCard resumen={viewItem} revisores={revisoresAsignados} />
        </div>

      </section>
    </div>
  );
}
