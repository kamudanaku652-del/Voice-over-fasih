import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Square, Mic, Download, Trash2, Wand2, Volume2, Upload, Activity, Headphones, Radio } from 'lucide-react';
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

  const [showEffects, setShowEffects] = useState(false);
  const [showFXRack, setShowFXRack] = useState(false);
  const [activePreset, setActivePreset] = useState<'neutral' | 'deep' | 'news' | 'cinematic' | 'expensive'>('neutral');
  const [effects, setEffects] = useState({
    gate: -45,
    clarity: 4,
    compression: -12,
    deEsser: -10,
    proximity: 2,
    warmth: 0.05,
    limit: -1,
    reverb: 0,
    telephone: false,
    cleanPunch: 0
  });

  // Audio Context for Processing
  const audioCtx = useRef<AudioContext | null>(null);
  const compressor = useRef<DynamicsCompressorNode | null>(null);
  const limiter = useRef<DynamicsCompressorNode | null>(null);
  const clarityEq = useRef<BiquadFilterNode | null>(null);
  const proximityEq = useRef<BiquadFilterNode | null>(null);
  const deBoxEq = useRef<BiquadFilterNode | null>(null);
  const deEsser = useRef<BiquadFilterNode | null>(null);
  const telephoneFilter = useRef<BiquadFilterNode | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const reverbGain = useRef<GainNode | null>(null);
  const saturator = useRef<WaveShaperNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyPreset = (type: 'neutral' | 'deep' | 'news' | 'cinematic' | 'expensive') => {
    setActivePreset(type);
    switch(type) {
      case 'deep':
        setEffects(prev => ({ ...prev, gate: -40, clarity: 3, compression: -16, deEsser: -15, proximity: 6, warmth: 0.1, limit: -1, cleanPunch: 0.2 }));
        break;
      case 'news':
        setEffects(prev => ({ ...prev, gate: -35, clarity: 8, compression: -22, deEsser: -10, proximity: 1, warmth: 0.05, limit: -0.5, cleanPunch: 0.1 }));
        break;
      case 'cinematic':
        setEffects(prev => ({ ...prev, gate: -50, clarity: 10, compression: -18, deEsser: -18, proximity: 4, warmth: 0.2, limit: -1, cleanPunch: 0.3 }));
        break;
      case 'expensive':
        setEffects(prev => ({ ...prev, gate: -55, clarity: 8, compression: -18, deEsser: -20, proximity: 5, warmth: 0.3, limit: -1, cleanPunch: 0.4 }));
        break;
      default:
        setEffects(prev => ({ ...prev, gate: -45, clarity: 4, compression: -12, deEsser: -10, proximity: 2, warmth: 0.05, limit: -1, cleanPunch: 0 }));
    }
  };

  // Helper for saturation curve
  const makeDistortionCurve = (amount: number) => {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      const gain = 1 + (amount * 1.5); 
      curve[i] = Math.tanh(x * gain) / Math.tanh(gain);
    }
    return curve;
  };

  // Create Reverb Impulse (Simple White Noise Decay)
  const createImpulseResponse = (ctx: AudioContext, duration: number, decay: number) => {
    const length = ctx.sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
        }
    }
    return impulse;
  };

  // Visualizer Animation Loop
  const drawVisualizer = () => {
    if (!analyser.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      requestAnimationFrame(draw);
      if (!analyser.current) return;
      analyser.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(201, 255, 0, ${dataArray[i] / 255 + 0.1})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  // Initialize Audio Processing Chain
  useEffect(() => {
    if (wavesurfer.current) {
      const ws = wavesurfer.current;
      ws.on('ready', () => {
        const mediaElement = ws.getMediaElement();
        if (mediaElement && !audioCtx.current) {
          audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioCtx.current.createMediaElementSource(mediaElement);
          
          analyser.current = audioCtx.current.createAnalyser();
          analyser.current.fftSize = 256;

          proximityEq.current = audioCtx.current.createBiquadFilter();
          proximityEq.current.type = 'lowshelf';
          proximityEq.current.frequency.value = 150;

          deBoxEq.current = audioCtx.current.createBiquadFilter();
          deBoxEq.current.type = 'peaking';
          deBoxEq.current.frequency.value = 400; // Common 'boxy' frequency for phone mics
          deBoxEq.current.Q.value = 1;
          deBoxEq.current.gain.value = -3; // 3dB cut to clean up the sound

          deEsser.current = audioCtx.current.createBiquadFilter();
          deEsser.current.type = 'peaking';
          deEsser.current.frequency.value = 6500;
          deEsser.current.Q.value = 4;

          telephoneFilter.current = audioCtx.current.createBiquadFilter();
          telephoneFilter.current.type = 'bandpass';
          telephoneFilter.current.frequency.value = 1500;
          telephoneFilter.current.Q.value = 1.0;

          clarityEq.current = audioCtx.current.createBiquadFilter();
          clarityEq.current.type = 'highshelf';
          clarityEq.current.frequency.value = 4800;

          saturator.current = audioCtx.current.createWaveShaper();
          saturator.current.oversample = '4x';

          reverbNode.current = audioCtx.current.createConvolver();
          reverbNode.current.buffer = createImpulseResponse(audioCtx.current, 1.5, 2);
          reverbGain.current = audioCtx.current.createGain();
          reverbGain.current.gain.value = 0;

          compressor.current = audioCtx.current.createDynamicsCompressor();
          compressor.current.knee.value = 40;
          compressor.current.ratio.value = 4; 
          compressor.current.attack.value = 0.01;
          compressor.current.release.value = 0.2;

          limiter.current = audioCtx.current.createDynamicsCompressor();
          limiter.current.threshold.value = -1;
          limiter.current.knee.value = 0;
          limiter.current.ratio.value = 20;
          
          const gainNode = audioCtx.current.createGain();
          gainNode.gain.value = 1.0;

          const mainOutput = audioCtx.current.createGain();

          // Chain: Source -> analyser -> deBox -> DeEsser -> mainOutput
          source.connect(analyser.current);
          analyser.current.connect(deBoxEq.current);
          deBoxEq.current.connect(deEsser.current);
          
          // Parallel Reverb
          deEsser.current.connect(reverbNode.current);
          reverbNode.current.connect(reverbGain.current);
          reverbGain.current.connect(mainOutput);

          deEsser.current.connect(mainOutput);
          
          mainOutput.connect(saturator.current);
          
          // FX Routing
          saturator.current.connect(proximityEq.current);
          proximityEq.current.connect(clarityEq.current);
          clarityEq.current.connect(compressor.current);
          compressor.current.connect(gainNode);
          gainNode.connect(limiter.current);
          limiter.current.connect(audioCtx.current.destination);

          drawVisualizer();
        }
      });
    }
  }, []);

  // Update Effects in Real-time
  useEffect(() => {
    if (compressor.current && audioCtx.current) {
      compressor.current.threshold.setValueAtTime(effects.compression, audioCtx.current.currentTime);
    }
    if (limiter.current && audioCtx.current) {
      limiter.current.threshold.setValueAtTime(effects.limit, audioCtx.current.currentTime);
    }
    if (clarityEq.current && audioCtx.current) {
      clarityEq.current.gain.setValueAtTime(effects.clarity, audioCtx.current.currentTime);
    }
    if (proximityEq.current && audioCtx.current) {
      // Proximity = base proximity + cleanPunch contribution
      const finalProximity = effects.proximity + (effects.cleanPunch * 15);
      proximityEq.current.gain.setValueAtTime(finalProximity, audioCtx.current.currentTime);
    }
    if (deBoxEq.current && audioCtx.current) {
      // Noise reduction part: cut more low-mids (boxy sounds) as cleanPunch increases
      const boxCut = -3 - (effects.cleanPunch * 10);
      deBoxEq.current.gain.setValueAtTime(boxCut, audioCtx.current.currentTime);
    }
    if (deEsser.current && audioCtx.current) {
      deEsser.current.gain.setValueAtTime(effects.deEsser, audioCtx.current.currentTime);
    }
    if (saturator.current) {
      saturator.current.curve = makeDistortionCurve(effects.warmth);
    }
    if (reverbGain.current && audioCtx.current) {
      reverbGain.current.gain.setValueAtTime(effects.reverb, audioCtx.current.currentTime);
    }
    if (telephoneFilter.current && audioCtx.current && saturator.current && proximityEq.current) {
      try {
        if (effects.telephone) {
          saturator.current.disconnect(proximityEq.current);
          saturator.current.connect(telephoneFilter.current);
          telephoneFilter.current.connect(proximityEq.current);
        } else {
          try { saturator.current.disconnect(telephoneFilter.current); } catch(e) {}
          try { telephoneFilter.current.disconnect(proximityEq.current); } catch(e) {}
          saturator.current.connect(proximityEq.current);
        }
      } catch(e) {
        // Handle cases where nodes might already be connected/disconnected
      }
    }
  }, [effects]);


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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <p className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-1 md:mb-2">Monitor_Playback_Time</p>
          <h2 className="text-6xl md:text-9xl font-black text-neon tracking-tighter font-mono leading-none">
            {formatTime(currentTime).split('.')[0]}<span className="opacity-20 text-3xl md:text-6xl">.{formatTime(currentTime).split('.')[1]}</span>
          </h2>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2 md:gap-3 md:translate-y-[-10px]">
           <p className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-black text-zinc-600">Dynamic_Input_Level</p>
           <div className="flex items-center gap-1 h-10 md:h-12 w-full max-w-[200px] md:w-56 bg-black border border-studio-border px-3 md:px-4 rounded-xl">
             {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 h-5 md:h-6 rounded-sm transition-all duration-75",
                    i / 20 < (vuLevel / 120) ? "bg-neon shadow-[0_0_10px_#C9FF00]" : "bg-zinc-900"
                  )}
                />
             ))}
           </div>
        </div>
      </div>

      {/* Waveform Container */}
      <div className="relative bg-[#000] rounded-2xl md:rounded-3xl p-4 md:p-10 border border-studio-border overflow-hidden waveform-shadow ring-1 ring-white/5">
        <div ref={waveformRef} className="w-full" />
        
        {/* Frequency Visualizer Overlay */}
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={60} 
          className="w-full mt-4 h-[40px] md:h-[60px] opacity-40 mix-blend-screen"
        />

        {/* Time Indicators */}
        <div className="flex justify-between mt-4 md:mt-8 border-t border-studio-border pt-4 font-mono text-[9px] md:text-[11px] text-zinc-600 tracking-[0.2em] md:tracking-[0.3em] font-black uppercase italic">
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

      {/* Mastering Rack (Conditional) */}
      {showEffects && (
        <div className="bg-[#000] border border-neon/20 rounded-2xl md:rounded-[40px] p-6 md:p-12 space-y-8 md:space-y-12 shadow-[0_0_120px_rgba(201,255,0,0.1)] animate-in fade-in zoom-in-95 duration-700">
          {/* Preset Selector */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex justify-between items-center">
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-600 italic">Mastering_Profiles</p>
              <button 
                onClick={() => {
                  applyPreset('neutral');
                  setEffects(prev => ({ ...prev, cleanPunch: 0 }));
                }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-neon hover:underline"
              >
                Reset_To_Default
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {[
                { id: 'neutral', name: 'Raw', icon: Activity },
                { id: 'deep', name: 'Deep', icon: Headphones },
                { id: 'news', name: 'News', icon: Radio },
                { id: 'cinematic', name: 'Air', icon: Wand2 },
                { id: 'expensive', name: 'Pro', icon: Mic }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl border transition-all font-black text-[9px] md:text-xs uppercase italic tracking-widest min-w-[100px] md:min-w-[200px]",
                    activePreset === p.id 
                      ? "bg-neon border-neon text-black shadow-[0_0_30px_#C9FF00]" 
                      : "bg-[#111] border-studio-border text-zinc-500 hover:border-neon/50 hover:text-white"
                  )}
                >
                  <p.icon size={14} className="md:w-4 md:h-4" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-12 border-t border-studio-border pt-8 md:pt-12">
            <div className="lg:col-span-1 space-y-4 md:space-y-6 bg-neon/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neon/20 shadow-[0_0_40px_rgba(201,255,0,0.05)]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-neon italic">Alan_Clean_Bass</span>
                <span className="text-neon font-mono text-[10px] md:text-xs">{(effects.cleanPunch * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={effects.cleanPunch} 
                onChange={(e) => setEffects({...effects, cleanPunch: parseFloat(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest italic leading-relaxed">Noise Reduction + Big Bass Engine</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">De-Esser</span>
                <span className="text-neon font-mono text-xs">{effects.deEsser}dB</span>
              </div>
              <input 
                type="range" min="-40" max="0" step="1" 
                value={effects.deEsser} 
                onChange={(e) => setEffects({...effects, deEsser: parseInt(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Sharpness Removal</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Proximity</span>
                <span className="text-neon font-mono text-xs">+{effects.proximity}dB</span>
              </div>
              <input 
                type="range" min="0" max="25" step="1" 
                value={effects.proximity} 
                onChange={(e) => setEffects({...effects, proximity: parseInt(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Documentary Depth</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Air_Clarity</span>
                <span className="text-neon font-mono text-xs">+{effects.clarity}dB</span>
              </div>
              <input 
                type="range" min="0" max="30" step="1" 
                value={effects.clarity} 
                onChange={(e) => setEffects({...effects, clarity: parseInt(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Fasih Definition</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Tube_Warmth</span>
                <span className="text-neon font-mono text-xs">{(effects.warmth * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={effects.warmth} 
                onChange={(e) => setEffects({...effects, warmth: parseFloat(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Billion_Dollar_Sat</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Final_Peak</span>
                <span className="text-neon font-mono text-xs">{effects.limit}dB</span>
              </div>
              <input 
                type="range" min="-10" max="0" step="0.5" 
                value={effects.limit} 
                onChange={(e) => setEffects({...effects, limit: parseFloat(e.target.value)})}
                className="w-full accent-neon bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest">Zero-Clip Limiter</p>
            </div>
          </div>
        </div>
      )}

      {/* FX RACK (Space & Lo-Fi) */}
      {showFXRack && (
        <div className="bg-[#000] border border-blue-500/20 rounded-2xl md:rounded-[40px] p-6 md:p-12 space-y-8 md:space-y-12 shadow-[0_0_120px_rgba(59,130,246,0.1)] animate-in fade-in zoom-in-95 duration-700">
          <div className="flex justify-between items-center">
             <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-600 italic">Sound_Design_FX_Rack</p>
             <button 
                onClick={() => setEffects(prev => ({...prev, reverb: 0, telephone: false, cleanPunch: 0}))}
                className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:underline"
              >
                Clear_FX
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
             <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Space_Engine (Reverb)</span>
                  <span className="text-blue-400 font-mono text-[10px] md:text-xs">{(effects.reverb * 200).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.5" step="0.01" 
                  value={effects.reverb} 
                  onChange={(e) => setEffects({...effects, reverb: parseFloat(e.target.value)})}
                  className="w-full accent-blue-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex gap-2">
                   <button onClick={() => setEffects({...effects, reverb: 0.05})} className="text-[9px] border border-zinc-800 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-500">Tight_Room</button>
                   <button onClick={() => setEffects({...effects, reverb: 0.2})} className="text-[9px] border border-zinc-800 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-500">Live_Lexicon</button>
                   <button onClick={() => setEffects({...effects, reverb: 0.4})} className="text-[9px] border border-zinc-800 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-500">Cathedral_Hall</button>
                </div>
             </div>

             <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic block mb-2">Vintage_Transmission</span>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setEffects({...effects, telephone: !effects.telephone})}
                     className={cn(
                       "flex-1 py-4 px-6 rounded-2xl border transition-all font-black text-xs uppercase italic tracking-widest",
                       effects.telephone ? "bg-blue-500 border-blue-500 text-black shadow-[0_0_20px_#3B82F6]" : "bg-[#111] border-zinc-800 text-zinc-500 hover:border-blue-500/50"
                     )}
                   >
                     Telephone_Mode (Lo-Fi)
                   </button>
                </div>
                <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest italic">Simulates bandwidth-limited analog hardware</p>
             </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8 bg-[#000] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-studio-border shadow-[0_30px_90px_rgba(0,0,0,0.9)] shadow-neon/5 relative z-10 transition-all hover:border-studio-border/50">
        <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto justify-center sm:justify-start">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="group relative flex items-center gap-3 md:gap-4 bg-neon hover:scale-105 active:scale-95 text-black px-6 md:px-10 py-3 md:py-5 rounded-full transition-all duration-300 font-black italic uppercase tracking-tighter shadow-[0_0_30px_rgba(201,255,0,0.3)]"
            >
              <Mic size={20} className="md:w-6 md:h-6 relative z-10" />
              <span className="relative z-10 text-sm md:text-lg whitespace-nowrap">Start_Rec</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-3 md:gap-4 bg-white text-black px-6 md:px-10 py-3 md:py-5 rounded-full hover:scale-105 active:scale-95 transition-all font-black italic uppercase tracking-tighter"
            >
              <Square size={16} md:size={20} fill="black" />
              <span className="text-sm md:text-lg whitespace-nowrap">Stop_Rec</span>
            </button>
          )}

          <div className="h-10 md:h-12 w-px bg-studio-border mx-1 md:mx-2" />

          <button
            disabled={!audioUrl}
            onClick={togglePlayback}
            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-[#111] hover:bg-[#222] hover:border-neon/50 disabled:opacity-20 transition-all border border-studio-border text-white shadow-2xl"
          >
            {isPlaying ? <Pause size={24} md:size={32} fill="white" /> : <Play size={24} md:size={32} fill="white" className="ml-1" />}
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
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#111] hover:bg-[#222] border border-studio-border text-zinc-500 hover:text-white transition-all shadow-xl hover:scale-110"
            title="Import Audio File"
          >
            <Upload size={20} md:size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex gap-2 md:gap-3">
            <button
              title="Studio Mastering Rack"
              onClick={() => {
                setShowEffects(!showEffects);
                setShowFXRack(false);
              }}
              className={cn(
                "p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border shadow-xl hover:scale-110 active:scale-95",
                showEffects ? "bg-neon text-black border-neon" : "bg-[#111] text-zinc-500 border-studio-border hover:text-neon"
              )}
            >
              <Wand2 size={20} md:size={24} />
            </button>
            <button
              title="FX Sound Design Rack"
              onClick={() => {
                setShowFXRack(!showFXRack);
                setShowEffects(false);
              }}
              className={cn(
                "p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border shadow-xl hover:scale-110 active:scale-95",
                showFXRack ? "bg-blue-500 text-black border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-[#111] text-zinc-500 border-studio-border hover:text-blue-500"
              )}
            >
              <Activity size={20} md:size={24} />
            </button>
          </div>
          
          <div className="h-10 md:h-12 w-px bg-studio-border mx-1 md:mx-2" />
          
          <button
            disabled={!audioUrl}
            onClick={handleDownload}
            className="px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl bg-[#111] hover:bg-neon hover:text-black font-black italic uppercase tracking-tighter disabled:opacity-20 transition-all border border-studio-border text-zinc-500 shadow-xl group"
          >
            <Download size={18} md:size={20} className="inline mr-2 md:mr-3 mb-1 group-hover:-translate-y-1 transition-transform" />
            <span className="text-xs md:text-base">Export</span>
          </button>
          
          <button
            title="Wipe Studio Buffer"
            disabled={!audioUrl}
            onClick={clearAudio}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#111] hover:bg-red-900/20 disabled:opacity-10 transition-all border border-studio-border text-zinc-500 hover:text-red-500 hover:scale-110 active:scale-95"
          >
            <Trash2 size={20} md:size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
