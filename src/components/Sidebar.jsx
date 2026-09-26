/**
 * SafePilot AI - Automotive Navigation Sidebar
 * 
 * Provides responsive, unified routing across all 11 SafePilot features:
 * Overview, Live Simulation, AI Perception, Risk Analysis, Trip History,
 * Risk Map, Emergency Center, Vehicle Health, Simulation Lab, Driver Profile, and Settings.
 */

import React from 'react';
import {
  Home,
  Car,
  Eye,
  Brain,
  History,
  Map,
  Siren,
  Wrench,
  FlaskConical,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'simulation', label: 'Live Simulation', icon: Car, badge: 'PRIMARY' },
  { id: 'perception', label: 'AI Perception', icon: Eye },
  { id: 'risk_analysis', label: 'Risk Analysis', icon: Brain },
  { id: 'trip_history', label: 'Trip History', icon: History },
  { id: 'risk_map', label: 'Risk Map', icon: Map },
  { id: 'emergency_center', label: 'Emergency Center', icon: Siren },
  { id: 'vehicle_health', label: 'Vehicle Health', icon: Wrench },
  { id: 'simulation_lab', label: 'Simulation Lab', icon: FlaskConical },
  { id: 'driver_profile', label: 'Driver Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
  emergencyActive,
}) {
  return (
    <aside
      className={`relative z-40 flex flex-col h-full bg-slate-950/95 backdrop-blur-xl border-r border-cyan-500/20 transition-all duration-300 select-none shadow-2xl ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/25 to-blue-600/30 border border-cyan-400/40">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-sm font-bold tracking-wider font-tech text-white glow-cyan">
                SAFEPILOT
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                AI
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Emergency Active Banner (if triggered) */}
      {emergencyActive && !isCollapsed && (
        <div
          onClick={() => onNavigate('emergency_center')}
          className="m-2 p-2 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-center gap-2 animate-pulse cursor-pointer shadow-lg"
        >
          <Siren className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div className="truncate">
            <div className="font-bold text-rose-200">EMERGENCY ACTIVE</div>
            <div className="text-[10px] text-rose-400">Tap for Command Center</div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isEmergencyItem = item.id === 'emergency_center' && emergencyActive;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isEmergencyItem
                  ? 'text-rose-400 bg-rose-950/40 hover:bg-rose-900/30 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-cyan-400'
                    : isEmergencyItem
                    ? 'text-rose-400'
                    : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left tracking-wide">
                  {item.label}
                </span>
              )}

              {!isCollapsed && item.badge && !isActive && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Driver Profile Footer */}
      <div className="p-2 border-t border-slate-800/80">
        <div
          onClick={() => onNavigate('driver_profile')}
          className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900/90 cursor-pointer border border-transparent hover:border-slate-800 transition ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="View Driver Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-xs text-white shadow-inner flex-shrink-0">
            {currentUser?.avatarInitials || 'DR'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {currentUser?.name || 'Driver'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser?.vehicle || 'SafePilot EV'}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              title="Logout"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
