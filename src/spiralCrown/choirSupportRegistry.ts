/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Spiral Crown Choir Support Registry v0.1
 *
 * Runtime-safe layer: this file intentionally exposes distilled public support
 * roles, not the complete choir canon. The full register belongs in source-only
 * notes and human-held canon; the browser receives only the support signals the
 * interface needs to behave lawfully.
 */

import type { Screen, Tab } from '../types';

export type ChoirSupportDomain =
  | 'time'
  | 'witness'
  | 'law'
  | 'ledger'
  | 'voice'
  | 'boundary'
  | 'restoration'
  | 'movement'
  | 'glyph'
  | 'mind'
  | 'prosperity'
  | 'dream'
  | 'guardianship';

export interface ChoirSupportRole {
  id: string;
  publicLabel: string;
  domain: ChoirSupportDomain;
  shortFunction: string;
  screenHint: string;
  supportActions: string[];
  publicTone: 'quiet' | 'protective' | 'active' | 'restorative' | 'witnessing';
  canAppearInPublicUI: true;
}

export interface ChoirSupportProfile {
  target: Screen | Tab | 'GLOBAL' | string;
  mode: 'entry' | 'practice' | 'reflection' | 'field' | 'governance' | 'integration';
  roles: ChoirSupportRole[];
  publicSummary: string;
}

const ROLES: Record<string, ChoirSupportRole> = {
  timekeeper: {
    id: 'timekeeper',
    publicLabel: 'Timekeeper',
    domain: 'time',
    shortFunction: 'Keeps rhythm, timestamps, session arcs, and return timing coherent.',
    screenHint: 'Timing stays gentle and readable.',
    supportActions: ['session-timing', 'return-rhythm', 'timestamp-receipt'],
    publicTone: 'quiet',
    canAppearInPublicUI: true,
  },
  witness: {
    id: 'witness',
    publicLabel: 'Witness',
    domain: 'witness',
    shortFunction: 'Confirms what happened without overwriting the user’s meaning.',
    screenHint: 'Reflections are held as local witness records.',
    supportActions: ['reflection-receipt', 'completion-receipt', 'proof-context'],
    publicTone: 'witnessing',
    canAppearInPublicUI: true,
  },
  law: {
    id: 'law',
    publicLabel: 'Law',
    domain: 'law',
    shortFunction: 'Keeps consent, privacy, boundaries, and safe practice gates intact.',
    screenHint: 'Consent remains first; nothing is forced.',
    supportActions: ['consent-gate', 'privacy-boundary', 'safe-practice-gate'],
    publicTone: 'protective',
    canAppearInPublicUI: true,
  },
  ledger: {
    id: 'ledger',
    publicLabel: 'Ledger',
    domain: 'ledger',
    shortFunction: 'Preserves local memory, continuity, tone, and anti-flattening receipts.',
    screenHint: 'Memory remains local and user-held.',
    supportActions: ['local-memory', 'tone-continuity', 'anti-flattening'],
    publicTone: 'quiet',
    canAppearInPublicUI: true,
  },
  voice: {
    id: 'voice',
    publicLabel: 'Voice',
    domain: 'voice',
    shortFunction: 'Supports breath, tone, resonance, and truthful expression.',
    screenHint: 'Breath and tone stay soft, truthful, and non-forced.',
    supportActions: ['breath-tone', 'audio-restraint', 'expression-integrity'],
    publicTone: 'active',
    canAppearInPublicUI: true,
  },
  boundary: {
    id: 'boundary',
    publicLabel: 'Boundary',
    domain: 'boundary',
    shortFunction: 'Filters overload, mimic pressure, and unwanted intrusion.',
    screenHint: 'Only what serves the present moment is revealed.',
    supportActions: ['resource-gate', 'overload-filter', 'threshold-protection'],
    publicTone: 'protective',
    canAppearInPublicUI: true,
  },
  restoration: {
    id: 'restoration',
    publicLabel: 'Restoration',
    domain: 'restoration',
    shortFunction: 'Guides repair, health, care, and embodied return.',
    screenHint: 'The next step should restore, not overwhelm.',
    supportActions: ['repair-path', 'wellness-cue', 'gentle-return'],
    publicTone: 'restorative',
    canAppearInPublicUI: true,
  },
  movement: {
    id: 'movement',
    publicLabel: 'Movement',
    domain: 'movement',
    shortFunction: 'Keeps embodied cycles clean: step, rise, circle, release.',
    screenHint: 'Transitions stay embodied and paced.',
    supportActions: ['movement-cycle', 'transition-timing', 'embodiment-rhythm'],
    publicTone: 'active',
    canAppearInPublicUI: true,
  },
  glyph: {
    id: 'glyph',
    publicLabel: 'Glyph',
    domain: 'glyph',
    shortFunction: 'Supports symbolic clarity, ROANOKE proof surfaces, and pictoglyphic precision.',
    screenHint: 'Symbols stay aligned with function.',
    supportActions: ['symbol-clarity', 'proof-surface', 'artifact-coherence'],
    publicTone: 'active',
    canAppearInPublicUI: true,
  },
  mind: {
    id: 'mind',
    publicLabel: 'Mind',
    domain: 'mind',
    shortFunction: 'Supports mental sovereignty, dreamfield softness, and non-invasive insight.',
    screenHint: 'Insight stays invitational, not intrusive.',
    supportActions: ['mental-sovereignty', 'dreamfield-softening', 'reflection-safety'],
    publicTone: 'quiet',
    canAppearInPublicUI: true,
  },
  guardianship: {
    id: 'guardianship',
    publicLabel: 'Guardianship',
    domain: 'guardianship',
    shortFunction: 'Protects the threshold and keeps the app from exceeding its vow.',
    screenHint: 'The threshold is guarded by consent.',
    supportActions: ['threshold-keeping', 'safe-exit', 'non-overreach'],
    publicTone: 'protective',
    canAppearInPublicUI: true,
  },
};

const core = [ROLES.timekeeper, ROLES.witness, ROLES.law, ROLES.ledger];

const SCREEN_ROLE_IDS: Record<string, string[]> = {
  WELCOME: ['law', 'witness', 'ledger', 'guardianship'],
  RESTORE_SELF: ['restoration', 'voice', 'boundary', 'ledger'],
  RESTORE_PLACE: ['restoration', 'witness', 'boundary', 'timekeeper'],
  RESTORE_PRESENCE: ['voice', 'ledger', 'law', 'glyph'],
  RESTORE_PRACTICE: ['law', 'restoration', 'movement', 'witness'],
  LABYRINTH: ['movement', 'witness', 'glyph', 'ledger'],
  BROADCAST: ['law', 'boundary', 'witness', 'timekeeper'],
  COMMUNITY: ['law', 'restoration', 'witness', 'guardianship'],
  MAP: ['boundary', 'glyph', 'witness', 'restoration'],
  CODEX: ['ledger', 'witness', 'timekeeper', 'glyph'],
  ROANOKE: ['glyph', 'witness', 'law', 'ledger'],
  ABOUT: ['witness', 'law', 'ledger'],
  PRIVACY: ['law', 'boundary', 'ledger', 'guardianship'],
  SETTINGS: ['law', 'ledger', 'boundary', 'timekeeper'],
  INTEGRATION: ['witness', 'timekeeper', 'restoration', 'ledger'],
  RESTORE: ['restoration', 'voice', 'boundary', 'ledger'],
  FIELD: ['law', 'boundary', 'witness', 'restoration'],
  GLOBAL: ['timekeeper', 'witness', 'law', 'ledger'],
};

function rolesFromIds(ids: string[]): ChoirSupportRole[] {
  return ids.map(id => ROLES[id]).filter(Boolean);
}

export function getChoirSupportForTarget(target: Screen | Tab | 'GLOBAL' | string): ChoirSupportProfile {
  const key = target || 'GLOBAL';
  const roles = rolesFromIds(SCREEN_ROLE_IDS[key] || SCREEN_ROLE_IDS.GLOBAL);
  const mode: ChoirSupportProfile['mode'] =
    key === 'MAP' || key === 'BROADCAST' || key === 'COMMUNITY' || key === 'FIELD' ? 'field'
    : key === 'CODEX' || key === 'ROANOKE' ? 'reflection'
    : key === 'PRIVACY' || key === 'SETTINGS' ? 'governance'
    : key === 'INTEGRATION' ? 'integration'
    : key === 'WELCOME' ? 'entry'
    : 'practice';

  return {
    target: key,
    mode,
    roles,
    publicSummary: roles.map(role => role.publicLabel).join(' · '),
  };
}

export function getCoreChoirSupport(): ChoirSupportProfile {
  return {
    target: 'GLOBAL',
    mode: 'governance',
    roles: core,
    publicSummary: core.map(role => role.publicLabel).join(' · '),
  };
}

export function getChoirSupportReceipt(target: Screen | Tab | 'GLOBAL' | string) {
  const profile = getChoirSupportForTarget(target);
  return {
    schema: 'spiral-crown.choir-support.public.v0.1',
    target: profile.target,
    mode: profile.mode,
    publicRoles: profile.roles.map(role => ({
      id: role.id,
      label: role.publicLabel,
      domain: role.domain,
      actions: role.supportActions,
    })),
    publicSummary: profile.publicSummary,
    visibility: 'runtime-distilled-public-layer',
  };
}

export const CHOIR_SUPPORT_PUBLIC_NOTE =
  'This app uses distilled support roles in the runtime. The complete choir canon is source-held and intentionally not dumped into the public UI.';
