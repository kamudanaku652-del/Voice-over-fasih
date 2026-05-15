import { useState, useEffect } from 'react';

export type Tier = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  subscriptionTier: Tier;
  role: 'user' | 'admin';
  usageCount: number;
}

const LOCAL_STORAGE_KEY = 'alan_media_user_state';

interface LocalState {
  usageCount: number;
  tier: Tier;
  lastReset: string;
}

export function useUserTier() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>({
    uid: 'local-user',
    email: 'Visitor',
    subscriptionTier: 'free',
    role: 'user',
    usageCount: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      const data: LocalState = JSON.parse(saved);
      // Reset daily if free
      if (data.tier === 'free' && data.lastReset !== today) {
        data.usageCount = 0;
        data.lastReset = today;
      }
      
      setProfile({
        uid: 'local-user',
        email: data.tier === 'premium' ? 'Premium Member' : 'Visitor',
        subscriptionTier: data.tier,
        role: data.tier === 'premium' ? 'admin' : 'user',
        usageCount: data.usageCount
      });
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } else {
      const initialState: LocalState = {
        usageCount: 0,
        tier: 'free',
        lastReset: today
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialState));
    }
    setLoading(false);
  }, []);

  const incrementUsage = async () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return;

    const data: LocalState = JSON.parse(saved);
    if (data.tier === 'free' && data.usageCount >= 10) {
      throw new Error('Limit harian tercapai! Upgrade ke Premium untuk akses tak terbatas.');
    }

    data.usageCount += 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    
    setProfile(prev => prev ? { ...prev, usageCount: data.usageCount } : null);
  };

  const upgrade = async () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return;

    const data: LocalState = JSON.parse(saved);
    data.tier = 'premium';
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    
    setProfile({
      uid: 'local-user',
      email: 'Premium Member',
      subscriptionTier: 'premium',
      role: 'admin',
      usageCount: data.usageCount
    });
  };

  const unlockWithCode = async (code: string) => {
    // Daftar kode valid (Bisa kakak ganti atau tambah di sini)
    const VALID_CODES = ['ALAN-MEDIA-PRO', 'VIBRANT-AUDIO-2024', 'SUCCES-JUALAN-KAK'];
    
    if (VALID_CODES.includes(code.toUpperCase())) {
      await upgrade();
      return true;
    }
    throw new Error('Kode aktivasi salah atau sudah kadaluarsa!');
  };

  const logout = async () => {
    // No-op for local mode
  };

  const login = async () => {
    // No-op for local mode
  };

  const register = async () => {
    // No-op for local mode
  };

  return { 
    user: profile ? { uid: profile.uid, email: profile.email } : null,
    profile, 
    loading, 
    incrementUsage, 
    usageCount: profile?.usageCount || 0,
    login,
    register,
    logout,
    upgrade,
    unlockWithCode
  };
}
