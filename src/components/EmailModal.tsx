import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface EmailModalProps {
  user: {
    email: string;
  };
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const EmailModal: React.FC<EmailModalProps> = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ ...formData, to: user.email });
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Envoyer un email</h2>
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
              Destinataire
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
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
              <Send size={20} className="mr-2" />
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;