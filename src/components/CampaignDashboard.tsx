import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import CampaignSubmissions from './CampaignSubmissions';
import CampaignAlerts from './CampaignAlerts';
import CampaignAnalytics from './CampaignAnalytics';

const CampaignDashboard = () => {
  const [activeTab, setActiveTab] = useState('submissions');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Campagnes</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submissions">Soumissions</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="analytics">Analyses IA</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <CampaignSubmissions />
        </TabsContent>

        <TabsContent value="alerts">
          <CampaignAlerts />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDashboard;