import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function PagosForm({ total }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
    });

    if (error) {
      console.log("[error]", error);
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      alert("pago realizado");
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#222222",
        "::placeholder": { color: "#aab7c4" },
      },
      invalid: { color: "#9e2146" },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardNumberElement options={elementOptions} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <CardExpiryElement options={elementOptions} />
        </div>
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <CardCvcElement options={elementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || total === 0}
        className="btn btn-primary w-full text-white mt-2"
      >
        Pagar ${total.toFixed(2)}
      </button>
    </form>
  );
}
