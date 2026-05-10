/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import {
  X,
  Settings2,
  Plus,
  Minus,
  Map as MapIcon,
  Eye,
  EyeOff,
  Activity,
  Cloud,
  Wind,
  Droplets,
  MapPin,
  Shield,
  Zap,
  BookOpen,
  TreePine,
  Droplet,
  Compass,
  Save,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { MAP_ZONES } from '../data/mapZones';
import { GuidanceChip } from '../components/GuidanceChip';
import { RoanokeFieldSnapshot, FieldWorldZone } from '../types/fieldWorld';
import {
  getZmMapBudget,
  getZmResourceTier,
  prioritizeZones,
  ZM_RESOURCE_NOTE,
  ZmResourceTier,
} from '../roanoke/zmResourceGovernor';

type FieldPanelState = 'hidden' | 'minimized' | 'expanded';

const getZoneIcon = (zone: any) =>
  zone.icon ||
  (zone.type === 'breath'
    ? Wind
    : zone.type === 'grove'
      ? TreePine
      : zone.type === 'water'
        ? Droplet
        : zone.type === 'hearth'
          ? BookOpen
          : zone.type === 'path'
            ? Compass
            : zone.type === 'light'
              ? Zap
              : MapIcon);

const getZonePractice = (zone?: FieldWorldZone | any, fieldWorld?: RoanokeFieldSnapshot['fieldWorld']) => {
  if (!zone) return null;
  const zoneType = String(zone.type || '').toLowerCase();
  const zoneLabel = String(zone.label || '').toLowerCase();
  return (
    fieldWorld?.activities?.find((activity: any) =>
      String(activity.title || '').toLowerCase().includes(zoneType) ||
      String(activity.action || '').toLowerCase().includes(zoneType) ||
      String(activity.title || '').toLowerCase().includes(zoneLabel.split(' ')[0] || '')
    ) || fieldWorld?.activities?.[0] || null
  );
};

const MapMarker = memo(({ zone, zoom, isSelected, isFocusMode, isGenerated, isQuiet, onClick }: {
  zone: any;
  zoom: number;
  isSelected: boolean;
  isFocusMode: boolean;
  isGenerated?: boolean;
  isQuiet?: boolean;
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
}) => {
  const Icon = getZoneIcon(zone);
  const isLevelA = zoom < 1.0;
  const isLevelB = zoom >= 1.0 && zoom < 1.4;
  const isLevelC = zoom >= 1.4 && zoom < 1.9;
  const isLevelD = zoom >= 1.9;
  const coord = zone.coord || { x: 50 + (Math.sin(zone.id.length) * 20), y: 50 + (Math.cos(zone.id.length) * 20) };

  return (
    <motion.div style={{ left: `${coord.x}%`, top: `${coord.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(e); }}
        className="flex flex-col items-center group relative pointer-events-auto"
      >
        {!isQuiet && (
          <div className={`absolute inset-0 rounded-full bg-emerald-400/5 transition-opacity duration-500 scale-[2.2] pointer-events-none ${isFocusMode ? 'opacity-0' : 'opacity-100'}`} style={{ filter: 'blur(12px)' }} />
        )}
        <div className={`rounded-full flex items-center justify-center border transition-all duration-300 ${
          isSelected
            ? 'w-16 h-16 bg-gold/20 border-gold shadow-luminous scale-110'
            : `glass-panel border-white/10 ${isLevelA ? 'w-9 h-9' : isLevelB ? 'w-12 h-12' : 'w-14 h-14'} ${isGenerated ? 'bg-gold/10' : 'bg-white/5'} hover:bg-white/10`
        }`}>
          <Icon className={`transition-all duration-300 ${
            isSelected ? 'w-8 h-8 text-gold' : `${isLevelA ? 'w-4 h-4' : 'w-6 h-6'} ${isGenerated ? 'text-gold/70' : 'text-emerald-400/40'}`
          }`} />
        </div>

        {!isQuiet && !isFocusMode && !isSelected && (isLevelB || isLevelC) && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-col items-center gap-1 pointer-events-none">
            <span className="text-[10px] font-black text-pearl/80 uppercase tracking-widest bg-midnight/80 px-3 py-1 rounded-full border border-white/10 shadow-xl backdrop-blur-md">
              {zone.label}
            </span>
            {isLevelC && <span className="text-[8px] text-pearl/40 font-medium italic">{zone.descriptor}</span>}
          </motion.div>
        )}

        {!isQuiet && !isFocusMode && !isSelected && isLevelD && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 glass-panel p-4 rounded-3xl border-white/10 text-center w-48 shadow-2xl backdrop-blur-xl pointer-events-none">
            <h4 className="text-[12px] font-serif text-gold italic mb-1">{zone.label}</h4>
            <div className="h-px w-6 bg-gold/20 mx-auto mb-2" />
            <p className="text-[8px] text-pearl/60 font-black uppercase tracking-widest leading-tight">{zone.type} · {zone.radius}</p>
            <p className="text-[6px] text-pearl/30 italic mt-2 px-2">{zone.descriptor}</p>
          </motion.div>
        )}

        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center border-2 border-midnight animate-bounce pointer-events-none">
            <div className="w-1.5 h-1.5 bg-midnight rounded-full" />
          </div>
        )}
      </button>
    </motion.div>
  );
});

class MapErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-midnight flex items-center justify-center p-8 text-center">
          <div className="glass-panel p-12 rounded-[48px] border-gold/20 max-w-sm space-y-6">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto"><MapIcon className="w-8 h-8 text-gold" /></div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-gold italic">The symbolic field needs to reset</h3>
              <p className="text-xs text-pearl/40 leading-relaxed">A gesture resonance caused a temporary misalignment in the witness canvas.</p>
            </div>
            <button type="button" onClick={() => window.location.reload()} className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous">Reset Map View</button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const FieldWorldOverlay = memo(({ activeField, visibleZones, hiddenZoneCount, panelState, setPanelState, isMobile, tier, onSelectZone, onBeginPractice, onReflect }: {
  activeField: RoanokeFieldSnapshot;
  visibleZones: FieldWorldZone[];
  hiddenZoneCount: number;
  panelState: FieldPanelState;
  setPanelState: (state: FieldPanelState) => void;
  isMobile: boolean;
  tier: ZmResourceTier;
  onSelectZone: (zoneId: string) => void;
  onBeginPractice: (zone?: FieldWorldZone) => void;
  onReflect: (entry: any) => void;
}) => {
  const fieldWorld = activeField.fieldWorld;
  const budget = getZmMapBudget(tier);

  if (panelState === 'hidden') {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setPanelState('minimized')}
        className="absolute bottom-28 left-4 z-[80] pointer-events-auto px-4 py-3 rounded-full bg-midnight/80 border border-gold/20 text-gold shadow-2xl backdrop-blur-xl flex items-center gap-2"
      >
        <Shield className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-widest">ROANOKE</span>
      </motion.button>
    );
  }

  const compact = panelState === 'minimized';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      drag={isMobile ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 120 }}
      dragElastic={0.04}
      onDragEnd={(_, info) => {
        if (!isMobile) return;
        if (info.offset.y > 60) setPanelState('minimized');
        if (info.offset.y < -50) setPanelState('expanded');
      }}
      className={`absolute ${isMobile ? (compact ? 'bottom-24 right-3 left-3 z-[80]' : 'bottom-24 left-3 right-3 z-[80]') : 'bottom-28 left-0 w-full px-6 z-[70] flex justify-center'} pointer-events-none`}
    >
      <div className={`glass-panel border-gold/20 shadow-2xl pointer-events-auto overflow-hidden backdrop-blur-2xl ${isMobile ? 'rounded-[32px]' : 'rounded-[40px] max-w-4xl w-full'} ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPanelState(compact ? 'expanded' : 'minimized')}
            className="flex items-center gap-3 min-w-0 text-left flex-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[8px] font-black uppercase tracking-[0.24em] text-gold/45">ROANOKE · ZM {tier}</p>
                {isMobile && <GripHorizontal className="w-4 h-4 text-pearl/20" />}
              </div>
              <p className="text-sm sm:text-base font-serif text-gold italic truncate">{activeField.displayLocation.label}</p>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setPanelState(compact ? 'expanded' : 'minimized')} className="p-2 rounded-full bg-white/5 border border-white/10 text-pearl/45 hover:text-gold transition-all" aria-label={compact ? 'Expand field details' : 'Minimize field details'}>
              {compact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button type="button" onClick={() => setPanelState('hidden')} className="p-2 rounded-full bg-white/5 border border-white/10 text-pearl/30 hover:text-gold transition-all" aria-label="Hide field panel">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {compact ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-pearl/45">{fieldWorld.fieldTone}</span>
            <span className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-[8px] font-black uppercase tracking-widest text-gold/70">{visibleZones.length} visible zones</span>
            {hiddenZoneCount > 0 && <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-pearl/35">+{hiddenZoneCount} held by ZM</span>}
          </div>
        ) : (
          <div className="mt-5 space-y-5 max-h-[58vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-3xl bg-gold/5 border border-gold/10">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gold/55 mb-1">Resource Intelligence</p>
              <p className="text-[11px] text-pearl/55 leading-relaxed italic">{ZM_RESOURCE_NOTE} {budget.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-pearl/40"><Cloud className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Local Signals</span></div>
                <div className="flex flex-wrap gap-2">
                  {fieldWorld.environmentalSignals.length === 0 && fieldWorld.supportiveSignals.length === 0 && <span className="text-[9px] text-pearl/35 italic">No active public signals required.</span>}
                  {fieldWorld.environmentalSignals.map((signal: string, i: number) => <span key={`env-${i}`} className="px-2 py-1 bg-white/5 rounded-lg text-[9px] text-pearl/60 italic">{signal}</span>)}
                  {fieldWorld.supportiveSignals.map((signal: string, i: number) => <span key={`sup-${i}`} className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-lg text-[9px] italic">{signal}</span>)}
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-pearl/40"><Zap className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Suggested Pillars</span></div>
                <div className="flex flex-wrap gap-2">
                  {(fieldWorld.suggestedPillars.length ? fieldWorld.suggestedPillars : ['Presence']).map((pillar: string, i: number) => <span key={`pillar-${i}`} className="px-2 py-1 bg-gold/10 text-gold rounded-lg text-[9px] font-bold uppercase tracking-tighter">{pillar}</span>)}
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-pearl/40"><Shield className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">ROANOKE Proof</span></div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-pearl/30 truncate max-w-[120px]">{activeField.proof.hashPreview}</span>
                  <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleZones.map((zone) => {
                const Icon = getZoneIcon(zone);
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => onSelectZone(zone.id)}
                    className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-gold/5 transition-all text-left flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center text-gold shrink-0"><Icon className="w-5 h-5" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-serif text-gold italic">{zone.label}</p>
                      <p className="text-[10px] text-pearl/45 leading-snug line-clamp-2">{zone.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-3xl bg-gold/5 border border-gold/10 space-y-3">
              <div className="flex items-center gap-2 text-gold/60"><Droplets className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Practices available here</span></div>
              {fieldWorld.activities.map((activity: any, i: number) => (
                <div key={activity.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l border-gold/20 pl-4 py-1">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-pearl/80">{activity.title}</span><span className="text-[8px] font-black text-gold/40 uppercase tracking-widest">{activity.pillar}</span></div>
                    <p className="text-[10px] text-pearl/45 italic">{activity.action}</p>
                  </div>
                  <button type="button" onClick={() => onBeginPractice(visibleZones[i] || visibleZones[0])} className="px-3 py-2 rounded-full bg-gold text-midnight text-[8px] font-black uppercase tracking-widest shrink-0">Begin</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onReflect({ type: 'field_world_snapshot', title: activeField.title, body: `Local Field generated for ${activeField.displayLocation.label}.\n\nField Tone: ${fieldWorld.fieldTone}\nProof: ${activeField.proof.hashPreview}`, tags: ['ROANOKE', 'Field World', activeField.displayLocation.zip || 'Local'], metadata: activeField })}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-pearl/50 hover:text-gold hover:border-gold/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-3 h-3" /> Snapshot to Codex
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const MapScreenContent = memo(({ onReflect, dismissedGuidance, onDismissGuidance, onNavigate, activeField }: {
  onReflect: (entry: any) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  onNavigate: (screen: any, tab: any, view?: any) => void;
  activeField: RoanokeFieldSnapshot | null;
}) => {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [isZoneEntered, setIsZoneEntered] = useState(false);
  const [isMapHintVisible, setIsMapHintVisible] = useState(true);
  const [semanticZoom, setSemanticZoom] = useState(1);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [viewport, setViewport] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1024, h: typeof window !== 'undefined' ? window.innerHeight : 768 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [fieldPanelState, setFieldPanelState] = useState<FieldPanelState>('minimized');
  const [activeFieldBannerState, setActiveFieldBannerState] = useState<FieldPanelState>('minimized');

  const fieldWorld = activeField?.fieldWorld;
  const isMobile = viewport.w < 768;
  const deviceMemoryGb = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined;
  const resourceTier = useMemo(() => getZmResourceTier({
    viewportWidth: viewport.w,
    viewportHeight: viewport.h,
    zoneCount: fieldWorld?.mapZones.length || 0,
    deviceMemoryGb,
  }), [viewport.w, viewport.h, fieldWorld?.mapZones.length, deviceMemoryGb]);
  const resourceBudget = useMemo(() => getZmMapBudget(resourceTier), [resourceTier]);
  const visibleMapZones = useMemo(() => fieldWorld ? prioritizeZones(fieldWorld.mapZones, resourceTier) : [], [fieldWorld, resourceTier]);
  const hiddenZoneCount = Math.max((fieldWorld?.mapZones.length || 0) - visibleMapZones.length, 0);
  const activeZone = fieldWorld
    ? (fieldWorld.mapZones.find((z: any) => z.id === activeZoneId) || MAP_ZONES.find(z => z.id === activeZoneId))
    : MAP_ZONES.find(z => z.id === activeZoneId);

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const minZoom = useMemo(() => {
    const padding = isMobile ? 40 : 80;
    const base = isMobile ? 900 : 1200;
    const panelReserve = isMobile ? 220 : 180;
    const availableW = viewport.w - padding;
    const availableH = viewport.h - padding - panelReserve;
    const ratio = Math.min(availableW / base, availableH / base);
    const value = Math.min(Math.max(ratio, isMobile ? 0.42 : 0.45), isMobile ? 0.85 : 0.95);
    return isFinite(value) ? value : 0.75;
  }, [viewport, isMobile]);

  const maxZoom = isMobile ? 2.0 : 2.5;

  const handleReset = useCallback(() => {
    animate(x, 0, { type: 'spring', bounce: 0, duration: 0.6 });
    animate(y, 0, { type: 'spring', bounce: 0, duration: 0.6 });
    animate(scale, minZoom, { type: 'spring', bounce: 0, duration: 0.6 });
    setSemanticZoom(minZoom);
  }, [x, y, scale, minZoom]);

  useEffect(() => scale.on('change', (v) => {
    if (!isFinite(v)) return;
    if (Math.abs(v - semanticZoom) > 0.15) setSemanticZoom(v);
  }), [scale, semanticZoom]);

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scale.set(minZoom);
    setSemanticZoom(minZoom);
  }, [minZoom, scale]);

  useEffect(() => {
    if (!activeField) return;
    setFieldPanelState(isMobile ? 'minimized' : resourceBudget.panelDefault);
    setActiveFieldBannerState('minimized');
    setActiveZoneId(null);
    setIsZoneEntered(false);
  }, [activeField?.id, resourceBudget.panelDefault, isMobile]);

  const gestureState = useRef({
    isPanning: false,
    isPinching: false,
    lastPinchDist: 0,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    moved: false,
    clickSuppressed: false,
  });

  const handleZoomIn = useCallback(() => {
    const next = Math.min(scale.get() + 0.35, maxZoom);
    if (isFinite(next)) animate(scale, next, { type: 'spring', damping: 25 });
  }, [scale, maxZoom]);

  const handleZoomOut = useCallback(() => {
    const next = Math.max(scale.get() - 0.35, minZoom);
    if (isFinite(next)) animate(scale, next, { type: 'spring', damping: 25 });
  }, [scale, minZoom]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      e.preventDefault();
      const nextScale = Math.min(Math.max(scale.get() - e.deltaY * 0.0012, minZoom), maxZoom);
      if (isFinite(nextScale)) scale.set(nextScale);
    };
    const c = containerRef.current;
    if (c) c.addEventListener('wheel', handleWheel, { passive: false });
    return () => c?.removeEventListener('wheel', handleWheel);
  }, [scale, minZoom, maxZoom]);

  useEffect(() => {
    const stopDocPanning = () => {
      gestureState.current.isPanning = false;
      gestureState.current.isPinching = false;
      setIsInteracting(false);
      setSemanticZoom(scale.get());
    };
    window.addEventListener('pointerup', stopDocPanning);
    window.addEventListener('pointercancel', stopDocPanning);
    window.addEventListener('mouseup', stopDocPanning);
    return () => {
      window.removeEventListener('pointerup', stopDocPanning);
      window.removeEventListener('pointercancel', stopDocPanning);
      window.removeEventListener('mouseup', stopDocPanning);
    };
  }, [scale]);

  const handleSelectZone = useCallback((zoneId: string) => {
    setActiveZoneId(zoneId);
    setIsZoneEntered(false);
    if (isMobile) setFieldPanelState('minimized');
  }, [isMobile]);

  const handleBeginPractice = useCallback((zone?: FieldWorldZone | any) => {
    const target = zone || activeZone;
    const practice = getZonePractice(target, fieldWorld);
    onReflect({
      type: 'map_zone_reflection',
      title: `Practice opened: ${target?.label || 'ROANOKE Field'}`,
      body: practice
        ? `From ${target?.label || 'the map'}: ${practice.title}\n\n${practice.action}\n\nGrounding note: ${practice.groundingNote}`
        : `Entered a safe embodied practice from ${target?.label || 'the ROANOKE field'}.`,
      tags: ['Map', 'ROANOKE', 'Practice', target?.label || 'Field'],
      metadata: { zone: target, practice, source: 'map_begin_practice' },
    });
    onNavigate('RESTORE_PRACTICE', 'RESTORE', 'PRACTICE');
  }, [activeZone, fieldWorld, onNavigate, onReflect]);

  return (
    <div className="fixed inset-0 h-screen w-full bg-midnight overflow-hidden pt-16 select-none">
      <AnimatePresence>
        {activeField && !isMobile && activeFieldBannerState !== 'hidden' && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute inset-x-0 top-24 z-[60] px-6 flex justify-center pointer-events-none">
            <div className={`glass-panel border-gold/10 pointer-events-auto backdrop-blur-3xl shadow-2xl flex items-center justify-between gap-4 transition-all ${activeFieldBannerState === 'minimized' ? 'w-fit max-w-[min(92vw,520px)] p-3 rounded-full' : 'w-full max-w-xl p-4 rounded-[32px]'}`}>
              <button
                type="button"
                onClick={() => setActiveFieldBannerState(activeFieldBannerState === 'minimized' ? 'expanded' : 'minimized')}
                className="flex items-center gap-3 min-w-0 text-left"
                aria-expanded={activeFieldBannerState === 'expanded'}
              >
                <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0"><Shield className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Active Field</h4>
                  <p className="text-[12px] font-serif text-gold italic truncate">{activeField.displayLocation.label}</p>
                </div>
              </button>

              {activeFieldBannerState === 'expanded' && (
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeField.feeds.weather?.status === 'active' ? 'bg-emerald-400' : 'bg-red-400/40'}`} />
                  <span className="text-[8px] font-black text-pearl/40 uppercase tracking-widest">Feed Active</span>
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => setActiveFieldBannerState(activeFieldBannerState === 'minimized' ? 'expanded' : 'minimized')} className="p-2 rounded-full bg-white/5 border border-white/10 text-pearl/45 hover:text-gold transition-all" aria-label={activeFieldBannerState === 'minimized' ? 'Expand active field' : 'Minimize active field'}>
                  {activeFieldBannerState === 'minimized' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setActiveFieldBannerState('hidden')} className="p-2 rounded-full bg-white/5 border border-white/10 text-pearl/30 hover:text-gold transition-all" aria-label="Hide active field">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {activeField && !isMobile && activeFieldBannerState === 'hidden' && (
          <motion.button
            type="button"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={() => setActiveFieldBannerState('minimized')}
            className="absolute top-24 left-6 z-[60] pointer-events-auto px-4 py-3 rounded-full bg-midnight/80 border border-gold/20 text-gold shadow-2xl backdrop-blur-xl flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Field</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isMobile && !dismissedGuidance.includes('map-guidance') && (
          <div className="absolute top-48 left-0 w-full flex justify-center z-[100] px-6">
            <GuidanceChip id="map-guidance" text="The map requires approach. Touch the orbit before the point." onDismiss={() => onDismissGuidance('map-guidance')} />
          </div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="absolute inset-0 z-0 pointer-events-auto touch-none"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          gestureState.current.isPanning = true;
          gestureState.current.startX = e.clientX;
          gestureState.current.startY = e.clientY;
          gestureState.current.startPanX = x.get();
          gestureState.current.startPanY = y.get();
          gestureState.current.moved = false;
          gestureState.current.clickSuppressed = false;
          setIsInteracting(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!gestureState.current.isPanning || gestureState.current.isPinching) return;
          const dx = e.clientX - gestureState.current.startX;
          const dy = e.clientY - gestureState.current.startY;
          if (!gestureState.current.moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
            gestureState.current.moved = true;
            gestureState.current.clickSuppressed = true;
          }
          if (gestureState.current.moved) {
            const currentScale = scale.get();
            const base = isMobile ? 900 : 1200;
            const boundX = (base * currentScale) / 2;
            const boundY = (base * currentScale) / 2;
            const nextX = Math.min(Math.max(gestureState.current.startPanX + dx, -boundX), boundX);
            const nextY = Math.min(Math.max(gestureState.current.startPanY + dy, -boundY), boundY);
            if (isFinite(nextX) && isFinite(nextY)) { x.set(nextX); y.set(nextY); }
          }
        }}
        onPointerUp={(e) => {
          gestureState.current.isPanning = false;
          setIsInteracting(false);
          try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            gestureState.current.isPinching = true;
            gestureState.current.isPanning = false;
            gestureState.current.lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            gestureState.current.clickSuppressed = true;
            setIsInteracting(true);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && gestureState.current.isPinching) {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const nextScale = Math.min(Math.max(scale.get() + (dist - gestureState.current.lastPinchDist) * 0.005, minZoom), maxZoom);
            if (isFinite(nextScale)) { scale.set(nextScale); gestureState.current.lastPinchDist = dist; }
          }
        }}
        onTouchEnd={() => { gestureState.current.isPinching = false; }}
        onClick={(e) => { if (!gestureState.current.clickSuppressed && e.target === e.currentTarget) { setActiveZoneId(null); setIsZoneEntered(false); } }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div style={{ x, y, scale }} className={`${isMobile ? 'relative w-[1800px] h-[1800px]' : 'relative w-[3000px] h-[3000px]'} flex items-center justify-center will-change-transform`}>
          {!isMobile && <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f6e0b3 1px, transparent 0)', backgroundSize: '40px 40px' }} />}
          {resourceBudget.showAmbientRings && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {[1, 2, 3, 4, 5, 6].slice(0, isMobile ? 3 : 6).map((i) => (
                <div key={i} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-emerald-400/5 rounded-full transition-opacity duration-700 ${isInteracting ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${i * (isMobile ? 260 : 350)}px`, height: `${i * (isMobile ? 260 : 350)}px`, animation: isMobile ? 'none' : 'pulse 20s infinite', animationDelay: `${i * 3}s` }} />
              ))}
            </div>
          )}
          <div className={`${isMobile ? 'relative w-[900px] h-[900px]' : 'relative w-[1200px] h-[1200px]'} pointer-events-none`}>
            {fieldWorld ? (
              visibleMapZones.map((zone: any) => (
                <MapMarker
                  key={zone.id}
                  zone={zone}
                  zoom={semanticZoom}
                  isSelected={activeZoneId === zone.id}
                  isFocusMode={isFocusMode}
                  isGenerated={true}
                  isQuiet={resourceTier === 'sanctuary' || isMobile}
                  onClick={() => {
                    if (!gestureState.current.clickSuppressed) {
                      if (activeZoneId === zone.id) setIsZoneEntered(true);
                      else handleSelectZone(zone.id);
                    }
                  }}
                />
              ))
            ) : !isFocusMode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10%]">
                <Shield className="w-16 h-16 text-gold/10 mb-6 animate-pulse" />
                <div className="text-center space-y-2 px-8">
                  <p className="text-xl font-serif text-gold/40 italic">Waiting for Field Calibration</p>
                  <p className="text-[10px] text-pearl/20 uppercase tracking-[0.3em] font-black">Generate a ROANOKE Local Field to begin</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className={`${isMobile ? 'absolute bottom-28 right-4' : 'absolute bottom-28 right-6'} flex flex-col-reverse items-end gap-3 pointer-events-none`}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIsHudExpanded(!isHudExpanded); }} className={`w-14 h-14 glass-panel rounded-full flex items-center justify-center border-gold/40 text-gold shadow-luminous pointer-events-auto active:scale-90 transition-all ${isFocusMode ? 'opacity-20' : 'opacity-100'}`}>
            {isHudExpanded ? <X className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
          </button>
          <AnimatePresence>
            {isHudExpanded && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="flex flex-col gap-3 pointer-events-auto">
                <button type="button" onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center border-gold/20 text-gold hover:bg-gold/10 active:scale-95 transition-all outline-none"><Plus className="w-6 h-6" /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center border-gold/20 text-gold hover:bg-gold/10 active:scale-95 transition-all outline-none"><Minus className="w-6 h-6" /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); handleReset(); }} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center border-gold/20 text-gold hover:bg-gold/10 active:scale-95 transition-all outline-none"><MapIcon className="w-5 h-5" /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsFocusMode(!isFocusMode); }} className={`w-12 h-12 glass-panel rounded-full flex items-center justify-center border-gold/20 transition-all outline-none ${isFocusMode ? 'bg-gold text-midnight shadow-luminous' : 'text-gold/60 hover:bg-gold/10'}`}>{isFocusMode ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isMobile && !isFocusMode && isDetailsVisible && (
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 pointer-events-none">
              <div className="glass-panel p-4 rounded-2xl border-white/5 text-center relative group pointer-events-auto backdrop-blur-3xl shadow-2xl">
                <p className="text-[10px] text-pearl/40 uppercase font-black tracking-[0.3em] mb-1">{!activeZoneId ? 'The Work of Place' : 'Field Acknowledged'}</p>
                <p className="text-xs italic text-pearl/60 leading-relaxed">{!activeZoneId ? 'An abstract witness of shared presence via symbolic zones.' : `Approach complete. Tap the ${activeZone?.label} point to enter.`}</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsDetailsVisible(false); }} className="absolute top-2 right-2 p-1 text-pearl/20 hover:text-pearl/60 transition-colors"><X className="w-3 h-3" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isMobile && isMapHintVisible && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={`absolute top-24 left-6 z-50 pointer-events-none transition-all duration-500 ${isFocusMode ? 'scale-75 origin-top-left' : ''}`}>
              <div className="glass-panel p-4 pr-10 rounded-2xl border-white/10 shadow-2xl pointer-events-auto relative max-w-[200px] backdrop-blur-3xl">
                <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold" /><span className="text-[8px] font-black uppercase tracking-widest text-gold">Map Guidance</span></div>
                <p className="text-[10px] text-pearl/60 leading-tight">{isFocusMode ? 'Orbit → Point' : 'Tap the orbit boundary to approach, then tap the point to enter.'}</p>
                <p className="text-[8px] text-pearl/30 italic mt-2">The orbit is the consent boundary.</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsMapHintVisible(false); }} className="absolute top-2 right-2 p-1 text-pearl/20 hover:text-pearl/60"><X className="w-3 h-3" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 z-50 pointer-events-none">
        <AnimatePresence>
          {activeZone && isZoneEntered && (
            <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }} className={`${isMobile ? 'absolute bottom-24 left-0 w-full px-4' : 'absolute bottom-32 left-0 w-full px-6'} flex justify-center z-50`}>
              <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-[40px] sm:rounded-[48px] border-gold/40 shadow-2xl space-y-5 pointer-events-auto relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-20 pointer-events-none" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {(() => { const ZoneIcon = getZoneIcon(activeZone); return <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0"><ZoneIcon className="w-6 h-6" /></div>; })()}
                      <h3 className="text-2xl sm:text-3xl font-serif text-gold italic truncate">{activeZone.label}</h3>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsZoneEntered(false); }} className="p-3 rounded-full bg-white/5 border border-white/10 text-pearl/40 hover:text-gold hover:border-gold transition-all"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-5 sm:p-6 rounded-3xl bg-gold/5 border border-gold/10 text-center">
                    <p className="text-xs text-pearl/60 italic leading-relaxed">{(activeZone as any).description || '“Resonance is high in this local coordinate simulation.”'}</p>
                    {activeZone.type && <p className="text-[10px] text-pearl/20 font-black uppercase tracking-widest mt-2">Zone Type: {activeZone.type}</p>}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleBeginPractice(activeZone as FieldWorldZone); }} className="w-full py-4 bg-gold text-midnight font-bold uppercase tracking-widest rounded-3xl shadow-luminous transition-all active:scale-95">Begin Practice Here</button>
                    <button type="button" onClick={(e) => {
                      e.stopPropagation();
                      onReflect({
                        type: 'map_zone_reflection',
                        title: `Map Reflection: ${activeZone.label}`,
                        body: (activeZone as any).description || `Witnessed shared resonance in the ${activeZone.label} zone...`,
                        tags: ['Map', activeZone.label, fieldWorld ? 'ROANOKE' : 'Default'],
                      });
                    }} className="w-full py-3 bg-white/5 border border-white/10 text-pearl/55 font-bold uppercase tracking-widest rounded-3xl transition-all active:scale-95">Reflect on Zone</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeField && fieldWorld && !isZoneEntered && !isFocusMode && (
            <FieldWorldOverlay
              activeField={activeField}
              visibleZones={visibleMapZones}
              hiddenZoneCount={hiddenZoneCount}
              panelState={fieldPanelState}
              setPanelState={setFieldPanelState}
              isMobile={isMobile}
              tier={resourceTier}
              onSelectZone={handleSelectZone}
              onBeginPractice={handleBeginPractice}
              onReflect={onReflect}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isFocusMode && !activeZoneId && !fieldWorld && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-midnight/80 border border-white/10 p-3 pl-5 rounded-full backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col items-start leading-tight"><span className="text-[10px] font-black uppercase tracking-widest text-pearl/40">Active Presence</span><span className="text-xs font-serif text-gold whitespace-nowrap">Generate a local field</span></div>
              <div className="flex -space-x-2 ml-4">{[1, 2, 3].map((i) => (<div key={i} className="w-8 h-8 rounded-full border-2 border-midnight bg-gold/20 flex items-center justify-center overflow-hidden"><div className="w-full h-full bg-gradient-to-br from-gold/40 to-transparent" /></div>))}</div>
            </motion.div>
          )}
          {!isFocusMode && activeZoneId && !isZoneEntered && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
              <div className="px-6 py-3 bg-gold text-midnight rounded-full shadow-luminous flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-midnight animate-ping" /><span className="text-xs font-black uppercase tracking-widest">Tap point to enter</span></div>
              <span className="text-[8px] text-gold/60 uppercase font-bold tracking-[0.2em]">{activeZone?.label} Field Acknowledged</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export const MapScreen = (props: any) => (
  <MapErrorBoundary>
    <MapScreenContent {...props} />
  </MapErrorBoundary>
);
