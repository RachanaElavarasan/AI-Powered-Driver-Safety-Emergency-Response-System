/**
 * SafePilot AI - Interactive Vehicle Steering & Brake Control Panel
 * 
 * Requirements 2, 3, 10, 15:
 * - STEER LEFT (Press/Hold/Click or 'A' / Left Arrow)
 * - STEER RIGHT (Press/Hold/Click or 'D' / Right Arrow)
 * - CENTER STEERING (Click or Center button)
 * - BRAKE (Press/Hold/Click or 'SPACE')
 * - Real-time Steering Angle gauge (-28° to +28°)
 * - Live Speed & Brake Force Readouts
 * - Automatic Safety Control Active indicator
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Disc,
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

export default function SteeringControl({ physics, automaticControl = false }) {
  const [isPressingLeft, setIsPressingLeft] = useState(false);
  const [isPressingRight, setIsPressingRight] = useState(false);
  const [isPressingBrake, setIsPressingBrake] = useState(false);

  const steeringAngle = physics.steeringAngle || 0;
  const speedKmh = Math.round(physics.speedKmh || 0);
  const isBraking = (physics.brakingPercent || 0) > 5;
  const currentLane = physics.currentLane || 'CENTER LANE';

  // Handle continuous steering while holding button
  useEffect(() => {
    if (isPressingLeft) {
      telemetryService.steer(-1);
    } else if (isPressingRight) {
      telemetryService.steer(1);
    } else if (!isPressingLeft && !isPressingRight) {
      // Natural recentering occurs in physics engine
      if (physics.steeringInput !== 0) {
        telemetryService.steer(0);
      }
    }
  }, [isPressingLeft, isPressingRight]);

  // Handle continuous braking while holding button
  useEffect(() => {
    if (isPressingBrake) {
      telemetryService.setManualBrake(true, 90);
    } else {
      telemetryService.setManualBrake(false, 0);
    }
  }, [isPressingBrake]);

  // Global Keyboard listener for A / D / Space (Requirement 15)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setIsPressingLeft(true);
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setIsPressingRight(true);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPressingBrake(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setIsPressingLeft(false);
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setIsPressingRight(false);
      } else if (e.key === ' ' || e.code === 'Space') {
        setIsPressingBrake(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className={`glass-panel rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl w-72 flex flex-col gap-3 transition-all duration-300 border ${
      automaticControl
        ? 'border-amber-500/50 bg-amber-950/20 shadow-amber-500/10'
        : 'border-cyan-500/20'
    }`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-tech uppercase tracking-wider text-slate-100">
            Vehicle Control
          </h2>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
          automaticControl
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        }`}>
          {automaticControl ? 'AI SAFETY CONTROL' : 'MANUAL DRIVER'}
        </span>
      </div>

      {/* Visual Steering Angle Gauge */}
      <div className="relative p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
        {/* Animated Steering Arc */}
        <div className="relative w-36 h-14 flex items-center justify-center overflow-hidden">
          <svg className="w-36 h-20 -mb-6" viewBox="0 0 120 70">
            {/* Background Track Arc */}
            <path
              d="M 15 60 A 45 45 0 0 1 105 60"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Center tick */}
            <line x1="60" y1="12" x2="60" y2="20" stroke="#00f2ff" strokeWidth="2" />
            {/* Left max tick */}
            <line x1="22" y1="52" x2="28" y2="48" stroke="#64748b" strokeWidth="1.5" />
            {/* Right max tick */}
            <line x1="98" y1="52" x2="92" y2="48" stroke="#64748b" strokeWidth="1.5" />

            {/* Dynamic Needle */}
            <g transform={`rotate(${steeringAngle * 1.6}, 60, 60)`} className="transition-transform duration-75">
              <line x1="60" y1="60" x2="60" y2="18" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="18" r="3.5" fill="#00f2ff" />
            </g>
          </svg>
        </div>

        {/* Steering Angle Digital Metric */}
        <div className="flex items-center justify-between w-full text-[11px] font-mono mt-1 pt-1.5 border-t border-slate-800/80">
          <span className="text-slate-400">STEERING:</span>
          <span className={`font-bold font-mono-nums ${
            Math.abs(steeringAngle) > 2 ? 'text-cyan-300' : 'text-slate-300'
          }`}>
            {steeringAngle > 0 ? `+${steeringAngle}°` : `${steeringAngle}°`}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            {steeringAngle > 1 ? 'RIGHT' : steeringAngle < -1 ? 'LEFT' : 'CENTER'}
          </span>
        </div>
      </div>

      {/* Steering Buttons: STEER LEFT, CENTER, STEER RIGHT */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onMouseDown={() => setIsPressingLeft(true)}
          onMouseUp={() => setIsPressingLeft(false)}
          onMouseLeave={() => setIsPressingLeft(false)}
          onTouchStart={() => setIsPressingLeft(true)}
          onTouchEnd={() => setIsPressingLeft(false)}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer select-none active:scale-95 ${
            isPressingLeft
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
              : 'bg-slate-900/80 border-slate-700/80 text-cyan-300 hover:bg-slate-800'
          }`}
          title="Steer vehicle toward left lane (Key: A or Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">◀ LEFT</span>
        </button>

        <button
          type="button"
          onClick={() => telemetryService.centerSteering()}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer select-none active:scale-95 bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800"
          title="Center steering wheel to 0°"
        >
          <RotateCcw className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
          <span className="text-[10px]">CENTER</span>
        </button>

        <button
          type="button"
          onMouseDown={() => setIsPressingRight(true)}
          onMouseUp={() => setIsPressingRight(false)}
          onMouseLeave={() => setIsPressingRight(false)}
          onTouchStart={() => setIsPressingRight(true)}
          onTouchEnd={() => setIsPressingRight(false)}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer select-none active:scale-95 ${
            isPressingRight
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
              : 'bg-slate-900/80 border-slate-700/80 text-cyan-300 hover:bg-slate-800'
          }`}
          title="Steer vehicle toward right lane (Key: D or Right Arrow)"
        >
          <ArrowRight className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">RIGHT ▶</span>
        </button>
      </div>

      {/* BRAKE Control Button (Requirement 3) */}
      <button
        type="button"
        onMouseDown={() => setIsPressingBrake(true)}
        onMouseUp={() => setIsPressingBrake(false)}
        onMouseLeave={() => setIsPressingBrake(false)}
        onTouchStart={() => setIsPressingBrake(true)}
        onTouchEnd={() => setIsPressingBrake(false)}
        className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all duration-150 cursor-pointer select-none active:scale-98 shadow-md ${
          isBraking || isPressingBrake
            ? 'bg-red-600 border-red-400 text-white shadow-red-600/40 glow-red animate-pulse'
            : 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/60 hover:border-red-400'
        }`}
        title="Hold to apply manual braking deceleration (Key: SPACE)"
      >
        <Disc className={`w-4 h-4 ${isBraking ? 'animate-spin' : ''}`} />
        <span>[ BRAKE PEDAL ]</span>
        {isBraking && <span className="text-[10px] bg-red-800 px-1.5 py-0.5 rounded">ACTIVE</span>}
      </button>

      {/* Telemetry Status Rows */}
      <div className="space-y-1 text-xs font-mono pt-1 border-t border-slate-800 text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Speed:</span>
          <span className="font-bold text-white font-mono-nums">{speedKmh} km/h</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Brake:</span>
          <span className={`font-bold ${isBraking ? 'text-red-400' : 'text-slate-400'}`}>
            {isBraking ? `ACTIVE (${physics.brakingPercent}%)` : 'OFF'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Current Lane:</span>
          <span className="text-cyan-300 font-semibold text-[11px]">{currentLane}</span>
        </div>
      </div>

      {/* Keyboard Controls Footnote */}
      <div className="text-[9px] font-mono text-slate-500 text-center pt-1 border-t border-slate-800/60">
        Keyboard: <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-400">A</kbd> Steer L • <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-400">D</kbd> Steer R • <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-400">SPACE</kbd> Brake
      </div>
    </div>
  );
}
