/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, X } from 'lucide-react';
import { Screen, Tab, CodexEntry } from '../types';
import { RelationLensLayer } from './RelationLensLayer';

interface ThreeMinuteFlowOverlayProps {
  onComplete: () => void;
  onCancel: () => void;
  onAddReflection: (entry: Partial<CodexEntry>, meta?: any) => void;
  onNavigate: (screen: Screen, tab: Tab, view?: any) => void;
}

export const ThreeMinuteFlowOverlay = memo(({ onComplete, onCancel, onAddReflection, onNavigate }: ThreeMinuteFlowOverlayProps) => {
  const [step, setStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [reflection, setReflection] = useState('');
  const [metadata, setMetadata] = useState<any>(null);

  const steps = [
    { title: 'Step 1 of 3 — Begin with Breath', desc: 'Three breaths is enough to return.' },
    { title: 'Step 2 of 3 — Seal Reflection', desc: 'What needs relationship right now?' },
    { title: 'Step 3 of 3 — Choose Next Path', desc: 'Where does your path lead now?' }
  ];

  const breaths = [
    { inhale: "Inhale gently through the nose.", exhale: "Exhale slowly through the mouth.", note: "Let the body know it is allowed to arrive." },
    { inhale: "Inhale: I return to myself.", exhale: "Exhale: I release what is not mine.", note: "" },
    { inhale: "Inhale: I choose the next true step.", exhale: "Exhale: The path opens by consent.", note: "" }
  ];

  const handleSeal = () => {
    onAddReflection({
      type: 'daily-return',
      title: '3-Minute Return',
      body: reflection,
      tags: ['daily-return', 'three-minute-return', 'restore'],
      metadata: { source: 'three-minute-return', completedAt: new Date().toISOString() }
    }, { lawfulRelation: metadata });
    setStep(2);
  };

  const handlePathSelect = (path: string) => {
    onComplete();
    const mapping: Record<string, { screen: Screen, tab: Tab, view: any }> = {
      'RESTORE_SELF': { screen: 'RESTORE_SELF', tab: 'RESTORE', view: 'SELF' },
      'RESTORE_PLACE': { screen: 'RESTORE_PLACE', tab: 'RESTORE', view: 'PLACE' },
      'RESTORE_PRESENCE': { screen: 'RESTORE_PRESENCE', tab: 'RESTORE', view: 'PRESENCE' },
      'RESTORE_PRACTICE': { screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE' },
      'LABYRINTH': { screen: 'LABYRINTH', tab: 'LABYRINTH', view: null },
      'CODEX': { screen: 'CODEX', tab: 'CODEX', view: null }
    };
    const target = mapping[path];
    if (target) onNavigate(target.screen, target.tab, target.view);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-midnight/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-lg space-y-8 bg-white/5 p-8 rounded-[40px] border border-white/10 relative">
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-pearl/20 hover:text-gold transition-colors" aria-label="Exit return flow"><X className="w-5 h-5" /></button>
        
        <div className="text-center space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">{steps[step].title}</div>
          <p className="text-sm text-pearl/60 italic">{steps[step].desc}</p>
          <div className="text-[10px] text-pearl/20 font-bold uppercase tracking-widest pt-2">This is a short return path, not a forced timer.</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="py-8 space-y-10 flex flex-col items-center">
               <div className="w-32 h-32 rounded-full border border-gold/20 flex items-center justify-center relative">
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gold/10 rounded-full blur-xl"
                  />
                  <div className="relative z-10 flex flex-col items-center text-gold">
                    <Wind className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold">{breathCount + 1}/3</span>
                  </div>
               </div>

               <div className="w-full space-y-6 text-center px-4">
                 <div className="space-y-4">
                   <div className="text-pearl text-sm font-serif italic">"{breaths[breathCount].inhale}"</div>
                   <div className="text-pearl text-sm font-serif italic text-gold/60">"{breaths[breathCount].exhale}"</div>
                   {breaths[breathCount].note && <div className="text-[10px] uppercase tracking-widest text-pearl/30">{breaths[breathCount].note}</div>}
                 </div>

                 {breathCount < 2 ? (
                   <button 
                     onClick={() => setBreathCount(prev => prev + 1)} 
                     className="w-full py-4 bg-white/5 border border-white/10 text-gold font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 text-[10px] hover:bg-gold/5 hover:border-gold/20"
                   >
                     Breath {breathCount + 1} Complete
                   </button>
                 ) : (
                   <button 
                     onClick={() => setStep(1)} 
                     className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-[10px]"
                   >
                     Continue to Reflection
                   </button>
                 )}
               </div>
            </motion.div>
          )}
          
          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-6">
              <label htmlFor="three-minute-reflection" className="sr-only">Arising now</label>
              <div className="space-y-4">
                <textarea 
                  id="three-minute-reflection"
                  name="three-minute-reflection"
                  autoFocus
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Arising now..."
                  className="w-full bg-midnight/40 border border-white/10 rounded-2xl p-6 text-pearl italic focus:border-gold/40 outline-none transition-colors min-h-[120px]"
                  aria-label="Reflection input"
                />

                <RelationLensLayer 
                  text={reflection}
                  initialAxes={['self']}
                  onMetadataChange={setMetadata}
                />
              </div>
              <button 
                onClick={handleSeal}
                disabled={!reflection.trim()}
                className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-[10px] disabled:opacity-50"
               >
                Seal Reflection to Codex
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-1 gap-3">
              {[
                { id: 'RESTORE_SELF', label: 'Self Restoration' },
                { id: 'RESTORE_PLACE', label: 'Place Restoration' },
                { id: 'RESTORE_PRESENCE', label: 'Presence Chamber' },
                { id: 'RESTORE_PRACTICE', label: 'Practice Codex' },
                { id: 'LABYRINTH', label: 'The Sixteenth Chambers' },
                { id: 'CODEX', label: 'The Living Codex' }
              ].map(path => (
                <button 
                  key={path.id}
                  onClick={() => handlePathSelect(path.id)}
                  className="w-full py-4 px-6 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/5 rounded-2xl text-pearl/60 hover:text-gold transition-all text-left flex justify-between items-center group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{path.label}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold shadow-luminous" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-4 opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-pearl">Return is sovereign choice.</p>
        </div>
      </div>
    </motion.div>
  );
});
