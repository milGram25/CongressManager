import { useState } from "react";
import { HiUser, HiEye } from 'react-icons/hi';


export default function AdjuntarComponente({persona, nombreElementoSubir}) {
 
    const [rolPonente,setRolPonente] = useState(null);
    const [rolAsistente,setRolAsistente] = useState(null);
    const [rolEvaluador,setRolEvaluador] = useState(null);
    const [rolDictaminador,setRolDictaminador] = useState(null);
    const [rolTallerista,setRolTallerista] = useState(null);
    const [idPersona,setIdPersona] = useState({id:1,
            es_ponente:true,
            recibir_constancia_ponente:true,
            es_asistente:true,
            recibir_constancia_asistente:false,
            es_tallerista:true,
            recibir_constancia_tallerista:false,
            es_evaluador:true,
            recibir_constancia_evaluador:false,
            es_dictaminador:true,
            recibir_constancia_dictaminador:true});

    const [esRol,setEsRol] = useState("asistente");
    const listaPersonas=[
        {
            id:1,
            es_ponente:true,
            ponente:true,
            es_asistente:true,
            asistente:false,
            es_tallerista:true,
            tallerista:false,
            es_evaluador:true,
            evaluador:false,
            es_dictaminador:true,
            dictaminador:false
        },
        {
            id:2,
            es_ponente:true,
            recibir_constancia_ponente:true,
            es_asistente:true,
            recibir_constancia_asistente:false,
            es_tallerista:true,
            recibir_constancia_tallerista:false,
            es_evaluador:true,
            recibir_constancia_evaluador:false,
            es_dictaminador:true,
            recibir_constancia_dictaminador:true
        },
        {
            id:3,
            es_ponente:true,
            ponente:true,
            es_asistente:true,
            asistente:false,
            es_tallerista:true,
            tallerista:true,
            es_evaluador:false,
            evaluador:false,
            es_dictaminador:true,
            dictaminador:false
        }
    ]
//v = verde (recibió constancia); r = rojo (no ha recibido y necesita); g = gris (no necesita constancia)
    /*const rolesUsuario = () =>{
        if(idPersona.es_ponente){
            if(idPersona.recibir_constancia_ponente){
                rolPonente = "v";
            }else{
                rolPonente = "r"
            }

        }else{
            rolPonente = "g";
        }
        if(idPersona.es_tallerista){
            if(idPersona.recibir_constancia_tallerista){
                rolTallerista = "v";
            }else{
                rolTallerista = "r"
            }

        }else{
            rolTallerista = "g";
        }
        if(idPersona.es_asistente){
            if(idPersona.recibir_constancia_ponente){
                rolPonente = "v";
            }else{
                rolPonente = "r"
            }

        }else{
            rolPonente = "g";
        }
        if(idPersona.es_ponente){
            if(idPersona.recibir_constancia_ponente){
                rolPonente = "v";
            }else{
                rolPonente = "r"
            }

        }else{
            rolPonente = "g";
        }
    }
*/
  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm flex flex-col min-h-[400px] w-180">
      
      {/* header - altura fija */}
      <div className="flex w-full p-4 bg-base-100 rounded-xl shadow-sm border mb-4 h-20 border-b">


        <div className="flex flex-1">
            <div className="flex w-15 items-center gap-3">
                <div className="rounded-full h-2 w-2 border border-b"></div>
                <div className="flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><HiUser/></div>
            </div>
            <div className="flex w-15 items-center gap-3 ml-4">
                <div className="rounded-full h-2 w-2 border border-b"></div>
                <div className="flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><HiUser/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4">
                <div className="rounded-full h-2 w-2 border border-b"></div>
                <div className="flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><HiUser/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4">
                <div className="rounded-full h-2 w-2 border border-b"></div>
                <div className="flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><HiUser/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4">
                <div className="rounded-full h-2 w-2 border border-b"></div>
                <div className="flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><HiUser/></div>
            </div>
           
            

        </div>
        <div className="flex w-50 items-center">
            <p className="w-10">Rol</p>
            <select className="flex-1 rounded-full border border-b h-10" value={esRol} onChange={(e)=>setEsRol(e.target.value)}>
                <option value="asistente">Asistente</option>
                <option value="ponente">Ponente</option>
                <option value="tallerista">Tallerista</option>
                <option value="dictaminador">Dictaminador</option>
                <option value="evaluador">Evaluador</option>
                
            </select>
        </div>
      </div>

      {/* contenido - ocupa lo que queda */}
      <div className="flex flex-col w-full p-4 bg-base-100 rounded-xl shadow-sm border flex-1 border-b">
        <div className="h-20">
            <h1 className="text-xl">Subir {nombreElementoSubir}</h1>{/*Subir constancia*/}
            <p className="ml-5 text-gray-400 text-sm mt-2">Suba la {nombreElementoSubir} individual para esta persona en este rol </p>{/*Suba la constancia individual para esta persona en este rol*/}
        </div>
        <div className="flex h-100 rounded-xl border border-dashed cursor-grabbing items-center text-center  mb-5">
            <p className="flex-1 text-gray-400">Suelte el archivo</p>

        </div>
        <div className="flex flex-col justify-center">
            <p className="flex-1">
                {nombreElementoSubir} actual
            </p>
            <div className="h-50 w-80 border border-b m-5 mx-auto">
                {/*Ruta de vista previa*/}

            </div>
        </div>
        <div className="flex justify-end w-full gap-3">
            <button className="flex w-10 h-10 items-center border border-b rounded-full bg-white hover:bg-gray-500">
               <HiEye className="flex-1"/>
            </button>
        
            <button className="flex w-10 h-10 items-center border border-b rounded-full bg-white hover:bg-gray-500">
               <HiUser className="flex-1"/>
            </button>
        </div>
        
        
        
        
        
      </div>

    </div>
  );
}

