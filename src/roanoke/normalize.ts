/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodexEntry, RoanokeAxis } from '../types';
import { APP_VERSION, APP_PHASE } from '../version';
import { generateRoanokeProof, getAxesForEntryType } from './proof';

export const normalizeCodexEntry = (entry: any): CodexEntry => {
  const type = entry.type || 'reflection';
  const rawAxes = Array.isArray(entry.axes) ? entry.axes : getAxesForEntryType(type);
  const axes = rawAxes.filter((a: any) => ['self', 'other', 'environment'].includes(a)) as RoanokeAxis[];
  if (axes.length === 0) axes.push('self');

  const kind = entry.kind || 'codex_entry';
  const isRecovered = entry.metadata?.recovered || entry._recovered || false;
  const id = entry.id || Date.now() + Math.random();

  // Canonical ROANOKE Record Shape (Section 3)
  const normalized: CodexEntry = {
    schema: "roanoke.object.v1",
    appVersion: APP_VERSION,
    phase: APP_PHASE,
    kind: kind,
    type: type,
    id: id,
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt || (entry.createdAt ? new Date().toISOString() : undefined),
    source: entry.provenance?.sourceScreen || entry.source || 'local',
    title: entry.title || (isRecovered ? 'Recovered Codex Entry' : 'Untitled Codex Entry'),
    body: entry.body || entry.text || entry.content || 'This entry was recovered from an earlier local record.',
    axes: axes,
    tags: Array.isArray(entry.tags) ? entry.tags : (isRecovered ? ['recovered', 'legacy'] : []),
    pillars: Array.isArray(entry.pillars) ? entry.pillars : [],
    relations: Array.isArray(entry.relations) ? entry.relations : [],
    metadata: {
      ...(entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {}),
      recovered: isRecovered,
      ...(isRecovered && { 
        transmutedAt: entry.metadata?.transmutedAt || new Date().toISOString(),
        legacyRaw: entry.metadata?.legacyRaw || (entry.schema !== 'roanoke.object.v1' ? JSON.stringify(entry).slice(0, 1000) : undefined)
      })
    },
    consent: entry.consent || {
      localOnly: true,
      userInitiated: true,
      exportable: true,
      sharing: 'user-choice-only'
    },
    proof: entry.proof || { 
      method: "INITIAL",
      hashPreview: "pending", 
      canonicalFields: ['id', 'body', 'createdAt'], 
      generatedAt: Date.now() 
    },
    compatibility: entry.compatibility || {
      readableBy: ["spiral-crown.local-backup.v1", "roanoke.object.v1"],
      migratedFrom: entry.schema || null,
      migrationNotes: isRecovered ? ["Migrated from legacy format to ROANOKE v1"] : []
    }
  };

  if (!normalized.proof || normalized.proof.hashPreview === 'pending') {
    normalized.proof = generateRoanokeProof(normalized);
  }

  return normalized;
};

export const transmuteLocalMemory = () => {
  const keys = [
    'spiral-crown-reflections',
    'spiral-crown-presence-carrier',
    'spiral-crown-checklist',
    'spiral-crown-completed-chambers',
    'spiral-crown-practice-progress',
    'spiral-crown-onboarding-complete'
  ];

  let recoveredCount = 0;
  let isolatedCount = 0;

  keys.forEach(key => {
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (key === 'spiral-crown-reflections' && Array.isArray(data)) {
        const transmuted = data.map(entry => {
          const e = { ...entry };
          if (!e.schema || e.schema.startsWith('spiral-crown') || !e.provenance) {
            e.metadata = { 
              ...e.metadata, 
              recovered: true,
              legacyRaw: JSON.stringify(e).slice(0, 1000) 
            };
            e._recovered = true; 
            recoveredCount++;
          }
          return normalizeCodexEntry(e);
        });
        localStorage.setItem(key, JSON.stringify(transmuted));
      }
    } catch (e) {
      console.warn(`Could not transmute ${key}, isolating raw data.`);
      localStorage.setItem(`${key}-quarantine-${Date.now()}`, raw);
      localStorage.removeItem(key);
      isolatedCount++;
    }
  });

  sessionStorage.setItem('roanoke-transmute-summary', JSON.stringify({
    recovered: recoveredCount,
    isolated: isolatedCount,
    timestamp: new Date().toISOString()
  }));
};
