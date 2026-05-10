/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Sprout, 
  Database as DatabaseIcon, 
  AirVent, 
  Radio, 
  RefreshCw 
} from 'lucide-react';
import { OnboardingStep } from '../types';

import { APP_VERSION, APP_PHASE } from '../version';

export { APP_PHASE };
export const VERSION = APP_VERSION;

export const HARMONIC_FREQUENCIES: Record<string, number> = {
  'peace': 128.00,
  'love': 144.00,
  'understanding': 160.00,
  'respect': 170.67,
  'trust': 192.00,
  'truth-nature': 213.33,
  'loyalty': 240.00,
  'support': 256.00,
  'joy': 288.00,
  'clarity': 320.00,
  'compassion': 341.33,
  'grace': 384.00,
  'sovereignty': 426.67,
  'sanctuary': 480.00,
  'radiance': 512.00,
  'wonder': 576.00
};

export const DAILY_PROMPTS = [
  "What relationship needs gentleness today?",
  "What boundary would restore peace?",
  "What part of the room is asking for care?",
  "Where can I offer without controlling?",
  "What truth can be honored without force?",
  "How can I return to my breath in this moment?",
  "What small repair can I offer myself today?"
];

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "A Labyrinth of Living Relationship",
    description: "This is a reflective prototype for restoring relationship with self, place, others, and the larger field. The path opens by consent.",
    icon: Sprout
  },
  {
    title: "Your Codex Stays Here",
    description: "Reflections and progress stay on this device using local browser storage. We use no cloud storage, accounts, or tracking. Your sovereignty is absolute.",
    icon: DatabaseIcon
  },
  {
    title: "Begin with Breath",
    description: "Start with the 'Restore' tab. Choose Self, Place, Presence, or Practice depending on what needs care today. Three minutes is enough to return.",
    icon: AirVent
  },
  {
    title: "Symbolic, Not Surveillance",
    description: "The Field, Circle, and Map are simulated in this public demo. No GPS, no exact location, and no real nearby users are involved. It is a shared dream of connection.",
    icon: Radio
  },
  {
    title: "Return Without Shame",
    description: "There are no streaks, rankings, or spiritual scores. The app welcomes your return whenever you are ready. The cycle continues without force.",
    icon: RefreshCw
  }
];

export const PHRASE_TEMPLATES = {
  INVITE: {
    GENTLE: "“I'd love to invite you to [X], if you have the space and desire. No pressure at all.”",
    DIRECT: "“I am hosting [X] and would value your presence there. Does that interest you?”",
    WARM: "“It would be a joy to have you at [X]. I'd love to see you if you're up for it.”",
    FIRM: "“I am gathering people for [X]. I'm looking for committed presence. Do you want in?”"
  },
  DECLINE: {
    GENTLE: "“Thank you so much for the invitation. I'm not able to join this time, but I appreciate being included.”",
    DIRECT: "“I won't be able to make it to [X]. Thanks for asking!”",
    WARM: "“I'd love to see you soon, but I can't do [X] specifically. Let's find another time.”",
    FIRM: "“I am not available for [X]. I need to prioritize my rest right now.”"
  },
  REPAIR: {
    GENTLE: "“I've been reflecting on our interaction and I'd like to take responsibility for how I showed up.”",
    DIRECT: "“I'm sorry for [X]. It wasn't my intention, but I see the impact it had.”",
    WARM: "“I value our connection so much. Can we talk about what happened? I want to make it right.”",
    FIRM: "“I need to apologize for [X]. I crossed a line and I want to acknowledge that clearly.”"
  },
  ASK: {
    GENTLE: "“I have a small request, but please feel free to say no if it doesn't work for you...”",
    DIRECT: "“I'm looking for support with [X]. Is that something you can offer right now?”",
    WARM: "“Would you be open to helping me with [X]? I'd really appreciate your perspective.”",
    FIRM: "“I need assistance with [X]. Can you commit to helping me move this forward?”"
  }
};
