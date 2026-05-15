import React, { useState } from 'react';
import { Mic, Radio, Settings, User, Signal, Cpu, Headphones, ChevronRight, LogIn, LogOut, Crown, Menu, Info, X, Trash2, Sparkles } from 'lucide-react';
import AudioEditor from '@/src/components/AudioEditor';
import Teleprompter from '@/src/components/Teleprompter';
import VoiceStudio from '@/src/components/VoiceStudio';
import { motion, AnimatePresence } from 'motion/react';
import { useUserTier } from './hooks/useUserTier';
import { useAudioHistory } from './hooks/useAudioHistory';
import UserGuideModal from './components/UserGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'voice'>('studio');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const { user, profile, loading, incrementUsage, usageCount, upgrade, unlockWithCode } = useUserTier();
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
              <a href="https://voice-over-fasih.vercel.app/" target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-1 text-blue-400/50 hover:text-blue-400 transition-colors">
                (Backup_Mirror)
              </a>
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
            Media_Library ({recordings.length})
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className={`px-8 py-2 text-[11px] font-black tracking-widest uppercase transition-all italic border-b-2 relative ${activeTab === 'voice' ? 'border-neon text-neon' : 'border-transparent text-zinc-500 hover:text-white'}`}
          >
            Voice_Lab
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[7px] px-1 rounded animate-pulse">FASIH</span>
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
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-studio-bg border border-neon/20">
            <div className={`w-2 h-2 ${isPremium ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-neon shadow-[0_0_10px_#C9FF00]'} rounded-full animate-pulse`} />
            <span className="text-[10px] font-black text-neon uppercase tracking-widest flex items-center gap-2">
              {profile ? `${profile.subscriptionTier.toUpperCase()}_Access` : 'GUEST_ACCESS'}
              {isPremium && <Crown size={12} className="fill-neon text-black" />}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-12 max-w-[1600px] mx-auto w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'studio' ? (
            <motion.div 
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-12 h-full"
            >
              {/* Teleprompter Console - Now at the Top */}
              <section className="w-full">
                <Teleprompter 
                  tier={profile?.subscriptionTier} 
                  onShowSubscription={() => setIsActivationModalOpen(true)} 
                />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Icons Rack */}
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

                {/* Recording Console (Master Rack) - Now below teleprompter */}
                <div className="lg:col-span-11 space-y-12 h-full flex flex-col">
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
                      <div className="flex flex-wrap gap-2">
                        <p className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic bg-neon/10 w-fit px-3 py-1 rounded-full border border-neon/20">
                          ⚡ {isPremium ? 'Unrestricted_Vocal_Engine_Active' : `Free_Trial: ${usageCount}/10 Tries_Left`}
                        </p>
                        {!isPremium && (
                          <button 
                            onClick={() => setIsActivationModalOpen(true)}
                            className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] italic bg-blue-400/10 w-fit px-3 py-1 rounded-full border border-blue-400/20 hover:bg-blue-400 hover:text-black transition-all"
                          >
                            UPGRADE_TO_PRO
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest italic border border-studio-border px-6 py-3 rounded-2xl bg-black/50">
                      <span className="flex items-center gap-2 decoration-neon hover:underline cursor-none transition-all"><Signal size={14} className="text-neon" /> 48khz_Lossless</span>
                      <div className="w-px h-4 bg-zinc-800" />
                      <span className="flex items-center gap-2 transition-all"><Cpu size={14} className="text-neon" /> Clear_VO_v4.2</span>
                    </div>
                  </div>

                  <AudioEditor 
                    tier={profile?.subscriptionTier || 'free'} 
                    user={user as any}
                    onShowSubscription={() => setIsActivationModalOpen(true)}
                    usageCount={usageCount}
                    incrementUsage={incrementUsage}
                    onAudioDataChanges={(blob) => {
                       // Optional: autosave or handle preview
                    }}
                    onExport={(blob, name, duration) => handleExport(blob, name, duration)}
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
            </div>
          </motion.div>
          ) : activeTab === 'library' ? (
            <motion.div 
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full space-y-8"
            >
              <div className="flex items-end justify-between border-b border-studio-border pb-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Storage_Archive</p>
                  <h2 className="text-5xl font-black tracking-tight uppercase italic text-white">Media_Vault</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-black text-neon uppercase tracking-widest italic">
                    {recordings.length}_SESSIONS_FOUND
                  </div>
                  {recordings.length > 0 && (
                    <button 
                      onClick={clearAllRecordings}
                      className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest border border-red-500/10 hover:border-red-500/30 px-3 py-1 rounded-full transition-all"
                    >
                      Clear_All_Vault
                    </button>
                  )}
                </div>
              </div>

              {recordings.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-40">
                    <Headphones size={48} className="text-zinc-700" />
                    <p className="text-xs text-zinc-500 max-w-sm font-medium uppercase tracking-widest italic">Belum ada rekaman tersimpan. Record atau upload file dan klik 'Export' untuk menyimpan di sini.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recordings.map((item) => (
                    <div key={item.id} className="bg-black border border-studio-border p-6 rounded-2xl hover:border-neon transition-all group relative">
                      <button 
                        onClick={() => {
                          if (window.confirm('Hapus rekaman ini dari Vault?')) {
                             deleteRecording(item.id);
                          }
                        }}
                        className="absolute top-4 right-4 p-2 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                         <Trash2 size={16} />
                      </button>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neon">
                           <Headphones size={20} />
                        </div>
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest pt-1">{item.size}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase italic truncate pr-8">{item.name}</h3>
                      <div className="flex justify-between items-center mt-6">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">{item.date}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-neon uppercase">{item.duration}</span>
                           <span className="text-[8px] font-bold text-zinc-800 uppercase bg-zinc-900 px-1 rounded">{item.format}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recordings.length > 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic">End_of_Vault_System</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="voice"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12 h-full overflow-y-auto"
            >
               <div className="flex items-end justify-between border-b border-studio-border pb-6">
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">AI_Vocal_Synthesis</p>
                  <h2 className="text-5xl font-black tracking-tight uppercase italic text-white flex items-center gap-4">
                     Voice<span className="text-neon">_Lab</span>
                  </h2>
                </div>
              </div>

              <VoiceStudio 
                isPremium={isPremium}
                onShowSubscription={() => setIsActivationModalOpen(true)}
                onExport={(blob, name, duration) => handleExport(blob, name, duration)}
              />
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
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-black truncate max-w-[150px]">{user?.email || 'Guest_Member'}</p>
                      <p className="text-[9px] text-neon uppercase font-black tracking-widest italic tracking-tighter">
                        {isPremium ? 'Premium_Pipeline_Active' : `Trial_Status: ${usageCount}/10`}
                      </p>
                    </div>
                  </div>
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
                    <Headphones size={18} /> Media_Library ({recordings.length})
                  </button>
                  <button 
                    onClick={() => { setActiveTab('voice'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all relative ${activeTab === 'voice' ? 'bg-neon text-black' : 'text-zinc-500 hover:bg-white/5'}`}
                  >
                    <Sparkles size={18} /> Voice_Lab
                    <span className="absolute top-2 right-4 bg-red-500 text-white text-[6px] px-1 rounded">FASIH</span>
                  </button>
                  <button 
                    onClick={() => { setIsUserGuideOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest text-zinc-500 hover:bg-white/5 transition-all"
                  >
                    <Info size={18} /> Panduan_Pengguna
                  </button>
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


