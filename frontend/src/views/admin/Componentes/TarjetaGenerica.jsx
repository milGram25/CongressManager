import React from 'react';
import { useState } from 'react';
import { FiEye, FiCopy, FiEdit2 } from 'react-icons/fi';
import Modal from "./Modal";
import DetallesCrearCongreso from './DetallesCrearCongreso';
import DetallesEditarTaller from './DetallesEditarTaller';
import { useNavigate } from 'react-router-dom';
import DetallesEditarPonencia from './DetallesEditarPonencia';
import DetallesEditarInstitucion from './DetallesEditarInstitucion';

const TarjetaGenerica = ({
                             titulo,
                             botonPublicarTexto,
                             onView,
                             onCopy,
                             onEdit,
                             onPublish,
                             children,
                             definirTipoElemento,
                             indexDatosModal
                         }) => {

    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);

    const renderModalContent = () => {
        switch(definirTipoElemento){
            case "ponencia":
                return <DetallesEditarPonencia/>;
            case "taller":
                return <DetallesEditarTaller/>;
            case "institucion":
                return <DetallesEditarInstitucion/>;
            case "congreso":
                return <DetallesCrearCongreso indexDatosModal={indexDatosModal}/>;
            default:
                return null;
        }
    };

    function cerrarModal(){
        setOpenModal(false);
    }

    return (
        <div className="w-full max-w-[550px] bg-base-100 border border-base-300 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-lg transition-all group">
            <Modal abierto={openModal} onClose={() => cerrarModal()}>
                {renderModalContent()}
            </Modal>

            {/* Header / Titulo */}
            <div className="bg-black text-white rounded-2xl px-6 py-5 text-center font-bold text-base min-h-[72px] flex items-center justify-center mb-8 uppercase tracking-[0.15em] leading-tight shadow-md">
                {titulo}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-4">
                {children}
            </div>

            {/* Footer / Acciones */}
            <div className="mt-8 pt-6 border-t border-base-200 flex items-center justify-between">
                <button  
                    className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary transition-all active:scale-90 shadow-md" 
                    onClick={() => {
                        if (definirTipoElemento === 'congreso') {
                            navigate(`/admin/eventos/congresos/detalles/${indexDatosModal}`);
                        } else if (definirTipoElemento === 'institucion') {
                            navigate(`/admin/ajustes/instituciones/editar/${indexDatosModal}`);
                        } else {
                            if (onView) onView();
                            else setOpenModal(true);
                        }
                    }} 
                    title="Ver detalles"
                >
                    <FiEye size={16} />
                </button>

                {botonPublicarTexto && (
                    <button 
                        onClick={onPublish}
                        className="bg-primary text-primary-content text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        {botonPublicarTexto}
                    </button>
                )}

                <div className="flex items-center gap-2">
                    <button 
                        className="w-9 h-9 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90" 
                        onClick={onCopy} 
                        title="Duplicar"
                    >
                        <FiCopy size={16} />
                    </button>
                    <button  
                        className="w-9 h-9 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90" 
                        onClick={() => {
                            if (definirTipoElemento === 'congreso') {
                                navigate(`/admin/eventos/congresos/detalles/${indexDatosModal}?edit=true`);
                            } else if (definirTipoElemento === 'institucion') {
                                navigate(`/admin/ajustes/instituciones/editar/${indexDatosModal}`);
                            } else {
                                if (onEdit) onEdit();
                                else setOpenModal(true);
                            }
                        }} 
                        title="Editar"
                    >
                        <FiEdit2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TarjetaGenerica;