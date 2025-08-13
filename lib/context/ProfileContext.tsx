import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Resident, Vehicle } from '@/lib/types/resident';

type ProfileContextType = {
  residentData: Partial<Resident>;
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  fetchResidentData: () => Promise<void>;
  setResidentData: React.Dispatch<React.SetStateAction<Partial<Resident>>>;
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (vehicle: Vehicle, index: number) => Promise<void>;
  deleteVehicle: (index: number) => Promise<void>;
  setVehicles: (vehicles: Vehicle[]) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [residentData, setResidentData] = useState<Partial<Resident>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getResidentDocRef = useCallback(() => {
    if (!user?.uid || !user.claims?.organizationId || !user.claims?.propertyId) {
      return null;
    }
    return doc(
      db,
      `organizations/${user.claims.organizationId}/properties/${user.claims.propertyId}/residents/${user.uid}`
    );
  }, [user]);

  const formatPhoneNumberOnLoad = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const fetchResidentData = useCallback(async () => {
    const residentDocRef = getResidentDocRef();
    if (!residentDocRef) {
      setError('User information incomplete. Cannot load profile.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const residentDocSnap = await getDoc(residentDocRef);
      if (residentDocSnap.exists()) {
        const data = residentDocSnap.data() as Resident;
        setResidentData({
          displayName: data.displayName || user?.displayName || '',
          email: data.email || user?.email || '',
          phone: formatPhoneNumberOnLoad(data.phone || ''),
          address: data.address || { street: '', city: '', state: '', zip: '', unit: '' },
        });
        setVehicles(data.vehicles || []);
      } else {
        setResidentData({
          displayName: user?.displayName || '',
          email: user?.email || '',
          address: { street: '', city: '', state: '', zip: '', unit: '' },
        });
        setVehicles([]);
        setError('Profile not found, please complete your details.');
      }
    } catch (err) {
      console.error('Error fetching resident data:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, [user, getResidentDocRef]);

  const updateVehiclesInFirestore = async (updatedVehicles: Vehicle[]) => {
    const residentDocRef = getResidentDocRef();
    if (!residentDocRef) {
      throw new Error('User information incomplete. Cannot save vehicle.');
    }
    await updateDoc(residentDocRef, { vehicles: updatedVehicles });
  };

  const addVehicle = async (vehicle: Vehicle) => {
    const newVehicles = [...vehicles, vehicle];
    setVehicles(newVehicles);
    await updateVehiclesInFirestore(newVehicles);
  };

  const updateVehicle = async (vehicle: Vehicle, index: number) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = vehicle;
    setVehicles(newVehicles);
    await updateVehiclesInFirestore(newVehicles);
  };

  const deleteVehicle = async (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles);
    await updateVehiclesInFirestore(newVehicles);
  };

  const value = {
    residentData,
    vehicles,
    loading,
    error,
    fetchResidentData,
    setResidentData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicles,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
