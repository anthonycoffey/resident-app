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
  residentData: Partial<Resident>;
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  setResidentData: React.Dispatch<React.SetStateAction<Partial<Resident>>>;
  addVehicle: (vehicle: Vehicle) => Promise<number>;
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
          setResidentData({
            displayName: data.displayName || user?.displayName || '',
            email: data.email || user?.email || '',
            phone: data.phone || '',
            address: data.address || {
              street: '',
              city: '',
              state: '',
              zip: '',
              unit: '',
            },
          });
          setVehicles(data.vehicles || []);
          setError(null);
        } else {
          setResidentData({
            displayName: user?.displayName || '',
            email: user?.email || '',
            address: { street: '', city: '', state: '', zip: '', unit: '' },
          });
          setVehicles([]);
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
    const newVehicles = [...vehicles, vehicle];
    await updateVehiclesInFirestore(newVehicles);
    setVehicles(newVehicles);
    return newVehicles.length - 1;
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
