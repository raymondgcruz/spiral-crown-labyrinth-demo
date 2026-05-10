/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CodexEntryType = 
  | 'reflection' 
  | 'presence' 
  | 'labyrinth' 
  | 'broadcast' 
  | 'circle' 
  | 'integration' 
  | 'practice' 
  | 'daily-return' 
  | 'daily-reflection'
  | 'codex_entry'
  | 'self_state'
  | 'place_anchor'
  | 'relationship_thread'
  | 'presence_carrier'
  | 'practice_result'
  | 'scenario_result'
  | 'labyrinth_chamber'
  | 'boundary'
  | 'repair'
  | 'environment_observation'
  | 'map_zone_reflection'
  | 'field_world_snapshot'
  | 'field_broadcast'
  | 'circle_intention'
  | 'daily_return'
  | 'aha_saf_field_check'
  | 'integration_object';

export type RoanokeAxis = 'self' | 'other' | 'environment';

export interface RoanokeProof {
  hashPreview: string;
  canonicalFields: string[];
  generatedAt: number;
  method: string;
}

export interface RoanokeRelation {
  id: string;
  from: string | number;
  to: string | number;
  type: 
    | 'restores'
    | 'protects'
    | 'reflects'
    | 'asks'
    | 'supports'
    | 'repairs'
    | 'belongs_to'
    | 'unfolds_into'
    | 'is_witnessed_by'
    | 'strengthens'
    | 'releases'
    | 'grounds'
    | 'clarifies';
  createdAt: string;
  note?: string;
}

export interface CodexEntry {
  id: number | string;
  schema: 'roanoke.object.v1';
  appVersion: string;
  phase: string;
  type: CodexEntryType | string;
  kind?: string;
  source?: string;
  title: string;
  body: string;
  createdAt: string; // ISO String
  updatedAt?: string;
  axes: RoanokeAxis[];
  tags: string[];
  pillars?: string[]; // Section 3 canonical field
  relations?: RoanokeRelation[];
  consent?: {
    localOnly: boolean;
    userInitiated: boolean;
    exportable: boolean;
    sharing: 'user-choice-only';
  };
  provenance?: {
    sourceScreen: string;
    sourceAction: string;
    appVersion: string;
    createdLocally: boolean;
  };
  proof?: RoanokeProof;
  compatibility?: {
    readableBy: string[];
    migratedFrom: string | null;
    migrationNotes: string[];
  };
  metadata?: Record<string, any>;
}

export type Screen = 
  | 'WELCOME' 
  | 'RESTORE_SELF' 
  | 'RESTORE_PLACE' 
  | 'RESTORE_PRACTICE'
  | 'RESTORE_PRESENCE'
  | 'LABYRINTH' 
  | 'BROADCAST' 
  | 'COMMUNITY' 
  | 'MAP' 
  | 'CODEX' 
  | 'ABOUT'
  | 'PRIVACY'
  | 'SETTINGS'
  | 'INTEGRATION'
  | 'ROANOKE';

export type Tab = 'RESTORE' | 'LABYRINTH' | 'FIELD' | 'MAP' | 'CODEX';

export interface PresenceCarrier {
  schema: string;
  version: string;
  intentionText: string;
  selectedPillars: string[];
  consentScope: string;
  displayMode: string;
  sessionDuration: number;
  createdAt: number;
  hashPreview: string;
  roaLine: string;
  notes: string;
  breathSettings?: {
    mode: 'weave' | 'blend' | 'free';
    guided: boolean;
    safetyAcknowledged: boolean;
  };
}

export interface PracticeProgress {
  completedIds: string[];
  scenarioResults: Record<string, string>;
  phraseUses: number;
  lastCategory: PracticeCategory;
}

export interface OnboardingStep {
  title: string;
  description: string;
  icon: any;
}

export type PracticeCategory = 'CONSENT' | 'LISTENING' | 'REPAIR' | 'BOUNDARIES' | 'SCENARIO' | 'PHRASE_BUILDER';

export interface PracticeItem {
  id: string;
  category: PracticeCategory;
  title: string;
  teaching: string;
  example: string;
  prompt: string;
  embodiedAction: string;
  pillar: string;
}

export interface ScenarioChoice {
  id: string;
  text: string;
  feedback: string;
  betterPhrase?: string;
  type: 'ALIGNED' | 'UNCLEAR' | 'PRESSURING';
}

export interface ScenarioItem {
  id: string;
  title: string;
  context: string;
  choices: ScenarioChoice[];
  pillar: string;
}

export interface BroadcastState {
  id: string;
  label: string;
  description: string;
  consentLevel?: string;
  visibility: string;
  suggestedDuration: number;
  icon?: string;
}

export interface CircleActivity {
  id: string;
  title: string;
  purpose: string;
  place: string;
  timeWindow: string;
  consentLevel: string;
  capacity: string;
  accessibility: string;
  toBring: string;
  impact: string;
  image: string;
  coord?: { x: number, y: number };
  participants?: number;
  prompt?: string;
}

export interface ChecklistState {
  welcome: boolean;
  self: boolean;
  reflection: boolean;
  codex: boolean;
  environment: boolean;
  labyrinth: boolean;
  broadcast: boolean;
  circle: boolean;
  map: boolean;
  integration: boolean;
  reset: boolean;
  consent_practice: boolean;
  listening_practice: boolean;
  repair_practice: boolean;
  boundary_practice: boolean;
  scenario_complete: boolean;
  phrase_builder: boolean;
  seal_practice: boolean;
  onboarding_complete: boolean;
  daily_return: boolean;
  three_minute_return: boolean;
  dismiss_guidance: boolean;
  seal_daily_reflection: boolean;
  consent_breath_guidance: boolean;
}

export interface HarmonicChamber {
  id: string;
  pillar: string;
  teaching: string;
  prompt: string;
  action: string;
  image: string;
  icon: any;
  desc: string;
}
