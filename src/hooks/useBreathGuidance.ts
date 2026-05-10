
import { useState, useEffect, useRef, useCallback } from 'react';
import { BREATH_PILLARS, BreathPillar } from '../data/breathPillars';

export type BreathPhase = 'INHALE' | 'HOLD' | 'EXHALE' | 'REST' | 'WITNESS';

interface BreathGuidanceState {
  currentPillarIndex: number;
  phase: BreathPhase;
  count: number;          // Whole seconds remaining for display
  phaseProgress: number;  // 0.0 to 1.0 within current phase
  round: number;
  isActive: boolean;
  isPaused: boolean;
}

export const useBreathGuidance = (selectedPillarIds: string[], mode: 'weave' | 'blend' | 'free') => {
  const [state, setState] = useState<BreathGuidanceState>({
    currentPillarIndex: 0,
    phase: 'WITNESS',
    count: 0,
    phaseProgress: 0,
    round: 1,
    isActive: false,
    isPaused: false
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const accumulatedPausedTimeRef = useRef<number>(0);
  const lastTickStateUpdateRef = useRef<number>(0);
  
  const selectedPillars = BREATH_PILLARS.filter(p => selectedPillarIds.includes(p.id));
  const currentPillar = selectedPillars[state.currentPillarIndex] || BREATH_PILLARS[0];

  const stopGuidance = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false, phase: 'WITNESS', phaseProgress: 0 }));
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    startTimeRef.current = 0;
    accumulatedPausedTimeRef.current = 0;
  }, []);

  const startGuidance = useCallback(() => {
    stopGuidance();
    startTimeRef.current = performance.now();
    setState(prev => ({ 
      ...prev, 
      isActive: true, 
      isPaused: false, 
      phase: 'INHALE', 
      count: currentPillar.breathPattern.inhale, 
      phaseProgress: 0,
      round: 1,
      currentPillarIndex: 0
    }));
  }, [currentPillar, stopGuidance]);

  const pauseGuidance = useCallback(() => {
    if (!state.isPaused) {
      pausedTimeRef.current = performance.now();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isPaused]);

  const resumeGuidance = useCallback(() => {
    if (state.isPaused) {
      accumulatedPausedTimeRef.current += (performance.now() - pausedTimeRef.current);
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isPaused]);

  const skipPillar = useCallback(() => {
    setState(prev => {
      const nextIndex = (prev.currentPillarIndex + 1) % selectedPillars.length;
      // We essentially "reset" the start time to now to align with the new pillar
      startTimeRef.current = performance.now();
      accumulatedPausedTimeRef.current = 0;
      return { 
        ...prev, 
        currentPillarIndex: nextIndex, 
        round: 1, 
        phase: 'INHALE', 
        count: selectedPillars[nextIndex].breathPattern.inhale,
        phaseProgress: 0
      };
    });
  }, [selectedPillars]);

  useEffect(() => {
    if (!state.isActive || state.isPaused) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current - accumulatedPausedTimeRef.current) / 1000;
      const shouldUpdateState = now - lastTickStateUpdateRef.current >= 140;

      if (!shouldUpdateState) {
        timerRef.current = requestAnimationFrame(tick);
        return;
      }

      lastTickStateUpdateRef.current = now;

      setState(prev => {
        const pillar = selectedPillars[prev.currentPillarIndex];
        if (!pillar) return prev;
        
        const pattern = pillar.breathPattern;
        const inhaleDur = pattern.inhale;
        const holdDur = pattern.pauseBeforeExhale || 0;
        const exhaleDur = pattern.exhale;
        const restDur = pattern.pauseAfterExhale || 0;
        const fullCycleDur = inhaleDur + holdDur + exhaleDur + restDur;

        const totalElapsedInPillar = elapsed; // This isn't quite right if we transition, let's refine.
        // Actually, let's calculate based on rounds.
        
        const totalRounds = pillar.rounds;
        const totalPillarDuration = fullCycleDur * totalRounds;

        if (elapsed >= totalPillarDuration) {
          if (selectedPillars.length > 1 && mode === 'weave' && prev.currentPillarIndex < selectedPillars.length - 1) {
            // Move to next pillar
            startTimeRef.current = now;
            accumulatedPausedTimeRef.current = 0;
            return {
              ...prev,
              currentPillarIndex: prev.currentPillarIndex + 1,
              round: 1,
              phase: 'INHALE',
              count: selectedPillars[prev.currentPillarIndex + 1].breathPattern.inhale,
              phaseProgress: 0
            };
          } else {
            // End of session
            return { ...prev, isActive: false, phase: 'WITNESS', phaseProgress: 0, count: 0 };
          }
        }

        const currentRound = Math.floor(elapsed / fullCycleDur) + 1;
        const timeInRound = elapsed % fullCycleDur;

        let currentPhase: BreathPhase = 'INHALE';
        let phaseElapsed = 0;
        let phaseTotal = inhaleDur;

        if (timeInRound < inhaleDur) {
          currentPhase = 'INHALE';
          phaseElapsed = timeInRound;
          phaseTotal = inhaleDur;
        } else if (timeInRound < inhaleDur + holdDur) {
          currentPhase = 'HOLD';
          phaseElapsed = timeInRound - inhaleDur;
          phaseTotal = holdDur;
        } else if (timeInRound < inhaleDur + holdDur + exhaleDur) {
          currentPhase = 'EXHALE';
          phaseElapsed = timeInRound - (inhaleDur + holdDur);
          phaseTotal = exhaleDur;
        } else {
          currentPhase = 'REST';
          phaseElapsed = timeInRound - (inhaleDur + holdDur + exhaleDur);
          phaseTotal = restDur;
        }

        const progress = phaseElapsed / phaseTotal;
        const remaining = Math.ceil(phaseTotal - phaseElapsed);

        return {
          ...prev,
          phase: currentPhase,
          count: remaining,
          phaseProgress: progress,
          round: currentRound,
        };
      });

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [state.isActive, state.isPaused, state.currentPillarIndex, selectedPillars, mode]);

  return {
    ...state,
    currentPillar,
    startGuidance,
    pauseGuidance,
    resumeGuidance,
    stopGuidance,
    skipPillar
  };
};
