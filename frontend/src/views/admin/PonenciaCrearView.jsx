import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCoPresent, MdConstruction } from 'react-icons/md';

const PonenciaCrearView = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/70 hover:text-primary"
                    title="Regresar"
                >
                    <MdArrowBack size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Crear Ponencia</h1>
                    <p className="text-sm text-base-content/50">Registro de ponencias para el congreso</p>
                </div>
            </div>

            {/* Contenido en proceso */}
            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MdCoPresent size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-warning text-warning-content border-4 border-base-100 flex items-center justify-center shadow-lg">
                        <MdConstruction size={20} />
                    </div>
                </div>
                
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-base-content">Sección en Construcción</h2>
                    <p className="text-base-content/50 mt-2">
                        Estamos trabajando para traerte la mejor experiencia en la creación y gestión de ponencias. Pronto podrás registrar detalles, autores y horarios aquí.
                    </p>
                </div>

                <button 
                    onClick={() => navigate(-1)}
                    className="btn btn-primary btn-outline rounded-xl px-8"
                >
                    Regresar a la lista
                </button>
            </div>
        </div>
    );
};

export default PonenciaCrearView;