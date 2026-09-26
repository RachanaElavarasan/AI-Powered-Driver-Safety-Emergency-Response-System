/**
 * SafePilot AI - Overview Dashboard Page
 * Requirements 2, 3, 4:
 * - Driver greeting & quick status indicators
 * - Today's drive metrics
 * - Current vehicle status card
 * - Dynamic AI Safety Score gauge with components breakdown
 * - Start Live Simulation primary CTA
 * - Live Risk Timeline with Framer Motion animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Car,
  Clock,
  Navigation,
  AlertTriangle,
  Play,
  Activity,
  Cpu,
  Eye,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function OverviewPage({
  telemetry,
  currentUser,
  onStartSimulation,
  onNavigate,
}) {
  const {
    speed,
    risk,
    ttcMetrics,
    driver,
    safetyScore,
    safetyBreakdown,
    eventTimeline,
    vehicleHealth,
    emergency,
  } = telemetry;

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'GOOD MORNING' : currentHour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  const isCritical = risk.riskLevel === 'CRITICAL' || emergency.triggered;
  const isHigh = risk.riskLevel === 'HIGH';

  const vehicleStatusLabel = isCritical ? 'EMERGENCY' : isHigh ? 'CAUTION' : 'SAFE';
  const vehicleStatusColor = isCritical
    ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
    : isHigh
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';

  const driverStatusLabel =
    driver.driverRisk > 60
      ? 'UNRESPONSIVE'
      : driver.driverRisk > 30
      ? 'DROWSY'
      : 'ALERT';
  const driverStatusColor =
    driver.driverRisk > 60
      ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
      : driver.driverRisk > 30
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
      : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';

  const aiSystemStatusLabel = vehicleHealth.camera === 'DEGRADED' ? 'DEGRADED' : 'ONLINE';
  const aiSystemStatusColor =
    vehicleHealth.camera === 'DEGRADED'
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
      : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* 1. Header Greeting & Status Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
            {timeGreeting}, {currentUser?.name || 'ALEX MERCER'}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SafePilot Autonomous ADAS Suite • Active Session • {currentUser?.vehicle || 'SafePilot EV-4'}
          </p>
        </div>

        {/* Quick System Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${vehicleStatusColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-slate-400 text-[11px]">Vehicle:</span>
            <span className="font-bold">{vehicleStatusLabel}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${driverStatusColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-slate-400 text-[11px]">Driver:</span>
            <span className="font-bold">{driverStatusLabel}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${aiSystemStatusColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-slate-400 text-[11px]">AI System:</span>
            <span className="font-bold">{aiSystemStatusLabel}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards: Today's Drive & Current Vehicle Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Today's Drive Summary */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Today's Drive
            </span>
            <Navigation className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">Distance</span>
              <span className="text-base font-bold text-white">24.6 km</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Drive Time</span>
              <span className="text-base font-bold text-white">42 min</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Warnings</span>
              <span className="text-base font-bold text-amber-400">2</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Critical Events</span>
              <span className="text-base font-bold text-emerald-400">0</span>
            </div>
          </div>
        </div>

        {/* Current Vehicle Status */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Current Vehicle Status
            </span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">Speed</span>
              <span className="text-base font-bold text-cyan-300 font-mono-nums">
                {Math.round(speed)} km/h
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Risk</span>
              <span
                className={`text-base font-bold ${
                  risk.riskLevel === 'CRITICAL'
                    ? 'text-rose-400'
                    : risk.riskLevel === 'HIGH'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {risk.riskLevel}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TTC</span>
              <span className="text-base font-bold text-slate-200 font-mono-nums">
                {ttcMetrics.ttc > 90 ? 'SAFE' : `${ttcMetrics.ttc.toFixed(1)} s`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Driver</span>
              <span className="text-base font-bold text-slate-200">
                {driver.attention}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Safety Score Gauge */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              AI Safety Score
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-3xl font-bold font-tech text-white glow-cyan font-mono-nums">
                {safetyScore}
                <span className="text-xs font-mono text-slate-400 font-normal"> / 100</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-mono">
                {safetyScore >= 85 ? 'EXCELLENT SAFETY INDEX' : safetyScore >= 60 ? 'MODERATE RISK INDEX' : 'HIGH RISK INDEX'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400/40 flex items-center justify-center font-bold text-sm text-cyan-300 font-mono bg-cyan-950/40">
              {safetyScore}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-slate-400">
            <div>Driver: <span className="text-slate-200">{safetyBreakdown.driverScore}%</span></div>
            <div>Vehicle: <span className="text-slate-200">{safetyBreakdown.vehicleScore}%</span></div>
            <div>Env: <span className="text-slate-200">{safetyBreakdown.environmentScore}%</span></div>
            <div>Collision: <span className="text-slate-200">{safetyBreakdown.collisionScore}%</span></div>
          </div>
        </div>

        {/* Launch Live Simulation Primary Action */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                3D ADAS Simulation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1.5 leading-relaxed">
              Experience the real-time kinematic vehicle simulation, sensor detection boxes, and automated emergency braking.
            </p>
          </div>

          <button
            onClick={onStartSimulation}
            className="mt-3 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            START LIVE SIMULATION
          </button>
        </div>
      </div>

      {/* 3. Middle Section: Safety Breakdown & Live Risk Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Safety Score Breakdown Component Card */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                Dynamic Safety Score Analysis
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Real-time derivation from active simulation risk telemetry
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-tech text-cyan-400">{safetyScore}</span>
              <span className="text-[10px] block text-slate-500 font-mono">SCORE</span>
            </div>
          </div>

          {/* Component Risk Gauges */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Driver Risk Safety</span>
                <span className="text-cyan-300 font-semibold">{safetyBreakdown.driverScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${safetyBreakdown.driverScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Vehicle Risk Safety</span>
                <span className="text-cyan-300 font-semibold">{safetyBreakdown.vehicleScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                  style={{ width: `${safetyBreakdown.vehicleScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Environment Safety</span>
                <span className="text-cyan-300 font-semibold">{safetyBreakdown.environmentScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${safetyBreakdown.environmentScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Collision Avoidance Safety</span>
                <span className="text-cyan-300 font-semibold">{safetyBreakdown.collisionScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-rose-400 transition-all duration-300"
                  style={{ width: `${safetyBreakdown.collisionScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Risk Response Rule</span>
            </div>
            <p>
              When collision risk spikes or driver attention degrades, the safety score adjusts immediately based on kinematic physics rather than static placeholders.
            </p>
          </div>

          <button
            onClick={() => onNavigate('risk_analysis')}
            className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center justify-center gap-1.5 transition"
          >
            <span>Explore Risk Engine Formula & Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Column: Live Risk Timeline (Requirement 4) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                  Live Risk Timeline
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ACTIVE EVENT STREAM
              </span>
            </div>

            {/* Event Timeline List with Framer Motion */}
            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 pr-1">
              <AnimatePresence initial={false}>
                {eventTimeline.slice(0, 8).map((evt) => {
                  const isCritical = evt.type === 'CRITICAL';
                  const isWarning = evt.type === 'WARNING';
                  const isSuccess = evt.type === 'SUCCESS';

                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`p-2.5 rounded-lg border text-xs font-mono flex items-start justify-between gap-3 ${
                        isCritical
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                          : isWarning
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                          : isSuccess
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono-nums text-slate-400 flex-shrink-0 mt-0.5">
                          {evt.timeStr}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold truncate">{evt.message}</p>
                          {evt.action && (
                            <span className="text-[10px] text-cyan-300/80 block mt-0.5">
                              Action: {evt.action}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0 ${
                          isCritical
                            ? 'bg-rose-500 text-slate-950'
                            : isWarning
                            ? 'bg-amber-500 text-slate-950'
                            : isSuccess
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {evt.type || 'INFO'}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Showing real-time events triggered by driver DMS and hazard sensors</span>
            <button
              onClick={() => onNavigate('simulation_lab')}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Test Scenarios in Lab →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
