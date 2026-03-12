import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import cienuLogo from '../../assets/CIENU.jpg';
import ridmaeLogo from '../../assets/ridmae.jpg';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const options = useMemo(() => countryList().getData(), []);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    genero: '',
    pais: '',
    institucion: '',
    discapacidad: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (value) => {
    setFormData({ ...formData, pais: value.label });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // Validación de correo electrónico
    // 1. Debe contener un @
    // 2. Debe empezar con minúscula
    const emailRegex = /^[a-z].*@.*$/;
    if (!emailRegex.test(formData.email)) {
      setError('El correo debe empezar con minúscula y contener un "@".');
      return;
    }

    // Validación de teléfono (exactamente 10 dígitos)
    const phoneDigits = formData.telefono.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos.');
      return;
    }

    setLoading(true);

    // Simular un pequeño delay de red
    setTimeout(() => {
      const result = register(formData);
      
      if (result.success) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden my-8">
          
          {/* Header */}
          <div className="p-8 pb-4">
            <h1 className="text-3xl font-bold text-gray-800">Registro de Usuario</h1>
            <p className="text-gray-500 mt-2 text-sm italic">* Campos obligatorios</p>
          </div>

          <form className="p-8 pt-4" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombre(s) *</label>
                <input 
                  name="nombres"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Apellido(s) *</label>
                <input 
                  name="apellidos"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Género *</label>
                <select 
                  name="genero"
                  required
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
              </div>

              <div className="hidden md:block"></div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">País</label>
                <Select 
                  options={options} 
                  value={options.find(opt => opt.label === formData.pais)}
                  onChange={handleCountryChange}
                  placeholder="Busca tu país..."
                  noOptionsMessage={() => "No se encontraron resultados"}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: '2px 8px',
                      borderRadius: '0.75rem', // xl
                      backgroundColor: '#f9fafb', // gray-50
                      border: 'none',
                      boxShadow: 'none',
                      '&:hover': { border: 'none' }
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9ca3af', // gray-400
                    }),
                  }}
                  className="w-full transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Institución de Adscripción</label>
                <input 
                  name="institucion"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">¿Tiene alguna discapacidad? *</label>
                <select 
                  name="tieneDiscapacidad"
                  required
                  value={formData.tieneDiscapacidad || ''}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      tieneDiscapacidad: e.target.value,
                      discapacidad: e.target.value === 'No' ? 'Ninguna' : '' 
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>

              {formData.tieneDiscapacidad === 'Si' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Escriba su discapacidad *</label>
                  <input 
                    name="discapacidad"
                    required
                    value={formData.discapacidad}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                    type="text" 
                    placeholder="Ej. Visual, Motriz..."
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Correo electrónico *</label>
                <input 
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="email" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Teléfono celular *</label>
                <input 
                  name="telefono"
                  required
                  placeholder="10 dígitos"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="tel" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Contraseña *</label>
                <input 
                  name="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="password" 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Confirmar contraseña *</label>
                <input 
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="password" 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-10 space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#148f96] hover:bg-[#117a81] disabled:opacity-60 text-white rounded-full font-bold tracking-wide transition-all shadow-md shadow-teal-100 active:scale-95"
              >
                {loading ? 'REGISTRANDO...' : 'CONFIRMAR REGISTRO'}
              </button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-[#148f96] font-bold hover:underline">
                  ¿Ya tienes cuenta? Iniciar sesión
                </Link>
              </div>
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
};

export default Register;
