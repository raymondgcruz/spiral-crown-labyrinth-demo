/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  Suspense, 
  lazy, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  LogOut, 
  Settings, 
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Archive
} from 'lucide-react';

// Core State & Types
import { 
  Screen, 
  Tab, 
  PresenceCarrier, 
  CodexEntry, 
  CodexEntryType, 
  PracticeCategory, 
  PracticeItem, 
  ScenarioItem, 
  ScenarioChoice,
  BroadcastState,
  CircleActivity,
  ChecklistState
} from './types';

// Constants & Data
import { 
  VERSION, 
  APP_PHASE,
  DAILY_PROMPTS, 
  HARMONIC_CHAMBERS, 
  ONBOARDING_STEPS, 
  UNFOLD_PATHS 
} from './data';

import { RoanokeFieldSnapshot } from './types/fieldWorld';

// Utils
import { 
  safeJSONParse, 
  getKindForEntryType, 
  getAxesForEntryType, 
  generateRoanokeProof 
} from './utils';

import { prebootRepair, handleUrlRestore, normalizeCodex } from './utils/normalizer';
import { getChoirSupportReceipt } from './spiralCrown/choirSupportRegistry';

// Run storage repair after first paint; do not block the landing page boot.
const schedulePrebootRepair = () => {
  if (typeof window === 'undefined') return;
  const run = () => prebootRepair();
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run, { timeout: 1500 });
  } else {
    globalThis.setTimeout(run, 500);
  }
};

// Components (Eagerly Loaded)
import { BottomNav } from './components/BottomNav';
import { TestChecklistOverlay } from './components/TestChecklistOverlay';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { ChoirSupportPanel } from './components/ChoirSupportPanel';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LabyrinthScreen } from './screens/LabyrinthScreen';

// Screens (Lazy Loaded for code splitting)
const RestoreSelfScreen = lazy(() => import('./screens/RestoreSelfScreen').then(m => ({ default: m.RestoreSelfScreen })));
const RestorePlaceScreen = lazy(() => import('./screens/RestorePlaceScreen').then(m => ({ default: m.RestorePlaceScreen })));
const RestorePracticeScreen = lazy(() => import('./screens/RestorePracticeScreen').then(m => ({ default: m.RestorePracticeScreen })));
const RestorePresenceScreen = lazy(() => import('./screens/RestorePresenceScreen').then(m => ({ default: m.RestorePresenceScreen })));
const BroadcastScreen = lazy(() => import('./screens/BroadcastScreen').then(m => ({ default: m.BroadcastScreen })));
const CommunityScreen = lazy(() => import('./screens/CommunityScreen').then(m => ({ default: m.CommunityScreen })));
const MapScreen = lazy(() => import('./screens/MapScreen').then(m => ({ default: m.MapScreen })));
const CodexScreen = lazy(() => import('./screens/CodexScreen').then(m => ({ default: m.CodexScreen })));
const AboutScreen = lazy(() => import('./screens/AboutScreen').then(m => ({ default: m.AboutScreen })));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const PrivacyScreen = lazy(() => import('./screens/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })));
const IntegrationScreen = lazy(() => import('./screens/IntegrationScreen').then(m => ({ default: m.IntegrationScreen })));
const RoanokeScreen = lazy(() => import('./screens/RoanokeScreen').then(m => ({ default: m.RoanokeScreen })));
const AttunementChamber = lazy(() => import('./screens/AttunementChamber').then(m => ({ default: m.AttunementChamber })));

export default function App() {
  // Navigation State
  const [screen, setScreen] = useState<Screen>(() => {
    const onboarding = localStorage.getItem('spiral-crown-onboarding-complete');
    return onboarding === 'true' ? 'WELCOME' : 'WELCOME'; // Default to welcome, show onboarding overlay if needed
  });
  const [activeTab, setActiveTab] = useState<Tab>('RESTORE');
  const [restoreView, setRestoreView] = useState<'SELF' | 'PLACE' | 'PRACTICE' | 'PRESENCE'>('SELF');
  const [fieldView, setFieldView] = useState<'BROADCAST' | 'COMMUNITY'>('BROADCAST');
  
  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [chamberActive, setChamberActive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('spiral-crown-onboarding-complete') !== 'true');
  const [onboardingComplete, setOnboardingComplete] = useState(() => localStorage.getItem('spiral-crown-onboarding-complete') === 'true');
  const [isThreeMinuteFlow, setIsThreeMinuteFlow] = useState(false);
  const [dismissedGuidance, setDismissedGuidance] = useState<string[]>(() => safeJSONParse('spiral-crown-dismissed-guidance', []));
  const [isRestoring, setIsRestoring] = useState(() => handleUrlRestore());

  // Data States
  const [localReflections, setLocalReflections] = useState<CodexEntry[]>(() => {
    const raw = safeJSONParse('spiral-crown-reflections', []);
    return Array.isArray(raw) ? raw : [];
  });
  const [completedChambers, setCompletedChambers] = useState<string[]>(() => safeJSONParse('spiral-crown-completed-chambers', []));
  const [presenceCarrier, setPresenceCarrier] = useState<PresenceCarrier | null>(() => safeJSONParse('spiral-crown-presence-carrier', null));
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [practiceProgress, setPracticeProgress] = useState(() => safeJSONParse('spiral-crown-practice-progress', {
    completedIds: [],
    scenarioResults: {},
    phraseUses: 0,
    lastCategory: 'CONSENT'
  }));

  // ROANOKE Field World State
  const [activeField, setActiveField] = useState<RoanokeFieldSnapshot | null>(() => safeJSONParse('spiral-crown.roanoke.activeFieldWorld.v1', null));

  // Logic States
  const [activeCategory, setActiveCategory] = useState<PracticeCategory>('CONSENT');
  const [dailyPrompt, setDailyPrompt] = useState(() => DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CodexEntryType | 'all'>('all');
  const [unfoldedPathKey, setUnfoldedPathKey] = useState<keyof typeof UNFOLD_PATHS | null>(null);

  // Ritual Checklist
  const [checklist, setChecklist] = useState<ChecklistState>(() => safeJSONParse('spiral-crown-checklist', {
    welcome: false,
    self: false,
    reflection: false,
    codex: false,
    environment: false,
    labyrinth: false,
    broadcast: false,
    circle: false,
    map: false,
    integration: false,
    reset: false,
    consent_practice: false,
    listening_practice: false,
    repair_practice: false,
    boundary_practice: false,
    scenario_complete: false,
    phrase_builder: false,
    seal_practice: false,
    onboarding_complete: false,
    daily_return: false,
    three_minute_return: false,
    dismiss_guidance: false,
    seal_daily_reflection: false,
    consent_breath_guidance: false,
    consent_aha_saf: false
  }));

  useEffect(() => {
    schedulePrebootRepair();
  }, []);

  // Handle AHA Reset Parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('aha-reset') === '1') {
      setChecklist(prev => ({ ...prev, consent_aha_saf: false }));
      // Optional: clean up the URL to prevent repeated resets on refresh, 
      // but keeping it for now as requested.
    }
  }, []);

  // Syncs
  useEffect(() => localStorage.setItem('spiral-crown-checklist', JSON.stringify(checklist)), [checklist]);
  useEffect(() => localStorage.setItem('spiral-crown-reflections', JSON.stringify(localReflections)), [localReflections]);
  useEffect(() => localStorage.setItem('spiral-crown-onboarding-complete', onboardingComplete ? 'true' : 'false'), [onboardingComplete]);
  useEffect(() => localStorage.setItem('spiral-crown-dismissed-guidance', JSON.stringify(dismissedGuidance)), [dismissedGuidance]);
  useEffect(() => localStorage.setItem('spiral-crown-completed-chambers', JSON.stringify(completedChambers)), [completedChambers]);
  useEffect(() => localStorage.setItem('spiral-crown-practice-progress', JSON.stringify(practiceProgress)), [practiceProgress]);
  useEffect(() => {
    if (activeField) localStorage.setItem('spiral-crown.roanoke.activeFieldWorld.v1', JSON.stringify(activeField));
    else localStorage.removeItem('spiral-crown.roanoke.activeFieldWorld.v1');
  }, [activeField]);

  useEffect(() => {
    if (presenceCarrier) localStorage.setItem('spiral-crown-presence-carrier', JSON.stringify(presenceCarrier));
    else localStorage.removeItem('spiral-crown-presence-carrier');
  }, [presenceCarrier]);

  useEffect(() => {
    const normalizeAfterPaint = () => {
      setLocalReflections(prev => normalizeCodex(prev));
    };
    const id = window.setTimeout(normalizeAfterPaint, 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const warmScreens = () => {
      import('./screens/RestoreSelfScreen');
      import('./screens/RestorePlaceScreen');
      import('./screens/CodexScreen');
      import('./screens/MapScreen');
    };
    const id = window.setTimeout(warmScreens, 650);
    return () => window.clearTimeout(id);
  }, []);

  // Handlers
  const updateChecklist = useCallback((key: keyof ChecklistState | 'reset') => {
    if (key === 'reset') {
      setChecklist({
        welcome: true,
        self: false,
        reflection: false,
        codex: false,
        environment: false,
        labyrinth: false,
        broadcast: false,
        circle: false,
        map: false,
        integration: false,
        reset: false,
        consent_practice: false,
        listening_practice: false,
        repair_practice: false,
        boundary_practice: false,
        scenario_complete: false,
        phrase_builder: false,
        seal_practice: false,
        onboarding_complete: false,
        daily_return: false,
        three_minute_return: false,
        dismiss_guidance: false,
        seal_daily_reflection: false
      });
      return;
    }
    setChecklist(prev => prev[key] ? prev : { ...prev, [key]: true });
  }, []);

  const addCodexEntry = useCallback((entry: Partial<CodexEntry>) => {
    const type = (entry.type as CodexEntryType) || 'reflection';
    const draft: Partial<CodexEntry> = {
      ...entry,
      schema: 'roanoke.object.v1',
      appVersion: VERSION,
      phase: APP_PHASE,
      id: Date.now(),
      type,
      kind: entry.kind || getKindForEntryType(type),
      axes: (entry.axes || getAxesForEntryType(type)) as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: entry.tags || [],
      relations: entry.relations || [],
      consent: entry.consent || { localOnly: true, userInitiated: true, exportable: true, sharing: 'user-choice-only' },
      provenance: entry.provenance || { sourceScreen: screen, sourceAction: 'manual-entry', appVersion: VERSION, createdLocally: true },
      metadata: {
        choirSupport: getChoirSupportReceipt(screen),
        ...(entry.metadata || {}),
      }
    };
    draft.proof = generateRoanokeProof(draft);
    setLocalReflections(prev => [draft as CodexEntry, ...prev]);
  }, [screen]);

  const handleAddReflection = useCallback((note: string, meta: any = {}) => {
    addCodexEntry({ 
      type: 'reflection', 
      title: 'Internal Reflection', 
      body: note, 
      tags: ['reflection', 'internal', ...(meta.lawfulRelation?.suggestedPillars || [])], 
      metadata: { 
        source: 'restore-self',
        ...meta
      } 
    });
    updateChecklist('reflection');
  }, [addCodexEntry, updateChecklist]);

  const handleAttunementReflection = useCallback((reflection: string, meta: any = {}) => {
    addCodexEntry({
      type: 'attunement' as any,
      title: 'Attunement Reflection',
      body: reflection,
      tags: ['attunement', 'presence', 'harmonics', ...(meta.pillars || []), ...(meta.lawfulRelation?.suggestedPillars || [])],
      metadata: {
        ...meta,
        source: 'attunement_chamber',
        finalVolume: meta.finalVolume,
        mode: meta.mode || 'audible'
      }
    });
    updateChecklist('reflection');
    setPresenceCarrier(null); // Clear the active attunement state after save
    setChamberActive(false); // Close the chamber
    setScreen('CODEX');
    setActiveTab('CODEX');
  }, [addCodexEntry, updateChecklist]);

  const handleSealDailyReflection = useCallback((reflection: string, meta: any = {}) => {
    addCodexEntry({ 
      type: 'daily-reflection', 
      title: 'Daily Reflection Sealed', 
      body: `Prompt: ${dailyPrompt}\n\nReflection: ${reflection}`, 
      tags: ['daily-reflection', 'return-cycle', ...(meta.lawfulRelation?.suggestedPillars || [])], 
      metadata: { 
        promptUsed: dailyPrompt,
        ...meta
      } 
    });
    updateChecklist('seal_daily_reflection');
    setScreen('CODEX');
    setActiveTab('CODEX');
  }, [addCodexEntry, updateChecklist, dailyPrompt]);

  const handleNextDailyPrompt = useCallback(() => {
    setDailyPrompt(prev => {
      const remaining = DAILY_PROMPTS.filter(p => p !== prev);
      return remaining[Math.floor(Math.random() * remaining.length)];
    });
  }, []);

  const handleDailyReturn = useCallback((path: string) => {
    setSessionActive(true);
    updateChecklist('daily_return');
    const options = [
      { id: 'body', screen: 'RESTORE_SELF', tab: 'RESTORE', view: 'SELF' },
      { id: 'place', screen: 'RESTORE_PLACE', tab: 'RESTORE', view: 'PLACE' },
      { id: 'intentionality', screen: 'RESTORE_PRESENCE', tab: 'RESTORE', view: 'PRESENCE' },
      { id: 'relational', screen: 'RESTORE_PRACTICE', tab: 'RESTORE', view: 'PRACTICE' },
      { id: 'path', screen: 'LABYRINTH', tab: 'LABYRINTH' },
      { id: 'community', screen: 'COMMUNITY', tab: 'FIELD', view: 'COMMUNITY' },
      { id: 'memory', screen: 'CODEX', tab: 'CODEX' },
    ] as const;
    const opt = options.find(o => o.id === path);
    if (opt) {
      if (opt.tab) setActiveTab(opt.tab);
      if (opt.screen) setScreen(opt.screen);
      if ('view' in opt && opt.view) {
        if (opt.tab === 'RESTORE') setRestoreView(opt.view as any);
        if (opt.tab === 'FIELD') setFieldView(opt.view as any);
      }
    }
    addCodexEntry({ type: 'daily-return', title: 'Daily Return Path Opened', body: `Initiated return cycle via path: ${path}`, tags: ['return-cycle', path.toLowerCase()], metadata: { selectedPath: path } });
  }, [addCodexEntry, updateChecklist]);

  const handleQuickStart = useCallback(() => {
    setIsThreeMinuteFlow(true);
    setRestoreView('SELF');
    setScreen('RESTORE_SELF');
    setActiveTab('RESTORE');
  }, []);

  const handleCancelThreeMinuteFlow = useCallback(() => setIsThreeMinuteFlow(false), []);

  const dismissGuidance = useCallback((id: string) => {
    setDismissedGuidance(prev => prev.includes(id) ? prev : [...prev, id]);
    updateChecklist('dismiss_guidance');
  }, [updateChecklist]);

  const handleImportBackups = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      let entries: any[] = [];
      
      if (Array.isArray(parsed)) {
        entries = parsed;
      } else if (parsed && parsed.entries && Array.isArray(parsed.entries)) {
        entries = parsed.entries;
      } else if (parsed && typeof parsed === 'object') {
        entries = [parsed];
      }

      if (entries.length === 0) {
        return { success: false, error: 'No valid entries found in file.' };
      }

      const normalized = normalizeCodex(entries);
      
      setLocalReflections(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newEntries = normalized.filter(e => !existingIds.has(e.id));
        return [...newEntries, ...prev];
      });

      return { success: true, count: normalized.length };
    } catch (e) {
      console.error('Import failed:', e);
      return { success: false, error: 'Invalid file format. Please provide a valid ROANOKE JSON export.' };
    }
  }, []);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setScreen('RESTORE_SELF');
    updateChecklist('welcome');
  }, [updateChecklist]);

  const handleStartAhaSafAttunement = useCallback((pillars: string[]) => {
    if (pillars.length === 0) return;
    
    const carrier: PresenceCarrier = {
      schema: 'spiral-crown.presence-carrier.v1',
      version: VERSION,
      intentionText: 'Restoration through ' + pillars.join(' & '),
      selectedPillars: pillars,
      consentScope: 'local-only',
      displayMode: 'focus',
      sessionDuration: 3,
      createdAt: Date.now(),
      hashPreview: 'AHA-RESTORE-' + Math.random().toString(36).substring(7).toUpperCase(),
      roaLine: 'Field normalized via AHA-SAF protocol.',
      notes: 'Initial restoration session following dynamic field check.',
      breathSettings: {
        mode: 'weave',
        guided: true,
        safetyAcknowledged: checklist.consent_breath_guidance
      }
    };
    
    setPresenceCarrier(carrier);
    setChamberActive(true);
  }, [VERSION, checklist.consent_breath_guidance]);

  const sealChamber = useCallback((chamberId: string, reflection: string, sealed: boolean, meta: any = {}) => {
    const chamber = HARMONIC_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return;
    if (sealed) {
      addCodexEntry({ 
        type: 'labyrinth', 
        title: `Chamber: ${chamber.pillar}`, 
        body: `Reflection: ${reflection}\n\nEmbodied Action: ${chamber.action}`, 
        pillar: chamber.pillar, 
        tags: ['labyrinth', chamber.pillar.toLowerCase(), ...(meta.lawfulRelation?.suggestedPillars || [])], 
        metadata: { chamberId, ...meta } 
      });
      updateChecklist('reflection');
    }
    if (!completedChambers.includes(chamberId)) setCompletedChambers(prev => [...prev, chamberId]);
    setScreen('CODEX');
    setActiveTab('CODEX');
  }, [completedChambers, updateChecklist, addCodexEntry]);

  const completePractice = useCallback((item: PracticeItem, reflection: string, sealed: boolean, meta: any = {}) => {
    setPracticeProgress(prev => ({ ...prev, completedIds: [...new Set([...prev.completedIds, item.id])] }));
    const checklistKey = (item.category.toLowerCase() + '_practice') as keyof ChecklistState;
    updateChecklist(checklistKey);
    if (sealed) {
      addCodexEntry({ 
        type: 'practice', 
        title: `Practice: ${item.title}`, 
        body: `Reflection: ${reflection}\n\nTeaching: ${item.teaching}\n\nEmbodied Action: ${item.embodiedAction}`, 
        tags: ['practice', item.category.toLowerCase(), item.pillar.toLowerCase(), ...(meta.lawfulRelation?.suggestedPillars || [])], 
        metadata: { practiceId: item.id, practiceCategory: item.category, pillar: item.pillar, ...meta } 
      });
      updateChecklist('seal_practice');
    }
  }, [addCodexEntry, updateChecklist]);

  const completeScenario = useCallback((scenario: ScenarioItem, choice: ScenarioChoice) => {
    setPracticeProgress(prev => ({ ...prev, scenarioResults: { ...prev.scenarioResults, [scenario.id]: choice.id } }));
    updateChecklist('scenario_complete');
    addCodexEntry({ type: 'practice', title: `Scenario: ${scenario.title}`, body: `Context: ${scenario.context}\n\nChosen Response: ${choice.text}\n\nAlignment Note: ${choice.feedback}`, tags: ['practice', 'scenario', scenario.pillar.toLowerCase()], metadata: { scenarioId: scenario.id, choiceId: choice.id, choiceType: choice.type, pillar: scenario.pillar } });
    updateChecklist('seal_practice');
  }, [addCodexEntry, updateChecklist]);

  const usePhraseBuilder = useCallback((intention: string, tone: string, phrase: string) => {
    setPracticeProgress(prev => ({ ...prev, phraseUses: prev.phraseUses + 1 }));
    updateChecklist('phrase_builder');
    addCodexEntry({ type: 'practice', title: `Generated Phrase: ${intention}`, body: `Intention: ${intention}\nTone: ${tone}\n\nGenerated Phrase: ${phrase}`, tags: ['practice', 'phrase-builder'], metadata: { intention, tone } });
    updateChecklist('seal_practice');
  }, [addCodexEntry, updateChecklist]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
    setShowOnboarding(false);
    updateChecklist('onboarding_complete');
  }, [updateChecklist]);

  const handleStartBroadcast = useCallback((state: BroadcastState) => {
    setIsBroadcasting(true);
    addCodexEntry({ type: 'broadcast', title: 'Field Broadcast Started', body: `Energetic broadcast initiated.\nState: ${state.label}\nVisibility: ${state.visibility}\nDuration: ~${state.suggestedDuration}m`, tags: ['broadcast', 'field', 'simulation'] });
    updateChecklist('broadcast');
  }, [addCodexEntry, updateChecklist]);

  const handleStopBroadcast = useCallback(() => {
    setIsBroadcasting(false);
    addCodexEntry({ type: 'broadcast', title: 'Field Broadcast Concluded', body: 'Manual cessation of energetic broadcast. Presence faded from local field.', tags: ['broadcast', 'concluded'] });
  }, [addCodexEntry]);

  const handleJoinCircleIntention = useCallback((activity: CircleActivity) => {
    addCodexEntry({ type: 'circle', title: 'Circle Intention Joined', body: `Joined collective intention: ${activity.title}\nActivity: ${activity.purpose}\nPlace: ${activity.place}`, tags: ['circle', 'community', 'intention'] });
    updateChecklist('circle');
  }, [addCodexEntry, updateChecklist]);

  const handleSaveCircleActivity = useCallback((activity: CircleActivity) => {
    addCodexEntry({ type: 'circle', title: 'Activity Logistics Saved', body: `Saved logistical details for: ${activity.title}\nTime: ${activity.timeWindow}\nTo Bring: ${activity.toBring}\nImpact: ${activity.impact}`, tags: ['circle', 'logistics'] });
  }, [addCodexEntry]);

  const finishSession = useCallback(() => { 
    addCodexEntry({ type: 'integration', title: 'Session Sealed', body: 'Completed harmonic restoration session. All shifts integrated into the local field.', tags: ['integration', 'sealed'] });
    setScreen('CODEX'); setActiveTab('CODEX'); updateChecklist('integration');
  }, [addCodexEntry, updateChecklist]);

  const handleTabSelect = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'RESTORE') {
      if (restoreView === 'SELF') { setScreen('RESTORE_SELF'); updateChecklist('self'); }
      else if (restoreView === 'PLACE') setScreen('RESTORE_PLACE');
      else if (restoreView === 'PRESENCE') setScreen('RESTORE_PRESENCE');
      else setScreen('RESTORE_PRACTICE');
    }
    if (tab === 'LABYRINTH') setScreen('LABYRINTH');
    if (tab === 'FIELD') setScreen(fieldView === 'BROADCAST' ? 'BROADCAST' : 'COMMUNITY');
    if (tab === 'MAP') { setScreen('MAP'); updateChecklist('map'); }
    if (tab === 'CODEX') { setScreen('CODEX'); updateChecklist('codex'); }
  }, [restoreView, fieldView, updateChecklist]);

  const handleApplyUnfoldStep = useCallback((step: any) => {
    // 1. Update sub-views first
    if (step.view) {
      if (step.tab === 'RESTORE') setRestoreView(step.view);
      if (step.tab === 'FIELD') setFieldView(step.view);
    }
    if (step.category) setActiveCategory(step.category);
    
    // 2. Set screen explicitly if provided (overrides tab-based defaults)
    if (step.screen) {
      setScreen(step.screen);
      if (step.tab) setActiveTab(step.tab);
    } 
    // 3. Otherwise fall back to tab selection which uses newly set views
    else if (step.tab) {
      // Small delay or use local variables if needed, but here we can just 
      // rely on the tab-based logic. Actually, handleTabSelect uses views 
      // in its dependency/body.
      // To be safe, we'll manually set the screen here based on the step.view
      setActiveTab(step.tab);
      if (step.tab === 'RESTORE') {
        const view = step.view || restoreView;
        if (view === 'SELF') setScreen('RESTORE_SELF');
        else if (view === 'PLACE') setScreen('RESTORE_PLACE');
        else if (view === 'PRESENCE') setScreen('RESTORE_PRESENCE');
        else setScreen('RESTORE_PRACTICE');
      }
      else if (step.tab === 'LABYRINTH') setScreen('LABYRINTH');
      else if (step.tab === 'FIELD') setScreen(step.view === 'BROADCAST' ? 'BROADCAST' : 'COMMUNITY');
      else if (step.tab === 'MAP') setScreen('MAP');
      else if (step.tab === 'CODEX') setScreen('CODEX');
    }
  }, [restoreView, handleTabSelect]);

  const clearCodexEntry = useCallback((id: number | string) => {
    setLocalReflections(prev => prev.filter(e => e.id !== id));
  }, []);

  const resetAll = useCallback(() => {
    setScreen('WELCOME'); setShowTestMode(false); setSessionActive(false); setLocalReflections([]); setCompletedChambers([]); setIsBroadcasting(false); setPresenceCarrier(null); setChamberActive(false); setOnboardingComplete(false); setShowOnboarding(true); setDismissedGuidance([]);
    updateChecklist('reset');
    localStorage.clear();
  }, [updateChecklist]);

  const handleNavigate = useCallback((newScreen: Screen, newTab: Tab, newView: any = null) => {
    setSessionActive(true);
    setActiveTab(newTab);
    setScreen(newScreen);
    if (newTab === 'RESTORE' && newView) setRestoreView(newView);
    if (newTab === 'FIELD' && newView) setFieldView(newView);
  }, []);

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-midnight text-pearl selection:bg-gold/30 selection:text-gold selection:backdrop-blur-sm overflow-x-hidden font-sans">
        
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amethyst/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-warm-brown/10 rounded-full blur-[100px]" />
        </div>
        
        <AnimatePresence mode="wait">
          {!sessionActive ? (
            <WelcomeScreen key="welcome" isReturning={localReflections.length > 0} onStart={startSession} onSelectDailyReturn={handleDailyReturn} isRestoring={isRestoring} />
          ) : (
            <motion.div key="app-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              
              {/* Header Navigation */}
              <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                   <button onClick={() => setSessionActive(false)} className="p-3 bg-midnight/30 backdrop-blur-xl border border-white/5 rounded-full hover:border-gold/30 transition-all group">
                     <ChevronLeft className="w-4 h-4 text-pearl/40 group-hover:text-gold transition-colors" />
                   </button>
                   <div className="px-4 py-2 bg-midnight/30 backdrop-blur-xl border border-gold/10 rounded-full">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">{activeTab}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                   <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-midnight/30 backdrop-blur-xl border border-white/5 rounded-full hover:border-gold/30 transition-all text-pearl/40 hover:text-gold">
                      <Settings className="w-4 h-4" />
                   </button>
                   <button onClick={() => setShowTestMode(true)} className="p-3 bg-midnight/30 backdrop-blur-xl border border-white/5 rounded-full hover:border-orange-400/30 transition-all text-pearl/20 hover:text-orange-400">
                      <Shield className="w-4 h-4" />
                   </button>
                </div>
              </nav>

              {/* Settings Dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="fixed top-24 right-6 z-[160] w-64 glass-panel rounded-[32px] border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-2 space-y-1">
                      <button onClick={() => { setScreen('ABOUT'); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left">
                        <HelpCircle className="w-4 h-4 text-gold/40" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pearl/60">About Prototype</span>
                      </button>
                      <button onClick={() => { setScreen('PRIVACY'); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left">
                        <ShieldCheck className="w-4 h-4 text-gold/40" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pearl/60">Privacy Policy</span>
                      </button>
                      <button onClick={() => { setScreen('SETTINGS'); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left">
                        <Settings className="w-4 h-4 text-gold/40" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pearl/60">Sovereign Settings</span>
                      </button>
                      <button onClick={() => { setScreen('ROANOKE'); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left">
                        <Archive className="w-4 h-4 text-gold/40" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pearl/60">ROANOKE Ledger</span>
                      </button>
                      <div className="h-px bg-white/5 mx-2 my-1" />
                      <button onClick={() => { setScreen('INTEGRATION'); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left">
                        <CheckCircle className="w-4 h-4 text-gold/40" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pearl/40">Finish Session</span>
                      </button>
                    </div>
                    <div className="bg-white/5 p-4 text-center border-t border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gold/40">{VERSION}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <main className="min-h-screen pb-56 sm:pb-40">
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" /></div>}>
                  {screen === 'RESTORE_SELF' && <RestoreSelfScreen onAddReflection={handleAddReflection} presenceCarrier={presenceCarrier} onNavigateToPresence={() => { setRestoreView('PRESENCE'); setScreen('RESTORE_PRESENCE'); }} dailyPrompt={dailyPrompt} onSealDailyReflection={handleSealDailyReflection} onNextPrompt={handleNextDailyPrompt} onSelectDailyReturn={handleDailyReturn} onBeginQuickStart={handleQuickStart} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} isThreeMinuteFlow={isThreeMinuteFlow} onCancelThreeMinuteFlow={handleCancelThreeMinuteFlow} onAddCodexEntry={addCodexEntry} onNavigate={handleNavigate} updateChecklist={updateChecklist} />}
                  {screen === 'RESTORE_PLACE' && <RestorePlaceScreen onAddReflection={handleAddReflection} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} activeField={activeField} />}
                  {screen === 'RESTORE_PRACTICE' && <RestorePracticeScreen progress={practiceProgress} activeCategory={activeCategory} setActiveCategory={setActiveCategory} onCompletePractice={completePractice} onCompleteScenario={completeScenario} onUsePhraseBuilder={usePhraseBuilder} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} />}
                  {screen === 'RESTORE_PRESENCE' && <RestorePresenceScreen carrier={presenceCarrier} onSaveCarrier={(c) => { setPresenceCarrier(c); updateChecklist('self'); }} onDeleteCarrier={() => setPresenceCarrier(null)} onEnterChamber={() => setChamberActive(true)} onSealCodex={(c) => { addCodexEntry({ type: 'presence', title: 'Presence Carrier Sealed', body: c.intentionText, tags: ['presence', 'carrier', 'roa-pc'], metadata: { schema: c.schema, version: c.version, pillars: c.selectedPillars, hash: c.hashPreview, roa: c.roaLine, duration: c.sessionDuration } }); setScreen('CODEX'); setActiveTab('CODEX'); }} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} />}
                  {screen === 'LABYRINTH' && <LabyrinthScreen completedChambers={completedChambers} onSealChamber={sealChamber} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} />}
                  {screen === 'BROADCAST' && <BroadcastScreen activeField={activeField} onSetActiveField={setActiveField} isBroadcasting={isBroadcasting} onStart={handleStartBroadcast} onStop={handleStopBroadcast} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} onReflect={addCodexEntry} />}
                  {screen === 'COMMUNITY' && <CommunityScreen activeField={activeField} onSetActiveField={setActiveField} onJoin={handleJoinCircleIntention} onSave={handleSaveCircleActivity} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} onReflect={addCodexEntry} />}
                  {screen === 'MAP' && <MapScreen activeField={activeField} onReflect={(entry) => { addCodexEntry(entry); setScreen('CODEX'); setActiveTab('CODEX'); }} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} onNavigate={handleNavigate} />}
                  {screen === 'CODEX' && <CodexScreen localReflections={localReflections} completedCount={completedChambers.length} onClear={() => { if(confirm('Clear all local memories and reset your path? This cannot be undone.')) { setLocalReflections([]); updateChecklist('reset'); } }} onClearEntry={clearCodexEntry} onNavigate={() => handleTabSelect('LABYRINTH')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filter={filter} setFilter={setFilter} dismissedGuidance={dismissedGuidance} onDismissGuidance={dismissGuidance} unfoldedPathKey={unfoldedPathKey} onUnfold={setUnfoldedPathKey} onApplyStep={handleApplyUnfoldStep} onImport={handleImportBackups} onOpenRoanoke={() => setScreen('ROANOKE')} />}
                  {screen === 'ROANOKE' && <RoanokeScreen localReflections={localReflections} onImport={handleImportBackups} onNavigateCodex={() => { setScreen('CODEX'); setActiveTab('CODEX'); }} />}
                  {screen === 'ABOUT' && <AboutScreen />}
                  {screen === 'PRIVACY' && <PrivacyScreen />}
                  {screen === 'SETTINGS' && (
                    <SettingsScreen 
                      onReset={() => { setLocalReflections([]); setCompletedChambers([]); setOnboardingComplete(false); setSessionActive(false); setScreen('WELCOME'); }}
                      onExport={() => {
                        const data = JSON.stringify(localReflections, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `spiral-crown-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      onTransmute={() => {
                        const normalized = normalizeCodex(localReflections);
                        setLocalReflections(normalized);
                        alert('Local archive transmuted to latest schema.');
                      }}
                    />
                  )}
                  {screen === 'INTEGRATION' && <IntegrationScreen onFinish={finishSession} />}
                </Suspense>
              </main>

              <BottomNav activeTab={activeTab} onTabSelect={handleTabSelect} />

              {/* Quick Actions */}
              {activeTab === 'RESTORE' && (
                <div className="fixed bottom-28 sm:bottom-28 left-0 w-full flex justify-center gap-2 sm:gap-4 z-40 px-6 flex-wrap">
                  <button onClick={() => { setRestoreView('SELF'); setScreen('RESTORE_SELF'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${restoreView === 'SELF' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Self</button>
                  <button onClick={() => { setRestoreView('PLACE'); setScreen('RESTORE_PLACE'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${restoreView === 'PLACE' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Place</button>
                  <button onClick={() => { setRestoreView('PRESENCE'); setScreen('RESTORE_PRESENCE'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${restoreView === 'PRESENCE' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Presence</button>
                  <button onClick={() => { setRestoreView('PRACTICE'); setScreen('RESTORE_PRACTICE'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${restoreView === 'PRACTICE' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Practice</button>
                  <div className="w-px h-10 bg-white/10 mx-1 hidden xs:block" />
                  <button onClick={() => { setScreen('INTEGRATION'); }} className="px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border bg-midnight/60 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 active:scale-95 transition-all">Finish</button>
                </div>
              )}

              {activeTab === 'FIELD' && (
                <div className="fixed bottom-28 left-0 w-full flex justify-center gap-4 z-40 px-6">
                  <button onClick={() => { setFieldView('BROADCAST'); setScreen('BROADCAST'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${fieldView === 'BROADCAST' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Broadcast</button>
                  <button onClick={() => { setFieldView('COMMUNITY'); setScreen('COMMUNITY'); }} className={`px-4 sm:px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border transition-all ${fieldView === 'COMMUNITY' ? 'bg-gold/20 border-gold text-gold shadow-luminous' : 'bg-midnight/60 border-white/10 text-pearl/60'}`}>Circle</button>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {sessionActive && (
          <ChoirSupportPanel screen={screen} activeTab={activeTab} chamberActive={chamberActive} />
        )}

        <TestChecklistOverlay showTestMode={showTestMode} checklist={checklist} setShowTestMode={setShowTestMode} onReset={resetAll} />

        <Suspense fallback={null}>
          <AnimatePresence>
            {chamberActive && presenceCarrier && (
              <AttunementChamber 
                carrier={presenceCarrier} 
                onExit={() => setChamberActive(false)} 
                onSealReflection={handleAttunementReflection}
                safetyAcknowledged={checklist.consent_breath_guidance}
                onAcknowledgeSafety={() => updateChecklist('consent_breath_guidance')}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} onReviewPrivacy={() => { setScreen('PRIVACY'); setShowOnboarding(false); setOnboardingComplete(true); setSessionActive(true); }} />}
          </AnimatePresence>
        </Suspense>

        <div className="silk-texture fixed inset-0 pointer-events-none z-[100] mix-blend-overlay" />
      </div>
    </AppErrorBoundary>
  );
}
