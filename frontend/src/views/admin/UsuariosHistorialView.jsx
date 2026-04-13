import { useState, useEffect } from "react";
import ListaHistorial from "./Componentes/ListaHistorial";
import { MdReceipt, MdBadge } from "react-icons/md";

const INITIAL_HISTORY = [
  {
    id: "h1",
    nombre: "Ernesto",
    fecha: "2025-03-30 23:59:59.00000",
    rol: "comite académico",
    accion: "modificar fecha evento"
  },
  {
    id: "h2",
    nombre: "Jimenita",
    fecha: "2026-04-04 10:59:59.00000",
    rol: "ponente",
    accion: "realizar pago"
  },
  {
    id: "h3",
    nombre: "Kaleb",
    fecha: "2026-03-15 23:59:59.00000",
    rol: "evaluador",
    accion: "cerrar sesion"
  },
  {
    id: "h4",
    nombre: "Forense",
    fecha: "2026-03-15 23:59:59.00000",
    rol: "dictaminador",
    accion: "solicitar ponencia"
  }
];

const MOCK_CONSTANCIAS = [
  {
    id: "c1",
    nombre: "Dr. Roberto Jiménez",
    fecha: "2026-04-10 14:30:00",
    rol: "ponente",
    accion: "emisión de constancia"
  },
  {
    id: "c2",
    nombre: "Mtra. Elena Salas",
    fecha: "2026-04-09 09:15:00",
    rol: "asistente",
    accion: "emisión de constancia"
  }
];

export default function UsuariosHistorialView() {
  const [activeTab, setActiveTab] = useState("facturas");
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [constanciaHistory, setConstanciaHistory] = useState(MOCK_CONSTANCIAS);

  useEffect(() => {
    // Cargar solicitudes de factura de localStorage
    const savedRequests = JSON.parse(localStorage.getItem("invoice_requests") || "[]");
    
    // Filtrar solo las facturas emitidas (estatus: green)
    const emittedInvoices = savedRequests
      .filter(req => req.status === "green")
      .map(req => ({
        id: `inv-${req.id}`,
        nombre: req.nombre,
        fecha: req.fechaEnvio || req.fechaSolicitud,
        rol: req.rol.toLowerCase(),
        accion: "emisión de factura"
      }));

    // El historial de facturas incluye las emisiones y las acciones de pago del historial inicial
    const invoices = [...emittedInvoices, ...INITIAL_HISTORY.filter(h => h.accion === "realizar pago")].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );

    setInvoiceHistory(invoices);

    // Para constancias, combinamos los mocks con cualquier acción relevante del historial inicial
    const constancias = [...MOCK_CONSTANCIAS, ...INITIAL_HISTORY.filter(h => h.accion.includes("constancia"))].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setConstanciaHistory(constancias);
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Título y Tabs */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Usuarios</h1>
            <p className="text-sm text-gray-500">Consulta el registro de documentos emitidos y acciones realizadas</p>
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("facturas")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "facturas" ? "bg-white text-[#005a6a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdReceipt className="text-xl" />
            Historial de Facturas
          </button>
          <button 
            onClick={() => setActiveTab("constancias")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "constancias" ? "bg-white text-[#005a6a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdBadge className="text-xl" />
            Historial de Constancias
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-center min-h-[500px]">
        {activeTab === "facturas" ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
             <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-700">Registro de Facturación</h3>
                <p className="text-sm text-gray-400">Listado de facturas enviadas y pagos registrados</p>
             </div>
             <ListaHistorial listaElementos={invoiceHistory}/>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-700">Registro de Constancias</h3>
                <p className="text-sm text-gray-400">Listado de certificados y reconocimientos emitidos</p>
             </div>
            <ListaHistorial listaElementos={constanciaHistory}/>
          </div>
        )}
      </div>
    </div>
  );
}
