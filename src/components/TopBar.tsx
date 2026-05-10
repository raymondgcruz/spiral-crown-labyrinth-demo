/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { ArrowRight, ClipboardList, Settings2 } from 'lucide-react';
import { VERSION } from '../data/constants';
import { APP_PHASE } from '../version';

export const TopBar = ({ 
  title, 
  showBack = false, 
  onBack = () => {}, 
  onReset = () => {}, 
  onTestToggle = () => {}, 
  onOpenSettings = () => {} 
}: { 
  title: string, 
  showBack?: boolean, 
  onBack?: () => void, 
  onReset?: () => void, 
  onTestToggle?: () => void, 
  onOpenSettings?: () => void 
}) => {
  const displayTitle = title === 'WELCOME' ? 'Home' : title.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-10 h-20 bg-midnight/50 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-2 sm:gap-4">
        {showBack && (
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 text-gold/80 hover:bg-white/5 rounded-full active:scale-90 transition-all"
            aria-label="Go back"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        )}
        <button 
          onClick={onReset} 
          className="flex items-center gap-2 sm:gap-4 hover:opacity-80 active:scale-95 transition-all"
          aria-label="Home"
        >
          <div className="w-8 h-8 sm:w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center bg-gradient-to-tr from-gold/20 to-transparent">
            <div className="w-3 h-3 sm:w-4 h-4 rounded-full border border-gold"></div>
          </div>
          <div className="text-left">
            <h1 className="text-sm sm:text-xl font-serif tracking-widest text-gold uppercase leading-tight">Spiral Crown</h1>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] opacity-60 hidden xs:block">Labyrinth of Living Relationship</p>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden lg:flex flex-col items-end mr-4 leading-none">
          <span className="text-[8px] font-black uppercase tracking-widest text-gold/60">{VERSION}</span>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gold/40">{APP_PHASE}</span>
        </div>
        <button 
          onClick={onTestToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[8px] uppercase font-bold tracking-widest text-pearl/40 hover:text-gold hover:border-gold active:scale-90 transition-all"
          aria-label="Open prototype checklist"
        >
          <ClipboardList className="w-3 h-3 sm:w-4 h-4" />
          <span className="hidden sm:inline">Checklist</span>
        </button>
        <div 
          className="px-3 sm:px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-gold flex items-center gap-2"
          aria-label={`Current screen: ${displayTitle}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          <span className="max-w-[70px] sm:max-w-[100px] truncate">{displayTitle}</span>
        </div>
        <button 
          onClick={onOpenSettings} 
          className="w-8 h-8 sm:w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-pearl/60 hover:text-gold hover:border-gold active:scale-90 transition-all"
          aria-label="Open settings and about"
        >
          <Settings2 className="w-4 h-4 sm:w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
