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
  createdAt: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
        await setDoc(userDocRef, { 
          usageCount: increment(1) 
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
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
        
        // Listen for real-time updates to profile
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            
            setProfile({
              uid: data.uid || firebaseUser.uid,
              email: data.email || firebaseUser.email || '',
              subscriptionTier: (isDevEmail || data.subscriptionTier === 'premium') ? 'premium' : (data.subscriptionTier || 'free'),
              role: (isDevEmail || data.role === 'admin') ? 'admin' : (data.role || 'user'),
              usageCount: data.usageCount || 0,
              trialStartDate: data.trialStartDate || null,
              createdAt: data.createdAt
            });
          } else {
            const isDevEmail = firebaseUser.email === 'twentyonetiktok55@gmail.com';
            const initialTier: Tier = isDevEmail ? 'premium' : 'free';
            const initialRole: 'user' | 'admin' = isDevEmail ? 'admin' : 'user';

            const newProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              subscriptionTier: initialTier,
              role: initialRole,
              usageCount: 0,
              trialStartDate: null,
              createdAt: serverTimestamp(),
            };
            
            setDoc(userDocRef, newProfileData).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
            });
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, updates, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  return { 
    user, 
    profile, 
    loading, 
    incrementUsage, 
    usageCount: profile ? (profile.usageCount || 0) : guestUsage,
    updateProfile
  };
}
