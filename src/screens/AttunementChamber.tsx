import * as React from 'react';
import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Square,
  ChevronDown,
  Info,
  Pause,
  RotateCcw,
  FastForward,
  Wind,
  ShieldAlert
} from 'lucide-react';
import { PresenceCarrier } from '../types';
import { HARMONIC_FREQUENCIES } from '../data/constants';
import { BREATH_PILLARS, BreathPillar } from '../data/breathPillars';
import { useBreathGuidance, BreathPhase } from '../hooks/useBreathGuidance';
import { generateWavBlob } from '../audio/safariFallbackEngine';
import { getDeviceMemoryGb, getZmAttunementBudget, selectAudiblePillarsForBudget } from '../roanoke/zmResourceGovernor';

interface AttunementChamberProps {
  carrier: PresenceCarrier;
  onSealReflection: (reflection: string, metadata?: any) => void;
  onExit: () => void;
  safetyAcknowledged?: boolean;
  onAcknowledgeSafety?: () => void;
}

// Visual mapping from Golden Baseline
const VISUAL_STYLES: Record<string, { type: string, color: string }> = {
  'peace': { type: 'rings', color: 'rgba(246,224,179,0.2)' },
  'love': { type: 'blooms', color: 'rgba(251,191,36,0.15)' },
  'understanding': { type: 'arcs', color: 'rgba(52,211,153,0.15)' },
  'respect': { type: 'symmetry', color: 'rgba(255,255,255,0.1)' },
  'trust': { type: 'lattice', color: 'rgba(246,224,179,0.1)' },
  'truth-nature': { type: 'beams', color: 'rgba(52,211,153,0.1)' },
  'loyalty': { type: 'spiral', color: 'rgba(246,224,179,0.15)' },
  'support': { type: 'rings', color: 'rgba(255,255,255,0.1)' },
  'joy': { type: 'blooms', color: 'rgba(251,191,36,0.2)' },
  'clarity': { type: 'lattice', color: 'rgba(255,255,255,0.15)' },
  'compassion': { type: 'arcs', color: 'rgba(52,211,153,0.2)' },
  'grace': { type: 'beams', color: 'rgba(246,224,179,0.1)' },
  'sovereignty': { type: 'symmetry', color: 'rgba(251,191,36,0.15)' },
  'sanctuary': { type: 'rings', color: 'rgba(52,211,153,0.15)' },
  'radiance': { type: 'beams', color: 'rgba(251,191,36,0.2)' },
  'wonder': { type: 'spiral', color: 'rgba(255,255,255,0.15)' }
};

const HarmonicField = memo(({ pillars, isPlaying, showComplexField = true }: { pillars: string[], isPlaying: boolean, showComplexField?: boolean }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 200 200" className="max-w-4xl overflow-visible">
        <defs>
          <radialGradient id="pattern-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(246,224,179,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        <motion.circle 
          cx={100} cy={100} r={90} 
          fill="url(#pattern-glow)"
          animate={{ r: isPlaying ? [85, 95, 85] : 90 }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {(showComplexField ? pillars : pillars.slice(0, 3)).map((pid, idx) => {
          const style = VISUAL_STYLES[pid] || { type: 'rings', color: 'rgba(255,255,255,0.1)' };
          const rotationDirection = idx % 2 === 0 ? 1 : -1;
          const stagger = idx * 15;
          const n = pillars.length;
          const layeredOpacity = Math.min(0.5, 0.6 / Math.sqrt(n));
          const safeIdx = Number(idx) || 0;
          
          return (
            <motion.g
              key={`${pid}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: layeredOpacity, 
                scale: 1,
                rotate: isPlaying ? [stagger, stagger + (360 * rotationDirection)] : stagger
              }}
              transition={{ 
                opacity: { duration: 2 },
                rotate: { duration: 20 + safeIdx * 5, repeat: Infinity, ease: "linear" }
              }}
              style={{ transformOrigin: '100px 100px' }}
            >
              {style.type === 'rings' && (
                <circle cx={100} cy={100} r={30 + safeIdx * 8} fill="none" stroke={style.color} strokeWidth={0.4} strokeDasharray="1,3" />
              )}
              {style.type === 'blooms' && (
                <g transform={`scale(${0.8 + idx * 0.1})`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ellipse key={i} cx="100" cy="80" rx="10" ry="25" fill="none" stroke={style.color} strokeWidth="0.2" transform={`rotate(${i * 60 + stagger} 100 100)`} />
                  ))}
                </g>
              )}
              {style.type === 'arcs' && (
                <path d={`M ${60 - idx * 5} 100 A ${40 + idx * 5} ${40 + idx * 5} 0 0 1 ${140 + idx * 5} 100`} fill="none" stroke={style.color} strokeWidth="0.4" strokeDasharray="2,2" />
              )}
              {style.type === 'symmetry' && (
                <rect x={85 - idx * 5} y={85 - idx * 5} width={30 + idx * 10} height={30 + idx * 10} fill="none" stroke={style.color} strokeWidth="0.2" transform={`rotate(${45 + stagger} 100 100)`} />
              )}
              {style.type === 'lattice' && (
                <path d={`M ${80 - idx * 5} ${80 - idx * 5} L ${120 + idx * 5} ${120 + idx * 5} M ${80 - idx * 5} ${120 + idx * 5} L ${120 + idx * 5} ${80 - idx * 5}`} stroke={style.color} strokeWidth="0.1" />
              )}
              {style.type === 'beams' && Array.from({ length: 8 }).map((_, i) => (
                <line key={i} x1="100" y1="100" x2="100" y2="30" stroke={style.color} strokeWidth="0.1" transform={`rotate(${i * 45 + stagger} 100 100)`} />
              ))}
              {style.type === 'spiral' && (
                <path d={`M 100 100 C ${110 + idx * 5} ${90 - idx * 5} ${130 + idx * 5} ${110 + idx * 5} 100 ${140 + idx * 5}`} fill="none" stroke={style.color} strokeWidth="0.3" />
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
});

export const AttunementChamber = memo(({ carrier, onSealReflection, onExit, safetyAcknowledged: initialSafetyAcknowledged = false, onAcknowledgeSafety }: AttunementChamberProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [volume, setVolume] = useState(0.18);
  const [completed, setCompleted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAudioExpanded, setIsAudioExpanded] = useState(false);
  const [isBreathExpanded, setIsBreathExpanded] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showSafetyGate, setShowSafetyGate] = useState(!initialSafetyAcknowledged);
  
  const breathMode = (carrier.breathSettings?.mode as 'weave' | 'blend' | 'free') || 'weave';
  const breath = useBreathGuidance(carrier.selectedPillars, breathMode);
  const [isGuidanceMinimized, setIsGuidanceMinimized] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);
  const attunementBudget = useMemo(() => getZmAttunementBudget({
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    selectedPillarCount: carrier.selectedPillars.length,
    deviceMemoryGb: getDeviceMemoryGb(),
    prefersReducedMotion,
  }), [viewport.width, viewport.height, carrier.selectedPillars.length, prefersReducedMotion]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pillarGainsRef = useRef<Record<string, GainNode>>({});
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const [timeRemaining, setTimeRemaining] = useState(carrier.sessionDuration * 60);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCollapseRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackUrlRef = useRef<string | null>(null);
  const fallbackFadeRef = useRef<number | null>(null);
  const oscillatorStopRef = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for Speaker-friendly octave (logic from Golden Baseline)
  const getAudibleFreq = (freq: number) => {
    let f = freq;
    while (f < 250) f *= 2;
    return f;
  };

  const generateMultiToneWAV = (frequencies: number[], duration: number, sampleRate = 44100) => {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const normalization = 1 / Math.sqrt(frequencies.length);
    for (let i = 0; i < numSamples; i++) {
      let sample = 0;
      frequencies.forEach(f => {
        sample += Math.sin(2 * Math.PI * f * (i / sampleRate));
      });
      sample *= normalization;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const stopAudio = useCallback(() => {
    addLog("Stopping audio...");

    if (autoCollapseRef.current) {
      clearTimeout(autoCollapseRef.current);
      autoCollapseRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (fallbackFadeRef.current) {
      cancelAnimationFrame(fallbackFadeRef.current);
      fallbackFadeRef.current = null;
    }
    if (oscillatorStopRef.current) {
      window.clearTimeout(oscillatorStopRef.current);
      oscillatorStopRef.current = null;
    }

    const fallbackAudio = fallbackAudioRef.current;
    fallbackAudioRef.current = null;
    if (fallbackAudio) {
      try {
        fallbackAudio.loop = false;
        fallbackAudio.muted = true;
        fallbackAudio.volume = 0;
        fallbackAudio.pause();
        fallbackAudio.currentTime = 0;
        fallbackAudio.removeAttribute('src');
        fallbackAudio.load();
      } catch (e) {
        // Mobile Safari can throw if currentTime is changed before metadata loads.
      }
      addLog("Fallback stopped.");
    }

    if (fallbackUrlRef.current) {
      URL.revokeObjectURL(fallbackUrlRef.current);
      fallbackUrlRef.current = null;
    }

    if (gainRef.current && audioCtxRef.current) {
      try {
        const now = audioCtxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setValueAtTime(Math.max(0.0001, gainRef.current.gain.value), now);
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      } catch (e) {}
    }

    const oscillators = oscillatorsRef.current;
    oscillatorsRef.current = [];
    pillarGainsRef.current = {};
    oscillatorStopRef.current = window.setTimeout(() => {
      oscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
        try { osc.disconnect(); } catch (e) {}
      });
      if (gainRef.current) {
        try { gainRef.current.disconnect(); } catch (e) {}
        gainRef.current = null;
      }
      oscillatorStopRef.current = null;
      addLog("Web Audio stopped.");
    }, 120);

    setIsPlaying(false);
    setIsSessionActive(false);
  }, [addLog]);

  const startAudio = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    addLog(`Initiating ${silent ? 'silent ' : ''}ZM-governed audio...`);
    const pillars = carrier.selectedPillars;
    if (pillars.length === 0) {
      setError("Select at least one pillar to hear a harmonic tone.");
      return;
    }

    // Avoid stacked oscillator/audio instances from repeated taps.
    if (isPlaying) stopAudio();

    const audiblePillars = selectAudiblePillarsForBudget(pillars, breath.currentPillarIndex, attunementBudget);
    const requestedVolume = volume === 0 ? attunementBudget.maxVolume : volume;
    const targetVolume = silent ? 0 : Math.min(requestedVolume, attunementBudget.maxVolume);
    if (!silent && volume !== targetVolume) setVolume(targetVolume);

    const audibleFreqs = audiblePillars
      .map(pid => getAudibleFreq(HARMONIC_FREQUENCIES[pid] || 0))
      .filter(freq => Number.isFinite(freq) && freq > 0);

    const startFallback = async () => {
      addLog(`Engaging ZM Fallback engine (${attunementBudget.tier})...`);
      if (fallbackAudioRef.current) {
        try { fallbackAudioRef.current.pause(); } catch(e) {}
        fallbackAudioRef.current = null;
      }
      if (fallbackUrlRef.current) {
        URL.revokeObjectURL(fallbackUrlRef.current);
        fallbackUrlRef.current = null;
      }

      const wavBlob = generateWavBlob(audibleFreqs, {
        durationSec: attunementBudget.fallbackLoopSeconds,
        headroom: attunementBudget.tier === 'sanctuary' ? 0.54 : 0.62,
        fadeMs: 140,
      });
      const wavUrl = URL.createObjectURL(wavBlob);
      fallbackUrlRef.current = wavUrl;

      const audio = new Audio(wavUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      await audio.play();

      fallbackAudioRef.current = audio;
      setIsPlaying(true);
      setIsSessionActive(true);
      setError(null);
      addLog(`Fallback active: ${audiblePillars.length}/${pillars.length} harmonics, max vol ${Math.round(attunementBudget.maxVolume * 100)}%.`);

      const startedAt = performance.now();
      const fade = () => {
        if (!fallbackAudioRef.current) return;
        const progress = Math.min(1, (performance.now() - startedAt) / 900);
        fallbackAudioRef.current.volume = targetVolume * progress;
        if (progress < 1) fallbackFadeRef.current = requestAnimationFrame(fade);
        else fallbackFadeRef.current = null;
      };
      fallbackFadeRef.current = requestAnimationFrame(fade);

      if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
      autoCollapseRef.current = setTimeout(() => setIsAudioExpanded(false), silent ? 500 : 4000);
    };

    try {
      // iOS/Safari has been more reliable in this app with HTMLAudio fallback.
      // ROANOKE/ZM now chooses fallback intentionally instead of treating it as failure.
      if (attunementBudget.preferFallbackAudio) {
        await startFallback();
        return;
      }

      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') {
        addLog("Resuming AudioContext...");
        await ctx.resume();
      }

      if (ctx.state === 'running') {
        const now = ctx.currentTime;
        const mainGain = ctx.createGain();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, now);
        compressor.knee.setValueAtTime(24, now);
        compressor.ratio.setValueAtTime(8, now);
        compressor.attack.setValueAtTime(0.015, now);
        compressor.release.setValueAtTime(0.25, now);

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(targetVolume, now + 1.5);
        mainGain.connect(compressor);
        compressor.connect(ctx.destination);
        gainRef.current = mainGain;

        const normalization = 1 / Math.sqrt(audiblePillars.length || 1);
        addLog(`Laddering ${audiblePillars.length}/${pillars.length} harmonics (${attunementBudget.tier})...`);

        audiblePillars.forEach(pid => {
          const baseFreq = HARMONIC_FREQUENCIES[pid];
          if (!baseFreq) return;
          const freq = getAudibleFreq(baseFreq);
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          let initialGain = normalization * 0.28;
          if (breathMode === 'weave') {
            const isCurrent = pid === carrier.selectedPillars[breath.currentPillarIndex];
            initialGain = isCurrent ? 0.24 : 0.035;
          }

          pGain.gain.setValueAtTime(initialGain, now);
          osc.connect(pGain);
          pGain.connect(mainGain);
          osc.start(now);
          oscillatorsRef.current.push(osc);
          pillarGainsRef.current[pid] = pGain;
          addLog(`Harmonic: ${pid} (${freq}Hz)`);
        });

        setIsPlaying(true);
        setIsSessionActive(true);
        setError(null);
        addLog(`Web Audio engine active (${attunementBudget.tier})${silent ? ' (silent)' : ''}.`);

        if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
        autoCollapseRef.current = setTimeout(() => setIsAudioExpanded(false), silent ? 500 : 4000);
        return;
      }

      await startFallback();
    } catch (e) {
      addLog(`Engine Error: ${e}`);
      try {
        await startFallback();
      } catch (fallbackError) {
        addLog(`Fallback Error: ${fallbackError}`);
        setError("Audio could not start. Visual attunement remains available.");
      }
    }
  }, [carrier.selectedPillars, volume, addLog, attunementBudget, breath.currentPillarIndex, breathMode, isPlaying, stopAudio]);

  useEffect(() => {
    if (isSessionActive) {
      sessionTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(sessionTimerRef.current!);
            stopAudio();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isSessionActive, stopAudio]);

  useEffect(() => {
    const governedVolume = Math.min(volume, attunementBudget.maxVolume);
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(governedVolume, audioCtxRef.current.currentTime, 0.2);
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.volume = governedVolume;
    }
  }, [volume, attunementBudget.maxVolume]);

  useEffect(() => {
    if (isPlaying && breathMode === 'weave' && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const currentPillarId = carrier.selectedPillars[breath.currentPillarIndex];
      
      carrier.selectedPillars.forEach(pid => {
        const pGain = pillarGainsRef.current[pid];
        if (pGain) {
          const targetGain = pid === currentPillarId ? 0.3 : 0.05;
          pGain.gain.setTargetAtTime(targetGain, now, 0.5);
        }
      });
      addLog(`Dominant Harmonic: ${currentPillarId}`);
    }
  }, [breath.currentPillarIndex, isPlaying, breathMode, carrier.selectedPillars, addLog]);

  useEffect(() => {
    const stopForPageLifecycle = () => stopAudio();
    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden') stopAudio();
    };

    window.addEventListener('pagehide', stopForPageLifecycle);
    window.addEventListener('beforeunload', stopForPageLifecycle);
    document.addEventListener('visibilitychange', stopWhenHidden);

    return () => {
      window.removeEventListener('pagehide', stopForPageLifecycle);
      window.removeEventListener('beforeunload', stopForPageLifecycle);
      document.removeEventListener('visibilitychange', stopWhenHidden);
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  const handleExit = () => {
    stopAudio();
    onExit();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-midnight flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Visual Canvas Background - z-0 to z-20 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight via-emerald-950/20 to-midnight opacity-50" />
      </div>

      <div className="absolute inset-0 z-10">
        <HarmonicField pillars={carrier.selectedPillars} isPlaying={isPlaying} showComplexField={attunementBudget.showComplexField} />
      </div>
      
      {/* Breathing Orb Overlay - z-20 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <motion.div 
          animate={{ 
            scale: !breath.isActive ? (isPlaying ? [1.2, 2.5, 1.2] : [1, 2.2, 1]) : 
                   breath.phase === 'INHALE' ? 1 + breath.phaseProgress * 1.5 :
                   breath.phase === 'HOLD' ? 2.5 :
                   breath.phase === 'EXHALE' ? 2.5 - breath.phaseProgress * 1.5 :
                   1, // REST
            opacity: !breath.isActive ? (isPlaying ? [0.1, 0.25, 0.1] : [0.05, 0.15, 0.05]) :
                     breath.phase === 'INHALE' ? 0.05 + breath.phaseProgress * 0.25 :
                     breath.phase === 'HOLD' ? 0.3 :
                     breath.phase === 'EXHALE' ? 0.3 - breath.phaseProgress * 0.25 :
                     0.05,
          }}
          transition={{ 
            duration: !breath.isActive ? 10 : 0.1, 
            repeat: !breath.isActive ? Infinity : 0, 
            ease: "linear" 
          }}
          className="w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(246,224,179,0.1)_0%,transparent_70%)]"
        />
      </div>

      {/* TOP LEFT: Status Rail */}
      {!completed && (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-6 left-6 sm:top-10 sm:left-10 z-50 pointer-events-auto"
        >
          <div className="px-5 py-3 rounded-2xl bg-midnight/30 backdrop-blur-md border border-white/5 flex items-center gap-4 shadow-xl">
             <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gold tracking-widest">{formatTime(timeRemaining)}</span>
                <span className="text-[7px] font-black uppercase tracking-widest text-pearl/40">
                  {breathMode === 'weave' ? `${breath.round}/${breath.currentPillar.rounds} Rounds` : `${carrier.selectedPillars.length} Harmonics`}
                </span>
             </div>
             <div className="w-px h-6 bg-white/5" />
             <div className="flex flex-col">
                <span className="text-[8px] font-mono text-gold/40 truncate max-w-[100px]">
                  {breathMode === 'weave' ? `Current: ${breath.currentPillar.name}` : `Blend: ${carrier.selectedPillars.join(' + ')}`}
                </span>
                {breathMode === 'weave' && carrier.selectedPillars.length > 1 && (
                  <span className="text-[7px] font-black uppercase tracking-widest text-pearl/20 truncate max-w-[100px]">
                    Next: {carrier.selectedPillars[(breath.currentPillarIndex + 1) % carrier.selectedPillars.length]}
                  </span>
                )}
                {breathMode !== 'weave' && (
                   <span className="text-[7px] font-black uppercase tracking-widest text-pearl/20 truncate max-w-[80px]">{carrier.intentionText}</span>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {/* TOP RIGHT: Conclude Rail */}
      {!completed && (
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-50">
          <button 
            id="btn-conclude-attunement"
            onClick={() => { stopAudio(); setCompleted(true); }}
            className="px-5 py-3 bg-midnight/30 hover:bg-white/5 backdrop-blur-xl border border-white/10 text-pearl/40 hover:text-gold font-bold uppercase tracking-[0.2em] rounded-full active:scale-95 transition-all text-[9px] shadow-xl flex items-center gap-2 group"
          >
            <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-500" />
            <span>Conclude</span>
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT: Breath Guidance Drawer */}
      <AnimatePresence>
        {!completed && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 flex flex-col items-end gap-4"
          >
            {isBreathExpanded && !isGuidanceMinimized ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-panel p-6 rounded-[2rem] bg-midnight/40 backdrop-blur-md border border-white/10 space-y-4 shadow-2xl relative overflow-hidden w-full max-w-[320px]"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold/40" />
                <div className="flex justify-between items-start pl-2">
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Stage</span>
                    <span className="text-xs font-serif text-white">{breath.currentPillar.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-pearl/40">Round</span>
                    <span className="text-[10px] font-mono text-white">{breath.round} / {breath.currentPillar.rounds}</span>
                  </div>
                </div>

                <div className="py-4 flex flex-col items-center justify-center space-y-1">
                  <motion.div 
                    key={breath.phase}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl font-serif text-gold italic"
                  >
                    {breath.phase.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                  </motion.div>
                  <div className="text-3xl font-mono text-white/40">{breath.count}</div>
                  {!breath.isActive && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Ready</span>}
                </div>

                {breath.isActive && (
                  <div className="p-3 rounded-xl bg-gold/5 border border-gold/10 space-y-1 ml-2">
                    <p className="text-[9px] font-bold text-gold/60 uppercase tracking-widest">Guide</p>
                    <p className="text-[10px] text-pearl/80 italic leading-snug">
                      {breath.phase === 'INHALE' && breath.currentPillar.inhaleCue}
                      {breath.phase === 'EXHALE' && breath.currentPillar.exhaleCue}
                      {(breath.phase === 'HOLD' || breath.phase === 'REST') && "Hold gently..."}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-3">
                  {!breath.isActive ? (
                    <button 
                      onClick={breath.startGuidance}
                      className="w-full py-3 rounded-full border border-gold/30 bg-gold/5 text-gold font-bold uppercase tracking-widest text-[9px] hover:bg-gold/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Wind className="w-3.5 h-3.5" /> Start Guidance
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={breath.isPaused ? breath.resumeGuidance : breath.pauseGuidance}
                          className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-pearl/60 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          {breath.isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                          {breath.isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                          onClick={breath.stopGuidance}
                          className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-red-400/60 text-[9px] font-bold uppercase tracking-widest"
                        >
                          Stop
                        </button>
                      </div>
                      {breathMode === 'weave' && carrier.selectedPillars.length > 1 && (
                        <button 
                          onClick={breath.skipPillar}
                          className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-pearl/60 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <FastForward className="w-3 h-3" /> Skip to Next Pillar
                        </button>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                       breath.stopGuidance();
                       setIsBreathExpanded(false);
                    }}
                    className="text-[8px] font-black uppercase tracking-widest text-pearl/20 hover:text-pearl/40 pt-2"
                  >
                    Breathe Freely / Minimize
                  </button>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={() => setIsBreathExpanded(true)}
                className="cursor-pointer px-5 py-4 rounded-full bg-midnight/30 backdrop-blur-xl border border-white/5 flex items-center gap-4 shadow-xl hover:border-gold/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Wind className={`w-3.5 h-3.5 text-gold ${breath.isActive && !breath.isPaused ? 'animate-pulse' : 'opacity-40'}`} />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold/80">
                      {breath.isActive ? breath.currentPillar.name : (breathMode === 'free' ? 'Natural Breath' : 'Guided Breath')}
                    </span>
                    <span className="text-[7px] font-mono text-gold/40 mt-1 uppercase tracking-tighter">
                      {breath.isActive ? `${breath.phase} · ${breath.count}s` : (breathMode === 'free' ? 'No Countdown' : 'Select to Start')}
                    </span>
                  </div>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-widest text-pearl/30 group-hover:text-gold transition-colors">Guide</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM LEFT: Audio System Drawer */}
      <AnimatePresence>
        {!completed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-50 flex flex-col items-start gap-4"
          >
            {isAudioExpanded ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-panel p-6 rounded-[2rem] bg-midnight/40 backdrop-blur-md border border-white/10 space-y-6 shadow-2xl relative w-full max-w-[320px]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <button 
                      onClick={isPlaying ? stopAudio : startAudio}
                      className={`flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-white/5 text-gold border border-gold/30 hover:bg-white/10' : 'bg-gold text-midnight shadow-luminous hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                      {isPlaying ? (
                        <><Square className="w-3 h-3 fill-current" /> Stop Tone</>
                      ) : (
                        <><Play className="w-3 h-3 fill-current" /> Play Tone</>
                      )}
                    </button>
                    {!isPlaying && (
                      <button 
                        onClick={() => startAudio({ silent: true })}
                        className="flex-1 py-4 rounded-full bg-white/5 text-pearl/60 border border-white/10 font-bold uppercase tracking-widest text-[8px] hover:bg-white/10 transition-all"
                      >
                        Silence
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-pearl/40 uppercase tracking-widest">Resonant Volume</span>
                      <span className="text-[9px] font-mono text-gold/50">{Math.round(volume * 200)}%</span>
                    </div>
                    <label htmlFor="attunement-volume-range" className="sr-only">Resonant Volume</label>
                    <input 
                      id="attunement-volume-range"
                      name="attunement-volume"
                      type="range"
                      min="0"
                      max={attunementBudget.maxVolume}
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold hover:accent-gold/80 transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-[7px] text-red-400 font-bold uppercase tracking-wider">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-center flex-col gap-2">
                    <button 
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                      className="text-[7px] font-black uppercase tracking-widest text-pearl/20 hover:text-pearl/60 flex items-center justify-center gap-1.5"
                    >
                      <Info className="w-2.5 h-2.5" />
                      {showDiagnostics ? "Hide" : "Diagnostics"}
                    </button>
                    
                    {showDiagnostics && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-[7px] text-left text-pearl/40 max-h-40 overflow-y-auto">
                        <div className="space-y-1 pb-2 border-b border-white/5">
                          <div className="flex justify-between">
                            <span className="uppercase font-bold text-pearl/60">Engine</span>
                            <span className="text-gold uppercase">{fallbackAudioRef.current ? 'Safari' : 'Standard'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="uppercase font-bold text-pearl/60">Selected</span>
                            <span className="text-gold uppercase">{carrier.selectedPillars.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="uppercase font-bold text-pearl/60">ZM Tier</span>
                            <span className="text-gold uppercase">{attunementBudget.tier}</span>
                          </div>
                        </div>
                        <div className="space-y-1 opacity-60">
                          {logs.slice(-3).map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setIsAudioExpanded(false)}
                    className="text-[8px] font-black uppercase tracking-widest text-pearl/20 hover:text-pearl/40 pt-1"
                  >
                    Collapse
                  </button>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={() => setIsAudioExpanded(true)}
                className="cursor-pointer group"
              >
                <div className="px-6 py-4 rounded-full bg-midnight/30 backdrop-blur-xl border border-white/5 shadow-xl flex items-center gap-4 group-hover:border-gold/30 transition-all">
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-gold' : 'bg-pearl/20'}`} />
                    {isPlaying && <div className="absolute inset-0 w-2 h-2 rounded-full bg-gold animate-ping opacity-60" />}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isPlaying && volume > 0 ? 'text-gold/80' : 'text-pearl/40'}`}>
                      Harmonics
                    </span>
                    <span className="text-[7px] font-mono text-gold/40 mt-1 uppercase tracking-tighter">
                       Vol: {Math.round(volume * 200)}%
                    </span>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-pearl/30 group-hover:text-gold transition-colors">Adjust</span>
                    {isPlaying && (
                       <button 
                         onClick={(e) => { e.stopPropagation(); stopAudio(); }}
                         className="text-[9px] font-black uppercase tracking-widest text-red-400/40 hover:text-red-400 transition-colors"
                       >
                         Stop
                       </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Persistence Layer Consent Gate - z-100 */}
      <AnimatePresence>
        {showSafetyGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full glass-panel p-8 rounded-[3rem] border-gold/20 space-y-8 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gold/10">
                  <ShieldAlert className="w-8 h-8 text-gold" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-serif text-gold">Breath Safety Guidance</h2>
                <div className="space-y-4 text-sm text-pearl/70 leading-relaxed text-left">
                  <p>Breath guidance should feel gentle. Practice seated, standing still, or lying down.</p>
                  <p className="font-bold text-red-400/80">Do not use while driving, showering, or operating machinery.</p>
                  <p>If you feel dizzy, strained, panicky, or air-hungry, <span className="text-gold">return to natural breathing immediately.</span></p>
                  <p className="text-[10px] uppercase tracking-widest opacity-50">This is intended to gently bias physiological steadiness and is not medical treatment.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowSafetyGate(false);
                  onAcknowledgeSafety?.();
                }}
                className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                I understand — begin gently
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        {!completed ? (
          <>
            {/* Visual focus is primarily the background field. No overlapping UI in the center. */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[30%] h-[30%] border border-white/5 rounded-full opacity-10" />
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-lg space-y-10 px-6 sm:px-0 z-[60]"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60 underline decoration-gold/20 underline-offset-8">Attunement Session Complete</span>
              <h3 className="text-4xl font-serif text-white/95 italic">Reflect & Seal</h3>
              <p className="text-pearl/40 italic font-serif text-lg leading-relaxed">
                 Take a moment to name what shifted in your body, breath, or attention.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <label htmlFor="attunement-reflection" className="sr-only">Your reflection</label>
              <textarea 
                id="attunement-reflection"
                name="attunement-reflection"
                autoFocus
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What was found in the stillness?"
                className="w-full bg-midnight/60 border border-white/10 rounded-[2.5rem] p-8 text-pearl/80 focus:border-gold/30 focus:outline-none transition-all resize-none h-44 text-lg font-serif italic shadow-2xl"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { 
                    onSealReflection(reflection, {
                      source: 'attunement_chamber',
                      mode: volume > 0 ? 'audible' : 'silent',
                      finalVolume: volume,
                      pillars: carrier.selectedPillars,
                      sessionDuration: carrier.sessionDuration,
                      timeRemaining: timeRemaining,
                      completedNormally: timeRemaining === 0,
                      breathMetadata: {
                        mode: breathMode,
                        guided: breath.isActive || breath.round > 1,
                        roundsCompleted: breath.round,
                        pillarSequence: carrier.selectedPillars,
                        safetyAcknowledged: initialSafetyAcknowledged || !showSafetyGate
                      }
                    }); 
                    handleExit(); 
                  }}
                  className="flex-1 py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous active:scale-[0.98] transition-all text-[11px] flex items-center justify-center gap-2"
                >
                  Save Reflection to Codex
                </button>
                <button 
                  onClick={handleExit}
                  className="px-10 py-5 border border-white/10 text-pearl/40 font-bold uppercase tracking-widest rounded-full hover:bg-white/5 active:scale-[0.98] transition-all text-[10px]"
                >
                  Return Without Saving
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[9px] font-bold text-gold/30 uppercase tracking-[0.2em] leading-relaxed">
                   Saved locally to your private Codex.
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </motion.div>
  );
});
