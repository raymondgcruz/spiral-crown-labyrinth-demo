/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  FieldWorldZone, 
  FieldWorldActivity, 
  FieldWorldMetrics,
  FieldWorldPlaceSignal,
  GeocodeResult 
} from '../../types/fieldWorld';
import { WeatherFieldData } from './fetchWeatherField';
import { AirQualityFieldData } from './fetchAirQualityField';
import { PlaceFieldData, PlaceSignal } from './fetchPlaceSignals';

export interface GeneratedField {
  generatedAt: string;
  fieldTone: string;
  environmentalSignals: string[];
  supportiveSignals: string[];
  restorativeNeeds: string[];
  suggestedPillars: string[];
  mapZones: FieldWorldZone[];
  activities: FieldWorldActivity[];
  metrics?: FieldWorldMetrics;
  placeSignals?: FieldWorldPlaceSignal[];
}

function labelAirVitality(air: AirQualityFieldData): string {
  if (air.aqi === undefined) return air.status.status === 'active' || air.status.status === 'partial' ? 'Partially Read' : 'Simulated';
  if (air.aqi <= 50) return 'Clean Breath';
  if (air.aqi <= 100) return 'Moderate Breath';
  if (air.aqi <= 150) return 'Sensitive Caution';
  if (air.aqi <= 200) return 'Protective Breath';
  return 'Inward Sanctuary';
}

function labelRadiance(weather: WeatherFieldData, air: AirQualityFieldData): string {
  const uv = weather.uvIndexMax ?? air.uvIndex;
  if (uv !== undefined) {
    if (uv <= 2) return 'Soft Light';
    if (uv <= 5) return 'Bright but Gentle';
    if (uv <= 7) return 'Strong Radiance';
    return 'Protective Radiance';
  }
  if ((weather.cloudCover ?? 100) < 35) return 'Luminous';
  if ((weather.cloudCover ?? 100) < 75) return 'Veiled Light';
  return 'Cloud-Tempered';
}

function labelMoisture(weather: WeatherFieldData): string {
  const humidity = weather.humidity;
  const precipitation = weather.precipitation || 0;
  if (precipitation > 0 || weather.isRainy) return 'Actively Nourished';
  if (humidity === undefined) return 'Simulated';
  if (humidity >= 80) return 'Deeply Nourished';
  if (humidity >= 55) return 'Balanced Moisture';
  if (humidity >= 35) return 'Lightly Dry';
  return 'Dry Field';
}

function localAnchor(signals: PlaceSignal[], category: PlaceSignal['category']): PlaceSignal | undefined {
  return signals.find(signal => signal.category === category && signal.name && signal.name !== 'Unnamed Place') || signals.find(signal => signal.category === category);
}

function makePlaceSignals(signals: PlaceSignal[]): FieldWorldPlaceSignal[] {
  return signals.slice(0, 12).map(signal => ({
    id: signal.id,
    name: signal.name,
    type: signal.type,
    category: signal.category,
  }));
}

export function generateFieldWorld(
  location: GeocodeResult,
  weather: WeatherFieldData,
  air: AirQualityFieldData,
  places: PlaceFieldData
): GeneratedField {
  const timestamp = new Date().toISOString();
  const environmentalSignals: string[] = [];
  const supportiveSignals: string[] = [];
  const restorativeNeeds: string[] = [];
  const suggestedPillars: string[] = [];
  const zones: FieldWorldZone[] = [];
  const activities: FieldWorldActivity[] = [];
  const placeSignals = makePlaceSignals(places.signals || []);

  const metrics: FieldWorldMetrics = {
    airVitality: {
      label: labelAirVitality(air),
      aqi: air.aqi,
      category: air.category,
      pm25: air.pm25,
      pm10: air.pm10,
      uvIndex: air.uvIndex,
    },
    celestialRhythm: {
      label: weather.celestialPhase || (weather.isDay ? 'Daylight Arc' : 'Night Watch'),
      sunrise: weather.sunrise,
      sunset: weather.sunset,
      isDay: weather.isDay,
      timezone: weather.timezone,
    },
    radiance: {
      label: labelRadiance(weather, air),
      uvIndexMax: weather.uvIndexMax ?? air.uvIndex,
      cloudCover: weather.cloudCover,
    },
    moisture: {
      label: labelMoisture(weather),
      humidity: weather.humidity,
      precipitation: weather.precipitation,
    },
    weather: {
      temperature: weather.temperature,
      condition: weather.condition,
      windSpeed: weather.windSpeed,
    },
  };

  if (weather.status.status === 'active' || weather.status.status === 'partial') {
    if (weather.temperature !== undefined || weather.condition) {
      environmentalSignals.push(`${weather.temperature ?? '—'}°F, ${weather.condition || 'local sky observed'}`);
    }
    if (weather.humidity !== undefined) environmentalSignals.push(`Humidity ${weather.humidity}%`);
    if (weather.uvIndexMax !== undefined) environmentalSignals.push(`UV max ${weather.uvIndexMax}`);
    if (weather.isRainy) {
      restorativeNeeds.push('Sanctuary from rain');
      suggestedPillars.push('Compassion', 'Clarity');
    }
    if (weather.isClear) {
      supportiveSignals.push('Abundant sunlight');
      suggestedPillars.push('Joy', 'Radiance');
    }
  }

  if (air.status.status === 'active' || air.status.status === 'partial') {
    if (air.aqi !== undefined) environmentalSignals.push(`US AQI ${air.aqi} (${air.category || 'observed'})`);
    if (air.aqi !== undefined && air.aqi > 100) {
      restorativeNeeds.push('Air-quality caution');
      suggestedPillars.push('Sanctuary', 'Support');
    }
  }

  const hasParks = places.signals.some(s => s.category === 'park');
  const hasLibrary = places.signals.some(s => s.category === 'library');
  const hasWater = places.signals.some(s => s.category === 'water');
  const hasCommunity = places.signals.some(s => s.category === 'community');

  if (hasParks) supportiveSignals.push('Shared green spaces nearby');
  if (hasLibrary) supportiveSignals.push('Local learning sanctuary found');
  if (hasWater) supportiveSignals.push('Water bodies detected');
  if (hasCommunity) supportiveSignals.push('Community hearth detected');

  let tone = 'Stable and Observational';
  if (weather.isRainy) tone = 'Reflective and Protective';
  if (weather.isClear && hasParks) tone = 'Vibrant and Grounded';
  if (air.status.status === 'active' && air.aqi && air.aqi > 100) tone = 'Quiet and Inward-Bound';
  if (hasWater && metrics.moisture?.label === 'Balanced Moisture') tone = 'Flowing and Receptive';

  zones.push({
    id: 'zone-breath',
    type: 'breath',
    label: 'Atmospheric Breath',
    intensity: air.aqi !== undefined ? Math.max(0.25, 1 - Math.min(air.aqi, 200) / 220) : weather.temperature ? Math.min(weather.temperature / 100, 1) : 0.5,
    description: `Current atmospheric state: ${weather.condition || 'Unknown'}. Air vitality: ${metrics.airVitality?.label}${air.aqi !== undefined ? ` (AQI ${air.aqi})` : ''}.`
  });

  const park = localAnchor(places.signals, 'park');
  if (hasParks) {
    zones.push({
      id: 'zone-grove',
      type: 'grove',
      label: park?.name && park.name !== 'Unnamed Place' ? park.name : 'Restore Grove',
      intensity: 0.8,
      description: 'Public green spaces, trees, and sanctuaries are available for grounding.'
    });
  }

  const library = localAnchor(places.signals, 'library');
  if (hasLibrary) {
    zones.push({
      id: 'zone-hearth',
      type: 'hearth',
      label: library?.name && library.name !== 'Unnamed Place' ? library.name : 'Learning Hearth',
      intensity: 0.9,
      description: 'Libraries, community centers and learning sanctuaries offer shared warmth and wisdom.'
    });
  }

  const water = localAnchor(places.signals, 'water');
  if (hasWater) {
    zones.push({
      id: 'zone-water',
      type: 'water',
      label: water?.name && water.name !== 'Unnamed Place' ? water.name : 'Mirror Water',
      intensity: 0.7,
      description: 'Rivers, lakes, or public water access provide points for reflection.'
    });
  }

  zones.push({
    id: 'zone-path',
    type: 'path',
    label: `${location.city || location.zip || 'Local'} Pathway Light`,
    intensity: 0.6,
    description: 'Public trails and walkable routes for gentle movement.'
  });

  zones.push({
    id: 'zone-lantern',
    type: 'light',
    label: 'Community Lantern',
    intensity: 0.75,
    description: 'Public art, gardens, or markers of collective kind presence.'
  });

  if (hasParks) {
    activities.push({
      id: 'act-grove-walk',
      title: park?.name && park.name !== 'Unnamed Place' ? `Grove Walk: ${park.name}` : 'Grove Grounding Walk',
      pillar: 'Restoration',
      action: `Visit ${park?.name && park.name !== 'Unnamed Place' ? park.name : 'a nearby public green space'}. Walk slowly and notice three different life forms.`,
      groundingNote: 'The trees witness your presence without judgment.',
      localAnchorName: park?.name,
      category: 'park',
    });
  }

  if (hasLibrary) {
    activities.push({
      id: 'act-hearth-rest',
      title: library?.name && library.name !== 'Unnamed Place' ? `Hearth Rest: ${library.name}` : 'Hearth Rest',
      pillar: 'Learning',
      action: `Enter ${library?.name && library.name !== 'Unnamed Place' ? library.name : 'a local library or community center'}. Sit quietly for 5 minutes without a screen.`,
      groundingNote: 'Shared knowledge is a sanctuary for the mind.',
      isIndoorPreferred: true,
      localAnchorName: library?.name,
      category: 'library',
    });
  }

  if (hasWater) {
    activities.push({
      id: 'act-water-reflection',
      title: water?.name && water.name !== 'Unnamed Place' ? `Water Reflection: ${water.name}` : 'Water Reflection',
      pillar: 'Clarity',
      action: `Locate ${water?.name && water.name !== 'Unnamed Place' ? water.name : 'a public water access point'}. Observe the movement of the surface.`,
      groundingNote: 'Like water, your thoughts can be both deep and clear.',
      localAnchorName: water?.name,
      category: 'water',
    });
  }

  activities.push({
    id: 'act-path-movement',
    title: `${location.city || 'Local'} Pathway Movement`,
    pillar: 'Presence',
    action: 'Find a public walking path. Move at a pace that feels truly yours.',
    groundingNote: 'Every step is an act of sovereign relationship with place.',
    category: 'path',
  });

  if (activities.length === 0) {
    activities.push({
      id: 'act-simple-presence',
      title: 'Instant Sanctuary',
      pillar: 'Presence',
      action: 'Create a small sanctuary where you are: one breath, one kind intention.',
      groundingNote: 'The field begins exactly where you stand.',
    });
  }

  return {
    generatedAt: timestamp,
    fieldTone: tone,
    environmentalSignals,
    supportiveSignals,
    restorativeNeeds,
    suggestedPillars: Array.from(new Set(suggestedPillars)),
    mapZones: zones,
    activities: activities.slice(0, 4),
    metrics,
    placeSignals,
  };
}
