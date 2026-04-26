import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import DetallesEditarTaller from './Componentes/DetallesEditarTaller';

const TalleresCrearView = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const idCongreso = queryParams.get('id_congreso');
    const tallerRef = useRef();

    // Datos iniciales con id_congreso si viene en la URL
    const emptyTallerData = {
        nombre_evento: "",
        id_congreso: idCongreso || "",
        id_institucion: "",
        id_sede: "",
        tallerista: "",
        id_subarea: "",
        cupos: 0,
        tipo_participacion: "Presencial",
        enlace: "",
        id_mesas_trabajo: "",
        fecha_hora_inicio: "",
        fecha_hora_final: "",
        sinopsis: ""
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
                    ref={tallerRef}
                    tallerData={emptyTallerData}
                    initialModificando={true}
                    isFullPage={true}
                />
            </div>

            {/* Botones de acción adicionales al final */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => navigate('/admin/eventos/congresos/lista')}
                    className="px-8 py-3 rounded-xl border border-base-300 text-base-content/60 font-bold hover:bg-base-200 transition-all active:scale-95 uppercase tracking-wider text-xs"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => tallerRef.current?.handleSave()}
                    className="px-10 py-3 rounded-xl bg-primary text-primary-content font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 uppercase tracking-wider text-xs"
                >
                    Guardar Taller
                </button>
            </div>
        </div>
    );
};

export default TalleresCrearView;
