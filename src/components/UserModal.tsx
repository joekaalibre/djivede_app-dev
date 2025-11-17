import React, { useState } from 'react';
import { X, Mail, Lock, Shield } from 'lucide-react';

interface UserModalProps {
  type: 'create' | 'edit' | 'password';
  user?: {
    id: string;
    email: string;
    role: string;
  };
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({ type, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    role: user?.role || 'authenticated',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match for password change
    if (type === 'password' && formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'create':
        return 'Ajouter un utilisateur';
      case 'edit':
        return 'Modifier l\'utilisateur';
      case 'password':
        return 'Modifier le mot de passe';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{renderTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(type === 'create' || type === 'edit') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {type === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      required={type === 'create'}
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  >
                    <option value="authenticated">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === 'password' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

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
              className="px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : type === 'create' ? 'Ajouter' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;