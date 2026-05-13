export default function ListaDesplegableElementosGenerica({ titulo, lista, onSelect, value }) {
    return (
        <div className="flex items-center gap-4 bg-black rounded-full text-white text-lg px-4 py-2 w-full max-w-[420px]">
            <div className="flex-shrink-0 font-bold whitespace-nowrap">
                {titulo}
            </div>

            <div className="bg-white rounded-full text-black flex-1 min-w-0 overflow-hidden">
                <select
                    className="w-full h-10 pl-3 pr-8 outline-none cursor-pointer bg-transparent text-ellipsis whitespace-nowrap"
                    value={value || ""}
                    onChange={(e) => onSelect && onSelect(e.target.value)}
                >
                    <option value="">Todos</option>
                    {lista.map((item) => (
                        <option
                            key={item.id_congreso || item.id_institucion || item.id}
                            value={item.id_congreso || item.id_institucion || item.id}
                        >
                            {item.nombre_congreso || item.nombre || item.nombre_institucion}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}