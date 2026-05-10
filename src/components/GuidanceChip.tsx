/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

interface GuidanceChipProps {
  id: string;
  text: string;
  onDismiss: () => void;
}

export const GuidanceChip = memo(({ text, onDismiss }: GuidanceChipProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="mx-6 p-4 rounded-2xl bg-gold/10 border border-gold/20 backdrop-blur-xl flex items-start gap-4 shadow-luminous"
    >
      <div className="p-2 rounded-full bg-gold/20 text-gold">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gold">Protocol Insight</p>
        <p className="text-xs text-pearl/80 italic leading-relaxed">{text}</p>
      </div>
      <button onClick={onDismiss} className="p-1 text-pearl/20 hover:text-gold transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
});
