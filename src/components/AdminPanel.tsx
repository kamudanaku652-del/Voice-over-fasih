import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Shield, Search, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [email, setEmail] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [foundUser, setFoundUser] = useState<{ id: string, email: string, tier: string, usageCount: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearchStatus('searching');
    setMessage(null);
    setFoundUser(null);

    try {
      const usersRef = collection(db, 'users');
      // Fix: Firebase list operations require a query. 
      // Note: If this fails, user might need to add index or ensure data exists.
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setFoundUser({
          id: userDoc.id,
          email: userData.email,
          tier: userData.subscriptionTier || 'free',
          usageCount: userData.usageCount || 0
        });
        setSearchStatus('found');
      } else {
        setSearchStatus('not_found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage({ type: 'error', text: 'Error searching user (Check if admin or indexed)' });
      setSearchStatus('idle');
    }
  };

  const handleTogglePremium = async () => {
    if (!foundUser) return;
    setIsUpdating(true);
    const newTier = foundUser.tier === 'premium' ? 'free' : 'premium';

    try {
      const userRef = doc(db, 'users', foundUser.id);
      await updateDoc(userRef, {
        subscriptionTier: newTier
      });
      
      setFoundUser({ ...foundUser, tier: newTier });
      setMessage({ 
        type: 'success', 
        text: `Berhasil! Status ${foundUser.email} sekarang: ${newTier.toUpperCase()}` 
      });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Gagal mengupdate status user' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetUsage = async () => {
    if (!foundUser) return;
    setIsUpdating(true);

    try {
      const userRef = doc(db, 'users', foundUser.id);
      await updateDoc(userRef, {
        usageCount: 0
      });
      
      setFoundUser({ ...foundUser, usageCount: 0 });
      setMessage({ 
        type: 'success', 
        text: `Berhasil! Kuota trial ${foundUser.email} telah direset.` 
      });
    } catch (error) {
      console.error('Reset error:', error);
      setMessage({ type: 'error', text: 'Gagal mereset kuota trial' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-black border-2 border-neon/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(201,255,0,0.05)]">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-neon rounded-lg text-black">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Alan_Control_Panel</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Admin Management Console</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block italic">Cari_User_Berdasarkan_Email</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="email"
              placeholder="Masukan email pembeli..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-[#111] border border-studio-border rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-neon outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={searchStatus === 'searching'}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded-xl font-black uppercase italic text-xs tracking-widest transition-all disabled:opacity-50"
          >
            {searchStatus === 'searching' ? '...' : 'Cari'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {searchStatus === 'not_found' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase italic tracking-widest bg-red-400/5 p-3 rounded-lg border border-red-400/20"
            >
              <AlertCircle size={14} /> User tidak ditemukan
            </motion.div>
          )}

          {foundUser && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-black italic">
                    {foundUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold truncate max-w-[150px] md:max-w-none">{foundUser.email}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic">
                      Tier: <span className={foundUser.tier === 'premium' ? "text-neon" : "text-zinc-600"}>{foundUser.tier.toUpperCase()}</span>
                      {foundUser.tier === 'free' && (
                        <span className="ml-2 text-zinc-400">({foundUser.usageCount}/10 Trial)</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {foundUser.tier === 'free' && foundUser.usageCount > 0 && (
                    <button 
                      onClick={handleResetUsage}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-lg font-black uppercase italic text-[10px] tracking-widest bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                    >
                      Reset Trial
                    </button>
                  )}
                  <button 
                    onClick={handleTogglePremium}
                    disabled={isUpdating}
                    className={cn(
                      "px-4 py-2 rounded-lg font-black uppercase italic text-[10px] tracking-widest transition-all",
                      foundUser.tier === 'premium' 
                        ? "bg-zinc-800 text-zinc-400 hover:bg-red-900/20 hover:text-red-400" 
                        : "bg-neon text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(201,255,0,0.2)]"
                    )}
                  >
                    {isUpdating ? 'Wait...' : foundUser.tier === 'premium' ? 'Deactivate Pro' : 'Aktifkan Pro'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border text-[10px] font-bold uppercase italic tracking-widest",
                message.type === 'success' ? "bg-neon/10 border-neon/20 text-neon" : "bg-red-400/10 border-red-400/20 text-red-400"
              )}
            >
              {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
