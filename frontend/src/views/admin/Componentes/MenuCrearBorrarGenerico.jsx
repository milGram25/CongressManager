import React, { useState } from 'react';
import { FiDownload, FiMinus, FiPlus } from 'react-icons/fi';
import Itemcrearborrargenerico from './itemcrearborrargenerico';
import ItemPonencia2 from './ItemPonencia2';
import ItemTaller from './ItemTaller';
import ItemCongreso from "./ItemCongreso";
import ItemInstitucion from "./ItemInstitucion";
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import Modal from './Modal';
import DetallesCrearCongreso from './DetallesCrearCongreso';
import DetallesEditarTaller from './DetallesEditarTaller';

const MenuCrearBorrarGenerico = ({
                                     title = "Crear [insertar sustantivo]",
                                     children,
                                     onDownload,
                                     onRemove,
                                     onAdd,
                                     listaElementos2,
                                     definirTipoElemento = "ponencia",
                                     onViewItem
                                 }) => {
    const navigate = useNavigate();
    const [listaElementos,setListaElementos] = useState(listaElementos2);
    const mostrarAgregarEliminar = !["ponencia", "institucion"].includes(definirTipoElemento);

    // 1. SOLUCIÓN AL ERROR ROJO: Función normal que devuelve JSX, no un Componente con mayúscula
    const renderizarItem = (objeto, index) => {
        switch(definirTipoElemento){
            case "ponencia":
                return <ItemPonencia2 key={index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "taller":
                return <ItemTaller key={index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "institucion":
                return <ItemInstitucion key={index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "congreso":
                return <ItemCongreso key={index} listaDatos={objeto} onViewItem={onViewItem} />;
            default:
                return null;
        }
    };

    const renderizarDetallesItemModal = () => {
        switch(definirTipoElemento){
            case "ponencia":
                return null;
            case "taller":
                return <DetallesEditarTaller/>;
            case "institucion":
                return null;
            case "congreso":
                return <DetallesCrearCongreso modificandoDatos={true} />;
            default:
                return null;
        }
    };

    const containerStyle = {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        height: 'auto',
        minHeight: '80vh',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
    };

    const headerStyle = {
        backgroundColor: 'black',
        padding: '16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        color: '#ffffff',
    };

    const titleStyle = {
        margin: 0,
        fontSize: 'clamp(18px, 4vw, 24px)',
        fontWeight: '500',
    };

    const contentAreaStyle = {
        flex: 1,
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gridAutoRows: 'max-content',
        gap: '24px',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        justifyItems: 'center',
    };

    const iconButtonStyle = {
        background: 'transparent',
        border: '2px solid #ffffff',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#ffffff'
    };

    const pillContainerStyle = {
        backgroundColor: '#E5E5E5',
        borderRadius: '30px',
        padding: '4px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
    };

    const pillButtonStyle = {
        backgroundColor: 'black',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#ffffff'
    };
    const [openModal, setOpenModal] = useState(false);
    const [guardarCambios, setGuardarCambios] = useState(false);

    function handleAgregarElemento(elemento){
        if (definirTipoElemento === 'taller') {
            navigate('/admin/eventos/talleres/crear');
            return;
        }
        if (definirTipoElemento === 'congreso') {
            navigate('/admin/eventos/congresos/crear');
            return;
        }

        setOpenModal(true);
        // ... resto de la lógica para otros tipos
    }

    function agregarElemento(nuevo){
        setListaElementos([...listaElementos,nuevo]);
    }

    const elementosFilaFaltantes = [];
    let i = 0;

    if(mostrarAgregarEliminar){
        elementosFilaFaltantes.push(
            <button key="add-btn" className="p-4 flex cursor-pointer text-xl bg-[#F9F8F8] justify-between w-[300px] h-[384px] border rounded-xl border-dashed border-gray-500 border-4
                 bg-[repeating-linear-gradient(45deg,#d1d5db,#d1d5db_10px,#f3f4f6_10px,#f3f4f6_20px)] hover:bg-gray-500"
                    onClick={(e)=>handleAgregarElemento(e)}
            >
                <div className='flex flex-col items-center justify-center w-full h-full rounded-xl bg-[#F9F8F8] gap-4'>
                    <p className='font-bold'>Crear {definirTipoElemento}</p>
                    <IoMdAdd className='w-15 h-15'/>
                </div>
            </button>
        );
        i = 1;
    }

    for(i; i<(3-(listaElementos.length % 3)); i++){
        elementosFilaFaltantes.push(
            <div key={`empty-${i}`} className='w-[300px] h-[384px] bg-gray-100 rounded-xl'></div>
        );
    }

    return (
        <div style={containerStyle}>
            <Modal abierto={openModal} onClose={()=>setOpenModal(false)}>
                {renderizarDetallesItemModal()} {/*Aquí es donde se muestra el modal cuando se ven los detalles o se crea un componente*/}

            </Modal>

            <header style={headerStyle}>
                <h2 style={titleStyle}>{title}</h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={onDownload} style={iconButtonStyle} title="Descargar">
                        <FiDownload size={18} strokeWidth={2} />
                    </button>

                    {mostrarAgregarEliminar ? (
                        <div style={pillContainerStyle}>
                            <button onClick={onRemove} style={pillButtonStyle} title="Quitar">
                                <FiMinus size={16} strokeWidth={3} />
                            </button>
                            <button onClick={(e)=>handleAgregarElemento(e)} style={pillButtonStyle} title="Agregar">
                                <FiPlus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : ""}
                </div>
            </header>

            <main style={contentAreaStyle}>
                {/* 2. SOLUCIÓN AL ERROR ROJO: Llamamos a la función directamente en el map */}
                {listaElementos.map((objeto, index) => renderizarItem(objeto, index))}

                {elementosFilaFaltantes.map((item, index)=>(
                    <React.Fragment key={`faltante-${index}`}>
                        {item}
                    </React.Fragment>
                ))}
            </main>
        </div>
    );
};

export default MenuCrearBorrarGenerico;