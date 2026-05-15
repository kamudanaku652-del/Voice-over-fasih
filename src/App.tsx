import React, { useState } from 'react';
import { Mic, Radio, Settings, User, Signal, Cpu, Headphones, ChevronRight, LogIn, LogOut, Crown, Menu, Info, X } from 'lucide-react';
import AudioEditor from '@/src/components/AudioEditor';
import Teleprompter from '@/src/components/Teleprompter';
import AdminPanel from '@/src/components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useUserTier } from './hooks/useUserTier';
import SubscriptionModal from './components/SubscriptionModal';
import UserGuideModal from './components/UserGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library'>('studio');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const { user, profile, loading, incrementUsage } = useUserTier();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  const usageCount = profile?.usageCount || 0;
  const isPremium = profile?.subscriptionTier === 'premium';
  const isLimitReached = !isPremium && usageCount >= 10;

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login error:', err);
      alert('Gagal login. Pastikan koneksi aman.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  return (
    <div className="min-h-screen flex flex-col studio-grid font-sans selection:bg-neon selection:text-black">
      {/* Top Navigation */}
      <header className="h-20 md:h-24 border-b border-studio-border bg-black/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-zinc-400 hover:text-neon transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-neon rounded-full flex items-center justify-center text-black font-black italic shadow-[0_0_30px_rgba(201,255,0,0.2)] text-sm md:text-base">
            VO
          </div>
          <div className="hidden xs:block">
            <h1 className="text-xl md:text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
              Alan<span className="text-neon hidden sm:inline">_Voice_Edit</span><span className="text-neon sm:hidden">_VO</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-zinc-500 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase flex items-center gap-2">
              Enterprise_Engine_v1.0 
              <span className="hidden xs:inline-flex items-center gap-1 text-neon/50 bg-neon/5 px-2 py-0.5 rounded border border-neon/10">
                <Cpu size={8} /> Local_Edge_Processing
              </span>
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`px-8 py-2 text-[11px] font-black tracking-widest uppercase transition-all italic border-b-2 ${activeTab === 'studio' ? 'border-neon text-neon' : 'border-transparent text-zinc-500 hover:text-white'}`}
          >
            Studio_Console
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-8 py-2 text-[11px] font-black tracking-widest uppercase transition-all italic border-b-2 ${activeTab === 'library' ? 'border-neon text-neon' : 'border-transparent text-zinc-500 hover:text-white'}`}
          >
            Media_Library
          </button>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-neon hover:border-neon/30 transition-all"
          >
            <Settings size={12} />
            {lang === 'id' ? 'Bahasa: ID' : 'Lang: EN'}
          </button>
          <button 
            onClick={() => setIsUserGuideOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-neon transition-colors"
          >
            <Info size={14} />
            {lang === 'id' ? 'Panduan' : 'Guide'}
          </button>
          {!user ? (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-neon rounded-lg text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(201,255,0,0.2)]"
            >
              <LogIn size={14} />
              Login_Console
            </button>
          ) : (
            <>
              {profile?.subscriptionTier === 'free' && (
                <button 
                  onClick={() => setIsSubModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 border border-neon/30 bg-neon/5 text-neon rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-neon hover:text-black transition-all"
                >
                  <Crown size={14} />
                  Upgrade_Premium
                </button>
              )}
              <div className="hidden lg:flex flex-col items-end gap-1">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-studio-bg border border-studio-border">
                  <div className={`w-2 h-2 ${profile?.subscriptionTier === 'premium' ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-neon shadow-[0_0_10px_#C9FF00]'} rounded-full`} />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    {profile?.subscriptionTier}_Access
                    {isPremium && (
                      <span className="bg-blue-500 text-white text-[7px] font-bold px-1 rounded flex items-center gap-0.5">
                        <Crown size={8} className="fill-white" /> PRO
                      </span>
                    )}
                  </span>
                </div>
                {!isPremium && user && (
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic pr-1">
                    Trial_Usage: {usageCount}/10
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-500 transition-colors"
                title="Keluar"
              >
                <LogOut size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-neon overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User size={20} />}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-12 max-w-[1600px] mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'studio' ? (
            <motion.div 
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full"
            >
              {/* Left Column: Recording Console */}
              <div className="lg:col-span-1 border-r border-[#222] hidden lg:flex flex-col items-center py-6 gap-10">
                <div className="p-3 text-neon hover:scale-110 transition-transform cursor-pointer bg-neon/10 rounded-xl shadow-[0_0_20px_rgba(201,255,0,0.1)]">
                  <Mic size={24} />
                </div>
                <div className="p-3 text-zinc-600 hover:text-white transition-colors cursor-pointer hover:bg-white/5 rounded-xl">
                  <Radio size={24} />
                </div>
                <div className="p-3 text-zinc-600 hover:text-white transition-colors cursor-pointer hover:bg-white/5 rounded-xl">
                  <Headphones size={24} />
                </div>
                <div className="mt-auto p-3 text-zinc-800">
                   <div className="w-1 h-32 bg-zinc-900 rounded-full relative">
                      <div className="absolute top-1/2 left-0 w-full h-1/2 bg-neon rounded-full" />
                   </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-12 h-full flex flex-col">
                {profile?.role === 'admin' && (
                  <motion.section 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AdminPanel />
                  </motion.section>
                )}
                <section className="space-y-10">
                  <div className="flex items-end justify-between border-b border-studio-border pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-neon rounded-full animate-pulse" />
                         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">
                           {lang === 'id' ? 'ID_Documentary_Mode_Active' : 'Global_Cinema_Mastering_Active'}
                         </p>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic text-white flex items-baseline gap-4">
                        Master<span className="text-neon">_Rack</span>
                      </h2>
                      <p className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic bg-neon/10 w-fit px-3 py-1 rounded-full border border-neon/20">
                        ⚡ Proses edit otomatis & tidak perlu waktu lama
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest italic border border-studio-border px-6 py-3 rounded-2xl bg-black/50">
                      <span className="flex items-center gap-2 decoration-neon hover:underline cursor-none transition-all"><Signal size={14} className="text-neon" /> 48khz_Lossless</span>
                      <div className="w-px h-4 bg-zinc-800" />
                      <span className="flex items-center gap-2 transition-all"><Cpu size={14} className="text-neon" /> Clear_VO_v4.2</span>
                    </div>
                  </div>

                  <AudioEditor 
                    tier={profile?.subscriptionTier || 'free'} 
                    onShowSubscription={() => setIsSubModalOpen(true)}
                    usageCount={usageCount}
                    incrementUsage={incrementUsage}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="p-6 md:p-8 rounded-3xl bg-[#000] border border-studio-border group hover:border-neon/50 transition-all cursor-pointer shadow-xl hover:shadow-neon/5">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] border border-zinc-900 px-3 py-1 rounded-full">Algo_Isolate_v4</span>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform group-hover:text-neon" />
                      </div>
                      <h3 className="text-2xl font-black uppercase italic text-white">Denoise_X3</h3>
                      <p className="text-xs text-zinc-500 mt-3 font-medium leading-relaxed">Neural-net background isolation and hiss suppression.</p>
                      <div className="mt-6 w-full h-[3px] bg-zinc-900 rounded-full overflow-hidden">
                         <div className="w-2/3 h-full bg-neon group-hover:w-full transition-all duration-700" />
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#000] border border-studio-border group hover:border-neon/50 transition-all cursor-pointer shadow-xl hover:shadow-neon/5">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] border border-zinc-900 px-3 py-1 rounded-full">Analog_Mod_v2</span>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform group-hover:text-neon" />
                      </div>
                      <h3 className="text-2xl font-black uppercase italic text-white">Warm_Valve</h3>
                      <p className="text-xs text-zinc-500 mt-3 font-medium leading-relaxed">Tube-style saturation for rich, cinematic voice character.</p>
                      <div className="mt-6 w-full h-[3px] bg-zinc-900 rounded-full overflow-hidden">
                         <div className="w-1/2 h-full bg-neon group-hover:w-3/4 transition-all duration-700" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Teleprompter Console */}
              <div className="lg:col-span-4 h-full flex flex-col">
                <section className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
                  <Teleprompter 
                    tier={profile?.subscriptionTier} 
                    onShowSubscription={() => setIsSubModalOpen(true)} 
                  />
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-full space-y-8"
            >
              <div className="flex items-end justify-between border-b border-studio-border pb-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Storage_Archive</p>
                  <h2 className="text-5xl font-black tracking-tight uppercase italic text-white">Media_Vault</h2>
                </div>
                <div className="text-[10px] font-black text-neon uppercase tracking-widest italic">
                  3_SESSIONS_FOUND
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Commercial_Ad_V1.wav', date: '2024-05-12', size: '2.4 MB', duration: '00:45' },
                  { name: 'Podcast_Intro_Final.wav', date: '2024-05-10', size: '1.8 MB', duration: '00:15' },
                  { name: 'Documentary_Narration.wav', date: '2024-05-08', size: '4.2 MB', duration: '01:20' }
                ].map((item, i) => (
                  <div key={i} className="bg-black border border-studio-border p-6 rounded-2xl hover:border-neon transition-all group cursor-pointer" onClick={() => profile?.subscriptionTier === 'free' && setIsSubModalOpen(true)}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neon">
                         <Headphones size={20} />
                      </div>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{item.size}</span>
                    </div>
                    <h3 className="text-lg font-black uppercase italic truncate">{item.name}</h3>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-[10px] font-black text-zinc-500 uppercase">{item.date}</span>
                      <span className="text-[10px] font-black text-neon uppercase">{item.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-40">
                <p className="text-xs text-zinc-500 max-w-sm font-medium uppercase tracking-widest italic">Additional archives will appear here after export.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-neon">
                      {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : <User size={20} />}
                    </div>
                    <div>
                      <p className="text-white text-xs font-black truncate max-w-[150px]">{user?.email || 'Guest_Member'}</p>
                      <p className="text-[9px] text-neon uppercase font-black tracking-widest italic">{profile?.subscriptionTier || 'Free'}_Access</p>
                    </div>
                  </div>
                  {!isPremium && user && (
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-500 uppercase italic">Quota_Used</span>
                      <span className="text-[10px] font-black text-white italic">{usageCount}/10</span>
                    </div>
                  )}
                </div>

                <nav className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setActiveTab('studio'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${activeTab === 'studio' ? 'bg-neon text-black' : 'text-zinc-500 hover:bg-white/5'}`}
                  >
                    <Mic size={18} /> Studio_Console
                  </button>
                  <button 
                    onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${activeTab === 'library' ? 'bg-neon text-black' : 'text-zinc-500 hover:bg-white/5'}`}
                  >
                    <Headphones size={18} /> Media_Library
                  </button>
                  <button 
                    onClick={() => { setIsUserGuideOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest text-zinc-500 hover:bg-white/5 transition-all"
                  >
                    <Info size={18} /> Panduan_Pengguna
                  </button>
                </nav>
              </div>

              {!isPremium && user && (
                <button 
                  onClick={() => { setIsSubModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 bg-neon text-black rounded-xl font-black uppercase italic text-[10px] tracking-widest shadow-[0_0_30px_rgba(201,255,0,0.3)]"
                >
                  UPGRADE_TO_PRO
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="absolute bottom-10 left-8 right-8 flex items-center justify-center gap-3 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} /> Keluar_Console
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        userId={user?.uid}
        usageCount={usageCount}
      />

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
          <div className="hidden xs:flex items-center gap-3">
            <Headphones size={14} className="text-zinc-600" />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic md:block hidden">Input_Monitor: enabled</span>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic md:hidden block">Monitor</span>
          </div>
          {profile?.subscriptionTier === 'premium' && (
            <div className="flex items-center gap-2">
              <Crown size={12} className="text-blue-400" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic">Premium_Pipeline</span>
            </div>
          )}
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


