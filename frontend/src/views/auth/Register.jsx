import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import cienuLogo from '../../assets/CIENU.jpg';
import ridmaeLogo from '../../assets/ridmae.jpg';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const options = useMemo(() => countryList().getData(), []);

  const countryCodes = [
  { value: '1', label: 'US/CA +1' },
  { value: '1', label: 'PR +1' },
  { value: '1', label: 'DO +1' },
  { value: '7', label: 'RU +7' },
  { value: '20', label: 'EG +20' },
  { value: '33', label: 'FR +33' },
  { value: '34', label: 'ES +34' },
  { value: '39', label: 'IT +39' },
  { value: '44', label: 'UK +44' },
  { value: '49', label: 'DE +49' },
  { value: '+51', label: 'PE +51' },
  { value: '+52', label: 'MX +52' },
  { value: '+53', label: 'CU +53' },
  { value: '+54', label: 'AR +54' },
  { value: '+55', label: 'BR +55' },
  { value: '+56', label: 'CL +56' },
  { value: '+57', label: 'CO +57' },
  { value: '+58', label: 'VE +58' },
  { value: '+81', label: 'JP +81' },
  { value: '+82', label: 'KR +82' },
  { value: '+86', label: 'CN +86' },
  { value: '+91', label: 'IN +91' },
  { value: '+502', label: 'GT +502' },
  { value: '+503', label: 'SV +503' },
  { value: '+504', label: 'HN +504' },
  { value: '+505', label: 'NI +505' },
  { value: '+506', label: 'CR +506' },
  { value: '+507', label: 'PA +507' },
  { value: '+591', label: 'BO +591' },
  { value: '+593', label: 'EC +593' },
  { value: '+595', label: 'PY +595' },
  { value: '+598', label: 'UY +598' },
];

// Ordenar alfabéticamente por label para mejor UX y poder añadir países ordenados
const sortedCodes = countryCodes.sort((a, b) => a.label.localeCompare(b.label));
  
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

  const triggerError = (message) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validación de campos obligatorios (manual para mostrar en el cuadro central)
    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es obligatorio.';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es obligatorio.';
    if (!formData.genero) newErrors.genero = 'El género es obligatorio.';
    if (!formData.pais) newErrors.pais = 'El país es obligatorio.';
    if (!formData.tieneDiscapacidad) newErrors.tieneDiscapacidad = 'Este campo es obligatorio.';
    if (formData.tieneDiscapacidad === 'Si' && !formData.discapacidad.trim()) {
      newErrors.discapacidad = 'Por favor especifique su discapacidad.';
    }

    // Validación de correo electrónico
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es obligatorio.';
    
    // 1. Debe contener un @
    // 2. Debe empezar con minúscula
    const emailRegex = /^[a-z].*@.*$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Correo inválido.';
    }

    // Validación de teléfono (exactamente 10 dígitos)
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono celular es obligatorio.';
    const phoneDigits = formData.telefono.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos.';
    }

    // Validación de contraseñas
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    const result = await register({
      ...formData,
      telefono: `${formData.countryCode}${formData.telefono}`
    });
    
    if (result.success) {
      // El AuthContext hace auto-login, navegamos según el rol
      const rol = result.user?.rol;
      if (rol === 'revisor') {
        navigate('/revisor', { replace: true });
      } else if (rol === 'dictaminador') {
        navigate('/dictaminador', { replace: true });
      } else if (rol === 'administrador' || rol === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/asistente', { replace: true });
      }
    } else {
      triggerError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden my-8">
          
          {/* Header */}
          <div className="p-8 pb-4">
            <h1 className="text-3xl font-bold text-base-content">Registro de usuario</h1>
            <p className="text-base-content/60 mt-2 text-sm italic">* Campos obligatorios</p>
          </div>

          <form className="p-8 pt-4" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Nombre(s) *</label>
                <input 
                  name="nombres"
                  value={formData.nombres}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
                {errors.nombres && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.nombres}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Apellido(s) *</label>
                <input 
                  name="apellidos"
                  value={formData.apellidos}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
                {errors.apellidos && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.apellidos}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Género *</label>
                <select 
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
                {errors.genero && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.genero}</p>
                )}
              </div>

              <div className="hidden md:block"></div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">País</label>
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
                      backgroundColor: 'var(--color-base-200)',
                      border: 'none',
                      boxShadow: 'none',
                      '&:hover': { border: 'none' }
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'var(--color-base-content)',
                      opacity: 0.5
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--color-base-content)'
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--color-base-100)',
                      borderRadius: '0.75rem'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'var(--color-base-200)' : 'transparent',
                      color: 'var(--color-base-content)',
                      '&:active': {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-content)'
                      }
                    })
                  }}
                  className="w-full transition-all"
                />
                {errors.pais && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.pais}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Institución de adscripción</label>
                <input 
                  name="institucion"
                  value={formData.institucion}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
                {errors.institucion && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.institucion}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">¿Tiene alguna discapacidad? *</label>
                <select 
                  name="tieneDiscapacidad"
                  value={formData.tieneDiscapacidad || ''}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      tieneDiscapacidad: e.target.value,
                      discapacidad: e.target.value === 'No' ? 'Ninguna' : '' 
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
                {errors.tieneDiscapacidad && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.tieneDiscapacidad}</p>
                )}
              </div>

              {formData.tieneDiscapacidad === 'Si' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/50  ml-1">Escriba su discapacidad *</label>
                  <input 
                    name="discapacidad"
                    value={formData.discapacidad}
                    className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all" 
                    type="text" 
                    placeholder="Ej. Visual, Motriz..."
                    onChange={handleChange}
                  />
                  {errors.discapacidad && (
                    <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.discapacidad}</p>
                  )}
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Correo electrónico *</label>
                <input 
                  name="email"
                  value={formData.email}
                  className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">
                  Teléfono celular *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 inset-y-0 flex items-center">
                    <select
                      name="countryCode"
                      className="h-full py-0 pl-4 pr-1 bg-transparent text-base-content/70 text-[11px] font-bold border-r border-base-content/10 outline-none rounded-l-xl cursor-pointer hover:bg-base-300/50 transition-colors"
                      value={formData.countryCode || '+52'}
                      onChange={handleChange}
                    >
                      {sortedCodes.map((code) => (
                        <option key={`${code.label}-${code.value}`} value={code.value} className="bg-base-100 text-base-content">
                          {code.label}
                        </option>
                      ))}
                    </select>
                  </div>
                    
                  <input 
                    name="telefono"
                    value={formData.telefono}
                    placeholder="10 dígitos"
                    /* Increased left padding (pl-24) to clear the dropdown */
                    className={`w-full pl-24 pr-4 py-3 rounded-xl bg-base-200 border ${
                      errors.telefono ? 'border-error' : 'border-transparent'
                    } focus:bg-base-100 focus:border-primary outline-none transition-all`} 
                    type="tel" 
                    onChange={handleChange}
                  />
                </div>
                {errors.telefono && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1 ">
                    {errors.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Contraseña *</label>
                <div className="relative">
                  <input 
                    name="password"
                    value={formData.password}
                    className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all pr-12" 
                    type={showPassword ? "text" : "password"} 
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                  >
                    {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1 ">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/50  ml-1">Confirmar contraseña *</label>
                <div className="relative">
                  <input 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    className="w-full px-4 py-3 rounded-xl bg-base-200 border border-transparent focus:bg-base-100 focus:border-primary outline-none transition-all pr-12" 
                    type={showConfirmPassword ? "text" : "password"} 
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-error text-[10px] font-bold mt-1 ml-1 ">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-10 space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-content rounded-full font-bold tracking-wide transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                {loading ? 'REGISTRANDO...' : 'CONFIRMAR REGISTRO'}
              </button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary font-bold hover:underline">
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
