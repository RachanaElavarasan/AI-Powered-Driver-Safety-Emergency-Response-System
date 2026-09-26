/**
 * SafePilot AI - Central AI Risk Engine Visualization
 * Synthesizes multi-factor inputs:
 * DRIVER RISK + VEHICLE RISK + COLLISION RISK + ENVIRONMENT RISK -> AI RISK ENGINE -> RISK LEVEL & SAFETY ACTION
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function RiskEngine({ risk }) {
  const { riskScore, riskLevel, safetyAction, breakdown } = risk;

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const isMedium = riskLevel === 'MEDIUM';

  // Badge style
  const panelStyle = isCritical
    ? 'border-red-500/80 bg-red-950/40 shadow-red-500/20'
    : isHigh
    ? 'border-amber-500/80 bg-amber-950/40 shadow-amber-500/20'
    : isMedium
    ? 'border-yellow-500/40 bg-yellow-950/20'
    : 'border-cyan-500/30 bg-slate-900/60';

  const levelColor = isCritical
    ? 'text-red-400'
    : isHigh
    ? 'text-amber-400'
    : isMedium
    ? 'text-yellow-400'
    : 'text-emerald-400';

  return (
    <div className={`glass-panel rounded-2xl p-4 shadow-2xl transition-all duration-300 border flex flex-col gap-3.5 max-w-xl w-full ${panelStyle}`}>
      {/* 1. Header: AI Risk Engine Status */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isCritical
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : isHigh
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-tech uppercase tracking-wider text-white">
              AI Risk Engine
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Multi-Factor Neural Hazard & Kinematics Fusion
            </p>
          </div>
        </div>

        {/* Dynamic Risk Score & Level Badge */}
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase">RISK SCORE</div>
          <div className="flex items-baseline justify-end gap-1.5">
            <span className={`text-2xl font-extrabold font-mono-nums ${levelColor}`}>
              {riskScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* 2. Automated Safety Action Banner (Prompt Requirements 7) */}
      <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
        isCritical
          ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
          : isHigh
          ? 'bg-amber-950/80 border-amber-500 text-white shadow-md shadow-amber-500/20'
          : isMedium
          ? 'bg-yellow-950/40 border-yellow-600/60 text-yellow-100'
          : 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          {isCritical ? (
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
          ) : isHigh ? (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
              {isCritical ? '🚨 CRITICAL RISK' : isHigh ? '⚠ HIGH RISK' : 'SYSTEM STATUS'}
            </div>
            <div className="text-xs sm:text-sm font-bold font-tech uppercase tracking-wide">
              ACTION: <span className="underline decoration-current underline-offset-2">{safetyAction}</span>
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] hidden sm:block">
          <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[11px] ${
            isCritical
              ? 'bg-red-600 text-white'
              : isHigh
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {riskLevel}
          </span>
        </div>
      </div>

      {/* 3. Multi-Factor Inputs Breakdown (Prompt Requirement 5) */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        {/* Driver Risk */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">DRIVER</span>
          <span className={`font-mono-nums font-bold text-sm mt-0.5 ${
            breakdown.driverRisk > 60 ? 'text-amber-400' : 'text-slate-200'
          }`}>
            {breakdown.driverRisk}%
          </span>
        </div>

        {/* Vehicle Risk */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">VEHICLE</span>
          <span className="font-mono-nums font-bold text-sm mt-0.5 text-slate-200">
            {breakdown.vehicleRisk}%
          </span>
        </div>

        {/* Collision Risk */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">COLLISION</span>
          <span className={`font-mono-nums font-bold text-sm mt-0.5 ${
            breakdown.collisionRisk > 70
              ? 'text-red-400'
              : breakdown.collisionRisk > 40
              ? 'text-amber-400'
              : 'text-slate-200'
          }`}>
            {breakdown.collisionRisk}%
          </span>
        </div>

        {/* Environment Risk */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">ENVIRON</span>
          <span className="font-mono-nums font-bold text-sm mt-0.5 text-slate-200">
            {breakdown.environmentRisk}%
          </span>
        </div>
      </div>

      {/* 4. Risk Spectrum Visual Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 relative">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isCritical
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : isHigh
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : isMedium
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400'
              : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
          }`}
          style={{ width: `${Math.max(4, riskScore)}%` }}
        />
      </div>
    </div>
  );
}
