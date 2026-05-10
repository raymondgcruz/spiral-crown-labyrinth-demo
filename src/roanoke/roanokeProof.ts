/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoanokeProofBundle } from './roanokeTypes';
import { APP_VERSION } from '../version';

export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj).sort().map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(',')}}`;
};

const fallbackHash = (input: string) => {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 16777619);
    h2 ^= c + i;
    h2 = Math.imul(h2, 2246822519);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`.toUpperCase();
};

const bufferToHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

export const sha256Hex = async (input: string): Promise<{ hash: string; method: RoanokeProofBundle['method'] }> => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoded = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      return { hash: bufferToHex(digest), method: 'sha256' };
    }
  } catch (error) {
    console.warn('ROANOKE Web Crypto unavailable, using display-only fallback preview.', error);
  }
  return { hash: fallbackHash(input), method: 'roanoke-fallback-preview' };
};

export const createRoanokeProofBundle = async (
  stableData: Record<string, unknown>,
  canonicalFields: string[],
  parentHash: string | null = null
): Promise<RoanokeProofBundle> => {
  const canonical = stableStringify(stableData);
  const { hash, method } = await sha256Hex(canonical);
  return {
    method,
    hash,
    hashPreview: hash.slice(0, 12),
    canonicalFields,
    generatedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    parentHash
  };
};

export const createFallbackProofBundle = (
  stableData: Record<string, unknown>,
  canonicalFields: string[]
): RoanokeProofBundle => {
  const hash = fallbackHash(stableStringify(stableData));
  return {
    method: 'roanoke-fallback-preview',
    hash,
    hashPreview: hash.slice(0, 12),
    canonicalFields,
    generatedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    parentHash: null
  };
};
