/**
 * SafePilot AI - Risk Analysis Dashboard Page
 * Requirement 6:
 * - AI Risk Engine component breakdown (Driver, Vehicle, Collision, Environment)
 * - Risk Score & Risk Level badge
 * - Relationship flowchart diagram
 * - Real-time Risk History Graph updated from actual simulation historyBuffer
 */

import React from 'react';
import {
  Brain,
  Activity,
  AlertTriangle,
  Shield,
  Layers,
  TrendingUp,
  ArrowDown,
  Plus,
} from 'lucide-react';

export default function RiskAnalysisPage({ telemetry }) {
  const {
    driverRisk = 8,
    vehicleRisk = 5,
    collisionRisk = 10,
    environmentRisk = 10,
    riskScore = 12,
    riskLevel = 'LOW',
    action = 'NORMAL DRIVING',
    historyBuffer = [],
  } = telemetry;

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const isMedium = riskLevel === 'MEDIUM';

  const riskLevelColor = isCritical
    ? 'text-rose-400 bg-rose-950/60 border-rose-500/50'
    : isHigh
    ? 'text-orange-400 bg-orange-950/60 border-orange-500/50'
    : isMedium
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';

  // SVG Chart path builder for live history buffer
  const chartWidth = 500;
  const chartHeight = 150;
  const points = historyBuffer.slice(-30);

  let riskLinePath = '';
  let riskAreaPath = '';
  let collisionLinePath = '';

  if (points.length > 1) {
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * chartWidth;
      const y = chartHeight - (p.riskScore / 100) * (chartHeight - 20) - 10;
      return { x, y };
    });

    riskLinePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    riskAreaPath = `${riskLinePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    const colCoords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * chartWidth;
      const y = chartHeight - (p.collisionRisk / 100) * (chartHeight - 20) - 10;
      return { x, y };
    });
    collisionLinePath = colCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              AI Risk Engine & Analytics
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic Multi-Factor Hazard Evaluation Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${riskLevelColor}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
            <div>
              <span className="text-[10px] block opacity-75 uppercase">Risk Level</span>
              <span className="text-sm font-bold tracking-wider">{riskLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section: Component Risk Bars (Left) + Overall Score (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Breakdown Bars */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Multi-Factor Risk Telemetry
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Values updated at 60Hz</span>
          </div>

          <div className="space-y-4 font-mono text-xs pt-1">
            {/* Driver Risk */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Driver Risk (DMS Eyes / Attention)</span>
                <span className="text-cyan-300 font-bold">{Math.round(driverRisk)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(5, driverRisk))}%` }}
                />
              </div>
            </div>

            {/* Vehicle Risk */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Vehicle Risk (Kinematics & Systems)</span>
                <span className="text-cyan-300 font-bold">{Math.round(vehicleRisk)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(5, vehicleRisk))}%` }}
                />
              </div>
            </div>

            {/* Collision Risk */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Collision Risk (Kinematic TTC & Proximity)</span>
                <span className="text-rose-400 font-bold">{Math.round(collisionRisk)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(5, collisionRisk))}%` }}
                />
              </div>
            </div>

            {/* Environment Risk */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Environment Risk (Weather & Road Surface)</span>
                <span className="text-cyan-300 font-bold">{Math.round(environmentRisk)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(5, environmentRisk))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Risk Score Card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
              Aggregate Risk Score
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold font-tech text-white glow-cyan font-mono-nums">
                {Math.round(riskScore)}
              </span>
              <span className="text-sm font-mono text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Current Safety Action:
              <strong className="text-cyan-300 block text-sm mt-0.5">{action}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>0 - 24:</span> <span className="text-emerald-400 font-semibold">LOW (Cruising)</span>
            </div>
            <div className="flex justify-between">
              <span>25 - 49:</span> <span className="text-amber-400 font-semibold">MEDIUM (Alert)</span>
            </div>
            <div className="flex justify-between">
              <span>50 - 79:</span> <span className="text-orange-400 font-semibold">HIGH (Speed Reduction)</span>
            </div>
            <div className="flex justify-between">
              <span>80 - 100:</span> <span className="text-rose-400 font-semibold">CRITICAL (Automatic Braking)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Flowchart (Requirement 6) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          AI Risk Engine Architecture & Relationship Flow
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-semibold">
              DRIVER RISK ({Math.round(driverRisk)}%)
            </span>
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-300 font-semibold">
              VEHICLE RISK ({Math.round(vehicleRisk)}%)
            </span>
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-rose-300 font-semibold">
              COLLISION RISK ({Math.round(collisionRisk)}%)
            </span>
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-teal-300 font-semibold">
              ENVIRONMENT RISK ({Math.round(environmentRisk)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">→</span>
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-center">
              AI RISK ENGINE
            </div>
            <span className="text-cyan-400 text-lg">→</span>
            <div className={`px-3 py-1.5 rounded-lg border font-bold text-center ${riskLevelColor}`}>
              {riskLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Risk History Graph (Requirement 6) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Live Risk History Graph
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Aggregate Risk Score
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Collision Risk
            </span>
          </div>
        </div>

        {/* SVG Sparkline / Graph */}
        <div className="w-full h-44 relative bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
          {points.length > 1 ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

              {/* Area & line paths */}
              <path d={riskAreaPath} fill="url(#riskGradient)" />
              <path d={riskLinePath} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
              <path d={collisionLinePath} fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="4,4" />
            </svg>
          ) : (
            <div className="text-xs font-mono text-slate-500">
              Sampling live simulation telemetry stream...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
          <span>Continuous physical sampling • 60-point sliding window</span>
          <span>Target Response Time: &lt; 50 ms</span>
        </div>
      </div>
    </div>
  );
}
