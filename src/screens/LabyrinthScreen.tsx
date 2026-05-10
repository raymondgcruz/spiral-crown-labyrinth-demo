/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Diamond, 
  CheckCircle2, 
  ArrowRight,
  Sprout,
  ChevronRight
} from 'lucide-react';
import { HARMONIC_CHAMBERS } from '../data';
import { SacredImage } from '../components/SacredImage';
import { GuidanceChip } from '../components/GuidanceChip';
import { RelationLensLayer } from '../components/RelationLensLayer';

interface LabyrinthScreenProps {
  completedChambers: string[];
  onSealChamber: (chamberId: string, reflection: string, sealed: boolean, meta?: any) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
}

export const LabyrinthScreen = memo(({ completedChambers, onSealChamber, dismissedGuidance, onDismissGuidance }: LabyrinthScreenProps) => {
  const [activeChamberId, setActiveChamberId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const activeChamber = HARMONIC_CHAMBERS.find(c => c.id === activeChamberId);
  const nextChamberIndex = completedChambers.length;
  const nextChamber = HARMONIC_CHAMBERS[nextChamberIndex];

  return (
    <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto flex flex-col items-center gap-12 overflow-hidden">
      <AnimatePresence>
        {!dismissedGuidance.includes('labyrinth-guidance') && (
          <GuidanceChip 
            id="labyrinth-guidance" 
            text="The Labyrinth is a slow path. One chamber at a time. Return when the field calls." 
            onDismiss={() => onDismissGuidance('labyrinth-guidance')}
          />
        )}
      </AnimatePresence>
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/80 via-midnight to-midnight" />
        <SacredImage src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Cosmos" />
      </div>

      <AnimatePresence mode="wait">
        {!activeChamberId ? (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 w-full space-y-12"
          >
            <header className="text-center space-y-6">
               <div className="inline-block px-4 py-1 rounded-full border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5">Symbolic Descent</div>
               <h2 className="text-5xl font-serif text-gold">The Sixteen Chambers</h2>
               <p className="text-lg text-pearl/60 italic max-w-2xl mx-auto">A slow restoration through the 16 pillars of the harmonic field.</p>
               <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-6" />
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {HARMONIC_CHAMBERS.map((chamber, idx) => {
                const isCompleted = completedChambers.includes(chamber.id);
                const isNext = idx === nextChamberIndex;
                const isLocked = idx > nextChamberIndex;

                return (
                  <button
                    key={chamber.id}
                    onClick={() => !isLocked && setActiveChamberId(chamber.id)}
                    className={`aspect-square rounded-2xl glass-panel border flex flex-col items-center justify-center gap-2 transition-all group ${isCompleted ? 'border-emerald-400/30 text-emerald-400' : isNext ? 'border-gold/60 text-gold shadow-luminous' : 'border-white/5 text-pearl/20'}`}
                    disabled={isLocked}
                  >
                    <div className="relative">
                      <Diamond className={`w-6 h-6 ${isCompleted || isNext ? 'fill-current opacity-20' : ''} group-hover:scale-110 transition-transform`} />
                      {isCompleted && <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">{chamber.pillar}</span>
                  </button>
                );
              })}
            </div>

            {nextChamber && (
              <div className="glass-panel p-10 rounded-[48px] border-gold/30 shadow-luminous flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 aspect-square rounded-[32px] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                  <SacredImage src={nextChamber.image} className="w-full h-full object-cover" alt={nextChamber.pillar} />
                  <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60 mb-2 block">Threshold {nextChamberIndex + 1}</span>
                    <h3 className="text-4xl font-serif text-gold">Chamber of {nextChamber.pillar}</h3>
                  </div>
                  <p className="text-pearl/60 italic leading-relaxed">{nextChamber.teaching.slice(0, 100)}...</p>
                  <button 
                    onClick={() => setActiveChamberId(nextChamber.id)}
                    className="px-10 py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-3 group"
                  >
                    Enter Chamber <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="chamber"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-3xl glass-panel p-8 sm:p-14 rounded-[56px] border-gold/20 shadow-2xl space-y-12"
          >
            <button 
              onClick={() => { setActiveChamberId(null); setIsFinishing(false); }}
              className="absolute top-8 left-8 text-pearl/40 hover:text-gold transition-colors"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>

            {!isFinishing ? (
              <>
                <header className="text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Symbolic Restoration</span>
                  <h3 className="text-5xl font-serif text-pearl">{activeChamber?.pillar}</h3>
                  <div className="h-px w-24 bg-gold/20 mx-auto" />
                </header>

                <div className="space-y-4 text-center">
                  <p className="text-xl font-serif italic text-pearl/80 leading-relaxed">
                    "{activeChamber?.teaching}"
                  </p>
                </div>

                <div className="glass-panel p-8 rounded-[32px] border-emerald-400/10 bg-emerald-400/5 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Sprout className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Embodied Action</span>
                  </div>
                  <p className="text-sm text-pearl/80 font-serif leading-relaxed italic">{activeChamber?.action}</p>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setIsFinishing(true)}
                    className="w-full py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous"
                  >
                    I Have Performed the Action
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                   <h4 className="text-3xl font-serif text-gold">The Witnessing</h4>
                   <p className="text-sm text-pearl/40 italic">"{activeChamber?.prompt}"</p>
                </div>
                
                <div className="space-y-4">
                  <textarea 
                    id="labyrinth-reflection-input"
                    name="labyrinth-reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="The chamber waits for your reflection..."
                    className="w-full bg-midnight/40 border border-white/10 rounded-3xl p-6 text-pearl italic text-xl font-serif outline-none focus:border-gold/40 transition-colors"
                    rows={4}
                  />

                  <RelationLensLayer 
                    text={reflection}
                    initialAxes={['self']}
                    onMetadataChange={setMetadata}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      if(activeChamberId) onSealChamber(activeChamberId, reflection, true, { lawfulRelation: metadata });
                      setActiveChamberId(null);
                      setReflection('');
                      setIsFinishing(false);
                    }}
                    className="flex-1 py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous text-[11px]"
                  >
                    Save Reflection to Codex
                  </button>
                  <button 
                    onClick={() => setIsFinishing(false)}
                    className="px-8 py-5 border border-white/10 text-pearl/40 font-bold uppercase tracking-widest rounded-full"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!activeChamberId && (
        <div className="relative z-10 flex flex-col items-center gap-2 animate-pulse text-gold/40">
          <ChevronRight className="w-8 h-8 rotate-90" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-bold">Deeper into the Core</span>
        </div>
      )}
    </div>
  );
});
