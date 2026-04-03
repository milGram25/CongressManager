import {useState} from "react";

export default function ListaDesplegableElementosGenerica({titulo, lista}){
    const [elec,setElect] = useState("--Seleccione elemento--");
    return (
        <div className="flex w-120 h-25 gap-10 bg-black rounded-full text-white items-center justify-center text-xl ">
            <div>
                {titulo}

            </div>
            <div className="bg-white rounded-full text-black">
                <select className="w-70 h-17 pl-3" value={elec} onChange={(e)=>setElect(e.target.value)}>
                    <option value="--Seleccione elemento--">--Seleccione elemento--</option>
                    {lista.map((item)=>(
                        <option key={item.id} value={item.nombre}>{item.nombre}</option>

                    ))}

                </select>
                
            </div>

        </div>
        
    );
}