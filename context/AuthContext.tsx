import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, UserProfile } from '../services/auth';
import { useAppStore } from '../store/useAppStore';
import { verifyAuthToken } from '../services/backendApi';

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
  const clearUserData = useAppStore((s) => s.clearUserData);
  const lastUserIdRef = useRef<string | null>(null);

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
      if (firebaseUser) {
        const newUserId = firebaseUser.uid;
        if (lastUserIdRef.current && lastUserIdRef.current !== newUserId) {
          clearUserData();
        }
        lastUserIdRef.current = newUserId;

        setUser(firebaseUser);
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

        // Sync user with backend
        try {
          await verifyAuthToken(firebaseUser.displayName || undefined);
        } catch (error) {
          console.log('Backend sync skipped (server may not be running):', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        lastUserIdRef.current = null;
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
