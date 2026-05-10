/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { Screen, Tab } from '../types';
import { CHOIR_SUPPORT_PUBLIC_NOTE, getChoirSupportForTarget } from '../spiralCrown/choirSupportRegistry';

interface ChoirSupportPanelProps {
  screen: Screen;
  activeTab: Tab;
  chamberActive?: boolean;
}

const TONE_CLASS: Record<string, string> = {
  quiet: 'text-pearl/50 border-white/10 bg-white/5',
  protective: 'text-emerald-300/70 border-emerald-300/15 bg-emerald-300/5',
  active: 'text-gold/70 border-gold/20 bg-gold/10',
  restorative: 'text-pearl/70 border-gold/15 bg-gold/5',
  witnessing: 'text-pearl/60 border-white/10 bg-midnight/40',
};

export const ChoirSupportPanel = memo(({ screen, activeTab, chamberActive = false }: ChoirSupportPanelProps) => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('spiral-crown.choir-support.dismissed') === 'true');
  const [expanded, setExpanded] = useState(() => localStorage.getItem('spiral-crown.choir-support.expanded') === 'true');

  const profile = useMemo(() => getChoirSupportForTarget(screen || activeTab), [screen, activeTab]);
  const primaryRoles = profile.roles.slice(0, 4);

  useEffect(() => {
    localStorage.setItem('spiral-crown.choir-support.expanded', expanded ? 'true' : 'false');
  }, [expanded]);

  useEffect(() => {
    localStorage.setItem('spiral-crown.choir-support.dismissed', dismissed ? 'true' : 'false');
  }, [dismissed]);

  if (dismissed || chamberActive) return null;

  return (
    <div className="fixed right-4 bottom-44 sm:right-6 sm:bottom-32 z-[45] pointer-events-none max-w-[calc(100vw-2rem)]">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="pointer-events-auto w-[min(360px,calc(100vw-2rem))] rounded-[28px] border border-gold/10 bg-midnight/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:scale-[0.99] transition-transform"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-gold/45">Choir Support</p>
              <p className="text-[10px] sm:text-xs font-serif italic text-pearl/70 truncate">{profile.publicSummary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4 text-pearl/40" /> : <ChevronUp className="w-4 h-4 text-pearl/40" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                <div className="pt-3 flex items-start gap-2 text-[10px] text-pearl/35 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 text-gold/35 shrink-0" />
                  <p>{CHOIR_SUPPORT_PUBLIC_NOTE}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {primaryRoles.map(role => (
                    <div key={role.id} className={`rounded-2xl border px-3 py-2 ${TONE_CLASS[role.publicTone] || TONE_CLASS.quiet}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{role.publicLabel}</span>
                        <span className="text-[8px] uppercase tracking-widest opacity-45">{role.domain}</span>
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed opacity-80">{role.screenHint}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-pearl/20">{profile.mode} · public layer</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDismissed(true);
                    }}
                    className="px-3 py-2 rounded-full border border-white/10 text-pearl/30 hover:text-pearl/60 text-[8px] font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Hide
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
