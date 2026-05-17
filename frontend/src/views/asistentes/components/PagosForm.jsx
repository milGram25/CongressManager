import { useState } from "react";
import { MdCreditCard, MdDateRange, MdLock } from "react-icons/md";

export default function PagosForm({ total, onSuccess, loading }) {
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + " / " + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "number") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiry") {
      formattedValue = formatExpiry(value);
    } else if (name === "cvv") {
      formattedValue = value.replace(/[^0-9]/gi, "").substring(0, 4);
    }

    setCardData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const isFormValid =
    cardData.number.replace(/\s/g, "").length >= 16 &&
    cardData.expiry.length === 7 &&
    cardData.cvv.length >= 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-bold text-[10px] opacity-60">Número de Tarjeta</span>
        </label>
        <div className="relative">
          <MdCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral/40 text-lg" />
          <input
            type="text"
            name="number"
            placeholder="0000 0000 0000 0000"
            className="input input-bordered input-sm w-full pl-10 bg-base-100 focus:border-primary text-sm"
            value={cardData.number}
            onChange={handleChange}
            maxLength={19}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-bold text-[10px] opacity-60">Vencimiento</span>
          </label>
          <div className="relative">
            <MdDateRange className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral/40 text-base" />
            <input
              type="text"
              name="expiry"
              placeholder="MM / YY"
              className="input input-bordered input-sm w-full pl-8 bg-base-100 focus:border-primary text-sm"
              value={cardData.expiry}
              onChange={handleChange}
              maxLength={7}
              required
            />
            </div>
            </div>

            <div className="form-control">
            <label className="label py-1">
            <span className="label-text font-bold text-[10px] opacity-60">CVV</span>
            </label>
            <div className="relative">
            <MdLock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral/40 text-base" />
            <input
              type="text"
              name="cvv"
              placeholder="123"
              className="input input-bordered input-sm w-full pl-8 bg-base-100 focus:border-primary text-sm"
              value={cardData.cvv}
              onChange={handleChange}
              maxLength={4}
              required
            />          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || total === 0 || loading}
        className="btn btn-primary btn-sm w-full text-white mt-2 shadow-sm"
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          `Pagar $${total.toFixed(2)} MXN`
        )}
      </button>
    </form>
  );
}
