import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import CrearMesasFisicas from "./Componentes/CrearMesasFisicas";
import DetallesSede from "./Componentes/DetallesSede";

export default function CongresoSedeView() {
  const navigate = useNavigate();

  const listaMesas = [
    { id: 1, nombre: 'Mesa A', subarea: 'POO', capacidad: '50' },
    { id: 2, nombre: 'Mesa B', subarea: 'Bases de Datos', capacidad: '40' },
    { id: 3, nombre: 'Mesa C', subarea: 'Redes', capacidad: '30' }
  ];

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex gap-4">
          <div className="border bg-black rounded-full h-10 w-2"></div>
          <h2 className="flex-1 text-2xl font-bold text-start">Revisión</h2>
        </div>
        <p className="pl-12 text-start text-gray-500 mb-3">
          Aquí se gestiona la revisión de extensos
        </p>
      </div>

      <div className="space-y-10">
        <DetallesSede />
        <CrearMesasFisicas listaMesas={listaMesas} />
      </div>
    </div>
  );
}
