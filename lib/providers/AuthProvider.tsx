import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Basic types based on the web app's data model
export interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
}

export interface Resident {
  name: string;
  email: string;
  phone?: string;
  vehicles?: Vehicle[];
  // other fields as necessary
}

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  claims: { [key: string]: any };
  organizationId?: string;
  propertyId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  residentProfile: Resident | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUser: (firebaseUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  residentProfile: null,
  loading: true,
  logout: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [residentProfile, setResidentProfile] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResidentProfile = async (uid: string, organizationId: string, propertyId: string) => {
      try {
        const residentDocRef = doc(db, 'organizations', organizationId, 'properties', propertyId, 'residents', uid);
        const residentDocSnap = await getDoc(residentDocRef);
        if (residentDocSnap.exists()) {
          setResidentProfile(residentDocSnap.data() as Resident);
        } else {
          console.log('No such resident document!');
          setResidentProfile(null);
        }
      } catch (error) {
        console.error('Error fetching resident profile:', error);
        setResidentProfile(null);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claims = tokenResult.claims;
        const appUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          claims: claims,
          organizationId: claims.organizationId as string | undefined,
          propertyId: claims.propertyId as string | undefined,
        };
        setUser(appUser);

        if (appUser.organizationId && appUser.propertyId) {
          fetchResidentProfile(appUser.uid, appUser.organizationId, appUser.propertyId);
        } else {
          setResidentProfile(null);
        }
      } else {
        setUser(null);
        setResidentProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (firebaseUser: User) => {
    const tokenResult = await firebaseUser.getIdTokenResult();
    const claims = tokenResult.claims;
    const appUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      claims: claims,
      organizationId: claims.organizationId as string | undefined,
      propertyId: claims.propertyId as string | undefined,
    };
    setUser(appUser);

    if (appUser.organizationId && appUser.propertyId) {
      // Optionally re-fetch profile on manual update
      // await fetchResidentProfile(appUser.uid, appUser.organizationId, appUser.propertyId);
    }
  };

  const value = useMemo(
    () => ({
      user,
      residentProfile,
      loading,
      logout,
      updateUser,
    }),
    [user, residentProfile, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
