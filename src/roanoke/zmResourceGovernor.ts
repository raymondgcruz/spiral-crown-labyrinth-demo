/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ZM Resource Governor
 *
 * A small ROANOKE/ZM layer for keeping the living map truthful without making
 * mobile devices carry more visual or data weight than they can gracefully hold.
 */

export type ZmResourceTier = 'sanctuary' | 'balanced' | 'full';

export interface ZmResourceContext {
  viewportWidth: number;
  viewportHeight: number;
  zoneCount: number;
  deviceMemoryGb?: number;
}

export interface ZmMapBudget {
  tier: ZmResourceTier;
  maxVisibleZones: number;
  showAmbientRings: boolean;
  showGuidanceCards: boolean;
  panelDefault: 'minimized' | 'expanded';
  description: string;
}

const PRIORITY_BY_TYPE: Record<string, number> = {
  breath: 100,
  grove: 92,
  hearth: 88,
  water: 84,
  path: 80,
  light: 72,
  spiral: 68,
};

export const ZM_RESOURCE_NOTE =
  'ZM Resource Gate: reveal only what serves the present device, gesture, and breath.';

export function getZmResourceTier(context: ZmResourceContext): ZmResourceTier {
  const memory = context.deviceMemoryGb ?? 8;
  const isSmallPhone = context.viewportWidth < 430 || context.viewportHeight < 740;
  const isMobile = context.viewportWidth < 768;
  const isDense = context.zoneCount > 5;

  if (isSmallPhone || memory <= 4 || (isMobile && isDense)) return 'sanctuary';
  if (isMobile || memory <= 6 || isDense) return 'balanced';
  return 'full';
}

export function getZmMapBudget(tier: ZmResourceTier): ZmMapBudget {
  if (tier === 'sanctuary') {
    return {
      tier,
      maxVisibleZones: 3,
      showAmbientRings: false,
      showGuidanceCards: false,
      panelDefault: 'minimized',
      description: 'Sanctuary mode: minimal map nodes, compact overlays, touch-first practice entry.',
    };
  }

  if (tier === 'balanced') {
    return {
      tier,
      maxVisibleZones: 4,
      showAmbientRings: true,
      showGuidanceCards: false,
      panelDefault: 'minimized',
      description: 'Balanced mode: essential nodes with collapsible details.',
    };
  }

  return {
    tier,
    maxVisibleZones: 8,
    showAmbientRings: true,
    showGuidanceCards: true,
    panelDefault: 'expanded',
    description: 'Full mode: expanded field details available by default on larger screens.',
  };
}

export function prioritizeZones<T extends { id: string; type?: string; intensity?: number }>(
  zones: T[],
  tier: ZmResourceTier,
): T[] {
  const budget = getZmMapBudget(tier);
  return [...zones]
    .sort((a, b) => {
      const aPriority = (PRIORITY_BY_TYPE[a.type || ''] || 0) + ((a.intensity || 0) * 10);
      const bPriority = (PRIORITY_BY_TYPE[b.type || ''] || 0) + ((b.intensity || 0) * 10);
      return bPriority - aPriority;
    })
    .slice(0, budget.maxVisibleZones);
}

export interface ZmAttunementContext {
  viewportWidth: number;
  viewportHeight: number;
  selectedPillarCount: number;
  deviceMemoryGb?: number;
  prefersReducedMotion?: boolean;
}

export interface ZmAttunementBudget {
  tier: ZmResourceTier;
  preferFallbackAudio: boolean;
  maxAudibleHarmonics: number;
  fallbackLoopSeconds: number;
  maxVolume: number;
  showComplexField: boolean;
  description: string;
}

export function getDeviceMemoryGb(): number | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined;
}

export function getZmAttunementBudget(context: ZmAttunementContext): ZmAttunementBudget {
  const memory = context.deviceMemoryGb ?? 8;
  const isSmallPhone = context.viewportWidth < 430 || context.viewportHeight < 740;
  const isMobile = context.viewportWidth < 768;
  const isDense = context.selectedPillarCount > 5;
  const isiOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  let tier: ZmResourceTier = 'full';
  if (isSmallPhone || memory <= 4 || context.prefersReducedMotion || (isMobile && isDense)) tier = 'sanctuary';
  else if (isMobile || memory <= 6 || isDense) tier = 'balanced';

  if (tier === 'sanctuary') {
    return {
      tier,
      preferFallbackAudio: isMobile || isiOS,
      maxAudibleHarmonics: 3,
      fallbackLoopSeconds: 12,
      maxVolume: 0.14,
      showComplexField: false,
      description: 'ZM Attunement Sanctuary: fallback-first on mobile, limited harmonics, normalized audio, softened visuals.',
    };
  }

  if (tier === 'balanced') {
    return {
      tier,
      preferFallbackAudio: isiOS,
      maxAudibleHarmonics: 5,
      fallbackLoopSeconds: 16,
      maxVolume: 0.18,
      showComplexField: true,
      description: 'ZM Attunement Balanced: moderate harmonics and visual restraint.',
    };
  }

  return {
    tier,
    preferFallbackAudio: false,
    maxAudibleHarmonics: 8,
    fallbackLoopSeconds: 24,
    maxVolume: 0.22,
    showComplexField: true,
    description: 'ZM Attunement Full: expanded harmonics for stronger devices.',
  };
}

export function selectAudiblePillarsForBudget<T extends string>(pillars: T[], currentIndex: number, budget: ZmAttunementBudget): T[] {
  if (pillars.length <= budget.maxAudibleHarmonics) return pillars;
  const current = pillars[currentIndex] ?? pillars[0];
  const ordered = [current, ...pillars.filter((p) => p !== current)];
  return ordered.slice(0, budget.maxAudibleHarmonics);
}
