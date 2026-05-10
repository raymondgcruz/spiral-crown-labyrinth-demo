/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  AirVent, 
  Moon, 
  Sun, 
  CloudRain,
  BookOpen,
  Compass,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { GuidanceChip } from '../components/GuidanceChip';
import { SacredImage } from '../components/SacredImage';
import { RelationLensLayer } from '../components/RelationLensLayer';
import { RoanokeFieldSnapshot } from '../types/fieldWorld';

interface RestorePlaceScreenProps {
  onAddReflection: (text: string, meta?: any) => void;
  dismissedGuidance: string[];
  onDismissGuidance: (id: string) => void;
  activeField?: RoanokeFieldSnapshot | null;
}

const SIMULATED_STATS = [
  { label: 'Air Vitality', val: 'Pristine', sub: 'Simulated AQI: 14', icon: AirVent, color: 'text-emerald-400' },
  { label: 'Celestial Rhythm', val: 'Waxing Crescent', sub: 'Simulated planting intentions', icon: Moon, color: 'text-gold' },
  { label: 'Radiance', val: 'Luminous', sub: 'Simulated UV Index: 2', icon: Sun, color: 'text-orange-400' },
  { label: 'Moisture', val: 'Deeply Nourished', sub: 'Simulated morning dew', icon: CloudRain, color: 'text-blue-400' },
];

const SIMULATED_TASKS = [
  { title: 'Tending the Local', desc: 'Remove non-organic elements from your immediate path today.', image: 'https://images.unsplash.com/photo-1598401861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=800' },
  { title: 'Silent Observation', desc: 'Sit for twelve minutes in a natural space. Simply witness.', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800' },
  { title: 'Gratitude for Field', desc: 'Offer a word of thanks to the soil beneath your feet.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800' }
];

const CATEGORY_IMAGES: Record<string, string> = {
  park: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=900',
  water: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=900',
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=900',
  community: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=900',
  path: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=900',
  default: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=900',
};

function formatClock(value?: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function buildLiveStats(activeField: RoanokeFieldSnapshot) {
  const metrics = activeField.fieldWorld.metrics;
  const air = metrics?.airVitality;
  const celestial = metrics?.celestialRhythm;
  const radiance = metrics?.radiance;
  const moisture = metrics?.moisture;

  return [
    {
      label: 'Air Vitality',
      val: air?.label || 'Observed',
      sub: air?.aqi !== undefined
        ? `AQI ${air.aqi}${air.pm25 !== undefined ? ` · PM2.5 ${air.pm25}` : ''}`
        : activeField.feeds.airQuality?.status === 'active' || activeField.feeds.airQuality?.status === 'partial'
          ? 'Partial air reading'
          : 'Air feed unavailable',
      icon: AirVent,
      color: air?.aqi !== undefined && air.aqi > 100 ? 'text-orange-400' : 'text-emerald-400',
    },
    {
      label: 'Celestial Rhythm',
      val: celestial?.label || 'Local Sky',
      sub: `Rise ${formatClock(celestial?.sunrise)} · Set ${formatClock(celestial?.sunset)}`,
      icon: Moon,
      color: 'text-gold',
    },
    {
      label: 'Radiance',
      val: radiance?.label || 'Measured Light',
      sub: `${radiance?.uvIndexMax !== undefined ? `UV max ${radiance.uvIndexMax}` : 'UV unavailable'}${radiance?.cloudCover !== undefined ? ` · Cloud ${radiance.cloudCover}%` : ''}`,
      icon: Sun,
      color: 'text-orange-400',
    },
    {
      label: 'Moisture',
      val: moisture?.label || 'Local Moisture',
      sub: `${moisture?.humidity !== undefined ? `Humidity ${moisture.humidity}%` : 'Humidity unavailable'}${moisture?.precipitation !== undefined ? ` · Rain ${moisture.precipitation}mm` : ''}`,
      icon: CloudRain,
      color: 'text-blue-400',
    },
  ];
}

function getHeroImage(activeField?: RoanokeFieldSnapshot | null): string {
  if (!activeField) return 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200';
  const categories = new Set((activeField.fieldWorld.placeSignals || []).map(signal => signal.category));
  if (categories.has('water')) return CATEGORY_IMAGES.water;
  if (categories.has('park')) return CATEGORY_IMAGES.park;
  if (categories.has('library')) return CATEGORY_IMAGES.library;
  if (categories.has('community')) return CATEGORY_IMAGES.community;
  return CATEGORY_IMAGES.default;
}

export const RestorePlaceScreen = memo(({ onAddReflection, dismissedGuidance, onDismissGuidance, activeField }: RestorePlaceScreenProps) => {
  const [note, setNote] = React.useState('');
  const [metadata, setMetadata] = React.useState<any>(null);

  const isEnlivened = Boolean(activeField);
  const locationLabel = activeField?.displayLocation.label || 'Pacific Northwest Basin';
  const stats = activeField ? buildLiveStats(activeField) : SIMULATED_STATS;
  const heroImage = getHeroImage(activeField);
  const taskSource = activeField?.fieldWorld.activities?.length
    ? activeField.fieldWorld.activities.map(activity => ({
        title: activity.title,
        desc: activity.action,
        image: CATEGORY_IMAGES[activity.category || 'default'] || CATEGORY_IMAGES.default,
      }))
    : SIMULATED_TASKS;
  const placeSignals = activeField?.fieldWorld.placeSignals || [];

  return (
    <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-12">
      <AnimatePresence>
        {!dismissedGuidance.includes('place-guidance') && (
          <GuidanceChip 
            id="place-guidance" 
            text={isEnlivened ? 'Your Restore Place field is enlivened by the active ROANOKE ZIP snapshot.' : 'Tend to your physical environment. This remains simulated until you generate a ZIP field.'}
            onDismiss={() => onDismissGuidance('place-guidance')}
          />
        )}
      </AnimatePresence>

      <section className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5">
            {isEnlivened ? <ShieldCheck className="w-3 h-3" /> : <Compass className="w-3 h-3" />}
            {isEnlivened ? 'Enlivened Place Field' : 'Simulated Place Field'}
          </div>
          <h2 className="text-5xl font-serif">Restore Place</h2>
          <p className="text-[10px] text-pearl/40 uppercase font-black tracking-[0.3em]">The Work of Co-Existence</p>
          <p className="text-lg text-pearl/70 max-w-xl italic">
            {isEnlivened
              ? `The local field is now reading ${locationLabel}. Environmental cards, pilgrimages, and field signals reflect the active ZIP snapshot.`
              : 'Quiet your spirit and listen to the pulse of the living world. This display is intentionally simulated until a ZIP field is generated.'}
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <div className="px-6 py-2 rounded-full border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/5 shadow-luminous">
              Sensitivity Protocol active
            </div>
            {isEnlivened && (
              <div className="px-5 py-2 rounded-full border border-emerald-400/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-400/5">
                {activeField?.proof.hashPreview} · Verified Local Snapshot
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative group">
            <SacredImage 
              src={heroImage}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              alt={isEnlivened ? `Local field image for ${locationLabel}` : 'Simulated misty forest'} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="flex items-center gap-2 text-gold/80">
                <MapIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest line-clamp-2">{locationLabel}</span>
              </div>
              <p className="text-[10px] text-pearl/50 italic">
                {isEnlivened ? `${activeField?.fieldWorld.fieldTone} · ${activeField?.displayLocation.precision} precision` : 'Beautiful simulation awaiting ROANOKE field data'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-[32px] flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="text-[10px] font-bold text-pearl/30 uppercase text-right">{item.label}</span>
            </div>
            <div>
              <div className="text-2xl font-serif text-pearl">{item.val}</div>
              <div className="text-[10px] font-bold text-pearl/40 uppercase tracking-widest mt-1">{item.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {isEnlivened && placeSignals.length > 0 && (
        <section className="glass-panel p-6 rounded-[36px] border-emerald-400/10 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400/70">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Actual Local Signals</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {placeSignals.slice(0, 10).map(signal => (
              <span key={signal.id} className="px-3 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-pearl/60 italic">
                {signal.name} · {signal.category}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <div className="flex justify-between items-end gap-4">
          <h3 className="text-3xl font-serif">Attunement Tasks</h3>
          <span className={`text-[10px] font-black uppercase tracking-widest ${isEnlivened ? 'text-emerald-400/70' : 'text-emerald-400/40'}`}>
            {isEnlivened ? 'Future Pilgrimages Unlocked' : 'Future Pilgrimages Locked'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {taskSource.slice(0, 3).map((task, idx) => (
            <div key={idx} className="glass-panel p-1 rounded-[40px] group border-white/5 bg-white/5 transition-all duration-500">
              <div className="aspect-square rounded-[38px] overflow-hidden relative">
                <SacredImage src={task.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={task.title} />
                <div className="absolute inset-0 bg-midnight/20 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold mb-2">{task.title}</h4>
                <p className="text-sm text-pearl/60">{task.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-10 rounded-[48px] border-white/10 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white">Environment Reflection</h3>
          <p className="text-xs text-pearl/40 italic">
            {isEnlivened ? `Describe your relation to ${locationLabel}.` : 'Describe your relation to the space you occupy.'}
          </p>
        </div>
        
        <div className="space-y-4">
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observe the local field..."
            className="w-full bg-midnight/40 border border-white/10 rounded-3xl p-6 text-sm text-pearl font-serif italic outline-none focus:border-gold/40 transition-all"
            rows={4}
          />

          <RelationLensLayer 
            text={note}
            initialAxes={['environment']}
            onMetadataChange={setMetadata}
          />
        </div>

        <button 
          onClick={() => {
            if(note.trim()) {
              onAddReflection(note, {
                lawfulRelation: metadata,
                activeField: activeField ? {
                  id: activeField.id,
                  location: activeField.displayLocation,
                  proof: activeField.proof.hashPreview,
                  fieldTone: activeField.fieldWorld.fieldTone,
                } : null,
              });
              setNote('');
            }
          }}
          disabled={!note.trim()}
          className="w-full py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" /> Save environment reflection
        </button>
      </section>
    </div>
  );
});
