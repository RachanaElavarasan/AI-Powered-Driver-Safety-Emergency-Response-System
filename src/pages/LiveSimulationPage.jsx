/**
 * SafePilot AI - Live Simulation Page
 * 
 * Preserves the full 3D interactive driving scene:
 * - 3D vehicle simulation with active front wheel steering and braking
 * - Road/environment and traffic vehicles
 * - Perception overlays & laser rangefinder
 * - Time-To-Collision (TTC) & multi-lane collision avoidance
 * - Control Hierarchy Display (NORMAL -> WARNING -> HIGH RISK -> CRITICAL -> EMERGENCY)
 * - Interactive Steering & Brake Control panel (A / D / SPACE)
 * - Automotive Driver Monitoring System (DMS) IR camera panel
 * - Drowsiness warning banner & Emergency response modal
 */

import React, { useState } from 'react';
import VehicleScene, { CAMERA_MODES } from '../components/VehicleScene';
import TelemetryPanel from '../components/TelemetryPanel';
import SteeringControl from '../components/SteeringControl';
import DriverPanel from '../components/DriverPanel';
import RiskEngine from '../components/RiskEngine';
import ScenarioControls from '../components/ScenarioControls';
import EmergencyPanel from '../components/EmergencyPanel';
import ControlHierarchyBadge from '../components/ControlHierarchyBadge';
import { telemetryService } from '../services/telemetryService';
import { SCENARIOS } from '../simulation/scenarios';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function LiveSimulationPage({
  telemetry,
  cameraMode,
  onChangeCameraMode,
  onResetSimulation,
}) {
  const [showEmergencyModal, setShowEmergencyModal] = useState(true);

  const {
    physics,
    hazard,
    traffic,
    driver,
    environment,
    ttcMetrics,
    risk,
    emergency,
    controlHierarchy,
    automaticControl,
  } = telemetry;

  const handleSelectScenario = (scenarioKey) => {
    telemetryService.setScenario(scenarioKey);
    setShowEmergencyModal(true);
  };

  const isDrowsinessWarning = driver?.drowsiness === 'HIGH' || driver?.warningActive;
  const isDriverCritical = driver?.drowsiness === 'CRITICAL' || emergency.triggered;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* 1. Interactive 3D Driving Scene (Full Screen Canvas) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <VehicleScene
          physics={physics}
          hazard={hazard}
          traffic={traffic}
          ttc={ttcMetrics}
          risk={risk}
          cameraMode={cameraMode}
          environment={environment}
        />

        {/* 2. Top Header HUD: Control Hierarchy & Active Safety Bar (Requirement 10) */}
        <header className="absolute top-3 left-4 right-4 z-20 pointer-events-auto flex flex-col items-center gap-2">
          <div className="w-full max-w-5xl">
            <ControlHierarchyBadge
              hierarchy={controlHierarchy || 'NORMAL'}
              automaticControl={automaticControl}
              brakingActive={(physics.brakingPercent > 10) || physics.brakeActive}
            />
          </div>

          {/* Prominent Driver Drowsiness Warning Banner (Requirement 7) */}
          {(isDrowsinessWarning || isDriverCritical) && !emergency.triggered && (
            <div className={`w-full max-w-xl p-2.5 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
              isDriverCritical
                ? 'bg-red-950/90 border-red-500 text-white shadow-red-500/30'
                : 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-500/20'
            }`}>
              <div className="flex items-center gap-2.5">
                {isDriverCritical ? (
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold font-tech uppercase tracking-wider">
                    {isDriverCritical ? '🚨 CRITICAL DRIVER UNRESPONSIVENESS' : '⚠ DRIVER DROWSINESS DETECTED'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-300">
                    {isDriverCritical
                      ? 'AI safety controller initiating controlled deceleration and emergency protocol.'
                      : 'Please remain alert. High fatigue index registered by DMS camera.'}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                isDriverCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
              }`}>
                Risk: {driver.driverRisk}/100
              </span>
            </div>
          )}
        </header>

        {/* 3. Floating Left HUD: Live Telemetry & Interactive Vehicle Control */}
        <aside className="absolute top-18 left-4 z-20 pointer-events-auto flex flex-col gap-3 max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar pb-6">
          <TelemetryPanel
            physics={physics}
            hazard={hazard}
            ttc={ttcMetrics}
            risk={risk}
          />

          {/* Interactive Steering & Brake Controls (Requirements 2, 3) */}
          <SteeringControl
            physics={physics}
            automaticControl={automaticControl}
          />
        </aside>

        {/* 4. Floating Right HUD: Driver Monitoring System (DMS) Camera Panel */}
        <aside className="absolute top-18 right-4 z-20 pointer-events-auto">
          <DriverPanel driver={driver} />
        </aside>

        {/* 5. Center Bottom HUD: AI Risk Engine */}
        <section className="absolute bottom-22 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[92%] max-w-xl">
          <RiskEngine risk={risk} ttc={ttcMetrics} />
        </section>

        {/* 6. Bottom Navigation: Scenario Selector & Camera Switcher */}
        <footer className="absolute bottom-3 left-4 right-4 z-30 pointer-events-auto">
          <ScenarioControls
            activeScenario={telemetry.scenario}
            onSelectScenario={handleSelectScenario}
            onResetSimulation={onResetSimulation}
            cameraMode={cameraMode}
            onChangeCameraMode={onChangeCameraMode}
          />
        </footer>

        {/* 7. Emergency Response Modal (shown when critical event triggered) */}
        {showEmergencyModal && emergency.triggered && (
          <EmergencyPanel
            emergency={emergency}
            onDismiss={() => {
              setShowEmergencyModal(false);
              telemetryService.setScenario(SCENARIOS.NORMAL);
            }}
          />
        )}
      </main>
    </div>
  );
}
