//subir multimedia de los ponentes, presentaciones, etc.
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function MultimediaView(){
  const navigate=useNavigate();
  const[archivos, setArchivos]=useState([]);
  //aqui se maneja la seleccion de archivos
  const handleFileChange=(e) => {
    const files = Array.from(e.target.files);
    //maximo de archivos que se pueden subir
    if (files.length > 2) {
      alert("Solo puedes subir 2 archivos.");
      return;
    }
    //validar tamaño de los docs, 30 MB en total pendiente de ver
    /* 
    const maxTotalSize= 30*1024*1024;
    const totalSize= file.reduce((acc, file)=> acc + file.size, 0);
    if(totalSize > maxTotalSize){
      alert("El tamaño no debe superar 30MB");
      return;
    }
    setArchivos(files); //por el momento los archivos se guardan ahi hasta conectarlo con el back
    */
  };
  
  //manejo del envio de archivos
  const handleSubmit = (e) => {
    e.preventDefault();
    if (archivos.length == 0) {
      alert("Debes seleccionar un archivo");
      return;
    }
    console.log("Subir", archivos);
    alert("Se subio correctamente");
  };


  return (
    <div className="p-8 bg-base-100 min-h-screen">
      {/*boton de regresar*/}
      <button type="button" onClick={()=>navigate(-1)} className="absolute top-6 left-6 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all group"
          >
            <span className="text-white text-4xl font-black leading-none -mt-1 select-none">
              ←
            </span>
          </button>
          
      <h1 className="text-2xl font-bold mb-6">Contenido Multimedia</h1>
      <p className="mb-4 text-base-content">
        Añadir envío, máximo 2 archivos.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        {/*selecionar archivos*/}
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
        />

        {/*boton de subir archivos*/}
        <button type="submit" className="btn btn-primary">
          Subir
        </button>
      </form>
    </div>
  );
}