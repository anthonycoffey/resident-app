import React, { createContext, useState, useContext } from 'react';

interface ServiceRequestContextType {
  address: any;
  setAddress: (address: any) => void;
  isOffPremise: boolean;
  setIsOffPremise: (isOffPremise: boolean) => void;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(
  undefined
);

export const ServiceRequestProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<any>(null);
  const [isOffPremise, setIsOffPremise] = useState(false);

  return (
    <ServiceRequestContext.Provider value={{ address, setAddress, isOffPremise, setIsOffPremise }}>
      {children}
    </ServiceRequestContext.Provider>
  );
};

export const useServiceRequest = () => {
  const context = useContext(ServiceRequestContext);
  if (context === undefined) {
    throw new Error('useServiceRequest must be used within a ServiceRequestProvider');
  }
  return context;
};
