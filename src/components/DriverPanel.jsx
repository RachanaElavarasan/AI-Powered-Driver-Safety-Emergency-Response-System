/**
 * SafePilot AI - Automotive Driver Monitoring System (DMS) Camera Panel
 * 
 * Requirements 4, 5, 6, 7:
 * - Automotive DMS camera-style interface (IR/monochrome night vision look)
 * - Eye State: OPEN / CLOSING / CLOSED / RECOVERED
 * - Blink Count & Blink Rate tracking
 * - EAR (Eye Aspect Ratio) metric & facial landmark tracking reticles
 * - Drowsiness level, Attention, and Driver Risk index
 * - High-visibility non-excessive Drowsiness Alert
 * - ● CAMERA ACTIVE live indicator
 */

import React from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

export default function DriverPanel({ driver }) {
  if (!driver) return null;

  const eyeState = driver.eyeState || 'OPEN';
  const isEyeClosed = eyeState.includes('CLOSED');
  const isClosing = eyeState.includes('CLOSING');
  const isRecovered = eyeState.includes('RECOVERED');
  const isDrowsy = driver.drowsiness === 'HIGH' || driver.drowsiness === 'CRITICAL';
  const isCritical = driver.drowsiness === 'CRITICAL' || driver.driverRisk >= 80;
  const isWarning = driver.drowsiness === 'HIGH' || driver.driverRisk >= 60;

  // Eye Aspect Ratio (EAR): Closed ~ 0.05, Open ~ 0.34
  const ear = driver.ear !== undefined ? driver.ear : (isEyeClosed ? 0.05 : isDrowsy ? 0.16 : 0.32);

  // Aperture height for SVG eye rendering (closed = 3, droopy = 10, open = 20)
  const apertureY = isEyeClosed ? 3 : isClosing ? 7 : isDrowsy ? 11 : 20;

  return (
    <div className={`glass-panel rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl w-72 flex flex-col gap-3 transition-all duration-300 border ${
      isCritical
        ? 'border-red-500/80 bg-red-950/30 shadow-red-500/20'
        : isWarning
        ? 'border-amber-500/60 bg-amber-950/20 shadow-amber-500/10'
        : 'border-cyan-500/20'
    }`}>
      {/* 1. Header: Automotive Driver Monitor Camera Feed */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-tech uppercase tracking-wider text-slate-100">
            Driver Monitor
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold tracking-wider">● CAMERA ACTIVE</span>
        </div>
      </div>

      {/* 2. Driver Camera Viewport (Automotive IR Sensor Visualizer) */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-2.5 flex flex-col items-center justify-center">
        {/* Subtle IR Camera Scanlines / Vignette Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950/80 to-black pointer-events-none" />

        {/* Camera HUD Overlays */}
        <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400 z-10 mb-1 px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            IR DMS-CH1
          </span>
          <span className="text-slate-500">60 FPS • 850nm</span>
        </div>

        {/* Automotive Face Tracking Reticle & Realistic Eye Landmark View */}
        <div className="relative w-44 h-24 flex items-center justify-center z-10">
          {/* Facial Bounding Corner Brackets */}
          <div className="absolute inset-x-2 inset-y-1 border border-cyan-500/30 rounded-lg pointer-events-none">
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />
          </div>

          {/* SVG Driver Eyes & Biometric Landmarks */}
          <svg className="w-40 h-20" viewBox="0 0 160 80">
            {/* Left Eye Landmark Contour */}
            <g transform="translate(15, 15)">
              <path
                d={`M 5 25 Q 25 ${25 - apertureY} 45 25 Q 25 ${25 + apertureY} 5 25 Z`}
                fill={isEyeClosed ? '#3b0707' : '#030712'}
                stroke={isEyeClosed ? '#ef4444' : isDrowsy ? '#f59e0b' : '#00f2ff'}
                strokeWidth="1.8"
                className="transition-all duration-150"
              />
              {!isEyeClosed && (
                <>
                  <circle cx="25" cy="25" r={isDrowsy ? 7 : 9} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="25" cy="25" r={isDrowsy ? 3.5 : 4.5} fill="#00f2ff" />
                  <circle cx="23" cy="23" r="1.5" fill="#ffffff" opacity="0.9" />
                </>
              )}
              {/* Landmark points (6-point eye reticle) */}
              <circle cx="5" cy="25" r="1" fill="#38bdf8" />
              <circle cx="45" cy="25" r="1" fill="#38bdf8" />
              <circle cx="25" cy={25 - apertureY} r="1" fill="#38bdf8" />
              <circle cx="25" cy={25 + apertureY} r="1" fill="#38bdf8" />
            </g>

            {/* Right Eye Landmark Contour */}
            <g transform="translate(95, 15)">
              <path
                d={`M 5 25 Q 25 ${25 - apertureY} 45 25 Q 25 ${25 + apertureY} 5 25 Z`}
                fill={isEyeClosed ? '#3b0707' : '#030712'}
                stroke={isEyeClosed ? '#ef4444' : isDrowsy ? '#f59e0b' : '#00f2ff'}
                strokeWidth="1.8"
                className="transition-all duration-150"
              />
              {!isEyeClosed && (
                <>
                  <circle cx="25" cy="25" r={isDrowsy ? 7 : 9} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="25" cy="25" r={isDrowsy ? 3.5 : 4.5} fill="#00f2ff" />
                  <circle cx="23" cy="23" r="1.5" fill="#ffffff" opacity="0.9" />
                </>
              )}
              {/* Landmark points */}
              <circle cx="5" cy="25" r="1" fill="#38bdf8" />
              <circle cx="45" cy="25" r="1" fill="#38bdf8" />
              <circle cx="25" cy={25 - apertureY} r="1" fill="#38bdf8" />
              <circle cx="25" cy={25 + apertureY} r="1" fill="#38bdf8" />
            </g>

            {/* Center Nose Bridge Axis Marker */}
            <line x1="80" y1="20" x2="80" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="80" cy="40" r="2" fill="#00f2ff" opacity="0.6" />
          </svg>

          {/* Current Eye State Badge */}
          <div className="absolute -bottom-1">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shadow-sm ${
              isCritical
                ? 'bg-red-600 text-white animate-pulse'
                : isEyeClosed
                ? 'bg-red-700 text-white'
                : isDrowsy
                ? 'bg-amber-600 text-slate-950 font-bold'
                : isRecovered
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-cyan-300'
            }`}>
              {eyeState}
            </span>
          </div>
        </div>

        {/* Bottom Camera Sensor Metrics */}
        <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-800/80 z-10 px-1">
          <span>EAR: <strong className="text-cyan-300 font-mono-nums">{ear.toFixed(2)}</strong></span>
          <span>GAZE: <strong className="text-slate-200">FORWARD</strong></span>
          <span>FACE: <strong className="text-emerald-400">99.4%</strong></span>
        </div>
      </div>

      {/* 3. Driver Drowsiness Warning Banner (Requirement 7) */}
      {isWarning && (
        <div className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
          isCritical
            ? 'bg-red-950/80 border-red-500 text-red-100 shadow-md shadow-red-500/30'
            : 'bg-amber-950/80 border-amber-500 text-amber-100 shadow-md shadow-amber-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
            <span className="text-[11px] font-bold font-tech uppercase tracking-wide">
              {isCritical ? '🚨 DRIVER UNRESPONSIVE' : '⚠ DRIVER DROWSINESS DETECTED'}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-300 pl-6 leading-tight">
            {isCritical ? 'Emergency safety protocol initiated.' : 'Please remain alert. Keep eyes focused on road.'}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono pl-6 pt-0.5 font-bold">
            <span className="text-slate-400">Driver Risk:</span>
            <span className={isCritical ? 'text-red-300' : 'text-amber-300'}>
              {isCritical ? 'CRITICAL (96/100)' : 'HIGH (72/100)'}
            </span>
          </div>
        </div>
      )}

      {/* 4. Driver Metrics Specifications List (Requirement 5) */}
      <div className="space-y-1.5 text-xs font-mono">
        {/* Eye State */}
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 text-[11px]">Eye State:</span>
          <span className={`font-semibold text-[11px] ${
            isEyeClosed ? 'text-red-400' : isDrowsy ? 'text-amber-400' : 'text-cyan-300'
          }`}>
            {eyeState}
          </span>
        </div>

        {/* Blink Count & Blink Rate */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400 text-[10px]">Blinks:</span>
            <span className="font-bold font-mono-nums text-white text-[11px]">
              {driver.blinkCount || 0}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400 text-[10px]">Rate:</span>
            <span className={`font-bold text-[10px] ${
              driver.blinkRateStatus === 'HIGH' ? 'text-amber-400' : 'text-slate-200'
            }`}>
              {driver.blinkRateStatus || 'NORMAL'}
            </span>
          </div>
        </div>

        {/* Drowsiness */}
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 text-[11px]">Drowsiness:</span>
          <span className={`font-semibold text-[11px] ${
            isCritical ? 'text-red-400 font-bold' : isDrowsy ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {driver.drowsiness || 'LOW'} ({Math.round(driver.drowsinessPercent || 8)}%)
          </span>
        </div>

        {/* Attention */}
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 text-[11px]">Attention:</span>
          <span className={`font-semibold text-[11px] ${
            driver.attention === 'UNRESPONSIVE' ? 'text-red-400 font-bold' : driver.attention === 'DROWSY' ? 'text-amber-400' : 'text-cyan-300'
          }`}>
            {driver.attention || 'NORMAL'}
          </span>
        </div>

        {/* Driver Risk */}
        <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[11px]">Driver Risk:</span>
            <span className={`font-bold text-[11px] font-mono-nums ${
              driver.driverRisk >= 75 ? 'text-red-400' : driver.driverRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {driver.driverRisk || 8} / 100
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                driver.driverRisk >= 75 ? 'bg-red-500' : driver.driverRisk >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, driver.driverRisk || 8))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
