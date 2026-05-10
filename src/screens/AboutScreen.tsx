/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { VERSION } from '../data';
import { APP_PHASE, ROANOKE_BACKBONE_VERSION, APP_NAME } from '../version';
import { SacredImage } from '../components/SacredImage';

export const AboutScreen = memo(() => (
  <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-16">
    <header className="text-center space-y-4">
      <h2 className="text-5xl font-serif text-gold">{APP_NAME}</h2>
      <p className="text-lg text-pearl/60 italic max-w-2xl mx-auto">“A digital sanctuary for restoring relationship with self, place, and the larger field.”</p>
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex justify-center gap-4">
          <span className="px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-[9px] font-black uppercase tracking-[0.3em] text-gold/60">{VERSION}</span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-pearl/40">{APP_PHASE}</span>
        </div>
        <span className="text-[8px] font-mono text-pearl/20 uppercase tracking-[0.2em]">{ROANOKE_BACKBONE_VERSION}</span>
      </div>
    </header>

    <div className="glass-panel p-10 rounded-[48px] border-white/5 space-y-10">
      <div className="space-y-4">
        <h3 className="text-2xl font-serif text-gold">ROANOKE Backbone</h3>
        <p className="text-pearl/80 leading-relaxed font-serif text-lg">
          ROANOKE is the local memory backbone of this prototype. It ensures that your reflections, attunements, and choices are stored as structured, proof-carrying objects that remain strictly on your device.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/60">Current Role</h4>
            <ul className="text-[10px] text-pearl/40 space-y-1 list-disc pl-4 italic">
              <li>Normalize local records</li>
              <li>Preserve legacy memories</li>
              <li>Generate proof previews</li>
              <li>Support backup import/export</li>
              <li>Keep private data on-device</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/60">Future Role</h4>
            <ul className="text-[10px] text-pearl/40 space-y-1 list-disc pl-4 italic">
              <li>Richer proof bundles</li>
              <li>Stronger schema migration</li>
              <li>Selective unfold paths</li>
              <li>Fuller local memory graph</li>
              <li>Backward-compatible ROANOKE packages</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <h3 className="text-2xl font-serif text-gold">Changelog</h3>
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gold/5 border border-gold/20 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gold">{VERSION} (Current)</span>
            <p className="text-xs text-pearl/60 italic leading-relaxed">ROANOKE Knowledge Spine & Relational Unfolder. Introduced local relational object schema, Axis chips (Self, Other, Environment), and deterministic proofs. Added Relation Lens view for knowledge graph summaries and ROANOKE Pack JSON export. Integrated relational UNFOLD engine for local-first path suggestions.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2 opacity-60">
            <span className="text-[10px] font-black uppercase tracking-widest text-pearl/80">Public Demo v1.0-alpha.8</span>
            <p className="text-xs text-pearl/60 italic leading-relaxed">iPhone Fallback Primary & Audio UX Stabilization. Safari now defaults to local generated WAV/PCM fallback for reliable playback. Added advanced engine selector in diagnostics. Responsive Exit Rail refinement for unobstructed vibes.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest text-pearl/80">Public Demo v1.0-alpha.5</span>
            <p className="text-xs text-pearl/60 italic leading-relaxed">iPhone Audio Audibility & Attunement Accessibility. Speaker-friendly octave shift for mobile speakers. Persistent Conclude control. Audio diagnostics and Safari-safe unlock hardening.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <h3 className="text-2xl font-serif text-gold">Public Tester Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "Begin with Breath in the Welcome screen",
            "Seal a reflection in 'Restore Self'",
            "Confirm Codex remembers after refresh",
            "Create a Quiet Presence carrier",
            "Enter and exit the Attunement Chamber",
            "Progress through the Labyrinth steps",
            "Start and stop a Field Broadcast",
            "Review Privacy & Consent screen",
            "Reset progress safely in Settings"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-pearl/60">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <h3 className="text-2xl font-serif text-gold">Map Consent Interaction</h3>
        <div className="p-6 rounded-3xl bg-midnight/50 border border-gold/10 space-y-4">
           <p className="text-sm font-serif text-gold italic">“Approach before Entry”</p>
           <p className="text-xs text-pearl/60 leading-relaxed">
             The map intentionally requires two steps to open a zone: First, you must tap the orbit (the field) to acknowledge its resonance. Only then, once the field is acknowledged, can you tap the point itself to enter and view its details.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gold/60 underline">The Orbit</span>
                <p className="text-[10px] text-pearl/40">The boundary of consent. Tap to approach/select.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gold/60 underline">The Point</span>
                <p className="text-[10px] text-pearl/40">The core of data. Tap to enter/view.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <div className="flex items-center gap-3 text-gold">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-2xl font-serif">Public Feedback Prompt</h3>
        </div>
        <p className="text-sm text-pearl/40 italic">As a prototype tester, your witness is invaluable. Reflect on these promptings:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/60">The Field</h4>
            <p className="text-xs text-pearl/60 leading-relaxed">What felt clear? What felt confusing? What felt unnecessary?</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/60">The Resonance</h4>
            <p className="text-xs text-pearl/60 leading-relaxed">What felt calming? What should be more "alive"?</p>
          </div>
        </div>
        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-[10px] text-pearl/40 leading-relaxed italic">
          Note: This is a local-only prototype. To share feedback, please copy your reflections from the Codex or take a screenshot and share it via the project's public channel.
        </div>
      </div>
    </div>

    <div className="space-y-16">
      <section className="space-y-4">
        <h3 className="text-xl font-serif text-gold">Public Tester Readiness Guide</h3>
        <p className="text-sm text-pearl/60 leading-relaxed">
          This prototype is ready for alpha testing. Please follow the suggested path below to explore the core harmonic restoration flows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold/80">Suggested Test Path</h4>
            <ul className="text-sm text-pearl/60 space-y-3 list-disc pl-4 italic">
              <li>Complete the First-Run Onboarding</li>
              <li>Use the Daily Return cycle from the Welcome screen</li>
              <li>Practice "Beginning with Breath" in Restore Self</li>
              <li>Create and seal a ROANOKE Presence Carrier</li>
              <li>Navigate the Map using the Orbit → Point consent flow</li>
              <li>Try the local Phrase Builder in Practice Tab</li>
              <li>Start a simulated Field Broadcast</li>
              <li>Export your Codex JSON for your own records</li>
              <li>Reset all progress to verify data sovereignty</li>
            </ul>
          </div>
          <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Feedback Prompts</h4>
            <p className="text-xs text-emerald-400/60">Hold space for these questions as you navigate:</p>
            <ul className="text-sm text-pearl/60 space-y-2">
              <li>• What felt clear? What felt confusing?</li>
              <li>• Did the tone feel sacred or overwhelming?</li>
              <li>• Was the "local-only" privacy model felt and understood?</li>
              <li>• Where did you need more plain language?</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4 bg-orange-400/5 border border-orange-400/20 rounded-2xl p-6">
        <h3 className="text-xl font-serif text-orange-400">Context & Safety</h3>
        <p className="text-sm text-pearl/60 leading-relaxed italic">
          "This is a reflective practice prototype, not therapy, medical care, or emergency support."
        </p>
        <p className="text-xs text-pearl/40 leading-relaxed">
          The Spiral Crown is a tool for self-tending and relational reflection. If you are experiencing a crisis, 
          please seek human professional support (e.g., trusted friends, crisis lines, or medical care). 
          This interface stays strictly local to your device and does not provide clinical intervention or 
          guaranteed relationship repair.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
          <h3 className="text-xl font-serif text-pearl">Deployment Notes</h3>
        <p className="text-xs text-pearl/40 leading-relaxed">
          This prototype is a strictly static web app. To ensure stability:
        </p>
        <ul className="space-y-3">
          {[
            "Served via GitHub Pages as a single-page application.",
            "Assets (JS/CSS) must match the index.html from the same build.",
            "No backend database is required; state lives in localStorage.",
            "Last updated: April 2026."
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-[10px] text-pearl/60 font-serif italic">
              <span className="text-gold mt-1">•</span> {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
        <h3 className="text-xl font-serif text-pearl">Maintenance Checklist</h3>
        <ul className="space-y-4">
          {[
            "Confirm Vite base path is correct",
            "Run production build (npm run build)",
            "Sync index.html and assets/ together",
            "Upload index.html to repository root",
            "Upload matching assets to /assets/",
            "Perform hard refresh on live demo"
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-pearl/40">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="space-y-8">
      <h3 className="text-3xl font-serif text-gold/60">Changelog</h3>
      <div className="space-y-6">
        {[
          { version: 'v1.0-alpha', date: 'May 2026', changes: ['Whole-App Coherence Audit', 'Accessibility & Performance Pass', 'Mobile Ergonomics Optimization', 'Public Tester Readiness Guide', 'Safety & Scope Disclaimers'] },
          { version: 'v0.9', date: 'May 2026', changes: ['Onboarding Flow (Sovereign Trust)', 'Daily Return Cycle & Prompting', '3-Minute Quick Start Path', 'Contextual Guidance Hints', 'Return-Cycle terminology alignment'] },
          { version: 'v0.8', date: 'April 2026', changes: ['Embodied Practice & Relationship Training', 'Consent, Listening, Repair, Boundary Chambers', 'Relational Scenario Simulator', 'Local Phrase Builder Tool', 'Practice-Codex Persistence'] },
          { version: 'v0.7.8', date: 'April 2026', changes: ['Map Consent Interaction Guidance', 'Approach before Entry philosophy', 'Focus Mode interaction states'] },
          { version: 'v0.6', date: 'April 2026', changes: ['ROANOKE Presence Carrier Canonicalization', 'Deterministic hashing and ROA lines', 'Carrier review panel & JSON export'] },
          { version: 'v0.5', date: 'April 2026', changes: ['Private Codex Expansion (Search/Filters)', 'Date grouping and entry types', 'LocalStorage schema migration (v0.5)', 'Export Codex JSON', 'Enhanced privacy architecture notes'] },
          { version: 'v0.4', date: 'April 2026', changes: ['The Sixteen Harmonic Chambers', 'Progressive Labyrinth map', 'Detailed chamber seals', 'Chamber-Codex integration'] },
          { version: 'v0.3.1', date: 'April 2026', changes: ['Tester Guide & Deployment Notes', 'Public feedback prompts', 'Maintenance checklists', 'Vite asset stability hardening'] },
          { version: 'v0.3', date: 'April 2026', changes: ['Added About & Privacy screens', 'Refined first-time guidance', 'Improved empty states for clarity', 'Added version markers'] },
          { version: 'v0.2', date: 'April 2026', changes: ['Implemented Quiet Presence Mode', 'Added Attunement Chamber', 'Deterministic Symbolic Hashing'] },
          { version: 'v0.1', date: 'March 2026', changes: ['Initial Labyrinth prototype', 'Codex persistence', 'Sacred-modern UI foundation'] }
        ].map((v, i) => (
          <div key={i} className="glass-panel p-6 rounded-[32px] border-white/5 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold">{v.version}</span>
              <p className="text-[8px] font-mono text-pearl/20 uppercase tracking-widest">{v.date}</p>
            </div>
            <ul className="flex flex-wrap gap-2 sm:max-w-md justify-end">
              {v.changes.map((c, ci) => (
                <li key={ci} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] text-pearl/40 font-bold uppercase tracking-widest">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="text-center pt-8">
       <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/20">Designed for the sovereign soul.</div>
    </div>
   </div>
  </div>
));
