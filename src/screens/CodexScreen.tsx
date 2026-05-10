/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Trash2, 
  BookOpen, 
  Copy, 
  CheckCircle,
  Download,
  Terminal,
  ArrowRight,
  Hash,
  Sparkles,
  Activity,
  Zap,
  X,
  Archive
} from 'lucide-react';
import { CodexEntry, CodexEntryType, RoanokeAxis } from '../types';
import { VERSION } from '../data/constants';
import { GuidanceChip } from '../components/GuidanceChip';
import { generateRoanokeProof } from '../roanoke/proof';
import { UNFOLD_PATHS } from '../roanoke/unfold';

const AxisChip = ({ axis, ...props }: { axis: RoanokeAxis, [key: string]: any }) => {
  const colors: Record<string, string> = {
    self: 'bg-gold/10 text-gold border-gold/20',
    other: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    environment: 'bg-blue-400/10 text-blue-400 border-blue-400/20'
  };
  return (
    <span {...props} className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${colors[axis] || 'bg-white/5 text-pearl/40'}`}>
      {axis}
    </span>
  );
};

interface CodexScreenProps {
  localReflections: CodexEntry[];
  completedCount: number;
  onClear: () => void;
  onClearEntry: (id: number | string) => void;
  onNavigate: (screen: string, tab: string, view?: any) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filter: CodexEntryType | 'all';
  setFilter: (f: CodexEntryType | 'all') => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  unfoldedPathKey: string | null;
  onUnfold: (key: string | null) => void;
  onApplyStep: (step: any) => void;
  onImport: (data: string) => { success: boolean, count?: number, error?: string };
  onOpenRoanoke?: () => void;
}

export const CodexScreen = memo(({ 
  localReflections, 
  completedCount, 
  onClear, 
  onClearEntry,
  onNavigate,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  dismissedGuidance,
  onDismissGuidance,
  unfoldedPathKey,
  onUnfold,
  onApplyStep,
  onImport,
  onOpenRoanoke
}: CodexScreenProps) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [axisFilter, setAxisFilter] = useState<RoanokeAxis | 'all'>('all');
  const [importStatus, setImportStatus] = useState<{ success: boolean, count: number } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const res = onImport(data);
      if (res.success) {
        setImportStatus({ success: true, count: res.count || 0 });
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        alert(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const safeEntries = useMemo(() => {
    return (Array.isArray(localReflections) ? localReflections : []).map((entry: any) => ({
      ...entry,
      id: entry?.id ?? `${Date.now()}-${Math.random()}`,
      type: typeof entry?.type === 'string' ? entry.type : 'reflection',
      title: typeof entry?.title === 'string' ? entry.title : 'Untitled Memory',
      body: typeof entry?.body === 'string' ? entry.body : '',
      createdAt: entry?.createdAt || new Date().toISOString(),
      axes: Array.isArray(entry?.axes) ? entry.axes : ['self'],
      tags: Array.isArray(entry?.tags) ? entry.tags : [],
      metadata: entry?.metadata && typeof entry.metadata === 'object' ? entry.metadata : {},
    })) as CodexEntry[];
  }, [localReflections]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return safeEntries.filter(entry => {
      const matchesSearch = (entry.title || '').toLowerCase().includes(query) || 
                           (entry.body || '').toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || entry.type === filter || entry.kind === filter;
      const matchesAxis = axisFilter === 'all' || (entry.axes || []).includes(axisFilter);
      return matchesSearch && matchesFilter && matchesAxis;
    });
  }, [safeEntries, searchTerm, filter, axisFilter]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, CodexEntry[]> = {};
    filteredEntries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const dateLabel = isNaN(date.getTime()) ? 'Unscheduled' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(entry);
    });
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === 'Unscheduled') return 1;
      if (b[0] === 'Unscheduled') return -1;
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [filteredEntries]);

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleExport = () => {
    const roanokePack = {
      schema: 'roanoke.pack.v1',
      exportedAt: new Date().toISOString(),
      appVersion: VERSION,
      objects: localReflections,
      summary: {
        objectCount: localReflections.length,
        axesCounts: {
          self: localReflections.filter(r => (r.axes || []).includes('self')).length,
          other: localReflections.filter(r => (r.axes || []).includes('other')).length,
          environment: localReflections.filter(r => (r.axes || []).includes('environment')).length,
        }
      }
    };
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(roanokePack, null, 2));
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `roanoke-pack-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="pt-24 pb-48 px-6 max-w-5xl mx-auto space-y-12">
      <AnimatePresence>
        {!dismissedGuidance.includes('codex-guidance') && (
          <GuidanceChip id="codex-guidance" text="The Codex is your private relic. Every record is stored only on this device." onDismiss={() => onDismissGuidance('codex-guidance')} />
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1 rounded-full border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5">Local Archive</div>
          <h2 className="text-5xl font-serif text-white/90">The Codex</h2>
          <p className="text-lg text-pearl/60 italic max-w-xl leading-relaxed">
            Relational memories transformed into ROANOKE proofs. Your private entries are locally hashed for integrity.
          </p>
        </div>
        <div className="flex gap-4">
           {onOpenRoanoke && (
             <button onClick={onOpenRoanoke} className="p-4 rounded-full bg-gold text-midnight hover:shadow-luminous transition-all" title="Open ROANOKE Ledger" aria-label="Open ROANOKE Ledger">
               <Archive className="w-5 h-5" />
             </button>
           )}
           <div className="flex flex-col items-end gap-1">
             <label htmlFor="import-roanoke-pack" className="sr-only">Import ROANOKE Pack</label>
             <input 
               id="import-roanoke-pack"
               name="import-roanoke-pack"
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileImport} 
               className="hidden" 
               accept=".json"
             />
             <button 
               onClick={() => fileInputRef.current?.click()} 
               className="p-4 rounded-full bg-white/5 border border-white/10 text-pearl/40 hover:text-emerald-400 transition-all" 
               title="Import ROANOKE Pack"
             >
                <Hash className="w-5 h-5" />
             </button>
             <span className="text-[7px] font-black uppercase tracking-widest text-pearl/20 text-right">Import Old Local Backup</span>
           </div>
           <div className="flex flex-col items-end gap-1">
             <button onClick={handleExport} className="p-4 rounded-full bg-white/5 border border-white/10 text-pearl/40 hover:text-gold transition-all" title="Export ROANOKE Pack">
                <Download className="w-5 h-5" />
             </button>
             <span className="text-[7px] font-black uppercase tracking-widest text-pearl/20 text-right">Export ROANOKE Pack</span>
           </div>
           <div className="flex flex-col items-end gap-1">
             <button onClick={() => { if(confirm('Clear all local memories and reset your path? This cannot be undone.')) onClear(); }} className="p-4 rounded-full bg-white/5 border border-white/10 text-pearl/20 hover:text-red-400 transition-all" title="Clear All Memories">
                <Trash2 className="w-5 h-5" />
             </button>
             <span className="text-[7px] font-black uppercase tracking-widest text-pearl/20 text-right">Dissolve All Data</span>
           </div>
        </div>
      </header>

      <AnimatePresence>
        {importStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest text-center"
          >
            Successfully imported {importStatus.count} readable entries.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gold/5 border border-gold/10 w-fit">
           <Sparkles className="w-3 h-3 text-gold" />
           <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Relation Lens / Unfolder</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
           {(Object.entries(UNFOLD_PATHS) as [string, any][]).map(([key, path]) => (
             <button 
               key={key}
               onClick={() => onUnfold(unfoldedPathKey === key ? null : key)}
               className={`px-6 py-3 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-widest ${unfoldedPathKey === key ? 'bg-gold border-gold text-midnight' : 'bg-white/5 border-white/5 text-pearl/40 hover:border-white/20'}`}
             >
               {path.title}
             </button>
           ))}
        </div>

        <AnimatePresence>
          {unfoldedPathKey && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-8 rounded-[40px] bg-gold/5 border border-gold/20 space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-xl font-serif text-gold">Suggested Paths for {UNFOLD_PATHS[unfoldedPathKey as keyof typeof UNFOLD_PATHS].title}</h4>
                    <button onClick={() => onUnfold(null)} className="text-gold/40 hover:text-gold"><X className="w-4 h-4" /></button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {UNFOLD_PATHS[unfoldedPathKey as keyof typeof UNFOLD_PATHS].steps.map((step, idx) => (
                      <button 
                        key={idx}
                        onClick={() => onApplyStep(step)}
                        className="p-6 rounded-3xl bg-midnight/40 border border-gold/10 hover:border-gold/40 text-left space-y-3 group transition-all"
                      >
                         <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-black text-gold">{idx + 1}</div>
                         <p className="text-xs font-bold text-pearl/80 group-hover:text-gold transition-colors">{step.label}</p>
                         <ArrowRight className="w-4 h-4 text-gold/20 group-hover:text-gold group-hover:translate-x-2 transition-all" />
                      </button>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex-1 relative group">
              <label htmlFor="codex-search" className="sr-only">Search local memories</label>
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-pearl/20 group-focus-within:text-gold transition-colors" />
              <input 
                id="codex-search"
                name="codex-search"
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search local memories..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-4 pl-14 pr-6 text-sm text-pearl outline-none focus:border-gold/40 transition-all"
              />
           </div>
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
               {['all', 'field_world_snapshot', 'field_check', 'reflection', 'attunement', 'daily-reflection', 'presence', 'practice', 'labyrinth'].map(f => (
                 <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-gold text-midnight' : 'text-pearl/40 hover:bg-white/5'}`}>{f === 'field_check' ? 'Field Check' : f === 'field_world_snapshot' ? 'Field World' : f.replace('-', ' ')}</button>
               ))}
            </div>
        </div>
        
        <div className="flex justify-center gap-4">
           {(['all', 'self', 'other', 'environment'] as const).map(axis => (
             <button key={axis} onClick={() => setAxisFilter(axis)} className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${axisFilter === axis ? 'bg-white/10 border-white/20 text-pearl' : 'border-transparent text-pearl/20 hover:text-pearl/40'}`}>
                <div className={`w-2 h-2 rounded-full ${axis === 'all' ? 'bg-white/20' : axis === 'self' ? 'bg-gold' : axis === 'other' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{axis}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-16 pt-8">
        {groupedEntries.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <BookOpen className="w-12 h-12 text-pearl/10 mx-auto" />
            <p className="text-sm italic text-pearl/30">No matching memories found.</p>
          </div>
        ) : (
          groupedEntries.map(([date, entries]) => (
            <div key={date} className="space-y-8">
               <div className="flex items-center gap-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold/40 flex-shrink-0">{date}</h3>
                  <div className="h-px w-full bg-gradient-to-r from-gold/10 to-transparent" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {entries.map((entry) => {
                    const proof = generateRoanokeProof(entry);
                    return (
                      <motion.article 
                        layout key={entry.id}
                        className="glass-panel p-1 rounded-[40px] group hover:border-gold/30 hover:bg-white/[0.02] transition-all duration-500 relative"
                      >
                         <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                               <div className="flex flex-wrap gap-2">
                                  <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[8px] font-black uppercase tracking-widest text-gold">{String(entry.type || 'reflection').replace('-', ' ')}</span>
                                  {entry.axes?.map(a => <AxisChip key={a} axis={a} />)}
                               </div>
                               <div className="flex items-center gap-1">
                                 <button onClick={() => handleCopy(String(entry.id), entry.title + '\n' + entry.body)} className="p-2 text-pearl/10 hover:text-gold transition-colors">{copyFeedback === entry.id ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
                                 <button 
                                   onClick={() => { if(confirm('Permanently dissolve this local memory/reflection? This action cannot be undone.')) onClearEntry(entry.id); }}
                                   className="p-2 text-pearl/10 hover:text-red-400 transition-colors"
                                   title="Permanently Dissolve Memory"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                            </div>
                            
                            <div className="space-y-2">
                               <h4 className="text-2xl font-serif text-white/90 leading-tight italic">“{entry.title}”</h4>
                               <p className="text-sm text-pearl/60 leading-relaxed line-clamp-4">{entry.body}</p>
                            </div>

                            {entry.metadata?.breathMetadata && (
                              <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-gold/60">Attunement Metadata</span>
                                  <span className="text-[8px] font-mono text-gold/40">Guided: {entry.metadata.breathMetadata.guided ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[7px] text-pearl/40 uppercase tracking-widest">Path</p>
                                    <p className="text-[9px] text-pearl/80 italic font-serif">{(entry.metadata.breathMetadata.pillarSequence as string[])?.join(' → ') || 'Free'}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                    <p className="text-[7px] text-pearl/40 uppercase tracking-widest">Rounds</p>
                                    <p className="text-[9px] text-pearl/80 font-mono">{entry.metadata.breathMetadata.roundsCompleted}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[7px] text-pearl/40 uppercase tracking-widest">Focus Mode</p>
                                    <p className="text-[9px] text-pearl/80 uppercase tracking-widest font-bold">{entry.metadata.breathMetadata.mode}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                    <p className="text-[7px] text-pearl/40 uppercase tracking-widest">Audio</p>
                                    <p className="text-[9px] text-pearl/80 uppercase tracking-widest font-bold">{entry.metadata.mode || 'Silent'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                             {entry.type === 'field_world_snapshot' && (
                               <div className="p-6 rounded-3xl bg-gold/5 border border-gold/10 space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-3 h-3 text-gold/60" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/60">ROANOKE Field World</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-gold/30">{entry.metadata?.displayLocation?.label}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Tone</p>
                                        <p className="text-xs text-pearl/80 font-serif italic">{entry.metadata?.fieldWorld?.fieldTone}</p>
                                     </div>
                                     <div className="space-y-1 text-right">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Pillars</p>
                                        <p className="text-xs text-gold font-serif italic">{(entry.metadata?.fieldWorld?.suggestedPillars || []).join(', ')}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-2 pt-2 border-t border-gold/10">
                                      <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Environmental Signals</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {(entry.metadata?.fieldWorld?.environmentalSignals || []).concat(entry.metadata?.fieldWorld?.supportiveSignals || []).map((s: string) => (
                                          <span key={s} className="px-2 py-0.5 rounded-full bg-midnight/40 text-[7px] text-gold/50 border border-gold/10 uppercase tracking-widest">{s}</span>
                                        ))}
                                      </div>
                                  </div>
                               </div>
                             )}

                             {(entry.kind === 'field_check' || entry.kind === 'aha_saf_field_check') && (
                               <div className="p-6 rounded-3xl bg-gold/5 border border-gold/10 space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Activity className="w-3 h-3 text-gold/60" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/60">Field Check</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-gold/30">{entry.metadata?.protocol || 'SC-AHA-SAF'}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-6">
                                     <div className="space-y-1">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">{entry.metadata?.implementation === 'lawful_relation_check_v1' ? 'Focus' : 'Signal Class'}</p>
                                        <div className="flex items-center gap-2">
                                          {entry.metadata?.implementation !== 'lawful_relation_check_v1' ? (
                                            <>
                                              <div className={`w-2 h-2 rounded-full shadow-sm ${
                                                entry.metadata?.signalClass === 'A' ? 'bg-emerald-400' : 
                                                entry.metadata?.signalClass === 'C' ? 'bg-gold' : 
                                                entry.metadata?.signalClass === 'D' ? 'bg-amethyst' : 
                                                entry.metadata?.signalClass === 'E' ? 'bg-red-400' : 'bg-pearl'}`} 
                                              />
                                              <p className="text-xs text-pearl/80 font-serif italic">Class {entry.metadata?.signalClass || '?'}</p>
                                            </>
                                          ) : (
                                            <p className="text-xs text-pearl/80 font-serif italic">{(entry.metadata?.selectedFocus || []).join(', ') || 'Self'}</p>
                                          )}
                                        </div>
                                     </div>
                                     <div className="space-y-1 text-right">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Restoration</p>
                                        <p className="text-xs text-gold font-serif italic">{(entry.metadata?.selectedPillars || entry.metadata?.restorationPillars || [])[0] || 'Observe'}</p>
                                     </div>
                                  </div>

                                  {entry.metadata?.implementation === 'lawful_relation_check_v1' ? (
                                    <div className="space-y-2 pt-2 border-t border-gold/10">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Signals Noticed</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {(entry.metadata?.selectedSignals || []).map((s: string) => (
                                            <span key={s} className="px-2 py-0.5 rounded-full bg-midnight/40 text-[7px] text-gold/50 border border-gold/10 uppercase tracking-widest">{s}</span>
                                          ))}
                                        </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2 pt-2 border-t border-gold/10">
                                        <p className="text-[8px] text-pearl/30 uppercase tracking-widest">Recovered Protocol Metadata</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {(entry.metadata?.filtersApplied || []).map((f: string) => (
                                            <span key={f} className="px-2 py-0.5 rounded-full bg-midnight/40 text-[7px] text-gold/50 border border-gold/10 uppercase tracking-widest">{f}</span>
                                          ))}
                                        </div>
                                    </div>
                                  )}
                               </div>
                             )}

                            <div className="space-y-4 pt-6 border-t border-white/5">
                               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-pearl/20">
                                  <Terminal className="w-3 h-3" /> ROANOKE Proof
                               </div>
                               <div className="p-4 rounded-2xl bg-midnight/60 border border-white/5 space-y-3 font-mono">
                                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                     <span className="text-[7px] text-pearl/20">Hash: {String(entry.id).slice(0, 16)}...</span>
                                     <span className="text-[7px] text-emerald-400/40">v1.2</span>
                                  </div>
                                  <div className="text-[8px] text-gold/40 break-all leading-relaxed bg-midnight/30 p-2 rounded-lg border border-white/5">
                                    {proof.hashPreview}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.article>
                    );
                  })}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
