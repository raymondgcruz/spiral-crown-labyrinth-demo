/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Hash, ShieldCheck } from 'lucide-react';
import { RoanokeProofBundle } from '../roanoke/roanokeTypes';

export const RoanokeProofCard = ({ proof, compact = false }: { proof?: RoanokeProofBundle | any; compact?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = proof?.hashPreview || proof?.hash?.slice?.(0, 12) || 'pending';
  return (
    <div className={`rounded-3xl border border-gold/10 bg-white/[0.03] ${compact ? 'p-4' : 'p-5'} space-y-3`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-gold/50">ROANOKE Proof</p>
            <p className="font-mono text-xs text-pearl/70">{preview}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-pearl/40 hover:text-gold hover:border-gold/30 transition-all"
          aria-label={expanded ? 'Collapse proof details' : 'Expand proof details'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="space-y-2 pt-3 border-t border-white/5 text-[10px] text-pearl/45">
          <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Local-only proof preview. No upload required.</p>
          <p><span className="text-pearl/25 uppercase tracking-widest font-bold">Method:</span> {proof?.method || 'pending'}</p>
          <p><span className="text-pearl/25 uppercase tracking-widest font-bold">Generated:</span> {proof?.generatedAt || 'pending'}</p>
          {proof?.hash && <p className="break-all font-mono text-[9px]"><span className="text-pearl/25 uppercase tracking-widest font-bold">Full hash:</span> {proof.hash}</p>}
        </div>
      )}
    </div>
  );
};
