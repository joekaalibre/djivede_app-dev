type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Taux de conversion par rapport à l'euro
};

export const currencies: Record<string, Currency> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 1,
  },
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA',
    rate: 655.957, // Taux fixe par rapport à l'euro
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar US',
    rate: 1.09, // Exemple de taux (à mettre à jour avec une API en production)
  },
};

export const formatPrice = (amount: number, currency: keyof typeof currencies): string => {
  const curr = currencies[currency];
  const convertedAmount = amount * curr.rate;
  
  if (currency === 'XOF') {
    return `${Math.round(convertedAmount).toLocaleString()} ${curr.symbol}`;
  }
  
  return currency === 'USD' 
    ? `${curr.symbol}${convertedAmount.toFixed(2)}`
    : `${convertedAmount.toFixed(2)}${curr.symbol}`;
};