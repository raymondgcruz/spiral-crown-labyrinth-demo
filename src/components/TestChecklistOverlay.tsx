/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { ChecklistState } from '../types';

interface TestChecklistOverlayProps {
  showTestMode: boolean;
  checklist: ChecklistState;
  setShowTestMode: (val: boolean) => void;
  onReset: () => void;
}

export const TestChecklistOverlay = memo(({ showTestMode, checklist, setShowTestMode, onReset }: TestChecklistOverlayProps) => {
  return (
    <AnimatePresence>
      {showTestMode && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-24 left-6 z-[160] w-72 glass-panel p-6 rounded-[32px] border-orange-400/20 shadow-2xl space-y-6"
        >
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-orange-400">
               <ShieldAlert className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Tester Ritual</span>
             </div>
             <button onClick={() => setShowTestMode(false)} className="text-pearl/20 hover:text-orange-400"><X className="w-4 h-4" /></button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(checklist).map(([key, done]) => (
              <div key={key} className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-tighter">
                <span className={done ? 'text-emerald-400 font-bold' : 'text-pearl/40'}>{key.replace('_', ' ')}</span>
                {done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-white/10" />}
              </div>
            ))}
          </div>

          <button 
            onClick={() => { if(confirm('Permanently dissolve all local progress and memories?')) onReset(); }}
            className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-[9px]"
          >
            <RefreshCw className="w-3 h-3" /> Reset Everything
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
