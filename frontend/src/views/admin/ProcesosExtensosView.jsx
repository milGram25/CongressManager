import { useMemo, useState } from "react";
import ListaExtensos from "./Componentes/ListaExtensos";
import ListaRevisores from "./Componentes/ListaRevisores";

// Datos de ejemplo para dictaminadores y extensos
const MOCK_DICTAMINADORES = [
  {
    id: 1,
    nombre: "Ana García",
    grado: "Dr. en Ciencias Computacionales",
    institucion: "UNAM",
    especialidad: "Inteligencia Artificial",
    perfil: "Investigadora con 15 años de experiencia en ML y redes neuronales.",
    email: "ana.garcia@unam.mx",
  },
  {
    id: 2,
    nombre: "Luis Martínez",
    grado: "M.C. en Ingeniería de Software",
    institucion: "IPN",
    especialidad: "Desarrollo de Software",
    perfil: "Docente e investigador enfocado en arquitecturas de software escalables.",
    email: "luis.martinez@ipn.mx",
  },
  {
    id: 3,
    nombre: "María Sánchez",
    grado: "Dra. en Bioinformática",
    institucion: "CINVESTAV",
    especialidad: "Biología Computacional",
    perfil: "Especialista en análisis genómico y modelado computacional de proteínas.",
    email: "m.sanchez@cinvestav.mx",
  },
  {
    id: 4,
    nombre: "Carlos López",
    grado: "ING en computacion",
    institucion: "Cualtos",
    especialidad: "RedesComputacionales",
    perfil: "Especialista en dispositivos Cisco",
    email: "carli_loi9@gmail.com",
  },
  {
    id: 5,
    nombre: "Pedro Ruiz",
    grado: "M.C. en Sistemas Computacionales",
    institucion: "ITESM",
    especialidad: "Ciberseguridad y Redes",
    perfil: "Consultor en seguridad informática con experiencia en protección de infraestructuras críticas.",
    email: "pedro.ruiz@itesm.mx",
  },
  {
    id: 6,
    nombre: "Elena Torres",
    grado: "Dra. en Matemáticas Aplicadas",
    institucion: "BUAP",
    especialidad: "Modelado Estadístico",
    perfil: "Investigadora en análisis de datos masivos y modelos predictivos aplicados a salud pública.",
    email: "e.torres@buap.mx",
  },
  {
    id: 7,
    nombre: "Roberto Díaz",
    grado: "Dr. en Ingeniería Eléctrica",
    institucion: "UAM Iztapalapa",
    especialidad: "Robótica e Automatización",
    perfil: "Especialista en diseño de sistemas embebidos y robótica industrial con enfoque en manufactura.",
    email: "r.diaz@uam.mx",
  },
];

// Datos de ejemplo para extensos
const MOCK_EXTENSOS = [
  {
    id: 1,
    title: "Internet de las cosas",
    asignado: true,
    revisado: false,
    aceptado: false,
    revisores: [1, 2],
    fechaLimite: "2026-04-15",
    autores: ["Jose Camacho Hernandez", "Arturo Gonzalez"],
    subarea: "TECNOLOGIA",
    tipoTrabajo: "tesis",
    puntuacion: { obtenida: 0, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 0, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 0, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 0, maximo: 5 },
    ],
    comentario: "La información presentada es pertinente, pero todavía requiere fortalecer la sección metodológica y la definición del aporte.",
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
    subarea: "INTELIGENCIA ARTIFICIAL",
    tipoTrabajo: "prototipo",
    puntuacion: { obtenida: 6, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 2, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 1, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 3, maximo: 5 },
    ],
    comentario: "Se recomienda clarificar los resultados obtenidos y separar con mayor precision la revision bibliografica del aporte propio.",
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
    subarea: "BIOLOGIA COMPUTACIONAL",
    tipoTrabajo: "investigacion",
    puntuacion: { obtenida: 13, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 4, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 4, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 5, maximo: 5 },
    ],
    comentario: "El extenso cumple con los criterios formales y presenta resultados solidos con una discusion bien sustentada.",
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
    subarea: "BIOTECNOLOGIA",
    tipoTrabajo: "articulo breve",
    puntuacion: { obtenida: 0, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 0, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 0, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 0, maximo: 5 },
    ],
    comentario: "Sin comentarios disponibles. El extenso aun no inicia proceso de evaluacion.",
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
    subarea: "INGENIERIA DE SOFTWARE",
    tipoTrabajo: "estudio de caso",
    puntuacion: { obtenida: 15, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 5, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 5, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 5, maximo: 5 },
    ],
    comentario: "Trabajo aceptado. El documento esta completo, mantiene coherencia metodologica y cumple con la estructura solicitada.",
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
    subarea: "HISTORIA Y PATRIMONIO",
    tipoTrabajo: "revision documental",
    puntuacion: { obtenida: 7, total: 15 },
    rubricas: [
      { id: 1, texto: "Originalidad", calificacion: 3, maximo: 5 },
      { id: 2, texto: "Redaccion", calificacion: 2, maximo: 5 },
      { id: 3, texto: "Claridad", calificacion: 2, maximo: 5 },
    ],
    comentario: "La narrativa es consistente, aunque el texto necesita mayor profundidad en resultados y criterios de analisis historico.",
  },
];

// Cuadrado de la rubrica con color segun calificacion
function RubricaStatusRow({ rubrica }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-700">{rubrica.texto}</span>
      <div className="flex items-center gap-3">
        {Array.from({ length: rubrica.maximo }, (_, index) => {
          const value = index + 1;
          const active = value <= rubrica.calificacion;

          return (
            <div
              key={value}
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${active ? "border-[#0b7c91] bg-black text-white" : "border-slate-800 bg-white text-slate-700"
                }`}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tarjeta de extenso seleccionado con detalles y rubricas
function ExtensoDetailCard({ extenso, revisores }) {
  if (!extenso) {
    return (
      <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No hay un extenso seleccionado.</p>
      </article>
    );
  }

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6">
      <div className="space-y-6">
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Información de extenso</h3>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Título:</span> {extenso.title}</p>
            <p><span className="font-semibold text-slate-900">Autores:</span> {extenso.autores.join(" / ")}</p>
            <p><span className="font-semibold text-slate-900">Evaluadores:</span> {revisores.length > 0 ? revisores.map((revisor) => revisor.nombre).join(" / ") : "Sin asignar"}</p>
            <p><span className="font-semibold text-slate-900">Subárea:</span> {extenso.subarea}</p>
            <p><span className="font-semibold text-slate-900">Tipo de trabajo:</span> {extenso.tipoTrabajo}</p>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Rúbricas de evaluación</h3>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Puntuación</p>
              <p className="text-[34px] font-black leading-none text-slate-800">
                {extenso.puntuacion.obtenida}
                <span className="text-[22px] text-slate-500">/{extenso.puntuacion.total}</span>
              </p>
            </div>
          </div>

          <div className="mt-3">
            {extenso.rubricas.map((rubrica) => (
              <RubricaStatusRow key={rubrica.id} rubrica={rubrica} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Comentarios del evaluador</h3>
          <div className="mt-4 min-h-[180px] rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.comentario}
          </div>
        </section>
      </div>
    </article>
  );
}

//Vista de extensos con lista lateral y detalle central
export default function ProcesosExtensosView() {
  const [items] = useState(MOCK_EXTENSOS);
  const [viewItem, setViewItem] = useState(MOCK_EXTENSOS[0] ?? null);

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
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">
            Aquí se gestiona la revisión de extensos
          </p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-2">


        <div className="space-y-4">
          <ListaExtensos
            listaElementos={items}
            dictaminadores={MOCK_DICTAMINADORES}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ListaRevisores titulo="EVALUADORES" revisores={revisoresAsignados} />
        </div>
        <ExtensoDetailCard extenso={viewItem} revisores={revisoresAsignados} />
      </section>
    </div>
  );
}
