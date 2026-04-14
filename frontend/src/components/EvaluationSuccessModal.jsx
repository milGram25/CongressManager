import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';

export default function EvaluationSuccessModal({ isOpen, onClose, decision, type = "dictamen" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col items-center p-8 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <HiCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">
          ¡{type === "dictamen" ? "Dictamen Enviado" : "Revisión Enviada"}!
        </h3>
        
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
          El resultado ha sido registrado correctamente como: <br />
          <strong className="text-[#005a6a] font-black uppercase tracking-widest">{decision}</strong>
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#001219] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-blue-900/20 active:scale-95 group"
        >
          Continuar
          <HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
