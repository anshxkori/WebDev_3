import React from 'react';
import { User, Mail, Shield, Key, Calendar, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token } = useAuth();

  // Parse JWT expiry if available
  let tokenInfo = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        tokenInfo = JSON.parse(atob(parts[1]));
      }
    } catch {
      // ignore
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Overview Card */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-brand-500/20">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{user?.username}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold uppercase">
                {user?.role || 'User'}
              </span>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{user?.email}</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              MongoDB ObjectId: {user?._id || user?.id || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Security & JWT Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Specs */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Backend Security Architecture</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Password Encryption', val: 'bcrypt with 10 salt rounds' },
              { label: 'Token Strategy', val: 'Stateless JSON Web Tokens (JWT)' },
              { label: 'Access Control', val: 'Protected Routes (403 Forbidden without token)' },
              { label: 'Data Persistence', val: 'MongoDB with Mongoose strict schemas' },
              { label: 'Owner Isolation', val: 'Notes restricted to creator user ID' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">{item.label}: </span>
                  <span className="text-slate-200 font-semibold">{item.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JWT Token Session Inspector */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-400" />
            <span>Active JWT Session Details</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Token Expiration:</span>
              <p className="text-slate-200 font-mono font-medium">
                {tokenInfo?.exp ? formatDate(tokenInfo.exp) : '1 Day (Standard)'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Issued At:</span>
              <p className="text-slate-200 font-mono font-medium">
                {tokenInfo?.iat ? formatDate(tokenInfo.iat) : 'Session Active'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500">Raw Token (Truncated):</span>
              <p className="text-[11px] text-slate-400 font-mono break-all line-clamp-2">
                {token ? `${token.substring(0, 40)}...${token.substring(token.length - 20)}` : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
