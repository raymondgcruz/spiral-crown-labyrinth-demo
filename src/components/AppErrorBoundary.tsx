/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error Boundary caught:", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="fixed inset-0 bg-midnight flex items-center justify-center p-8 text-center z-[1000]">
          <div className="glass-panel p-12 rounded-[56px] border-gold/20 max-w-sm space-y-8 shadow-luminous">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20">
              <ShieldAlert className="w-10 h-10 text-gold" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-serif text-gold italic">A Rift in the Field</h3>
              <p className="text-sm text-pearl/40 leading-relaxed italic">
                A temporary misalignment in the rendering cycle has occurred. The field remains sovereign, but requires manual restoration.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-5 bg-gold text-midnight font-bold uppercase tracking-widest rounded-full shadow-luminous transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" /> Restore Connection
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
