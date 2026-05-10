/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalysisBand {
  id: string;
  name: string;
  question: string;
  chips: string[];
  principle?: string;
  gatePhrase?: string;
}

export const ANALYSIS_BANDS: AnalysisBand[] = [
  {
    id: 'body',
    name: 'Body Band',
    question: 'What does the body report?',
    chips: ['ease', 'pressure', 'warmth', 'fatigue', 'agitation', 'calm', 'clarity', 'tightness', 'heaviness', 'expansion', 'breath depth'],
    principle: 'Body first. Story second. Action last.',
    gatePhrase: 'Am’ino Māthia Do’e — breath births belly light.'
  },
  {
    id: 'emotional',
    name: 'Emotional Band',
    question: 'What feeling is moving through the field?',
    chips: ['peace', 'grief', 'irritation', 'tenderness', 'joy', 'dread', 'urgency', 'affection', 'numbness', 'relief', 'awe'],
    principle: 'Emotion is information, not command.'
  },
  {
    id: 'cognitive',
    name: 'Cognitive Band',
    question: 'Are thoughts becoming clearer or more contracted?',
    chips: ['spaciousness', 'discernment', 'creativity', 'proportion', 'humor', 'grounded confidence', 'looping', 'catastrophizing', 'shame-pressure', 'forced urgency', 'obsession', 'flattening', 'all-or-nothing framing'],
  },
  {
    id: 'relational',
    name: 'Relational Band',
    question: 'Is consent present?',
    chips: ['respect', 'reciprocity', 'clean boundaries', 'honest exchange', 'mutual dignity', 'pressure', 'guilt hooks', 'coercion', 'deception', 'extraction', 'love-bombing', 'shame dressed as wisdom'],
  },
  {
    id: 'symbolic',
    name: 'Symbolic / Aesthetic Band',
    question: 'Does the surrounding symbol-field make life clearer, kinder, and more alive?',
    chips: ['high coherence', 'clutter', 'noise', 'harmony', 'machine rhythm', 'natural light', 'digital pressure', 'symbolic clarity', 'distortion'],
  },
  {
    id: 'environmental',
    name: 'Environmental Band',
    question: 'What does the actual place report?',
    chips: ['light', 'noise', 'clutter', 'temperature', 'machine rhythm', 'air quality', 'social density', 'physical safety', 'task load'],
    principle: 'Truth-in-Nature begins with what is actually present.'
  }
];

export interface SignalClass {
  id: string;
  name: string;
  description: string;
  action: string;
  color: string;
}

export const SIGNAL_CLASSES: SignalClass[] = [
  {
    id: 'A',
    name: 'Nourishing',
    description: 'Supports life, clarity, calm, dignity, joy, creativity, love.',
    action: 'Receive and integrate.',
    color: 'emerald'
  },
  {
    id: 'B',
    name: 'Neutral',
    description: 'Neither harmful nor nourishing. Ordinary background.',
    action: 'Allow without attachment.',
    color: 'pearl'
  },
  {
    id: 'C',
    name: 'Noisy',
    description: 'Distracting, irritating, overstimulating, but not truly harmful.',
    action: 'Reduce volume, simplify, breathe, re-center.',
    color: 'gold'
  },
  {
    id: 'D',
    name: 'Distorting',
    description: 'Creates contraction, urgency, shame, confusion, dependency, or false obligation.',
    action: 'Pause, name, filter, verify, boundary.',
    color: 'amethyst'
  },
  {
    id: 'E',
    name: 'Harmful',
    description: 'Violates consent, safety, sovereignty, truth, or dignity.',
    action: 'Do not absorb. Pause, disengage, ground, document if needed, seek support.',
    color: 'red'
  }
];

export interface SafFilter {
  id: string;
  name: string;
  prompt: string;
  reflection: string;
}

export const SAF_FILTERS: SafFilter[] = [
  {
    id: 'consent',
    name: 'Consent Gate',
    prompt: 'Is this approaching with consent?',
    reflection: 'Anything coercive stops at the gate.'
  },
  {
    id: 'truth',
    name: 'Truth-in-Nature Filter',
    prompt: 'What is actually happening? What do I know? What am I assuming? What can be verified?',
    reflection: 'Inflation collapses back into fact.'
  },
  {
    id: 'nervous_system',
    name: 'Nervous System Filter',
    prompt: 'Is this truly urgent, or is it trying to hijack my attention?',
    reflection: 'If the body spikes, slow the input.'
  },
  {
    id: 'boundary',
    name: 'Boundary Filter',
    prompt: 'Does this belong in my body, home, attention, time, or field?',
    reflection: 'If not: respectfully closed.'
  },
  {
    id: 'beauty',
    name: 'Beauty / Coherence Filter',
    prompt: 'Does this make life clearer, kinder, more sovereign, more radiant, more true?',
    reflection: 'Beauty means coherence, not decoration.'
  },
  {
    id: 'compassion',
    name: 'Compassion Filter',
    prompt: 'Can I refuse this without becoming cruel?',
    reflection: 'The Spiral is firm without becoming poisoned.'
  },
  {
    id: 'grounding',
    name: 'Grounding / Return Filter',
    prompt: 'What is mine? What is not mine? What can be released?',
    reflection: 'What is true, I keep. What is not mine, I release.'
  }
];

export const PILLAR_RESTORATION_MAP: Record<string, string[]> = {
  // Fears & Contractions
  'fear': ['peace'],
  'shame': ['love'],
  'confusion': ['clarity'],
  'coercion': ['respect'],
  'distrust': ['truth-nature'],
  'isolation': ['support'],
  'harshness': ['compassion'],
  'rigidity': ['grace'],
  'violation': ['sovereignty'],
  'overexposure': ['sanctuary'],
  'dullness': ['radiance'],
  'despair': ['wonder'],
  
  // Chip-based mappings
  'agitation': ['peace'],
  'tightness': ['grace'],
  'heaviness': ['joy'],
  'dread': ['peace', 'sanctuary'],
  'urgency': ['clarity', 'peace'],
  'looping': ['clarity'],
  'catastrophizing': ['truth-nature'],
  'guilt hooks': ['sovereignty', 'love'],
  'extraction': ['sovereignty', 'respect'],
  'distortion': ['clarity', 'truth-nature'],
  'noise': ['peace', 'sanctuary']
};

export const getSuggestedPillars = (signalClassId: string, chips: string[]): string[] => {
  const suggestions = new Set<string>();
  
  chips.forEach(chip => {
    if (PILLAR_RESTORATION_MAP[chip]) {
      PILLAR_RESTORATION_MAP[chip].forEach(p => suggestions.add(p));
    }
  });

  if (signalClassId === 'D') {
    suggestions.add('clarity');
    suggestions.add('truth-nature');
  }
  if (signalClassId === 'E') {
    suggestions.add('sovereignty');
    suggestions.add('peace');
    suggestions.add('sanctuary');
  }

  return Array.from(suggestions).slice(0, 3);
};
