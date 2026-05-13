import React, { useState } from 'react';
import { Mic, Radio, Settings, User, Signal, Cpu, Headphones, ChevronRight } from 'lucide-react';
import AudioEditor from '@/src/components/AudioEditor';
import ScriptEditor from '@/src/components/ScriptEditor';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library'>('studio');
  
  return (
    <div className="min-h-screen flex flex-col studio-grid font-sans selection:bg-neon selection:text-black">
      {/* Top Navigation */}
      <header className="h-24 border-b border-studio-border bg-black/90 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-neon rounded-full flex items-center justify-center text-black font-black italic shadow-[0_0_30px_rgba(201,255,0,0.2)]">
            VO
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
              Studio<span className="text-neon">_Pro</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-black tracking-[0.4em] uppercase">Enterprise_Engine_v1.0</p>
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

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-studio-bg border border-studio-border">
            <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_#C9FF00]" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SYSTEM_LIVE</span>
          </div>
          <button className="text-zinc-500 hover:text-neon transition-colors">
            <Settings size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-neon">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 max-w-[1600px] mx-auto w-full overflow-hidden">
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
                <section className="space-y-10">
                  <div className="flex items-end justify-between border-b border-studio-border pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-neon rounded-full animate-pulse" />
                         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Production_Environment_Console</p>
                      </div>
                      <h2 className="text-6xl font-black tracking-tight uppercase italic text-white flex items-baseline gap-4">
                        Record<span className="text-neon">_Desk</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest italic border border-studio-border px-6 py-3 rounded-2xl bg-black/50">
                      <span className="flex items-center gap-2 decoration-neon hover:underline cursor-none transition-all"><Signal size={14} className="text-neon" /> 48khz_HD</span>
                      <div className="w-px h-4 bg-zinc-800" />
                      <span className="flex items-center gap-2 transition-all"><Cpu size={14} className="text-neon" /> AI_Engine_v2</span>
                    </div>
                  </div>

                  <AudioEditor />
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-[#000] border border-studio-border group hover:border-neon/50 transition-all cursor-pointer shadow-xl hover:shadow-neon/5">
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

              {/* Right Column: AI Script Assistant */}
              <div className="lg:col-span-4 h-full flex flex-col">
                <section className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
                  <ScriptEditor />
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
                  <div key={i} className="bg-black border border-studio-border p-6 rounded-2xl hover:border-neon transition-all group cursor-pointer">
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

      {/* Status Footer */}
      <footer className="h-14 border-t border-studio-border bg-black flex items-center justify-between px-10">
        <div className="flex gap-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-neon rounded-full recording-indicator-neon" />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Live_Signal: Active</span>
          </div>
          <div className="flex items-center gap-3">
            <Headphones size={14} className="text-zinc-600" />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Input_Monitor: enabled</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest italic">Latency: 4.2ms</span>
          <div className="h-5 w-px bg-studio-border" />
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter">Volume</span>
            <div className="w-32 h-[2px] bg-studio-border"><div className="bg-neon h-full w-2/3 shadow-[0_0_10px_#C9FF00]"></div></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

