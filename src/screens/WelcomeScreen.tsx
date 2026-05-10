/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Wind, 
  Diamond, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight 
} from 'lucide-react';
import { VERSION } from '../data';
import { SacredImage } from '../components/SacredImage';
import { DailyReturnPanel } from '../components/DailyReturnPanel';

interface WelcomeScreenProps {
  onStart: () => void;
  isReturning: boolean;
  onSelectDailyReturn: (path: string) => void;
  isRestoring?: boolean;
}

export const WelcomeScreen = memo(({ onStart, isReturning, onSelectDailyReturn, isRestoring }: WelcomeScreenProps) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-24 overflow-hidden bg-midnight">
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-30%] left-[-20%] w-[100%] h-[100%] bg-amethyst/30 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-emerald/20 rounded-full blur-[150px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-warm-brown/10 rounded-full blur-[120px]" />
    </div>
    <div className="fixed inset-0 z-0 text-center flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden opacity-20">
       <div className="text-[20vw] font-serif text-white/5 whitespace-nowrap animate-pulse-slow">SPIRAL CROWN</div>
    </div>
    <div className="fixed inset-0 z-0">
      <SacredImage 
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1600" 
        className="w-full h-full object-cover opacity-[0.15] mix-blend-luminosity" 
        alt="Ancient Forest" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-transparent to-midnight" />
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 text-center mb-16 max-w-2xl px-4"
    >
      <div className="inline-block px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-[9px] font-black uppercase tracking-[0.4em] text-gold/60 mb-8">
         {VERSION} • Prototype Phase
      </div>
      <h1 className="text-5xl sm:text-7xl font-serif text-pearl leading-[1.1] mb-6 tracking-tight">Spiral Crown</h1>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/40 mb-6">Labyrinth of Living Relationship</p>
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6 opacity-50" />
      <p className="text-xl sm:text-2xl font-serif italic text-pearl/40 leading-relaxed">
        A sanctuary for the sovereign soul. <br className="hidden sm:block" />
        No accounts. No tracks. Only your presence.
      </p>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative z-10 glass-panel rounded-[48px] p-1 sm:p-1 max-w-5xl w-full border border-gold/10 shadow-2xl overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row bg-midnight/40 backdrop-blur-3xl rounded-[46px] overflow-hidden">
        <div className="w-full lg:w-[40%] relative min-h-[300px] lg:min-h-full">
            <SacredImage 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover opacity-80" 
              alt="Threshold" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-midnight lg:to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-2 block">The Protocol</span>
               <p className="text-lg font-serif italic text-pearl/80 leading-relaxed">
                 Restore your internal signal by navigating the four works: Self, Place, Others, and the Larger Field.
               </p>
            </div>
        </div>

        <div className="w-full lg:w-[60%] p-10 sm:p-14 space-y-12">
          {isReturning ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Welcome Back</span>
                <h3 className="text-3xl sm:text-4xl font-serif leading-tight text-pearl">What needs relationship today?</h3>
                <p className="text-sm text-pearl/40 font-serif italic">The path opens by consent. Choose your point of return.</p>
              </div>
              <DailyReturnPanel onSelect={onSelectDailyReturn} />
              <button 
                onClick={onStart}
                className="w-full py-4 border border-white/5 text-pearl/40 font-bold uppercase tracking-widest rounded-full hover:text-pearl active:scale-95 transition-all text-[10px]"
                aria-label="Continue general session"
              >
                Or Continue General Session
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Guided Entry</span>
                <h3 className="text-3xl sm:text-4xl font-serif leading-tight text-pearl">Foundations of Relational Trust</h3>
                <p className="text-balance text-sm text-pearl/40 font-serif italic">This prototype is a closed-loop system. Your data remains in the stone of your device.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
                {[
                  { icon: Wind, title: 'Restore', desc: 'Sync your breath and environment to return to a state of nourishing signal.' },
                  { icon: Diamond, title: 'Labyrinth', desc: 'A symbolic journey through your own internal architecture and insights.' },
                  { icon: ShieldCheck, title: 'Sovereign', desc: 'No surveillance. No cloud storage. You are the sole observer of your growth.' },
                  { icon: BookOpen, title: 'Codex', desc: 'A permanent local record of transitions, covenants, and personal clarity.' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3 group">
                    <div className="flex items-center gap-4 text-gold">
                      <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-sm uppercase tracking-widest">{item.title}</h4>
                    </div>
                    <p className="text-pearl/40 text-[11px] leading-relaxed font-serif italic">{item.desc}</p>
                  </div>
                ))}
              </div>
 
              <div className="pt-4 space-y-6">
                {isRestoring && (
                  <div className="p-6 rounded-3xl bg-emerald-400/5 border border-emerald-400/20 text-center space-y-3 mb-4 animate-pulse">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Restoration Signal Detected</p>
                     <p className="text-xs italic text-pearl/60">Accessing recovery protocols for your local ROANOKE Pack.</p>
                     <button 
                       onClick={() => alert('Recovery path: Please ensure your backup file is ready. (In this demo, ?restore=1 enables the recovery layer.)')}
                       className="px-6 py-2 rounded-full border border-emerald-400/40 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400/10 transition-all"
                     >
                       Import ROANOKE Pack
                     </button>
                  </div>
                )}
                <button 
                  id="btn-begin-session"
                  onClick={onStart}
                  className="w-full py-6 bg-gold text-midnight font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-luminous active:scale-[0.98] transition-all flex items-center gap-4 justify-center group text-xs sm:text-sm"
                  aria-label="Begin session flow"
                >
                  Begin the Session <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-pearl/30 font-bold uppercase tracking-[0.2em]">
                  By entering, you consent to the Sovereign Protocol.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
    
    <div className="silk-texture fixed inset-0 z-[60] pointer-events-none opacity-20" />
  </div>
));
