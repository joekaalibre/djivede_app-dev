import React from 'react';
import { Globe } from 'lucide-react';
import { currencies } from '../utils/currency';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={selectedCurrency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
      >
        {Object.entries(currencies).map(([code, currency]) => (
          <option key={code} value={code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector