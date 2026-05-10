/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Archive, ArrowRight, CheckCircle, Download, FileUp, GitBranch, Hash, Leaf, ShieldCheck, Sparkles, Terminal, X } from 'lucide-react';
import { CodexEntry } from '../types';
import { RoanokeProofCard } from '../components/RoanokeProofCard';
import { buildRoanokeLedger, getLedgerStats } from '../roanoke/roanokeLedger';
import { createRoanokePack, downloadRoanokePack, reviewRoanokeImport } from '../roanoke/roanokePack';
import { unfoldRoanokeObject } from '../roanoke/roanokeUnfold';
import { RoanokeImportReview, RoanokeObject } from '../roanoke/roanokeTypes';
import { APP_PHASE, APP_VERSION, ROANOKE_BACKBONE_VERSION } from '../version';

interface RoanokeScreenProps {
  localReflections: CodexEntry[];
  onImport: (data: string) => { success: boolean; count?: number; error?: string };
  onNavigateCodex: () => void;
}

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`glass-panel rounded-[40px] border-white/10 p-6 sm:p-8 ${className}`}>{children}</section>
);

export const RoanokeScreen = memo(({ localReflections, onImport, onNavigateCodex }: RoanokeScreenProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importReview, setImportReview] = useState<RoanokeImportReview | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objects = useMemo(() => buildRoanokeLedger(localReflections), [localReflections]);
  const stats = useMemo(() => getLedgerStats(objects), [objects]);
  const selected = useMemo(() => objects.find(obj => obj.id === selectedId) || objects[0], [objects, selectedId]);
  const unfold = useMemo(() => unfoldRoanokeObject(selected), [selected]);

  const typeSummary = Object.entries(stats.byType).slice(0, 6);
  const recent = objects.slice(0, 8);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pack = await createRoanokePack(objects);
      downloadRoanokePack(pack);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReviewFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = String(e.target?.result || '');
      const review = reviewRoanokeImport(text);
      setImportReview(review);
      setImportStatus(null);
    };
    reader.readAsText(file);
  };

  const handleImportAll = () => {
    if (!importReview || importReview.normalizedObjects.length === 0) return;
    const res = onImport(JSON.stringify({ schema: 'roanoke.pack.v1', objects: importReview.normalizedObjects }));
    if (res.success) {
      setImportStatus(`Imported ${res.count || importReview.normalizedObjects.length} record(s) after review.`);
      setImportReview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setImportStatus(res.error || 'Import failed safely.');
    }
  };

  return (
    <div className="pt-24 pb-48 px-6 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col lg:flex-row justify-between gap-8 lg:items-end">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-black uppercase tracking-[0.25em]">
            <ShieldCheck className="w-3 h-3" /> Local Proof Garden
          </div>
          <h2 className="text-5xl sm:text-6xl font-serif text-white/90">ROANOKE Ledger</h2>
          <p className="text-pearl/60 italic leading-relaxed">
            A practical, local-first proof garden for Codex memory, export/import review, relation summary, and one clean UNFOLD action. Nothing here uploads your private data.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onNavigateCodex} className="px-5 py-3 rounded-full border border-white/10 bg-white/5 text-pearl/60 hover:text-gold hover:border-gold/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            Codex <ArrowRight className="w-3 h-3" />
          </button>
          <button onClick={handleExport} disabled={isExporting || objects.length === 0} className="px-5 py-3 rounded-full bg-gold text-midnight disabled:opacity-40 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <Download className="w-3 h-3" /> {isExporting ? 'Preparing' : 'Export Pack'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50">Ledger Overview</p>
              <h3 className="text-2xl font-serif text-gold">Local memory spine</h3>
            </div>
            <div className="text-right text-[9px] uppercase tracking-widest text-pearl/30">
              <p>{APP_VERSION}</p>
              <p>{APP_PHASE}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Records', stats.objectCount],
              ['Proofs', stats.proofCount],
              ['Local-only', stats.localOnlyCount],
              ['Backbone', ROANOKE_BACKBONE_VERSION.replace('ROANOKE ', '')]
            ].map(([label, value]) => (
              <div key={String(label)} className="p-4 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-[8px] font-black uppercase tracking-widest text-pearl/25">{label}</p>
                <p className="text-lg font-serif text-pearl/80 truncate">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/40">Recent Records</p>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {recent.length === 0 && <p className="text-sm text-pearl/35 italic">No Codex records yet. Seal one reflection to begin the ledger.</p>}
                {recent.map(obj => (
                  <button key={obj.id} onClick={() => setSelectedId(obj.id)} className={`w-full text-left p-4 rounded-3xl border transition-all ${selected?.id === obj.id ? 'bg-gold/10 border-gold/30' : 'bg-white/[0.03] border-white/5 hover:border-gold/20'}`}>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gold/40">{obj.type}</p>
                    <p className="text-sm font-serif text-pearl/80 line-clamp-1">{obj.title}</p>
                    <p className="text-[10px] text-pearl/30 line-clamp-1">{obj.body}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/40">Relation Summary</p>
              <div className="space-y-2">
                {typeSummary.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pearl/45">{type}</span>
                    <span className="text-xs font-mono text-gold/70">{count}</span>
                  </div>
                ))}
                <p className="text-[11px] text-pearl/35 italic leading-relaxed pt-3">Suggested patterns remain descriptive only. User-approved graph edges can come later; this screen never treats a pattern as a command.</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-gold" />
            <h3 className="text-2xl font-serif text-gold">Proof Health</h3>
          </div>
          <RoanokeProofCard proof={selected?.proof} />
          <div className="p-4 rounded-3xl border border-emerald-400/10 bg-emerald-400/5 text-[11px] text-emerald-200/60 leading-relaxed">
            Proof previews are local integrity markers, not identity tracking. Full hashes stay collapsed unless you open them.
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-gold" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50">UNFOLD</p>
              <h3 className="text-2xl font-serif text-gold">One clean next action</h3>
            </div>
          </div>
          <motion.div key={selected?.id || 'empty'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h4 className="text-xl font-serif text-pearl/90">{unfold.title}</h4>
            {[
              ['What is present?', unfold.present],
              ['Active pillar', unfold.activePillar],
              ['Relationship asking for care', unfold.relationCare],
              ['Smallest clean action', unfold.nextAction],
              ['Log line', unfold.logLine]
            ].map(([label, value]) => (
              <div key={label} className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                <p className="text-[8px] font-black uppercase tracking-widest text-gold/40 mb-1">{label}</p>
                <p className="text-sm text-pearl/65 leading-relaxed">{value}</p>
              </div>
            ))}
            <p className="text-[11px] text-pearl/35 italic">{unfold.privacyNote}</p>
          </motion.div>
        </Panel>

        <Panel className="space-y-6">
          <div className="flex items-center gap-3">
            <Archive className="w-5 h-5 text-gold" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50">Import / Export</p>
              <h3 className="text-2xl font-serif text-gold">Sovereign backup</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={handleExport} disabled={isExporting || objects.length === 0} className="p-5 rounded-3xl bg-gold text-midnight disabled:opacity-40 text-left active:scale-[0.98] transition-all">
              <Download className="w-5 h-5 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Export ROANOKE Pack</p>
              <p className="text-[10px] opacity-70 mt-1">Downloads local JSON. Nothing uploads.</p>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-5 rounded-3xl bg-white/5 border border-white/10 text-left active:scale-[0.98] hover:border-gold/30 transition-all">
              <FileUp className="w-5 h-5 mb-3 text-gold" />
              <p className="text-[10px] font-black uppercase tracking-widest text-pearl/70">Review Import</p>
              <p className="text-[10px] text-pearl/35 mt-1">Preview before merge.</p>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleReviewFile} />
          {importReview && (
            <div className="rounded-[32px] border border-gold/15 bg-gold/[0.04] p-5 space-y-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gold/50">Review Ready</p>
                  <p className="text-sm text-pearl/70">{importReview.objectCount} importable record(s) · {importReview.quarantine.length} quarantined</p>
                  {importReview.errors.map(err => <p key={err} className="text-[10px] text-red-300/70">{err}</p>)}
                </div>
                <button onClick={() => setImportReview(null)} className="p-2 rounded-full bg-white/5 text-pearl/40 hover:text-red-300" aria-label="Cancel import review"><X className="w-4 h-4" /></button>
              </div>
              {importReview.quarantine.length > 0 && <p className="text-[10px] text-pearl/35">Unreadable records were kept out of the merge review.</p>}
              <div className="flex flex-wrap gap-3">
                <button onClick={handleImportAll} disabled={importReview.objectCount === 0} className="px-5 py-3 rounded-full bg-gold text-midnight disabled:opacity-40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Import All</button>
                <button onClick={() => setImportReview(null)} className="px-5 py-3 rounded-full border border-white/10 text-pearl/50 text-[10px] font-black uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          )}
          {importStatus && <p className="text-xs text-emerald-300/70 italic">{importStatus}</p>}
          <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-[11px] text-pearl/35 leading-relaxed">
            <Terminal className="w-4 h-4 text-gold/50 mb-2" />
            Import is staged: parse, normalize, review, then user-approved merge. Malformed records fail gently.
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <div className="flex items-center gap-3"><GitBranch className="w-5 h-5 text-gold" /><h3 className="text-2xl font-serif text-gold">ROANOKE Growth Path</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            ['Codex continuity', 'Existing entries remain readable and friendly.'],
            ['Map / Field continuity', 'ZIP field state can create local-only ROANOKE records.'],
            ['Consent before relation', 'Suggested edges remain suggestions until the user approves them.']
          ].map(([title, body]) => (
            <div key={title} className="p-4 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gold/50">{title}</p>
              <p className="text-xs text-pearl/45 mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
});
