// Aqui se inserta el apartado de estatus de ponencia
import React from 'react';
import {useNavigate} from 'react-router-dom';

export default function EstatusPonenciaView(){
  const navigate=useNavigate();
  //ejemplos de ponencias, ver bien que lleva cada una y modificarlo despues
  const ponencias = [
    {
      titulo: "Movilización del conocimiento y la ciencia abierta",
      estatus: "extenso-aceptado",
      fecha: "10-marzo-2026",
      id: "ver si lleva"
    },
    {
      titulo: "Innovación educativa y transformación digital en la universidad contemporánea",
      estatus: "resumen-aceptado",
      fecha: "20-marzo-2026",
      id: "ver si lleva"
    },
    {
      titulo: "Innovación educativa",
      estatus: "extenso-con-modificaciones",
      fecha: "20-marzo-2026",
      id: "ver si lleva"
    },
    {
      titulo: "Innovación educativa y contemporánea",
      estatus: "rechazado",
      fecha: "20-marzo-2026",
      id: "ver si lleva"
    },
  ];

  //boton depende del estatus, con color de la paleta y depende del boton te redirige a las ventanas de subir extenso o multimedia
  const renderBoton = (estatus) => {
    if(estatus == "extenso-aceptado"){
      return(<button onClick={()=> navigate("/asistente/subir-multimedia")} style={{ backgroundColor: "#001219", color: "white", padding: "8px 16px", borderRadius: "6px" }}>Subir multimedia</button>
      );
    }
    if(estatus == "resumen-aceptado"){
      return(<button onClick={() => navigate("/asistente/subir-extenso")} style={{ backgroundColor: "#001219", color: "white", padding: "8px 16px", borderRadius: "6px" }}>Subir extenso</button>
      );
    }
    return null;
  };

  //color segun estatus verde, rojo y amarillo solo los bordes
  const colorEstatus=(estatus) =>{
    if(estatus == "extenso-aceptado"|| estatus == "resumen-aceptado")return "border-green-500";
    if(estatus == "extenso-con-modificaciones")return "border-yellow-500";
    if(estatus == "rechazado")return "border-red-500";
    return "border-gray-400";
  };

  //texto que se muestra depende el estatus en los cuadros
  const textoEstatus=(estatus) =>{
    switch(estatus){
      case "extenso-aceptado": return "Extenso Aceptado";
      case "resumen-aceptado": return "Resumen Aceptado";
      case "extenso-con-modificaciones": return "El extenso requiere modificaciones";
      case "rechazado": return "Rechazado";
      default: return "sin estatus";
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Estatus de Ponencias</h1>

      <div className="flex flex-col gap-6">
        {ponencias.map((p) => (
          <div
            key={p.id + p.estatus}
            className={`border-2 p-6 rounded shadow ${colorEstatus(p.estatus)}`}
          >
            <h2 className="text-lg font-bold mb-2">{textoEstatus(p.estatus)}</h2>
            <p className="font-medium">Título: <span className="font-normal">{p.titulo}</span></p>
            <p>ID: #{p.id}</p>
            <p>Fecha: {p.fecha}</p>
            <div className="mt-4">
              {renderBoton(p.estatus)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}
