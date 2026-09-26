/**
 * SafePilot AI - Simulation Lab Page
 * Requirements 12 & 13:
 * - Interactive testing environment
 * - Title: SAFEPILOT SIMULATION LAB
 * - 8 Scenarios:
 *   - [ NORMAL DRIVE ]
 *   - [ SUDDEN OBSTACLE ]
 *   - [ DROWSY DRIVER ]
 *   - [ VEHICLE CUT-IN ]
 *   - [ SUDDEN BRAKING ]
 *   - [ PEDESTRIAN CROSSING ]
 *   - [ DRIVER UNRESPONSIVE ]
 *   - [ EMERGENCY ]
 * - Simulation controls:
 *   - Simulation Speed slider (0.5x - 2.5x)
 *   - Traffic Density slider (1 - 4 cars)
 *   - Weather selector (CLEAR, RAIN, FOG, NIGHT)
 *   - Road Condition selector (DRY, WET, LOW VISIBILITY, POOR SURFACE)
 * - Selected parameters physically influence central simulation state!
 */

import React from 'react';
import { telemetryService } from '../services/telemetryService';
import { SCENARIOS } from '../simulation/scenarios';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sliders,
  CloudRain,
  Sun,
  Moon,
  CloudFog,
  ShieldCheck,
  AlertTriangle,
  EyeOff,
  Zap,
  CornerDownRight,
  AlertOctagon,
  UserX,
  AlertCircle,
  Siren,
  Gauge,
  Activity,
  ArrowRight,
  Compass,
  Disc,
  ShieldAlert,
} from 'lucide-react';

export default function SimulationLabPage({ telemetry, onNavigate }) {
  const { scenario, simulationControls, environment, risk, ttcMetrics, speed, emergency } =
    telemetry;

  const scenariosList = [
    { key: SCENARIOS.NORMAL, label: 'NORMAL DRIVE', icon: ShieldCheck, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
    { key: SCENARIOS.MANUAL_STEERING, label: 'MANUAL STEERING', icon: Compass, color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20' },
    { key: SCENARIOS.MANUAL_BRAKING, label: 'MANUAL BRAKING', icon: Disc, color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
    { key: SCENARIOS.OBSTACLE, label: 'SUDDEN OBSTACLE', icon: AlertTriangle, color: 'border-yellow-500/40 text-yellow-400 bg-yellow-950/20' },
    { key: SCENARIOS.COLLISION_RISK, label: 'COLLISION RISK', icon: Zap, color: 'border-orange-500/40 text-orange-400 bg-orange-950/20' },
    { key: SCENARIOS.DROWSINESS, label: 'DROWSY DRIVER', icon: EyeOff, color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
    { key: SCENARIOS.REPEATED_BLINKING, label: 'REPEATED BLINKING', icon: Activity, color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
    { key: SCENARIOS.DRIVER_UNRESPONSIVE, label: 'DRIVER UNRESPONSIVE', icon: AlertCircle, color: 'border-purple-500/40 text-purple-400 bg-purple-950/20' },
    { key: SCENARIOS.DROWSINESS_OBSTACLE, label: 'DROWSINESS + OBSTACLE', icon: ShieldAlert, color: 'border-rose-500/50 text-rose-400 bg-rose-950/30' },
    { key: SCENARIOS.EMERGENCY, label: 'EMERGENCY MODE', icon: Siren, color: 'border-red-500/50 text-red-400 bg-red-950/30' },
  ];

  const handleSelectScenario = (key) => {
    telemetryService.setScenario(key);
  };

  const handleSpeedChange = (e) => {
    telemetryService.setSimulationSpeed(parseFloat(e.target.value));
  };

  const handleDensityChange = (e) => {
    telemetryService.setTrafficDensity(parseInt(e.target.value, 10));
  };

  const handleWeatherChange = (e) => {
    telemetryService.setWeather(e.target.value);
  };

  const handleRoadChange = (e) => {
    telemetryService.setRoadCondition(e.target.value);
  };

  const handleReset = () => {
    telemetryService.resetSimulation();
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              SAFEPILOT SIMULATION LAB
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Controlled ADAS Benchmark & Edge-Case Kinematics Testbed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>RESET TO NORMAL</span>
          </button>

          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-tech font-bold tracking-wider transition cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>VIEW 3D SIMULATION</span>
          </button>
        </div>
      </div>

      {/* 1. Scenario Trigger Matrix (8 Scenarios) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Target Scenario Triggers
          </h2>
          <span className="text-[10px] font-mono text-cyan-400">
            ACTIVE SCENARIO: <strong>{scenario}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {scenariosList.map((item) => {
            const Icon = item.icon;
            const isActive = scenario === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleSelectScenario(item.key)}
                className={`p-3.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center text-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : `${item.color} hover:bg-slate-800/80 hover:border-slate-600`
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : ''}`} />
                <span className="tracking-wide text-[11px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Simulation Kinematics & Environment Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Dropdowns */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Kinematic & Environmental Modifiers
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Affects physics engine directly</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Simulation Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Simulation Speed (Time Multiplier)</span>
                <span className="text-cyan-400 font-bold font-mono-nums">
                  {simulationControls.simulationSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.25"
                value={simulationControls.simulationSpeed}
                onChange={handleSpeedChange}
                className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5x (Slow-Motion Kinematics)</span>
                <span>1.0x (Real-Time)</span>
                <span>2.5x (Accelerated Testing)</span>
              </div>
            </div>

            {/* Traffic Density Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Traffic Density</span>
                <span className="text-cyan-400 font-bold font-mono-nums">
                  {simulationControls.trafficDensity} Active Vehicles
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={simulationControls.trafficDensity}
                onChange={handleDensityChange}
                className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Sparse / Open Road)</span>
                <span>2 (Standard Highway)</span>
                <span>4 (Heavy Traffic Corridor)</span>
              </div>
            </div>

            {/* Weather Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block text-[11px]">
                  Atmospheric Weather
                </label>
                <select
                  value={environment.weather}
                  onChange={handleWeatherChange}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer focus:border-cyan-400 focus:outline-none"
                >
                  <option value="CLEAR">☀ Clear Daylight / Ambient</option>
                  <option value="RAIN">🌧 Heavy Rain (Reduced Grip)</option>
                  <option value="FOG">🌫 Dense Fog (Low Visibility)</option>
                </select>
              </div>

              {/* Road Condition Dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block text-[11px]">
                  Road Surface Condition
                </label>
                <select
                  value={environment.roadCondition}
                  onChange={handleRoadChange}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer focus:border-cyan-400 focus:outline-none"
                >
                  <option value="DRY">DRY (Nominal Friction μ = 0.9)</option>
                  <option value="WET">WET (Reduced Friction μ = 0.6)</option>
                  <option value="LOW_VISIBILITY">LOW VISIBILITY (Night / Dense)</option>
                  <option value="POOR_SURFACE">POOR SURFACE (Gravel / Rough)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Parameter Impact Diagnostics */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Physics & Risk Impact
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">STREAMING</span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block">Active Environment Factor</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-sm">
                    {environment.weather} / {environment.roadCondition}
                  </span>
                  <span className="text-cyan-300 font-bold font-mono-nums">
                    Env Risk: {environment.environmentRisk}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  {environment.weather === 'RAIN'
                    ? 'Rain detected: Stopping distances increase by 30%. AEB triggering thresholds shift to conservative buffers.'
                    : environment.weather === 'FOG'
                    ? 'Dense fog active: Visibility restricted to 180m. Camera sensor confidence downgraded.'
                    : 'Clear ambient conditions: Baseline friction coefficient and optical confidence active.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">EGO SPEED</span>
                  <span className="text-base font-bold text-white font-mono-nums">{Math.round(speed)} km/h</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TIME-TO-COLLISION</span>
                  <span className="text-base font-bold text-cyan-300 font-mono-nums">
                    {ttcMetrics.ttc > 90 ? 'SAFE' : `${ttcMetrics.ttc.toFixed(1)} s`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulation')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
          >
            <span>Observe Vehicle in 3D Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
