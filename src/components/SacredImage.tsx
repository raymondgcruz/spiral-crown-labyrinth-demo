/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { memo, useState } from 'react';
import { Sprout } from 'lucide-react';

export const SacredImage = memo(({ src, alt, className }: { src?: string, alt: string, className?: string }) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className={`bg-gradient-to-br from-midnight via-emerald-950/40 to-gold/5 flex items-center justify-center overflow-hidden border border-white/5 ${className}`}>
        <div className="flex flex-col items-center gap-2 opacity-20">
          <Sprout className="w-8 h-8 text-gold" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-gold">Sacred Space</span>
        </div>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
});
