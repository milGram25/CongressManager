import { useState } from "react";
import { HiUser, HiEye } from 'react-icons/hi';
import { GrWorkshop } from "react-icons/gr";
import { BsPersonHearts } from "react-icons/bs";
import { BsFillPersonFill } from "react-icons/bs";
import { MdPersonSearch } from "react-icons/md";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { useEffect } from "react";


export default function AdjuntarFactura({persona}) {
 
    const [rolPonente,setRolPonente] = useState({color:"bg-gray-500",title:"No necesita factura"});
    const [rolAsistente,setRolAsistente] = useState({color:"bg-gray-500",title:"No necesita factura"});
    const [rolEvaluador,setRolEvaluador] = useState({color:"bg-gray-500",title:"No necesita factura"});
    const [rolDictaminador,setRolDictaminador] = useState({color:"bg-gray-500",title:"No necesita factura"});
    const [rolTallerista,setRolTallerista] = useState({color:"bg-gray-500",title:"No necesita factura"});
    useEffect(()=>{
        coloresRolesUsuario();
    },[]);

    const [idPersona,setIdPersona] = useState({id:1,
            es_ponente:true,
            recibir_factura_ponente:true,
            es_asistente:false,
            recibir_factura_asistente:false,
            es_tallerista:true,
            recibir_factura_tallerista:false,
            es_evaluador:true,
            recibir_factura_evaluador:false,
            es_dictaminador:true,
            recibir_factura_dictaminador:true});

    const [esRol,setEsRol] = useState("asistente");

        //green = recibió factura; red = no ha recibido y necesita; gray = no necesita factura

    function coloresRolesUsuario(){
        if(idPersona.es_asistente){
            if(idPersona.recibir_factura_asistente){
                setRolAsistente({color:"bg-green-500",title:"Ya recibió factura"});
            }else{
                setRolAsistente({color:"bg-red-500",title:"Necesita factura"});
            }

        }else{
            setRolAsistente({color:"bg-gray-500",title:"No necesita factura"});
        }
          
        if(idPersona.es_ponente){
            if(idPersona.recibir_factura_ponente){
                setRolPonente({color:"bg-green-500",title:"Ya recibió factura"});
            }else{
                setRolPonente({color:"bg-red-500",title:"Necesita factura"});
            }

        }else{
            setRolPonente({color:"bg-gray-500",title:"No necesita factura"});
        }
        if(idPersona.es_tallerista){
            if(idPersona.recibir_factura_tallerista){
                setRolTallerista({color:"bg-green-500",title:"Ya recibió factura"});
            }else{
                setRolTallerista({color:"bg-red-500",title:"Necesita factura"});
            }

        }else{
            setRolTallerista({color:"bg-gray-500",title:"No necesita factura"});
        }
        if(idPersona.es_dictaminador){
            if(idPersona.recibir_factura_dictaminador){
                setRolDictaminador({color:"bg-green-500",title:"Ya recibió factura"});
            }else{
                setRolDictaminador({color:"bg-red-500",title:"Necesita factura"});
            }

        }else{
            setRolDictaminador({color:"bg-gray-500",title:"No necesita factura"});
        }
        if(idPersona.es_evaluador){
            if(idPersona.recibir_factura_ponente){
                setRolEvaluador({color:"bg-green-500",title:"Ya recibió factura"});
            }else{
                setRolEvaluador({color:"bg-red-500",title:"Necesita factura"});
            }

        }else{
            setRolEvaluador({color:"bg-gray-500",title:"No necesita factura"});
        }
    }

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm flex flex-col min-h-[400px] w-180">
        
      
      {/* header - altura fija */}
      <div className="flex w-full p-4 bg-base-100 rounded-xl shadow-sm border mb-4 h-20 border-b bg-black">


        <div className="flex flex-1">
            <div className="flex w-15 items-center gap-3" title="Asistente">
                <div className={`rounded-full h-2 w-2 border border-b ${rolAsistente.color}`} title={`${rolAsistente.title}`}></div>
                <div className="bg-white flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><BsFillPersonFill/></div>
            </div>
            <div className="flex w-15 items-center gap-3 ml-4" title="Tallerista">
                <div className={`rounded-full h-2 w-2 border border-b ${rolTallerista.color}`} title={`${rolTallerista.title}`}></div>
                <div className="bg-white flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><BsPersonHearts/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4" title="Ponente">
                <div className={`rounded-full h-2 w-2 border border-b ${rolPonente.color}`} title={`${rolPonente.title}`}></div>
                <div className="bg-white flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><GrWorkshop/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4" title="Dictaminador">
                <div className={`rounded-full h-2 w-2 border border-b ${rolDictaminador.color}`} title={`${rolDictaminador.title}`}></div>
                <div className="bg-white flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><BsFillPersonLinesFill/></div>
            </div>
            <div className="flex w-15 items-center gap-3  ml-4" title ="Evaluador">
                <div className={`rounded-full h-2 w-2 border border-b ${rolEvaluador.color}`} title={`${rolEvaluador.title}`}></div>
                <div className="bg-white flex flex-1 rounded-full h-10 w-10 border border-b items-center justify-center"><MdPersonSearch/></div>
            </div>
           
            

        </div>
        <div className="flex w-50 items-center">
            <p className="w-10 text-white">Rol</p>
            <select className="bg-white flex-1 rounded-full border border-b h-10 pl-4" value={esRol} onChange={(e)=>setEsRol(e.target.value)}>
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
            <h1 className="text-xl">Subir factura</h1>{/*Subir factura*/}
            <p className="ml-5 text-gray-400 mt-2">Suba la factura individual para esta persona en este rol </p>{/*Suba la factura individual para esta persona en este rol*/}
        </div>
        <div className="flex h-100 rounded-xl border border-dashed border-4 border-gray-500 cursor-grabbing items-center text-center ml-6 mr-6 mb-5">
            <p className="flex-1 text-lg text-gray-400">Suelte el archivo</p>

        </div>
        <div className="flex flex-col justify-center"  title="Vista previa de archivo">
            <p className="flex-1">
                Factura actual
            </p>
            <div className="h-50 w-80 border border-b m-5 mx-auto">
                {/*Ruta de vista previa*/}

            </div>
        </div>
        <div className="flex justify-end w-full gap-3">
            <button className="flex w-10 h-10 items-center border border-b rounded-full bg-black text-white hover:bg-gray-500">
               <HiEye className="flex-1"/>
            </button>
        
            <button className="flex w-10 h-10 items-center border border-b rounded-full bg-black text-white hover:bg-gray-500">
               <HiUser className="flex-1"/>
            </button>
        </div>
        
        
        
        
        
      </div>

    </div>
  );
}

