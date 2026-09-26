/**
 * SafePilot AI - AI Perception Dashboard Page
 * Requirement 5:
 * - Objects Detected count & breakdown (Vehicles, Pedestrians, Obstacles)
 * - Object tracking cards with Type, Distance, Relative Speed, Direction, Status
 * - Visual Radar/LiDAR detection grid with live vehicle tracking lines and trajectories
 * - Connected directly to central simulation state
 */

import React from 'react';
import {
  Eye,
  Crosshair,
  Radio,
  Car,
  User,
  AlertTriangle,
  Compass,
  Maximize2,
  Scan,
  ShieldAlert,
} from 'lucide-react';

export default function AIPerceptionPage({ telemetry, onNavigate }) {
  const { detectedObjects = [], objectCounts = {}, hazard, physics, ttcMetrics, risk } = telemetry;

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              AI Perception & Object Detection
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Sensor Fusion (LiDAR, 77GHz RADAR & Front Stereo Camera)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-300">
            Tracking Engine: <span className="font-bold text-white">YOLOv8 + EKF</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
            Latency: <span className="font-bold">14 ms</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Objects Detected</span>
          <span className="text-2xl font-bold font-tech text-cyan-300 font-mono-nums">
            {objectCounts.total ?? detectedObjects.length}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono mt-1">Real-time tracked</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Vehicles</span>
          <span className="text-2xl font-bold font-tech text-white font-mono-nums">
            {objectCounts.vehicles ?? 3}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono mt-1">Passenger & commercial</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Pedestrians</span>
          <span className="text-2xl font-bold font-tech text-amber-300 font-mono-nums">
            {objectCounts.pedestrians ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono mt-1">Crosswalk & shoulder</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Obstacles</span>
          <span className="text-2xl font-bold font-tech text-rose-300 font-mono-nums">
            {objectCounts.obstacles ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono mt-1">Road debris / stationary</span>
        </div>
      </div>

      {/* Main View: Radar Grid (Left) + Detailed Object Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Bird's-Eye Radar & Spatial Tracking */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                RADAR & LiDAR Spatial Map (BEV)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              RANGE: 80 METERS
            </span>
          </div>

          {/* Stylized SVG Bird's Eye Radar Canvas */}
          <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center p-4">
            <svg viewBox="-50 -80 100 100" className="w-full h-full overflow-visible">
              {/* Radar concentric rings */}
              <circle cx="0" cy="0" r="20" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
              <circle cx="0" cy="0" r="40" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
              <circle cx="0" cy="0" r="60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.2" />

              {/* Highway Lanes (x = -15, 0, 15) */}
              <line x1="-15" y1="-80" x2="-15" y2="15" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="15" y1="-80" x2="15" y2="15" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="0" y1="-80" x2="0" y2="15" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />

              {/* Ego Vehicle (Center Base) */}
              <g transform="translate(0, 0)">
                <rect x="-4" y="-8" width="8" height="14" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points="-4,-4 4,-4 0,-12" fill="#38bdf8" opacity="0.8" />
                <circle cx="0" cy="0" r="2" fill="#ffffff" />
                <text x="7" y="0" fill="#38bdf8" fontSize="4" fontFamily="monospace" fontWeight="bold">EGO</text>
              </g>

              {/* Lead Hazard Vehicle */}
              {hazard && (
                <g transform={`translate(${hazard.lane * 15}, ${-Math.min(75, Math.max(8, hazard.distanceM))})`}>
                  {/* Trajectory / closing line */}
                  <line x1="0" y1="0" x2="0" y2={Math.min(75, hazard.distanceM)} stroke={risk.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b'} strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
                  
                  {/* Bounding box */}
                  <rect
                    x="-4.5"
                    y="-8"
                    width="9"
                    height="14"
                    rx="1.5"
                    fill={risk.riskLevel === 'CRITICAL' ? '#881337' : '#78350f'}
                    stroke={risk.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b'}
                    strokeWidth="1.5"
                  />
                  {/* Radar pulse ring */}
                  <circle cx="0" cy="-1" r="9" fill="none" stroke={risk.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b'} strokeWidth="0.6" opacity="0.6" />
                  <text x="6" y="-3" fill={risk.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b'} fontSize="3.5" fontFamily="monospace" fontWeight="bold">
                    {hazard.label} ({hazard.distanceM.toFixed(1)}m)
                  </text>
                </g>
              )}

              {/* Left & Right Surrounding Traffic Vehicles */}
              {telemetry.traffic?.map((car, idx) => {
                const yPos = -Math.min(75, Math.max(-20, car.distanceM));
                const xPos = car.lane * 15;
                return (
                  <g key={car.id || idx} transform={`translate(${xPos}, ${yPos})`}>
                    <rect x="-4" y="-7" width="8" height="13" rx="1.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <text x={xPos > 0 ? 6 : -24} y="-2" fill="#94a3b8" fontSize="3.2" fontFamily="monospace">
                      {car.label} ({Math.abs(car.distanceM).toFixed(0)}m)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Ego Car
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Lead Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Traffic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Collision Zone
            </span>
          </div>
        </div>

        {/* Detailed Detected Objects Cards List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Target Tracking Matrix ({detectedObjects.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Refresh: 60 FPS
            </span>
          </div>

          {detectedObjects.map((obj, index) => {
            const isHazard = index === 0;
            const isCritical = obj.status === 'CRITICAL' || risk.riskLevel === 'CRITICAL';

            return (
              <div
                key={obj.id || index}
                className={`p-4 rounded-xl border font-mono text-xs transition ${
                  isCritical && isHazard
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    : isHazard
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {obj.type === 'PEDESTRIAN' ? (
                      <User className="w-4 h-4 text-rose-400" />
                    ) : obj.type === 'OBSTACLE' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Car className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-bold text-white">{obj.label || obj.type}</span>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-rose-500 text-slate-950 animate-pulse'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {obj.status || 'TRACKING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TYPE</span>
                    <span className="font-semibold text-slate-200">{obj.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DISTANCE</span>
                    <span className="font-semibold text-cyan-300 font-mono-nums">
                      {obj.distanceM} m
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">REL SPEED</span>
                    <span
                      className={`font-semibold font-mono-nums ${
                        obj.relativeSpeedKmh > 0 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {obj.relativeSpeedKmh > 0 ? `+${obj.relativeSpeedKmh}` : obj.relativeSpeedKmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DIRECTION</span>
                    <span className="font-semibold text-slate-200">{obj.direction}</span>
                  </div>
                </div>

                {isHazard && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target Speed: {Math.round(obj.speedKmh || 0)} km/h</span>
                    <span>TTC: <strong className="text-cyan-300">{ttcMetrics.ttc > 90 ? 'SAFE' : `${ttcMetrics.ttc.toFixed(1)}s`}</strong></span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Need full 3D interactive camera perspective?</span>
            <button
              onClick={() => onNavigate('simulation')}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Open 3D Live Simulation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
