// src/views/PagosView.jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PagosForm from './components/PagosForm';
// TODO: Manjeo de divisas (no lo veo necesario)

// llave de stripe (no tenemos, puede ser de mercado pago o paypal solo que el flujo cambia)
const stripePromise = loadStripe('pk_test_tu_llave_aqui');

export default function PagosView() {
  const [selectedItems, setSelectedItems] = useState([]);

  //Estados de facturación
  const [pagoExitoso, setPagoExitoso] = useState(false); // Controla el modal de éxito
  const [quiereFactura, setQuiereFactura] = useState(false); // Cambia a formulario fiscal
  const [showXML, setShowXML] = useState(false); // Muestra el XML final
  const [datosFacturacion, setDatosFacturacion] = useState({
    rfc: '',
    razonSocial: '',
    usoCFDI: 'G03'
  });

  const pendingPayments = [
    { id: 101, title: 'Titulo', type: 'Taller', price: 150.00 },
    { id: 102, title: 'Titulo', type: 'Ponencia', price: 100.00 },
    { id: 103, title: 'Titulo', type: 'Taller', price: 250.00 },
  ];

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const total = pendingPayments
    .filter(item => selectedItems.includes(item.id))
    .reduce((acc, item) => acc + item.price, 0);

    //llamarlo cuando el pago sea real
  const handleSimularPago = () => setPagoExitoso(true);
    
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8">Pagos Pendientes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* elementos */}
        <div className="md:col-span-2 space-y-4">
          {pendingPayments.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                selectedItems.includes(item.id) 
                ? 'border-primary bg-primary/5' 
                : 'border-base-300 bg-base-100 opacity-70'
              }`}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)}
                  onChange={() => {}}
                  className="checkbox checkbox-primary"
                />
                <div>
                  <h4 className="font-bold">{item.title}</h4>
                  <span className="text-xs badge badge-ghost uppercase">{item.type}</span>
                </div>
              </div>
              <span className="font-bold text-lg">${item.price.toFixed(2) + " MXN"}</span>
            </div>
          ))}
        </div>

        {/* stripe */}
        <div className="md:col-span-1">
          <div className="bg-base-200 p-6 rounded-2xl sticky top-24 shadow-sm">
            <h3 className="font-bold text-xl mb-4">Resumen</h3>
            <div className="flex justify-between mb-6 text-sm">
              <span>Items seleccionados:</span>
              <span className="font-bold">{selectedItems.length}</span>
            </div>
            
            <div className="border-t border-gray-300 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm">Total:</span>
                <span className="text-lg font-bold text-primary">${total.toFixed(2) + " MXN"}</span>
              </div>
            </div>

            {total > 0 ? (
              <Elements stripe={stripePromise}>
                {/* Pasa setPagoExitoso como prop si tu PagosForm lo permite */}
                <PagosForm total={total} onSuccess={() => setPagoExitoso(true)} />
                {/* Botón de prueba (borrar cuando uses Stripe real) */}
                <button onClick={handleSimularPago} className="btn btn-ghost btn-xs w-full mt-2 opacity-30">Simular Éxito</button>
              </Elements>
            ) : (
              <div className="text-center p-4 bg-base-300 rounded-lg text-xs opacity-60">
                Selecciona al menos una ponencia para habilitar el pago.
              </div>
            )}
            
            <p className="text-[10px] mt-4 opacity-50 text-center">
              Tus pagos son procesados de forma segura a través de terceros. No almacenamos datos de tu tarjeta.
            </p>
          </div>
        </div>
      </div>


      {/* MODAL 1: ÉXITO Y PREGUNTA DE FACTURACIÓN */}
      {pagoExitoso && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full">
            {!quiereFactura ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center text-3xl mx-auto">✓</div>
                <h2 className="text-2xl font-bold">¡Pago Exitoso!</h2>
                <p className="text-sm opacity-70">¿Deseas generar tu factura XML ahora mismo?</p>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setQuiereFactura(true)} className="btn btn-primary flex-1">Sí, facturar</button>
                  <button onClick={() => setPagoExitoso(false)} className="btn btn-ghost flex-1">Omitir</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center">Datos Fiscales</h3>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">RFC</label>
                  <input 
                    type="text" 
                    placeholder="XAXX010101000"
                    className="input input-bordered w-full"
                    onChange={(e) => setDatosFacturacion({...datosFacturacion, rfc: e.target.value})}
                  />
                </div>
                <div className="form-control text-left">
                  <label className="label text-xs font-bold">RAZÓN SOCIAL</label>
                  <input 
                    type="text" 
                    placeholder="Nombre o Empresa"
                    className="input input-bordered w-full"
                    onChange={(e) => setDatosFacturacion({...datosFacturacion, razonSocial: e.target.value})}
                  />
                </div>
                <button 
                  disabled={!datosFacturacion.rfc || !datosFacturacion.razonSocial}
                  onClick={() => { setShowXML(true); setPagoExitoso(false); }}
                  className="btn btn-primary w-full mt-4"
                >
                  Generar XML
                </button>
                <button onClick={() => setQuiereFactura(false)} className="btn btn-link btn-sm w-full opacity-50">Volver</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showXML && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowXML(false)}></div>
          <div className="relative bg-base-100 p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4 text-neutral">Comprobante Fiscal Digital (XML)</h3>
            <div className="bg-neutral text-white p-4 rounded-lg font-mono text-[10px] overflow-x-auto h-64 border border-primary">
              <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante version="4.0" Fecha="${new Date().toISOString()}" 
    SubTotal="${(total / 1.16).toFixed(2)}" Total="${total.toFixed(2)}" Moneda="MXN" 
    TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE">
  <cfdi:Emisor Rfc="CONG20260101ABC" Nombre="CONGRESO INTERNACIONAL 2026" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${datosFacturacion.rfc.toUpperCase()}" 
      Nombre="${datosFacturacion.razonSocial.toUpperCase()}" 
      UsoCFDI="${datosFacturacion.usoCFDI}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="81111508" Cantidad="1" Descripcion="Registro Eventos Congreso" 
        ValorUnitario="${(total / 1.16).toFixed(2)}" Importe="${(total / 1.16).toFixed(2)}"/>
  </cfdi:Conceptos>
</cfdi:Comprobante>`}</pre>
            </div>
            <div className="flex gap-4 mt-6">
              <button className="btn btn-primary flex-1" onClick={() => window.print()}>Imprimir / Guardar</button>
              <button className="btn btn-ghost border-base-300" onClick={() => setShowXML(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
