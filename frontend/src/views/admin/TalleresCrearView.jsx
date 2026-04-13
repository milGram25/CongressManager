import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import DetallesEditarTaller from './Componentes/DetallesEditarTaller';

const TalleresCrearView = () => {
    const navigate = useNavigate();

    // Datos iniciales vacíos para la creación de un nuevo taller
    const emptyTallerData = {
        nombre_evento: "",
        nombre_congreso: "",
        nombre_institucion: "",
        sede: "",
        nombre_tallerista: "",
        subarea: "",
        cupos_maximos_taller: 0,
        nombre_taller: "",
        tipo_participacion: "Presencial",
        enlace_videollamada: "",
        nombre_mesa: "",
        cupos_mesa: 0,
        fecha_hora_inicio: "",
        fecha_hora_final: ""
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="w-full">
                {/* Título de la vista */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crear Nuevo Taller</h1>
                    <p className="text-gray-500 mt-1">Completa el siguiente formulario para registrar un nuevo taller en el sistema.</p>
                </div>

                {/* Formulario (Ocupando todo el ancho disponible) */}
                <div className="shadow-lg border border-gray-200 overflow-hidden rounded-[24px]">
                    <DetallesEditarTaller 
                        tallerData={emptyTallerData} 
                        initialModificando={true}
                        isFullPage={true}
                    />
                </div>
                
                {/* Botones de acción adicionales al final */}
                <div className="mt-8 flex justify-end gap-4">
                    <button 
                        onClick={() => navigate('/admin/eventos/talleres')}
                        className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        className="px-8 py-2.5 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                    >
                        Guardar Taller
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TalleresCrearView;
