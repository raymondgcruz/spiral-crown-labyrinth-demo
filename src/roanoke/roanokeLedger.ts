/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_PHASE, APP_VERSION } from '../version';
import { CodexEntry } from '../types';
import { normalizeCodexEntry } from './normalize';
import { createFallbackProofBundle } from './roanokeProof';
import { RoanokeLedgerSource, RoanokeObject, RoanokeObjectType } from './roanokeTypes';

export const ROANOKE_LEDGER_KEY = 'spiral-crown-roanoke-ledger-v1';
export const LEGACY_CODEX_KEY = 'spiral-crown-reflections';

const typeMap: Record<string, RoanokeObjectType> = {
  reflection: 'reflection',
  practice: 'practice',
  presence: 'presence',
  presence_carrier: 'presence',
  labyrinth: 'labyrinth',
  attunement: 'attunement',
  map_zone_reflection: 'map',
  field_world_snapshot: 'map',
  broadcast: 'broadcast',
  field_broadcast: 'broadcast',
  circle: 'community',
  circle_intention: 'community',
  daily_reflection: 'reflection',
  'daily-reflection': 'reflection',
  daily_return: 'reflection',
  'daily-return': 'reflection',
  imported: 'imported'
};

export const stableObjectFields = (entry: Partial<CodexEntry> | RoanokeObject) => ({
  schema: 'roanoke.object.v1',
  id: String(entry.id ?? ''),
  type: String(entry.type ?? 'reflection'),
  kind: String((entry as any).kind ?? 'Field Object'),
  title: String(entry.title ?? 'Untitled'),
  body: String(entry.body ?? ''),
  createdAt: String(entry.createdAt ?? ''),
  axes: Array.isArray((entry as any).axes) ? [...((entry as any).axes as string[])].sort() : [],
  pillars: Array.isArray((entry as any).pillars) ? [...((entry as any).pillars as string[])].sort() : [],
  tags: Array.isArray((entry as any).tags) ? [...((entry as any).tags as string[])].sort() : []
});

export const normalizeToRoanokeObject = (source: RoanokeLedgerSource, fallbackIndex = 0): RoanokeObject => {
  if ((source as any)?.schema === 'roanoke.object.v1' && (source as any)?.proof?.hashPreview) {
    const existing = source as any;
    return {
      schema: 'roanoke.object.v1',
      appVersion: existing.appVersion || APP_VERSION,
      phase: existing.phase || APP_PHASE,
      type: typeMap[String(existing.type)] || 'imported',
      kind: existing.kind || 'Field Object',
      id: String(existing.id || `roa-${Date.now()}-${fallbackIndex}`),
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: existing.updatedAt || existing.createdAt || new Date().toISOString(),
      source: existing.source || existing.provenance?.sourceScreen || 'local-codex',
      title: existing.title || 'Untitled ROANOKE Object',
      body: existing.body || '',
      axes: Array.isArray(existing.axes) ? existing.axes : ['self'],
      pillars: Array.isArray(existing.pillars) ? existing.pillars : Array.isArray(existing.metadata?.pillars) ? existing.metadata.pillars : [],
      tags: Array.isArray(existing.tags) ? existing.tags : [],
      relations: Array.isArray(existing.relations) ? existing.relations.map((r: any, i: number) => ({ id: String(r.id || `rel-${i}`), from: String(r.from || existing.id), to: String(r.to || 'self'), type: String(r.type || 'reflects'), createdAt: r.createdAt || new Date().toISOString(), note: r.note, userApproved: !!r.userApproved })) : [],
      consent: {
        localOnly: true,
        userInitiated: existing.consent?.userInitiated ?? true,
        exportable: existing.consent?.exportable ?? true,
        sharing: existing.consent?.sharing || 'user-choice-only'
      },
      proof: existing.proof.hash ? existing.proof : createFallbackProofBundle(stableObjectFields(existing), Object.keys(stableObjectFields(existing))),
      compatibility: existing.compatibility || {
        readableBy: ['spiral-crown.local-backup.v1', 'roanoke.object.v1'],
        migratedFrom: null,
        migrationNotes: []
      },
      metadata: existing.metadata && typeof existing.metadata === 'object' ? existing.metadata : {}
    };
  }

  const normalized = normalizeCodexEntry(source);
  const stable = stableObjectFields(normalized);
  return {
    schema: 'roanoke.object.v1',
    appVersion: normalized.appVersion || APP_VERSION,
    phase: normalized.phase || APP_PHASE,
    type: typeMap[String(normalized.type)] || 'imported',
    kind: normalized.kind || 'Field Object',
    id: String(normalized.id || `roa-${Date.now()}-${fallbackIndex}`),
    createdAt: normalized.createdAt || new Date().toISOString(),
    updatedAt: normalized.updatedAt || normalized.createdAt || new Date().toISOString(),
    source: normalized.source || normalized.provenance?.sourceScreen || 'local-codex',
    title: normalized.title || 'Untitled ROANOKE Object',
    body: normalized.body || '',
    axes: normalized.axes || ['self'],
    pillars: normalized.pillars || (Array.isArray(normalized.metadata?.pillars) ? normalized.metadata.pillars : []),
    tags: normalized.tags || [],
    relations: [],
    consent: normalized.consent ? {
      localOnly: true,
      userInitiated: normalized.consent.userInitiated,
      exportable: normalized.consent.exportable,
      sharing: normalized.consent.sharing || 'user-choice-only'
    } : { localOnly: true, userInitiated: true, exportable: true, sharing: 'user-choice-only' },
    proof: createFallbackProofBundle(stable, Object.keys(stable)),
    compatibility: normalized.compatibility || {
      readableBy: ['spiral-crown.local-backup.v1', 'roanoke.object.v1'],
      migratedFrom: (source as any)?.schema || null,
      migrationNotes: ['Normalized into ROANOKE ledger view without destructive mutation.']
    },
    metadata: normalized.metadata || {}
  };
};

export const buildRoanokeLedger = (codexEntries: CodexEntry[] = []): RoanokeObject[] => codexEntries.map((entry, index) => normalizeToRoanokeObject(entry, index));

export const readStoredLedger = (): RoanokeObject[] => {
  try {
    const raw = localStorage.getItem(ROANOKE_LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, index) => normalizeToRoanokeObject(item, index));
  } catch {
    return [];
  }
};

export const writeStoredLedger = (objects: RoanokeObject[]) => {
  localStorage.setItem(ROANOKE_LEDGER_KEY, JSON.stringify(objects));
};

export const getLedgerStats = (objects: RoanokeObject[]) => {
  const proofCount = objects.filter(o => o.proof?.hashPreview).length;
  const localOnlyCount = objects.filter(o => o.consent?.localOnly).length;
  const byType = objects.reduce<Record<string, number>>((acc, obj) => {
    acc[obj.type] = (acc[obj.type] || 0) + 1;
    return acc;
  }, {});
  return { objectCount: objects.length, proofCount, localOnlyCount, byType };
};
