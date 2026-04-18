import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import DetallesCrearCongreso from "./Componentes/DetallesCrearCongreso";

export default function CongresoDetallesView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = new URLSearchParams(location.search).get('edit') === 'true';

  return (
    <div className="flex flex-col bg-base-100 p-0 md:p-4 rounded-3xl border border-base-300 shadow-sm min-h-[400px]">


      <div className="flex-1 w-full overflow-hidden">
        <DetallesCrearCongreso indexDatosModal={id} initialModificando={isEditing} isFullPage={true} />
      </div>
    </div>
  );
}
