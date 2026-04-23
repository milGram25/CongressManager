import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
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
        <div className="w-full space-y-8 pb-10">
            {/* Header */}
            <div className="mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Crear Taller</h1>
                    <p className="text-sm text-base-content/50">Registra un nuevo taller y asigna sus detalles y horarios</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden">
                <DetallesEditarTaller
                    tallerData={emptyTallerData}
                    initialModificando={true}
                    isFullPage={true}
                />
            </div>

            {/* Botones de acción adicionales al final */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => navigate('/admin/eventos/talleres')}
                    className="px-8 py-3 rounded-xl border border-base-300 text-base-content/60 font-bold hover:bg-base-200 transition-all active:scale-95 uppercase tracking-wider text-xs"
                >
                    Cancelar
                </button>
                <button
                    className="px-10 py-3 rounded-xl bg-primary text-primary-content font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 uppercase tracking-wider text-xs"
                >
                    Guardar Taller
                </button>
            </div>
        </div>
    );
};

export default TalleresCrearView;
