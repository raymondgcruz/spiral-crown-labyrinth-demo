/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo } from 'react';
import { 
  Wind, 
  Diamond, 
  Radio, 
  Map as MapIcon, 
  BookOpen 
} from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabSelect: (tab: Tab) => void;
}

export const BottomNav = memo(({ activeTab, onTabSelect }: BottomNavProps) => {
  const tabs = [
    { id: 'RESTORE', label: 'Restore', icon: Wind },
    { id: 'LABYRINTH', label: 'Labyrinth', icon: Diamond },
    { id: 'FIELD', label: 'Field', icon: Radio },
    { id: 'MAP', label: 'Map', icon: MapIcon },
    { id: 'CODEX', label: 'Codex', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full bg-midnight/30 backdrop-blur-2xl border border-white/10 shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id as Tab)}
            className={`flex flex-col items-center gap-1.5 px-4 sm:px-6 py-3 rounded-full transition-all group ${activeTab === tab.id ? 'bg-gold text-midnight scale-110 shadow-luminous' : 'text-pearl/40 hover:text-pearl/80 hover:bg-white/5'}`}
            aria-label={tab.label}
          >
            <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'stroke-[3]' : 'stroke-2'}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
});
