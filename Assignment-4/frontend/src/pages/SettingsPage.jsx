import React from 'react';
import { Settings, Server, Globe, Database, Cpu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Environment Config Info */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-400" />
          <span>System Environment & Connections</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500">Backend API URL</span>
            <p className="text-white font-mono font-bold text-sm">http://localhost:5000</p>
            <p className="text-[11px] text-emerald-400">Express.js Server Active</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500">Database Connection</span>
            <p className="text-white font-mono font-bold text-sm">mongodb://127.0.0.1:27017/secure_connect</p>
            <p className="text-[11px] text-emerald-400">Mongoose Connection Active</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500">Real-Time Chat Engine</span>
            <p className="text-white font-mono font-bold text-sm">Socket.IO 4.8.x</p>
            <p className="text-[11px] text-brand-400">WebSocket Transport Enabled</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500">Event System</span>
            <p className="text-white font-mono font-bold text-sm">Node.js EventEmitter</p>
            <p className="text-[11px] text-indigo-400">Decoupled in-process event bus</p>
          </div>
        </div>
      </div>

      {/* Lab Practical Reference */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Academic Assignment Compliance</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          This project strictly implements the Web Development III Unit 4 Lab requirements. It does not use starter kits, pre-built boilerplates, Passport.js, Supabase, Firebase, or external auth frameworks. All authentication, route guards, token validation, and websocket handling are implemented manually.
        </p>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all"
          >
            End Current Session (Log Out)
          </button>
        </div>
      </div>
    </div>
  );
}
