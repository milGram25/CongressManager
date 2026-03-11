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
          {pendingPayments.length === 0 && (
            <div className="text-center py-10 opacity-50 italic">No tienes pagos pendientes.</div>
          )}
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
                <span className="text-sm">Total a pagar:</span>
                <span className="text-xl font-bold text-primary">${total.toFixed(2) + " MXN"}</span>
              </div>
            </div>

            {total > 0 ? (
              <Elements stripe={stripePromise}>
                <PagosForm total={total} />
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
    </div>
  );
}
