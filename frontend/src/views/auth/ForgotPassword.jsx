import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiMail } from 'react-icons/hi';
import cienuLogo from '../../assets/CIENU.jpg';
import ridmaeLogo from '../../assets/ridmae.jpg';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simular envío de correo
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 pb-4 relative">
            <button 
              onClick={() => navigate('/login')}
              className="absolute left-4 top-8 p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/70"
            >
              <HiArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-base-content text-center">Recuperar acceso</h1>
          </div>

          {!submitted ? (
            <form className="p-8 pt-4 space-y-6" onSubmit={handleSubmit}>
              <div className="text-center">
                <p className="text-sm text-base-content/60">
                  Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                </p>
              </div>

              {/* Input Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50 uppercase ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="usuario@udg.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 pl-12 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all"
                  />
                  <HiMail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#001219] hover:bg-black disabled:opacity-60 text-white rounded-full font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'ENVIAR INSTRUCCIONES'
                )}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <HiMail size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">¡Correo enviado!</h2>
                <p className="text-sm text-gray-500">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-primary text-primary-content rounded-full font-bold transition-all active:scale-95"
              >
                VOLVER AL LOGIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer con Logos */}
      <footer className="flex justify-between items-end w-full px-4 md:px-10 pb-4">
        <img src={cienuLogo} alt="CIENU" className="h-16 md:h-20 object-contain border-2 border-black" />
        <img src={ridmaeLogo} alt="RIDMAE" className="h-12 md:h-16 object-contain" />
      </footer>
    </div>
  );
}
