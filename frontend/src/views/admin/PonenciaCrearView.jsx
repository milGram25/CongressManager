import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import DetallesEditarPonencia from './Componentes/DetallesEditarPonencia';

const PonenciaCrearView = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const idCongreso = queryParams.get('id_congreso');
    const ponenciaRef = useRef();

    // Datos iniciales vacíos para la creación de una nueva ponencia
    const emptyPonenciaData = {
        id_congreso: idCongreso || "",
        nombre_evento: "", // Título de la ponencia
        tipo_evento: "ponencia",
        id_subarea: "",
        cupos: 0,
        tipo_participacion: "Presencial",
        enlace: "",
        sinopsis: "",
        id_mesas_trabajo: "",
        fecha_hora_inicio: "",
        fecha_hora_final: ""
    };

    return (
        <div className="w-full space-y-8 pb-10 p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
                >
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-base-content uppercase tracking-tight">Crear Ponencia</h1>
                    <p className="text-sm text-base-content/50">Completa la información para registrar una nueva ponencia</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden">
                <DetallesEditarPonencia 
                    ref={ponenciaRef}
                    ponenciaData={emptyPonenciaData} 
                    initialModificando={true}
                    isFullPage={true}
                />
            </div>
            
            {/* Botones de acción adicionales al final */}
            <div className="flex justify-end gap-4 mt-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="px-8 py-4 rounded-2xl bg-base-200 text-base-content font-black hover:bg-base-300 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => ponenciaRef.current?.handleSave()}
                    className="px-10 py-4 rounded-2xl bg-black text-white font-black shadow-xl hover:bg-[#005a6a] transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                    Guardar Ponencia
                </button>
            </div>
        </div>
    );
};

export default PonenciaCrearView;
