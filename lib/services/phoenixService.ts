export interface PhoenixService {
  id: number;
  name: string;
  isInternal: boolean;
}

// Based on the structure from the example file
export interface Job {
  id: string;
  status: 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed' | 'canceled' | 'cancelled';
  assignedTechnician: {
    latitude: number;
    longitude: number;
    avatar: string;
    fullName: string;
  };
  Address: {
    lat: number;
    lng: number;
    fullAddress: string;
    short?: string;
  };
  proxy?: {
    ProxyNumber?: {
      number: string;
    };
  };
  notes: string;
  JobLineItems: {
    id: number;
    price: number;
    Service: {
      name: string;
      description: string;
    };
  }[];
  Customer: {
    fullName: string;
  };
  Car?: {
    year: string;
    make: string;
    model: string;
  };
  arrivalTime?: string;
  Invoices?: {
    status: string;
    total: number;
    linkCode: string;
  }[];
  dispatcher?: {
    fullName: string;
  };
  serviceSummary: string;
  serviceType: string;
  customerNotes: string;
  createdAt: string; // or Date
}

const PHOENIX_API_URL = process.env.EXPO_PUBLIC_PHOENIX_API_URL;

export const getPhoenixServices = async (
  includeInternal = false
): Promise<PhoenixService[]> => {
  console.log(
    'getPhoenixServices called with includeInternal:',
    includeInternal
  );
  if (!PHOENIX_API_URL) {
    console.error(
      'Phoenix API URL is not configured. Please set EXPO_PUBLIC_PHOENIX_API_URL in your environment.'
    );
    throw new Error(
      'Phoenix API URL is not configured. Please set EXPO_PUBLIC_PHOENIX_API_URL in your environment.'
    );
  }

  try {
    const url = `${PHOENIX_API_URL}/services`;
    console.log('Fetching Phoenix services from:', url);
    const response = await fetch(url);
    console.log('Fetch response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Network response was not ok: ${response.status} ${response.statusText} - ${errorBody}`
      );
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const responseData = await response.json();
    const services: PhoenixService[] = responseData.data;
    console.log('Fetched services:', services);

    if (includeInternal) {
      console.log('Returning all services (including internal)');
      return services;
    }

    const filteredServices = services.filter((service) => !service.isInternal);
    console.log(
      'Returning filtered services (excluding internal):',
      filteredServices
    );
    return filteredServices;
  } catch (error) {
    console.error('Failed to fetch Phoenix services:', error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
};

export const getPhoenixJobDetails = async (id: string): Promise<Job> => {
  if (!PHOENIX_API_URL) {
    throw new Error("Phoenix API URL is not configured.");
  }

  try {
    const url = `${PHOENIX_API_URL}/jobs/public/search/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as Job;
  } catch (error) {
    console.error(`Failed to fetch job details for id ${id}:`, error);
    throw error;
  }
};
