import { useState, useMemo, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext";
import PagosForm from "./components/PagosForm";
import {
  MdSchool,
  MdEmail,
  MdVpnKey,
  MdCheckCircle,
  MdInfoOutline,
  MdAccountBalance,
} from "react-icons/md";

const stripePromise = loadStripe("pk_test_tu_llave_aqui");

export default function PagosView() {
  const { user } = useAuth();

  // Pilot: Selección de tipo de inscripción (Esto vendrá del backend en el futuro)
  const [tipoInscripcion, setTipoInscripcion] = useState("asistente");
  const [esCuotaReducida, setEsCuotaReducida] = useState(true);

  // Estados para el flujo de estudiante
  const [isStudent, setIsStudent] = useState(null); // null, true, false
  const [studentEmail, setStudentEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  // Estados de facturación
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [quiereFactura, setQuiereFactura] = useState(false);
  const [showXML, setShowXML] = useState(false);
  const [datosFacturacion, setDatosFacturacion] = useState({
    rfc: "",
    razonSocial: "",
    usoCFDI: "G03",
  });

  // Estructura de precios CIENU 2026
  const PRECIOS = {
    ponente_no_asociado: {
      reducida: 2500,
      regular: 2800,
      label: "Ponente no asociado",
    },
    ponente_ridmae: {
      reducida: 2000,
      regular: 2300,
      label: "Ponente asociado a RIDMAE",
    },
    coautor_no_asociado: {
      reducida: 1500,
      regular: 1800,
      label: "Co-autor no asociado",
    },
    coautor_ridmae: {
      reducida: 1000,
      regular: 1300,
      label: "Co-autor asociado a RIDMAE",
    },
    asistente: {
      reducida: 1000,
      regular: 1300,
      label: "Estudiantes / Asistentes",
    },
  };

  // Cálculo de precio base según piloto
  const basePrice = useMemo(() => {
    const seleccion = PRECIOS[tipoInscripcion] || PRECIOS.asistente;
    return esCuotaReducida ? seleccion.reducida : seleccion.regular;
  }, [tipoInscripcion, esCuotaReducida]);

  // Cálculo de precio final con descuento extra de estudiante si aplica (solo si es tarifa de estudiante)
  const finalPrice = useMemo(() => {
    if (isVerified && tipoInscripcion === "asistente") {
      return basePrice * 0.5;
    }
    return basePrice;
  }, [basePrice, isVerified, tipoInscripcion]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    const eduRegex = /(\.edu(\.[a-z]{2,3})?|alumnos\.udg\.mx)$/i;
    if (!eduRegex.test(studentEmail)) {
      setError(
        "El correo debe ser institucional válido (.edu, .edu.mx, alumnos.udg.mx, etc).",
      );
      return;
    }
    setShowVerification(true);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (verificationCode === "123456") {
      setIsVerified(true);
      setShowVerification(false);
    } else {
      setError("Código de verificación incorrecto.");
    }
  };

  const handleSimularPago = () => setPagoExitoso(true);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-neutral">
        CIENU 2026 (titulo congreso)
      </h2>

      {/* Alerta de Piloto con color ALT */}
      <div className="bg-alt border border-alt/20 text-white p-6 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
        <MdInfoOutline className="text-2xl shrink-0 mt-1" />
        <div>
          <h3 className="font-bold">Modo Piloto</h3>
          <p className="text-sm opacity-90">
            En la versión final, el tipo de participación y validación RIDMAE se
            cargarán automáticamente desde el backend.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Selector de Piloto */}
          <div className="bg-base-200 p-6 rounded-2xl border border-base-300 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-neutral">
              <MdAccountBalance className="text-secondary" /> Simulación
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-xs font-bold opacity-60">
                  TIPO DE PARTICIPANTE
                </label>
                <select
                  className="select select-bordered select-sm w-full bg-base-100"
                  value={tipoInscripcion}
                  onChange={(e) => {
                    setTipoInscripcion(e.target.value);
                    if (e.target.value !== "asistente") {
                      setIsVerified(false);
                      setIsStudent(null);
                    }
                  }}
                >
                  {Object.entries(PRECIOS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label text-xs font-bold opacity-60">
                  PERIODO DE INSCRIPCIÓN
                </label>
                <div className="flex gap-2 p-1 bg-base-100 rounded-lg border border-base-300">
                  <button
                    onClick={() => setEsCuotaReducida(true)}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${esCuotaReducida ? "bg-secondary text-white" : "hover:bg-base-200 text-neutral"}`}
                  >
                    CUOTA REDUCIDA
                  </button>
                  <button
                    onClick={() => setEsCuotaReducida(false)}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${!esCuotaReducida ? "bg-secondary text-white" : "hover:bg-base-200 text-neutral"}`}
                  >
                    CUOTA REGULAR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Información General */}
          <div className="bg-base-100 p-8 rounded-2xl border-2 border-base-300 shadow-sm">
            <h3 className="text-xl font-bold border-b border-base-200 pb-2 mb-4 text-neutral">
              Detalle de Inscripción
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="opacity-50 uppercase font-bold text-[10px] tracking-widest">
                  Nombre
                </p>
                <p className="font-medium text-neutral">
                  {user?.nombre || "Usuario Demo"}
                </p>
              </div>
              <div>
                <p className="opacity-50 uppercase font-bold text-[10px] tracking-widest">
                  Categoría Seleccionada
                </p>
                <p className="font-bold text-alt">
                  {PRECIOS[tipoInscripcion].label.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Sección de Descuento  estudiante */}
            {tipoInscripcion === "asistente" && isStudent !== false && (
              <div
                className={`p-6 rounded-2xl border-2 transition-all ${isVerified ? "border-secondary bg-alt/5" : "border-dashed border-base-300"}`}
              >
                {!isVerified ? (
                  <>
                    {isStudent === null && (
                      <div className="text-center space-y-4">
                        <MdSchool className="text-4xl mx-auto text-secondary opacity-80" />
                        <h4 className="font-bold text-neutral">
                          ¿Eres estudiante activo?
                        </h4>
                        <p className="text-sm opacity-70 text-neutral">
                          Obtén un 50% de descuento adicional validando tu
                          correo institucional.
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
                      <form
                        onSubmit={handleEmailSubmit}
                        className="space-y-4 text-neutral"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setIsStudent(null)}
                            className="btn btn-ghost btn-xs"
                          >
                            ← Volver
                          </button>
                          <span className="text-sm font-bold">
                            Validación Institucional
                          </span>
                        </div>
                        <div className="relative">
                          <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                          <input
                            type="email"
                            required
                            placeholder="Tu correo institucional (.edu, alumnos.udg.mx)"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-base-200 border-none outline-none focus:ring-2 focus:ring-secondary text-sm"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                          />
                        </div>
                        {error && (
                          <p className="text-error text-[10px] px-2">{error}</p>
                        )}
                        <button
                          type="submit"
                          className="btn bg-secondary hover:bg-secondary/80 border-none w-full text-white rounded-xl"
                        >
                          Enviar código de verificación
                        </button>
                      </form>
                    )}

                    {showVerification && (
                      <form
                        onSubmit={handleVerifyCode}
                        className="space-y-4 text-neutral"
                      >
                        <div className="text-center">
                          <p className="text-sm font-bold mb-1">
                            Verifica tu correo
                          </p>
                          <p className="text-[10px] opacity-60">
                            Enviamos un código a {studentEmail}
                          </p>
                        </div>
                        <div className="relative">
                          <MdVpnKey className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                          <input
                            type="text"
                            required
                            placeholder="Introduce el código (123456)"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-base-200 border-none outline-none focus:ring-2 focus:ring-secondary text-sm font-bold"
                            value={verificationCode}
                            onChange={(e) =>
                              setVerificationCode(e.target.value)
                            }
                          />
                        </div>
                        {error && (
                          <p className="text-error text-[10px] px-2">{error}</p>
                        )}
                        <button
                          type="submit"
                          className="btn bg-secondary hover:bg-secondary/80 border-none w-full text-white rounded-xl"
                        >
                          Verificar código
                        </button>
                        <button
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
                      <h4 className="font-bold text-alt uppercase tracking-tight">
                        Descuento Aplicado
                      </h4>
                      <p className="text-xs opacity-70 text-neutral">
                        Validado vía: {studentEmail}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de costos */}
            <div className="mt-8 pt-6 border-t border-base-200 space-y-2 text-neutral">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">
                  Cuota {esCuotaReducida ? "Reducida" : "Regular"} (
                  {PRECIOS[tipoInscripcion].label})
                </span>
                <span>${basePrice.toFixed(2)} MXN</span>
              </div>
              {isVerified && tipoInscripcion === "asistente" && (
                <div className="flex justify-between text-sm text-alt font-bold">
                  <span>Descuento Estudiante (50%)</span>
                  <span>-${(basePrice * 0.5).toFixed(2)} MXN</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-bold">Total Final</span>
                <span className="text-3xl font-black text-primary">
                  ${finalPrice.toFixed(2)} MXN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-base-200 p-6 rounded-2xl sticky top-24 shadow-sm text-neutral">
            <h3 className="font-bold text-xl mb-6">Resumen de Pago</h3>
            <div className="flex justify-between text-xs mb-4 opacity-70 italic">
              <span>Categoría:</span>
              <span className="text-right">
                {PRECIOS[tipoInscripcion].label}
              </span>
            </div>
            <Elements stripe={stripePromise}>
              <PagosForm
                total={finalPrice}
                onSuccess={() => setPagoExitoso(true)}
              />
              <button
                onClick={handleSimularPago}
                className="btn btn-ghost btn-xs w-full mt-2 opacity-30 text-neutral"
              >
                Simular Éxito
              </button>
            </Elements>
            <p className="text-[10px] mt-6 opacity-40 text-center italic">
              Al realizar el pago, confirmas que tu información de registro es
              correcta.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: ÉXITO Y PREGUNTA DE FACTURACIÓN */}
      {pagoExitoso && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full text-neutral">
            {!quiereFactura ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h2 className="text-2xl font-bold">¡Pago Exitoso!</h2>
                <p className="text-sm opacity-70">
                  ¿Deseas generar tu factura XML ahora mismo?
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setQuiereFactura(true)}
                    className="btn bg-alt hover:bg-alt/80 border-none text-white flex-1"
                  >
                    Sí, facturar
                  </button>
                  <button
                    onClick={() => setPagoExitoso(false)}
                    className="btn btn-ghost flex-1 text-neutral"
                  >
                    Omitir
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center">
                  Datos Fiscales
                </h3>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">RFC</label>
                  <input
                    type="text"
                    placeholder="XAXX010101000"
                    className="input input-bordered w-full bg-base-100"
                    onChange={(e) =>
                      setDatosFacturacion({
                        ...datosFacturacion,
                        rfc: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">
                    RAZÓN SOCIAL
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre o Empresa"
                    className="input input-bordered w-full bg-base-100"
                    onChange={(e) =>
                      setDatosFacturacion({
                        ...datosFacturacion,
                        razonSocial: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  disabled={
                    !datosFacturacion.rfc || !datosFacturacion.razonSocial
                  }
                  onClick={() => {
                    setShowXML(true);
                    setPagoExitoso(false);
                  }}
                  className="btn bg-alt hover:bg-alt/80 border-none w-full text-white mt-4"
                >
                  Generar XML
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

      {showXML && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowXML(false)}
          ></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-neutral">
            <h3 className="text-xl font-bold mb-4">
              Comprobante Fiscal Digital (XML)
            </h3>
            <div className="bg-neutral text-white p-4 rounded-lg font-mono text-[10px] overflow-x-auto h-64 border border-alt">
              <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante version="4.0" Fecha="${new Date().toISOString()}" 
    SubTotal="${(finalPrice / 1.16).toFixed(2)}" Total="${finalPrice.toFixed(2)}" Moneda="MXN" 
    TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE">
  <cfdi:Emisor Rfc="CONG20260101ABC" Nombre="CONGRESO INTERNACIONAL 2026" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${datosFacturacion.rfc.toUpperCase()}" 
      Nombre="${datosFacturacion.razonSocial.toUpperCase()}" 
      UsoCFDI="${datosFacturacion.usoCFDI}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="81111508" Cantidad="1" Descripcion="Registro Eventos Congreso" 
        ValorUnitario="${(finalPrice / 1.16).toFixed(2)}" Importe="${(finalPrice / 1.16).toFixed(2)}"/>
  </cfdi:Conceptos>
</cfdi:Comprobante>`}</pre>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                className="btn bg-alt hover:bg-alt/80 border-none text-white flex-1"
                onClick={() => window.print()}
              >
                Imprimir / Guardar
              </button>
              <button
                className="btn btn-ghost border-base-300 text-neutral"
                onClick={() => setShowXML(false)}
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
