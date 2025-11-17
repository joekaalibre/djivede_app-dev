import React, { useState } from 'react';
import { X, Save, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  type: 'create' | 'edit';
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
    transaction_id?: string;
  };
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  type,
  payment,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    amount: payment?.amount || 0,
    status: payment?.status || 'pending',
    method: payment?.method || 'card',
    transaction_id: payment?.transaction_id || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {type === 'create' ? 'Nouveau paiement' : 'Modifier le paiement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              <option value="card">Carte bancaire</option>
              <option value="transfer">Virement</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de transaction
            </label>
            <input
              type="text"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              placeholder="ex: txn_123456789"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {isLoading ? 'Enregistrement...' : type === 'create' ? 'Créer' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;