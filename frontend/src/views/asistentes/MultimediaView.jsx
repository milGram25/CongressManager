//subir multimedia de los ponentes, presentaciones, etc.
import React, {useState} from 'react';

export default function MultimediaView(){
  const[archivos, setArchivos]=useState([]);

  const handleFileChange=(e) => {
    const files = Array.from(e.target.files);
    //maximo de archivos que se pueden subir
    if (files.length > 2) {
      alert("Solo puedes subir 2 archivos.");
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (archivos.length == 0) {
      alert("Debes seleccionar un archivo");
      return;
    }
    console.log("Subir:", archivos);
    alert("Se subieron correctamente");
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Contenido Multimedia</h1>
      <p className="mb-4 text-gray-700">
        Añadir envío — Maximo 2 archivos.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        {/*selecionar archivos*/}
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-2"
        />

        {/*subir archivos*/}
        <button
          type="submit"
          style={{ backgroundColor: "#001219", color: "white", padding: "8px 16px", borderRadius: "6px" }}
        >
          Subir
        </button>
      </form>
    </div>
  );

}