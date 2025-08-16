import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Resident, Vehicle } from '@/lib/types/resident';

type ProfileContextType = {
  residentData: Resident | null;
  loading: boolean;
  error: string | null;
  setResidentData: React.Dispatch<React.SetStateAction<Resident | null>>;
  addVehicle: (vehicle: Vehicle) => Promise<number>;
  updateVehicle: (vehicle: Vehicle, index: number) => Promise<void>;
  deleteVehicle: (index: number) => Promise<void>;
  updateProfile: (data: Partial<Resident>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [residentData, setResidentData] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getResidentDocRef = useCallback(() => {
    if (!user?.uid || !user.claims?.organizationId || !user.claims?.propertyId) {
      return null;
    }
    return doc(
      db,
      `organizations/${
        user.claims.organizationId
      }/properties/${user.claims.propertyId.trim()}/residents/${user.uid}`
    );
  }, [user]);

  useEffect(() => {
    const residentDocRef = getResidentDocRef();
    if (!residentDocRef) {
      setError('User information incomplete. Cannot load profile.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      residentDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Resident;
          setResidentData(data);
          setError(null);
        } else {
          setResidentData(null);
          setError('Profile not found, please complete your details.');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching resident data:', err);
        setError('Failed to load profile data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, getResidentDocRef]);

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

  const updateVehiclesInFirestore = async (updatedVehicles: Vehicle[]) => {
    const residentDocRef = getResidentDocRef();
    if (!residentDocRef) {
      throw new Error('User information incomplete. Cannot save vehicle.');
    }
    await updateDoc(residentDocRef, { vehicles: updatedVehicles });
  };

  const addVehicle = async (vehicle: Vehicle) => {
    if (!residentData) throw new Error('Resident data not loaded.');
    const currentVehicles = residentData.vehicles || [];
    const newVehicles = [...currentVehicles, vehicle];
    await updateVehiclesInFirestore(newVehicles);
    setResidentData({ ...residentData, vehicles: newVehicles });
    return newVehicles.length - 1;
  };

  const updateVehicle = async (vehicle: Vehicle, index: number) => {
    if (!residentData) throw new Error('Resident data not loaded.');
    const currentVehicles = residentData.vehicles || [];
    const newVehicles = [...currentVehicles];
    newVehicles[index] = vehicle;
    await updateVehiclesInFirestore(newVehicles);
    setResidentData({ ...residentData, vehicles: newVehicles });
  };

  const deleteVehicle = async (index: number) => {
    if (!residentData) throw new Error('Resident data not loaded.');
    const currentVehicles = residentData.vehicles || [];
    const newVehicles = currentVehicles.filter((_, i) => i !== index);
    await updateVehiclesInFirestore(newVehicles);
    setResidentData({ ...residentData, vehicles: newVehicles });
  };

  const updateProfile = async (data: Partial<Resident>) => {
    const residentDocRef = getResidentDocRef();
    if (!residentDocRef) {
      throw new Error('User information incomplete. Cannot save profile.');
    }
    await updateDoc(residentDocRef, data);
  };

  const value = {
    residentData,
    loading,
    error,
    setResidentData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateProfile,
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
