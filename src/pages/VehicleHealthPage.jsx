/**
 * SafePilot AI - Vehicle Health & Sensor Status Page
 * Requirements 10 & 11:
 * - Subsystem health breakdown: Battery, Brake System, Engine, Tire Status, GPS, Camera, AI System
 * - Overall SYSTEM HEALTH score gauge
 * - AI Sensor Network status
 * - Simulated Degraded Sensor toggle (Camera Degraded -> Fallback safety mode)
 */

import React from 'react';
import { telemetryService } from '../services/telemetryService';
import {
  Wrench,
  BatteryCharging,
  Cpu,
  Radio,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle,
  Disc,
  Gauge,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function VehicleHealthPage({ telemetry }) {
  const { vehicleHealth, sensors, degradedSensor, physics, risk } = telemetry;

  const handleToggleDegraded = () => {
    telemetryService.toggleDegradedSensor();
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              Vehicle Health & Diagnostic Telemetry
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              On-Board Diagnostics (OBD-II / CAN Bus & ADAS System Telemetry)
            </p>
          </div>
        </div>

        {/* Degraded Sensor Scenario Toggle (Requirement 11) */}
        <button
          onClick={handleToggleDegraded}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
            degradedSensor
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${degradedSensor ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
          <span>{degradedSensor ? 'RESTORE CAMERA SENSOR' : 'SIMULATE DEGRADED CAMERA'}</span>
        </button>
      </div>

      {/* Degraded Sensor Warning Alert (Requirement 11) */}
      {degradedSensor && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 font-mono text-xs flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-100 text-sm">⚠ CAMERA DEGRADED</div>
            <p className="text-amber-300/90 leading-relaxed">
              SafePilot switched to fallback safety mode. Optical target confidence is reduced; automated safety systems are operating with expanded radar safety margins and conservative stopping thresholds.
            </p>
            <span className="text-[10px] text-amber-400/70 block pt-1">
              Simulation demonstration only. Does not represent a certified automotive fail-safe design.
            </span>
          </div>
        </div>
      )}

      {/* Top Health Overview: Overall Health Gauge + Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall System Health Score Gauge */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Overall System Health
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold font-tech text-white glow-cyan font-mono-nums">
                {vehicleHealth.systemHealthScore}%
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {vehicleHealth.systemHealthScore > 90 ? 'OPTIMAL' : 'DEGRADED MODE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Evaluated across 7 critical electronic subroutines
            </p>
          </div>

          <div className="w-14 h-14 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-cyan-950/30">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Battery Telemetry */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              High-Voltage EV Battery
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-tech text-cyan-300 font-mono-nums">
                {vehicleHealth.battery}%
              </span>
              <span className="text-xs font-mono text-slate-400">420V • 78.4 kWh</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Estimated Range: 382 km remaining
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center">
            <BatteryCharging className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Dynamic Braking System State */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Hydraulic & AEB Actuation
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-xl font-bold font-mono ${
                  vehicleHealth.brakeSystem === 'ACTIVE_AEB' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {vehicleHealth.brakeSystem}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Pressure: 142 bar • ABS Response: 8ms
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Disc className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Subsystem Health Grid (Requirement 10) & Sensor Network (Requirement 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subsystems List */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Core Mechanical & Electronic Subsystems
            </h2>
            <span className="text-[10px] font-mono text-slate-500">CAN-Bus Verified</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Battery Management System</span>
                <span className="text-[10px] text-slate-400">Cell balancing & temperature optimal (28°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold font-mono-nums">{vehicleHealth.battery}%</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Brake System</span>
                <span className="text-[10px] text-slate-400">Electronic Brake Booster & AEB solenoids</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{vehicleHealth.brakeSystem}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Electric Powertrain / Engine</span>
                <span className="text-[10px] text-slate-400">Dual-motor torque vectoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{vehicleHealth.engine}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Tire Status (TPMS)</span>
                <span className="text-[10px] text-slate-400">All 4 tires at nominal 36 PSI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{vehicleHealth.tireStatus}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Differential GPS Navigation</span>
                <span className="text-[10px] text-slate-400">Dual-band RTK positioning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{vehicleHealth.gps}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Forward Vision Camera</span>
                <span className="text-[10px] text-slate-400">Stereoscopic optical perception</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${vehicleHealth.camera === 'DEGRADED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {vehicleHealth.camera}
                </span>
                <span className={`w-2 h-2 rounded-full ${vehicleHealth.camera === 'DEGRADED' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">SafePilot Neural AI Inference</span>
                <span className="text-[10px] text-slate-400">On-chip tensor processing core</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{vehicleHealth.aiSystem}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Sensor Network (Requirement 11) */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              AI Sensor Network Architecture
            </h2>
            <span className="text-[10px] font-mono text-cyan-400">7 SENSORS CONNECTED</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Forward Camera Array</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${sensors.camera === 'DEGRADED' ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'bg-emerald-950 text-emerald-400'}`}>
                ● {sensors.camera}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Driver Monitoring System (DMS)</span>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-950 text-emerald-400">
                ● {sensors.driverMonitor}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">RTK Multi-Constellation GPS</span>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-950 text-emerald-400">
                ● {sensors.gps}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Wheel-Speed & IMU Gyro Sensors</span>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-950 text-emerald-400">
                ● {sensors.speedSensor}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">77GHz Collision Warning Radar</span>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-950 text-emerald-400">
                ● {sensors.collisionSensor}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Environment & Ambient Light Sensor</span>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-950 text-emerald-400">
                ● {sensors.environmentSensor}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <span className="text-cyan-300 font-bold block">Telemetry Link Health</span>
            <p>
              Sensor sampling at 100Hz with hardware-accelerated time synchronization. Fallback routines engage automatically in case of visual occlusions or lens degradation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
