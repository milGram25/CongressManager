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
      { id: 1, texto: "Es conciso?", aprobado: false },
      { id: 2, texto: "Es util?", aprobado: true },
      { id: 3, texto: "Es claro?", aprobado: true },
    ],
    comentario: "La informacion presentada es pertinente, pero requiere una conclusion mas precisa y mejor conexion con el objetivo principal.",
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
      { id: 1, texto: "Es conciso?", aprobado: false },
      { id: 2, texto: "Es util?", aprobado: false },
      { id: 3, texto: "Es claro?", aprobado: true },
    ],
    comentario: "La propuesta tiene potencial, aunque todavia necesita delimitar el problema y mejorar la estructura de resultados esperados.",
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
      { id: 1, texto: "Es conciso?", aprobado: true },
      { id: 2, texto: "Es util?", aprobado: true },
      { id: 3, texto: "Es claro?", aprobado: true },
    ],
    comentario: "El resumen tiene una estructura consistente y el aporte metodologico esta bien justificado.",
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
      { id: 1, texto: "Es conciso?", aprobado: false },
      { id: 2, texto: "Es util?", aprobado: false },
      { id: 3, texto: "Es claro?", aprobado: false },
    ],
    comentario: "Sin comentarios disponibles. El trabajo aun no cuenta con dictaminacion activa.",
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
      { id: 1, texto: "Es conciso?", aprobado: true },
      { id: 2, texto: "Es util?", aprobado: true },
      { id: 3, texto: "Es claro?", aprobado: true },
    ],
    comentario: "Trabajo aceptado. La propuesta es clara, consistente y con una aplicacion directa bien documentada.",
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
      { id: 1, texto: "Es conciso?", aprobado: true },
      { id: 2, texto: "Es util?", aprobado: false },
      { id: 3, texto: "Es claro?", aprobado: true },
    ],
    comentario: "El trabajo presenta contexto suficiente, aunque conviene profundizar el valor academico de las fuentes consultadas.",
  },
];

// Apartado de preguntas con estatus aprobado o no aprobado
function QuestionStatusRow({ pregunta }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-700">{pregunta.texto}</span>
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
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Informacion de resumen</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Titulo:</span> {resumen.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {resumen.autores.join(" / ")}</p>
            <p><span className="font-semibold text-slate-900">Dictaminadores:</span> {revisores.length > 0 ? revisores.map((revisor) => revisor.nombre).join(" / ") : "Sin asignar"}</p>
            <p><span className="font-semibold text-slate-900">Subarea:</span> {resumen.subarea}</p>
            <p><span className="font-semibold text-slate-900">Tipo de trabajo:</span> {resumen.tipoTrabajo}</p>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Preguntas de evaluacion</h3>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Puntuacion</p>
              <p className="text-[34px] font-black leading-none text-slate-800">
                {resumen.puntuacion.obtenida}
                <span className="text-[22px] text-slate-500">/{resumen.puntuacion.total}</span>
              </p>
            </div>
          </div>

          <div className="mt-3">
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
        <div className="h-12 w-1.5 rounded-full bg-[#000000]" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[42px] font-black leading-none tracking-tight text-[#000000]">Revision</h2>
          <p className="text-lg font-semibold text-slate-400">Evaluacion de resumenes y asignacion de evaluadores</p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[52.5%_43.5%]">
        <ResumenDetailCard resumen={viewItem} revisores={revisoresAsignados} />

        <div className="space-y-4">
          <ListaResumenes
            listaElementos={items}
            dictaminadores={MOCK_DICTAMINADORES}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />
        </div>
      </section>
    </div>
  );
}
