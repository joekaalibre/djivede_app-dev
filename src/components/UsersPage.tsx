import React, { useState, useEffect } from 'react';
import { User, UserPlus, Edit2, Trash2, Mail, Shield, Search, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AnimatedSection from './AnimatedSection';
import UserModal from './UserModal';
import EmailModal from './EmailModal';
import RoleModal from './RoleModal';

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_super_admin: boolean;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'password'>('create');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          encrypted_password: userData.password, // Note: Password will be hashed by the database trigger
          role: userData.role,
          is_super_admin: userData.role === 'admin'
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          role: userData.role,
          is_super_admin: userData.role === 'admin'
        })
        .eq('id', selectedUser?.id);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleUpdatePassword = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          encrypted_password: userData.newPassword // Note: Password will be hashed by the database trigger
        })
        .eq('id', selectedUser?.id);

      if (error) throw error;
      alert('Mot de passe modifié avec succès');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      // Implement email sending logic here
      console.log('Sending email:', emailData);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: newRole,
          is_super_admin: newRole === 'admin'
        })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <AnimatedSection>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="authenticated">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <button
            onClick={() => {
              setModalType('create');
              setSelectedUser(null);
              setShowUserModal(true);
            }}
            className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
          >
            <UserPlus size={20} className="mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-coaching-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-coaching-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.is_super_admin
                          ? 'bg-coaching-primary/10 text-coaching-primary'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_super_admin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.created_at), 'PP', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? format(new Date(user.last_sign_in_at), 'PP', { locale: fr })
                        : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType('edit');
                          setShowUserModal(true);
                        }}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Modifier l'utilisateur"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEmailModal(true);
                        }}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Envoyer un email"
                      >
                        <Mail size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Modifier le rôle"
                      >
                        <Shield size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType('password');
                          setShowPasswordModal(true);
                        }}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Modifier le mot de passe"
                      >
                        <Lock size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserModal && (
        <UserModal
          type={modalType}
          user={selectedUser || undefined}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSubmit={modalType === 'create' ? handleCreateUser : handleUpdateUser}
        />
      )}

      {showEmailModal && selectedUser && (
        <EmailModal
          user={selectedUser}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSendEmail}
        />
      )}

      {showRoleModal && selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateRole}
        />
      )}

      {showPasswordModal && selectedUser && (
        <UserModal
          type="password"
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdatePassword}
        />
      )}
    </AnimatedSection>
  );
};

export default UsersPage;