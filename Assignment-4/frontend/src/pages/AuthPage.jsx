import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.username || formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
        login(res.token, res.user);
        addToast(`Welcome back, ${res.user.username}!`, 'success');
      } else {
        const res = await api.auth.signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        addToast('Registration successful! Please sign in.', 'success');
        setIsLogin(true);
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Authentication error';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillVictorDemo = () => {
    setFormData({
      username: 'victor',
      email: 'victor@example.com',
      password: '123456',
      confirmPassword: '123456',
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden z-10">
        {/* Left Side: Brand & Assignment Features */}
        <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">SecureConnect</h1>
                <p className="text-xs text-brand-400 font-semibold tracking-wide uppercase">Web Development III • Lab 4</p>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white leading-tight mb-3">
              Secure Connect & Real-Time Communication
            </h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Full-stack implementation demonstrating JWT authentication, bcrypt hashing, protected CRUD notes, Socket.IO rooms, and Node.js EventEmitter.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Stateless JWT Authentication', desc: 'Secure token verification with 401/403 route protection' },
                { title: 'Personal Notes CRUD', desc: 'User-specific notes storage with ownership authorization' },
                { title: 'Real-Time Chat with Socket.IO', desc: 'Bidirectional room messaging & user presence' },
                { title: 'Node.js EventEmitter', desc: 'Decoupled event logging for authentication & data mutations' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{feat.title}</h4>
                    <p className="text-[11px] text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={fillVictorDemo}
              className="text-xs text-slate-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-400" />
              <span>Click to pre-fill screenshot demo credentials (victor@example.com)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="victor"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="victor@example.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Lab Practical Demo • Passwords are encrypted with bcrypt (10 rounds)
          </p>
        </div>
      </div>
    </div>
  );
}
