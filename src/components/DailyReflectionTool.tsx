/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { RefreshCw, BookOpen, Activity } from 'lucide-react';
import { RelationLensLayer } from './RelationLensLayer';
import { LawfulRelationMetadata } from '../utils/lawfulRelationAnalysis';

interface DailyReflectionToolProps {
  prompt: string;
  onSeal: (text: string, meta?: any) => void;
  onSkip: () => void;
  onNextPrompt: () => void;
}

export const DailyReflectionTool = memo(({ prompt, onSeal, onSkip, onNextPrompt }: DailyReflectionToolProps) => {
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState<LawfulRelationMetadata | null>(null);
  
  return (
    <div className="glass-panel p-8 rounded-[40px] border-gold/10 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/40">Evening Tending</p>
          <h3 className="text-xl font-serif text-pearl leading-relaxed italic">“{prompt}”</h3>
        </div>
        <button 
          onClick={onNextPrompt}
          className="p-2 rounded-full hover:bg-white/5 text-pearl/20 hover:text-gold transition-all"
          title="New Prompt"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <label htmlFor="daily-reflection-input" className="sr-only">Daily Reflection</label>
      <div className="space-y-4">
        <textarea 
          id="daily-reflection-input"
          name="daily-reflection"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="My reflection..."
          className="w-full bg-midnight/40 border border-white/10 rounded-2xl p-6 text-sm text-pearl font-serif italic outline-none focus:border-gold/40 transition-all"
          rows={4}
        />

        <RelationLensLayer 
          text={text} 
          initialAxes={['self']}
          onMetadataChange={setMetadata}
        />
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => onSeal(text, { lawfulRelation: metadata })}
          disabled={!text.trim()}
          className="flex-1 py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-[10px]"
        >
          <BookOpen className="w-4 h-4" /> Save daily reflection
        </button>
        <button 
          onClick={onSkip}
          className="px-6 py-4 border border-white/10 text-pearl/40 font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 text-[10px]"
        >
          Skip
        </button>
      </div>
    </div>
  );
});
