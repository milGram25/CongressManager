import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import FechasGen from "./Componentes/fechasGen";
import CongresosFechasGen from "./Componentes/CongresosFechasGenericoV2"

export default function CongresoFechasView() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-col items-center justify-center py-20 text-center">

        <div className="w-240">
          <div className="text-black p-6 gap-2 rounded-t-lg">
            <div className="flex gap-4">
              <div className="border bg-black rounded-full h-10 w-2"></div>
              <h2 className="flex-1 text-2xl font-bold text-start">Pagos</h2>
            </div>
            <p className="pt-2 pl-12 text-start mb-4">
              Administra las fechas en las que se pueden realizar pagos a un congreso y, por lo tanto, la fecha de inscripciones de los asistentes
            </p>
          </div>
          <div className="">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen className="flex-1" titulo={"Fecha prepago"} descripcion_fecha={"Si se paga en este rango de fechas, se realiza el descuento especificado en el congreso"}/>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Fecha pago normal"} descripcion_fecha={"En este rango de fechas todos los eventos se pagan igual, sin descuento alguno."}/>
            </div>
          </div>
          <hr/>
        </div>

        <div className="w-240">
          <div className="text-black p-6 gap-2 rounded-t-lg">
            <div className="flex gap-4">
              <div className="border bg-black rounded-full h-10 w-2"></div>
              <h2 className="flex-1 text-2xl font-bold text-start">Inscripciones</h2>
            </div>
            <p className="pt-2 pl-12 text-start mb-4">
              Administra las fechas en las que pueden tanto dictaminadores como evaluadores aceptar su puesto
            </p>
          </div>
          <div className="">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen className="flex-1" titulo={"Inscripción dictaminadores"} descripcion_fecha={"Entre estas fechas deberán inscribirse los dictaminadores invitados. Si no, serán rechazados"}/>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Inscripción evaluadores"} descripcion_fecha={"Entre estas fechas deberán inscribirse los evaluadores de extensos invitados. Si no, serán rechazados"}/>
            </div>
          </div>
          <hr/>
        </div>

        <div className="w-240">
          <div className="text-black p-6 gap-2 rounded-t-lg">
            <div className="flex gap-4">
              <div className="border bg-black rounded-full h-10 w-2"></div>
              <h2 className="flex-1 text-2xl font-bold text-start">Ponencias</h2>
            </div>
            <p className="pt-2 pl-12 text-start mb-4">
              Administra las fechas en las que pueden tanto dictaminadores como evaluadores aceptar su puesto
            </p>
          </div>
          <div className="">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Envío de ponencias"} descripcion_fecha={"Entre estas fechas los ponentes podrán enviar sus solicitudes de ponencias al congreso"}/>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Revisión de resúmenes"} descripcion_fecha={"Entre estas fechas dictaminadores evaluarán los resúmenes con las preguntas propuestas"}/>
            </div>

            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Envío de extensos"} descripcion_fecha={"Si el resumen es aceptado, entre estas fechas los ponentes podrán enviar su extenso"}/>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Revisión de extensos"} descripcion_fecha={"Una vez se hayan recibido los extensos de las ponencias, los evaluadores se encargarán de revisarlos"}/>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-green-800"></div>
              <CongresosFechasGen titulo={"Envío de multimedia"} descripcion_fecha={"Si el resumen y extenso son aceptados, los ponentes deberán enviar el contenido multimedia que usará durante la exposición"}/>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}