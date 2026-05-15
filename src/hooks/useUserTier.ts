import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type Tier = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  subscriptionTier: Tier;
  role: 'user' | 'admin';
  usageCount: number;
  trialStartDate: string | null;
  createdAt: string;
}

export function useUserTier() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const incrementUsage = async () => {
    if (!user || !profile) return;
    const userDocRef = doc(db, 'users', user.uid);
    const newCount = (profile.usageCount || 0) + 1;
    await setDoc(userDocRef, { usageCount: newCount }, { merge: true });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for real-time updates to profile (e.g. if they upgrade)
        const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            
            setProfile({
              ...data,
              usageCount: data.usageCount || 0,
              subscriptionTier: isDevEmail ? 'premium' : data.subscriptionTier,
              role: (isDevEmail || data.role === 'admin') ? 'admin' : 'user'
            });
          } else {
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            const initialTier: Tier = isDevEmail ? 'premium' : 'free';
            const initialRole: 'user' | 'admin' = isDevEmail ? 'admin' : 'user';

            // Create initial profile for new user
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              subscriptionTier: initialTier,
              role: initialRole,
              usageCount: 0,
              trialStartDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, incrementUsage };
}
