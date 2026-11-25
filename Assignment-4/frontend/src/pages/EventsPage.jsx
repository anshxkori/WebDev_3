import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Zap, Shield, FileText, MessageSquare, UserCheck } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { addToast } = useToast();

  const fetchEvents = async () => {
    try {
      const data = await api.events.getRecent();
      setEvents(data.events || []);
    } catch (err) {
      addToast('Failed to load event logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (!autoRefresh) return;
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getEventBadge = (type) => {
    switch (type) {
      case 'userRegistered':
        return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: UserCheck };
      case 'userLoggedIn':
        return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Shield };
      case 'noteCreated':
      case 'noteUpdated':
      case 'noteDeleted':
        return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: FileText };
      case 'chatMessage':
        return { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: MessageSquare };
      default:
        return { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Zap };
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Activity className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Node.js EventEmitter Architecture</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            This module observes the backend's native <code className="text-indigo-300 font-mono">EventEmitter</code>. Whenever a user registers, logs in, manages notes, or posts in chat, asynchronous event listeners decouple side-effects and log event activity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-0"
            />
            <span>Live Auto-Poll (3s)</span>
          </label>

          <button
            onClick={() => {
              setLoading(true);
              fetchEvents();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events Table / Stream */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Emitted Event Stream ({events.length} captured)
          </span>
          <span className="text-xs text-indigo-400 font-mono font-medium">
            events/eventHandler.js
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events recorded yet. Perform an action (login, note CRUD, or chat) to trigger events.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            {events.map((ev) => {
              const badge = getEventBadge(ev.type);
              const Icon = badge.icon;
              return (
                <div key={ev.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1.5 ${badge.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ev.type}</span>
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {ev.type === 'userRegistered' && `New user registered: ${ev.payload?.username} (${ev.payload?.email})`}
                      {ev.type === 'userLoggedIn' && `User authentication: ${ev.payload?.username}`}
                      {ev.type === 'noteCreated' && `Note created: "${ev.payload?.title}"`}
                      {ev.type === 'noteUpdated' && `Note updated: "${ev.payload?.title}" (ID: ${ev.payload?.noteId})`}
                      {ev.type === 'noteDeleted' && `Note deleted: ID ${ev.payload?.noteId}`}
                      {ev.type === 'chatMessage' && `[${ev.payload?.room}] ${ev.payload?.username}: "${ev.payload?.message}"`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-mono shrink-0">
                    <span>{formatDate(ev.timestamp)}</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                      {ev.id.split('-')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
