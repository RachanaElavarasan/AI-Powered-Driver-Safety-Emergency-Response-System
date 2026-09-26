/**
 * SafePilot AI - Risk Map Page
 * Requirement 8:
 * - Map-style visualization of the simulated journey
 * - Markers: 🟢 Safe, 🟡 Moderate, 🔴 Critical
 * - Interactive event inspector showing TTC, Risk, Action, and Location
 * - Connected directly to central simulation state
 */

import React, { useState } from 'react';
import {
  Map,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  Crosshair,
  Layers,
  Info,
} from 'lucide-react';

export default function RiskMapPage({ telemetry }) {
  const { riskMapPoints = [], risk, ttcMetrics, speed, emergency } = telemetry;

  // Selected waypoint on map
  const [selectedPoint, setSelectedPoint] = useState(
    riskMapPoints[riskMapPoints.length - 1] || null
  );

  // Filter markers
  const [filter, setFilter] = useState('ALL');

  const filteredPoints = riskMapPoints.filter((pt) => {
    if (filter === 'SAFE') return pt.riskLevel === 'LOW';
    if (filter === 'MODERATE') return pt.riskLevel === 'MEDIUM';
    if (filter === 'CRITICAL') return pt.riskLevel === 'HIGH' || pt.riskLevel === 'CRITICAL';
    return true;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              Road Risk Map & Spatial Telemetry
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              GPS Trajectory Tracking & Geofenced Hazard Logs
            </p>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Safe
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Moderate
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" /> Critical
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map Canvas (Left) + Event Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                Route Trajectory (Highway US-101 Corridor)
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {['ALL', 'SAFE', 'MODERATE', 'CRITICAL'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    filter === f
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Highway Route Map */}
          <div className="relative w-full h-[400px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-6">
            <svg viewBox="0 0 500 350" className="w-full h-full">
              {/* Background grid */}
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="500" height="350" fill="url(#mapGrid)" />

              {/* Highway Corridor Path */}
              <path
                d="M 50,300 C 120,300 160,240 180,180 C 200,120 280,110 320,160 C 360,210 400,150 450,80"
                fill="none"
                stroke="#334155"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50,300 C 120,300 160,240 180,180 C 200,120 280,110 320,160 C 360,210 400,150 450,80"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeDasharray="6,4"
              />

              {/* Waypoint Markers */}
              {filteredPoints.map((pt, idx) => {
                // Approximate coordinate along path
                const t = (idx + 1) / (riskMapPoints.length + 1);
                const cx = 50 + t * 400;
                const cy = 300 - Math.sin(t * Math.PI * 1.5) * 180 - t * 40;

                const isCrit = pt.riskLevel === 'CRITICAL' || pt.riskLevel === 'HIGH';
                const isMod = pt.riskLevel === 'MEDIUM';
                const fillColor = isCrit ? '#f43f5e' : isMod ? '#f59e0b' : '#10b981';
                const isSelected = selectedPoint?.id === pt.id;

                return (
                  <g
                    key={pt.id}
                    transform={`translate(${cx}, ${cy})`}
                    onClick={() => setSelectedPoint(pt)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected or critical */}
                    {(isSelected || isCrit) && (
                      <circle cx="0" cy="0" r="14" fill="none" stroke={fillColor} strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? '9' : '7'}
                      fill={fillColor}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />

                    <text
                      x="10"
                      y="-8"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="opacity-80 group-hover:opacity-100"
                    >
                      {pt.riskLevel === 'LOW' ? '🟢 Safe' : pt.riskLevel === 'MEDIUM' ? '🟡 Alert' : '🔴 Critical Hazard'}
                    </text>
                  </g>
                );
              })}

              {/* Start & Destination labels */}
              <text x="35" y="325" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                START (Mile 41.2)
              </text>
              <text x="380" y="60" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                DESTINATION
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
            <span>Showing {filteredPoints.length} logged markers along the journey</span>
            <span>Click any marker to inspect incident telemetry</span>
          </div>
        </div>

        {/* Event Details Card (Requirement 8) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                Event Details
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {selectedPoint?.timestamp || 'Live Target'}
              </span>
            </div>

            {selectedPoint ? (
              <div className="mt-4 space-y-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Diagnosis</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedPoint.label || 'Kinematic Risk Event'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TTC MEASUREMENT</span>
                    <span className="text-base font-bold text-cyan-300 font-mono-nums">
                      {selectedPoint.ttc > 90 ? 'Safe' : `${selectedPoint.ttc} s`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">RISK LEVEL</span>
                    <span
                      className={`text-base font-bold uppercase ${
                        selectedPoint.riskLevel === 'CRITICAL' || selectedPoint.riskLevel === 'HIGH'
                          ? 'text-rose-400'
                          : selectedPoint.riskLevel === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedPoint.riskLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">ADAS SAFETY ACTION</span>
                  <div className="mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300">
                    {selectedPoint.action || 'Cruising / Nominal Spacing'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div>Speed at Event: <strong className="text-white">{selectedPoint.speedKmh || Math.round(speed)} km/h</strong></div>
                  <div>Location: <span className="text-slate-300">{emergency.locationName}</span></div>
                  <div>GPS Coordinates: <span className="text-slate-300">{emergency.latitude.toFixed(4)}, {emergency.longitude.toFixed(4)}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Click any marker on the map to display event specifics.
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400 mt-4">
            Markers update dynamically during simulations whenever danger thresholds or safety maneuvers occur.
          </div>
        </div>
      </div>
    </div>
  );
}
