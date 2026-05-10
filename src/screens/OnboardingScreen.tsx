/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Map as MapIcon,
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SacredImage } from '../components/SacredImage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'sovereignty',
    title: 'Sovereign Presence',
    label: 'Privacy First',
    desc: 'Spiral Crown is a stone-cold local sanctuary. This means all your intentions, reflections, and practices live strictly on this device. No accounts. No cloud. No surveillance.',
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80&w=1200',
    icon: ShieldCheck
  },
  {
    id: 'rhythm',
    title: 'Slow Navigation',
    label: 'Gentle Return',
    desc: 'Relationship cannot be rushed. We use breath-cycles, symbolic chambers, and deterministic carriers to anchor your state. Move only as the pulse feels clear.',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200',
    icon: Sparkles
  },
  {
    id: 'codex',
    title: 'The Living Codex',
    label: 'Record of Truth',
    desc: 'Every seal you make is added to your local Codex. It is a canonical record of your covenants and clarity. You can export this at any time for your own witness.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    icon: BookOpen
  },
  {
    id: 'consent',
    title: 'Explicit Consent',
    label: 'Approach then Entry',
    desc: 'Our protocol requires manual choice. To enter a chamber or view map data, you must first acknowledge the field\'s resonance. You are always the one who opens the door.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    icon: MapIcon
  }
];

export const OnboardingScreen = memo(({ onComplete }: OnboardingScreenProps) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-midnight flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          className="h-full bg-gold shadow-luminous"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full h-full flex flex-col lg:flex-row items-stretch"
        >
          <div className="flex-1 relative order-2 lg:order-1">
             <SacredImage src={current.image} className="w-full h-full object-cover grayscale opacity-60" alt={current.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-midnight lg:bg-gradient-to-r lg:from-midnight lg:via-midnight/40 lg:to-transparent" />
             
             <div className="absolute bottom-12 left-12 right-12 lg:hidden space-y-6">
                <div className="flex items-center gap-3 text-gold">
                  <current.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{current.label}</span>
                </div>
                <h2 className="text-5xl font-serif text-white">{current.title}</h2>
                <button 
                  onClick={handleNext}
                  className="w-full py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-3 shadow-luminous"
                >
                  {step === STEPS.length - 1 ? 'Begin the Descent' : 'Next Insight'} <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="w-full lg:w-[40%] flex flex-col justify-center p-12 lg:p-20 space-y-12 relative z-10 order-1 lg:order-2">
            <div className="space-y-8 hidden lg:block">
              <div className="flex items-center gap-4 text-gold">
                <current.icon className="w-10 h-10" />
                <span className="text-[12px] font-black uppercase tracking-[0.5em]">{current.label}</span>
              </div>
              <h2 className="text-7xl font-serif text-white leading-tight">{current.title}</h2>
              <p className="text-xl text-pearl/60 font-serif italic leading-relaxed max-w-sm">
                {current.desc}
              </p>
            </div>

            <div className="space-y-8 lg:hidden">
               <p className="text-lg text-pearl/60 font-serif italic leading-relaxed">
                 {current.desc}
               </p>
            </div>

            <button 
              onClick={handleNext}
              className="hidden lg:flex w-full py-6 bg-gold text-midnight font-bold uppercase tracking-[0.2em] rounded-full items-center justify-center gap-4 group shadow-luminous hover:scale-[1.02] transition-all"
            >
              {step === STEPS.length - 1 ? 'Begin the Descent' : 'Next Insight'} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="flex justify-center gap-2 pt-8">
              {STEPS.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-gold w-4' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
