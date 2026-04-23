import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";

export default function PonenciasView() {
  const navigate = useNavigate();

  const MOCK_CONGRESOS = [
    {
      id: 1,
      nombre: "CIENU 2024",

    },
    {
      id: 2,
      nombre: "CIENU 2025",

    },
    {
      id: 3,
      nombre: "CIENU 2026",

    },
    {
      id: 4,
      nombre: "CIENU 2027",

    }
  ]

  const MOCK_INSTITUCIONES = [
    {
      id: 1,
      nombre: "CIENU",

    },
    {
      id: 2,
      nombre: "RIDMAE",

    }
  ];

  const listaEventos = [
    {
      id: 1,
      nombre_congreso: "Hola mundo",
      nombre_evento: "mala ponencia",
      nombre_ponente: "Yo mero",
      cupos: 10,
      fecha_hora_inicio: "2026-04-08T10:00",
      fecha_hora_final: "2026-04-08T15:00"
    },
    {
      id: 2,
      nombre_congreso: "Hola mundo 2",
      nombre_evento: "Buena ponencia",
      nombre_ponente: "Yo mero",
      cupos: 20,
      fecha_hora_inicio: "2026-04-08T10:00",
      fecha_hora_final: "2026-04-08T14:00"
    },
    {
      id: 3,
      nombre_congreso: "Hola mundo 3",
      nombre_evento: "Buena ponencia",
      nombre_ponente: "Yo mero",
      cupos: 30,
      fecha_hora_inicio: "2026-04-08T10:00",
      fecha_hora_final: "2026-04-08T13:00"
    },
    {
      id: 4,
      nombre_congreso: "Hola mundo 4",
      nombre_evento: "Buena ponencia",
      nombre_ponente: "Yo mero",
      cupos: 30,
      fecha_hora_inicio: "2026-04-08T10:00",
      fecha_hora_final: "2026-04-08T12:00"
    }


  ];

  return (
    <div className="bg-base-100 p-8 rounded-3xl min-h-[400px]">
      <div>
        <div className="flex gap-4">
          <div className="border bg-black rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-bold text-start">Revisión</h2>
        </div>
        <p className="pl-12 text-start text-gray-500 mb-3">
          Aquí se gestiona la revisión de extensos
        </p>
      </div>
      <div className="flex justify-center gap-10 mb-4">

        <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={MOCK_INSTITUCIONES} />
        <ListaDesplegableElementosGenerica titulo={"Congresos"} lista={MOCK_CONGRESOS} />
      </div>
      <MenuCrearBorrar title="Ver ponencia" listaElementos2={listaEventos} definirTipoElemento="ponencia" />

    </div>
  );
}
