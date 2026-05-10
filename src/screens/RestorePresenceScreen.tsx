/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Diamond, 
  ArrowRight, 
  BookOpen, 
  Download, 
  Copy, 
  CheckCircle,
  Hash
} from 'lucide-react';
import { PresenceCarrier } from '../types';
import { HARMONIC_CHAMBERS } from '../data/harmonicChambers';
import { generateHashPreview, generateROALine } from '../roanoke/proof';

interface RestorePresenceScreenProps {
  carrier: PresenceCarrier | null;
  onSaveCarrier: (c: PresenceCarrier) => void;
  onDeleteCarrier: () => void;
  onEnterChamber: () => void;
  onSealCodex: (c: PresenceCarrier) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
}

export const RestorePresenceScreen = memo(({ carrier, onSaveCarrier, onDeleteCarrier, onEnterChamber, onSealCodex, dismissedGuidance, onDismissGuidance }: RestorePresenceScreenProps) => {
  const [intentionText, setIntentionText] = useState('');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [duration, setDuration] = useState(10);
  const [breathMode, setBreathMode] = useState<'weave' | 'blend' | 'free'>('weave');
  const [isCreating, setIsCreating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const presets = {
    'Morning (Day 1)': ['sovereignty', 'clarity', 'radiance'],
    'Midday (Day 2)': ['respect', 'loyalty', 'support'],
    'Evening (Day 3)': ['peace', 'trust', 'sanctuary', 'grace'],
    'Heart Temple': ['love', 'compassion', 'wonder'],
    '16 Pillar Circuit': [
      'peace', 'love', 'understanding', 'respect', 'trust', 'truth', 'loyalty', 'support',
      'joy', 'clarity', 'compassion', 'grace', 'sovereignty', 'sanctuary', 'radiance', 'wonder'
    ]
  };

  const applyPreset = (ids: string[]) => {
    setSelectedPillars(ids);
  };

  const togglePillar = (id: string) => {
    setSelectedPillars(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSeal = (andEnter = false) => {
    if (!intentionText.trim() || selectedPillars.length === 0) return;
    const consentScope = 'Private/Local';
    const displayMode = 'Breath Rhythm';
    
    const hash = generateHashPreview({
      intentionText: intentionText.trim(),
      selectedPillars,
      consentScope,
      displayMode,
      sessionDuration: duration
    });

    const newCarrier: PresenceCarrier = {
      schema: 'spiral-crown-presence-carrier',
      version: '1.1',
      intentionText: intentionText.trim(),
      selectedPillars,
      consentScope,
      displayMode,
      sessionDuration: duration,
      createdAt: Date.now(),
      hashPreview: hash,
      roaLine: '',
      notes: '',
      breathSettings: {
        mode: breathMode,
        guided: breathMode !== 'free',
        safetyAcknowledged: false
      }
    };
    
    newCarrier.roaLine = generateROALine(newCarrier);
    onSaveCarrier(newCarrier);
    setIsCreating(false);
    if (andEnter) onEnterChamber();
  };

  const handleExport = () => {
    if (!carrier) return;
    const dataStr = JSON.stringify({
      ...carrier,
      exportTimestamp: new Date().toISOString()
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `presence-carrier-${carrier.hashPreview}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyROA = () => {
    if (!carrier) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(carrier.roaLine);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = carrier.roaLine;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      document.body.removeChild(textArea);
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (carrier && !isCreating) {
    return (
      <div id="screen-restore-presence-active" className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h2 className="text-5xl font-serif text-gold">Presence Review</h2>
          <p className="text-lg text-pearl/60 italic">“Your intention becomes a quiet presence, not a command.”</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 sm:p-12 rounded-[48px] border-gold/20 shadow-luminous relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-gold group-hover:rotate-12 transition-transform duration-1000">
            <Diamond className="w-32 h-32" />
          </div>

          <div className="space-y-10 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Sealed Intention</span>
                <h3 className="text-3xl font-serif text-pearl leading-tight">{carrier.intentionText}</h3>
              </div>
              <div className="sm:text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Hash Preview</span>
                <p className="text-xs font-mono text-gold/40">{carrier.hashPreview}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {carrier.selectedPillars.map(pid => {
                const chamber = HARMONIC_CHAMBERS.find(c => c.id === pid);
                if (!chamber) return null;
                const Icon = chamber.icon;
                return (
                  <div key={pid} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5">
                    <Icon className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">{chamber.pillar}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-6 rounded-3xl bg-midnight/60 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pearl/30">ROA Line (Local Canonical)</span>
                 <button 
                  onClick={handleCopyROA}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${copyFeedback ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-pearl/40 hover:text-gold'}`}
                 >
                   {copyFeedback ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                   {copyFeedback ? 'Copied' : 'Copy ROA'}
                 </button>
               </div>
               <p className="text-[9px] font-mono text-gold/40 break-all bg-midnight/30 p-4 rounded-xl border border-white/5">{carrier.roaLine}</p>
               <p className="text-[8px] text-pearl/20 italic">This line is a local symbolic carrier summary, not a blockchain record or external verification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pearl/30">Scope</span>
                <p className="text-xs font-bold text-pearl/60 uppercase">{carrier.consentScope}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pearl/30">Display Mode</span>
                <p className="text-xs font-bold text-pearl/60 uppercase">{carrier.displayMode}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pearl/30">Duration</span>
                <p className="text-xs font-bold text-pearl/60 uppercase">{carrier.sessionDuration}m</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                id="btn-enter-attunement-chamber"
                onClick={onEnterChamber}
                className="w-full py-6 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 text-sm"
              >
                Enter Attunement Chamber <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => onSealCodex(carrier)}
                  className="flex items-center justify-center gap-3 py-4 border border-gold/20 bg-gold/5 text-gold font-bold uppercase tracking-widest rounded-full hover:bg-gold/10 transition-all text-sm"
                >
                  <BookOpen className="w-4 h-4" /> Save Presence Reflection to Codex
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-3 py-4 border border-white/10 bg-white/5 text-pearl/60 font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-all text-xs"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
           <button 
            id="btn-refine-carrier"
            onClick={() => { setIntentionText(carrier.intentionText); setSelectedPillars(carrier.selectedPillars); setIsCreating(true); }}
            className="text-[10px] font-bold text-gold/40 border-b border-gold/10 pb-1 hover:text-gold hover:border-gold transition-all uppercase tracking-widest"
           >
             Refine Carrier
           </button>
           <button 
            id="btn-dissolve-carrier"
            onClick={() => { if(confirm('Permanently dissolve this local presence carrier? This action cannot be undone.')) onDeleteCarrier(); }}
            className="text-[10px] font-bold text-red-400/40 border-b border-red-400/10 pb-1 hover:text-red-400 hover:border-red-400 transition-all uppercase tracking-widest"
           >
             Permanently Dissolve Carrier
           </button>
        </div>
        
        <p className="text-[10px] text-pearl/20 text-center italic">“Enter only by consent. Stop anytime. Alignment unfolds without force.”</p>
      </div>
    );
  }

  return (
    <div id="screen-restore-presence-create" className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-serif text-gold">Name Intention</h2>
        <p className="text-lg text-pearl/60 italic max-w-xl mx-auto">Create a private presence carrier. Alignment unfolds without force.</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">“Save” means store this reflection in your private local Codex on this device.</p>
      </header>

      <div className="glass-panel p-8 sm:p-12 rounded-[48px] border-white/10 space-y-12">
        <div className="space-y-4">
          <label htmlFor="input-presence-intention" className="text-xs font-black uppercase tracking-[0.3em] text-gold/60">The Focal Point</label>
          <textarea 
            id="input-presence-intention"
            name="presence-intention"
            value={intentionText}
            onChange={(e) => setIntentionText(e.target.value.slice(0, 100))}
            placeholder="Enter a short intention..."
            className="w-full bg-midnight/40 border border-white/10 rounded-3xl p-6 text-2xl font-serif text-pearl italic focus:border-gold/40 outline-none transition-colors"
            rows={2}
          />
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] text-pearl/30 font-bold uppercase">Keep it brief and essence-focused</span>
            <span className="text-[10px] text-pearl/30 font-mono italic">{intentionText.length}/100</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <label className="text-xs font-black uppercase tracking-[0.3em] text-gold/60">Practice Paths (Optional)</label>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(presets).map(([name, ids]) => (
              <button 
                key={name}
                onClick={() => applyPreset(ids)}
                className="px-4 py-2 rounded-full border border-white/10 text-pearl/40 hover:border-gold/40 hover:text-gold transition-all"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-[0.3em] text-gold/60">Choose Harmonic Pillars</label>
              <p className="text-xs text-pearl/40 italic">Select one or many. The chamber will weave them into one field.</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] text-pearl/30 font-bold uppercase tracking-widest">
                {selectedPillars.length} selected: {selectedPillars.map(id => HARMONIC_CHAMBERS.find(c => c.id === id)?.pillar).join(' • ')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HARMONIC_CHAMBERS.map((chamber) => {
              const Icon = chamber.icon;
              const isActive = selectedPillars.includes(chamber.id);
              return (
                <button 
                  key={chamber.id}
                  onClick={() => togglePillar(chamber.id)}
                  className={`p-6 rounded-[32px] border text-left transition-all group ${isActive ? 'bg-gold/10 border-gold text-gold shadow-luminous' : 'bg-white/5 border-white/5 hover:border-white/20 text-pearl/40'}`}
                >
                  <Icon className={`w-6 h-6 mb-4 ${isActive ? 'text-gold' : 'text-pearl/20 group-hover:text-pearl/40'}`} />
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-2">{chamber.pillar}</h4>
                  <p className="text-[10px] italic opacity-60 leading-relaxed font-serif">{chamber.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-[0.3em] text-gold/60">Temporal Scope</label>
            <div className="flex gap-4">
              {[5, 10, 20, 30].map(m => (
                <button 
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`flex-1 py-4 rounded-2xl border font-bold text-xs transition-all ${duration === m ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/5 text-pearl/40 hover:bg-white/10'}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-[0.3em] text-gold/60">Breath Mode</label>
            <div className="flex gap-4">
              {(['weave', 'blend', 'free'] as const).map(m => (
                <button 
                  key={m}
                  onClick={() => setBreathMode(m)}
                  className={`flex-1 py-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all ${breathMode === m ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/5 text-pearl/40 hover:bg-white/10'}`}
                  title={m === 'weave' ? 'Cycle through each pillar' : m === 'blend' ? 'Combined averaged pattern' : 'Natural breathing'}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <button 
            id="btn-seal-presence-carrier"
            disabled={!intentionText.trim() || selectedPillars.length === 0}
            onClick={() => handleSeal(true)}
            className="w-full py-6 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-lg disabled:opacity-20 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Enter Attunement Chamber <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setSelectedPillars([])}
            className="text-[10px] font-bold text-pearl/20 hover:text-pearl/40 uppercase tracking-[0.3em] transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
});
