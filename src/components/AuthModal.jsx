/**
 * SafePilot AI - Authentication Modal (Login / Sign Up)
 * Sleek cyber automotive glassmorphic design matching the HUD system
 */

import React, { useState } from 'react';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

export default function AuthModal({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('alex.mercer@safepilot.ai');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Mercer');
  const [vehicle, setVehicle] = useState('SafePilot EV-4 Autonomous');
  const [license, setLicense] = useState('CA-948201-DL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signup({
          name,
          email,
          password,
          licenseNumber: license,
          vehicle,
        });
      } else {
        await authService.login({ email, password });
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('alex.mercer@safepilot.ai');
    setPassword('password123');
    setLoading(true);
    try {
      await authService.login({
        email: 'alex.mercer@safepilot.ai',
        password: 'password123',
      });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-cyan-500/30 flex flex-col gap-5 text-white relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-inner">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white glow-cyan uppercase">
              SAFEPILOT AI
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous Driver Safety & ADAS Telemetry Platform
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DRIVER SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              isSignUp
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-mono text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                  Driver Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-500 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                    License ID
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="CA-948201-DL"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="EV-4 Autonomous"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@safepilot.ai"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wide hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/30 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'AUTHENTICATING...' : isSignUp ? 'CREATE ACCOUNT & ACCESS' : 'SIGN IN TO DASHBOARD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">Developer / Demo Mode:</span>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>1-Click Demo Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
