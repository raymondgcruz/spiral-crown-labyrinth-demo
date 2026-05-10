/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkle, 
  Activity, 
  Shield, 
  Check,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  analyzeReflectionText, 
  buildFieldCheckMetadata, 
  RelationAxis,
  LawfulRelationMetadata
} from '../utils/lawfulRelationAnalysis';
import { PILLAR_RESTORATION_MAP, ANALYSIS_BANDS } from '../data/ahaSaf';

interface RelationLensLayerProps {
  text: string;
  onMetadataChange: (metadata: LawfulRelationMetadata | null) => void;
  initialAxes?: RelationAxis[];
}

export const RelationLensLayer = memo(({ text, onMetadataChange, initialAxes }: RelationLensLayerProps) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [axes, setAxes] = useState<RelationAxis[]>(initialAxes || []);
  const [signals, setSignals] = useState<string[]>([]);
  const [pillars, setPillars] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-analysis when text changes
  useEffect(() => {
    if (!isEnabled || text.length < 5) {
      if (!isEnabled) onMetadataChange(null);
      return;
    }

    const { axes: detectedAxes, signals: detectedSignals, pillars: detectedPillars } = analyzeReflectionText(text);
    
    // We only update if user hasn't manually touched them too much? 
    // For now, let's just update if they are empty or if we are in "auto" mode.
    setAxes(prev => prev.length === 0 ? detectedAxes : prev);
    setSignals(detectedSignals);
    setPillars(detectedPillars);
  }, [text, isEnabled]);

  // Sync to parent
  useEffect(() => {
    if (isEnabled && (axes.length > 0 || signals.length > 0 || pillars.length > 0)) {
      onMetadataChange(buildFieldCheckMetadata(axes, signals, pillars, true));
    } else {
      onMetadataChange(null);
    }
  }, [isEnabled, axes, signals, pillars]);

  const toggleAxis = (axis: RelationAxis) => {
    setAxes(prev => prev.includes(axis) ? prev.filter(a => a !== axis) : [...prev, axis]);
  };

  const togglePillar = (pillar: string) => {
    setPillars(prev => prev.includes(pillar) ? prev.filter(p => p !== pillar) : [...prev, pillar]);
  };

  const allAvailableSignals = Array.from(new Set(ANALYSIS_BANDS.flatMap(b => b.chips)));

  if (!isEnabled) {
    return (
      <button 
        onClick={() => setIsEnabled(true)}
        className="text-[10px] font-bold text-pearl/20 hover:text-gold transition-colors uppercase tracking-[0.2em] flex items-center gap-2 py-2"
      >
        <Activity className="w-3 h-3" /> Enable Relation Lens
      </button>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-gold/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Relation Lens</span>
        </div>
        <button 
          onClick={() => setIsEnabled(false)}
          className="p-1 text-pearl/20 hover:text-red-400 transition-colors"
          title="Remove Analysis"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['self', 'other', 'environment'] as RelationAxis[]).map(axis => (
          <button
            key={axis}
            onClick={() => toggleAxis(axis)}
            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${
              axes.includes(axis) ? 'bg-gold/20 border-gold/40 text-gold shadow-luminous' : 'bg-white/5 border-white/5 text-pearl/30'
            }`}
          >
            {axis}
          </button>
        ))}
      </div>

      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {signals.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-midnight/40 text-[8px] text-gold/40 border border-gold/10 uppercase tracking-widest">
              {s}
            </span>
          ))}
        </div>
      )}

      {pillars.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-pearl/30 uppercase tracking-widest font-black">Suggested Restoration</p>
          <div className="flex flex-wrap gap-2">
            {pillars.map(p => (
              <button
                key={p}
                onClick={() => togglePillar(p)}
                className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold transition-all ${
                  pillars.includes(p) ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400' : 'bg-white/5 border-white/5 text-pearl/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-pearl/20 hover:text-pearl/40 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Edit Relation Details'} <ChevronDown className={`w-2 h-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            <div className="space-y-2">
              <p className="text-[8px] text-pearl/40 uppercase tracking-widest font-black">All Signals</p>
              <div className="flex flex-wrap gap-1">
                {allAvailableSignals.slice(0, 20).map(s => (
                  <button
                    key={s}
                    onClick={() => setSignals(prev => prev.includes(s) ? prev.filter(sig => sig !== s) : [...prev, s])}
                    className={`px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-widest transition-all ${
                      signals.includes(s) ? 'bg-gold/20 text-gold' : 'bg-white/5 text-pearl/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[8px] text-pearl/20 italic">
        Analysis is local. metadata is attached to this Codex entry.
      </p>
    </div>
  );
});
