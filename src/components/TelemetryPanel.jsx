/**
 * SafePilot AI - Live Telemetry Panel
 * Displays high-precision real-time vehicle kinematics:
 * - Speed (km/h) & Circular/Arc gauge
 * - Acceleration (m/s²)
 * - Braking Force (%)
 * - Forward Distance (m)
 * - Time-To-Collision (TTC)
 * - Current Composite Risk Level
 */

import React from 'react';
import { Gauge, Zap, Disc, ArrowUpRight, Clock } from 'lucide-react';

export default function TelemetryPanel({ physics, hazard, ttc, risk }) {
  const isBraking = physics.brakingPercent > 0;
  const isCritical = risk.riskLevel === 'CRITICAL';
  const isHigh = risk.riskLevel === 'HIGH';

  // Speedometer fill percentage (0 to 120 km/h)
  const speedRatio = Math.min(1, physics.speedKmh / 120);

  return (
    <div className="glass-panel rounded-xl p-3.5 shadow-2xl border border-cyan-500/20 backdrop-blur-xl w-72 flex flex-col gap-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-tech uppercase tracking-wider text-slate-100">
            Live Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-semibold">60 HZ</span>
        </div>
      </div>

      {/* Main Speed Digital Display */}
      <div className="flex items-baseline justify-between px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
        <div>
          <div className="text-[10px] font-mono text-slate-400 tracking-wider">SPEED</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono-nums tracking-tight text-white glow-cyan">
              {Math.round(physics.speedKmh)}
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">km/h</span>
          </div>
        </div>

        {/* Gear and Throttle indicator */}
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400">GEAR</div>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {physics.gear} <span className="text-xs text-slate-400 font-normal">({Math.round(physics.throttlePercent)}% TH)</span>
          </div>
        </div>
      </div>

      {/* Speedometer Bar Visualizer */}
      <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-150 rounded-full ${
            isCritical
              ? 'bg-red-500'
              : isHigh
              ? 'bg-amber-400'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
          }`}
          style={{ width: `${Math.max(3, speedRatio * 100)}%` }}
        />
      </div>

      {/* Primary Kinematics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Acceleration */}
        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>ACCEL</span>
          </div>
          <div className="font-mono-nums font-bold text-sm text-slate-100">
            {physics.accelerationMps2 > 0 ? `+${physics.accelerationMps2.toFixed(1)}` : physics.accelerationMps2.toFixed(1)}
            <span className="text-[10px] text-slate-400 font-normal ml-1">m/s²</span>
          </div>
        </div>

        {/* Braking Force */}
        <div className={`p-2 rounded-lg border flex flex-col transition-all ${
          isBraking
            ? 'bg-red-950/40 border-red-500/50 text-red-200'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Disc className={`w-3 h-3 ${isBraking ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
            <span>BRAKING</span>
          </div>
          <div className={`font-mono-nums font-bold text-sm ${isBraking ? 'text-red-400' : 'text-slate-100'}`}>
            {physics.brakingPercent}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">%</span>
          </div>
        </div>

        {/* Lead Vehicle Distance */}
        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
            <span>DISTANCE</span>
          </div>
          <div className="font-mono-nums font-bold text-sm text-slate-100">
            {hazard ? hazard.distanceM.toFixed(1) : '--'}
            <span className="text-[10px] text-slate-400 font-normal ml-1">m</span>
          </div>
        </div>

        {/* Time-To-Collision (TTC) */}
        <div className={`p-2 rounded-lg border flex flex-col transition-all ${
          ttc.dangerLevel === 'CRITICAL'
            ? 'bg-red-950/60 border-red-500 text-red-100 shadow-md shadow-red-500/30'
            : ttc.dangerLevel === 'HIGH'
            ? 'bg-amber-950/50 border-amber-500 text-amber-100'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Clock className={`w-3 h-3 ${
              ttc.dangerLevel === 'CRITICAL'
                ? 'text-red-400'
                : ttc.dangerLevel === 'HIGH'
                ? 'text-amber-400'
                : 'text-cyan-400'
            }`} />
            <span>TTC</span>
          </div>
          <div className={`font-mono-nums font-bold text-sm ${
            ttc.dangerLevel === 'CRITICAL'
              ? 'text-red-400 animate-pulse'
              : ttc.dangerLevel === 'HIGH'
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {ttc.ttcDisplay || 'NOMINAL'}
          </div>
        </div>

        {/* Steering Angle */}
        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <span className="w-3 h-3 flex items-center justify-center text-[10px] text-cyan-400">∠</span>
            <span>STEERING</span>
          </div>
          <div className="font-mono-nums font-bold text-sm text-cyan-300">
            {physics.steeringAngle > 0 ? `+${physics.steeringAngle}°` : `${physics.steeringAngle || 0}°`}
          </div>
        </div>

        {/* Current Lane */}
        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>LANE</span>
          </div>
          <div className="font-bold text-[11px] text-slate-200 truncate">
            {physics.currentLane || 'CENTER'}
          </div>
        </div>
      </div>

      {/* Risk Badge Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
        <span className="text-slate-400">RISK STATE:</span>
        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
          isCritical
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 glow-red'
            : isHigh
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 glow-amber'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
        }`}>
          {risk.riskLevel}
        </span>
      </div>
    </div>
  );
}
