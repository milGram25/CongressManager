import { useState, useMemo, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import PagosForm from './components/PagosForm';
import { MdSchool, MdEmail, MdVpnKey, MdCheckCircle } from 'react-icons/md';

const stripePromise = loadStripe('pk_test_tu_llave_aqui');

export default function PagosView() {
  const { user } = useAuth();
  
  // Estados para el flujo de estudiante
  const [isStudent, setIsStudent] = useState(null); // null, true, false
  const [studentEmail, setStudentEmail] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  // Estados de facturación
  const [pagoExitoso, setPagoExitoso] = useState(false); // Controla el modal de éxito
  const [quiereFactura, setQuiereFactura] = useState(false); // Cambia a formulario fiscal
  const [showXML, setShowXML] = useState(false); // Muestra el XML final
  const [datosFacturacion, setDatosFacturacion] = useState({
    rfc: '',
    razonSocial: '',
    usoCFDI: 'G03'
  });

  // Precios base por rol
  const BASE_PRICES = {
    ponente: 2000,
    asistente: 1200,
  };

  const role = user?.rol === 'ponente' ? 'ponente' : 'asistente';
  const basePrice = BASE_PRICES[role];

  // Cálculo de precio final
  const finalPrice = useMemo(() => {
    if (isVerified) {
      return basePrice * 0.5;
    }
    return basePrice;
  }, [basePrice, isVerified]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Regex para .edu, .edu.xx (mx, es, etc) o alumnos.udg.mx
    const eduRegex = /(\.edu(\.[a-z]{2,3})?|alumnos\.udg\.mx)$/i;
    if (!eduRegex.test(studentEmail)) {
      setError('El correo debe ser institucional válido (.edu, .edu.mx, alumnos.udg.mx, etc).');
      return;
    }
    setShowVerification(true);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    // Simulación de código (ej. 123456)
    if (verificationCode === '123456') {
      setIsVerified(true);
      setShowVerification(false);
    } else {
      setError('Código de verificación incorrecto. Intenta con 123456.');
    }
  };

  const handleSimularPago = () => setPagoExitoso(true);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8">Pago de Inscripción Única</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          
          {/* Tarjeta de Información General */}
          <div className="bg-base-100 p-8 rounded-2xl border-2 border-base-300 shadow-sm">
            <h3 className="text-xl font-bold border-b border-base-200 pb-2 mb-4">Información de Registro</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="opacity-50 uppercase font-bold text-[10px] tracking-widest">Nombre</p>
                <p className="font-medium">{user?.nombre || 'Usuario Demo'}</p>
              </div>
              <div>
                <p className="opacity-50 uppercase font-bold text-[10px] tracking-widest">Rol Registrado</p>
                <p className={`font-bold ${role === 'ponente' ? 'text-secondary' : ''}`}>
                  {role.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Sección de Descuento Estudiantil */}
            {isStudent !== false && (
              <div className={`p-6 rounded-2xl border-2 transition-all ${isVerified ? 'border-secondary bg-secondary/5' : 'border-dashed border-base-300'}`}>
                {!isVerified ? (
                  <>
                    {isStudent === null && (
                      <div className="text-center space-y-4">
                        <MdSchool className="text-4xl mx-auto text-secondary opacity-80" />
                        <h4 className="font-bold">¿Eres estudiante activo?</h4>
                        <p className="text-sm opacity-70">Obtén un 50% de descuento en tu cuota de inscripción.</p>
                        <div className="flex justify-center gap-4">
                          <button 
                            onClick={() => setIsStudent(true)}
                            className="btn btn-secondary btn-outline btn-sm rounded-full px-8"
                          >
                            Sí, soy estudiante
                          </button>
                          <button 
                            onClick={() => setIsStudent(false)}
                            className="btn btn-ghost btn-sm rounded-full opacity-60"
                          >
                            No, tarifa general
                          </button>
                        </div>
                      </div>
                    )}

                    {isStudent === true && !showVerification && (
                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setIsStudent(null)} className="btn btn-ghost btn-xs">← Volver</button>
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
                        <button type="submit" className="btn btn-secondary w-full text-white rounded-xl">
                          Enviar código de verificación
                        </button>
                      </form>
                    )}

                    {showVerification && (
                      <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-bold mb-1">Verifica tu correo</p>
                          <p className="text-[10px] opacity-60">Enviamos un código a {studentEmail}</p>
                        </div>
                        <div className="relative">
                          <MdVpnKey className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                          <input 
                            type="text" 
                            required
                            placeholder="Introduce el código"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-base-200 border-none outline-none focus:ring-2 focus:ring-secondary text-sm text-left tracking-[0.5em] font-bold"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </div>
                        {error && <p className="text-error text-[10px] px-2">{error}</p>}
                        <button type="submit" className="btn btn-secondary w-full text-white rounded-xl">
                          Verificar código
                        </button>
                        <button type="button" onClick={() => setShowVerification(false)} className="btn btn-link btn-xs w-full opacity-50">Cambiar correo</button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-4 py-2">
                    <MdCheckCircle className="text-5xl text-secondary" />
                    <div>
                      <h4 className="font-bold text-secondary uppercase tracking-tight">Descuento Aplicado</h4>
                      <p className="text-xs opacity-70">Validado vía: {studentEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de costos */}
            <div className="mt-8 pt-6 border-t border-base-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Precio Base ({role})</span>
                <span>${basePrice.toFixed(2)} MXN</span>
              </div>
              {isVerified && (
                <div className="flex justify-between text-sm text-secondary font-bold">
                  <span>Descuento Estudiante (50%)</span>
                  <span>-${(basePrice * 0.5).toFixed(2)} MXN</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black text-primary">${finalPrice.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-base-200 p-6 rounded-2xl sticky top-24 shadow-sm">
            <h3 className="font-bold text-xl mb-6">Resumen de Pago</h3>
            <Elements stripe={stripePromise}>
              <PagosForm total={finalPrice} onSuccess={() => setPagoExitoso(true)} />
              <button onClick={handleSimularPago} className="btn btn-ghost btn-xs w-full mt-2 opacity-30">Simular Éxito</button>
            </Elements>
            <p className="text-[10px] mt-6 opacity-40 text-center italic">
              Al realizar el pago, confirmas que tu información de registro es correcta.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: ÉXITO Y PREGUNTA DE FACTURACIÓN */}
      {pagoExitoso && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full">
            {!quiereFactura ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center text-3xl mx-auto">✓</div>
                <h2 className="text-2xl font-bold">¡Pago Exitoso!</h2>
                <p className="text-sm opacity-70">¿Deseas generar tu factura XML ahora mismo?</p>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setQuiereFactura(true)} className="btn btn-primary flex-1">Sí, facturar</button>
                  <button onClick={() => setPagoExitoso(false)} className="btn btn-ghost flex-1">Omitir</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center">Datos Fiscales</h3>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">RFC</label>
                  <input 
                    type="text" 
                    placeholder="XAXX010101000"
                    className="input input-bordered w-full"
                    onChange={(e) => setDatosFacturacion({...datosFacturacion, rfc: e.target.value})}
                  />
                </div>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">RAZÓN SOCIAL</label>
                  <input 
                    type="text" 
                    placeholder="Nombre o Empresa"
                    className="input input-bordered w-full"
                    onChange={(e) => setDatosFacturacion({...datosFacturacion, razonSocial: e.target.value})}
                  />
                </div>
                <button 
                  disabled={!datosFacturacion.rfc || !datosFacturacion.razonSocial}
                  onClick={() => { setShowXML(true); setPagoExitoso(false); }}
                  className="btn btn-primary w-full mt-4"
                >
                  Generar XML
                </button>
                <button onClick={() => setQuiereFactura(false)} className="btn btn-link btn-sm w-full opacity-50">Volver</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showXML && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowXML(false)}></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4 text-neutral">Comprobante Fiscal Digital (XML)</h3>
            <div className="bg-neutral text-white p-4 rounded-lg font-mono text-[10px] overflow-x-auto h-64 border border-primary">
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
              <button className="btn btn-primary flex-1" onClick={() => window.print()}>Imprimir / Guardar</button>
              <button className="btn btn-ghost border-base-300" onClick={() => setShowXML(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
