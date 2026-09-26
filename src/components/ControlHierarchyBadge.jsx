/**
 * SafePilot AI - Control Hierarchy & Active Safety Mode Banner
 * 
 * Requirement 10:
 * Displays the 5-stage control hierarchy:
 *   1. NORMAL: Driver Control (Steering + Brake)
 *   2. WARNING: Driver Control + AI Warning
 *   3. HIGH RISK: Driver Control + AI Speed Reduction Assistance
 *   4. CRITICAL: AI Safety Controller (Controlled Braking)
 *   5. EMERGENCY: AI Safety Controller (Stabilization & Controlled Stop)
 * 
 * Also displays:
 *   - "AUTOMATIC SAFETY CONTROL ACTIVE"
 *   - "BRAKING ACTIVE"
 *   - "SIMULATION MODE: This prototype does not control a real vehicle."
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, Zap, ShieldAlert, Siren, Disc, Radio } from 'lucide-react';

export default function ControlHierarchyBadge({
  hierarchy = 'NORMAL',
  automaticControl = false,
  brakingActive = false,
}) {
  const stages = [
    { id: 'NORMAL', label: '1. NORMAL', desc: 'Driver Steering + Brake', icon: ShieldCheck },
    { id: 'WARNING', label: '2. WARNING', desc: 'Driver + AI Warning', icon: AlertTriangle },
    { id: 'HIGH_RISK', label: '3. HIGH RISK', desc: 'Driver + Speed Assist', icon: Zap },
    { id: 'CRITICAL', label: '4. CRITICAL', desc: 'AI Controlled AEB', icon: ShieldAlert },
    { id: 'EMERGENCY', label: '5. EMERGENCY', desc: 'AI Stabilization & Stop', icon: Siren },
  ];

  const currentIdx = stages.findIndex((s) => s.id === hierarchy);

  return (
    <div className="glass-panel rounded-2xl p-2.5 px-4 shadow-xl border border-cyan-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
      {/* 1. Control Hierarchy Flow */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">
          CONTROL HIERARCHY:
        </span>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = stage.id === hierarchy;
          const isPassed = currentIdx >= idx;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all border text-[10px] font-semibold whitespace-nowrap ${
                isActive
                  ? stage.id === 'EMERGENCY'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/30 animate-pulse'
                    : stage.id === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-300 border-red-500 shadow-md shadow-red-500/30'
                    : stage.id === 'HIGH_RISK'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : stage.id === 'WARNING'
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-slate-950/40 text-slate-500 border-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* 2. Active Badges: Automatic Control & Braking Active */}
      <div className="flex items-center gap-2">
        {automaticControl && (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold text-[10px] animate-pulse">
            <Radio className="w-3 h-3 animate-spin" />
            AUTOMATIC SAFETY CONTROL ACTIVE
          </span>
        )}

        {brakingActive && (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/60 font-bold text-[10px] animate-pulse">
            <Disc className="w-3 h-3 animate-spin" />
            BRAKING ACTIVE
          </span>
        )}

        {/* Prototype Safety Notice (Requirement 21) */}
        <span className="text-[9px] text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded bg-slate-900/60 hidden xl:inline">
          SIMULATION MODE • Prototype ADAS
        </span>
      </div>
    </div>
  );
}
