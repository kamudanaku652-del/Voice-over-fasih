import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, increment, serverTimestamp, Timestamp } from 'firebase/firestore';

export type Tier = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  subscriptionTier: Tier;
  role: 'user' | 'admin';
  usageCount: number;
  trialStartDate: string | null;
  createdAt: any; // Can be Timestamp or FieldValue
}

export function useUserTier() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestUsage, setGuestUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Initialize guest usage from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('alan_guest_usage');
    if (saved) {
      setGuestUsage(parseInt(saved, 10));
    }
  }, []);

  const incrementUsage = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        // Use Firestore increment to prevent race conditions and local state reset bugs
        await setDoc(userDocRef, { 
          usageCount: increment(1) 
        }, { merge: true });
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
    } else {
      const newCount = guestUsage + 1;
      setGuestUsage(newCount);
      localStorage.setItem('alan_guest_usage', newCount.toString());
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for real-time updates to profile (e.g. if they upgrade)
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            
            setProfile({
              uid: data.uid || firebaseUser.uid,
              email: data.email || firebaseUser.email || '',
              subscriptionTier: isDevEmail ? 'premium' : (data.subscriptionTier || 'free'),
              role: (isDevEmail || data.role === 'admin') ? 'admin' : 'user',
              usageCount: data.usageCount || 0,
              trialStartDate: data.trialStartDate || null,
              createdAt: data.createdAt
            });
          } else {
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            const initialTier: Tier = isDevEmail ? 'premium' : 'free';
            const initialRole: 'user' | 'admin' = isDevEmail ? 'admin' : 'user';

            // Create initial profile for new user
            const newProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              subscriptionTier: initialTier,
              role: initialRole,
              usageCount: 0,
              trialStartDate: new Date().toISOString(),
              createdAt: serverTimestamp(),
            };
            
            setDoc(userDocRef, newProfileData).catch(err => {
              console.error('Error creating user profile:', err);
            });
            
            // Local state update (optimistic or temporary until snapshot hits)
            setProfile({
              ...newProfileData,
              subscriptionTier: initialTier,
              role: initialRole,
            } as any);
          }
          setLoading(false);
        }, (error) => {
          console.error('Profile snapshot error:', error);
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

  return { user, profile, loading, incrementUsage, usageCount: profile ? (profile.usageCount || 0) : guestUsage };
}
