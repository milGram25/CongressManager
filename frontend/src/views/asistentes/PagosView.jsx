import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PagosForm from "./components/PagosForm";
import { getPagosResumenApi, registrarPagoApi, solicitarFacturaApi } from "../../api/pagosApi";
import { getCongresosApi } from "../../api/adminApi";
import { enviarCodigoEstudianteApi, verificarCodigoEstudianteApi } from "../../api/authApi";
import {
  MdSchool,
  MdEmail,
  MdVpnKey,
  MdCheckCircle,
  MdInfoOutline,
  MdArrowBack,
  MdDateRange,
  MdClose,
  MdVisibility,
  MdDeleteOutline,
} from "react-icons/md";

function roleLabel(role) {
  if (role === "ponente") return "Ponente";
  if (role === "asistente") return "Participante";
  if (role === "dictaminador") return "Dictaminador";
  if (role === "revisor") return "Revisor";
  if (role === "administrador") return "Administrador";
  return "Usuario";
}

export default function PagosView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idCongreso = searchParams.get("id_congreso") || null;
  const nombreCongreso = searchParams.get("nombre") || null;

  const [listaCongresos, setListaCongresos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [resumenError, setResumenError] = useState("");
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [pagoError, setPagoError] = useState("");
  const [slotsToPay, setSlotsToPay] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);

  // Inicializar slotsToPay con el mínimo requerido (mínimo 0)
  useEffect(() => {
    const minRequired = resumen?.user_payment?.pending_min || 0;
    setSlotsToPay(minRequired);
    if (!selectedRole && resumen?.user_payment?.role) {
      setSelectedRole(resumen.user_payment.role);
    }
  }, [resumen]);

  const [isStudent, setIsStudent] = useState(user?.es_estudiante_validado ? true : null);
  const [studentEmail, setStudentEmail] = useState(user?.email_institucional || "");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(user?.es_estudiante_validado || false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);

  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [quiereFactura, setQuiereFactura] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [enviandoFactura, setEnviandoFactura] = useState(false);
  const [errorFactura, setErrorFactura] = useState("");
  const [usarCorreoAlternativo, setUsarCorreoAlternativo] = useState(false);
  const [correoFacturacion, setCorreoFacturacion] = useState("");
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);
  const [constanciaFiscalFile, setConstanciaFiscalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [datosFacturacion, setDatosFacturacion] = useState({
    rfc: "",
    razonSocial: "",
    cp: "",
    regimenFiscal: "601",
    usoCFDI: "G03",
  });

  const REGIMENES = [
    { code: "601", label: "General de Ley Personas Morales" },
    { code: "603", label: "Personas Morales con Fines no Lucrativos" },
    { code: "605", label: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
    { code: "606", label: "Arrendamiento" },
    { code: "607", label: "Régimen de Enajenación o Adquisición de Bienes" },
    { code: "608", label: "Demás ingresos" },
    { code: "610", label: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
    { code: "611", label: "Ingresos por Dividendos (socios y accionistas)" },
    { code: "612", label: "Personas Físicas con Actividades Empresariales y Profesionales" },
    { code: "614", label: "Ingresos por intereses" },
    { code: "615", label: "Régimen de los ingresos por obtención de premios" },
    { code: "616", label: "Sin obligaciones fiscales" },
    { code: "620", label: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
    { code: "621", label: "Incorporación Fiscal" },
    { code: "622", label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
    { code: "623", label: "Opcional para Grupos de Sociedades" },
    { code: "624", label: "Coordinados" },
    { code: "625", label: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
    { code: "626", label: "Régimen Simplificado de Confianza" },
  ];

  const USOS = [
    { code: "G01", label: "Adquisición de mercancías" },
    { code: "G02", label: "Devoluciones, descuentos o bonificaciones" },
    { code: "G03", label: "Gastos en general" },
    { code: "I01", label: "Construcciones" },
    { code: "I02", label: "Mobiliario y equipo de oficina por inversiones" },
    { code: "I03", label: "Equipo de transporte" },
    { code: "I04", label: "Equipo de cómputo y accesorios" },
    { code: "I05", label: "Dados, troqueles, moldes, matrices y herramental" },
    { code: "I06", label: "Comunicaciones telefónicas" },
    { code: "I07", label: "Comunicaciones satelitales" },
    { code: "I08", label: "Otra maquinaria y equipo" },
    { code: "D01", label: "Honorarios médicos, dentales y gastos hospitalarios" },
    { code: "D02", label: "Gastos médicos por incapacidad o discapacidad" },
    { code: "D03", label: "Gastos funerales" },
    { code: "D04", label: "Donativos" },
    { code: "D05", label: "Intereses reales efectivamente pagados por créditos hipotecarios" },
    { code: "D06", label: "Aportaciones voluntarias al SAR" },
    { code: "D07", label: "Primas por seguros de gastos médicos" },
    { code: "D08", label: "Gastos de transportación escolar obligatoria" },
    { code: "D09", label: "Depósitos en cuentas para el ahorro, primas de planes de pensiones" },
    { code: "D10", label: "Pagos por servicios educativos (colegiaturas)" },
    { code: "S01", label: "Sin efectos fiscales" },
    { code: "CP01", label: "Pagos" },
    { code: "CN01", label: "Nómina" },
  ];

  // 1. Cargar lista de congresos una sola vez al montar
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("congress_access");
        if (!token) return;
        const list = await getCongresosApi(token);
        setListaCongresos(list);

        const now = new Date();
        const future = list.filter(c => new Date(c.congreso_fin) >= now);
        future.sort((a, b) => new Date(a.congreso_inicio) - new Date(b.congreso_inicio));

        // Obtener id_congreso actual de los params (fresco)
        const params = new URLSearchParams(window.location.search);
        const currentId = params.get("id_congreso");

        if (!currentId) {
          if (future.length > 0) {
            setSearchParams({
              id_congreso: future[0].id_congreso.toString(),
              nombre: future[0].nombre_congreso
            });
          } else {
            setResumenError("No hay congresos activos disponibles para pago.");
            setLoadingResumen(false);
          }
        } else {
          // Validar el que ya viene en la URL
          const selected = list.find(c => c.id_congreso.toString() === currentId);
          if (!selected || new Date(selected.congreso_fin) < now) {
            if (future.length > 0) {
              setSearchParams({
                id_congreso: future[0].id_congreso.toString(),
                nombre: future[0].nombre_congreso
              });
            } else {
              setResumenError("El congreso seleccionado ha finalizado o no es válido.");
              setLoadingResumen(false);
            }
          }
        }
      } catch (e) {
        console.error("Error al inicializar congresos:", e);
        setResumenError("Error al cargar la lista de congresos.");
        setLoadingResumen(false);
      }
    };
    init();
  }, []); // Solo al montar

  useEffect(() => {
    if (constanciaFiscalFile) {
      const url = URL.createObjectURL(constanciaFiscalFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [constanciaFiscalFile]);

  // 2. Cargar resumen cuando cambie idCongreso
  useEffect(() => {
    const loadResumen = async () => {
      if (!idCongreso) return;

      setLoadingResumen(true);
      setResumenError("");
      try {
        const token = localStorage.getItem("congress_access");
        if (!token) throw new Error("No hay sesión activa.");
        const data = await getPagosResumenApi(token, idCongreso);
        setResumen(data);
      } catch (err) {
        setResumenError(err.message || "No se pudo cargar la información de pagos.");
      } finally {
        setLoadingResumen(false);
      }
    };

    loadResumen();
  }, [idCongreso]);

  const isFormValid = useMemo(() => {
    const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2}[A-Z\d])$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpRegex = /^\d{5}$/;

    const camposFiscalesValidos =
      rfcRegex.test(datosFacturacion.rfc) &&
      datosFacturacion.razonSocial.length >= 3 &&
      cpRegex.test(datosFacturacion.cp) &&
      datosFacturacion.regimenFiscal !== "" &&
      constanciaFiscalFile !== null;

    const correoValido = usarCorreoAlternativo
      ? emailRegex.test(correoFacturacion)
      : true;

    return camposFiscalesValidos && correoValido;
  }, [datosFacturacion, usarCorreoAlternativo, correoFacturacion, constanciaFiscalFile]);

  const userPayment = resumen?.user_payment;
  const currentRole = userPayment?.role || user?.rol || "asistente";
  const activeRole = selectedRole || currentRole;
  const isPonente = activeRole === "ponente";
  
  const priceCatalog = resumen?.price_catalog || {};
  const basePrice = isPonente ? (priceCatalog.ponente || 0) : (priceCatalog.asistente || 0);
  
  const pendingSlots = Number(userPayment?.pending_slots || 0);
  const paidSlots = Number(userPayment?.paid_slots || 0);
  const overflowPonencias = Number(userPayment?.overflow_ponencias_count || 0);
  const alreadyPaid = currentRole === "ponente" ? paidSlots >= 1 : Boolean(userPayment?.already_paid);
  const backendTotalDue = Number(userPayment?.total_due || 0);

  const finalPrice = useMemo(() => {
    if (!userPayment) return 0;
    
    // Si el rol activo es distinto al actual, usamos lógica de precio base simple
    if (activeRole !== currentRole) {
      if (activeRole === "asistente") {
        return isVerified ? basePrice * 0.5 : basePrice;
      }
      if (activeRole === "ponente") {
        return basePrice + (Number(slotsToPay) * basePrice);
      }
    }

    // Si es el rol actual, respetamos la lógica del backend
    if (isPonente) {
      const isBuyingBase = paidSlots === 0;
      const baseCost = isBuyingBase ? basePrice : 0;
      return baseCost + (Number(slotsToPay) * basePrice);
    }
    if (activeRole === "asistente") {
      if (alreadyPaid) return 0;
      if (isVerified) return basePrice * 0.5;
      return backendTotalDue;
    }
    return backendTotalDue;
  }, [userPayment, isPonente, activeRole, currentRole, isVerified, alreadyPaid, basePrice, backendTotalDue, slotsToPay]);

  const canSubmitPayment = useMemo(() => {
    if (!userPayment) return false;
    if (activeRole === currentRole && alreadyPaid && (!isPonente || userPayment.can_buy_more === 0)) return false;
    if (isPonente) {
      return overflowPonencias === 0 && (activeRole !== currentRole || pendingSlots > 0 || userPayment.can_buy_more > 0) && finalPrice > 0;
    }
    return finalPrice > 0;
  }, [userPayment, isPonente, activeRole, currentRole, alreadyPaid, overflowPonencias, pendingSlots, finalPrice]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanEmail = studentEmail.trim().toLowerCase();
    const eduRegex = /(\.edu(\.[a-z]{2,3})?|alumnos\.udg\.mx)$/i;
    if (!eduRegex.test(cleanEmail)) {
      setError("El correo debe ser institucional válido (.edu, .edu.mx, alumnos.udg.mx, etc).");
      return;
    }

    setEnviandoCodigo(true);
    try {
      const token = localStorage.getItem("congress_access");
      await enviarCodigoEstudianteApi(token, cleanEmail);
      setShowVerification(true);
    } catch (err) {
      setError(err.message || "Error al enviar el código.");
    } finally {
      setEnviandoCodigo(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setVerificandoCodigo(true);
    try {
      const token = localStorage.getItem("congress_access");
      const cleanCode = verificationCode.trim();
      await verificarCodigoEstudianteApi(token, cleanCode);
      setIsVerified(true);
      setShowVerification(false);
    } catch (err) {
      setError(err.message || "Código incorrecto.");
    } finally {
      setVerificandoCodigo(false);
    }
  };

  const handleRegistrarPago = async () => {
    setPagoError("");
    setRegistrandoPago(true);
    try {
      const token = localStorage.getItem("congress_access");
      if (!token) throw new Error("No hay sesión activa.");

      const payload = {
        requiere_factura: false,
        monto: finalPrice,
        selected_role: activeRole,
        ...(idCongreso && { id_congreso: idCongreso }),
        ...(isPonente && { slots_to_pay: slotsToPay }),
      };
      const response = await registrarPagoApi(token, payload);
      setResumen(response.summary);
      if (idCongreso) {
        const prev = JSON.parse(localStorage.getItem('congress_inscripciones') || '[]');
        if (!prev.includes(Number(idCongreso))) {
          localStorage.setItem('congress_inscripciones', JSON.stringify([...prev, Number(idCongreso)]));
        }
      }
      setPagoExitoso(true);
    } catch (err) {
      setPagoError(err.message || "No se pudo registrar el pago.");
    } finally {
      setRegistrandoPago(false);
    }
  };

  const handleEnviarSolicitudFactura = async () => {
    setEnviandoFactura(true);
    setErrorFactura("");
    try {
      const token = localStorage.getItem("congress_access");
      const formData = new FormData();
      if (idCongreso) formData.append("id_congreso", idCongreso);

      const cleanRFC = datosFacturacion.rfc.trim().toUpperCase();
      const cleanRazon = datosFacturacion.razonSocial.trim().toUpperCase().replace(/\s+/g, ' ');
      const cleanCP = datosFacturacion.cp.trim();

      formData.append("rfc", cleanRFC);
      formData.append("razon_social", cleanRazon);
      formData.append("codigo_postal", cleanCP);
      formData.append("regimen_fiscal", datosFacturacion.regimenFiscal);
      if (constanciaFiscalFile) {
        formData.append("constancia_fiscal", constanciaFiscalFile);
      }

      await solicitarFacturaApi(token, formData);
      setSolicitudEnviada(true);
      setQuiereFactura(false);
    } catch (err) {
      setErrorFactura(err.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviandoFactura(false);
    }
  };

  if (loadingResumen && !resumenError && listaCongresos.length === 0) {
    return <div className="max-w-4xl mx-auto p-4">Cargando información de pagos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {idCongreso && (
        <button
          onClick={() => navigate("/asistente/agenda")}
          className="btn btn-ghost btn-sm gap-1 mb-4 -ml-2"
        >
          <MdArrowBack className="text-lg" />
          Congresos
        </button>
      )}

      <h2 className="text-3xl font-bold mb-8 text-neutral">
        {nombreCongreso || "Inscripción al Congreso"}
      </h2>

      {/* Selector de Congreso - Arriba del panel principal */}
      {listaCongresos.length > 0 && (
        <div className="mb-8 p-6 bg-base-100 rounded-2xl border-2 border-base-300 shadow-sm">
          <label className="text-[10px] font-bold opacity-50 mb-1 block px-1">
            Selecciona el congreso para realizar el pago
          </label>
          <div className="relative">
            <MdDateRange className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <select
              className="select select-bordered w-full pl-12 font-bold text-sm"
              value={idCongreso || ""}
              onChange={(e) => {
                const selected = listaCongresos.find(
                  (c) => c.id_congreso.toString() === e.target.value
                );
                if (selected) {
                  setSearchParams({
                    id_congreso: selected.id_congreso.toString(),
                    nombre: selected.nombre_congreso,
                  });
                }
              }}
            >
              {listaCongresos.map((c) => (
                <option
                  key={c.id_congreso}
                  value={c.id_congreso}
                  disabled={new Date(c.congreso_fin) < new Date()}
                >
                  {c.nombre_congreso}{" "}
                  {new Date(c.congreso_fin) < new Date() ? "(Pasado)" : ""}
                </option>
              ))}
            </select>
          </div>
          {resumenError && (
            <p className="text-error font-bold text-[11px] mt-4 uppercase tracking-wider px-1">
              {resumenError}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-base-100 p-8 rounded-2xl border-2 border-base-300 shadow-sm">
            <h3 className="text-xl font-bold border-b border-base-200 pb-2 mb-4 text-neutral">
              Detalle de inscripción
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="opacity-50 font-bold text-[10px] tracking-widest">Nombre</p>
                <p className="font-medium text-neutral">{user?.nombre || "Usuario Demo"}</p>
              </div>
              <div>
                <p className="opacity-50 font-bold text-[10px] tracking-widest">Rol de registro</p>
                {alreadyPaid ? (
                  <p className="font-bold text-alt">{roleLabel(currentRole)}</p>
                ) : (
                  <select 
                    className="select select-ghost select-xs font-bold text-alt -ml-1 focus:bg-transparent"
                    value={activeRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="asistente">Asistente</option>
                    <option value="ponente">Ponente</option>
                  </select>
                )}
              </div>
            </div>

            {isPonente && (
              <div className="mb-6 p-4 rounded-xl border-l-4 border-alt/50 bg-alt/5 text-sm py-3 px-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-alt">
                  <MdInfoOutline className="text-base" />
                  <span className="font-bold text-[12px] tracking-widest">Regla de ponencias</span>
                </div>
                <p className="text-neutral/80 text-s leading-relaxed">
                  El pago como <b>ponente</b> cubre <b>2 ponencias</b>. Cada ponencia adicional tiene un cargo extra.
                </p>
                {userPayment && activeRole === currentRole && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[12px] font-medium text-alt/70 italic">
                      * Tienes <b>{userPayment.total_ponencias_count || 0}</b> ponencias enviadas en total.
                    </p>
                    <p className="text-[12px] font-medium text-alt/70 italic">
                      * Tienes <b>{userPayment.accepted_ponencias_count || 0}</b> ponencias aceptadas.
                    </p>
                    {userPayment.total_ponencias_count > (userPayment.paid_slots || 0) * 2 && (
                      <p className="text-[12px] font-medium text-error mt-1">
                        Atención: Has enviado más ponencias de las que cubre tu pago actual.
                      </p>
                    )}
                  </div>
                )}
                {activeRole !== currentRole && (
                  <p className="text-[10px] text-alt font-medium mt-2 italic">
                    Al registrarte como ponente podrás enviar y presentar tus trabajos de investigación.
                  </p>
                )}
              </div>
            )}

            {activeRole === "asistente" && isStudent !== false && (
              <div
                className={`p-6 rounded-2xl border-2 transition-all ${isVerified ? "border-secondary bg-alt/5" : "border-dashed border-base-300"}`}
              >
                {!isVerified ? (
                  <>
                    {isStudent === null && (
                      <div className="text-center space-y-4">
                        <MdSchool className="text-4xl mx-auto text-secondary opacity-80" />
                        <h4 className="font-bold text-neutral">¿Eres estudiante activo?</h4>
                        <p className="text-sm opacity-70 text-neutral">
                          Obtén un 50% de descuento adicional validando tu correo institucional.
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setIsStudent(true)}
                            className="btn bg-seconday hover:bg-secondary/80 border-none text-secondary hover:text-white btn-sm rounded-full px-8"
                          >
                            Sí, soy estudiante
                          </button>
                          <button
                            onClick={() => setIsStudent(false)}
                            className="btn btn-ghost btn-sm rounded-full opacity-60 text-neutral"
                          >
                            No, tarifa general
                          </button>
                        </div>
                      </div>
                    )}

                    {isStudent === true && !showVerification && (
                      <form onSubmit={handleEmailSubmit} className="space-y-4 text-neutral">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setIsStudent(null)}
                            className="btn btn-ghost btn-xs"
                          >
                            ← Volver
                          </button>
                          <span className="text-sm font-bold">Validación Institucional</span>
                        </div>
                        <div className="relative">
                          <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                          <input
                            type="email"
                            required
                            placeholder="Tu correo institucional"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-base-200 border-none outline-none focus:ring-2 focus:ring-secondary text-sm"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                          />
                        </div>
                        {error && <p className="text-error text-[10px] px-2">{error}</p>}
                        <button
                          type="submit"
                          disabled={enviandoCodigo}
                          className={`btn bg-secondary hover:bg-secondary/80 border-none w-full text-white rounded-xl ${enviandoCodigo ? 'loading' : ''}`}
                        >
                          {enviandoCodigo ? "Enviando..." : "Enviar código de verificación"}
                        </button>
                      </form>
                    )}

                    {showVerification && (
                      <form onSubmit={handleVerifyCode} className="space-y-4 text-neutral">
                        <div className="text-center">
                          <p className="text-sm font-bold mb-1">Verifica tu correo</p>
                          <p className="text-[10px] opacity-60">Enviamos un código a {studentEmail}</p>
                        </div>
                        <div className="relative">
                          <MdVpnKey className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                          <input
                            type="text"
                            required
                            placeholder="Introduce el código (123456)"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-base-200 border-none outline-none focus:ring-2 focus:ring-secondary text-sm font-bold"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </div>
                        {error && <p className="text-error text-[10px] px-2">{error}</p>}
                        <button
                          type="submit"
                          disabled={verificandoCodigo}
                          className={`btn bg-secondary hover:bg-secondary/80 border-none w-full text-white rounded-xl ${verificandoCodigo ? 'loading' : ''}`}
                        >
                          {verificandoCodigo ? "Verificando..." : "Verificar código"}
                        </button>                          <button
                          type="button"
                          onClick={() => setShowVerification(false)}
                          className="btn btn-link btn-xs w-full opacity-50 text-neutral"
                        >
                          Cambiar correo
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-4 py-2">
                    <MdCheckCircle className="text-5xl text-secondary" />
                    <div>
                      <h4 className="font-bold text-alt tracking-tight">Descuento aplicado</h4>
                      <p className="text-xs opacity-70 text-neutral">Validado vía: {studentEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-base-200 space-y-2 text-neutral">
              {(alreadyPaid && activeRole === currentRole && (!isPonente || (userPayment && userPayment.can_buy_more === 0))) && (
                <div className="mb-4 opacity-80">
                  <span className="text-[10px] font-bold tracking-widest text-primary">Sin pagos pendientes</span>
                </div>
              )}
              {isPonente ? (
                <>
                  {((activeRole !== currentRole) || (paidSlots === 0)) && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-60">Inscripción base (1-2 ponencias)</span>
                      <span>${basePrice.toFixed(2)} MXN</span>
                    </div>
                  )}
                  {((activeRole === currentRole && userPayment?.can_buy_more > 0) || (activeRole !== currentRole)) && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="opacity-60">Ponencias adicionales</span>
                        <select
                          className="select select-bordered select-xs w-16 h-8 rounded-lg bg-white font-bold text-primary border-primary/30 focus:border-primary focus:outline-none p-1"
                          value={slotsToPay}
                          onChange={(e) => setSlotsToPay(Number(e.target.value))}
                        >
                          {[0, 1, 2, 3].map((num) => {
                            const maxCanBuy = activeRole === currentRole ? userPayment?.can_buy_more : 3;
                            const minReq = activeRole === currentRole ? (resumen?.user_payment?.pending_min || 0) : 0;
                            const isAvailable = num <= maxCanBuy && num >= minReq;
                            return (
                              <option key={num} value={num} disabled={!isAvailable} className="text-neutral">
                                {num}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <span className="font-medium text-neutral">${(slotsToPay * basePrice).toFixed(2)} MXN</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Precio base ({roleLabel(activeRole)})</span>
                  <span>${basePrice.toFixed(2)} MXN</span>
                </div>
              )}

              {activeRole === "asistente" && isVerified && (
                <div className="flex justify-between text-sm text-alt font-bold">
                  <span>Descuento Estudiante (50%)</span>
                  <span>-${(basePrice * 0.5).toFixed(2)} MXN</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-bold">Total Final</span>
                <span className="text-3xl font-black text-primary">${finalPrice.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-base-200 p-6 rounded-2xl sticky top-24 shadow-sm text-neutral">
            <h3 className="font-bold text-xl mb-6">Resumen de pago</h3>

            <div className="flex justify-between text-xs mb-4 opacity-70 italic">
              <span>Categoría:</span>
              <span className="text-right">{roleLabel(activeRole)}</span>
            </div>
            {pagoError && (
              <div className="bg-error/10 border border-error/20 text-error text-xs px-3 py-2 rounded-lg mb-4">
                {pagoError}
              </div>
            )}
            <PagosForm
              total={finalPrice}
              onSuccess={handleRegistrarPago}
              loading={registrandoPago}
            />
            <p className="text-[10px] mt-6 opacity-40 text-center italic">
              Al realizar el pago, confirmas que tu información de registro es correcta.
            </p>
          </div>
        </div>
      </div>

      {pagoExitoso && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full text-neutral">
            {!confirmandoSalida && (
              <button
                onClick={() => setConfirmandoSalida(true)}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                aria-label="Cerrar"
              >
                <MdClose className="text-xl" />
              </button>
            )}

            {confirmandoSalida ? (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-error">¿Seguro que deseas salir?</h2>
                <p className="text-sm opacity-70">Si sales ahora, ya no será posible facturar este pago más adelante.</p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setConfirmandoSalida(false);
                      setPagoExitoso(false);
                    }}
                    className="btn bg-error hover:bg-error/80 border-none text-white flex-1"
                  >
                    Sí, salir
                  </button>
                  <button
                    onClick={() => setConfirmandoSalida(false)}
                    className="btn btn-ghost flex-1 text-neutral"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : !quiereFactura ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h2 className="text-2xl font-bold">¡Pago Exitoso!</h2>
                <p className="text-sm opacity-70">¿Deseas generar tu factura ahora mismo?</p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setQuiereFactura(true)}
                    className="btn bg-alt hover:bg-alt/80 border-none text-white flex-1"
                  >
                    Sí, facturar
                  </button>
                  <button
                    onClick={() => setConfirmandoSalida(true)}
                    className="btn btn-ghost flex-1 text-neutral"
                  >
                    Omitir
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[70vh] px-2">
                <h3 className="text-xl font-bold text-center">Datos Fiscales</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="form-control col-span-1">
                    <label className="color primary text-[12px] font-bold  opacity-90">RFC</label>
                    <input
                      type="text"
                      placeholder="XAXX010101000"
                      maxLength={13}
                      className={`input input-sm input-bordered uppercase bg-base-100 ${datosFacturacion.rfc && !/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2}[A-Z\d])$/.test(datosFacturacion.rfc)
                        ? "border-error"
                        : ""
                        }`}
                      value={datosFacturacion.rfc}
                      onChange={(e) => setDatosFacturacion({ ...datosFacturacion, rfc: e.target.value.toUpperCase().trim() })}
                    />
                    {datosFacturacion.rfc && !/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2}[A-Z\d])$/.test(datosFacturacion.rfc) && (
                      <p className="text-error text-[10px] mt-1 font-medium italic">Formato de RFC inválido.</p>
                    )}
                  </div>

                  <div className="form-control col-span-1">
                    <label className="color primary text-[12px] font-bold  opacity-90">CÓDIGO POSTAL</label>
                    <input
                      type="text"
                      placeholder="00000"
                      maxLength={5}
                      className={`input input-sm input-bordered bg-base-100 ${datosFacturacion.cp && !/^\d{5}$/.test(datosFacturacion.cp) ? "border-error" : ""
                        }`}
                      value={datosFacturacion.cp}
                      onChange={(e) => setDatosFacturacion({ ...datosFacturacion, cp: e.target.value.replace(/\D/g, "") })}
                    />
                    {datosFacturacion.cp && !/^\d{5}$/.test(datosFacturacion.cp) && (
                      <p className="text-error text-[10px] mt-1 font-medium italic">Deben ser 5 dígitos.</p>
                    )}
                  </div>

                  <div className="form-control col-span-full">
                    <label className="color primary text-[12px] font-bold  opacity-90">NOMBRE O RAZÓN SOCIAL (Sin régimen capital)</label>
                    <input
                      type="text"
                      placeholder="Tal cual aparece en Constancia"
                      className="input input-sm input-bordered uppercase bg-base-100"
                      value={datosFacturacion.razonSocial}
                      onChange={(e) => setDatosFacturacion({ ...datosFacturacion, razonSocial: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-control col-span-full">
                    <label className="color primary text-[12px] font-bold  opacity-90">RÉGIMEN FISCAL</label>
                    <select
                      className="select select-sm select-bordered bg-base-100"
                      value={datosFacturacion.regimenFiscal}
                      onChange={(e) => setDatosFacturacion({ ...datosFacturacion, regimenFiscal: e.target.value })}
                    >
                      {REGIMENES.map((r) => <option key={r.code} value={r.code}>{r.code} - {r.label}</option>)}
                    </select>
                  </div>

                  <div className="form-control col-span-full">
                    <label className="color primary text-[12px] font-bold  opacity-90">USO DE CFDI</label>
                    <select
                      className="select select-sm select-bordered bg-base-100"
                      value={datosFacturacion.usoCFDI}
                      onChange={(e) => setDatosFacturacion({ ...datosFacturacion, usoCFDI: e.target.value })}
                    >
                      {USOS.map((u) => <option key={u.code} value={u.code}>{u.code} - {u.label}</option>)}
                    </select>
                  </div>

                  <div className="form-control col-span-full">
                    <label className="color primary text-[12px] font-bold  opacity-90">CONSTANCIA DE SITUACIÓN FISCAL (PDF)</label>
                    {constanciaFiscalFile ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between bg-base-200 p-3 rounded-xl border border-base-300">
                          <span className="text-sm font-semibold text-primary truncate max-w-[200px] sm:max-w-[300px]">
                            {constanciaFiscalFile.name}
                          </span>
                          <div className="flex gap-2">
                            {previewUrl && (
                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-primary btn-outline"
                                title="Ver archivo"
                              >
                                <MdVisibility className="text-base" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setConstanciaFiscalFile(null)}
                              className="btn btn-xs btn-error btn-outline"
                              title="Eliminar archivo"
                            >
                              <MdDeleteOutline className="text-base" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf"
                        className="file-input file-input-sm file-input-bordered w-full bg-base-100"
                        onChange={(e) => setConstanciaFiscalFile(e.target.files[0])}
                      />
                    )}
                  </div>
                </div>

                <div className="form-control col-span-full border-t border-base-200 mt-4 pt-4">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox-secondary checkbox"
                      checked={usarCorreoAlternativo}
                      onChange={(e) => setUsarCorreoAlternativo(e.target.checked)}
                    />
                    <span className="text-base-content text-[12px] font-bold opacity-90">
                      ¿ENVIAR A OTRO CORREO DISTINTO AL DEL REGISTRO?
                    </span>
                  </label>

                  {usarCorreoAlternativo && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className={`input input-sm input-bordered w-full bg-base-100 ${correoFacturacion && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoFacturacion)
                          ? "border-error"
                          : ""
                          }`}
                        value={correoFacturacion}
                        onChange={(e) => setCorreoFacturacion(e.target.value.trim())}
                      />
                      {correoFacturacion && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoFacturacion) && (
                        <p className="text-error text-[10px] mt-1 font-medium italic">
                          Por favor ingresa un correo electrónico válido.
                        </p>
                      )}
                      <p className="text-[10px] mt-1 opacity-100 italic">
                        Escribe el correo donde deseas recibir el PDF y XML.
                      </p>
                    </div>
                  )}
                </div>

                {errorFactura && (
                  <p className="text-error text-xs font-bold mt-2 text-center">{errorFactura}</p>
                )}
                <button
                  disabled={!isFormValid || enviandoFactura}
                  onClick={handleEnviarSolicitudFactura}
                  className={`btn w-full mt-4 text-white ${isFormValid && !enviandoFactura ? "bg-alt hover:bg-alt/80 border-none" : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  {enviandoFactura ? "Enviando..." : "Enviar Solicitud Factura"}
                </button>
                <button
                  onClick={() => setQuiereFactura(false)}
                  className="btn btn-link btn-sm w-full opacity-50 text-neutral"
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {solicitudEnviada && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-base-300">
            <div className="w-16 h-16 bg-secondary/20 text-alt rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              <MdCheckCircle />
            </div>

            <h3 className="text-xl font-bold mb-2 text-primary">¡Solicitud Recibida!</h3>

            <p className="text-sm text-neutral opacity-70 mb-6">
              Tus datos han sido enviados al área administrativa.
              Puedes dar seguimiento al estatus de tu CFDI desde tu panel.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSolicitudEnviada(false);
                  setPagoExitoso(false);
                  navigate("/asistente/facturas");
                }}
                className="btn btn-primary btn-outline font-bold px-8 border-base-300"
              >
                Ir a mis facturas
              </button>

              <button
                onClick={() => {
                  setSolicitudEnviada(false);
                  setPagoExitoso(false);
                  setUsarCorreoAlternativo(false);
                }}
                className="btn btn-primary btn-outline font-bold px-8 border-base-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
