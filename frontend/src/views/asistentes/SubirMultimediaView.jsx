//subir multimedia de ponencia 
import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

export default function SubirMultimediaView() {
  const[archivos, setArchivos] = useState([]);
  const[showModal, setShowModal] = useState(false);
  const[dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
    //manejo de archivos, para que no se borren los que se agregan
  const handleFileChange=(files, maxFiles) => {
    const nuevosArchivos=[...archivos, ...files];
    if (nuevosArchivos.length > maxFiles) {
      alert(`Solo puedes subir ${maxFiles} archivos.`);
      return;
    }
    setArchivos(nuevosArchivos);
  };

  const handleDrop=(e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileChange(files, 2);     //2 archivos max
  };

  const handleSubmit=(e) => {
    e.preventDefault();
    if (archivos.length ==0) {
      alert("Debes seleccionar un archivo");
      return;
    }
    console.log("Subir", archivos);
    setShowModal(true); //modal de carga de archivos
  };

  return(
    <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
            <button type="button" onClick={() => navigate(-1)}  //boton de retroceder
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-all group"
            >
                <span className="text-white text-4xl font-black leading-none -mt-1 select-none">
                    ←
                </span>
            </button>
            <h2 className="text-xl font-bold">
                Subir Multimedia
            </h2>
        </div>
        <p>Título Ponencia: </p>
        <p>ID:</p>
        <p>Resumen:</p>
        <p>Dictaminador asignado:</p>
        <p>Revisor asignado:</p>
        <p>Retroalimentación:</p>

        {/*arrastrar y subir archivos*/}
        <div className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer ${ dragActive ? "border-primary bg-blue-50" : "border-primary"}`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
        >
            <p className="text-primary">
                Arrastra tu archivo o haz clic para seleccionarlo
            </p>
            <input type="file" multiple className="hidden" id="fileUpload" onChange={(e) =>handleFileChange(Array.from(e.target.files), 2)}/>
            <label htmlFor="fileUpload" className="btn btn-outline mt-4">
                Seleccionar archivo
            </label>
        </div>

        {/*archivos seleccionados*/}
        {archivos.length > 0 && (
            <ul className="mt-4 text-sm text-gray-700">
                {archivos.map((file, i) => (
                    <li key={i}>{file.name}</li>
                ))}
            </ul>
        )}

        {/*boton subir multimedia*/}
        <button onClick={handleSubmit} className="btn btn-primary mt-6">
            Subir multimedia
        </button>
        {/*modal donde se confirma la carga correcta de archivos*/}
        {showModal &&(
            <div className="modal modal-open">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Archivos cargados correctamente</h3>
                    <p className="py-4">
                        La multimedia se subió correctamente.
                    </p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => setShowModal(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}