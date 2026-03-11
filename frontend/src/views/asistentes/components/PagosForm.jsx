import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function PagosForm({ total }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

  // // simulacionde llamada al backend (debug)
  //   console.log("Procesando pago de:", total);
    
    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      alert("¡Pago realizado con éxito!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      <button 
        type="submit" 
        disabled={!stripe || total === 0}
        className="btn btn-primary w-full text-white"
      >
        Pagar ${total.toFixed(2)}
      </button>
    </form>
  );
}
