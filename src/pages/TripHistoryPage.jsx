/**
 * SafePilot AI - Trip History Page
 * Requirement 7:
 * - Grouped trip logs (Today, Yesterday, previous)
 * - Clickable trip items
 * - Trip details modal/view:
 *   - Speed graph
 *   - TTC graph
 *   - Risk graph
 *   - Braking events
 *   - Drowsiness events
 *   - Detected hazards
 *   - Emergency events
 * - Modular architecture via tripService
 */

import React, { useState } from 'react';
import { tripService } from '../services/tripService';
import {
  History,
  Calendar,
  Clock,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  EyeOff,
  UserCheck,
  PlusCircle,
} from 'lucide-react';

export default function TripHistoryPage({ telemetry }) {
  const [trips, setTrips] = useState(tripService.getTrips());
  const [selectedTrip, setSelectedTrip] = useState(trips[0] || null);

  const handleSaveCurrentTrip = () => {
    const newTrip = tripService.addTrip({
      distanceKm: 8.4,
      durationMin: 18,
      safetyScore: telemetry.safetyScore,
      warnings: telemetry.eventTimeline.filter((e) => e.type === 'WARNING').length,
      criticalEvents: telemetry.eventTimeline.filter((e) => e.type === 'CRITICAL').length,
      weather: telemetry.environment.weather,
      road: telemetry.environment.roadCondition,
      speedHistory: telemetry.historyBuffer.map((h) => h.speed),
      ttcHistory: telemetry.historyBuffer.map((h) => h.ttc),
      riskHistory: telemetry.historyBuffer.map((h) => h.riskScore),
    });
    setTrips(tripService.getTrips());
    setSelectedTrip(newTrip);
  };

  const renderSimpleGraph = (data = [], color = '#06b6d4', maxValue = 100, label = '') => {
    if (!data || data.length === 0) return <div className="text-xs text-slate-500 font-mono py-4">No data points logged</div>;
    const width = 320;
    const height = 80;
    const pointsStr = data
      .map((val, idx) => {
        const x = (idx / Math.max(1, data.length - 1)) * width;
        const clampedVal = Math.min(maxValue, Math.max(0, val));
        const y = height - (clampedVal / maxValue) * (height - 12) - 6;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>{label}</span>
          <span className="text-white font-bold">{data[data.length - 1]}</span>
        </div>
        <div className="w-full h-20 bg-slate-900/80 rounded-lg p-1.5 border border-slate-800">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="2" points={pointsStr} />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              Trip History & Telemetry Archive
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Indexed Black-Box Logs & ADAS Safety Reports
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveCurrentTrip}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>Save Current Simulation Session</span>
        </button>
      </div>

      {/* Main Grid: Trips List (Left) + Selected Trip Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trips List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
              Recorded Trips ({trips.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Tap to inspect telemetry</span>
          </div>

          <div className="space-y-2.5">
            {trips.map((trip) => {
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-4 rounded-xl border font-mono text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white tracking-wide">{trip.dateLabel}</span>
                      <span className="text-slate-400 text-[11px]">• {trip.timeLabel}</span>
                    </div>
                    <span className="text-xs font-bold text-cyan-300 font-mono-nums flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {trip.safetyScore} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">DISTANCE</span>
                      <span className="text-slate-200 font-semibold">{trip.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">DURATION</span>
                      <span className="text-slate-200 font-semibold">{trip.durationMin} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">WARNINGS</span>
                      <span className="text-amber-400 font-semibold">{trip.warnings}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Trip Detailed Telemetry & Graphs */}
        {selectedTrip && (
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">
                    {selectedTrip.dateLabel} • {selectedTrip.timeLabel}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    SAFETY SCORE: {selectedTrip.safetyScore}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  {selectedTrip.startLocation} → {selectedTrip.endLocation}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Weather: {selectedTrip.weather}
                </span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Road: {selectedTrip.road}
                </span>
              </div>
            </div>

            {/* Graphs Grid: Speed, TTC, Risk (Requirement 7) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderSimpleGraph(selectedTrip.speedHistory, '#38bdf8', 65, 'Speed Curve (km/h)')}
              {renderSimpleGraph(selectedTrip.ttcHistory, '#f59e0b', 12, 'Closing TTC (s)')}
              {renderSimpleGraph(selectedTrip.riskHistory, '#f43f5e', 100, 'Risk Profile (%)')}
            </div>

            {/* Event Logs: Braking, Drowsiness, Hazards, Emergency */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                Recorded Incident Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {/* Braking Events */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Braking Events ({selectedTrip.brakingEvents?.length || 0})</span>
                  </div>
                  {selectedTrip.brakingEvents?.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No emergency braking engaged</p>
                  ) : (
                    selectedTrip.brakingEvents?.map((b, i) => (
                      <div key={i} className="text-[11px] border-l-2 border-cyan-500 pl-2 py-0.5 space-y-0.5">
                        <span className="text-slate-400 font-semibold">{b.time} — {b.trigger}</span>
                        <p className="text-[10px] text-slate-500">Deceleration: {b.speedBefore} → {b.speedAfter} km/h ({b.severity})</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Drowsiness Events */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Drowsiness Events ({selectedTrip.drowsinessEvents?.length || 0})</span>
                  </div>
                  {selectedTrip.drowsinessEvents?.length === 0 ? (
                    <p className="text-[11px] text-slate-500">Driver remained 100% attentive</p>
                  ) : (
                    selectedTrip.drowsinessEvents?.map((d, i) => (
                      <div key={i} className="text-[11px] border-l-2 border-amber-500 pl-2 py-0.5 space-y-0.5">
                        <span className="text-slate-400 font-semibold">{d.time} — Eye state: {d.eyeState}</span>
                        <p className="text-[10px] text-slate-500">Duration: {d.durationSec}s (Auditory warning issued)</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Detected Hazards */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Detected Hazards ({selectedTrip.detectedHazards?.length || 0})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTrip.detectedHazards?.map((h, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px]">
                        <span className="text-slate-300 font-bold block">{h.time} — {h.type}</span>
                        <span className="text-slate-500">Distance: {h.distanceM}m | Rel Speed: {h.relativeSpeedKmh} km/h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
