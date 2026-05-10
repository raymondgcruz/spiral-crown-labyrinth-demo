/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle, 
  CheckCircle2,
  Eye, 
  Handshake, 
  Anchor, 
  MessageSquare, 
  Zap, 
  X,
  BookOpen,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { 
  PracticeCategory, 
  PracticeItem, 
  ScenarioItem, 
  ScenarioChoice,
  PracticeProgress
} from '../types';
import { GuidanceChip } from '../components/GuidanceChip';
import { RelationLensLayer } from '../components/RelationLensLayer';
import { 
  CONSENT_PRACTICES, 
  LISTENING_PRACTICES, 
  REPAIR_PRACTICES, 
  BOUNDARY_PRACTICES, 
  RELATIONAL_SCENARIOS,
  PHRASE_TEMPLATES
} from '../data';

interface PhraseBuilderToolProps {
  onUse: (intention: string, tone: string, phrase: string) => void;
}

const PhraseBuilderTool = ({ onUse }: PhraseBuilderToolProps) => {
  const [intention, setIntention] = useState<keyof typeof PHRASE_TEMPLATES>('INVITE');
  const [tone, setTone] = useState<'GENTLE' | 'DIRECT' | 'WARM' | 'FIRM'>('GENTLE');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const currentPhrase = PHRASE_TEMPLATES[intention][tone].replace('[X]', '...');

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentPhrase);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = currentPhrase;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 sm:p-12 rounded-[56px] border-white/5 space-y-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Intention</label>
            <div className="grid grid-cols-2 gap-2">
              {['INVITE', 'DECLINE', 'REPAIR', 'ASK'].map(i => (
                <button 
                  key={i}
                  onClick={() => setIntention(i as any)}
                  className={`py-3 px-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${intention === i ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/5 text-pearl/40 hover:bg-white/10'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {['GENTLE', 'DIRECT', 'WARM', 'FIRM'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTone(t as any)}
                  className={`py-3 px-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${tone === t ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/10 text-pearl/40 hover:bg-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 h-full">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Generated Phrase</label>
              <div className="p-8 rounded-[40px] bg-midnight/60 border border-gold/20 shadow-luminous relative group min-h-[160px] flex items-center justify-center text-center">
                 <p className="text-xl font-serif italic text-gold leading-relaxed">{currentPhrase}</p>
                 <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 text-pearl/20 hover:text-gold transition-colors"
                 >
                    {copyFeedback ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                 </button>
              </div>
              <p className="text-[8px] text-pearl/20 italic text-center uppercase tracking-widest">Local Templates Only • No Privacy Leakage</p>
           </div>
           
           <button 
            onClick={() => onUse(intention, tone, currentPhrase)}
            className="w-full py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
           >
             <BookOpen className="w-4 h-4" /> Save Phrase to Codex
           </button>
        </div>
      </div>
    </motion.div>
  );
};

interface RestorePracticeScreenProps {
  progress: PracticeProgress;
  activeCategory: PracticeCategory;
  setActiveCategory: (cat: PracticeCategory) => void;
  onCompletePractice: (item: PracticeItem, reflection: string, sealed: boolean, meta?: any) => void;
  onCompleteScenario: (scenario: ScenarioItem, choice: ScenarioChoice) => void;
  onUsePhraseBuilder: (intention: string, tone: string, phrase: string) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
}

const selectedCategoryLabel = (cat: string) => {
  if (!cat) return 'Practice';
  return cat.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ') + ' Practice';
};

export const RestorePracticeScreen = memo(({ progress, activeCategory, setActiveCategory, onCompletePractice, onCompleteScenario, onUsePhraseBuilder, dismissedGuidance, onDismissGuidance }: RestorePracticeScreenProps) => {
  const [selectedItem, setSelectedItem] = useState<PracticeItem | ScenarioItem | null>(null);
  const [tempReflection, setTempReflection] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<ScenarioChoice | null>(null);
  
  const categories: { id: PracticeCategory, label: string, icon: any }[] = [
    { id: 'CONSENT', label: 'Consent', icon: ShieldCheck },
    { id: 'LISTENING', label: 'Listening', icon: Eye },
    { id: 'REPAIR', label: 'Repair', icon: Handshake },
    { id: 'BOUNDARIES', label: 'Boundaries', icon: Anchor },
    { id: 'SCENARIO', label: 'Scenarios', icon: MessageSquare },
    { id: 'PHRASE_BUILDER', label: 'Phrase Builder', icon: Zap },
  ];

  const getItems = () => {
    switch(activeCategory) {
      case 'CONSENT': return CONSENT_PRACTICES;
      case 'LISTENING': return LISTENING_PRACTICES;
      case 'REPAIR': return REPAIR_PRACTICES;
      case 'BOUNDARIES': return BOUNDARY_PRACTICES;
      case 'SCENARIO': return RELATIONAL_SCENARIOS;
      default: return [];
    }
  };

  const currentItems = getItems();

  return (
    <div className="pt-24 pb-48 px-6 max-w-5xl mx-auto space-y-12">
      <AnimatePresence>
        {!dismissedGuidance.includes('practice-guidance') && (
          <GuidanceChip 
            id="practice-guidance" 
            text="Choose one relational skill. Practice gently. Save what matters to your Codex." 
            onDismiss={() => onDismissGuidance('practice-guidance')}
          />
        )}
      </AnimatePresence>
      <header className="text-center space-y-4">
        <div className="inline-block px-4 py-1 rounded-full border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5">Relationship Training</div>
        <h2 className="text-5xl font-serif text-gold">Embodied Practice</h2>
        <p className="text-sm italic text-pearl/60">Practical training for sovereign and connected relationship.</p>
        <div className="p-4 rounded-3xl bg-midnight/60 border border-gold/20 shadow-luminous text-center">
          <p className="text-[10px] text-pearl/40 uppercase tracking-widest font-black mb-1">Safety Note</p>
          <p className="text-[10px] text-pearl/60 italic leading-relaxed">
            This is a reflective practice prototype, not therapy or emergency support. If you are in crisis, please seek immediate local professional care.
          </p>
        </div>
      </header>

      {/* Category Selector */}
      <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:flex-wrap justify-start sm:justify-center gap-3 no-scrollbar -mx-6 px-6">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSelectedItem(null); setShowFeedback(null); }}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full border transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-gold/20 border-gold text-gold shadow-luminous scale-105' : 'bg-white/5 border-white/5 text-pearl/40 hover:bg-white/10'}`}
          >
            <cat.icon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeCategory === 'PHRASE_BUILDER' ? (
          <PhraseBuilderTool onUse={onUsePhraseBuilder} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentItems.map((item) => {
              const isCompleted = progress.completedIds.includes(item.id) || !!progress.scenarioResults[item.id];
              return (
                <motion.div 
                   layout
                  key={item.id}
                  className={`glass-panel p-8 rounded-[40px] border-white/5 flex flex-col justify-between gap-6 transition-all ${isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-gold/20'}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[8px] font-black uppercase tracking-widest text-gold">{item.pillar}</div>
                      {isCompleted && <CheckCircle2 className="w-5 h-5 text-gold" />}
                    </div>
                    <h3 className="text-2xl font-serif text-pearl">{item.title}</h3>
                    <p className="text-sm text-pearl/60 leading-relaxed italic line-clamp-3">
                      {'teaching' in item ? item.teaching : item.context}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-4 border border-gold/20 text-gold font-bold uppercase tracking-widest rounded-full hover:bg-gold/10 transition-colors text-[10px]"
                  >
                    Open Practice
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
        {[
          { label: 'Practices Returned To', value: progress.completedIds.length },
          { label: 'Scenarios Explored', value: Object.keys(progress.scenarioResults).length },
          { label: 'Phrases Built', value: progress.phraseUses },
          { label: 'Pathway Resonance', value: 'Active' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-3xl bg-midnight/40 border border-white/5 backdrop-blur-xl">
             <p className="text-xl font-serif text-gold">{stat.value}</p>
             <p className="text-[8px] font-black uppercase tracking-widest text-pearl/30">{stat.label}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl glass-panel p-8 sm:p-12 rounded-[56px] border-gold/20 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { setSelectedItem(null); setShowFeedback(null); }}
                className="absolute top-8 right-8 p-2 text-pearl/20 hover:text-gold transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {'teaching' in selectedItem ? (
                // --- Practice Item View ---
                <div className="space-y-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold/60">{selectedCategoryLabel(selectedItem.category)} • {selectedItem.pillar}</span>
                    <h3 className="text-4xl font-serif text-pearl">{selectedItem.title}</h3>
                  </div>
                  
                  <div className="p-6 rounded-3xl bg-gold/5 border border-gold/10 space-y-4">
                    <p className="text-sm font-serif text-gold italic leading-relaxed">“{selectedItem.teaching}”</p>
                    <div className="bg-midnight/40 p-4 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pearl/40">Try saying:</span>
                      <p className="text-xs text-pearl/80 italic">{selectedItem.example}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="practice-reflection-input" className="text-xs font-black uppercase tracking-widest text-gold/60">Internal Prompt</label>
                    <p className="text-sm text-pearl/60 leading-relaxed font-serif italic">{selectedItem.prompt}</p>
                    <div className="space-y-4">
                      <textarea 
                        id="practice-reflection-input"
                        name="practice-reflection"
                        value={tempReflection}
                        onChange={(e) => setTempReflection(e.target.value)}
                        placeholder="Your reflection..."
                        className="w-full bg-midnight/40 border border-white/10 rounded-2xl p-4 text-sm text-pearl font-serif italic outline-none focus:border-gold/40"
                        rows={3}
                      />

                      <RelationLensLayer 
                        text={tempReflection}
                        initialAxes={['other']}
                        onMetadataChange={setMetadata}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gold/60">Embodied Action</h4>
                    <p className="text-sm text-pearl/60 leading-relaxed">{selectedItem.embodiedAction}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => {
                        if (selectedItem && 'teaching' in selectedItem) {
                          onCompletePractice(selectedItem as PracticeItem, tempReflection, true, { lawfulRelation: metadata });
                          setSelectedItem(null);
                          setTempReflection('');
                        }
                      }}
                      className="flex-1 py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> Practice Complete & Save to Codex
                    </button>
                    <button 
                      onClick={() => {
                        if (selectedItem && 'teaching' in selectedItem) {
                          onCompletePractice(selectedItem as PracticeItem, tempReflection, false);
                          setSelectedItem(null);
                          setTempReflection('');
                        }
                      }}
                      className="px-8 py-5 border border-white/10 text-pearl/40 font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 text-[10px]"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ) : (
                // --- Scenario View ---
                <div className="space-y-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold/60">Scenario • {selectedItem.pillar}</span>
                    <h3 className="text-4xl font-serif text-pearl">{selectedItem.title}</h3>
                  </div>

                  <div className="p-8 rounded-3xl bg-midnight/40 border border-white/5">
                    <p className="text-lg font-serif italic text-pearl/80 leading-relaxed">“{selectedItem.context}”</p>
                  </div>

                  {!showFeedback ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gold/60">How do you respond?</h4>
                      <div className="space-y-3">
                        {selectedItem.choices.map((choice) => (
                          <button 
                            key={choice.id}
                            onClick={() => setShowFeedback(choice)}
                            className="w-full p-6 text-left rounded-3xl bg-white/5 border border-white/5 hover:border-gold/40 hover:bg-gold/5 transition-all group"
                          >
                            <p className="text-sm text-pearl/60 group-hover:text-pearl transition-colors leading-relaxed font-serif italic">{choice.text}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
              <div className={`p-8 rounded-[40px] border backdrop-blur-xl ${showFeedback.type === 'ALIGNED' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-gold/10 border-gold/40 shadow-luminous'}`}>
                         <div className="flex items-center gap-3 mb-4">
                            {showFeedback.type === 'ALIGNED' ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-gold" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${showFeedback.type === 'ALIGNED' ? 'text-emerald-400' : 'text-gold'}`}>
                              {showFeedback.type === 'ALIGNED' ? 'Aligned Resonance' : 'Dissonant Resonance'}
                            </span>
                         </div>
                         <p className="text-sm text-pearl/80 leading-relaxed font-serif italic mb-6">{showFeedback.feedback}</p>
                         {showFeedback.betterPhrase && (
                           <div className="bg-midnight/40 p-5 rounded-2xl border border-white/5 space-y-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-pearl/30">Consider this refinement:</span>
                             <p className="text-xs text-gold italic">{showFeedback.betterPhrase}</p>
                           </div>
                         )}
                      </div>

                      <button 
                        onClick={() => { onCompleteScenario(selectedItem, showFeedback); setSelectedItem(null); setShowFeedback(null); }}
                        className="w-full py-6 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-xs"
                      >
                        Complete Scenario & Record Feedback
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
