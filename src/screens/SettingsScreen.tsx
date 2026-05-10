/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { 
  Shield, 
  Trash2, 
  Download, 
  HardDrive, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';
import { VERSION } from '../data/constants';

interface SettingsScreenProps {
  onReset: () => void;
  onExport: () => void;
  onTransmute: () => void;
}

export const SettingsScreen = memo(({ onReset, onExport, onTransmute }: SettingsScreenProps) => {
  const [isResetConfirming, setIsResetConfirming] = React.useState(false);

  return (
    <div id="screen-settings" className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-16">
      <header className="space-y-4 text-center">
        <h2 className="text-5xl font-serif text-white/90">System Protocol</h2>
        <p className="text-sm italic text-pearl/40">Manage your local sovereignty and relational memory.</p>
      </header>

      <section className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-gold/40 border-b border-gold/10 pb-4">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Privacy & Sovereignty</span>
          </div>
          <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-4">
             <p className="text-sm text-pearl/60 italic leading-relaxed">
               All reflections and practices are stored strictly in your browser's local storage. No data is sent to a cloud server. 
             </p>
             <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-4">
               <AlertTriangle className="w-5 h-5 text-gold/60 mt-1" />
               <p className="text-[10px] text-gold/60 leading-relaxed uppercase font-bold tracking-widest italic">Clearing your browser cache or deleting site data will permanently dissolve all memories.</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 text-gold/40 border-b border-gold/10 pb-4">
            <HardDrive className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Local Data</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <button 
              onClick={onExport}
              className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/40 transition-all group"
             >
               <div className="flex items-center gap-4">
                 <Download className="w-6 h-6 text-pearl/20 group-hover:text-gold transition-colors" />
                 <span className="text-sm font-bold uppercase tracking-widest text-pearl/60 group-hover:text-pearl transition-colors">Export Raw Backup</span>
               </div>
               <span className="text-[8px] font-mono text-pearl/20 italic">JSON FORMAT</span>
             </button>

             <button 
              onClick={onTransmute}
              className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/40 transition-all group"
             >
               <div className="flex items-center gap-4">
                 <RefreshCw className="w-6 h-6 text-pearl/20 group-hover:text-gold transition-colors" />
                 <span className="text-sm font-bold uppercase tracking-widest text-pearl/60 group-hover:text-pearl transition-colors">Force Transmutation</span>
               </div>
               <span className="text-[8px] font-mono text-pearl/20 italic">SCHEMA MIGRATION</span>
             </button>

             {!isResetConfirming ? (
               <button 
                id="btn-hard-reset"
                onClick={() => { setIsResetConfirming(true); }}
                className="w-full flex items-center justify-between p-6 rounded-3xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
               >
                 <div className="flex items-center gap-4">
                   <Trash2 className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                   <span className="text-sm font-bold uppercase tracking-widest text-red-400">Dissolve All Data</span>
                 </div>
                 <span className="text-[8px] font-mono text-red-400/40 italic">IRREVERSIBLE</span>
               </button>
             ) : (
               <div className="p-8 rounded-[40px] bg-red-500/10 border border-red-500/40 space-y-6 text-center animate-pulse">
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-red-400">Initiate Hard Reset?</p>
                 <p className="text-[10px] text-red-400/60 italic">All local memories will be permanently dissolved. This action cannot be undone.</p>
                 <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                    onClick={onReset}
                    className="flex-1 py-4 bg-red-500 text-white font-bold uppercase tracking-widest rounded-full shadow-lg text-[10px]"
                   >
                     Confirm Dissolution
                   </button>
                   <button 
                    onClick={() => setIsResetConfirming(false)}
                    className="flex-1 py-4 border border-white/10 text-pearl/40 font-bold uppercase tracking-widest rounded-full text-[10px]"
                   >
                     Cancel
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </section>

      <footer className="text-center space-y-4 pt-12 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Sovereign Labyrinth Protocol v{VERSION}</p>
        <p className="text-[8px] text-pearl/20 italic">Designed with Consent • Local Memory first</p>
      </footer>
    </div>
  );
});
