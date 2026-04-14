import React from 'react';
import { useState } from 'react';
import { FiEye, FiCopy, FiEdit2 } from 'react-icons/fi';
import Modal from "./Modal";
import DetallesCrearCongreso from './DetallesCrearCongreso';
import DetallesEditarTaller from './DetallesEditarTaller';

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

    const cardStyle = {
        width: '100%',
        maxWidth: '350px',
        minHeight: '400px',
        backgroundColor: '#F9F8F8',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
    };

    const headerStyle = {
        backgroundColor: 'black',
        color: '#FFFFFF',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '16px',
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const contentStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    };

    const footerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px'
    };

    const iconBtnStyle = {
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    };

    const publishBtnStyle = {
        backgroundColor: 'black',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '20px',
        padding: '6px 16px',
        fontWeight: '600',
        cursor: 'pointer',
    };

    const [openModal, setOpenModal] = useState(false);

    // 1. CAMBIO: Lo nombramos en minúscula porque ahora es una función auxiliar, no un componente independiente.
    const renderModalContent = () => {
        switch(definirTipoElemento){
            case "ponencia":
                return null;
            case "taller":
                return <DetallesEditarTaller/>;
            case "institucion":
                return null;
            case "congreso":
                return <DetallesCrearCongreso indexDatosModal={indexDatosModal}/>; //Hacer la búsqueda de datos de la base de datos desde DetallesCrearCongreso
            default:
                return null;
        }
    };

    function cerrarModal(){
        setOpenModal(false);
        //document.body.style.overflow = "auto";
    }

    return (
        <div className="static" style={cardStyle}>

            <Modal abierto={openModal} onClose={() => cerrarModal()}>
               
                {renderModalContent()}
            </Modal>

            <div style={headerStyle}>{titulo}</div>

            <div style={contentStyle}>
                {children}
            </div>

            <div style={footerStyle}>
                <button  className="bg-black hover:bg-gray-500" style={iconBtnStyle} onClick={() => setOpenModal(true)} title="Ver detalles">
                    <FiEye size={16} />
                </button>

                {botonPublicarTexto && (
                    <button style={publishBtnStyle} onClick={onPublish}>
                        {botonPublicarTexto}
                    </button>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="bg-black hover:bg-gray-500" style={iconBtnStyle} onClick={onCopy} title="Duplicar">
                        <FiCopy size={16} />
                    </button>
                    <button  className="bg-black hover:bg-gray-500" style={iconBtnStyle} onClick={onEdit} title="Editar">
                        <FiEdit2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TarjetaGenerica;