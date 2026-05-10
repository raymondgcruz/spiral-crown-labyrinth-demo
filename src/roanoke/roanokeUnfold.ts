/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoanokeObject, RoanokeUnfoldResult } from './roanokeTypes';

const pillarFromObject = (obj?: RoanokeObject) => obj?.pillars?.[0] || obj?.tags?.find(t => ['peace', 'clarity', 'support', 'sanctuary', 'love', 'trust', 'respect', 'understanding'].includes(t.toLowerCase())) || 'Clarity';

const relationFromAxes = (axes: string[]) => {
  if (axes.includes('other')) return 'A relationship thread may be asking for listening, consent, or repair.';
  if (axes.includes('environment')) return 'A place or local field may be asking for care and simplification.';
  return 'The self relationship may be asking for breath, honesty, and one small return.';
};

const actionFromType = (obj?: RoanokeObject) => {
  if (!obj) return 'Choose one recent Codex entry and name one gentle next step.';
  switch (obj.type) {
    case 'practice': return 'Repeat one safe step from this practice for two minutes, then log what changed.';
    case 'presence': return 'Place one hand on the heart, breathe once, and restate the intention in plain words.';
    case 'labyrinth': return 'Revisit the chamber lesson and choose one action that can be completed today.';
    case 'map': return 'Choose an accessible local care practice and keep it lawful, brief, and optional.';
    case 'broadcast': return 'Close the broadcast loop with one sentence of gratitude and return to the body.';
    case 'community': return 'Choose one kind relational action that asks nothing in return.';
    default: return 'Write one clean sentence: “The next honest action is ____.”';
  }
};

export const unfoldRoanokeObject = (obj?: RoanokeObject): RoanokeUnfoldResult => {
  const pillar = pillarFromObject(obj);
  return {
    title: obj ? `UNFOLD — ${obj.title}` : 'UNFOLD — Choose a Record',
    present: obj ? `This record carries ${obj.type} memory with ${obj.axes.join(', ') || 'self'} orientation.` : 'A record has not been selected yet.',
    activePillar: pillar,
    relationCare: obj ? relationFromAxes(obj.axes) : 'Begin with the record that feels most alive and easiest to approach.',
    nextAction: actionFromType(obj),
    logLine: obj ? `Logged next action from “${obj.title}”: ${actionFromType(obj)}` : 'Log one small next action after choosing a record.',
    privacyNote: 'This is a reflective local suggestion. You choose what to keep private, export, or leave untouched.'
  };
};
