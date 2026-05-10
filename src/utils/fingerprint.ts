/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safe Fingerprint definition for ROANOKE proofing.
 * In a full production build, this would use FingerprintJS.
 * For this prototype, we use a stable device-bound seed.
 */

export const getFingerprint = async (): Promise<string> => {
  // Check if we already have a persistent fingerprint
  let fp = localStorage.getItem('spiral-crown-fp');
  if (fp) return fp;

  // Generate a reasonably unique browser-session fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'spiral-crown-v1';
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
  }
  
  const b64 = canvas.toDataURL().replace("data:image/png;base64,","");
  let bin = atob(b64);
  let hash = 0;
  for (let i = 0; i < bin.length; i++) {
    const char = bin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const finalFp = 'FP-' + Math.abs(hash).toString(16).toUpperCase();
  localStorage.setItem('spiral-crown-fp', finalFp);
  return finalFp;
};
