// Aqui se inserta el apartado de estatus de ponencia
import React from 'react';
import {useNavigate} from "react-router-dom";

export default function EstatusPonenciaView(){
  const navigate=useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  //ejemplos de ponencias, ver bien que lleva cada una y modificarlo despues
  const ponencias = [
    {
      titulo: "Movilización del conocimiento y la ciencia abierta",
      estatus: "extenso-aceptado",
      fecha: "10-marzo-2026",
      id: "1"
    },
    {
      titulo: "Innovación educativa y transformación digital en la universidad contemporánea",
      estatus: "resumen-aceptado",
      fecha: "20-marzo-2026",
      id: "2"
    },
    {
      titulo: "Innovación educativa",
      estatus: "extenso-con-modificaciones",
      fecha: "20-marzo-2026",
      id: "3"
    },
    {
      titulo: "Innovación educativa y contemporánea",
      estatus: "rechazado",
      fecha: "20-marzo-2026",
      id: "4"
    },
  ];
  const EstatusCard=({titulo, id, fecha, estatus, children})=>{ 
    //colores para los estatus 
    const borderColorMap={
      "extenso-aceptado": "border-success", //verde, definido en css 
      "resumen-aceptado": "border-primary", //azul, para diferenciar de extenso-acpetado 
      "extenso-con-modificaciones": "border-warning", //amarillo, definido en css
     "rechazado": "border-error", //rojo, definido en css
    }; 
    //cambiar el texto que aparecera en el cuadro de estatus 
    const labelTextMap = { 
      "extenso-aceptado": "Extenso Aceptado", 
      "resumen-aceptado": "Resumen Aceptado", 
      "extenso-con-modificaciones": "Extenso con Modificaciones", 
      "rechazado": "Rechazado", 
    }; 
    const labelColorMap={ "extenso-aceptado": "text-success", //verde 
      "resumen-aceptado": "text-primary", //azul 
      "extenso-con-modificaciones": "text-warning", //amarillo
      "rechazado": "text-error", //rojo 
    }; 
    const borderColor = borderColorMap[estatus] || "border-neutral";

    return (
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${borderColor}`}>
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColorMap[estatus]}`}>
            {labelTextMap[estatus] || "Sin estatus"}
          </span>
          <h3 className="text-lg font-semibold text-slate-700 leading-tight mb-1">{titulo}</h3>
          <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-tighter">ID: {id}</p>
          <p className="text-xs text-gray-500">Fecha: {fecha}</p>
        </div>
        <div className="mt-4 md:mt-0 flex justify-end w-full md:w-auto">
          {children}
        </div>
      </div>
    );
  };
  const renderBoton = (p) => {
    if (p.estatus == "extenso-aceptado") {
      return (
        <button className="btn btn-primary w-40" onClick={() => navigate("/subir-multimedia")}>
          Subir Multimedia
        </button>
      );
    }
    if (p.estatus == "resumen-aceptado") {
      return (
        <button className="btn btn-primary w-40" onClick={() => navigate("/subir-extenso")}>
          Subir Extenso
        </button>
      );
    }
    if (p.estatus == "extenso-con-modificaciones") {
      return (
        <button className="btn btn-primary w-40" onClick={() => navigate("/subir-correccion")}>
          Subir Corrección
        </button>
      );
    }
    if (p.estatus == "rechazado") {
      return (
        <button className="btn btn-primary w-40" onClick={() => setShowModal(true)}>
          Motivo de rechazo
        </button>
      );
    }
  };
  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Estatus de Ponencias</h1>
      <div className="flex flex-row gap-8 items-center mb-6">
        {/*diccionario de colores estatus, hasta aariba, abajo de titulo */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success"></span>
            <p>Extenso aceptado</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
            <p>Resumen aceptado</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-warning"></span>
            <p>Extenso con modificaciones</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error"></span>
            <p>Rechazado</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {ponencias.map((p) => (
          <EstatusCard
            key={p.id}
            titulo={p.titulo}
            id={p.id}
            fecha={p.fecha}
            estatus={p.estatus}
          >
            {renderBoton(p)}
          </EstatusCard>
        ))}
      </div>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">
              Ponencia rechazada
            </h3>
            <p>Título Ponencia: </p>
            <p>ID:</p>
            <p>Resumen:</p>
            <p>Dictaminador asignado:</p>
            <p>Revisor asignado:</p>
            <p>Retroalimentación:</p>
            <p className="py-4">Se rechazo por....</p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}