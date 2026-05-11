import { useState, useMemo, useEffect } from "react";
import { MdKeyboardArrowDown, MdSearch, MdClose } from "react-icons/md";
import { FiDownload, FiCopy } from "react-icons/fi";
import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica";
import { getPagosAdminApi } from "../../api/pagosApi";
import { getCongresosApi, getInstitucionesApi } from "../../api/adminApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(iso) {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = d.toLocaleString("es-MX", { month: "long" });
  const anio = d.getFullYear();
  const hora = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return `${dia}/${mes}/${anio}, ${hora}`;
}

const FECHAS = ["Recientes", "Más antiguos"];

// ─── Campo de detalle ─────────────────────────────────────────────────────────
function Campo({ label, value }) {
  return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-base-content/50 w-36 flex-shrink-0">{label}</span>
        <span
            className={`flex-1 border border-base-300 rounded-full px-3 py-1 text-sm text-base-content bg-base-100 truncate h-8 ${
                !value ? "text-gray-500" : ""
            }`}
        >
        {value || "Sin datos"}
      </span>
      </div>
  );
}

// ─── Panel de detalle ─────────────────────────────────────────────────────────
function DetallePanel({ pago }) {
  if (!pago) return null;

  return (
      <div className="mt-4 border-t border-base-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-base-content">Detalles de pago</h3>
          <div className="flex gap-2">
            <button
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#006f73] transition-colors"
                title="Copiar"
            >
              <FiCopy />
            </button>
            <button
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#006f73] transition-colors"
                title="Descargar"
            >
              <FiDownload />
            </button>
          </div>
        </div>

        <div className="ml-4">
          <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Pago de evento</p>
          <div className="flex items-center gap-3 mb-4 ml-4">
            <span className="text-xs text-base-content/50 w-16 flex-shrink-0">Evento</span>
            <span className="flex-1 border border-base-300 rounded-full px-3 py-1 text-sm text-base-content bg-base-100">
            {pago.congreso || "Sin datos"}
          </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="space-y-2">
              <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Persona</p>
              <div className="ml-4 space-y-2">
                <Campo label="Nombre" value={pago.nombre} />
                <Campo label="Primer apellido" value={pago.primerApellido} />
                <Campo label="Segundo apellido" value={pago.segundoApellido} />
                <Campo label="Núm. teléfono" value={pago.telefono} />
                <Campo label="CURP" value={pago.curp} />
                <Campo label="Correo electrónico" value={pago.correo} />
                <Campo label="Rol" value={pago.rol} />
              </div>
            </div>

            <div className="space-y-2 ml-4">
              <p className="text-[11px] text-base-content/40 uppercase font-semibold tracking-wide mb-1">Otros detalles</p>
              <div className="ml-4 space-y-2">
                <Campo label="Sede destinatario" value={pago.sede} />
                <Campo
                    label="Cuenta depósito"
                    value={pago.cuentaDeposito ? `${String(pago.cuentaDeposito).slice(0, 9)}...` : "—"}
                />
                <Campo label="Fecha y hora pago" value={formatFecha(pago.fecha)} />
                <Campo label="Descuento" value={pago.descuento != null ? `${pago.descuento} %` : "0 %"} />
                <Campo label="Monto" value={`$${Number(pago.monto || 0).toFixed(2)}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PagosComponente() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [congresos, setCongresos] = useState([]);
  const [instituciones, setInstituciones] = useState([]);

  const [selectedInstitucion, setSelectedInstitucion] = useState("");
  const [selectedCongreso, setSelectedCongreso] = useState("");

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroFecha, setFiltroFecha] = useState("Recientes");
  const [filtroEst, setFiltroEst] = useState("Todos");

  const [openRol, setOpenRol] = useState(false);
  const [openFech, setOpenFech] = useState(false);
  const [openEst, setOpenEst] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("congress_access");

    const fetchPagos = async (idCongreso = null) => {
      const data = await getPagosAdminApi(token, idCongreso);
      return Array.isArray(data) ? data : [];
    };

    const loadInitial = async () => {
      try {
        setError("");
        const institucionesData = await getInstitucionesApi(token);
        setInstituciones(Array.isArray(institucionesData) ? institucionesData : institucionesData.results ?? []);

        // Cargar TODOS los pagos al inicio (casilla "Todos")
        try {
          const allPagos = await fetchPagos(null);
          setPagos(allPagos);
        } catch (err) {
          // no bloquear la carga de instituciones si falla pago
          console.warn("No se pudieron cargar todos los pagos:", err);
          setPagos([]);
        }

        setCongresos([]);
      } catch (err) {
        setError(err.message || "No se pudieron cargar instituciones.");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const handleSelectInstitucion = async (idStr) => {
    const token = localStorage.getItem("congress_access");
    const idInstitucion = idStr || "";

    setSelectedInstitucion(idInstitucion);
    setSelectedCongreso("");
    setSelected(null);
    setPagos([]);
    setCongresos([]);

    // helper local
    const fetchPagos = async (idCongreso = null) => {
      const data = await getPagosAdminApi(token, idCongreso);
      return Array.isArray(data) ? data : [];
    };

    // Si seleccionó "Todos" (cadena vacía), mostramos todos los pagos
    if (!idInstitucion) {
      try {
        setError("");
        const allPagos = await fetchPagos(null);
        setPagos(allPagos);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los pagos.");
      }
      return;
    }

    try {
      setError("");
      const congresosData = await getCongresosApi(token, idInstitucion);
      const congresosArr = Array.isArray(congresosData) ? congresosData : congresosData.results ?? [];
      setCongresos(congresosArr);

      if (!congresosArr || congresosArr.length === 0) {
        setPagos([]);
        return;
      }

      // Obtener pagos por cada congreso en paralelo y unir resultados
      const pagosPromises = congresosArr.map((c) => fetchPagos(c.id_congreso));
      const pagosArrays = await Promise.all(pagosPromises);
      const merged = pagosArrays.flat();
      merged.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
      setPagos(merged);
    } catch (err) {
      setError(err.message || "No se pudieron cargar congresos o pagos para la institución.");
    }
  };

  const handleSelectCongreso = async (idStr) => {
    const token = localStorage.getItem("congress_access");
    const idCongreso = idStr || "";

    setSelectedCongreso(idCongreso);
    setSelected(null);

    // Si selecciona "Todos" dentro de una institución -> volver a mostrar los pagos ya cargados para la institución
    if (!idCongreso) {
      if (selectedInstitucion) {
        // re-disparar selección de institución para recargar pagos por sus congresos
        await handleSelectInstitucion(selectedInstitucion);
      } else {
        try {
          setError("");
          const data = await getPagosAdminApi(token, null);
          setPagos(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message || "No se pudieron cargar los pagos.");
        }
      }
      return;
    }

    try {
      setError("");
      const data = await getPagosAdminApi(token, idCongreso);
      setPagos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el historial de pagos.");
    }
  };

  const ROLES_DISPONIBLES = useMemo(() => {
    const roles = new Set((pagos || []).map((p) => p.rol).filter(Boolean));
    return ["Todos", ...Array.from(roles)];
  }, [pagos]);

  const ESTATUS_DISPONIBLES = useMemo(() => {
    const estatus = new Set((pagos || []).map((p) => p.estatus).filter(Boolean));
    return ["Todos", ...Array.from(estatus)];
  }, [pagos]);

  const filtrados = useMemo(() => {
    let list = [...pagos];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
          (p) =>
              String(p.orden ?? "").includes(q) ||
              String(p.nombre ?? "").toLowerCase().includes(q) ||
              String(p.correo ?? "").toLowerCase().includes(q)
      );
    }

    if (filtroRol !== "Todos") list = list.filter((p) => p.rol === filtroRol);
    if (filtroEst !== "Todos") list = list.filter((p) => p.estatus === filtroEst);

    list.sort((a, b) =>
        filtroFecha === "Recientes" ? Number(b.orden || 0) - Number(a.orden || 0) : Number(a.orden || 0) - Number(b.orden || 0)
    );

    return list;
  }, [pagos, search, filtroRol, filtroFecha, filtroEst]);

  function Dropdown({ value, options, open, onToggle, onSelect }) {
    return (
        <div className="relative">
          <button
              onClick={onToggle}
              className="flex items-center gap-1 text-sm text-base-content/70 hover:text-gray-800 transition-colors"
          >
            {value} <MdKeyboardArrowDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
              <div className="absolute left-0 top-7 z-50 w-44 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                {options.map((o) => (
                    <button
                        key={o}
                        onClick={() => {
                          onSelect(o);
                          onToggle();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 transition-colors ${
                            value === o ? "text-black font-semibold bg-gray-200" : "text-base-content/70"
                        }`}
                    >
                      {o}
                    </button>
                ))}
              </div>
          )}
        </div>
    );
  }

  if (loading) {
    return (
        <div className="bg-base-100 rounded-3xl p-5 flex justify-center py-16">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
    );
  }

  const listaCongresosDropdown = congresos.map((c) => ({ id: c.id_congreso, nombre: c.nombre_congreso }));
  const listaInstitucionesDropdown = instituciones.map((i) => ({ id: i.id_institucion, nombre: i.nombre }));

  return (
      <div className="bg-base-100 rounded-3xl p-5">
        <div className="flex gap-4 mb-10">
          <ListaDesplegableElementosGenerica
              titulo="Instituciones"
              lista={listaInstitucionesDropdown}
              value={selectedInstitucion}
              onSelect={handleSelectInstitucion}
          />
          <ListaDesplegableElementosGenerica
              titulo="Congresos"
              lista={listaCongresosDropdown}
              value={selectedCongreso}
              onSelect={handleSelectCongreso}
          />
        </div>

        <div className="flex justify-between bg-black rounded-t-2xl p-4 h-20 items-center pl-8">
          <p className="font-bold text-base-content text-white text-2xl">Órdenes de pago</p>
        </div>

        <div className="border border-base-300 p-4 rounded-b-2xl">
          {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-2">
            <div>
              <p className="text-sm font-bold text-base-content mb-1">Orden de pago</p>
              <div className="relative">
                <MdSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                    type="text"
                    placeholder="Buscar ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-7 pr-6 py-1 text-sm border-b border-base-300 bg-transparent focus:outline-none focus:border-[#00868a] transition-colors"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-1 top-1/2 -translate-y-1/2 text-base-content/30">
                      <MdClose size={12} />
                    </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-base-content mb-1">Rol</p>
              <Dropdown
                  value={filtroRol}
                  options={ROLES_DISPONIBLES}
                  open={openRol}
                  onToggle={() => {
                    setOpenRol((o) => !o);
                    setOpenFech(false);
                    setOpenEst(false);
                  }}
                  onSelect={setFiltroRol}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-base-content mb-1">Fecha</p>
              <Dropdown
                  value={filtroFecha}
                  options={FECHAS}
                  open={openFech}
                  onToggle={() => {
                    setOpenFech((o) => !o);
                    setOpenRol(false);
                    setOpenEst(false);
                  }}
                  onSelect={setFiltroFecha}
              />
            </div>
          </div>

          <div className="flex justify-end mb-3">
            <div>
              <p className="text-sm font-bold text-base-content mb-1">Estatus</p>
              <Dropdown
                  value={filtroEst}
                  options={ESTATUS_DISPONIBLES}
                  open={openEst}
                  onToggle={() => {
                    setOpenEst((o) => !o);
                    setOpenRol(false);
                    setOpenFech(false);
                  }}
                  onSelect={setFiltroEst}
              />
            </div>
          </div>

          <div className="border-t border-base-200 my-3" />

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 300 }}>
            {/* Mostrar mensaje inicial sólo si no hay pagos cargados y no se ha seleccionado nada */}
            {pagos.length === 0 && !selectedInstitucion && !selectedCongreso ? (
                <p className="text-center py-8 text-sm text-base-content/40 italic">
                  Selecciona una institución o un congreso para ver pagos.
                </p>
            ) : filtrados.length === 0 ? (
                <p className="text-center py-8 text-sm text-base-content/40 italic">Sin resultados</p>
            ) : (
                filtrados.map((p) => (
                    <button        key={p.orden}        onClick={() => setSelected((s) => (s?.orden === p.orden ? null : p))}        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left ${
                        selected?.orden === p.orden
                            ? "border-black bg-gray-200"
                            : "border-base-300 hover:border-gray-400 hover:bg-base-200/40"
                    }`}      >
                      <span className="text-sm font-bold text-base-content flex-1">#{p.orden}</span>
                      <span className="text-sm text-base-content/70 flex-1">{p.rol || "Sin rol"}</span>
                      <span className="text-sm text-base-content/60 flex-1">{formatFecha(p.fecha)}</span>
                    </button>
                ))
            )}
          </div>

          <DetallePanel pago={selected} />
        </div>
      </div>
  );
}