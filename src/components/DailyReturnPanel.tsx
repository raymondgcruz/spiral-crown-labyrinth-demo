/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { 
  Wind, 
  Home, 
  ShieldCheck, 
  MessageSquare, 
  Sun, 
  Radio, 
  BookOpen 
} from 'lucide-react';

interface DailyReturnPanelProps {
  onSelect: (path: string) => void;
}

export const DailyReturnPanel = memo(({ onSelect }: DailyReturnPanelProps) => {
  const options = [
    { id: 'body', label: 'My body / breath', icon: Wind },
    { id: 'place', label: 'My room / environment', icon: Home },
    { id: 'intentionality', label: 'My intention', icon: ShieldCheck },
    { id: 'relational', label: 'My relationships', icon: MessageSquare },
    { id: 'path', label: 'My path', icon: Sun },
    { id: 'community', label: 'My community field', icon: Radio },
    { id: 'memory', label: 'My memory', icon: BookOpen },
  ];

  return (
    <div className="glass-panel p-8 rounded-[40px] border-gold/10 space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/40">The Daily Cycle</p>
        <h3 className="text-2xl font-serif text-gold">What needs relationship today?</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button 
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gold/10 text-pearl/20 group-hover:text-gold transition-colors">
              <opt.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-pearl/60 group-hover:text-pearl transition-colors">{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-pearl/20 italic text-center uppercase tracking-widest">Return without shame • The path opens by consent</p>
    </div>
  );
});
