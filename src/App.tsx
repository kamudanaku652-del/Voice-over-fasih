import React, { useState } from 'react';
import { Mic, Signal, Cpu, Headphones, Crown, Info, X, Trash2 } from 'lucide-react';
import AudioEditor from '@/src/components/AudioEditor';
import Teleprompter from '@/src/components/Teleprompter';
import { motion, AnimatePresence } from 'motion/react';
import { useUserTier } from './hooks/useUserTier';
import { useAudioHistory } from './hooks/useAudioHistory';
import UserGuideModal from './components/UserGuideModal';

export default function App() {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const { user, profile, incrementUsage, usageCount, unlockWithCode } = useUserTier();
  const { recordings, saveRecording, deleteRecording, clearAllRecordings } = useAudioHistory(user?.uid);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  const handleActivation = async () => {
    try {
      setActivationError('');
      const success = await unlockWithCode(activationCode);
      if (success) {
        setIsActivationModalOpen(false);
        setActivationCode('');
        alert('Selamat! Akun Anda sekarang PREMIUM ✨');
      }
    } catch (err: any) {
      setActivationError(err.message);
    }
  };

  const isPremium = profile?.subscriptionTier === 'premium';
  const isOwner = profile?.role === 'admin';
  const isLimitReached = !isPremium && usageCount >= 10;

  const handleExport = async (blob: Blob, name: string, duration: string) => {
    const sizeStr = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';
    await saveRecording({
      name,
      date: new Date().toISOString().split('T')[0],
      size: sizeStr,
      duration,
      format: 'wav'
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col studio-grid font-sans selection:bg-neon selection:text-black">
      {/* Top Navigation */}
      <header className="h-20 md:h-24 border-b border-studio-border bg-black/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-neon rounded-full flex items-center justify-center text-black font-black italic shadow-[0_0_30px_rgba(201,255,0,0.2)] text-sm md:text-base">
            VO
          </div>
          <div className="hidden xs:block">
            <h1 className="text-xl md:text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
              Alan<span className="text-neon hidden sm:inline">_Voice_Edit</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-zinc-500 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase flex items-center gap-2">
              Pro_Audio_Mastering_Suite_v1.0 
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setIsUserGuideOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-neon transition-colors border border-white/5 rounded-full"
          >
            <Info size={14} />
            {lang === 'id' ? 'INFO' : 'GUIDE'}
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-studio-bg border border-neon/20">
            <div className={`w-2 h-2 ${isPremium ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-neon shadow-[0_0_10px_#C9FF00]'} rounded-full animate-pulse`} />
            <span className="text-[10px] font-black text-neon uppercase tracking-widest flex items-center gap-2">
              {isPremium ? 'PRO_ACTIVE' : 'LITE_VERSION'}
              {isPremium && <Crown size={12} className="fill-neon text-black" />}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-12 max-w-[1400px] mx-auto w-full overflow-hidden relative">
        <div className="flex flex-col gap-10">
          {/* Teleprompter Console - Minimalist */}
          <section className="w-full">
            <Teleprompter 
              tier={profile?.subscriptionTier} 
              onShowSubscription={() => setIsActivationModalOpen(true)} 
            />
          </section>

          {/* Master Editor Console */}
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b border-studio-border pb-6">
              <div className="space-y-1">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic text-white">
                  Audio<span className="text-neon">_Engine</span>
                </h2>
                {!isPremium && (
                  <button 
                    onClick={() => setIsActivationModalOpen(true)}
                    className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] italic hover:underline"
                  >
                    Unlock_Pro_Features_⚡
                  </button>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-50">
                <span className="flex items-center gap-2"><Signal size={12} className="text-neon" /> 48khz_HD</span>
                <span className="flex items-center gap-2"><Cpu size={12} className="text-neon" /> Neural_FX</span>
              </div>
            </div>

            <AudioEditor 
              tier={profile?.subscriptionTier || 'free'} 
              user={user as any}
              onShowSubscription={() => setIsActivationModalOpen(true)}
              usageCount={usageCount}
              incrementUsage={incrementUsage}
              onAudioDataChanges={(blob) => {}}
              onExport={(blob, name, duration) => handleExport(blob, name, duration)}
            />
          </section>

          {/* Minimal Library Section (at bottom) */}
          {recordings.length > 0 && (
            <section className="pt-10 border-t border-studio-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase italic text-zinc-500">History_Vault</h3>
                <button 
                  onClick={clearAllRecordings}
                  className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest"
                >
                  Clear_Storage
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recordings.map((item) => (
                  <div key={item.id} className="bg-black border border-studio-border p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-neon transition-colors">
                          <Headphones size={16} />
                       </div>
                       <div>
                         <p className="text-[11px] font-black text-white uppercase truncate max-w-[120px]">{item.name}</p>
                         <p className="text-[8px] text-zinc-600 font-bold">{item.duration} • {item.size}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => deleteRecording(item.id)}
                         className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Subscription Modal */}
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-studio-bg border-r border-studio-border z-[101] p-8 space-y-10 lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-neon rounded-full flex items-center justify-center text-black font-black italic">VO</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <nav className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setIsUserGuideOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest text-zinc-500 hover:bg-white/5 transition-all"
                  >
                    <Info size={18} /> Panduan_Pengguna
                  </button>
                  {!isPremium && (
                    <button 
                      onClick={() => { setIsActivationModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest text-neon bg-neon/10 border border-neon/20 transition-all"
                    >
                      <Crown size={18} /> AKTIVASI_PRO
                    </button>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isActivationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-neon shadow-[0_0_15px_rgba(180,255,0,0.5)]" />
              
              <button 
                onClick={() => setIsActivationModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-neon/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neon/20">
                  <Crown size={32} className="text-neon fill-neon" />
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tight mb-2 uppercase">Aktivasi_Premium</h2>
                <p className="text-zinc-400 text-sm font-medium">Masukkan kode lisensi untuk membuka <span className="text-neon">Engine_Vocal</span> tak terbatas.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block ml-1">Authentication_Key</label>
                  <input 
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="ENTER_PRO_CODE"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white font-mono text-center tracking-[0.3em] focus:border-neon focus:ring-1 focus:ring-neon transition-all uppercase placeholder:text-zinc-800"
                  />
                  {activationError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest text-center"
                    >
                      ⚠️ ERROR: {activationError}
                    </motion.p>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleActivation}
                    className="group relative w-full py-4 bg-neon text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs overflow-hidden shadow-[0_0_30px_rgba(180,255,0,0.2)]"
                  >
                    <span className="relative z-10">Activate_Engine_v1.0</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-zinc-800 mt-6">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold mb-3 tracking-widest">Belum punya kode akses?</p>
                  <a 
                    href="https://wa.me/628123456789" // TODO: Update with user's actual WA
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-neon text-[10px] uppercase font-black hover:underline tracking-widest bg-neon/10 px-4 py-2 rounded-full border border-neon/20 hover:bg-neon/20 transition-all"
                  >
                    Hubungi Admin_Sales ⚡
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserGuideModal 
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        lang={lang}
      />

      {/* Status Footer */}
      <footer className="h-14 border-t border-studio-border bg-black flex items-center justify-between px-4 md:px-10">
        <div className="flex gap-4 md:gap-10">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="w-2 h-2 bg-neon rounded-full recording-indicator-neon" />
            <span className="text-[9px] md:text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Live: Active</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
             <Signal size={10} className="text-neon" />
             <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">System_Status: Standalone_Stable</span>
          </div>
          <div className="hidden xs:flex items-center gap-3">
            <Headphones size={14} className="text-zinc-600" />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic md:block hidden">Input_Monitor: enabled</span>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic md:hidden block">Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown size={12} className="text-neon" />
            <span className="text-[9px] font-black text-neon uppercase tracking-widest italic">Premium_Pipeline_Active</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <span className="text-[9px] md:text-[11px] font-black text-zinc-600 uppercase tracking-widest italic">4.2ms</span>
          <div className="hidden sm:block h-5 w-px bg-studio-border" />
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter">Volume</span>
            <div className="w-24 md:w-32 h-[2px] bg-studio-border"><div className="bg-neon h-full w-2/3 shadow-[0_0_10px_#C9FF00]"></div></div>
          </div>
        </div>
      </footer>
    </div>
  );
}


