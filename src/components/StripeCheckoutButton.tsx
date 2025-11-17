// 📁 src/components/StripeCheckoutButton.tsx
// Désactivé temporairement

import React from "react";

const StripeCheckoutButton = () => {
  return (
    <button
      disabled
      className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed"
    >
      Paiement indisponible
    </button>
  );
};

export default StripeCheckoutButton;
