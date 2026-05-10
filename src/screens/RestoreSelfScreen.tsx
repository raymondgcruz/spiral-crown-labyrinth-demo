/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Handshake, 
  Sprout, 
  Radio, 
  ChevronRight,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { PresenceCarrier, CodexEntry, Screen, Tab, ChecklistState } from '../types';
import { GuidanceChip } from '../components/GuidanceChip';
import { QuickStartPath } from '../components/QuickStartPath';
import { DailyReturnPanel } from '../components/DailyReturnPanel';
import { DailyReflectionTool } from '../components/DailyReflectionTool';
import { ThreeMinuteFlowOverlay } from '../components/ThreeMinuteFlowOverlay';
import { RelationLensLayer } from '../components/RelationLensLayer';

interface RestoreSelfScreenProps {
  onAddReflection: (text: string, meta?: any) => void;
  presenceCarrier: PresenceCarrier | null;
  onNavigateToPresence: () => void;
  dailyPrompt: string;
  onSealDailyReflection: (text: string, meta?: any) => void;
  onNextPrompt: () => void;
  onSelectDailyReturn: (path: string) => void;
  onBeginQuickStart: () => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  isThreeMinuteFlow: boolean;
  onCancelThreeMinuteFlow: () => void;
  onAddCodexEntry: (entry: Partial<CodexEntry>) => void;
  onNavigate: (screen: Screen, tab: Tab, view?: any) => void;
  updateChecklist: (key: keyof ChecklistState | 'reset') => void;
}

export const RestoreSelfScreen = memo(({ 
  onAddReflection, 
  presenceCarrier, 
  onNavigateToPresence,
  dailyPrompt,
  onSealDailyReflection,
  onNextPrompt,
  onSelectDailyReturn,
  onBeginQuickStart,
  dismissedGuidance,
  onDismissGuidance,
  isThreeMinuteFlow,
  onCancelThreeMinuteFlow,
  onAddCodexEntry,
  onNavigate,
  updateChecklist
}: RestoreSelfScreenProps) => {
  const [note, setNote] = useState('');
  const [reflectionMetadata, setReflectionMetadata] = useState<any>(null);
  const [dailyMetadata, setDailyMetadata] = useState<any>(null);
  
  return (
    <div className="pt-24 pb-48 sm:pb-32 px-6 max-w-5xl mx-auto space-y-12">
      <AnimatePresence>
        {isThreeMinuteFlow && (
          <ThreeMinuteFlowOverlay 
            onComplete={() => { updateChecklist('three_minute_return'); onCancelThreeMinuteFlow(); }}
            onCancel={onCancelThreeMinuteFlow}
            onAddReflection={(entry, meta) => onAddCodexEntry({ ...entry, metadata: { ...entry.metadata, ...meta } })}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!dismissedGuidance.includes('restore-guidance') && (
          <GuidanceChip 
            id="restore-guidance" 
            text="Start here when you need to return to your body, room, intention, or practice. The daily cycle resets without shame." 
            onDismiss={() => onDismissGuidance('restore-guidance')}
          />
        )}
      </AnimatePresence>

      <QuickStartPath onBegin={onBeginQuickStart} />

      <DailyReturnPanel onSelect={onSelectDailyReturn} />

      <section className="pt-8">
        <div className="p-12 rounded-[48px] bg-white/5 border border-white/10 flex flex-col justify-center space-y-6 text-center">
           <div className="space-y-2">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pearl/20">The Work of Alignment</p>
             <h2 className="text-5xl font-serif text-gold">Restore Self</h2>
           </div>
           <p className="text-xl italic text-pearl/60 leading-relaxed max-w-2xl mx-auto">Align your inner rhythm with the pulsing light. Practice the art of returning to essence through silence and truth.</p>
           <div className="h-px w-24 bg-gold/20 mx-auto" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 glass-panel rounded-[32px] p-8 border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
              <Sprout className="w-3 h-3" /> The Harmonic Pillars
            </span>
          </div>
          <h3 className="text-3xl font-serif">Internal Reflection</h3>
          <p className="text-lg text-pearl/80 leading-relaxed italic">
            "In the silence between breaths, what fragment of your true essence is waiting to be heard?"
          </p>
          <p className="text-[10px] uppercase tracking-widest text-pearl/30 font-bold leading-relaxed border-l border-gold/20 pl-4 py-1">
            Care: This is your private sanctuary. Save your thoughts before continuing your descent into the labyrinth.
          </p>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
            <label htmlFor="self-reflection-input" className="text-[10px] uppercase tracking-widest text-pearl/40 font-bold">Your Truth</label>
            <textarea 
              id="self-reflection-input"
              name="self-reflection"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is arising now?"
              className="w-full bg-midnight/40 border border-white/10 rounded-2xl p-4 text-pearl italic focus:border-gold/40 outline-none transition-colors"
              rows={3}
            />

            <RelationLensLayer 
              text={note} 
              initialAxes={['self']}
              onMetadataChange={setReflectionMetadata} 
            />
          </div>

          <button 
            id="btn-save-reflection-to-codex"
            onClick={() => { if(note.trim()) { onAddReflection(note, { lawfulRelation: reflectionMetadata }); setNote(''); } }}
            className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Save Reflection to Codex
          </button>
        </div>

        <div className="md:col-span-5 flex flex-col gap-6">
          <button 
            onClick={onNavigateToPresence}
            className="flex-1 glass-panel rounded-[24px] p-8 border-white/5 flex flex-col justify-between gap-6 group text-left transition-all hover:border-gold/30"
          >
            <div className="space-y-4 flex flex-col items-center">
              <div className="relative">
                <Radio className={`w-12 h-12 ${presenceCarrier ? 'text-gold animate-pulse' : 'text-pearl/20'}`} />
                {presenceCarrier && <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-serif text-gold">Quiet Presence</h3>
                <p className="text-sm text-pearl/60 mt-1">
                  {presenceCarrier ? `Active: "${presenceCarrier.intentionText}"` : 'Save an intention for ambient attunement.'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: presenceCarrier ? ['-100%', '100%'] : '0%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className={`h-full w-1/3 bg-gold ${presenceCarrier ? 'opacity-100' : 'opacity-20'}`} 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-pearl/40 uppercase tracking-widest">
                  {presenceCarrier ? `${presenceCarrier.selectedPillars.length} Pillars Saved` : 'Inactive'}
                </span>
                <div className="flex items-center gap-2 text-gold group-hover:translate-x-1 transition-transform">
                  <span className="text-[8px] font-bold uppercase tracking-widest">Manage</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </button>

          <div className="glass-panel rounded-[24px] p-8 border-white/5 space-y-4">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-gold/60" />
               <span className="text-[10px] font-bold text-pearl/60 uppercase tracking-widest">Privacy Lock</span>
             </div>
             <p className="text-[10px] text-pearl/30 italic">Carrier data is saved on-device. No external reach.</p>
          </div>
        </div>
      </div>

      <DailyReflectionTool 
        prompt={dailyPrompt} 
        onSeal={onSealDailyReflection} 
        onSkip={() => {}} 
        onNextPrompt={onNextPrompt}
      />
    </div>
  );
});
