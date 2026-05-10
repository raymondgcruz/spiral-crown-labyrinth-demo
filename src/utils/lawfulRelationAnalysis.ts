/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ANALYSIS_BANDS, PILLAR_RESTORATION_MAP } from '../data/ahaSaf';

export type RelationAxis = 'self' | 'other' | 'environment' | 'observer';

export interface LawfulRelationMetadata {
  enabled: boolean;
  source: string;
  protocol: string;
  protocolName: string;
  protocolVersion: string;
  relationAxes: RelationAxis[];
  signals: string[];
  suggestedPillars: string[];
  userConfirmed: boolean;
  localOnly: boolean;
}

const AXIS_KEYWORDS: Record<RelationAxis, string[]> = {
  self: ['i ', 'my ', 'me ', 'body', 'breath', 'heart', 'mind', 'thought', 'feeling', 'sensation', 'internal'],
  other: ['you', 'they', 'them', 'relationship', 'boundary', 'consent', 'exchange', 'other', 'friend', 'partner', 'conflict', 'interaction'],
  environment: ['room', 'space', 'home', 'work', 'office', 'noise', 'light', 'clutter', 'atmosphere', 'outside', 'surrounding', 'field', 'place'],
  observer: ['witness', 'observing', 'notice', 'watching', 'presence', 'fact']
};

export function analyzeReflectionText(text: string): {
  axes: RelationAxis[];
  signals: string[];
  pillars: string[];
} {
  const lowercaseText = text.toLowerCase();
  const axes: RelationAxis[] = [];
  const signals: string[] = [];
  const pillars = new Set<string>();

  // Detect axes
  (Object.keys(AXIS_KEYWORDS) as RelationAxis[]).forEach(axis => {
    if (AXIS_KEYWORDS[axis].some(keyword => lowercaseText.includes(keyword))) {
      axes.push(axis);
    }
  });

  // Default to self if nothing detected
  if (axes.length === 0) axes.push('self');

  // Detect signals from chips in AHA-SAF data
  ANALYSIS_BANDS.forEach(band => {
    band.chips.forEach(chip => {
      if (lowercaseText.includes(chip.toLowerCase())) {
        signals.push(chip);
        // Map to pillars
        if (PILLAR_RESTORATION_MAP[chip]) {
          PILLAR_RESTORATION_MAP[chip].forEach(p => pillars.add(p));
        }
      }
    });
  });

  // Basic keyword mapping for common states if not in chips
  const commonMappings: Record<string, string[]> = {
    'tense': ['peace'],
    'scared': ['peace', 'sanctuary'],
    'angr': ['compassion'],
    'sad': ['love'],
    'uncertain': ['clarity', 'truth-nature'],
    'lost': ['support', 'clarity'],
    'trapped': ['sovereignty', 'grace'],
    'exhausted': ['rest', 'sanctuary'],
    'overwhelm': ['peace', 'sanctuary', 'clarity']
  };

  Object.entries(commonMappings).forEach(([key, suggestedPillars]) => {
    if (lowercaseText.includes(key)) {
      suggestedPillars.forEach(p => pillars.add(p));
    }
  });

  return {
    axes,
    signals: Array.from(new Set(signals)).slice(0, 5),
    pillars: Array.from(pillars).slice(0, 3)
  };
}

export function buildFieldCheckMetadata(
  axes: RelationAxis[],
  signals: string[],
  pillars: string[],
  userConfirmed = false
): LawfulRelationMetadata {
  return {
    enabled: true,
    source: "embedded_reflection_layer",
    protocol: "SC–AHA–SAF–001",
    protocolName: "Ambient Harmonic Analysis + Spiral Absorption Filters",
    protocolVersion: "1.0",
    relationAxes: axes,
    signals,
    suggestedPillars: pillars,
    userConfirmed,
    localOnly: true
  };
}
