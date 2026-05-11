import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { LuCrown } from 'react-icons/lu';
import DetallesPonenciaMagistral from './Componentes/DetallesPonenciaMagistral';

export default function PonenciaMagistralDetallesView() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
                >
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <LuCrown className="text-primary" /> Detalles de la Ponencia Magistral
                    </h2>
                    <p className="text-sm text-base-content/50">Consulta la información de la ponencia magistral</p>
                </div>
            </div>

            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden min-h-[400px]">
                <DetallesPonenciaMagistral
                    key={id}
                    idPonenciaMagistral={parseInt(id)}
                    isFullPage={true}
                />
            </div>
        </div>
    );
}
