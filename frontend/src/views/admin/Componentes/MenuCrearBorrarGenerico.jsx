import React, { useState } from 'react';
import { FiDownload, FiMinus, FiPlus } from 'react-icons/fi';
import Itemcrearborrargenerico from './itemcrearborrargenerico';
import ItemPonencia2 from './ItemPonencia2';
import ItemTaller from './ItemTaller';
import ItemCongreso from "./ItemCongreso";
import ItemInstitucion from "./ItemInstitucion";
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import Modal from './Modal';
import DetallesCrearCongreso from './DetallesCrearCongreso';
import DetallesEditarTaller from './DetallesEditarTaller';
import DetallesEditarPonencia from './DetallesEditarPonencia';
import DetallesEditarInstitucion from './DetallesEditarInstitucion';

const MenuCrearBorrarGenerico = ({
                                     title = "Crear [insertar sustantivo]",
                                     onDownload,
                                     onRemove,
                                     listaElementos2,
                                     definirTipoElemento = "ponencia",
                                     onViewItem
                                 }) => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const [listaElementos, setListaElementos] = React.useState(listaElementos2);

    React.useEffect(() => {
        setListaElementos(listaElementos2);
    }, [listaElementos2]);

    const mostrarAgregarEliminar = true; // Habilitado para todos los tipos según requerimiento

    const renderizarItem = (objeto, index) => {
        switch(definirTipoElemento){
            case "ponencia":
                return <ItemPonencia2 key={objeto.id || index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "taller":
                return <ItemTaller key={objeto.id || index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "institucion":
                return <ItemInstitucion key={objeto.id || index} listaDatos={objeto} onViewItem={onViewItem} />;
            case "congreso":
                return <ItemCongreso key={objeto.id || index} listaDatos={objeto} onViewItem={onViewItem} />;
            default:
                return null;
        }
    };

    const renderizarDetallesItemModal = () => {
        switch(definirTipoElemento){
            case "ponencia":
                return <DetallesEditarPonencia/>;
            case "taller":
                return <DetallesEditarTaller/>;
            case "institucion":
                return <DetallesEditarInstitucion/>;
            case "congreso":
                return <DetallesCrearCongreso modificandoDatos={true} />;
            default:
                return null;
        }
    };

    const [openModal, setOpenModal] = useState(false);

    function handleAgregarElemento(){
        if (definirTipoElemento === 'taller') {
            navigate(`/admin/eventos/talleres/crear${search}`);
            return;
        }
        if (definirTipoElemento === 'congreso') {
            navigate(`/admin/eventos/congresos/crear${search}`);
            return;
        }
        if (definirTipoElemento === 'ponencia') {
            navigate(`/admin/eventos/ponencias/crear${search}`);
            return;
        }
        if (definirTipoElemento === 'institucion') {
            navigate(`/admin/ajustes/instituciones/crear${search}`);
            return;
        }
        setOpenModal(true);
    }

    return (
        <div className="w-full bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <Modal abierto={openModal} onClose={()=>setOpenModal(false)}>
                {renderizarDetallesItemModal()}
            </Modal>

            {/* Header */}
            <header className="bg-black text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-white rounded-full hidden sm:block"></div>
                    <h2 className="text-xl font-bold uppercase tracking-wider">{title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    {mostrarAgregarEliminar && (
                        <button 
                            onClick={handleAgregarElemento}
                            className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:brightness-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                        >
                            <IoMdAdd size={18} />
                            Crear {definirTipoElemento}
                        </button>
                    )}

                    <button 
                        onClick={onDownload} 
                        className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 ml-2" 
                        title="Descargar"
                    >
                        <FiDownload size={18} />
                    </button>

                    {mostrarAgregarEliminar && (
                        <div className="bg-white/10 rounded-full p-1 flex gap-1">
                            <button 
                                onClick={onRemove} 
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95" 
                                title="Quitar"
                            >
                                <FiMinus size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-6 md:p-10 bg-base-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center">
                    {listaElementos.map((objeto, index) => renderizarItem(objeto, index))}
                </div>

                {listaElementos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <p className="italic text-lg">No hay {definirTipoElemento}s para mostrar.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MenuCrearBorrarGenerico;