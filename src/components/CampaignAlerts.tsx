import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Alert {
  id: string;
  form_id: string;
  type: 'email' | 'notification';
  conditions: any;
  message: string;
  active: boolean;
}

const CampaignAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('automated_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = () => {
    setSelectedAlert(null);
    setShowAlertModal(true);
  };

  const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;

    try {
      const { error } = await supabase
        .from('automated_messages')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleToggleAlert = async (alertId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('automated_messages')
        .update({ active })
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Configuration des Alertes</h3>
        <button
          onClick={handleCreateAlert}
          className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nouvelle Alerte
        </button>
      </div>

      <div className="grid gap-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  alert.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Bell size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{alert.type === 'email' ? 'Alerte Email' : 'Notification'}</h4>
                  <p className="text-gray-600 mt-1">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditAlert(alert)}
                  className="p-2 text-gray-600 hover:text-coaching-primary"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alert.active}
                    onChange={(e) => handleToggleAlert(alert.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coaching-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coaching-primary"></div>
                </label>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Conditions de déclenchement :</h5>
              <ul className="space-y-2">
                {Object.entries(alert.conditions || {}).map(([key, value]) => (
                  <li key={key} className="text-sm text-gray-600">
                    • {key}: {JSON.stringify(value)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte configurée</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer une nouvelle alerte pour être notifié des soumissions de formulaires.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAlerts;