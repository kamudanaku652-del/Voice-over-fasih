import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Loader2, Copy, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

interface ScriptEditorProps {
  onScriptChange?: (script: string) => void;
}

export default function ScriptEditor({ onScriptChange }: ScriptEditorProps) {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<'profesional' | 'energetik' | 'dokumenter'>('profesional');

  const generateScript = async () => {
    if (!topic) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Anda adalah penulis naskah Voice-Over (VO) profesional terbaik di industri penyiaran.
      Tugas: Buatkan draf naskah VO dalam Bahasa Indonesia yang sangat fasih, artikulatif, dan memiliki pengaruh (impact) tinggi.
      
      Topik Rekaman: ${topic}
      Nada Suara: ${tone}
      
      Struktur Naskah:
      1. Sertakan instruksi emosi dan dinamika suara dalam kurung siku [seperti ini].
      2. Gunakan tanda baca yang tepat untuk membantu jeda napas.
      3. Berikan variasi tempo (cepat untuk energi, lambat untuk penekanan).
      4. Tambahkan saran musik latar yang cocok di bagian akhir.
      
      Target Durasi: 30-60 detik.
      Pastikan pilihan katanya elegan dan profesional sesuai standar penyiaran radio/TV.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const generatedScript = response.text || '';
      setScript(generatedScript);
      onScriptChange?.(generatedScript);
    } catch (err) {
      console.error('Gemini API error:', err);
      alert('Gagal menghasilkan naskah. Pastikan API Key sudah terkonfigurasi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    // Simple feedback could be added here
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] rounded-2xl border border-[#222] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-[#222] bg-[#000] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-neon italic underline underline-offset-8">Recording_Script</h3>
        </div>
        <div className="flex bg-[#0d0d0d] p-1 rounded-lg border border-[#222] gap-1">
          {(['profesional', 'energetik', 'dokumenter'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black rounded-md transition-all uppercase tracking-tighter italic",
                tone === t ? "bg-neon text-black" : "text-zinc-500 hover:bg-white/5"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
        {/* Input Topic */}
        <div className="relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="TOPIC_INPUT_REQUIRED..."
            className="w-full bg-[#000] border border-[#222] rounded-xl py-4 px-6 text-sm font-bold uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-neon transition-all placeholder:text-zinc-800"
          />
          <button
            onClick={generateScript}
            disabled={isGenerating || !topic}
            className="absolute right-4 top-2.5 p-2 text-neon hover:scale-110 disabled:opacity-20 transition-all"
          >
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </button>
        </div>

        {/* Script Display */}
        <div className="flex-1 overflow-y-auto bg-[#000] rounded-xl p-8 border border-[#222] custom-scrollbar">
          {script ? (
            <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-300 prose-p:italic prose-p:leading-relaxed prose-strong:text-white prose-strong:underline prose-strong:decoration-neon/50">
              <ReactMarkdown>{script}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
              <BookOpen size={60} />
              <p className="text-sm font-black uppercase tracking-[0.5em] italic">AWAITING_CONTENT</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex justify-between items-center bg-transparent border-t border-[#222]">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">
            [AI_ASSIST_ENABLED]
          </span>
          <button
            onClick={copyToClipboard}
            disabled={!script}
            className="flex items-center gap-2 text-[11px] uppercase font-black tracking-[0.2em] text-zinc-500 hover:text-neon disabled:opacity-20 transition-all italic"
          >
            <Copy size={14} />
            Copy_Buffer
          </button>
        </div>
      </div>
    </div>
  );
}
