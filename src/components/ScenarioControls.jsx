/**
 * SafePilot AI - Scenario Controls & Camera Switcher Bar
 */

import React from 'react';
import {
  ShieldCheck,
  Compass,
  Disc,
  AlertTriangle,
  Zap,
  EyeOff,
  Activity,
  AlertCircle,
  ShieldAlert,
  Siren,
  Camera,
  Eye,
  Crosshair,
  RotateCcw,
} from 'lucide-react';
import { SCENARIOS } from '../simulation/scenarios';
import { CAMERA_MODES } from './VehicleScene';

export default function ScenarioControls({
  activeScenario = SCENARIOS.NORMAL,
  onSelectScenario,
  onResetSimulation,
  cameraMode = CAMERA_MODES.FOLLOW,
  onChangeCameraMode,
}) {
  const scenarioList = [
    {
      id: SCENARIOS.NORMAL,
      label: 'NORMAL',
      icon: ShieldCheck,
      color: 'hover:border-emerald-500 text-emerald-400',
      activeColor: 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/30',
    },
    {
      id: SCENARIOS.MANUAL_STEERING,
      label: 'STEERING',
      icon: Compass,
      color: 'hover:border-cyan-500 text-cyan-400',
      activeColor: 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-cyan-500/30',
    },
    {
      id: SCENARIOS.MANUAL_BRAKING,
      label: 'BRAKE',
      icon: Disc,
      color: 'hover:border-amber-500 text-amber-400',
      activeColor: 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/30',
    },
    {
      id: SCENARIOS.OBSTACLE,
      label: 'OBSTACLE',
      icon: AlertTriangle,
      color: 'hover:border-yellow-500 text-yellow-400',
      activeColor: 'bg-yellow-500/20 border-yellow-500 text-yellow-300 shadow-yellow-500/30',
    },
    {
      id: SCENARIOS.DROWSINESS,
      label: 'DROWSINESS',
      icon: EyeOff,
      color: 'hover:border-amber-500 text-amber-400',
      activeColor: 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/30',
    },
    {
      id: SCENARIOS.REPEATED_BLINKING,
      label: 'RAPID BLINK',
      icon: Activity,
      color: 'hover:border-amber-500 text-amber-400',
      activeColor: 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/30',
    },
    {
      id: SCENARIOS.DROWSINESS_OBSTACLE,
      label: 'COMBINED DEMO',
      icon: ShieldAlert,
      color: 'hover:border-rose-500 text-rose-400',
      activeColor: 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-rose-500/40 animate-pulse',
    },
    {
      id: SCENARIOS.EMERGENCY,
      label: 'EMERGENCY',
      icon: Siren,
      color: 'hover:border-red-500 text-red-400',
      activeColor: 'bg-red-500/20 border-red-500 text-red-300 shadow-red-500/40 animate-pulse',
    },
  ];

  const cameraModes = [
    { id: CAMERA_MODES.DRIVER, label: 'DRIVER VIEW', icon: Eye },
    { id: CAMERA_MODES.FOLLOW, label: 'FOLLOW VEHICLE', icon: Crosshair },
    { id: CAMERA_MODES.TOP, label: 'TOP VIEW', icon: Camera },
  ];

  return (
    <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-3 p-3 glass-panel rounded-2xl border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
      {/* 1. Simulation Scenario Triggers */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        <span className="text-[11px] font-mono text-slate-400 mr-1 uppercase font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          SCENARIO:
        </span>

        {scenarioList.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all duration-200 border cursor-pointer ${
                isActive
                  ? `${sc.activeColor} shadow-lg scale-105 border`
                  : `bg-slate-900/60 border-slate-800 text-slate-300 ${sc.color} hover:bg-slate-800/80`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sc.label}</span>
            </button>
          );
        })}

        {/* 2. Reset Simulation Button */}
        <button
          onClick={onResetSimulation}
          title="Reset simulation to nominal cruising state (Key: R)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all duration-200 border cursor-pointer bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-rose-950/40 hover:border-rose-500/50 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>RESET (R)</span>
        </button>
      </div>

      {/* 3. Camera Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
        <span className="text-[10px] font-mono text-slate-400 px-2 uppercase">CAM:</span>
        {cameraModes.map((cam) => {
          const Icon = cam.icon;
          const isActive = cameraMode === cam.id;

          return (
            <button
              key={cam.id}
              onClick={() => onChangeCameraMode(cam.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cam.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
