// Aqui se inserta el apartado de estatus de ponencia
import React, {useState} from 'react';

export default function EstatusPonenciaView(){
  const[archivos, setArchivos]=useState([]);
  const[openModal, setOpenModal]=useState(null);
    const handleOpen=()=>setOpenModal(true);
    const handleClose=()=>setOpenModal(false);
  //ejemplos de ponencias, ver bien que lleva cada una y modificarlo despues
  const ponencias = [
    {
      titulo: "Movilización del conocimiento y la ciencia abierta",
      estatus: "extenso-aceptado",
      fecha: "10-marzo-2026",
      id: "1"
    },
    {
      titulo: "Innovación educativa y transformación digital en la universidad contemporánea",
      estatus: "resumen-aceptado",
      fecha: "20-marzo-2026",
      id: "2"
    },
    {
      titulo: "Innovación educativa",
      estatus: "extenso-con-modificaciones",
      fecha: "20-marzo-2026",
      id: "3"
    },
    {
      titulo: "Innovación educativa y contemporánea",
      estatus: "rechazado",
      fecha: "20-marzo-2026",
      id: "4"
    },
  ];
  const handleFileChange=(e, maxFiles) => {
    const files = Array.from(e.target.files);
    //maximo de aarchivos que se pueden subir especificado en cada boton con e.
    if (files.length > maxFiles) {
      alert(`Solo puedes subir ${maxFiles} archivos.`);
      return;
    }
    setArchivos(files);
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
  //color segun estatus verde, rojo y amarillo solo los bordes
  const colorEstatus=(estatus) =>{
    if(estatus == "extenso-aceptado")return "border-success";
    if(estatus == "resumen-aceptado")return "border-primary"; //diferenciar extenso aceptado de resumen
    if(estatus == "extenso-con-modificaciones")return "border-warning";
    if(estatus == "rechazado")return "border-error";
    return "border-neutral";
  };
  //texto que se muestra depende el estatus en los cuadros
  const textoEstatus=(estatus) =>{
    switch(estatus){
      case "extenso-aceptado": return "Extenso Aceptado";
      case "resumen-aceptado": return "Resumen Aceptado";
      case "extenso-con-modificaciones": return "El extenso requiere modificaciones";
      case "rechazado": return "Rechazado";
      default: return "sin estatus";
    }
  };
  //boton depende del estatus, cada boton tiene un caso
  const renderBoton=(p)=> {
    return(
      <div>
        {/*botones de estatus*/}
        {p.estatus=="extenso-aceptado"&&(
          <button className="btn btn-primary" onClick={()=> setOpenModal("extenso-aceptado")}>
            Subir Multimedia
          </button>
        )}

        {p.estatus=="resumen-aceptado"&&(
          <>
            <button className="btn btn-primary me-2">
              Descargar Formato de Extenso
            </button>
            <button className="btn btn-primary" onClick={()=> setOpenModal("resumen-aceptado")}>
              Subir Extenso
            </button>
          </>
        )}

        {p.estatus=="extenso-con-modificaciones"&&(
          <button className="btn btn-primary" onClick={()=> setOpenModal("extenso-con-modificaciones")}>
            Subir Modificación
          </button>
        )}   
        {p.estatus=="rechazado"&&(
          <button className="btn btn-primary" onClick={()=> setOpenModal("rechazado")}>
            Motivo de rechazo
          </button>
        )} 
        {/*unico modal que se abre para tods, se habilita el boton y espacio depende el estatus*/}
        {openModal==p.estatus &&(
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                {p.estatus=="extenso-aceptado" && "Extenso Aceptado"}
                {p.estatus=="resumen-aceptado" && "Resumen Aceptado"}
                {p.estatus=="extenso-con-modificaciones" && "Se debe modificar el extenso"}
                {p.estatus=="rechazado" && "Ponencia Rechazada"}
              </h3>
              {/*contenido que aparecera en todos*/}
              <p>Nombre de ponencia: {p.titulo}</p>
              <p>ID: {p.id}</p>
              <p>Resumen: {p.resumen}</p>
              <p>Dictaminador asignado: </p>
              <p>Extenso: {p.archivos}</p>
              <p>Evaluador asignado: </p>
              <p>Retroalimentación: </p>
              {/*subir archivos, depende de estatus*/}
              {p.estatus=="extenso-aceptado"&&(
                <form onSubmit={handleSubmit}>
                  <input type="file" multiple onChange={(e)=> handleFileChange(e,2)} className="file-input file-input-bordered w-full"/>
                  <button type="submit" className="btn btn-primary">Subir Multimedia</button>
                </form>
              )}
              {p.estatus=="resumen-aceptado"&&(
                <form onSubmit={handleSubmit}>
                  <input type="file" multiple onChange={(e)=> handleFileChange(e,1)} className="file-input file-input-bordered w-full"/>
                  <button type="submit" className="btn btn-primary">Subir Extenso</button>
                </form>
              )}
              {p.estatus=="extenso-con-modificaciones"&&(
                <form onSubmit={handleSubmit}>
                  <input type="file" multiple onChange={(e)=> handleFileChange(e,1)} className="file-input file-input-bordered w-full"/>
                  <button type="submit" className="btn btn-primary">Subir corrección</button>
                </form>
              )}
              {p.estatus=="rechazado"&&(
                <p className="mt-4 text-primary">No se acepto por ....{p.motivo}</p>
              )}
              <div className="modal-action">
                <button className="btn" onClick={handleClose}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>  
    );
  };

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Estatus de Ponencias</h1>
      <div className="flex flex-col gap-6">
        {ponencias.map((p) => (
          <div key={p.id} className={`border-2 p-6 rounded shadow ${colorEstatus(p.estatus)}`}>
            <h2 className="text-lg font-bold mb-2">{textoEstatus(p.estatus)}</h2>
            <p>Título: {p.titulo}</p>
            <p>ID: #{p.id}</p>
            <div className="mt-4">{renderBoton(p)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}