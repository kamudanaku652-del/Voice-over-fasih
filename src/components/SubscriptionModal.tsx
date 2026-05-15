import React from 'react';
import { Check, X, Star, Zap, ShieldCheck, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  usageCount: number;
  onUpgrade?: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, userId, usageCount, onUpgrade }: SubscriptionModalProps) {
  const handleUpgrade = async () => {
    if (!userId) {
      alert('Silakan login terlebih dahulu untuk mengaktifkan fitur PRO. Cukup klik tombol Login di pojok kanan atas aplikasi.');
      return;
    }
    
    if (onUpgrade) {
      onUpgrade();
      alert('Selamat! Anda sekarang adalah member PRO. (Data tersimpan di browser ini)');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLimitReached = usageCount >= 10;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative bg-[#050505] border border-white/5 w-full max-w-5xl p-8 md:p-16 rounded-[60px] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(201,255,0,0.1)_0%,transparent_60%)] pointer-events-none" />

          <button onClick={onClose} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors z-20">
            <X size={32} strokeWidth={1} />
          </button>

          <div className="text-center space-y-6 mb-20 relative z-10">
            <div className="inline-block px-4 py-1.5 bg-neon/10 border border-neon/30 rounded-full text-neon text-[9px] font-black uppercase tracking-[0.4em] italic mb-4">
              {isLimitReached ? "LIMIT_TERCAPAI" : "STUDIO_ACCESS"}
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
              {isLimitReached ? "Waktunya_Jadi" : "Tingkatkan"}<br/>
              <span className="text-neon underline decoration-neon/20 underline-offset-8">Profesional_Audio</span>
            </h2>
            <p className="text-zinc-500 font-black uppercase italic tracking-[0.2em] text-xs">
              {isLimitReached 
                ? "Sesi uji coba 10x Anda telah berakhir. Upgrade untuk akses tak terbatas."
                : "Dapatkan kualitas studio radio premium dalam satu klik."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {/* Trial Tier */}
            <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[40px] space-y-8 flex flex-col justify-between group hover:border-white/10 transition-colors text-left">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">User_Baru</span>
                  <h3 className="text-4xl font-black italic text-zinc-400 uppercase">Edisi_Trial</h3>
                </div>
                
                <div className="text-5xl font-black text-zinc-200 italic">10<span className="text-sm text-zinc-600 font-bold ml-2">SESI_MASTERING</span></div>

                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-zinc-700 transition-all duration-1000" 
                    style={{ width: `${Math.min(usageCount * 10, 100)}%` }}
                   />
                </div>
                <p className="text-[10px] font-black text-zinc-600 uppercase italic tracking-widest">
                  Sisa_Trial: {Math.max(0, 10 - usageCount)} Penggunaan
                </p>

                <ul className="space-y-4 pt-6">
                   {[
                     'Hardware Processing Dasar',
                     'Perekaman Audio Standar',
                     'Denoise Level 1',
                     '10x Kuota Export'
                   ].map((feat, i) => (
                     <li key={i} className="flex items-center gap-4 text-xs text-zinc-500 font-black uppercase italic tracking-wider">
                       <Check size={16} className="text-zinc-700" /> {feat}
                     </li>
                   ))}
                </ul>
              </div>

              <button 
                disabled={isLimitReached}
                onClick={onClose}
                className="w-full py-5 rounded-3xl border border-zinc-800 text-zinc-600 font-black uppercase italic tracking-widest hover:bg-white/5 transition-all text-[10px] disabled:opacity-20"
              >
                {isLimitReached ? "LIMIT_EXCEEDED" : "SUDAH_MEMILIKI_TRIAL"}
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-black border-2 border-neon p-10 rounded-[40px] space-y-10 relative shadow-[0_0_100px_rgba(201,255,0,0.15)] flex flex-col justify-between group text-left">
              <div className="absolute -top-5 right-10 bg-neon px-6 py-2 rounded-full text-black font-black uppercase italic text-[11px] tracking-widest shadow-[0_0_40px_#C9FF00] z-20">
                PRO_CHOICE
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon italic">Ultimate_Control</span>
                  <h3 className="text-4xl font-black italic text-white uppercase">Pro_Access</h3>
                </div>

                <div className="text-5xl font-black text-white italic">Rp39rb<span className="text-sm text-zinc-600 font-bold ml-2">/BULAN</span></div>

                <ul className="space-y-5 pt-6">
                   {[
                     'Unlimited Sessions (No Limits)',
                     'AI Neural Denoiser (Studio Grade)',
                     'Voice Morphing & Pitch Shifting',
                     'Custom EQ: Podcast & Radio DJ',
                     'Mirror Mode for Teleprompter',
                     'Voice-Sync Auto Scrolling',
                     'Priority Export 24-bit Lossless',
                     'No Audio Watermarks'
                   ].map((feat, i) => (
                     <li key={i} className="flex items-center gap-4 text-xs text-white font-black italic uppercase tracking-wider">
                       <Zap size={18} className="text-neon fill-neon shadow-neon" /> {feat}
                     </li>
                   ))}
                </ul>
              </div>

              <div className="space-y-4 pt-10">
                <button 
                  onClick={handleUpgrade}
                  className="w-full py-6 rounded-3xl bg-neon text-black font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(201,255,0,0.4)] text-xs"
                >
                  AKTIFKAN_PRO_INSTAN
                </button>
                
                <a
                  href="https://t.me/voicelanedit"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 rounded-3xl bg-[#111] text-white font-black uppercase italic tracking-widest hover:bg-zinc-800 transition-all text-[10px] border border-white/5"
                >
                  <Send size={18} className="text-blue-500" />
                  BELI_VIA_TELEGRAM (SUPPORT_ALAN)
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
