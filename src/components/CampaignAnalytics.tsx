import React, { useState, useEffect } from 'react';
import { Brain, Clock, Users, MousePointer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Analytics {
  id: string;
  form_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

const CampaignAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);

      // Simuler des insights IA (à remplacer par de vraies analyses)
      generateAIInsights(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInsights = (analyticsData: Analytics[]) => {
    // Exemple d'insights générés par l'IA
    const mockInsights: AIInsight[] = [
      {
        type: 'behavior',
        title: 'Comportement utilisateur',
        description: 'Les utilisateurs passent en moyenne 5 minutes sur le formulaire',
        recommendation: 'Envisagez de diviser le formulaire en étapes plus courtes',
        confidence: 85
      },
      {
        type: 'completion',
        title: 'Taux de complétion',
        description: '75% des utilisateurs complètent le formulaire',
        recommendation: 'Simplifiez les dernières questions pour améliorer le taux de complétion',
        confidence: 92
      },
      {
        type: 'engagement',
        title: 'Points d\'engagement',
        description: 'Fort engagement sur les questions de projet et budget',
        recommendation: 'Mettez en avant ces sections dans la présentation',
        confidence: 88
      }
    ];

    setInsights(mockInsights);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Temps moyen</h4>
            <Clock className="text-coaching-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-coaching-primary">5m 30s</p>
          <p className="text-sm text-gray-600 mt-2">par formulaire</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Visiteurs uniques</h4>
            <Users className="text-coaching-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-coaching-primary">247</p>
          <p className="text-sm text-gray-600 mt-2">cette semaine</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Taux de conversion</h4>
            <MousePointer className="text-coaching-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-coaching-primary">32%</p>
          <p className="text-sm text-gray-600 mt-2">des visiteurs</p>
        </div>
      </div>

      {/* Insights IA */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Brain className="text-coaching-primary" size={24} />
            <h3 className="text-xl font-semibold">Analyses et Recommandations IA</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">{insight.title}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {insight.confidence}% de confiance
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{insight.description}</p>
                
                <div className="bg-white p-4 rounded-lg border border-coaching-primary/20">
                  <h5 className="font-medium text-coaching-primary mb-2">Recommandation :</h5>
                  <p className="text-gray-800">{insight.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des événements */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Historique des interactions</h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {analytics.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 mt-2 rounded-full bg-coaching-primary"></div>
                <div>
                  <p className="font-medium">{event.event_type}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                  <pre className="mt-2 text-sm bg-white p-2 rounded">
                    {JSON.stringify(event.event_data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;