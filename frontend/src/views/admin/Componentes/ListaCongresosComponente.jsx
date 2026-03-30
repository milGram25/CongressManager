import { useState } from "react";

export default function PagosComponente({titulo,listaCongresos}) {

const listaEjemplo = [
    {id:"1", congreso:"CIENU"},
    {id:"2", congreso:"RIDMAE"}
];

return(
    <div className="flex items-center h-10 w-80 gap-4 p-4 rounded-full bg-base-100 border">
        <div>
            {titulo}
        </div>
        <select listaEjemplo="bg-white-000 border w-50">
            {listaCongresos.map((item)=>(
                <option key={item.id} value={item.congreso}>{item.congreso}</option>
            ))}
        </select>
       
    </div>
);

}