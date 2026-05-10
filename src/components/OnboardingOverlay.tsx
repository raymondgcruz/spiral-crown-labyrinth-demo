/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ONBOARDING_STEPS } from '../data';

interface OnboardingOverlayProps {
  onComplete: () => void;
  onReviewPrivacy: () => void;
}

export const OnboardingOverlay = memo(({ onComplete, onReviewPrivacy }: OnboardingOverlayProps) => {
  const [step, setStep] = useState(0);
  
  const next = () => {
    if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-midnight flex items-center justify-center p-6 pb-24"
    >
      <div className="w-full max-w-lg space-y-8 text-center bg-midnight/80 p-8 rounded-[40px] border border-white/5 backdrop-blur-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-luminous">
                {React.createElement(ONBOARDING_STEPS[step].icon, { className: "w-8 h-8" })}
              </div>
            </div>
            <div className="space-y-3 px-4">
              <h2 className="text-3xl font-serif text-gold leading-tight">{ONBOARDING_STEPS[step].title}</h2>
              <p className="text-sm text-pearl/60 leading-relaxed italic">{ONBOARDING_STEPS[step].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-6">
          <div className="flex justify-center gap-1.5">
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-8 bg-gold' : 'w-4 bg-white/10'}`} />
            ))}
          </div>
          
          <button 
            onClick={next}
            className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-[10px]"
          >
            {step === ONBOARDING_STEPS.length - 1 ? 'Begin the Labyrinth' : 'Continue Path'}
          </button>
          
          <div className="flex justify-between px-4">
            <button onClick={onComplete} className="text-[10px] font-black uppercase tracking-widest text-pearl/20 hover:text-gold transition-colors">Skip for Now</button>
            <button onClick={onReviewPrivacy} className="text-[10px] font-black uppercase tracking-widest text-pearl/20 hover:text-gold transition-colors">Privacy Model</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
