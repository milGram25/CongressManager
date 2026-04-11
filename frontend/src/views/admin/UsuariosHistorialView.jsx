import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { useState } from "react";
import ListaHistorial from "./Componentes/ListaHistorial";
import DetallesHistorial from "./Componentes/DetallesHistorial";

export default function UsuariosHistorialView() {
  const navigate = useNavigate();
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);

  const lista = [
        {
            id:1,
            nombre: "Ernesto",
            primerApellido: "García",
            segundoApellido: "Rodríguez",
            correo: "ernesto@example.com",
            telefono: "+34 555 123 456",
            curp: "GARE800101HDFRRL00",
            fecha: "2025-03-30 23:59:59.00000",
            rol: "comite academico",
            accion: "modificar fecha evento",
            codigoAccion: "ACT001",
            descripcionAccion: "Se modificó la fecha del evento de congreso",
            correoPersona: "ernesto@example.com"
        },
        {
            id:2,
            nombre: "Jimenita",
            primerApellido: "López",
            segundoApellido: "Martínez",
            correo: "jimenita@example.com",
            telefono: "+34 555 234 567",
            curp: "LOMA850512HDFRRL01",
            fecha: "2026-04-04 10:59:59.00000",
            rol: "ponente",
            accion: "realizar pago",
            codigoAccion: "ACT002",
            descripcionAccion: "Realizó el pago de inscripción al congreso",
            correoPersona: "jimenita@example.com"

        },
        {
            id:3,
            nombre: "Kaleb",
            primerApellido: "Pérez",
            segundoApellido: "González",
            correo: "kaleb@example.com",
            telefono: "+34 555 345 678",
            curp: "PEGK900315HDFRRL02",
            fecha: "2026-03-15 23:59:59.00000",
            rol: "evaluador",
            accion: "cerrar sesion",
            codigoAccion: "ACT003",
            descripcionAccion: "Cerró sesión en la plataforma",
            correoPersona: "kaleb@example.com"

        },
        {
            id:4,
            nombre: "Forense",
            primerApellido: "Torres",
            segundoApellido: "Hernández",
            correo: "forense@example.com",
            telefono: "+34 555 456 789",
            curp: "TOHF920720HDFRRL03",
            fecha: "2026-03-15 23:59:59.00000",
            rol: "dictaminador",
            accion: "solicitar ponencia",
            codigoAccion: "ACT004",
            descripcionAccion: "Solicitó una ponencia adicional para evaluación",
            correoPersona: "forense@example.com"

        }
    ];

  const handleSeleccionarAccion = (item) => {
    setAccionSeleccionada(item);
  };

  // Proporciones basadas en frame 1440x1200
  const containerStyle = {
    display: 'flex',
    gap: '24px',
    padding: '24px',
    backgroundColor: '#F9F8F8',
    borderRadius: '16px',
    minHeight: '748px'
  };

  return (
    <div style={containerStyle}>
      {/* Panel de lista - lado izquierdo */}
      <div style={{ flex: 1 }}>
        <ListaHistorial listaElementos={lista} onSeleccionarAccion={handleSeleccionarAccion} />
      </div>

      {/* Panel de detalles - lado derecho */}
      <DetallesHistorial accion={accionSeleccionada} />
    </div>
  );
}
