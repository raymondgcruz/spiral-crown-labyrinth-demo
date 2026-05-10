/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  RefreshCw, 
  Zap, 
  MapPin, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  X,
  Database,
  Cloud,
  Droplet,
  Wind
} from 'lucide-react';
import { geocodeLocation } from '../services/fieldWorld/geocodeLocation';
import { fetchWeatherField } from '../services/fieldWorld/fetchWeatherField';
import { fetchAirQualityField } from '../services/fieldWorld/fetchAirQualityField';
import { fetchPlaceSignals } from '../services/fieldWorld/fetchPlaceSignals';
import { generateFieldWorld } from '../services/fieldWorld/generateFieldWorld';
import { generateRoanokeFieldProof } from '../services/fieldWorld/roanokeFieldProof';
import { RoanokeFieldSnapshot } from '../types/fieldWorld';
import { VERSION, APP_PHASE } from '../data';

interface RoanokeFieldGeneratorProps {
  activeField: RoanokeFieldSnapshot | null;
  onSetActiveField: (field: RoanokeFieldSnapshot | null) => void;
  onReflect?: (entry: any) => void;
  className?: string;
}

export const RoanokeFieldGenerator = ({ activeField, onSetActiveField, onReflect, className }: RoanokeFieldGeneratorProps) => {
  const [zipInput, setZipInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setError(null);
    // Strict 5-digit ZIP validation
    const zipMatch = zipInput.trim().match(/^\d{5}(-\d{4})?$/);
    if (!zipMatch) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    const zip = zipMatch[0].split('-')[0]; // Normalize to 5-digit

    setIsGenerating(true);
    try {
      const geo = await geocodeLocation(zip);
      if (!geo) {
        setError("Could not resolve this ZIP code safely.");
        setIsGenerating(false);
        return;
      }

      const [weather, air, places] = await Promise.all([
        fetchWeatherField(geo.lat, geo.lon),
        fetchAirQualityField(geo.lat, geo.lon),
        fetchPlaceSignals(geo.lat, geo.lon)
      ]);

      const generated = generateFieldWorld(geo, weather, air, places);
      
      const proofStr = await generateRoanokeFieldProof({
        displayLocation: geo.label,
        fieldTone: generated.fieldTone,
        pillars: generated.suggestedPillars,
        generatedAt: generated.generatedAt
      });

      const snapshot: RoanokeFieldSnapshot = {
        schema: "roanoke.fieldWorld.v1",
        appVersion: VERSION,
        phase: "prototype",
        kind: "field_world_snapshot",
        id: `field-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "map_field_world_generator",
        title: `ROANOKE Local Field — ${geo.label}`,
        displayLocation: {
          label: geo.label,
          city: geo.city,
          state: geo.state,
          zip: geo.zip,
          country: geo.country,
          precision: "zip",
        },
        privacy: {
          rawAddressStored: false,
          exactCoordinatesStored: false,
          localOnly: true,
          userConfirmedSave: true,
        },
        geoApprox: {
          latRounded: Math.round(geo.lat * 100) / 100,
          lonRounded: Math.round(geo.lon * 100) / 100,
          rounding: "zip-centroid",
          source: "ZIP centroid + public environmental feeds",
          confidence: "medium",
        },
        feeds: {
          weather: weather.status,
          airQuality: air.status,
          places: places.status,
        },
        fieldWorld: {
          ...generated,
          mapZones: generated.mapZones.map(z => ({
            ...z,
            consentState: "locked" // Initial state for map points
          }))
        } as any,
        proof: {
          method: "roanoke.local.sha256.preview",
          hashPreview: proofStr,
          generatedAt: new Date().toISOString(),
          canonicalSource: "stable-json",
        },
        compatibility: {
          readableBy: ["spiral-crown.local-backup.v1", "roanoke.object.v1", "roanoke.fieldWorld.v1"],
          migratedFrom: null,
          migrationNotes: [],
        },
      };

      onSetActiveField(snapshot);
      setZipInput('');
    } catch (e) {
      console.error(e);
      setError("Verification failed. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  }, [zipInput, onSetActiveField]);

  const handleClear = useCallback(() => {
    if (confirm("Clear active field? The Map will return to its default state.")) {
      onSetActiveField(null);
    }
  }, [onSetActiveField]);

  const handleSaveToCodex = useCallback(() => {
    if (!activeField || !onReflect) return;
    
    onReflect({
      type: 'field_world_snapshot',
      title: activeField.title,
      body: `Local Field generated for ${activeField.displayLocation.label}.\n\nField Tone: ${activeField.fieldWorld.fieldTone}\nProof: ${activeField.proof.hashPreview}`,
      tags: ['ROANOKE', 'Field World', activeField.displayLocation.zip || 'Local'],
      metadata: activeField
    });
    alert("Field Snapshot saved to Codex.");
  }, [activeField, onReflect]);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div id="roanoke-field-generator" className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <h3 className="text-2xl font-serif text-gold">ROANOKE Local Field Generator</h3>
          </div>
          <p className="text-xs text-pearl/60 italic leading-relaxed max-w-xl">
            “Enter a ZIP code to generate a privacy-safe local field. The Map will use this to create a symbolic local world with consent-based entry points.”
          </p>
        </header>

        {!activeField ? (
          <div className="glass-panel p-8 rounded-[40px] border-gold/10 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter 5-digit ZIP..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-pearl focus:outline-none focus:border-gold/40 transition-colors"
                  maxLength={10}
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pearl/20" />
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !zipInput.trim()}
                className="px-8 py-4 bg-gold text-midnight rounded-2xl font-black uppercase tracking-widest text-xs shadow-luminous disabled:opacity-30 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Generate Local Field
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2 bg-red-400/10 border border-red-400/20 rounded-xl">
                <p className="text-[10px] font-bold text-red-400 tracking-wider uppercase text-center">{error}</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 rounded-[48px] border-gold/30 shadow-luminous relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6">
                  <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active Local Field</span>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Assigned Location</span>
                    <h4 className="text-3xl font-serif text-pearl italic">{activeField.displayLocation.label}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-pearl/40"><Zap className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Field Tone</span></div>
                        <p className="text-sm text-gold italic">{activeField.fieldWorld.fieldTone}</p>
                     </div>
                     <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-pearl/40"><Database className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Proof Hash</span></div>
                        <p className="text-[10px] font-mono text-pearl/40 truncate">{activeField.proof.hashPreview}</p>
                     </div>
                     <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-pearl/40"><Shield className="w-3 h-3" /><span className="text-[8px] font-black uppercase tracking-widest">Privacy</span></div>
                        <p className="text-[10px] font-bold text-emerald-400/60 uppercase">Centroid-Based</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                     <button onClick={handleGenerate} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-pearl/60 hover:bg-gold/10 hover:text-gold transition-all flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Refresh Field
                     </button>
                     <button onClick={handleSaveToCodex} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-pearl/60 hover:bg-gold/10 hover:text-gold transition-all flex items-center gap-2">
                        <Save className="w-3 h-3" /> Snapshot to Codex
                     </button>
                     <button onClick={handleClear} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-pearl/40 hover:text-red-400 hover:border-red-400/20 transition-all flex items-center gap-2">
                        <X className="w-3 h-3" /> Clear Field
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => setShowDataSources(!showDataSources)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-pearl/20 hover:text-gold transition-colors"
          >
            {showDataSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            View Data Sources
          </button>
          
          <AnimatePresence>
            {showDataSources && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gold/40 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-pearl/60 uppercase">Geocoding</p>
                      <p className="text-[9px] text-pearl/30">OpenStreetMap Nominatim</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cloud className="w-4 h-4 text-gold/40 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-pearl/60 uppercase">Weather</p>
                      <p className="text-[9px] text-pearl/30">Open-Meteo Public API</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wind className="w-4 h-4 text-gold/40 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-pearl/60 uppercase">Environment</p>
                      <p className="text-[9px] text-pearl/30">Open-Meteo Air Quality</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Droplet className="w-4 h-4 text-gold/40 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-pearl/60 uppercase">Place Signals</p>
                      <p className="text-[9px] text-pearl/30">Overpass API (OpenStreetMap)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
