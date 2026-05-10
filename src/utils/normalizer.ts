/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodexEntry } from '../types';
import { normalizeCodexEntry } from '../roanoke/normalize';

/**
 * Normalizes legacy localStorage keys and repairs individual records.
 * Ensures the app doesn't crash on old data structures.
 */
export const normalizeCodex = (entries: any[]): CodexEntry[] => {
  if (!Array.isArray(entries)) return [];

  return entries.map(entry => {
    try {
      return normalizeCodexEntry(entry);
    } catch (e) {
      console.warn('Individual entry normalization failed, attempting fallback repair', e);
      // Basic fallback if normalizeCodexEntry totally fails
      return {
        id: Date.now() + Math.random(),
        schema: 'roanoke.object.v1',
        appVersion: 'unknown',
        phase: 'legacy-recovery',
        type: 'reflection',
        title: 'Damaged Memory (Partial Recovery)',
        body: 'This record was severely malformed but its shell has been preserved.',
        createdAt: new Date().toISOString(),
        axes: ['self'],
        tags: ['recovered', 'malformed'],
        relations: []
      } as CodexEntry;
    }
  }).filter(Boolean);
};

/**
 * Repairs the entire localStorage landscape if needed.
 */
export const prebootRepair = () => {
  try {
    const repairKey = 'spiral-crown-preboot-repair-v3';
    if (localStorage.getItem(repairKey) === 'true') return;

    const reflections = localStorage.getItem('spiral-crown-reflections');
    if (!reflections) {
      localStorage.setItem(repairKey, 'true');
      return;
    }

    const parsed = JSON.parse(reflections);
    if (!Array.isArray(parsed)) {
      localStorage.setItem('spiral-crown-reflections', JSON.stringify([]));
      localStorage.setItem(repairKey, 'true');
      return;
    }

    const needsRepair = parsed.some((entry: any) =>
      !entry ||
      entry.schema !== 'roanoke.object.v1' ||
      !Array.isArray(entry.axes) ||
      !Array.isArray(entry.tags) ||
      typeof entry.title !== 'string' ||
      typeof entry.body !== 'string'
    );

    if (needsRepair) {
      const normalized = normalizeCodex(parsed);
      localStorage.setItem('spiral-crown-reflections', JSON.stringify(normalized));
    }

    localStorage.setItem(repairKey, 'true');
  } catch (e) {
    console.error('Preboot repair failed:', e);
  }
};

/**
 * Handles backup restoration from URL parameters.
 * Usage: ?restore=1 or #restore-backup
 */
export const handleUrlRestore = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has('restore') || url.hash === '#restore-backup') {
    // This is a signal that the user might have come from a recovery link
    // or wants to trigger a restore flow.
    // In a real app, we might prompt for a file, but here we can check for
    // data encoded in the URL if that was part of the golden flow.
    return true;
  }
  return false;
};
