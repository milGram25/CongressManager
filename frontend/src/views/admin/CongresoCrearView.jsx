import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import DetallesCrearCongreso from "./Componentes/DetallesCrearCongreso";

export default function CongresoCrearView() {

  const navigate = useNavigate();

  const listaEventos = [
    {
      id:1,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00"
    },
    {
      id:2,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00"
    },
    {
      id:3,
      nombre_congreso:"RIDMAE 2025",
      sede:"CUALTOS",
      cantidad_eventos:100,
      nombre_institucion:"RIDMAE",
      fecha_hora_inicio:"2026-04-08T08:00",
      fecha_hora_final:"2026-04-08T10:00"
    }
    

  ];

  const congresosModal = [
    {
      id:1,
        nombre_congreso: "Congreso Internacional de Tecnología 2026",
        nombre_institucion: "Universidad de Guadalajara",
        imagen_institucion: "https://example.com/imagen1.jpg",

        nombre_sede: "Centro Universitario de los Altos",

        pais: "México",
        estado: "Jalisco",
        ciudad: "Tepatitlán de Morelos",
        calle: "Av. Universidad",
        num_exterior: "1200",
        num_interior: "A",
        mod_fisico: "Edificio B, Aula 203",

        tipo_trabajo: "Investigación",
        preguntas_referencia: "PR-001",
        rubrica_nombre: "Rúbrica General",
        rubrica_referencia: "RB-001",

        eventio_inicio: "2026-05-10",
        eventio_fin: "2026-05-15",

        envio_ponencias_inicio: "2026-01-01",
        envio_ponencias_fin: "2026-02-15",
        inscripcion_dictaminadores_inicio: "2026-01-10",
        inscripcion_dictaminadores_fin: "2026-02-20",
        revision_resumenes_inicio: "2026-02-16",
        revision_resumenes_fin: "2026-03-01",
        envio_extensos_inicio: "2026-03-02",
        envio_extensos_fin: "2026-03-20",
        inscripcion_evaluadores_inicio: "2026-01-15",
        inscripcion_evaluadores_fin: "2026-02-25",
        revision_extensos_inicio: "2026-03-21",
        revision_extensos_fin: "2026-04-05",
        subir_multimedia_inicio: "2026-04-06",
        subir_multimedia_fin: "2026-04-20",

        prepago_inicio: "2026-01-01",
        prepago_fin: "2026-03-01",
        pagos_normales_inicio: "2026-03-02",
        pagos_normales_fin: "2026-05-01",

        costo_asistente: "500",
        costo_ponente: "800",
        costo_miembro_comite: "0",

        descuento_prepago: "10%",
        descuento_estudiante: "20%",

        cuenta_deposito: "1234567890",

        tipo_trabajo: "muy bueno",
        preguntas_referencia:1,
        nombre_rubrica: "Buena rubrica",
        rubrica_referencia: 1
    },
    {
      id:2,
        nombre_congreso: "Congreso de Ingeniería y Ciencia 2026",
        nombre_institucion: "Instituto Politécnico Nacional",
        imagen_institucion: "https://example.com/imagen2.jpg",

        nombre_sede: "Unidad Profesional Zacatenco",

        pais: "México",
        estado: "CDMX",
        ciudad: "Ciudad de México",
        calle: "Av. IPN",
        numero_exterior: "1500",
        numero_interior: "B",
        modulo_fisico: "Edificio 5, Sala 101",

        tipo_trabajo: "Desarrollo Tecnológico",
        preguntas_referencia: "PR-002",
        rubrica_nombre: "Rúbrica Técnica",
        rubrica_referencia: "RB-002",

        congreso_inicio: "2026-06-01",
        congreso_fin: "2026-06-05",

        envio_ponencias_inicio: "2026-02-01",
        envio_ponencias_fin: "2026-03-10",
        inscripcion_dictaminadores_inicio: "2026-02-05",
        inscripcion_dictaminadores_fin: "2026-03-15",
        revision_resumenes_inicio: "2026-03-11",
        revision_resumenes_fin: "2026-03-25",
        envio_extensos_inicio: "2026-03-26",
        envio_extensos_fin: "2026-04-10",
        inscripcion_evaluadores_inicio: "2026-02-10",
        inscripcion_evaluadores_fin: "2026-03-20",
        revision_extensos_inicio: "2026-04-11",
        revision_extensos_fin: "2026-04-25",
        subir_multimedia_inicio: "2026-04-26",
        subir_multimedia_fin: "2026-05-10",

        prepago_inicio: "2026-02-01",
        prepago_fin: "2026-04-01",
        pagos_normales_inicio: "2026-04-02",
        pagos_normales_fin: "2026-05-20",

        costo_asistente: "600",
        costo_ponente: "900",
        costo_miembro_comite: "100",

        descuento_prepago: "15%",
        descuento_estudiante: "25%",
        descuento_otro_estudiante: "10%",

        cuenta_deposito: "9876543210",

        tipo_trabajo: "muy bueno",
        preguntas_referencia:2,
        nombre_rubrica: "Buena rubrica",
        rubrica_referencia: 2
    },
    {
      id:3,
        nombre_congreso: "Congreso Latinoamericano de Software 2026",
        nombre_institucion: "Universidad Nacional Autónoma de México",
        imagen_institucion: "https://example.com/imagen3.jpg",

        nombre_sede: "Ciudad Universitaria",

        pais: "México",
        estado: "CDMX",
        ciudad: "Ciudad de México",
        calle: "Insurgentes Sur",
        numero_exterior: "3000",
        numero_interior: "C",
        modulo_fisico: "Facultad de Ingeniería, Auditorio A",

        tipo_trabajo: "Software",
        preguntas_referencia: "PR-003",
        rubrica_nombre: "Rúbrica Software",
        rubrica_referencia: "RB-003",

        congreso_inicio: "2026-07-10",
        congreso_fin: "2026-07-15",

        envio_ponencias_inicio: "2026-03-01",
        envio_ponencias_fin: "2026-04-15",
        inscripcion_dictaminadores_inicio: "2026-03-05",
        inscripcion_dictaminadores_fin: "2026-04-20",
        revision_resumenes_inicio: "2026-04-16",
        revision_resumenes_fin: "2026-04-30",
        envio_extensos_inicio: "2026-05-01",
        envio_extensos_fin: "2026-05-20",
        inscripcion_evaluadores_inicio: "2026-03-10",
        inscripcion_evaluadores_fin: "2026-04-25",
        revision_extensos_inicio: "2026-05-21",
        revision_extensos_fin: "2026-06-05",
        subir_multimedia_inicio: "2026-06-06",
        subir_multimedia_fin: "2026-06-20",

        prepago_inicio: "2026-03-01",
        prepago_fin: "2026-05-01",
        pagos_normales_inicio: "2026-05-02",
        pagos_normales_fin: "2026-06-25",

        costo_asistente: "700",
        costo_ponente: "1000",
        costo_miembro_comite: "0",

        descuento_prepago: "20%",
        descuento_estudiante: "30%",
        descuento_otro_estudiante: "15%",

        cuenta_deposito: "1122334455",

        tipo_trabajo: "muy bueno",
        preguntas_referencia:3,
        nombre_rubrica: "Buena rubrica",
        rubrica_referencia: 3
    }
];
  
  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">
      {/*<DetallesCrearCongreso/>*/}

      <MenuCrearBorrar title="Crear congresos" listaElementos2={listaEventos} definirTipoElemento="congreso"/>


      
    </div>
  );
}
