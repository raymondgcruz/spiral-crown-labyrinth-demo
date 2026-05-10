/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateRoanokeProof, getKindForEntryType, getAxesForEntryType } from '../roanoke/proof';

export * from './backup';
export { generateRoanokeProof, getKindForEntryType, getAxesForEntryType };

export const safeJSONParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};
