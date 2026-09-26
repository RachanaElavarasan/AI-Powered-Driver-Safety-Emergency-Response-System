/**
 * SafePilot AI - Central Platform Shell & Dashboard
 * Coordinates Sidebar Navigation, Top Status Bar, and All 11 Feature Modules:
 * 1. Overview
 * 2. Live Simulation (Primary 3D Experience)
 * 3. AI Perception
 * 4. Risk Analysis
 * 5. Trip History
 * 6. Risk Map
 * 7. Emergency Center
 * 8. Vehicle Health
 * 9. Simulation Lab
 * 10. Driver Profile
 * 11. Settings
 */

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopStatusBar from '../components/TopStatusBar';
import ProfileDrawer from '../components/ProfileDrawer';
import { CAMERA_MODES } from '../components/VehicleScene';
import { telemetryService } from '../services/telemetryService';
import { audioService } from '../services/audioService';
import { authService } from '../services/authService';
import { SCENARIOS } from '../simulation/scenarios';

// Feature Pages
import OverviewPage from './OverviewPage';
import LiveSimulationPage from './LiveSimulationPage';
import AIPerceptionPage from './AIPerceptionPage';
import RiskAnalysisPage from './RiskAnalysisPage';
import TripHistoryPage from './TripHistoryPage';
import RiskMapPage from './RiskMapPage';
import EmergencyCenterPage from './EmergencyCenterPage';
import VehicleHealthPage from './VehicleHealthPage';
import SimulationLabPage from './SimulationLabPage';
import DriverProfilePage from './DriverProfilePage';
import SettingsPage from './SettingsPage';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [telemetry, setTelemetry] = useState(telemetryService.getSimulationState());
  const [cameraMode, setCameraMode] = useState(CAMERA_MODES.FOLLOW);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Subscribe to central auth state
  useEffect(() => {
    const unsubAuth = authService.subscribe(({ user }) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to central Telemetry Service stream
  useEffect(() => {
    const unsubscribe = telemetryService.subscribeToSimulation((snapshot) => {
      setTelemetry(snapshot);

      // Audio warnings based on risk
      if (snapshot.risk.riskLevel === 'CRITICAL') {
        audioService.playCriticalBrakeChime();
      } else if (snapshot.risk.riskLevel === 'HIGH') {
        audioService.playForwardCollisionWarning();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResetSimulation = () => {
    telemetryService.resetSimulation();
    setCameraMode(CAMERA_MODES.FOLLOW);
  };

  const handleToggleMute = () => {
    setIsMuted(audioService.toggleMute());
  };

  const handleToggleWeather = () => {
    telemetryService.toggleWeather();
  };

  const handleToggleTimeOfDay = () => {
    telemetryService.toggleTimeOfDay();
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid firing shortcuts when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === '1') telemetryService.setScenario(SCENARIOS.NORMAL);
      if (e.key === '2') telemetryService.setScenario(SCENARIOS.DROWSINESS);
      if (e.key === '3') telemetryService.setScenario(SCENARIOS.OBSTACLE);
      if (e.key === '4') telemetryService.setScenario(SCENARIOS.COLLISION_RISK);
      if (e.key === '5') telemetryService.setScenario(SCENARIOS.EMERGENCY);
      if (e.key.toLowerCase() === 'r') handleResetSimulation();
      if (e.key.toLowerCase() === 'c') {
        setCameraMode((prev) =>
          prev === CAMERA_MODES.FOLLOW
            ? CAMERA_MODES.DRIVER
            : prev === CAMERA_MODES.DRIVER
            ? CAMERA_MODES.TOP
            : CAMERA_MODES.FOLLOW
        );
      }
      if (e.key.toLowerCase() === 'm') {
        setIsMuted(audioService.toggleMute());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <OverviewPage
            telemetry={telemetry}
            currentUser={currentUser}
            onStartSimulation={() => setActivePage('simulation')}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case 'simulation':
        return (
          <LiveSimulationPage
            telemetry={telemetry}
            cameraMode={cameraMode}
            onChangeCameraMode={setCameraMode}
            onResetSimulation={handleResetSimulation}
          />
        );
      case 'perception':
        return (
          <AIPerceptionPage
            telemetry={telemetry}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case 'risk_analysis':
        return <RiskAnalysisPage telemetry={telemetry} />;
      case 'trip_history':
        return <TripHistoryPage telemetry={telemetry} />;
      case 'risk_map':
        return <RiskMapPage telemetry={telemetry} />;
      case 'emergency_center':
        return (
          <EmergencyCenterPage
            telemetry={telemetry}
            currentUser={currentUser}
          />
        );
      case 'vehicle_health':
        return <VehicleHealthPage telemetry={telemetry} />;
      case 'simulation_lab':
        return (
          <SimulationLabPage
            telemetry={telemetry}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case 'driver_profile':
        return <DriverProfilePage currentUser={currentUser} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            telemetry={telemetry}
            currentUser={currentUser}
            onStartSimulation={() => setActivePage('simulation')}
            onNavigate={(page) => setActivePage(page)}
          />
        );
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex bg-slate-950 text-slate-100 select-none">
      {/* 1. Global Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        currentUser={currentUser}
        onLogout={handleLogout}
        emergencyActive={telemetry.emergency.triggered}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Status & Health Bar */}
        <TopStatusBar
          riskLevel={telemetry.risk.riskLevel}
          backendConnected={telemetry.backendConnected}
          environment={telemetry.environment}
          onToggleWeather={handleToggleWeather}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentUser={currentUser}
          onOpenProfile={() => setActivePage('driver_profile')}
          onLogout={handleLogout}
          onResetSimulation={handleResetSimulation}
          notifications={telemetry.notifications}
          onClearNotifications={() => telemetryService.markNotificationsRead()}
        />

        {/* Dynamic Page Router Content */}
        <main className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
          {renderActivePage()}
        </main>
      </div>

      {/* 3. Driver Profile Drawer (Optional side inspector) */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}
