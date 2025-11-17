import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface OrderModalProps {
  type: 'create' | 'edit';
  order?: {
    id: string;
    status: string;
    payment_status: string;
    shipping_address?: any;
  };
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const OrderModal: React.FC<OrderModalProps> = ({
  type,
  order,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    status: order?.status || 'pending',
    payment_status: order?.payment_status || 'pending',
    shipping_address: order?.shipping_address || {}
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
            {type === 'create' ? 'Nouvelle commande' : 'Modifier la commande'}
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
              Statut de la commande
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              <option value="pending">En attente</option>
              <option value="processing">En cours de traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut du paiement
            </label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="refunded">Remboursé</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse de livraison
            </label>
            <textarea
              value={JSON.stringify(formData.shipping_address, null, 2)}
              onChange={(e) => {
                try {
                  const address = JSON.parse(e.target.value);
                  setFormData({ ...formData, shipping_address: address });
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent font-mono text-sm"
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

export default OrderModal;