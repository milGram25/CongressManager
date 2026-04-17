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
      <div className="mb-2">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Sede del Congreso</h1>
          <p className="text-sm text-base-content/50">Configuración de ubicación, costos y espacios físicos</p>
        </div>
      </div>

      <div className="space-y-10">
        <DetallesSede />
        <CrearMesasFisicas listaMesas={listaMesas} />
      </div>
    </div>
  );
}
