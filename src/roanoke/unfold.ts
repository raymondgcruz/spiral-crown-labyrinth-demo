/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const UNFOLD_PATHS = {
  'myself': {
    title: 'Return to Self',
    steps: [
      { label: 'Begin 3-Minute Return', screen: 'RESTORE_SELF', tab: 'RESTORE', view: 'SELF' },
      { label: 'Create or Revisit a Presence Carrier', screen: 'RESTORE_PRESENCE', tab: 'RESTORE', view: 'PRESENCE' },
      { label: 'Seal one Codex reflection', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'space': {
    title: 'Tend My Space',
    steps: [
      { label: 'Restore Place', screen: 'RESTORE_PLACE', tab: 'RESTORE', view: 'PLACE' },
      { label: 'Reflect on Map Zone', screen: 'MAP', tab: 'MAP' },
      { label: 'Seal Environment observation to Codex', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'relationship': {
    title: 'Care for a Relationship',
    steps: [
      { label: 'Practice Listening', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'LISTENING' },
      { label: 'Phrase Builder', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'PHRASE_BUILDER' },
      { label: 'Seal relational reflection to Codex', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'repair': {
    title: 'Practice Repair',
    steps: [
      { label: 'Practice Repair', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'REPAIR' },
      { label: 'Boundary or repair phrase', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'PHRASE_BUILDER' },
      { label: 'Seal next honest action to Codex', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'boundary': {
    title: 'Establish a Boundary',
    steps: [
      { label: 'Practice Boundaries', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'BOUNDARIES' },
      { label: 'Name your limit with Phrase Builder', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'PHRASE_BUILDER' },
      { label: 'Seal boundary reflection', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'clarity': {
    title: 'Seek Clarity',
    steps: [
      { label: 'Attunement Chamber', screen: 'RESTORE_PRESENCE', tab: 'RESTORE', view: 'PRESENCE' },
      { label: 'Scenario Practice', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE', category: 'SCENARIO' },
      { label: 'Seal clarity trace', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'presence': {
    title: 'Quiet Presence',
    steps: [
      { label: 'Quiet Presence Broadcast', screen: 'BROADCAST', tab: 'FIELD', view: 'BROADCAST' },
      { label: 'Attunement Chamber', screen: 'RESTORE_PRESENCE', tab: 'RESTORE', view: 'PRESENCE' },
      { label: 'Seal silence to Codex', screen: 'CODEX', tab: 'CODEX' }
    ]
  },
  'labyrinth': {
    title: 'Continue Labyrinth',
    steps: [
      { label: 'Continue the Labyrinth', screen: 'LABYRINTH', tab: 'LABYRINTH' },
      { label: 'Seal integration reflection', screen: 'CODEX', tab: 'CODEX' },
      { label: 'Review Relational Memory', screen: 'CODEX', tab: 'CODEX' }
    ]
  }
};
