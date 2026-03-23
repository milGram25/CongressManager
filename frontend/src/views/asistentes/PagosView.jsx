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
              <PagosForm total={finalPrice} />
            </Elements>
            <p className="text-[10px] mt-6 opacity-40 text-center italic">
              Al realizar el pago, confirmas que tu información de registro es correcta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
