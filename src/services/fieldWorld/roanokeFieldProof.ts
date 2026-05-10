/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a deterministic SHA-256 preview hash for a ROANOKE field snapshot.
 * Omit ephemeral fields like exact coords or raw address.
 */
export async function generateRoanokeFieldProof(data: any): Promise<string> {
  try {
    // 1. Stable JSON Serialization (simplified for prototype)
    // In production, use a library like fast-json-stable-stringify
    const stableString = JSON.stringify(data, Object.keys(data).sort());
    
    // 2. Hash
    const msgUint8 = new TextEncoder().encode(stableString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.slice(0, 16); // return short preview
  } catch (error) {
    console.error("Proof generation failed:", error);
    return "PROOF_ERR";
  }
}
