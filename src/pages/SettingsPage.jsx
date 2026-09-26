/**
 * SafePilot AI - Settings Page
 * Requirement 16:
 * - Driver Preferences: Voice Alerts, Warning Notifications
 * - Emergency Rules: Automatic Family Notification, GPS Sharing, Emergency Call Workflow
 * - Simulation Visualization: Detection Boxes, TTC Display, Trajectory, Radar, Tracking Lines
 * - Local persistence via settingsService
 */

import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import {
  Settings,
  Volume2,
  Bell,
  Siren,
  Eye,
  Sliders,
  RotateCcw,
  Check,
  Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const unsub = settingsService.subscribe((s) => {
      setSettings(s);
    });
    return () => unsub();
  }, []);

  const handleToggle = (category, key) => {
    settingsService.toggleSetting(category, key);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleReset = () => {
    settingsService.resetToDefaults();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              SafePilot System Settings
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Driver Preferences, Emergency Automation & Sensor Overlay Config
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5" /> Saved to storage
            </span>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Driver Preferences */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Driver Preferences
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Voice Alerts</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Natural-language vocal warning during rapid TTC drop
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.driverPreferences.voiceAlerts}
                onChange={() => handleToggle('driverPreferences', 'voiceAlerts')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Warning Notifications</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Visual HUD flash banners when entering HIGH risk
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.driverPreferences.warningNotifications}
                onChange={() => handleToggle('driverPreferences', 'warningNotifications')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Auto Cruise Resume</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Automatically resumes 48 km/h cruise after hazard clears
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.driverPreferences.autoCruiseResume}
                onChange={() => handleToggle('driverPreferences', 'autoCruiseResume')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 2. Emergency Rules */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400" />
              Emergency Automation
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Automatic Family Notification</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Auto-SMS primary contact upon AEB stop
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergency.automaticFamilyNotification}
                onChange={() => handleToggle('emergency', 'automaticFamilyNotification')}
                className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">GPS Location Sharing</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Include RTK coordinates in emergency dispatch
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergency.gpsLocationSharing}
                onChange={() => handleToggle('emergency', 'gpsLocationSharing')}
                className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Emergency Call Workflow</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Simulate eCall connection to dispatch
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergency.emergencyCallWorkflow}
                onChange={() => handleToggle('emergency', 'emergencyCallWorkflow')}
                className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Simulation Visualization Overlays */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Simulation Visual Overlays
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Detection Boxes</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Render 3D bounding boxes around targets
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationVisualization.detectionBoxes}
                onChange={() => handleToggle('simulationVisualization', 'detectionBoxes')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">TTC Display</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Show floating time-to-collision badge on lead vehicle
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationVisualization.ttcDisplay}
                onChange={() => handleToggle('simulationVisualization', 'ttcDisplay')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Trajectory Projection</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Show lane centerline forward guidance beam
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationVisualization.trajectory}
                onChange={() => handleToggle('simulationVisualization', 'trajectory')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Radar Sensor Sweep</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Render 77GHz microwave radar cone overlay
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationVisualization.radar}
                onChange={() => handleToggle('simulationVisualization', 'radar')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
              <div>
                <span className="font-bold text-white block">Tracking Distance Lines</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Project dashed spatial distance lines between bumpers
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.simulationVisualization.trackingLines}
                onChange={() => handleToggle('simulationVisualization', 'trackingLines')}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
