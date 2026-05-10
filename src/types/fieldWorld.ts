/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FieldPrecision = "zip" | "city" | "approximate";

export interface FieldFeedStatus {
  source: string;
  timestamp: string;
  status: "active" | "partial" | "unavailable" | "pending";
  detail?: string;
}

export interface FieldWorldZone {
  id: string;
  type: "breath" | "grove" | "water" | "hearth" | "path" | "light" | "spiral";
  label: string;
  intensity: number; // 0 to 1
  description: string;
  sentiment?: string;
}

export interface FieldWorldActivity {
  id: string;
  title: string;
  pillar: string;
  action: string;
  groundingNote: string;
  isIndoorPreferred?: boolean;
  localAnchorName?: string;
  category?: string;
}

export interface FieldWorldPlaceSignal {
  id: string;
  name: string;
  type: string;
  category: "park" | "library" | "water" | "community" | "transit";
}

export interface FieldWorldMetrics {
  airVitality?: {
    label: string;
    aqi?: number;
    category?: string;
    pm25?: number;
    pm10?: number;
    uvIndex?: number;
  };
  celestialRhythm?: {
    label: string;
    sunrise?: string;
    sunset?: string;
    isDay?: boolean;
    timezone?: string;
  };
  radiance?: {
    label: string;
    uvIndexMax?: number;
    cloudCover?: number;
  };
  moisture?: {
    label: string;
    humidity?: number;
    precipitation?: number;
  };
  weather?: {
    temperature?: number;
    condition?: string;
    windSpeed?: number;
  };
}

export interface RoanokeFieldSnapshot {
  schema: "roanoke.fieldWorld.v1";
  appVersion: string;
  phase: "prototype";
  kind: "field_world_snapshot";
  id: string;
  createdAt: string;
  updatedAt: string;
  source: "map_field_world_generator";
  title: string;
  displayLocation: {
    label: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    precision: FieldPrecision;
  };
  privacy: {
    rawAddressStored: false;
    exactCoordinatesStored: false;
    localOnly: true;
    userConfirmedSave: boolean;
  };
  geoApprox: {
    latRounded?: number;
    lonRounded?: number;
    rounding: "2-decimal" | "zip-centroid" | "city-centroid" | "none";
    source?: string;
    confidence?: "high" | "medium" | "low";
  };
  feeds: {
    weather?: FieldFeedStatus;
    airQuality?: FieldFeedStatus;
    places?: FieldFeedStatus;
  };
  fieldWorld: {
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
  };
  proof: {
    method: "roanoke.local.sha256.preview";
    hashPreview: string;
    generatedAt: string;
    canonicalSource: "stable-json";
  };
  compatibility: {
    readableBy: ["spiral-crown.local-backup.v1", "roanoke.object.v1", "roanoke.fieldWorld.v1"];
    migratedFrom: null | string;
    migrationNotes: string[];
  };
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  label: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  precision: FieldPrecision;
}
