/**
 * SafePilot AI - Emergency Center Page
 * Requirement 9:
 * - Emergency Contacts (Primary, Secondary with verified status)
 * - Emergency policy settings toggles
 * - Active Emergency Command Center HUD during incident:
 *   - 🚨 EMERGENCY ACTIVE
 *   - Driver name, Incident diagnosis, Vehicle: STABILIZED, GPS: ACTIVE
 *   - Checklist: ✓ Family Alert Sent, ✓ Primary Contact Called, ✓ Location Shared, ✓ Emergency Response Activated
 * - Real-time prototype simulation disclaimer
 */

import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { telemetryService } from '../services/telemetryService';
import {
  Siren,
  Phone,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Radio,
  FileText,
  RotateCcw,
  Zap,
} from 'lucide-react';

export default function EmergencyCenterPage({ telemetry, currentUser }) {
  const [contacts, setContacts] = useState(authService.getEmergencyContacts());
  const [settings, setSettings] = useState(settingsService.getSettings().emergency);

  const { emergency, physics, driver, risk } = telemetry;
  const isEmergency = emergency.triggered;

  useEffect(() => {
    const unsubAuth = authService.subscribe(({ emergencyContacts }) => {
      setContacts(emergencyContacts);
    });
    const unsubSettings = settingsService.subscribe((s) => {
      setSettings(s.emergency);
    });
    return () => {
      unsubAuth();
      unsubSettings();
    };
  }, []);

  const handleToggleSetting = (key) => {
    settingsService.toggleSetting('emergency', key);
  };

  const handleTriggerTestEmergency = () => {
    telemetryService.triggerEmergency();
  };

  const handleResolveEmergency = () => {
    telemetryService.clearEmergency();
  };

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const secondaryContacts = contacts.filter((c) => c.id !== primaryContact?.id);

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-rose-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-red">
              Emergency Response Center
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              eCall Automated Collision & DMS Escalation Protocol
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEmergency ? (
            <button
              onClick={handleResolveEmergency}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>DISMISS & CLEAR EMERGENCY</span>
            </button>
          ) : (
            <button
              onClick={handleTriggerTestEmergency}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/60 text-rose-300 text-xs font-mono font-bold transition cursor-pointer shadow-lg"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>SIMULATE EMERGENCY TRIGGER</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Live Emergency Banner / HUD (Requirement 9) */}
      {isEmergency && (
        <div className="glass-panel-danger p-6 rounded-2xl border border-rose-500/60 space-y-5 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-7 h-7 text-rose-400 animate-bounce" />
              <div>
                <h2 className="text-lg font-bold font-tech tracking-wider text-rose-200 uppercase glow-red">
                  EMERGENCY ACTIVE
                </h2>
                <p className="text-xs text-rose-300/80 font-mono">
                  Autonomous Vehicle eCall protocol engaged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1 rounded bg-rose-900/60 border border-rose-400/40 text-rose-200 font-bold">
                INCIDENT: {driver.driverRisk > 60 ? 'Driver Unresponsive' : 'Critical Collision Hazard'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <span className="text-[10px] text-slate-400 block uppercase">Emergency Type</span>
              <span className="text-sm font-bold text-red-300 mt-1 block">{emergency.emergencyType || 'Driver Incapacitation'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <span className="text-[10px] text-slate-400 block uppercase">Vehicle</span>
              <span className="text-sm font-bold text-white mt-1 block">SafePilot Vehicle</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <span className="text-[10px] text-slate-400 block uppercase">Driver Status</span>
              <span className="text-sm font-bold text-amber-300 mt-1 block">
                {driver.driverRisk > 60 ? 'Unresponsive (DMS Alert)' : 'Attentive'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <span className="text-[10px] text-slate-400 block uppercase">Vehicle Status</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">
                {physics.speedKmh <= 0.8 ? 'Stabilized / Stopped' : 'Controlled Braking'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">GPS Location</span>
              <span className="text-xs font-bold text-cyan-300 mt-1 block">
                Simulation Location ({emergency.locationName})
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Family Alert</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">SIMULATED (SMS Queued)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Emergency Call</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">SIMULATED (911 CAD Dispatch)</span>
            </div>
          </div>

          {/* Sequential Checklist (Requirement 8) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2.5 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Automated Response Sequence (SIMULATED ONLY - No Real Calls Sent)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Family Alert: SIMULATED (SMS Dispatched)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Emergency Call: SIMULATED ({primaryContact?.name})</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>GPS: Simulation Location ({emergency.latitude.toFixed(4)}, {emergency.longitude.toFixed(4)})</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Nearest Trauma Center: {emergency.hospitalName} ({emergency.hospitalDistanceKm} km)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Middle Section: Emergency Contacts (Left) + Emergency Settings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contacts Directory */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              Designated Emergency Contacts
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Verified Protocol</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Primary Contact */}
            {primaryContact && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold uppercase border border-cyan-800">
                      PRIMARY
                    </span>
                    <span className="font-bold text-white">{primaryContact.name}</span>
                    <span className="text-[10px] text-slate-400">({primaryContact.relationship})</span>
                  </div>
                  <p className="text-slate-300 mt-1 font-mono-nums">{primaryContact.phone}</p>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified</span>
                </div>
              </div>
            )}

            {/* Secondary Contacts */}
            {secondaryContacts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                      SECONDARY
                    </span>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.relationship})</span>
                  </div>
                  <p className="text-slate-300 mt-1 font-mono-nums">{c.phone}</p>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Verified</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] font-mono text-slate-400">
            Contacts can be updated, prioritized, or removed in the <strong>Driver Profile</strong> page.
          </div>
        </div>

        {/* Emergency Policy Settings (Requirement 9) */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Automated Response Settings
            </h2>
            <span className="text-[10px] font-mono text-cyan-400">ACTIVE RULES</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Automatic Family Notification */}
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Automatic family notification</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Sends SMS alert & secure telemetry link to verified primary contacts
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.automaticFamilyNotification}
                onChange={() => handleToggleSetting('automaticFamilyNotification')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* GPS Location Sharing */}
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">GPS location sharing</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Transmits RTK-accurate coordinates to first responders
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.gpsLocationSharing}
                onChange={() => handleToggleSetting('gpsLocationSharing')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Incident Details Sharing */}
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Incident details</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Packages kinematic impact velocity, DMS state, and seatbelt telemetry
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.incidentDetailsSharing}
                onChange={() => handleToggleSetting('incidentDetailsSharing')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Emergency Call Workflow */}
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Emergency call workflow</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Auto-dials local PSAP / 911 / emergency dispatcher when vehicle stabilizes
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyCallWorkflow}
                onChange={() => handleToggleSetting('emergencyCallWorkflow')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[10px] font-mono text-amber-300">
            SIMULATION ONLY: Emergency calls and alerts are simulated locally for platform demonstration. No real messages or 911 calls are placed.
          </div>
        </div>
      </div>
    </div>
  );
}
