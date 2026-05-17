import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import DetallesEditarPonencia from "./Componentes/DetallesEditarPonencia";

export default function PonenciaDetallesView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isEditing = queryParams.get('edit') === 'true';
  const tipoPonencia = queryParams.get('tipo') === 'magistral' ? 'magistral' : 'normal';
  const esMagistral = tipoPonencia === 'magistral';
  const ponenciaRef = useRef();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-base-200 hover:bg-base-300 rounded-full transition-all active:scale-90"
        >
          <MdArrowBack size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold">
            {esMagistral ? "Detalles de la Ponencia Magistral" : "Detalles de la Ponencia"}
          </h2>
          <p className="text-sm text-base-content/50">Consulta o modifica la información de la ponencia</p>
        </div>
      </div>

      <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden min-h-[400px]">
        <DetallesEditarPonencia
          ref={ponenciaRef}
          key={`${tipoPonencia}-${id}`}
          ponenciaData={{ id: parseInt(id), tipo_ponencia: tipoPonencia }}
          initialModificando={isEditing}
          isFullPage={true}
        />
      </div>

      {isEditing && (
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 rounded-2xl bg-base-200 text-base-content font-black hover:bg-base-300 transition-all active:scale-95 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={() => ponenciaRef.current?.handleSave()}
            className="px-10 py-4 rounded-2xl bg-black text-white font-black shadow-xl hover:bg-[#005a6a] transition-all active:scale-95 text-xs"
          >
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
}
