import React, { useState } from 'react';
import { FiDownload, FiMinus, FiPlus } from 'react-icons/fi';
//import MenuCrearBorrar from "./Componentes/MenuCrearBorrarGenerico";
import Itemcrearborrargenerico from './itemcrearborrargenerico';
import ItemPonencia2 from './ItemPonencia2';
//import ItemTaller from './ItemTaller';
//import ItemTaller from "./ItemTaller";
import ItemTaller from './ItemTaller';
import ItemCongreso from "./ItemCongreso";
import ItemInstitucion from "./ItemInstitucion";

import { useEffect } from 'react';

const MenuCrearBorrarGenerico = ({
                                     title = "Crear [insertar sustantivo]",
                                     children,
                                     onDownload,
                                     onRemove,
                                     onAdd,
                                     listaElementos2,
                                     definirTipoElemento = "ponencia"
                                 }) => {

    const [listaElementos,setListaElementos] = useState([]);
    const Componente = (props) => {

        switch(definirTipoElemento){
            case "ponencia":
                return <ItemPonencia2 {...props} />
            case "taller":
                return <ItemTaller {...props} />

            case "institucion":
                return <ItemInstitucion {...props} />

            case "congreso":
                return <ItemCongreso {...props} />

            default:
                return null;
        }
    };

    const mostrarAgregarEliminar = !["ponencia", "institucion"].includes(definirTipoElemento);
      


    const containerStyle = {
        width: '1000px',
        height: '82%',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
    };

    const titleStyle = {
        margin: 0,
        fontSize: '24px',
        fontWeight: '500',
    };

    const contentAreaStyle = {
        flex: 1,
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'max-content',
        gap: '16px',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
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

    function agregarElemento(){
        setListaElementos([...listaElementos],onAdd);

    }

    

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2 style={titleStyle}>{title}</h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={onDownload} style={iconButtonStyle} title="Descargar">
                        {/* Ícono de descarga */}
                        <FiDownload size={18} strokeWidth={2} />
                    </button>
                    
                    {mostrarAgregarEliminar?

                    (<div style={pillContainerStyle}>
                        <button onClick={onRemove} style={pillButtonStyle} title="Quitar">
                            {/* Ícono de menos */}
                            <FiMinus size={16} strokeWidth={3} />
                        </button>
                        <button onClick={onAdd} style={pillButtonStyle} title="Agregar">
                            {/* Ícono de más */}
                            <FiPlus size={16} strokeWidth={3} />
                        </button>
                    </div>):""}
                </div>
            </header>

            <main style={contentAreaStyle}>
                {listaElementos2.map((objeto) => (
                    <Componente
                    key={objeto.id}
                    
                   
                    listaDatos={objeto}
                    />
                ))}
            </main>
        </div>
    );
};

export default MenuCrearBorrarGenerico;