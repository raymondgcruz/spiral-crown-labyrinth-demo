/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const exportRawBackup = () => {
  const data = JSON.stringify(localStorage);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spiral-crown-raw-backup-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
