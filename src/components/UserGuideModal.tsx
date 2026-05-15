import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, Wand2, Download, Zap, ChevronRight, PlayCircle } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'id' | 'en';
}

export default function UserGuideModal({ isOpen, onClose, lang }: UserGuideModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Mic className="text-neon" size={24} />,
      title: lang === 'id' ? "Rekam Atau Unggah" : "Record or Upload",
      desc: lang === 'id' 
        ? "Mulai dengan menekan tombol Mic untuk merekam suara Anda secara langsung, atau klik 'Import' untuk mengunggah file audio."
        : "Start by pressing the Mic button to record directly, or click 'Import' to upload your existing audio files."
    },
    {
      icon: <Wand2 className="text-neon" size={24} />,
      title: lang === 'id' ? "Pilih Preset Mastering" : "Select Mastering Preset",
      desc: lang === 'id'
        ? "Gunakan 'Master Rack' untuk memilih karakter suara. Pilih 'Podcast' atau 'Cinema' untuk kejernihan standar industri."
        : "Use the 'Master Rack' to choose sound character. Select 'Podcast' or 'Cinema' for industry-standard clarity."
    },
    {
      icon: <Zap className="text-neon" size={24} />,
      title: lang === 'id' ? "Global Industry Standard" : "Global Industry Standard",
      desc: lang === 'id'
        ? "Fitur 'Broadcast' & 'Cinema' mengikuti standar LUFS internasional. Audio Anda aman untuk TV, Film, dan Bioskop dunia."
        : "Our 'Broadcast' & 'Cinema' features follow international LUFS standards. Your audio is safe for TV, Film, and Global Cinema."
    },
    {
      icon: <Download className="text-neon" size={24} />,
      title: lang === 'id' ? "Ekspor Hasil" : "Export Results",
      desc: lang === 'id'
        ? "Pilih format (WAV, MP3, atau M4A) dan klik tombol download. Audio Anda siap dimasukkan ke dalam editor video Anda."
        : "Choose your format (WAV, MP3, or M4A) and click download. Your audio is ready for your video editor."
    }
  ];

  const specs = [
    { label: lang === 'id' ? 'Pemrosesan' : 'Processing', value: '32-bit Float' },
    { label: lang === 'id' ? 'Latensi' : 'Latency', value: '0.2ms (Edge)' },
    { label: 'Denoise', value: 'Neural Gate' },
    { label: 'Output', value: '24-bit Lossless' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
          className="relative bg-[#050505] border border-white/5 w-full max-w-2xl p-6 md:p-10 rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors z-20">
            <X size={24} />
          </button>

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon italic">Manual_User_v1</span>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                {lang === 'id' ? 'Cara_Pakai' : 'How_To_Use'}<br/><span className="text-zinc-500">Alan_Voice</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-neon/50 transition-colors">
                      {React.cloneElement(step.icon as React.ReactElement, { size: 18 })}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <span className="text-neon text-[9px]">0{i+1}.</span> {step.title}
                      </h3>
                      <p className="text-zinc-500 text-[10px] leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-neon uppercase tracking-[0.3em] italic">Studio_Specs</h4>
                  <p className="text-[9px] text-zinc-400 leading-relaxed uppercase font-bold italic tracking-wide">
                    {lang === 'id' ? 'Dibangun dengan engine audio setara DAW' : 'Built with audio engine comparable to pro DAW'} professionnel.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((s, idx) => (
                    <div key={idx} className="space-y-1 border-l border-neon/20 pl-3">
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{s.label}</p>
                      <p className="text-[10px] text-white font-mono">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <Zap size={14} className="text-blue-400 fill-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white font-black italic uppercase italic">
                        {lang === 'id' ? 'Bypass Mic Standar' : 'Bypass Standard Mic'}
                      </p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                        {lang === 'id' ? 'Mengubah noise jadi kejernihan studio.' : 'Transforming noise into studio clarity.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-neon text-black font-black uppercase italic text-[10px] tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 shadow-[0_0_30px_rgba(201,255,0,0.3)]"
            >
              {lang === 'id' ? 'Mulai_Menggunakan_Sekarang' : 'Start_Using_Now'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
