/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WavBlobOptions {
  durationSec?: number;
  useClarityMode?: boolean;
  sampleRate?: number;
  headroom?: number;
  fadeMs?: number;
}

/**
 * Generate a small, mobile-safe PCM WAV blob for iOS/Safari fallback.
 *
 * The earlier fallback could clip when many sine waves summed together. This
 * implementation renders to a float buffer first, peak-normalizes with headroom,
 * applies a short fade at both loop edges, and soft-clamps final samples.
 */
export const generateWavBlob = (frequencies: number[], options: WavBlobOptions = {}) => {
  const {
    durationSec = 12,
    useClarityMode = false,
    sampleRate = 44100,
    headroom = 0.62,
    fadeMs = 140,
  } = options;

  const cleanFreqs = frequencies.filter((f) => Number.isFinite(f) && f > 0);
  const safeFreqs = cleanFreqs.length > 0 ? cleanFreqs : [432];
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSec));
  const floatSamples = new Float32Array(numSamples);
  const fadeSamples = Math.max(1, Math.floor(sampleRate * (fadeMs / 1000)));

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const f of safeFreqs) {
      if (useClarityMode) {
        sample += (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
      } else {
        sample += Math.sin(2 * Math.PI * f * t);
      }
    }

    floatSamples[i] = sample / Math.sqrt(safeFreqs.length);
  }

  let peak = 0;
  for (let i = 0; i < numSamples; i++) {
    peak = Math.max(peak, Math.abs(floatSamples[i]));
  }
  const gain = peak > 0 ? headroom / peak : 0;

  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV Header
  view.setUint32(0, 0x52494646, false); // RIFF
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // WAVE
  view.setUint32(12, 0x666d7420, false); // fmt
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // data
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const edgeFade = Math.min(1, i / fadeSamples, (numSamples - 1 - i) / fadeSamples);
    const envelope = Math.max(0, Math.min(1, edgeFade));
    const soft = Math.tanh(floatSamples[i] * gain) * envelope;
    view.setInt16(44 + i * 2, Math.round(soft * 32767), true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};
