import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import cienuLogo from '../../assets/CIENU.jpg';
import ridmaeLogo from '../../assets/ridmae.jpg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pequeño delay para simular la llamada al servidor
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        // Obtenemos el usuario recién logueado para ver su rol
        const savedUser = JSON.parse(localStorage.getItem("congress_user"));
        if (savedUser?.rol === 'revisor') {
          navigate('/revisor', { replace: true });
        } else if (savedUser?.rol === 'dictaminador') {
          navigate('/dictaminador', { replace: true });
        } else if (savedUser?.rol === 'administrador') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/asistente', { replace: true });
        }
      } else {
        setError('Correo o contraseña incorrectos.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">

          {/* Header */}
          <div className="p-8 pb-4">
            <h1 className="text-3xl font-bold text-base-content">Iniciar sesión</h1>
          </div>

          <form className="p-8 pt-4 space-y-5" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/50 uppercase ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="usuario@udg.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-base-content/50 uppercase ml-1">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-content rounded-full font-bold tracking-wide transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                {loading ? 'ENTRANDO...' : 'INICIAR SESIÓN'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-base-300"></div>
                <span className="flex-shrink mx-4 text-base-content/50 text-xs uppercase">o</span>
                <div className="flex-grow border-t border-base-300"></div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full py-3.5 bg-base-100 border-2 border-primary text-primary hover:bg-primary/5 rounded-full font-bold tracking-wide transition-all active:scale-95"
              >
                CREAR CUENTA NUEVA
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer con Logos */}
      <footer className="flex justify-between items-end w-full px-4 md:px-10 pb-4">
        <img
          src={cienuLogo}
          alt="CIENU"
          className="h-16 md:h-20 object-contain border-2 border-black"
        />
        <img
          src={ridmaeLogo}
          alt="RIDMAE"
          className="h-12 md:h-16 object-contain"
        />
      </footer>
    </div>
  );
}
