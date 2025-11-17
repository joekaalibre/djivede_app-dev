import React, { createContext, useContext, useEffect, useState } from 'react';
import { marketingAutomation } from '../lib/marketing';
import { useAuth } from './AuthProvider';

interface MarketingContextType {
  personalizedContent: Record<string, any>;
  trackInteraction: (type: string, data?: Record<string, any>) => void;
}

const MarketingContext = createContext<MarketingContextType>({
  personalizedContent: {},
  trackInteraction: () => {},
});

export const useMarketingContext = () => useContext(MarketingContext);

export const MarketingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personalizedContent, setPersonalizedContent] = useState<Record<string, any>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      marketingAutomation.getPersonalizedContent(user.id)
        .then(setPersonalizedContent)
        .catch(console.error);
    }
  }, [user]);

  const trackInteraction = (type: string, data: Record<string, any> = {}) => {
    marketingAutomation.trackInteraction(user?.id, type, data);
  };

  return (
    <MarketingContext.Provider value={{ personalizedContent, trackInteraction }}>
      {children}
    </MarketingContext.Provider>
  );
};