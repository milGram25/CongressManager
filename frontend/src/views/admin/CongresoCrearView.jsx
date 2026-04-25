import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import DetallesCrearCongreso from "./Componentes/DetallesCrearCongreso";

export default function CongresoCrearView() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full">
        {/* Título de la vista */}
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crear Nuevo Congreso</h1>
            <p className="text-gray-500 mt-1">Completa el siguiente formulario para registrar un nuevo congreso en el sistema.</p>
        </div>

        {/* Formulario (Ocupando todo el ancho disponible) */}
        <div className="shadow-lg border border-gray-200 overflow-hidden rounded-[24px] mb-10">
            <DetallesCrearCongreso 
                modificandoDatos={true}
                initialModificando={true}
                isFullPage={true}
            />
        </div>
      </div>
    </div>
  );
}
