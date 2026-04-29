import React from 'react';
import { FiMapPin, FiFlag } from 'react-icons/fi';
import TarjetaGenerica from './TarjetaGenerica';
import { API_URL} from "../../../api/constants.js";
import { MdAccountBalance, MdAccountTree } from 'react-icons/md';

// Reutilizamos estilos base
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' };
const labelContainer = { flex: 3, display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4A4A', fontSize: '14px' };
const iconCircleBox = { backgroundColor: 'black', color: '#FFFFFF', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' };
const valuePillStyle = { flex: 2, backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '4px 8px', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', textAlign: 'center', minWidth: '60px' };

const ItemInstitucion = ({
                             listaDatos
}) => {
    const imageSrc = listaDatos?.ruta_imagen
        ? (listaDatos.ruta_imagen.startsWith('http')
            ? listaDatos.ruta_imagen
            : `${API_URL}${listaDatos.ruta_imagen}`)
        : null;
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
                    {listaDatos.ubicacion || "Sin ubicación"}
                </div>
            </div>

            {/* Fila 3: País */}
            <div style={{ ...rowStyle, marginTop: 'auto' }}>
                <div style={labelContainer}>
                    <div style={iconCircleBox}><FiFlag size={12} /></div>
                    <span>País</span>
                </div>
                <div style={valuePillStyle}>{listaDatos.pais || "México"}</div>
            </div>

            <div className='flex w-full items-center justify-between border rounded-full w-30 h-20 overflow-hidden'>

                {/*Aquí insertar la imagen indicada en la base de datos*/}
                {/*<img src={listaDatos.ruta_imagen} alt="Imagen del congreso"/>*/}

                {imageSrc ? (
                    <img className="w-full h-full object-cover" src={imageSrc} alt="Imagen de la institución" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Sin imagen
                    </div>
                )}
            </div>

        </TarjetaGenerica>
    );
};

export default ItemInstitucion;