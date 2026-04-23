import { useState } from "react";

export default function ListaDesplegableElementosGenerica({ titulo, lista }) {
    const [elec, setElect] = useState("--Seleccione elemento--");
    return (
        <div className="flex flex-1 h-15 gap-4 bg-black rounded-full text-white items-center justify-center text-lg px-4">
            <div className="flex items-center justify-center flex-1 font-bold">
                {titulo}

            </div>
            <div className="bg-white rounded-full text-black flex-2 flex">
                <select className="flex-1 h-10 pl-3" value={elec} onChange={(e) => setElect(e.target.value)}>
                    <option value="--Seleccione elemento--">--Seleccione elemento--</option>
                    {lista.map((item) => (
                        <option key={item.id} value={item.nombre}>{item.nombre}</option>

                    ))}

                </select>

            </div>

        </div>

    );
}