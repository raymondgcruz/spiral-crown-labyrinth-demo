/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, ShieldCheck, CheckCircle } from 'lucide-react';
import { BROADCAST_STATES } from '../data';
import { BroadcastState, CodexEntry } from '../types';
import { GuidanceChip } from '../components/GuidanceChip';
import { RoanokeFieldGenerator } from '../components/RoanokeFieldGenerator';
import { RoanokeFieldSnapshot } from '../types/fieldWorld';

interface BroadcastScreenProps {
  isBroadcasting: boolean;
  onStart: (state: BroadcastState) => void;
  onStop: () => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  activeField: RoanokeFieldSnapshot | null;
  onSetActiveField: (field: RoanokeFieldSnapshot | null) => void;
  onReflect?: (entry: Partial<CodexEntry>) => void;
}

export const BroadcastScreen = memo(({ 
  isBroadcasting, 
  onStart, 
  onStop, 
  dismissedGuidance, 
  onDismissGuidance,
  activeField,
  onSetActiveField,
  onReflect
}: BroadcastScreenProps) => {
  const [selectedStateId, setSelectedStateId] = useState(BROADCAST_STATES[0].id);
  const [duration, setDuration] = useState(30);
  const selectedState = BROADCAST_STATES.find(s => s.id === selectedStateId) || BROADCAST_STATES[0];

  const durations = [15, 30, 60, 120];

  if (isBroadcasting) {
    return (
      <div id="screen-broadcast-active" className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
        <AnimatePresence>
          {!dismissedGuidance.includes('broadcast-active-guidance') && (
            <GuidanceChip 
              id="broadcast-active-guidance" 
              text="Presence is signal. Your broadcast is a local simulation of intent." 
              onDismiss={() => onDismissGuidance('broadcast-active-guidance')}
            />
          )}
        </AnimatePresence>
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Live Simulated Broadcast</div>
          <h2 className="text-5xl font-serif text-gold">Field Active</h2>
          <p className="text-lg text-pearl/60 italic">“The field may breathe. Your presence is noted locally.”</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-[48px] border-emerald-400/20 shadow-luminous text-center space-y-8 relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent opacity-20" />
           
           <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-400/30 flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-20" />
                <Radio className="w-10 h-10 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-serif text-pearl">{selectedState.label}</h3>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400/60">Simulated Presence Active</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-pearl/30">Visibility</span>
                  <p className="text-[10px] font-bold text-pearl/60 uppercase">{selectedState.visibility}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-pearl/30">Consent</span>
                  <p className="text-[10px] font-bold text-pearl/60 uppercase">{selectedState.consentLevel}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-sm text-pearl/40 italic max-w-sm mx-auto">
                  No identity or exact location is being broadcast. This is a local prototype simulation.
                </p>
                <button 
                  onClick={onStop}
                  className="w-full max-w-xs mx-auto py-5 border border-red-400/30 text-red-400 font-bold uppercase tracking-widest rounded-full hover:bg-red-400/10 transition-all text-xs"
                >
                  Stop Broadcast
                </button>
              </div>
           </div>
        </motion.div>

        <RoanokeFieldGenerator 
          activeField={activeField} 
          onSetActiveField={onSetActiveField} 
          onReflect={onReflect}
          className="pt-12"
        />
      </div>
    );
  }

  return (
    <div id="screen-broadcast-init" className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-serif text-gold">Field Broadcast</h2>
        <p className="text-lg text-pearl/60 italic max-w-2xl mx-auto">
          Signal your intention to the simulated community field. No data leaves this device.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 ml-2">Choose Broadcast State</label>
          <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {BROADCAST_STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => setSelectedStateId(state.id)}
                className={`w-full p-6 rounded-3xl text-left transition-all border ${selectedStateId === state.id ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                   <h4 className={`font-serif text-xl ${selectedStateId === state.id ? 'text-gold' : 'text-pearl/80'}`}>{state.label}</h4>
                   {selectedStateId === state.id && <CheckCircle className="w-5 h-5 text-gold" />}
                </div>
                <p className="text-xs text-pearl/40 leading-relaxed">{state.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <motion.div 
            key={selectedStateId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-[48px] border-gold/20 space-y-8 sticky top-32"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Simulated Protocol</span>
              <h3 className="text-3xl font-serif text-pearl">{selectedState.label}</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Privacy Protection</span>
                 </div>
                 <div className="pl-8 space-y-1">
                    <p className="text-[10px] text-pearl/40 font-bold uppercase tracking-widest">Visibility: {selectedState.visibility}</p>
                    <p className="text-[10px] text-pearl/40 font-bold uppercase tracking-widest">Consent: {selectedState.consentLevel}</p>
                 </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Broadcast Duration (Minutes)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map(d => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`py-3 rounded-2xl border text-[10px] font-bold transition-all ${duration === d ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-white/5 border-white/10 text-pearl/40 hover:bg-white/10'}`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-2 text-pearl/30 text-[10px] italic leading-relaxed pt-4 border-t border-white/5">
                 <p>“Implicit co-presence is the goal, not explicit tracking.”</p>
                 <p>“All coordinates are obfuscated via local simulation.”</p>
               </div>
            </div>

            <button 
              onClick={() => onStart({ ...selectedState, suggestedDuration: duration })}
              className="w-full py-6 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Begin Simulated Broadcast
            </button>
          </motion.div>
        </div>
      </div>

      <RoanokeFieldGenerator 
        activeField={activeField} 
        onSetActiveField={onSetActiveField} 
        onReflect={onReflect}
        className="pt-12"
      />
    </div>
  );
});
