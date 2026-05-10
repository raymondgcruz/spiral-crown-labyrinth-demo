/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_PHASE, APP_VERSION } from '../version';
import { sha256Hex, stableStringify } from './roanokeProof';
import { RoanokeImportReview, RoanokeObject, RoanokePack } from './roanokeTypes';
import { normalizeToRoanokeObject } from './roanokeLedger';

const countBy = (objects: RoanokeObject[], getter: (obj: RoanokeObject) => string[]) => objects.reduce<Record<string, number>>((acc, obj) => {
  getter(obj).forEach(key => {
    const clean = String(key || 'unlabeled').toLowerCase();
    acc[clean] = (acc[clean] || 0) + 1;
  });
  return acc;
}, {});

export const createRoanokePack = async (objects: RoanokeObject[]): Promise<RoanokePack> => {
  const exportable = objects.filter(obj => obj.consent?.exportable !== false);
  const aggregateInput = stableStringify(exportable.map(obj => ({ id: obj.id, proof: obj.proof?.hash || obj.proof?.hashPreview || '', updatedAt: obj.updatedAt })));
  const aggregate = await sha256Hex(aggregateInput);
  return {
    schema: 'roanoke.pack.v1',
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    phase: APP_PHASE,
    objectCount: exportable.length,
    objects: exportable,
    index: {
      byType: countBy(exportable, obj => [obj.type]),
      byPillar: countBy(exportable, obj => obj.pillars.length ? obj.pillars : ['unassigned']),
      byAxis: countBy(exportable, obj => obj.axes.length ? obj.axes : ['self'])
    },
    aggregateHash: aggregate.hash,
    privacy: {
      localOnly: true,
      userInitiated: true,
      sharing: 'user-choice-only'
    }
  };
};

export const downloadRoanokePack = (pack: RoanokePack) => {
  const data = JSON.stringify(pack, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `roanoke-pack-${new Date().toISOString().split('T')[0]}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const reviewRoanokeImport = (data: string): RoanokeImportReview => {
  const errors: string[] = [];
  const quarantine: RoanokeImportReview['quarantine'] = [];
  let sourceSchema = 'unknown';
  let candidates: unknown[] = [];

  try {
    const parsed = JSON.parse(data);
    sourceSchema = parsed?.schema || (Array.isArray(parsed) ? 'array' : 'legacy-object');
    if (parsed?.schema === 'roanoke.pack.v1' && Array.isArray(parsed.objects)) {
      candidates = parsed.objects;
    } else if (Array.isArray(parsed)) {
      candidates = parsed;
    } else if (Array.isArray(parsed?.entries)) {
      candidates = parsed.entries;
    } else if (parsed && typeof parsed === 'object') {
      candidates = [parsed];
    }
  } catch (error) {
    return { ok: false, sourceSchema, objectCount: 0, normalizedObjects: [], quarantine: [], errors: ['File could not be parsed as JSON.'] };
  }

  const normalizedObjects: RoanokeObject[] = [];
  candidates.forEach((item, index) => {
    try {
      normalizedObjects.push(normalizeToRoanokeObject(item as any, index));
    } catch (error) {
      quarantine.push({ index, reason: 'Could not normalize record.', preview: JSON.stringify(item).slice(0, 180) });
    }
  });

  if (candidates.length === 0) errors.push('No importable records were found.');

  return {
    ok: errors.length === 0 && normalizedObjects.length > 0,
    sourceSchema,
    objectCount: normalizedObjects.length,
    normalizedObjects,
    quarantine,
    errors
  };
};
