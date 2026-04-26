import React from 'react';
import { FiTarget, FiMapPin, FiFlag } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';
import cienu from "../../../assets/CIENU.jpg";
import ridmae from "../../../assets/ridmae.jpg";

import { MdAccountBalance, MdAccountTree } from 'react-icons/md';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' };
const labelContainer = { flex: 3, display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: 'black', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' };
const valuePillStyle = { flex: 2, backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 8px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemInstitucion = ({
    nombreInstitucion = "Universidad de Ejemplo",
    sede = "Rectoría",
    ubicacion = "Guadalajara, Jalisco",
    pais = "México",
    listaDatos
}) => {
    return (
        <TarjetaGenerica 
            titulo={listaDatos.nombre_institucion}
            definirTipoElemento="institucion"
            indexDatosModal={listaDatos.id}
            itemData={listaDatos}
        >


            {/* Fila 1: Lista congresos totales */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><MdAccountBalance size={12} /></div>
                    <span>Congresos totales</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.congresos_totales}</div>
            </div>

            {/* Fila 2: Lista congresos totales */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><MdAccountTree size={12} /></div>
                    <span>Congresos activos</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.congresos_activos}</div>
            </div>

            {/* Fila 2: Ubicación */}
            <div style={rowStyle}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiMapPin size={12} /></div>
                    <span>Ubicación</span>
                </div>
                <div style={valuePillStyle}>
                    {ubicacion} {/* No es una píldora tradicional, es texto alineado a la izquierda */}
                </div>
            </div>

            {/* Fila 3: País */}
            <div style={{ ...rowStyle, marginTop: 'auto' }}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiFlag size={12} /></div>
                    <span>País</span>
                </div>
                <div style={valuePillStyle}>{pais}</div>
            </div>

            <div className='flex w-full items-center justify-between border rounded-full w-30 h-20 overflow-hidden'>

                {/*Aquí insertar la imagen indicada en la base de datos*/}
                {/*<img src={listaDatos.ruta_imagen} alt="Imagen del congreso"/>*/}

                <img className="w-full h-full object-cover" src={ridmae} alt="Imagen del congreso" />
            </div>

        </TarjetaGenerica>
    );
};

export default ItemInstitucion;