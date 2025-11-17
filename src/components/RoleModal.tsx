import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface RoleModalProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
  onClose: () => void;
  onSubmit: (userId: string, newRole: string) => Promise<void>;
}

const RoleModal: React.FC<RoleModalProps> = ({ user, onClose, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Modifier le rôle</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Sélectionner un rôle
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="authenticated"
                  checked={selectedRole === 'authenticated'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-coaching-primary focus:ring-coaching-primary"
                />
                <div className="ml-3">
                  <span className="font-medium">Utilisateur</span>
                  <p className="text-sm text-gray-500">
                    Accès standard aux fonctionnalités de base
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-coaching-primary focus:ring-coaching-primary"
                />
                <div className="ml-3">
                  <span className="font-medium">Administrateur</span>
                  <p className="text-sm text-gray-500">
                    Accès complet à toutes les fonctionnalités
                  </p>
                </div>
              </label>
            </div>
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
              disabled={isLoading || selectedRole === user.role}
              className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary disabled:opacity-50"
            >
              <Shield size={20} className="mr-2" />
              {isLoading ? 'Modification...' : 'Modifier le rôle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;