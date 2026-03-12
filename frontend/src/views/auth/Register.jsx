import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cienuLogo from '../../assets/CIENU.jpg';
import ridmaeLogo from '../../assets/ridmae.jpg';

const Register = () => {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de registro
    console.log('Datos de registro:', formData);
    // Por ahora simulamos éxito y mandamos al login
    alert('Registro exitoso (simulado)');
    navigate('/login');
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
                <input 
                  name="genero"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
              </div>

              <div className="hidden md:block"></div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">País</label>
                <input 
                  name="pais"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
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
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Discapacidad</label>
                <input 
                  name="discapacidad"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#148f96] outline-none transition-all" 
                  type="text" 
                  onChange={handleChange}
                />
              </div>

              <div className="hidden md:block"></div>

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
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Teléfono celular</label>
                <input 
                  name="telefono"
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
                className="w-full py-3.5 bg-[#148f96] hover:bg-[#117a81] text-white rounded-full font-bold tracking-wide transition-all shadow-md shadow-teal-100 active:scale-95"
              >
                CONFIRMAR REGISTRO
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
