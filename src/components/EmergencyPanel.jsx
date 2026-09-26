/**
 * SafePilot AI - Emergency Response HUD & Animated GPS Map
 * Activates following critical safety events:
 * - Checklist: Vehicle Stabilized, GPS Locked, eCall Triggered, Nearest Help Identified
 * - Animated vector GPS route map connecting vehicle to trauma center
 */

import React from 'react';
import {
  Siren,
  CheckCircle2,
  RotateCcw,
  Navigation,
  Loader2,
  Users,
} from 'lucide-react';
import { authService } from '../services/authService';

export default function EmergencyPanel({ emergency, onDismiss }) {
  if (!emergency || !emergency.triggered) return null;
  const contacts = authService.getEmergencyContacts();
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-panel-danger rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-red-500/60 flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500 text-red-400 animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech uppercase tracking-wider text-red-100 glow-red">
                EMERGENCY RESPONSE PROTOCOL
              </h2>
              <p className="text-xs font-mono text-red-300">
                Type: {emergency.emergencyType || 'Driver Incapacitation'} • SIMULATION
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-red-600 text-white animate-pulse">
            eCALL (SIMULATED)
          </span>
        </div>

        {/* Telemetry Status Summary (Requirement 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-950/70 p-2.5 rounded-xl border border-red-500/30">
          <div>
            <span className="text-slate-400 text-[10px] block">Emergency Type:</span>
            <span className="font-bold text-red-300">{emergency.emergencyType || 'Driver Incapacitation'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Vehicle:</span>
            <span className="font-bold text-white">SafePilot Vehicle</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Driver Status:</span>
            <span className="font-bold text-amber-300">Unresponsive</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Vehicle Status:</span>
            <span className="font-bold text-emerald-400">{emergency.vehicleStabilized ? 'Stabilized / Stopped' : 'Controlled Braking'}</span>
          </div>
        </div>

        {/* Step-by-Step Response Checklist (Prompt Requirement 8) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* Step 1: Vehicle Stabilized */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            {emergency.vehicleStabilized ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            )}
            <div>
              <div className="font-semibold text-white">✓ Vehicle Stabilized</div>
              <div className="text-[10px] text-slate-400">
                {emergency.vehicleStabilized ? 'Halted 0.0 km/h with safe buffer' : 'Engaging AEB deceleration...'}
              </div>
            </div>
          </div>

          {/* Step 2: GPS Location Captured */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            {emergency.gpsLocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            )}
            <div>
              <div className="font-semibold text-white">✓ GPS Location Captured</div>
              <div className="text-[10px] text-slate-400">
                {emergency.gpsLocked ? emergency.locationName : 'Acquiring RTK satellite lock...'}
              </div>
            </div>
          </div>

          {/* Step 3: Emergency Alert Triggered */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            {emergency.alertDispatched ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            )}
            <div>
              <div className="font-semibold text-white">✓ Emergency Alert Triggered</div>
              <div className="text-[10px] text-slate-400">
                {emergency.alertDispatched ? 'eCall 911 CAD Dispatch Active' : 'Connecting to emergency dispatch...'}
              </div>
            </div>
          </div>

          {/* Step 4: Nearest Help Identified */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            {emergency.nearestHelpIdentified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            )}
            <div>
              <div className="font-semibold text-white">✓ Nearest Help Identified</div>
              <div className="text-[10px] text-slate-400">
                {emergency.nearestHelpIdentified
                  ? `${emergency.hospitalName} (${emergency.hospitalDistanceKm} km)`
                  : 'Locating closest trauma center...'}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Contact Notified Notification (Requirement 15) */}
        {primaryContact && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Emergency Contact Notified: <strong className="text-white">{primaryContact.name} ({primaryContact.relationship})</strong>
            </span>
            <span className="text-emerald-400 text-[10px] font-bold">SMS DISPATCHED</span>
          </div>
        )}

        {/* Animated GPS Mini-Map Panel */}
        <div className="relative w-full h-44 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden p-2 flex flex-col justify-between">
          {/* Schematic SVG Map with Route Line */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2ff" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Background Grid Pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Stylized Highway Curves */}
            <path
              d="M 20 150 Q 150 110 260 90 T 520 40"
              fill="none"
              stroke="#334155"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 20 150 Q 150 110 260 90 T 520 40"
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Animated Pulsing Route Line from Vehicle to Hospital */}
            <path
              d="M 120 125 C 180 110, 240 70, 390 55"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="4"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            {/* Vehicle Location Pin (Start) */}
            <g transform="translate(120, 125)">
              <circle r="12" fill="#00f2ff" opacity="0.25" className="animate-ping" />
              <circle r="6" fill="#00f2ff" stroke="#ffffff" strokeWidth="2" />
              <text x="12" y="4" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                Ego Vehicle (STOPPED)
              </text>
            </g>

            {/* Nearest Hospital Pin (End) */}
            <g transform="translate(390, 55)">
              <circle r="14" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x="-160" y="-10" fill="#fca5a5" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                {emergency.hospitalName} ({emergency.hospitalEtaMin} min ETA)
              </text>
            </g>
          </svg>

          {/* Map telemetry footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-1 rounded backdrop-blur">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              COORDINATES: {emergency.latitude}° N, {emergency.longitude}° W
            </span>
            <span className="text-emerald-400 font-bold">ROUTE CALIBRATED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resume Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
