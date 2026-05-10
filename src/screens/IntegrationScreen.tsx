/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface IntegrationScreenProps {
  onFinish: () => void;
}

export const IntegrationScreen = memo(({ onFinish }: IntegrationScreenProps) => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pulse < 100) setPulse(pulse + 1);
    }, 30);
    return () => clearTimeout(timer);
  }, [pulse]);

  return (
    <div className="fixed inset-0 z-[150] bg-midnight flex flex-col items-center justify-center p-6 space-y-12">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gold/10 rounded-full blur-3xl"
        />
        <div className="relative text-center">
          <div className="text-6xl font-serif text-gold mb-2">{pulse}%</div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/40">Integrating Field</div>
        </div>
      </div>

      <AnimatePresence>
        {pulse === 100 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-4xl font-serif text-pearl">The Descent is Ready</h3>
              <p className="text-sm text-pearl/40 italic font-serif">“Whatever clarity was found is now part of the weave.”</p>
            </div>
            <button 
              onClick={onFinish}
              className="px-12 py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous flex items-center justify-center gap-3 group mx-auto"
            >
              Continue Into the Core <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-gold/20">
         <ShieldCheck className="w-4 h-4" />
         <span className="text-[10px] font-black uppercase tracking-[0.5em]">Local Synthesis v1.0</span>
      </div>
    </div>
  );
});
