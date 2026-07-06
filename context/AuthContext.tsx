import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, UserProfile } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const storeSetUser = useAppStore((s) => s.setUser);
  const storeSetMeasurements = useAppStore((s) => s.setMeasurements);

  const syncProfileToStore = (profile: UserProfile) => {
    storeSetUser({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender,
      profileImage: profile.profileImage,
    });
    storeSetMeasurements({
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
    });
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      if (profile) {
        syncProfileToStore(profile);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
        if (profile) {
          syncProfileToStore(profile);
        } else {
          storeSetUser({
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
