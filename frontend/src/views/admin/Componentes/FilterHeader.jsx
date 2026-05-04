import { useState, useMemo } from 'react';
import Select from 'react-select';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '10px',
    borderColor: state.isFocused ? '#005a6a' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0,90,106,0.15)' : 'none',
    padding: '1px',
    '&:hover': { borderColor: '#005a6a' },
    transition: 'all 0.2s',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#005a6a' : state.isFocused ? '#f0f9fa' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontSize: '13px',
  }),
  placeholder: (base) => ({ ...base, fontSize: '13px', color: '#9ca3af' }),
  singleValue: (base) => ({ ...base, fontSize: '13px', color: '#374151' }),
};

export default function FilterHeader({ onFilterChange = () => {}, congresos = [] }) {
  const [selectedInstitucion, setSelectedInstitucion] = useState(null);

  const institucionOptions = useMemo(() => {
    const seen = new Map();
    for (const c of congresos) {
      const id = c.id_institucion_id || c.id_institucion;
      const nombre = c.nombre_institucion;
      if (id && nombre && !seen.has(id)) {
        seen.set(id, { value: id, label: nombre });
      }
    }
    return Array.from(seen.values());
  }, [congresos]);

  const congresoOptions = useMemo(() => {
    const list = selectedInstitucion
      ? congresos.filter(c => (c.id_institucion_id || c.id_institucion) === selectedInstitucion)
      : congresos;
    return list.map(c => ({ value: c.id_congreso, label: c.nombre_congreso }));
  }, [congresos, selectedInstitucion]);

  const handleInstitucionChange = (opt) => {
    const val = opt ? opt.value : null;
    setSelectedInstitucion(val);
    onFilterChange('idCongreso', null);
    onFilterChange('institucion', null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <label className="text-[10px] font-bold text-gray-400 ml-1 mb-1.5 block uppercase tracking-widest">Institución</label>
        <Select
          options={institucionOptions}
          styles={selectStyles}
          placeholder="Todas las instituciones..."
          isClearable
          onChange={handleInstitucionChange}
          noOptionsMessage={() => 'Sin opciones'}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 ml-1 mb-1.5 block uppercase tracking-widest">
          Congreso {selectedInstitucion ? `(${congresoOptions.length})` : ''}
        </label>
        <Select
          key={selectedInstitucion}
          options={congresoOptions}
          styles={selectStyles}
          placeholder={selectedInstitucion ? 'Selecciona un congreso...' : 'Primero selecciona institución...'}
          isClearable
          onChange={(opt) => onFilterChange('idCongreso', opt ? opt.value : null)}
          noOptionsMessage={() => 'Sin congresos para esta institución'}
        />
      </div>
    </div>
  );
}
