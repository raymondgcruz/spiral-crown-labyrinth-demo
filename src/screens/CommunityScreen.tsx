/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Map as MapIcon, 
  MessageCircle, 
  ChevronRight, 
  ArrowRight,
  Save,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Plus
} from 'lucide-react';
import { MAP_ZONES, CIRCLE_ACTIVITIES } from '../data';
import { ChecklistState, CodexEntry, CircleActivity } from '../types';
import { SacredImage } from '../components/SacredImage';
import { GuidanceChip } from '../components/GuidanceChip';
import { RoanokeFieldGenerator } from '../components/RoanokeFieldGenerator';
import { RoanokeFieldSnapshot } from '../types/fieldWorld';

interface CommunityScreenProps {
  onJoin: (activity: any) => void;
  onSave: (entry: Partial<CodexEntry>) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  activeField: RoanokeFieldSnapshot | null;
  onSetActiveField: (field: RoanokeFieldSnapshot | null) => void;
  onReflect?: (entry: Partial<CodexEntry>) => void;
}

export const CommunityScreen = memo(({ 
  onJoin, 
  onSave, 
  dismissedGuidance, 
  onDismissGuidance,
  activeField,
  onSetActiveField,
  onReflect
}: CommunityScreenProps) => {
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const activeCircle = CIRCLE_ACTIVITIES.find(c => c.id === activeCircleId);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapCenter.x, y: e.clientY - mapCenter.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setMapCenter({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const handleZoom = (delta: number) => setMapZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-12">
      <AnimatePresence>
        {!dismissedGuidance.includes('community-guidance') && (
          <GuidanceChip 
            id="community-guidance" 
            text="The Community Map is a local simulation. Your location remains private. Presence is an intention." 
            onDismiss={() => onDismissGuidance('community-guidance')}
          />
        )}
      </AnimatePresence>
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-block px-4 py-1 rounded-full border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5">Simulated Proximity</div>
          <h2 className="text-5xl font-serif text-white/90">Community Field</h2>
          <p className="text-lg text-pearl/60 italic max-w-xl">A symbolic map of local presence. You are not alone in the return.</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 rounded-3xl bg-midnight/40 border border-white/5 flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-serif text-gold">142 Present</p>
                <p className="text-[8px] font-black tracking-widest text-pearl/20 uppercase">Local Simulation</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold">
                <Users className="w-5 h-5" />
              </div>
           </div>
        </div>
      </header>

      <section className="relative h-[600px] rounded-[56px] border border-white/10 bg-midnight/40 overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl group"
        onMouseDown={handleMouseDown}
        ref={mapRef}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)] opacity-30" />
        
        <div 
          className="absolute inset-x-0 inset-y-0 transition-transform duration-75"
          style={{ transform: `translate(${mapCenter.x}px, ${mapCenter.y}px) scale(${mapZoom})` }}
        >
          {MAP_ZONES.map(zone => (
            <div 
              key={zone.id} 
              className="absolute flex flex-col items-center gap-2 group/zone"
              style={{ left: `${zone.coord.x}%`, top: `${zone.coord.y}%` }}
            >
              <div 
                className={`rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center transition-all group-hover/zone:scale-110 shadow-luminous ${zone.type === 'CLUSTER' ? 'w-24 h-24' : 'w-16 h-16'}`}
              >
                <zone.icon className="w-6 h-6 text-gold/40 group-hover/zone:text-gold transition-colors" />
                {zone.type === 'CLUSTER' && (
                   <div className="absolute -top-2 -right-2 px-2 py-1 bg-gold text-midnight text-[8px] font-black rounded-full">{zone.clusterSize}</div>
                )}
              </div>
              <span className="text-[10px] font-bold text-pearl/20 uppercase tracking-[0.2em] whitespace-nowrap group-hover/zone:text-gold/60 transition-colors">{zone.label}</span>
            </div>
          ))}

          {CIRCLE_ACTIVITIES.map(circle => (
            <button 
              key={circle.id}
              onClick={(e) => { e.stopPropagation(); setActiveCircleId(circle.id); }}
              className="absolute flex flex-col items-center gap-3 group/circle"
              style={{ left: `${circle.coord.x}%`, top: `${circle.coord.y}%` }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center animate-pulse group-hover/circle:animate-none group-hover/circle:scale-125 transition-all">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-400 text-midnight text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/circle:opacity-100 transition-opacity">Listen {circle.participants} Active</div>
            </button>
          ))}
        </div>

        <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
          <button onClick={() => handleZoom(0.2)} className="w-10 h-10 rounded-full bg-midnight/80 border border-white/10 flex items-center justify-center text-pearl/40 hover:text-gold transition-colors"><Plus className="w-4 h-4" /></button>
          <button onClick={() => handleZoom(-0.2)} className="w-10 h-10 rounded-full bg-midnight/80 border border-white/10 flex items-center justify-center text-pearl/40 hover:text-gold transition-colors"><Minimize2 className="w-4 h-4" /></button>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-4 z-20">
          <div className="px-4 py-2 rounded-full bg-midnight/80 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Simulated Field
          </div>
          <div className="px-4 py-2 rounded-full bg-midnight/80 border border-white/10 text-pearl/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3 h-3" />
            No Real Data Shared
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeCircle && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setActiveCircleId(null)}
          >
            <div 
              className="w-full max-w-2xl glass-panel p-8 sm:p-12 rounded-[56px] border-emerald-400/20 shadow-2xl space-y-8 relative"
              onClick={e => e.stopPropagation()}
            >
               <button onClick={() => setActiveCircleId(null)} className="absolute top-8 right-8 p-2 text-pearl/20 hover:text-gold transition-colors"><Minimize2 className="w-6 h-6 rotate-45" /></button>
               
               <header className="space-y-4">
                  <div className="inline-block px-4 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Active Listening Circle</div>
                  <h3 className="text-4xl font-serif text-white/90">{activeCircle.title}</h3>
                  <p className="text-lg text-pearl/60 italic leading-relaxed">“{activeCircle.prompt}”</p>
               </header>

               <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-pearl/30 border-b border-white/5 pb-4">
                    <span>Recent Shares (Local Simulation)</span>
                    <span>{activeCircle.participants} Participants</span>
                  </div>
                  <div className="space-y-6">
                    <p className="text-sm text-pearl/80 font-serif italic leading-relaxed">“I am learning that boundaries are not walls, but meeting places where we can both be safe.”</p>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => { onJoin(activeCircle); setActiveCircleId(null); }}
                    className="w-full py-6 bg-emerald-500 text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 text-xs"
                  >
                    Enter Listening Circle
                  </button>
                  <button 
                    onClick={() => { onSave({ type: 'community-circle', title: activeCircle.title, body: `Attended listening circle: ${activeCircle.title}`, tags: ['community', 'listening'], metadata: { id: activeCircle.id } }); setActiveCircleId(null); }}
                    className="w-full py-6 bg-white/5 border border-white/10 text-pearl/60 font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-all text-xs"
                  >
                    Seal Interest to Codex
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-10 rounded-[48px] border-white/5 space-y-8 flex flex-col justify-between">
          <div className="space-y-4">
            <Users className="w-10 h-10 text-gold" />
            <h3 className="text-3xl font-serif text-white/90">Circle Rituals</h3>
            <p className="text-pearl/60 italic leading-relaxed font-serif">Groups meet in the field to practice collective restoration. Join a circle to witness the shared return.</p>
          </div>
          <button className="flex items-center gap-3 text-gold text-xs font-bold uppercase tracking-widest border-b border-gold/20 pb-1 w-fit group">Explore Rituals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
        </div>
        <div className="glass-panel p-10 rounded-[48px] border-white/5 space-y-8 flex flex-col justify-between">
          <div className="space-y-4">
            <MessageCircle className="w-10 h-10 text-emerald-400" />
            <h3 className="text-3xl font-serif text-white/90">Protocol Notes</h3>
            <p className="text-pearl/60 italic leading-relaxed font-serif">Identity is sovereign. All interactions are filtered through the return protocol to ensure local safety.</p>
          </div>
          <button className="flex items-center gap-3 text-emerald-400 text-xs font-bold uppercase tracking-widest border-b border-emerald-400/20 pb-1 w-fit group">Review Protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
        </div>
      </section>

      <RoanokeFieldGenerator 
        activeField={activeField} 
        onSetActiveField={onSetActiveField} 
        onReflect={onReflect}
        className="pt-12"
      />
    </div>
  );
});
