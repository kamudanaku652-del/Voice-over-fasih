import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Type, Gauge, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TeleprompterProps {
  onTextChange?: (text: string) => void;
  tier?: string;
  onShowSubscription?: () => void;
}

export default function Teleprompter({ onTextChange, tier, onShowSubscription }: TeleprompterProps) {
  const isPremium = tier === 'premium';
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1-10 scale
  const [fontSize, setFontSize] = useState(32); // px
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMirror, setIsMirror] = useState(false);
  const [isVoiceSync, setIsVoiceSync] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      scrollIntervalRef.current = window.setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          container.scrollTop += speed / 2;
          
          // Check if reached end
          if (container.scrollHeight - container.scrollTop <= container.clientHeight + 1) {
            setIsPlaying(false);
          }
        }
      }, 30);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const clearText = () => {
    if (window.confirm('Hapus seluruh teks?')) {
      setText('');
      handleReset();
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xl transition-all duration-500",
      isFullScreen ? "fixed inset-0 z-[100] rounded-none !h-screen" : "h-[600px]"
    )}>
      {/* Header / Controls */}
      <div className="p-4 md:p-6 border-b border-zinc-100 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-black italic underline underline-offset-8 decoration-neon">Teleprompter_Pro</h3>
          <div className="h-6 w-px bg-zinc-200" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Type size={14} className="text-zinc-400" />
              <input 
                type="range" min="16" max="72" step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-20 md:w-32 accent-black h-1 bg-zinc-100 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-zinc-400 w-6">{fontSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-zinc-400" />
              <input 
                type="range" min="0.5" max="10" step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-20 md:w-32 accent-black h-1 bg-zinc-100 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-zinc-400 w-6">{speed.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
               <button 
                  onClick={() => {
                    if (!isPremium) {
                      onShowSubscription?.();
                      return;
                    }
                    setIsMirror(!isMirror);
                  }}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest italic rounded-md transition-all",
                    isMirror ? "bg-black text-white" : "text-zinc-400 hover:text-black"
                  )}
               >
                 Mirror
               </button>
               <button 
                  onClick={() => {
                    if (!isPremium) {
                      onShowSubscription?.();
                      return;
                    }
                    setIsVoiceSync(!isVoiceSync);
                  }}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest italic rounded-md transition-all flex items-center gap-1",
                    isVoiceSync ? "bg-neon text-black" : "text-zinc-400 hover:text-black"
                  )}
               >
                 {isVoiceSync ? <Mic size={10} /> : null} Voice_Sync
               </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
             onClick={toggleFullScreen}
             className="p-2 text-zinc-400 hover:text-black transition-colors"
             title={isFullScreen ? "Minimize" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
             onClick={clearText}
             className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
             title="Clear Text"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "relative flex-1 overflow-hidden group bg-white",
        isMirror && "scale-x-[-1]"
      )}>
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto custom-scrollbar scroll-smooth"
        >
          {text.trim() === '' ? (
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onTextChange?.(e.target.value);
              }}
              placeholder="TEMPELKAN NASKAH ANDA DI SINI... (Tanpa Batas Teks)"
              className="w-full h-full bg-transparent p-8 md:p-12 text-black font-black italic uppercase tracking-tighter text-2xl md:text-3xl focus:outline-none placeholder:text-zinc-200 resize-none"
            />
          ) : (
            <div 
              className="p-8 md:p-[20vh] pb-[50vh] text-center"
              style={{ fontSize: `${fontSize}px` }}
              onClick={() => isPlaying && setIsPlaying(false)}
            >
              <div 
                className="font-black italic text-black uppercase tracking-tighter leading-tight whitespace-pre-wrap select-none transition-all"
                dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }}
              />
            </div>
          )}
        </div>

        {/* Focus Guides */}
        <div className="absolute top-1/2 left-0 right-0 h-24 -translate-y-1/2 border-y border-zinc-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-200 tracking-widest uppercase italic rotate-90">Focus_Line</div>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-200 tracking-widest uppercase italic -rotate-90">Focus_Line</div>
        </div>

        {/* Playback Overlay Controls (Only visible when has text) */}
        {text.trim() !== '' && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-zinc-200 shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
            <button 
              onClick={handleReset}
              className="p-2 text-zinc-400 hover:text-black transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 flex items-center justify-center bg-black rounded-full text-white hover:scale-110 active:scale-95 transition-all shadow-xl"
            >
              {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
            </button>
            <button 
              onClick={() => setText('')}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-zinc-100 bg-white flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
          [MODE_{isPlaying ? 'READ_SCROLLING' : 'EDIT_IDLE'}]
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
          Characters: {text.length} | Lines: {text.split('\n').length}
        </span>
      </div>
    </div>
  );
}
