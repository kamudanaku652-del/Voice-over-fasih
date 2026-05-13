import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Square, Mic, Download, Trash2, Scissors, Wand2, Volume2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AudioEditorProps {
  onAudioDataChanges?: (blob: Blob) => void;
}

export default function AudioEditor({ onAudioDataChanges }: AudioEditorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
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

  // VU Meter Logic
  const startVuAnalysis = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVu = () => {
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
      audioContext.close();
    };
  };

  // Initialize Wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#333',
      progressColor: '#C9FF00',
      cursorColor: '#C9FF00',
      barWidth: 2,
      barRadius: 1,
      responsive: true,
      height: 150,
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      const stopVu = startVuAnalysis(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        stopVu();
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        wavesurfer.current?.load(url);
        onAudioDataChanges?.(audioBlob);
        
        // Stop all tracks in stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Mohon izinkan akses mikrofon untuk merekam.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setVuLevel(0);
    }
  };

  const togglePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
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
    link.download = `rekaman-suarapro-${new Date().getTime()}.wav`;
    link.click();
  };

  const clearAudio = () => {
    if (window.confirm('Hapus rekaman ini?')) {
      setAudioUrl(null);
      setDuration(0);
      setCurrentTime(0);
      wavesurfer.current?.load('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Time Display */}
      {!isRecording && audioUrl && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-500 mb-2">Current Position</p>
          <h2 className="text-7xl md:text-8xl font-black text-neon tracking-tighter font-mono">
            {formatTime(currentTime).split('.')[0]}<span className="opacity-40 text-4xl md:text-6xl">.{formatTime(currentTime).split('.')[1]}</span>
          </h2>
        </div>
      )}

      {/* Waveform Container */}
      <div className="relative bg-[#0d0d0d] rounded-2xl p-8 border border-[#222] overflow-hidden waveform-shadow">
        <div ref={waveformRef} className="w-full" />
        
        {/* Time Indicators */}
        <div className="flex justify-between mt-6 font-mono text-[11px] text-zinc-500 tracking-[0.3em] font-bold uppercase">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute inset-0 bg-neon/5 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-neon rounded-full recording-indicator-neon" />
                <span className="font-mono text-2xl text-neon font-black tracking-[0.4em] italic">SIGNAL_REC</span>
              </div>
              
              {/* VU Meter UI */}
              <div className="flex items-end gap-1 h-12">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1.5 bg-neon transition-all duration-75"
                    style={{ 
                      height: `${Math.min(100, (vuLevel / 150) * (i * 4 + 20) * (Math.random() * 0.5 + 0.5))}%`,
                      opacity: i > 18 ? 0.3 : 1
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!audioUrl && !isRecording && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-sans text-xs font-black tracking-[0.4em] text-zinc-700 uppercase italic">Waiting for signal...</span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-[#000] p-6 rounded-2xl border border-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="group relative flex items-center gap-3 bg-neon hover:scale-105 text-black px-8 py-3.5 rounded-full transition-all duration-300 font-black italic uppercase tracking-tighter"
            >
              <Mic size={20} className="relative z-10" />
              <span className="relative z-10 text-base">Start_Rec</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full hover:scale-105 transition-all font-black italic uppercase tracking-tighter"
            >
              <Square size={18} fill="black" />
              <span className="text-base">Stop_Rec</span>
            </button>
          )}

          <div className="h-10 w-px bg-[#222] mx-2" />

          <button
            disabled={!audioUrl}
            onClick={togglePlayback}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#111] hover:bg-[#222] disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-[#222] text-white"
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            title="AI Polish"
            disabled={!audioUrl}
            className="p-3 rounded-xl bg-[#111] hover:bg-[#222] disabled:opacity-20 transition-all border border-[#222] text-zinc-500 hover:text-neon"
          >
            <Wand2 size={20} />
          </button>
          <button
            title="Normalize"
            disabled={!audioUrl}
            className="p-3 rounded-xl bg-[#111] hover:bg-[#222] disabled:opacity-20 transition-all border border-[#222] text-zinc-500 hover:text-neon"
          >
            <Volume2 size={20} />
          </button>
          <div className="h-10 w-px bg-[#222] mx-2" />
          <button
            title="Export"
            disabled={!audioUrl}
            onClick={handleDownload}
            className="px-6 py-3 rounded-xl bg-[#111] hover:bg-neon hover:text-black font-black italic uppercase tracking-tighter disabled:opacity-20 transition-all border border-[#222] text-zinc-500"
          >
            <Download size={20} className="inline mr-2" />
            Export
          </button>
          <button
            title="Delete"
            disabled={!audioUrl}
            onClick={clearAudio}
            className="p-3 rounded-xl bg-[#111] hover:bg-red-900/20 disabled:opacity-20 transition-all border border-[#222] text-zinc-500 hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
