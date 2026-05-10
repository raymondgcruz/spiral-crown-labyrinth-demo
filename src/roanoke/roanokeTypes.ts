/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodexEntry } from '../types';

export type RoanokeObjectType =
  | 'reflection'
  | 'practice'
  | 'presence'
  | 'labyrinth'
  | 'attunement'
  | 'map'
  | 'broadcast'
  | 'community'
  | 'imported';

export interface RoanokeConsent {
  localOnly: true;
  userInitiated: boolean;
  exportable: boolean;
  sharing: 'user-choice-only' | 'private' | 'blocked';
}

export interface RoanokeProofBundle {
  method: 'sha256' | 'roanoke-fallback-preview';
  hash: string;
  hashPreview: string;
  canonicalFields: string[];
  generatedAt: string;
  appVersion?: string;
  parentHash?: string | null;
}

export interface RoanokeCompatibility {
  readableBy: string[];
  migratedFrom: string | null;
  migrationNotes: string[];
}

export interface RoanokeRelationEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  createdAt: string;
  note?: string;
  userApproved?: boolean;
}

export interface RoanokeObject {
  schema: 'roanoke.object.v1';
  appVersion: string;
  phase: string;
  type: RoanokeObjectType;
  kind: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  title: string;
  body: string;
  axes: string[];
  pillars: string[];
  tags: string[];
  relations: RoanokeRelationEdge[];
  consent: RoanokeConsent;
  proof: RoanokeProofBundle;
  compatibility: RoanokeCompatibility;
  metadata: Record<string, unknown>;
}

export interface RoanokePack {
  schema: 'roanoke.pack.v1';
  exportedAt: string;
  appVersion: string;
  phase: string;
  objectCount: number;
  objects: RoanokeObject[];
  index: {
    byType: Record<string, number>;
    byPillar: Record<string, number>;
    byAxis: Record<string, number>;
  };
  aggregateHash: string;
  privacy: {
    localOnly: true;
    userInitiated: true;
    sharing: 'user-choice-only';
  };
}

export interface RoanokeImportReview {
  ok: boolean;
  sourceSchema: string;
  objectCount: number;
  normalizedObjects: RoanokeObject[];
  quarantine: Array<{ index: number; reason: string; preview: string }>;
  errors: string[];
}

export interface RoanokeUnfoldResult {
  title: string;
  present: string;
  activePillar: string;
  relationCare: string;
  nextAction: string;
  logLine: string;
  privacyNote: string;
}

export type RoanokeLedgerSource = CodexEntry | RoanokeObject | Record<string, unknown>;
