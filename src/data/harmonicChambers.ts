/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Wind, 
  Heart, 
  Eye, 
  ShieldCheck, 
  Key, 
  Leaf, 
  Anchor, 
  Handshake, 
  Sun, 
  Sparkles, 
  HeartPulse, 
  Cloud, 
  Diamond, 
  Home, 
  Zap, 
  Star 
} from 'lucide-react';
import { HarmonicChamber } from '../types';

export const HARMONIC_CHAMBERS: HarmonicChamber[] = [
  { 
    id: 'peace', 
    pillar: 'Peace', 
    teaching: 'The foundation of all restoration is a quiet heart. Without internal peace, every action is a distortion of the noise.', 
    prompt: 'In this moment, what noise can you gently lay down to make room for stillness?', 
    action: 'Sit in silence for 5 minutes, focusing only on the rise and fall of your breath.', 
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    icon: Wind,
    desc: 'Quiet heart and focused breathing.'
  },
  { 
    id: 'love', 
    pillar: 'Love', 
    teaching: 'Love is not a sentiment, but a fundamental orientation toward life-serving connection.', 
    prompt: 'Where in your life is a relationship calling for more of your presence than your opinion?', 
    action: 'Offer a moment of undivided attention to a loved one without judgment.', 
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    icon: Heart,
    desc: 'Life-serving connection and presence.'
  },
  { 
    id: 'understanding', 
    pillar: 'Understanding', 
    teaching: 'True understanding is a bridge of light built through the labor of listening.', 
    prompt: 'What truth have you been avoiding because it challenges your current certainty?', 
    action: 'Read a perspective that differs from your own with the goal of finding its internal logic.', 
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    icon: Eye,
    desc: 'Listening and broadening perspectives.'
  },
  { 
    id: 'respect', 
    pillar: 'Respect', 
    teaching: 'Respect is the recognition of the sacred inherent in all living things.', 
    prompt: 'How do you honor the boundaries of those who are different from you?', 
    action: 'Acknowledge the effort of a stranger with a moment of genuine eye contact.', 
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=800',
    icon: ShieldCheck,
    desc: 'Honoring boundaries and the sacred.'
  },
  { 
    id: 'trust', 
    pillar: 'Trust', 
    teaching: 'Trust is the slow-growing root system of safety. It cannot be forced; it can only be cultivated.', 
    prompt: 'Is there a place where you are withholding trust out of old fear rather than current evidence?', 
    action: 'Delegate a small task and allow it to be done in a way that is not yours.', 
    image: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5c?auto=format&fit=crop&q=80&w=800',
    icon: Key,
    desc: 'Cultivating safety and delegation.'
  },
  { 
    id: 'truth-nature', 
    pillar: 'Truth-in-Nature', 
    teaching: 'Nature does not lie. It simply is. We return to alignment by observing the laws of life.', 
    prompt: 'What seasonal shift is occurring in your own internal world right now?', 
    action: 'Observe a living plant for ten minutes. Notice its slow, persistent movement toward light.', 
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800',
    icon: Leaf,
    desc: 'Alignment with natural cycles.'
  },
  { 
    id: 'loyalty', 
    pillar: 'Loyalty', 
    teaching: 'Loyalty is consistency of heart through the cycles of shadow and light.', 
    prompt: 'To what values do you remain loyal even when they are inconvenient?', 
    action: 'Stand by a commitment you made to yourself today, regardless of external pressure.', 
    image: 'https://images.unsplash.com/photo-1517021897177-0bb7b97362d2?auto=format&fit=crop&q=80&w=800',
    icon: Anchor,
    desc: 'Consistency of heart and values.'
  },
  { 
    id: 'support', 
    pillar: 'Support', 
    teaching: 'Support is the invisible web that holds the field together. We are never truly alone.', 
    prompt: 'Who have you leaned on lately? Have you acknowledged the weight they carry?', 
    action: 'Offer a practical act of help—washing a dish, holding a door—without being asked.', 
    image: 'https://images.unsplash.com/photo-1559027615-cd4428ad6575?auto=format&fit=crop&q=80&w=800',
    icon: Handshake,
    desc: 'Invisible webs of mutual aid.'
  },
  { 
    id: 'joy', 
    pillar: 'Joy', 
    teaching: 'Joy is the natural radiation of a soul in alignment. It is a form of gratitude.', 
    prompt: 'What small, simple thing brought a spark of life to your chest today?', 
    action: 'Express joy out loud. Share a laugh or a song without self-consciousness.', 
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800',
    icon: Sun,
    desc: 'Radiating alignment and gratitude.'
  },
  { 
    id: 'clarity', 
    pillar: 'Clarity', 
    teaching: 'Clarity is the result of removing what is false, rather than adding what is new.', 
    prompt: 'What assumption are you currently carrying that is blurring your vision?', 
    action: 'Write down one complex problem and distill it into a single, simple sentence.', 
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    icon: Sparkles,
    desc: 'Removing distortion and assumption.'
  },
  { 
    id: 'compassion', 
    pillar: 'Compassion', 
    teaching: 'Compassion is the ability to witness suffering without turning away or trying to fix it.', 
    prompt: 'How can you be more gentle with the part of yourself that feels inadequate?', 
    action: 'Place a hand over your heart and take three deep breaths for your own struggling soul.', 
    image: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800',
    icon: HeartPulse,
    desc: 'Gentle witnessing of suffering.'
  },
  { 
    id: 'grace', 
    pillar: 'Grace', 
    teaching: 'Grace is the gift we receive that we did not earn. It is the mercy of the field.', 
    prompt: 'Where have you been granted a second chance that you haven\'t fully accepted?', 
    action: 'Forgive yourself for one small mistake you made in the last 24 hours.', 
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=800',
    icon: Cloud,
    desc: 'Accepting unearned mercy.'
  },
  { 
    id: 'sovereignty', 
    pillar: 'Sovereignty', 
    teaching: 'Sovereignty is the realization that no one can inhabit your soul but you.', 
    prompt: 'In what area of your life are you waiting for permission that you already have?', 
    action: 'Make one decision today solely based on your internal "Yes" without seeking external validation.', 
    image: 'https://images.unsplash.com/photo-1551029506-0807d4a21f68?auto=format&fit=crop&q=80&w=800',
    icon: Diamond,
    desc: 'Owning internal agency and soul.'
  },
  { 
    id: 'sanctuary', 
    pillar: 'Sanctuary', 
    teaching: 'Sanctuary is the space we protect so that the sacred can rest.', 
    prompt: 'Is your home a place of restoration or a place of distraction?', 
    action: 'Clear one small surface in your living space until it is completely empty and clean.', 
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    icon: Home,
    desc: 'Protecting spaces for sacred rest.'
  },
  { 
    id: 'radiance', 
    pillar: 'Radiance', 
    teaching: 'Radiance is the overflow of internal work into the external world.', 
    prompt: 'What light do you carry that you have been hiding under a bushel of modesty?', 
    action: 'Give a genuine compliment that highlights someone else\'s unique character.', 
    image: 'https://images.unsplash.com/photo-1470252649358-96949c7515c9?auto=format&fit=crop&q=80&w=800',
    icon: Zap,
    desc: 'Overflowing internal light.'
  },
  { 
    id: 'wonder', 
    pillar: 'Wonder', 
    teaching: 'Wonder is the antidote to the cynicism of the small mind.', 
    prompt: 'When was the last time you were truly surprised by the beauty of existing?', 
    action: 'Look at the sky—day or night—and remember for a moment that you are on a planet.', 
    image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=800',
    icon: Star,
    desc: 'Antidote to cynicism and beauty.'
  },
];
