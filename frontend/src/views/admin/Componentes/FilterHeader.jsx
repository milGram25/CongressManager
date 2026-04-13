import Select from 'react-select';

export default function FilterHeader() {
  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '12px',
      borderColor: '#f3f4f6',
      padding: '2px',
      boxShadow: 'none',
      '&:hover': { border: '1px solid #005a6a' }
    })
  };

  const options = {
    institucion: [
      { value: 'udg', label: 'Universidad de Guadalajara' },
      { value: 'unam', label: 'UNAM' },
      { value: 'itesm', label: 'Tec de Monterrey' }
    ],
    congreso: [
      { value: 'ridmae', label: 'RIDMAE 2025' },
      { value: 'cienu', label: 'CIENU 2026' }
    ],
    rol: [
      { value: 'ponente', label: 'Ponente' },
      { value: 'asistente', label: 'Asistente' },
      { value: 'tallerista', label: 'Tallerista' },
      { value: 'dictaminador', label: 'Dictaminador' }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <div>
        <label className="text-xs font-semibold text-gray-400 ml-2 mb-1 block uppercase">Institución</label>
        <Select options={options.institucion} styles={customStyles} placeholder="Todas..." />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-400 ml-2 mb-1 block uppercase">Congreso</label>
        <Select options={options.congreso} styles={customStyles} placeholder="Seleccionar..." />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-400 ml-2 mb-1 block uppercase">Rol</label>
        <Select options={options.rol} styles={customStyles} placeholder="Todos..." />
      </div>
    </div>
  );
}
