import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { marketingAutomation } from '../lib/marketing';
import { useAuth } from '../components/AuthProvider';

export function useMarketing() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Track page views
    marketingAutomation.trackInteraction(user?.id, 'page_view', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, user]);

  return {
    trackInteraction: (type: string, data: Record<string, any> = {}) => {
      marketingAutomation.trackInteraction(user?.id, type, data);
    },
    getPersonalizedContent: async () => {
      if (!user?.id) return {};
      return await marketingAutomation.getPersonalizedContent(user.id);
    }
  };
}