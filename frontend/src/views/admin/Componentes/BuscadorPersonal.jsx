import React, { useState, useEffect, useRef } from 'react';
import { MdSearch, MdKeyboardArrowDown, MdPerson } from 'react-icons/md';

const BuscadorPersonal = ({ options, value, onChange, placeholder, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalizamos las opciones para que siempre tengan 'id' y 'nombre'
  const normalizedOptions = options.map(opt => ({
    id: opt.id || opt.id_dictaminador || opt.id_evaluador,
    nombre: opt.nombre || opt.nombre_completo
  }));

  const selectedOption = normalizedOptions.find(opt => String(opt.id) === String(value));

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`flex h-11 items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 text-sm cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-black'
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse`} />
        <MdPerson className="text-slate-400" size={18} />
        <span className={`flex-1 truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
          {selectedOption ? selectedOption.nombre : placeholder}
        </span>
        <MdKeyboardArrowDown className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-black outline-none transition-colors"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${String(opt.id) === String(value)
                      ? 'bg-black text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${String(opt.id) === String(value) ? 'bg-white' : 'bg-slate-300'}`} />
                    <span className="truncate">{opt.nombre}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-slate-400 italic">No se encontraron resultados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorPersonal;
