import React, { useState, useRef } from 'react';
import { Play, Download, Loader2, Volume2, Mic2, Sparkles, MessageSquareQuote } from 'lucide-react';
import { generateSpeech, pcmToWav, VoiceName } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceStudioProps {
  onExport: (blob: Blob, fileName: string, duration: string) => void;
  isPremium: boolean;
  onShowSubscription: () => void;
}

const VOICES: { id: VoiceName; name: string; desc: string }[] = [
  { id: 'Kore', name: 'Kore (Default)', desc: 'Tenang & Berwibawa' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Energik & Dinamis' },
  { id: 'Puck', name: 'Puck', desc: 'Ramah & Ceria' },
  { id: 'Charon', name: 'Charon', desc: 'Dalam & Dramatis' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Modern & Santai' },
];

export default function VoiceStudio({ onExport, isPremium, onShowSubscription }: VoiceStudioProps) {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (!isPremium && text.length > 100) {
      onShowSubscription();
      return;
    }

    setIsGenerating(true);
    try {
      const base64 = await generateSpeech(text, selectedVoice);
      if (base64) {
        const blob = pcmToWav(base64);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        
        // Auto play
        setTimeout(() => {
          if (audioRef.current) audioRef.current.play();
        }, 100);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal generate Voice Over. Coba lagi nanti atau cek kuota Gemini Anda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `VO_FASIH_${new Date().getTime()}.wav`;
      link.click();

      if (audioBlob) {
        onExport(audioBlob, `VO_FASIH_${new Date().getTime()}.wav`, 'AI_GEN');
      }
    }
  };

  const clear = () => {
    setText('');
    setAudioUrl(null);
    setAudioBlob(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-black/40 border border-studio-border p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-neon/20 rounded-xl flex items-center justify-center text-neon shadow-[0_0_20px_rgba(34,255,160,0.2)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Voice_Over_Fasih</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">AI-Powered Fluent Narrative Studio</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik teks di sini (misal: 'Halo semuanya, selamat datang di podcast Alan Media!')"
              className="w-full h-40 bg-zinc-900/50 border border-studio-border rounded-2xl p-6 text-sm text-zinc-300 focus:outline-none focus:border-neon transition-all font-medium placeholder:text-zinc-700 resize-none"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase italic ${text.length > 500 ? 'text-red-500' : 'text-zinc-600'}`}>
                {text.length} / {isPremium ? '2000' : '100'} Simbol
              </span>
              {!isPremium && (
                <button 
                  onClick={onShowSubscription}
                  className="text-[9px] font-black text-neon uppercase italic hover:underline"
                >
                  UPGRADE_FOR_MORE
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all text-left group",
                  selectedVoice === v.id 
                    ? "bg-neon border-neon text-black" 
                    : "bg-black/50 border-studio-border text-zinc-500 hover:border-neon/30 hover:text-zinc-300"
                )}
              >
                <div className="text-[11px] font-black uppercase italic mb-1">{v.name}</div>
                <div className={cn("text-[8px] font-bold uppercase italic", selectedVoice === v.id ? "text-black/60" : "text-zinc-700")}>
                  {v.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-studio-border">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="px-8 py-4 bg-neon text-black rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_10px_30px_rgba(34,255,160,0.3)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate_Studio_Voice
                </>
              )}
            </button>

            {audioUrl && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => audioRef.current?.play()}
                  className="w-12 h-12 bg-white/5 border border-studio-border rounded-xl flex items-center justify-center text-neon hover:border-neon transition-all"
                >
                  <Play size={20} />
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-4 bg-zinc-900 border border-studio-border rounded-xl text-xs font-black uppercase italic text-zinc-500 hover:text-white hover:border-white transition-all flex items-center gap-2"
                >
                  <Download size={16} /> Save_To_Vault
                </button>
                <button
                  onClick={clear}
                  className="text-[10px] font-black text-zinc-700 uppercase italic hover:text-red-500 transition-all ml-2"
                >
                  Discard
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-studio-border p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
             <MessageSquareQuote size={18} className="text-neon" />
             <h4 className="text-xs font-black uppercase italic text-white tracking-widest">Sample_Scripts</h4>
          </div>
          <div className="space-y-3">
            {[
              "Selamat pagi Alan, apa kabar hari ini? Semoga aktivitas mu lancar ya!",
              "Terimakasih sudah menggunakan aplikasi Alan Media Player PRO. Suara ini sangat fasih bukan?",
              "Patah hati memang berat, tapi suara AI ini akan selalu menemani perjuangan mu."
            ].map((s, i) => (
              <button 
                key={i}
                onClick={() => setText(s)}
                className="w-full text-left p-4 rounded-xl bg-black/30 border border-studio-border/50 text-[11px] text-zinc-500 font-medium hover:border-neon/40 hover:text-zinc-300 transition-all italic line-clamp-1"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-neon/5 to-transparent border border-studio-border p-6 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={16} className="text-neon" />
            <h4 className="text-[10px] font-black uppercase italic text-neon tracking-widest">Advanced_Engine</h4>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium italic leading-relaxed">
            Engine 'Fasih' menggunakan model Gemini 3.1 Flash terbaru untuk intonasi yang lebih humanis dan natural (tidak kaku seperti robot standar).
          </p>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
