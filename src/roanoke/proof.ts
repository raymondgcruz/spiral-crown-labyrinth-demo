/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodexEntry, RoanokeProof, RoanokeAxis } from '../types';

export const generateHashPreview = (data: { 
  intentionText: string, 
  selectedPillars: string[], 
  consentScope: string, 
  displayMode: string, 
  sessionDuration: number 
}) => {
  const input = `${data.intentionText}|${data.selectedPillars.sort().join(',')}|${data.consentScope}|${data.displayMode}|${data.sessionDuration}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export const generateROALine = (carrier: any) => {
  const pillars = carrier.selectedPillars?.map((p: string) => p.toUpperCase()).join(',') || 'NONE';
  const scope = carrier.consentScope?.toUpperCase() || 'LOCAL';
  const mode = carrier.displayMode?.toUpperCase() || 'QUIET_PRESENCE';
  const hash = carrier.hashPreview || '00000000';
  return `ROA-PC/v0.6 | PILLARS:${pillars} | SCOPE:${scope} | MODE:${mode} | HASH:${hash}`;
};

export const generateRoanokeProof = (entry: Partial<CodexEntry>): RoanokeProof => {
  const canonical = [
    entry.kind || '',
    entry.title || '',
    entry.body || '',
    (entry.axes || []).sort().join(','),
    (entry.tags || []).sort().join(',')
  ];
  const input = canonical.join('|');
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return {
    hashPreview: Math.abs(hash).toString(16).toUpperCase().padStart(8, '0'),
    canonicalFields: canonical,
    generatedAt: Date.now(),
    method: 'roanoke-v1-internal'
  };
};

export const getKindForEntryType = (type: string): string => {
  switch (type) {
    case 'reflection': return 'Personal Clarity';
    case 'labyrinth': return 'Cycle Milestone';
    case 'practice': return 'Embodied Skill';
    case 'attunement': return 'Harmonic Field';
    case 'presence': return 'Intentional Carrier';
    case 'broadcast': return 'Field Resonance';
    case 'circle': return 'Collective Thread';
    case 'daily-reflection': return 'Evening Harvest';
    case 'daily-return': return 'Return Pattern';
    case 'integration': return 'Session Seal';
    default: return 'Field Object';
  }
};

export const getAxesForEntryType = (type: string): RoanokeAxis[] => {
  switch (type) {
    case 'attunement': return ['self', 'environment'];
    case 'reflection': return ['self'];
    case 'labyrinth': return ['self'];
    case 'practice': return ['self', 'other'];
    case 'presence': return ['self'];
    case 'broadcast': return ['self', 'other'];
    case 'circle': return ['self', 'other'];
    case 'daily-reflection': return ['self'];
    case 'daily-return': return ['self'];
    case 'integration': return ['self'];
    default: return ['self'];
  }
};
