/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { Zap } from 'lucide-react';

interface QuickStartPathProps {
  onBegin: () => void;
}

export const QuickStartPath = memo(({ onBegin }: QuickStartPathProps) => {
  return (
    <div className="p-8 rounded-[40px] bg-gold/5 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="relative z-10 space-y-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Zap className="w-4 h-4 text-gold animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gold">3-Minute Return</span>
        </div>
        <h3 className="text-2xl font-serif text-pearl">Simple Return Path</h3>
        <p className="text-xs text-pearl/40 italic">“Three minutes is enough to return.”</p>
      </div>
      <button 
        onClick={onBegin}
        className="relative z-10 px-8 py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all hover:scale-105 active:scale-95 text-[10px]"
      >
        Begin 3-Minute Return
      </button>
    </div>
  );
});
