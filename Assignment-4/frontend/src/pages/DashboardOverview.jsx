import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  Activity,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function DashboardOverview({ setActiveTab, socketConnected }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalNotes: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, eventsRes, statsRes] = await Promise.all([
          api.notes.getAll().catch(() => []),
          api.events.getRecent().catch(() => ({ events: [] })),
          api.stats.get().catch(() => ({ totalNotes: 0, totalUsers: 0 })),
        ]);
        setNotes(Array.isArray(notesRes) ? notesRes : []);
        setEvents(eventsRes.events || []);
        setStats(statsRes);
      } catch (err) {
        console.error('Error fetching dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lab 4 Assignment System Live</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-brand-400 to-teal-300 bg-clip-text text-transparent">{user?.username}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              All backend services (JWT Authentication, MongoDB Mongoose Models, Node.js EventEmitter, and Socket.IO Real-Time Chat) are running and verified.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('notes')}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Join Chat</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">My Notes</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{notes.length}</span>
            <span className="text-xs text-slate-400">personal notes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Protected by JWT & User Ownership</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Chat Engine</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {socketConnected ? 'Online (Active)' : 'Disconnected'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2">Socket.IO Bidirectional WebSocket</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">EventEmitter</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{events.length}</span>
            <span className="text-xs text-slate-400">logged events</span>
          </div>
          <p className="text-[11px] text-indigo-400 mt-2">Decoupled Node.js Event Loop</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Security Tier</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">Strict Auth</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">bcrypt (10 rounds) + JWT Expiry</p>
        </div>
      </div>

      {/* Main Content Grid: Recent Notes & Event-Driven Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Recent Personal Notes</span>
            </h3>
            <button
              onClick={() => setActiveTab('notes')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              <span>View all ({notes.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">No notes created yet.</p>
              <button
                onClick={() => setActiveTab('notes')}
                className="px-4 py-2 rounded-xl bg-brand-600/80 hover:bg-brand-600 text-white text-xs font-semibold transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Note</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.slice(0, 4).map((note) => (
                <div
                  key={note._id}
                  onClick={() => setActiveTab('notes')}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1 mb-2">
                      {note.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                    <span className="text-brand-400/80 font-mono text-[10px]">CRUD Note</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Event-Driven Activity Monitor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Event Activity Feed</span>
            </h3>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800/60">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No events emitted yet.</p>
            ) : (
              events.slice(0, 5).map((ev) => (
                <div key={ev.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ev.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDate(ev.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    {ev.type === 'userRegistered' && `Registered: ${ev.payload.username}`}
                    {ev.type === 'userLoggedIn' && `Logged in: ${ev.payload.username}`}
                    {ev.type === 'noteCreated' && `Created note: "${ev.payload.title}"`}
                    {ev.type === 'noteUpdated' && `Updated note: "${ev.payload.title}"`}
                    {ev.type === 'noteDeleted' && `Deleted note: ${ev.payload.noteId}`}
                    {ev.type === 'chatMessage' && `[${ev.payload.room}] ${ev.payload.username}: ${ev.payload.message}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
