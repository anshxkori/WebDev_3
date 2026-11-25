import React from 'react';
import { Shield, Radio, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, socketConnected = false }) {
  const { user } = useAuth();

  const titles = {
    dashboard: 'Dashboard Overview',
    notes: 'Secure Personal Notes',
    chat: 'Real-Time Communication Room',
    events: 'Event-Driven Activity Stream',
    profile: 'User Profile & Identity',
    settings: 'Platform Settings & Environment',
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {titles[activeTab] || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Socket.IO Real-time indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            {socketConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            )}
          </span>
          <span className={socketConnected ? 'text-emerald-400' : 'text-rose-400'}>
            {socketConnected ? 'Socket.IO Online' : 'Socket Disconnected'}
          </span>
        </div>

        {/* JWT Auth Verified Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          <span>JWT Protected</span>
        </div>

        {/* User Tag */}
        <div className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/40">
          @{user?.username}
        </div>
      </div>
    </header>
  );
}
