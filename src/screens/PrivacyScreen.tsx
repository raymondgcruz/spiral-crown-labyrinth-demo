/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { 
  ShieldCheck, 
  Database as DatabaseIcon, 
  Key, 
  RefreshCw, 
  Sparkles, 
  EyeOff, 
  Radio, 
  Handshake,
  Archive
} from 'lucide-react';
import { exportRawBackup } from '../utils/backup';

import { VERSION } from '../data';
import { APP_PHASE } from '../version';

export const PrivacyScreen = memo(() => (
  <div id="screen-privacy" className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-16">
    <header className="text-center space-y-4">
      <h2 className="text-5xl font-serif text-gold">Privacy & Consent</h2>
      <p className="text-[10px] text-pearl/40 uppercase font-black tracking-[0.3em]">{VERSION} • {APP_PHASE}</p>
      <p className="text-lg text-pearl/60 italic">Your sanctuary is guarded by your own device.</p>
    </header>

    <div className="space-y-12">
      <div className="glass-panel p-10 rounded-[48px] border-emerald-400/20 shadow-luminous relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-1000">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-3xl font-serif text-emerald-400">The Sovereign Protocol</h3>
          <p className="text-pearl/80 leading-relaxed font-serif italic text-lg">
            “No accounts, no cloud, no keys but yours.”
          </p>
          <div className="space-y-4 pt-4">
            {[
              { icon: DatabaseIcon, title: 'Local Storage Only', desc: 'All intentions, reflections, and carrier data reside strictly in your browser\'s local storage. We have no way to access it.' },
              { icon: ShieldCheck, title: 'No External APIs', desc: 'The app works as a closed loop. No telemetry, no analytics, and no external AI calls are made.' },
              { icon: Key, title: 'Local Phrase Generation', desc: 'The Phrase Builder uses strictly local templates. Your choices are never transmitted.' },
              { icon: RefreshCw, title: 'Daily Return Persistence', desc: 'Your Daily Return path choices are recorded only in your local Codex. No "streak" data leaves your device.' },
              { icon: Sparkles, title: 'Dismissible Guidance', desc: 'Contextual protocol insights are stored as local dismissal flags.' },
              { icon: EyeOff, title: 'Zero Permissions', desc: 'No camera, microphone, GPS, or hardware APIs used. Your physical context remains private.' },
              { icon: Radio, title: 'Simulated resonance', desc: 'Field features are strictly simulated. No live user data is transmitted or discovered.' },
              { icon: Handshake, title: 'Explicit Consent', desc: 'Every action—especially Map entry—is a manual choice. Nothing happens by default.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <item.icon className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-pearl">{item.title}</h4>
                  <p className="text-xs text-pearl/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-10 rounded-[48px] border-white/5 space-y-6">
        <h3 className="text-2xl font-serif">Data Portability</h3>
        <p className="text-sm text-pearl/60 leading-relaxed">
          Because we do not store your data, if you clear your browser cache or change devices, your active presence carrier and Codex will be reset. 
          Use the "Export JSON" feature for carriers or "Export Codex" to save local files of your records.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
           <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-pearl/40 font-mono italic">
             Protocol: ROANOKE (Local Canonical Object v1.0)
           </div>
           <button 
             onClick={exportRawBackup}
             className="flex-1 p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 flex items-center justify-center gap-3 group"
           >
             <Archive className="w-4 h-4 text-gold/60 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-bold text-pearl uppercase tracking-widest">Emergency Raw Backup</span>
           </button>
        </div>
        <p className="text-[10px] text-pearl/20 italic mt-4">
          Nothing is broadcast unless the user explicitly enters the separate simulated "Field Broadcast" flow. ROA lines are local symbolic summaries.
        </p>
      </div>
    </div>
  </div>
));
