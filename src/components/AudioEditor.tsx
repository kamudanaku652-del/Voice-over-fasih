import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Square, Mic, Download, Trash2, Wand2, Volume2, Upload, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AudioEditorProps {
  onAudioDataChanges?: (blob: Blob) => void;
}

export default function AudioEditor({ onAudioDataChanges }: AudioEditorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [vuLevel, setVuLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // VU Meter Logic - Optimized for performance to prevent stuttering
  const startVuAnalysis = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 'interactive',
      sampleRate: 48000
    });
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVu = () => {
      if (!isRecording && !mediaRecorder.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setVuLevel(average); 
      animationFrameRef.current = requestAnimationFrame(updateVu);
    };

    updateVu();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContext.state !== 'closed') audioContext.close();
    };
  };

  // Initialize Wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#1a1a1a',
      progressColor: '#C9FF00',
      cursorColor: '#C9FF00',
      barWidth: 3,
      barGap: 3,
      barRadius: 2,
      responsive: true,
      height: 180,
      normalize: true,
      partialRender: true,
      autoCenter: true,
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('timeupdate', (time) => setCurrentTime(time));
    wavesurfer.current.on('ready', (dur) => setDuration(dur));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, []);

  const startRecording = async () => {
    try {
      // Professional constraints to prevent stuttering
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        } 
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      audioChunks.current = [];

      const stopVu = startVuAnalysis(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        stopVu();
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        wavesurfer.current?.load(url);
        onAudioDataChanges?.(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start(100); // Collect data in small chunks to prevent UI lag
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Gagal mengakses mikrofon. Pastikan izin sudah aktif.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setVuLevel(0);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const togglePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('Mohon pilih file audio (MP3, WAV, dsb)');
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      wavesurfer.current?.load(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `VO_PRO_SESSION_${new Date().getTime()}.wav`;
    link.click();
  };

  const clearAudio = () => {
    if (window.confirm('Bersihkan buffer studio?')) {
      setAudioUrl(null);
      setDuration(0);
      setCurrentTime(0);
      wavesurfer.current?.load('');
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Time & Metrics Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-2">Monitor_Playback_Time</p>
          <h2 className="text-7xl md:text-9xl font-black text-neon tracking-tighter font-mono leading-none">
            {formatTime(currentTime).split('.')[0]}<span className="opacity-20 text-4xl md:text-6xl">.{formatTime(currentTime).split('.')[1]}</span>
          </h2>
        </div>
        
        <div className="flex flex-col items-end gap-3 translate-y-[-10px]">
           <p className="text-[11px] uppercase tracking-[0.4em] font-black text-zinc-600">Dynamic_Input_Level</p>
           <div className="flex items-center gap-1 h-12 w-56 bg-black border border-studio-border px-4 rounded-xl">
             {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 h-6 rounded-sm transition-all duration-75",
                    i / 20 < (vuLevel / 120) ? "bg-neon shadow-[0_0_10px_#C9FF00]" : "bg-zinc-900"
                  )}
                />
             ))}
           </div>
        </div>
      </div>

      {/* Waveform Container */}
      <div className="relative bg-[#000] rounded-3xl p-10 border border-studio-border overflow-hidden waveform-shadow ring-1 ring-white/5">
        <div ref={waveformRef} className="w-full" />
        
        {/* Time Indicators */}
        <div className="flex justify-between mt-8 border-t border-studio-border pt-4 font-mono text-[11px] text-zinc-600 tracking-[0.3em] font-black uppercase italic">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute inset-0 bg-neon/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-6 h-6 bg-neon rounded-full recording-indicator-neon" />
                <span className="font-mono text-3xl text-neon font-black tracking-[0.5em] italic">SIGNAL_REC_ACTIVE</span>
              </div>
              <p className="text-neon/60 text-xs font-black uppercase tracking-[1em] animate-pulse underline decoration-neon/30 underline-offset-8">Encoding_Lossless_Buffer</p>
            </div>
          </div>
        )}

        {!audioUrl && !isRecording && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-6 opacity-30">
               <div className="relative">
                 <Activity size={56} className="text-zinc-500" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-dashed border-zinc-700 rounded-full animate-spin-slow" />
               </div>
               <span className="font-sans text-xs font-black tracking-[0.6em] text-zinc-300 uppercase italic">Awaiting_Source_Signal</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-8 bg-[#000] p-8 rounded-3xl border border-studio-border shadow-[0_30px_90px_rgba(0,0,0,0.9)] shadow-neon/5 relative z-10 transition-all hover:border-studio-border/50">
        <div className="flex items-center gap-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="group relative flex items-center gap-4 bg-neon hover:scale-105 active:scale-95 text-black px-10 py-5 rounded-full transition-all duration-300 font-black italic uppercase tracking-tighter shadow-[0_0_30px_rgba(201,255,0,0.3)]"
            >
              <Mic size={24} className="relative z-10" />
              <span className="relative z-10 text-lg">Start_Rec</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full hover:scale-105 active:scale-95 transition-all font-black italic uppercase tracking-tighter"
            >
              <Square size={20} fill="black" />
              <span className="text-lg">Stop_Rec</span>
            </button>
          )}

          <div className="h-12 w-px bg-studio-border mx-2" />

          <button
            disabled={!audioUrl}
            onClick={togglePlayback}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-[#111] hover:bg-[#222] hover:border-neon/50 disabled:opacity-20 transition-all border border-studio-border text-white shadow-2xl"
          >
            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="audio/*" 
            className="hidden" 
          />
          <button
            onClick={triggerUpload}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-[#111] hover:bg-[#222] border border-studio-border text-zinc-500 hover:text-white transition-all shadow-xl hover:scale-110"
            title="Import Audio File"
          >
            <Upload size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <button
              title="AI Polish"
              disabled={!audioUrl}
              className="p-4 rounded-2xl bg-[#111] hover:bg-[#222] disabled:opacity-10 transition-all border border-studio-border text-zinc-500 hover:text-neon hover:scale-110 active:scale-95"
            >
              <Wand2 size={24} />
            </button>
            <button
              title="Volume Balance"
              disabled={!audioUrl}
              className="p-4 rounded-2xl bg-[#111] hover:bg-[#222] disabled:opacity-10 transition-all border border-studio-border text-zinc-500 hover:text-neon hover:scale-110 active:scale-95"
            >
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="h-12 w-px bg-studio-border mx-2" />
          
          <button
            disabled={!audioUrl}
            onClick={handleDownload}
            className="px-10 py-5 rounded-2xl bg-[#111] hover:bg-neon hover:text-black font-black italic uppercase tracking-tighter disabled:opacity-20 transition-all border border-studio-border text-zinc-500 shadow-xl group"
          >
            <Download size={20} className="inline mr-3 mb-1 group-hover:-translate-y-1 transition-transform" />
            Export_Final
          </button>
          
          <button
            title="Wipe Studio Buffer"
            disabled={!audioUrl}
            onClick={clearAudio}
            className="p-4 rounded-2xl bg-[#111] hover:bg-red-900/20 disabled:opacity-10 transition-all border border-studio-border text-zinc-500 hover:text-red-500 hover:scale-110 active:scale-95"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
