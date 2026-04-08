import {useState} from "react";

export default function listaDesplegableGenerica({titulo, lista}){
    cont [elec,setElect] = useState("--Seleccione elemento--")
    return (
        <div className="flex w-100 h-30">
            <div>
                {titulo}

            </div>
            <div>
                <select value={elec}>
                    {lista.map((item)=>(
                        <option key={item.id} value={item.nombre}>{item.nombre}</option>

                    ))}

                </select>
                

            </div>



        </div>
        


    );
}