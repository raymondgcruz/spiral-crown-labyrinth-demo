/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './constants';
export * from './harmonicChambers';
export * from './mapZones';
export * from './practiceModules';
export * from './ahaSaf';

export const UNFOLD_PATHS = {
  'TRANSMUTATION': {
    title: 'Relational Transmutation',
    steps: ['Grieve the original form.', 'Find the surviving essence.', 'Seed the new formation.'],
    duration: '2-4 weeks'
  },
  'RADICAL_HONESTY': {
    title: 'The Path of Clean Mirrors',
    steps: ['Identify the hidden weight.', 'Name the truth without force.', 'Acknowledge the shift.'],
    duration: 'Immediate'
  },
  'QUIET_PRESENCE': {
    title: 'The Silent Threshold',
    steps: ['Enter the space alone.', 'Listen to the ambient static.', 'Allow the field to speak.'],
    duration: '12-24 hours'
  }
};

export const BROADCAST_STATES = [
  { 
    id: 'peace', 
    label: 'Radiating Peace', 
    description: 'A gentle signal of non-interference and quiet presence in the local field.',
    icon: 'Wind', 
    suggestedDuration: 12, 
    visibility: 'Ambient',
    consentLevel: 'Implicit'
  },
  { 
    id: 'listening', 
    label: 'Deep Listening', 
    description: 'Signaling a state of receptive attention to the subtle currents of the neighborhood.',
    icon: 'Radio', 
    suggestedDuration: 20, 
    visibility: 'Quiet',
    consentLevel: 'Receptive'
  },
  { 
    id: 'avail', 
    label: 'Available for Mutual Aid', 
    description: 'Open to supporting local needs or offering presence for those returning to alignment.',
    icon: 'Handshake', 
    suggestedDuration: 60, 
    visibility: 'Active',
    consentLevel: 'Hands-on'
  },
  { 
    id: 'focus', 
    label: 'Sacred Focus', 
    description: 'Deep internal work. Signaling presence while maintaining absolute boundary sovereignty.',
    icon: 'Zap', 
    suggestedDuration: 45, 
    visibility: 'Cloaked',
    consentLevel: 'Minimal/None'
  }
];
