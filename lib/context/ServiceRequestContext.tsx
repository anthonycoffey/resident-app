import React, { createContext, useContext, ReactNode } from 'react';

// The context is now empty, but we'll keep the structure
// in case we need to add global state related to service requests later.
type ServiceRequestContextType = object;

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(
  undefined
);

export const ServiceRequestProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ServiceRequestContext.Provider value={{}}>
      {children}
    </ServiceRequestContext.Provider>
  );
};

export const useServiceRequest = () => {
  const context = useContext(ServiceRequestContext);
  if (context === undefined) {
    throw new Error(
      'useServiceRequest must be used within a ServiceRequestProvider'
    );
  }
  return context;
};
