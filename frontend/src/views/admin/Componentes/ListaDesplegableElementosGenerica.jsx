import { useState } from "react";

export default function ListaDesplegableElementosGenerica({ titulo, lista, onSelect, value }) {
    return (
        <div className="flex flex-1 h-15 gap-4 bg-black rounded-full text-white items-center justify-center text-lg px-4">
            <div className="flex items-center justify-center flex-1 font-bold">
                {titulo}
            </div>
            <div className="bg-white rounded-full text-black flex-2 flex overflow-hidden">
                <select 
                    className="flex-1 h-10 pl-3 outline-none cursor-pointer" 
                    value={value || ""} 
                    onChange={(e) => onSelect && onSelect(e.target.value)}
                >
                    <option value="">Todos</option>
                    {lista.map((item) => (
                        <option key={item.id_congreso || item.id_institucion || item.id} value={item.id_congreso || item.id_institucion || item.id}>
                            {item.nombre_congreso || item.nombre || item.nombre_institucion}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}