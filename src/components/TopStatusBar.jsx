/**
 * SafePilot AI - Top Status & System Health Bar
 * Features real-time sensor network status, simulation mode banner,
 * audio/environment controls, and notification center.
 */

import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Cpu,
  Radio,
  MapPin,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  CloudRain,
  Wifi,
  LogOut,
  RotateCcw,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function TopStatusBar({
  riskLevel = 'LOW',
  backendConnected = false,
  environment,
  onToggleWeather,
  onToggleTimeOfDay,
  isMuted,
  onToggleMute,
  currentUser,
  onOpenProfile,
  onLogout,
  onResetSimulation,
  notifications = [],
  onClearNotifications,
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="relative w-full z-40 px-4 py-2 flex items-center justify-between glass-panel border-b border-cyan-500/20 shadow-2xl select-none">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-inner">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider font-tech text-white glow-cyan">
              SAFEPILOT AI
            </h1>
            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              v2.4 ADAS
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono tracking-tight hidden lg:block">
            AI VEHICLE SAFETY & EMERGENCY RESPONSE PLATFORM
          </p>
        </div>
      </div>

      {/* Mandatory Safety / Simulation Banner (Requirement 21) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/30 border border-amber-500/40 text-[10px] font-mono text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>SIMULATION MODE — Not connected to or controlling a real vehicle</span>
      </div>

      {/* Real-time Subsystem Status Badges */}
      <div className="hidden 2xl:flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/60 border border-slate-700/60">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400 text-[10px]">System:</span>
          <span className="text-emerald-400 font-semibold text-[10px]">ACTIVE</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/60 border border-slate-700/60">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">AI Model:</span>
          <span className="text-cyan-300 font-semibold text-[10px]">ONLINE (12ms)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/60 border border-slate-700/60">
          <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
          <span className="text-slate-400 text-[10px]">Sensors:</span>
          <span className="text-blue-300 font-semibold text-[10px]">LiDAR + RADAR</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/60 border border-slate-700/60">
          <MapPin className="w-3 h-3 text-violet-400" />
          <span className="text-slate-400 text-[10px]">GPS:</span>
          <span className="text-violet-300 font-semibold text-[10px]">LOCKED (RTK)</span>
        </div>
      </div>

      {/* Controls & Quick Toggles */}
      <div className="relative flex items-center gap-2">
        {/* Notification Bell (Requirement 14) */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Notification Center"
            className="relative p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-cyan-400 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950 font-mono ring-2 ring-slate-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onClearAll={() => {
              if (onClearNotifications) onClearNotifications();
            }}
          />
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute ADAS audio alerts' : 'Mute ADAS alerts'}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-cyan-400 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Rain / Weather Toggle */}
        <button
          onClick={onToggleWeather}
          title="Toggle weather condition (Dry / Rain / Fog)"
          className={`p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border transition ${
            environment?.weather === 'RAIN'
              ? 'border-blue-500 text-blue-400 bg-blue-950/40'
              : environment?.weather === 'FOG'
              ? 'border-slate-400 text-slate-300 bg-slate-800/60'
              : 'border-slate-700/70 text-slate-300'
          }`}
        >
          <CloudRain className="w-4 h-4" />
        </button>

        {/* Day / Night Toggle */}
        <button
          onClick={onToggleTimeOfDay}
          title="Toggle lighting (Day / Cyber Night)"
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-amber-400 transition"
        >
          {environment?.timeOfDay === 'NIGHT' ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Reset Simulation Shortcut */}
        {onResetSimulation && (
          <button
            onClick={onResetSimulation}
            title="Reset Simulation (R)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition text-[11px] font-mono font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        )}

        {/* Driver Profile Trigger */}
        {currentUser && (
          <button
            onClick={onOpenProfile}
            title="Driver Profile & Contacts"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-200 hover:text-white transition cursor-pointer text-xs font-mono"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
              {currentUser.avatarInitials || 'DR'}
            </div>
            <span className="hidden md:inline font-semibold font-tech uppercase">{currentUser.name}</span>
          </button>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-red-950/50 border border-slate-700/70 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
