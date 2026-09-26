/**
 * SafePilot AI - Central Telemetry & Simulation Data Service
 * 
 * Single source of truth for:
 * - 3D vehicle physics with interactive steering & smooth braking
 * - Driver Monitoring System (DMS) blink state machine & IR camera telemetry
 * - Dynamic Time-To-Collision (TTC) & multi-lane collision avoidance kinematics
 * - AI Risk Engine synthesis & Control Hierarchy enforcement
 * - Emergency Response Protocol & Event Timeline
 */

import { INITIAL_PHYSICS_STATE, updateVehiclePhysics } from '../simulation/vehiclePhysics.js';
import { calculateTTC } from '../simulation/ttc.js';
import { evaluateRiskEngine, RISK_LEVELS } from '../simulation/riskEngine.js';
import { SCENARIOS, SCENARIO_METADATA } from '../simulation/scenarios.js';
import { driverMonitoringService } from './driverMonitoringService.js';
import { SIMULATION_CONFIG } from '../simulation/simulationConfig.js';

const INITIAL_TRAFFIC = [
  {
    id: 'traffic-left',
    type: 'VEHICLE',
    label: 'SUV',
    lane: -1, // left lane (x = -4.0)
    distanceM: 32.0,
    speedKmh: 52.0,
    color: '#475569',
    wheelRotation: 0,
  },
  {
    id: 'traffic-right',
    type: 'VEHICLE',
    label: 'HATCHBACK',
    lane: 1, // right lane (x = +4.0)
    distanceM: -18.0, // behind in right lane
    speedKmh: 42.0,
    color: '#dc2626',
    wheelRotation: 0,
  },
];

class TelemetryService {
  constructor() {
    this.listeners = new Set();
    this.animationFrameId = null;
    this.lastTimestamp = performance.now();
    this.isConnectedToBackend = false;
    this.webSocket = null;

    // Simulation State & Scenario
    this.currentScenario = SCENARIOS.NORMAL;
    this.scenarioProgress = 0; // seconds into scenario
    this.aebEngaged = false;

    // Simulation Controls
    this.simulationSpeed = 1.0;
    this.trafficDensity = 2; // 1 to 4 active traffic vehicles

    // Vehicle Physics State
    this.physics = { ...INITIAL_PHYSICS_STATE };

    // Interactive Driver Controls (Requirements 2, 3)
    this.manualSteeringInput = 0; // -1 (Left), 0 (Center), +1 (Right)
    this.manualBrakeActive = false;
    this.manualBrakingPercent = 0;
    this.automaticControl = false; // When AI safety controller overrides

    // Primary Hazard Target (Lead vehicle, obstacle, or pedestrian in path)
    this.hazard = {
      id: 'target-01',
      type: 'VEHICLE',
      label: 'SEDAN (LEAD)',
      distanceM: 50.0,
      targetDistanceM: 50.0,
      speedKmh: 48.0,
      relativeSpeedKmh: 0,
      lane: 0, // center lane
      width: 1.9,
      length: 4.4,
      height: 1.45,
      wheelRotation: 0,
      direction: 'AHEAD',
    };

    // Surrounding Traffic
    this.traffic = JSON.parse(JSON.stringify(INITIAL_TRAFFIC));

    // Driver Monitoring System (DMS)
    this.driver = driverMonitoringService.getDriverState();

    // Environment Conditions
    this.environment = {
      weather: 'CLEAR', // CLEAR, RAIN, FOG
      timeOfDay: 'NIGHT', // DAY, NIGHT
      roadCondition: 'DRY', // DRY, WET, LOW_VISIBILITY, POOR_SURFACE
      visibilityM: 850,
      environmentRisk: 10,
    };

    // Emergency Response State
    this.emergencyStatus = {
      triggered: false,
      emergencyType: 'Driver Incapacitation',
      vehicleStatus: 'Nominal Cruise',
      vehicleStabilized: false,
      gpsLocked: false,
      alertDispatched: false,
      nearestHelpIdentified: false,
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: 'US-101 Northbound, Mile 42.8',
      hospitalName: 'Bay Regional Trauma Center',
      hospitalDistanceKm: 2.8,
      hospitalEtaMin: 4,
      familyAlert: 'SIMULATED',
      emergencyCall: 'SIMULATED',
    };

    // Control Hierarchy Indicator (Requirement 10)
    this.controlHierarchy = SIMULATION_CONFIG.HIERARCHY.NORMAL;

    // Subsystem Health & Sensor Network
    this.degradedSensor = false;
    this.vehicleHealth = {
      battery: 87,
      brakeSystem: 'NORMAL',
      engine: 'NORMAL',
      tireStatus: 'NORMAL',
      gps: 'ONLINE',
      camera: 'ONLINE',
      aiSystem: 'ONLINE',
      systemHealthScore: 98,
    };

    this.sensors = {
      camera: 'ONLINE',
      driverMonitor: 'ONLINE',
      gps: 'ONLINE',
      speedSensor: 'ONLINE',
      collisionSensor: 'ONLINE',
      environmentSensor: 'ONLINE',
    };

    // Live Event Timeline & Notifications
    this.eventTimeline = [
      {
        id: 'evt-init',
        timeStr: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        message: 'SafePilot AI ADAS v2.5 initialized with Interactive Steering & DMS',
        type: 'SUCCESS',
        riskLevel: 'LOW',
      },
    ];

    this.notifications = [
      {
        id: 'notif-1',
        title: 'System health check completed',
        message: 'Interactive steering, brake hydraulics, and DMS camera online',
        timeAgo: 'Just now',
        timestamp: Date.now(),
        type: 'info',
        read: false,
      },
    ];

    // Telemetry History Buffer (for real-time SVG charting)
    this.historyBuffer = [];
    this.lastHistorySample = 0;

    // Road Risk Map Waypoints
    this.riskMapPoints = [
      {
        id: 'wp-0',
        x: 10,
        z: 80,
        riskLevel: 'LOW',
        speedKmh: 48,
        ttc: 99.9,
        label: 'Route Start (Mile 41.2)',
        action: 'Cruising',
        timestamp: '14:28:10',
      },
      {
        id: 'wp-1',
        x: 35,
        z: 60,
        riskLevel: 'LOW',
        speedKmh: 48,
        ttc: 99.9,
        label: 'Highway US-101 North',
        action: 'Cruising',
        timestamp: '14:30:05',
      },
    ];
    this.lastMapSample = 0;

    // State transition tracking to avoid repeated spam logging
    this.lastLoggedRiskLevel = 'LOW';
    this.lastLoggedAction = 'NORMAL DRIVING';
    this.lastLoggedDrowsiness = 'LOW';
  }

  /**
   * Interactive Steering API (Requirement 2)
   * @param {number} input -1 (Left), 0 (Center), +1 (Right)
   */
  steer(direction) {
    if (this.automaticControl && this.emergencyStatus.triggered) {
      // Disallow manual override during critical emergency stop
      return;
    }
    this.manualSteeringInput = Math.max(-1, Math.min(1, direction));
    this.physics.steeringInput = this.manualSteeringInput;
    this.notify();
  }

  centerSteering() {
    this.manualSteeringInput = 0;
    this.physics.steeringInput = 0;
    this.notify();
  }

  /**
   * Interactive Brake API (Requirement 3)
   * @param {boolean} active Whether brake is pressed
   * @param {number} forcePercent Optional brake force (0 - 100)
   */
  setManualBrake(active, forcePercent = 85) {
    this.manualBrakeActive = active;
    this.manualBrakingPercent = active ? forcePercent : 0;
    if (active) {
      this.physics.brakingPercent = forcePercent;
      this.physics.brakeActive = true;
    }
    this.notify();
  }

  /**
   * Log an event to the Live Risk Timeline and top Notifications (Requirement 18)
   */
  logEvent(message, type = 'INFO', meta = {}) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timeStr,
      timestamp: Date.now(),
      message,
      type, // 'INFO', 'WARNING', 'CRITICAL', 'SUCCESS'
      ...meta,
    };

    this.eventTimeline = [event, ...this.eventTimeline.slice(0, 49)];

    if (type === 'WARNING' || type === 'CRITICAL' || type === 'SUCCESS') {
      const notif = {
        id: `notif-${Date.now()}`,
        title: message,
        message: meta.details || `Vehicle response: ${meta.action || 'Monitoring'}`,
        timeAgo: 'Just now',
        timestamp: Date.now(),
        type: type === 'CRITICAL' ? 'danger' : type === 'WARNING' ? 'warning' : 'success',
        read: false,
      };
      this.notifications = [notif, ...this.notifications.slice(0, 19)];
    }
  }

  markNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  subscribeToSimulation(callback) {
    this.listeners.add(callback);
    callback(this.getSimulationState());
    return () => this.listeners.delete(callback);
  }

  subscribe(callback) {
    return this.subscribeToSimulation(callback);
  }

  notify() {
    const state = this.getSimulationState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  calculateSafetyScore(driverRisk, vehicleRisk, environmentRisk, collisionRisk) {
    const weightedRisk =
      driverRisk * 0.3 +
      vehicleRisk * 0.15 +
      environmentRisk * 0.15 +
      collisionRisk * 0.4;

    const safetyScore = Math.max(0, Math.min(100, Math.round(100 - weightedRisk)));

    return {
      score: safetyScore,
      breakdown: {
        driverScore: Math.max(0, Math.min(100, Math.round(100 - driverRisk))),
        vehicleScore: Math.max(0, Math.min(100, Math.round(100 - vehicleRisk))),
        environmentScore: Math.max(0, Math.min(100, Math.round(100 - environmentRisk))),
        collisionScore: Math.max(0, Math.min(100, Math.round(100 - collisionRisk))),
      },
    };
  }

  /**
   * Central Simulation State (Single source of truth - Requirement 13)
   */
  getSimulationState() {
    const egoSpeedKmh = this.physics.speedKmh;
    const hazardSpeedKmh = this.hazard.speedKmh;
    const relativeSpeedKmh = Math.round((egoSpeedKmh - hazardSpeedKmh) * 10) / 10;

    // Check if hazard is currently in our lane path (Requirement 11)
    const hazardLateralX = this.hazard.lane * 3.8;
    const egoLateralX = this.physics.vehicleX || 0;
    const lateralDistanceToHazard = Math.abs(egoLateralX - hazardLateralX);
    const isHazardInEgoPath = lateralDistanceToHazard < 1.9; // Within lane width overlap

    // Time-To-Collision (TTC): Only dangerous when hazard is actually in ego path!
    let ttcMetrics;
    if (isHazardInEgoPath) {
      ttcMetrics = calculateTTC(this.hazard.distanceM, egoSpeedKmh, hazardSpeedKmh);
    } else {
      // Vehicle steered into another lane! Obstacle avoided!
      ttcMetrics = {
        ttc: 99.9,
        ttcDisplay: 'SAFE (LANE CLEAR)',
        relativeSpeedKmh,
        dangerLevel: 'LOW',
        isClosing: false,
        safeDistanceM: 20,
      };
    }

    // Compute Collision Risk component
    let collisionRisk = 8;
    const isStoppedSafely = egoSpeedKmh <= 0.5 && this.hazard.distanceM >= 5.5;

    if (isStoppedSafely) {
      collisionRisk = 10;
    } else if (isHazardInEgoPath) {
      if (
        ttcMetrics.dangerLevel === 'CRITICAL' ||
        ttcMetrics.ttc <= 2.0 ||
        (this.hazard.distanceM <= 18.0 && relativeSpeedKmh > 5) ||
        (this.currentScenario === SCENARIOS.SUDDEN_BRAKING && this.hazard.distanceM <= 28.0 && relativeSpeedKmh > 8)
      ) {
        collisionRisk = 95;
      } else if (
        ttcMetrics.dangerLevel === 'HIGH' ||
        ttcMetrics.ttc <= 3.5 ||
        (this.hazard.distanceM <= 30.0 && relativeSpeedKmh > 12)
      ) {
        collisionRisk = 75;
      } else if (ttcMetrics.dangerLevel === 'MEDIUM' || ttcMetrics.ttc <= 5.0) {
        collisionRisk = 45;
      } else {
        collisionRisk = 12;
      }
    } else {
      // Clear lane path
      collisionRisk = 10;
    }

    // Vehicle risk based on braking and system health
    let vehicleRisk = (this.physics.brakingPercent > 0 || this.manualBrakeActive) ? 15 : 5;
    if (this.degradedSensor) vehicleRisk += 25;

    // Environment Risk
    let environmentRisk = this.environment.environmentRisk;
    if (this.environment.weather === 'RAIN') environmentRisk = Math.max(environmentRisk, 32);
    if (this.environment.weather === 'FOG') environmentRisk = Math.max(environmentRisk, 45);
    if (this.environment.roadCondition === 'WET') environmentRisk = Math.max(environmentRisk, 28);
    if (this.environment.roadCondition === 'POOR_SURFACE') environmentRisk = Math.max(environmentRisk, 40);

    // AI Risk Engine evaluation
    const effectiveTtc = (!isHazardInEgoPath || isStoppedSafely) ? 99.9 : ttcMetrics.ttc;
    const riskEngineResult = evaluateRiskEngine({
      driverRisk: this.driver.driverRisk,
      vehicleRisk,
      collisionRisk,
      environmentRisk,
      ttc: effectiveTtc,
    });

    // Control Hierarchy Mapping (Requirement 10)
    let currentHierarchy = SIMULATION_CONFIG.HIERARCHY.NORMAL;
    if (this.emergencyStatus.triggered) {
      currentHierarchy = SIMULATION_CONFIG.HIERARCHY.EMERGENCY;
    } else if (riskEngineResult.riskLevel === 'CRITICAL' || this.aebEngaged) {
      currentHierarchy = SIMULATION_CONFIG.HIERARCHY.CRITICAL;
    } else if (riskEngineResult.riskLevel === 'HIGH') {
      currentHierarchy = SIMULATION_CONFIG.HIERARCHY.HIGH_RISK;
    } else if (riskEngineResult.riskLevel === 'MEDIUM') {
      currentHierarchy = SIMULATION_CONFIG.HIERARCHY.WARNING;
    } else {
      currentHierarchy = SIMULATION_CONFIG.HIERARCHY.NORMAL;
    }
    this.controlHierarchy = currentHierarchy;

    // Dynamic Safety Score
    const safetyData = this.calculateSafetyScore(
      this.driver.driverRisk,
      vehicleRisk,
      environmentRisk,
      collisionRisk
    );

    // Dynamic Perception Objects List
    const detectedObjects = [
      {
        id: this.hazard.id,
        type: this.hazard.type,
        label: this.hazard.label,
        distanceM: Math.round(this.hazard.distanceM * 10) / 10,
        relativeSpeedKmh: relativeSpeedKmh,
        direction: isHazardInEgoPath ? 'AHEAD (IN PATH)' : (egoLateralX < hazardLateralX ? 'FORWARD RIGHT' : 'FORWARD LEFT'),
        status: collisionRisk >= 75 ? 'CRITICAL' : 'TRACKING',
        lane: this.hazard.lane,
        speedKmh: this.hazard.speedKmh,
        inPath: isHazardInEgoPath,
      },
      ...this.traffic.slice(0, this.trafficDensity).map((car) => ({
        id: car.id,
        type: car.type,
        label: car.label,
        distanceM: Math.round(Math.abs(car.distanceM) * 10) / 10,
        relativeSpeedKmh: Math.round((egoSpeedKmh - car.speedKmh) * 10) / 10,
        direction: car.lane < 0 ? 'LEFT' : 'RIGHT',
        status: 'TRACKING',
        lane: car.lane,
        speedKmh: car.speedKmh,
        inPath: false,
      })),
    ];

    const objectCounts = {
      total: detectedObjects.length,
      vehicles: detectedObjects.filter((o) => o.type === 'VEHICLE').length,
      pedestrians: detectedObjects.filter((o) => o.type === 'PEDESTRIAN').length,
      obstacles: detectedObjects.filter((o) => o.type === 'OBSTACLE').length,
    };

    const dynamicVehicleHealth = {
      ...this.vehicleHealth,
      brakeSystem: (this.physics.brakingPercent > 80 || this.aebEngaged) ? 'ACTIVE_AEB' : 'NORMAL',
      camera: this.degradedSensor ? 'DEGRADED' : 'ONLINE',
      systemHealthScore: this.degradedSensor
        ? 74
        : this.physics.brakingPercent > 0
        ? 94
        : 98,
    };

    // Determine current vehicle status string
    let vehicleStatus = 'Cruising';
    if (this.emergencyStatus.triggered) {
      vehicleStatus = egoSpeedKmh <= 0.5 ? 'Stopped / Secured' : 'Emergency Braking / Stabilizing';
    } else if (this.physics.brakingPercent > 80) {
      vehicleStatus = 'Autonomous Emergency Braking (AEB)';
    } else if (this.manualBrakeActive) {
      vehicleStatus = 'Manual Driver Braking';
    } else if (Math.abs(this.physics.steeringAngle) > 4) {
      vehicleStatus = `Steering (${this.physics.steeringAngle > 0 ? 'Right' : 'Left'})`;
    }

    return {
      // 1. Central simulation state properties (Requirement 13)
      scenario: this.currentScenario,
      speed: this.physics.speedKmh,
      acceleration: this.physics.accelerationMps2,
      braking: this.physics.brakingPercent,
      steeringAngle: this.physics.steeringAngle,
      steeringInput: this.physics.steeringInput,
      vehicleX: this.physics.vehicleX,
      vehicleRotation: this.physics.vehicleRotation,
      currentLane: this.physics.currentLane,
      distance: Math.round(this.hazard.distanceM * 10) / 10,
      relativeSpeed: relativeSpeedKmh,
      ttc: ttcMetrics.ttc,
      isHazardInEgoPath,

      // Driver State (DMS)
      driverState: {
        eyeState: this.driver.eyeState,
        attention: this.driver.attention,
        drowsiness: this.driver.drowsiness,
        drowsinessPercent: this.driver.drowsinessPercent,
        blinkRatePerMin: this.driver.blinkRatePerMin,
        blinkRateStatus: this.driver.blinkRateStatus,
        blinkCount: this.driver.blinkCount,
        ear: this.driver.ear,
        closureDurationSec: this.driver.closureDurationSec,
        cameraStatus: this.driver.cameraStatus,
      },
      eyeState: this.driver.eyeState,
      blinkCount: this.driver.blinkCount,
      blinkRate: this.driver.blinkRateStatus,
      drowsinessLevel: this.driver.drowsiness,
      attentionLevel: this.driver.attention,
      driverRisk: this.driver.driverRisk,

      // Risks
      vehicleRisk,
      collisionRisk,
      environmentRisk,
      riskScore: riskEngineResult.riskScore,
      riskLevel: riskEngineResult.riskLevel,
      action: riskEngineResult.safetyAction,

      // Control & Emergency
      automaticControl: this.automaticControl,
      emergencyActive: this.emergencyStatus.triggered,
      emergencyType: this.emergencyStatus.emergencyType,
      gpsActive: this.emergencyStatus.gpsLocked,
      vehicleStatus,
      controlHierarchy: this.controlHierarchy,

      // Comprehensive nested structures
      physics: { ...this.physics },
      hazard: { ...this.hazard },
      traffic: [...this.traffic],
      driver: { ...this.driver },
      environment: { ...this.environment },
      ttcMetrics: { ...ttcMetrics },
      risk: { ...riskEngineResult },
      emergency: { ...this.emergencyStatus, vehicleStatus },
      safetyScore: safetyData.score,
      safetyBreakdown: safetyData.breakdown,
      backendConnected: this.isConnectedToBackend,
      timestamp: performance.now(),

      // Telemetry feeds
      eventTimeline: [...this.eventTimeline],
      notifications: [...this.notifications],
      historyBuffer: [...this.historyBuffer],
      detectedObjects,
      objectCounts,
      vehicleHealth: dynamicVehicleHealth,
      sensors: this.sensors,
      degradedSensor: this.degradedSensor,
      simulationControls: {
        simulationSpeed: this.simulationSpeed,
        trafficDensity: this.trafficDensity,
        weather: this.environment.weather,
        roadCondition: this.environment.roadCondition,
      },
      riskMapPoints: [...this.riskMapPoints],
      manualBrakeActive: this.manualBrakeActive,
      manualBrakingPercent: this.manualBrakingPercent,
    };
  }

  getSnapshot() {
    return this.getSimulationState();
  }

  /**
   * Set Simulation Scenario with calibrated transitions
   */
  setScenario(scenarioKey) {
    if (!SCENARIOS[scenarioKey]) return;
    this.currentScenario = scenarioKey;
    this.scenarioProgress = 0;
    this.aebEngaged = false;
    this.automaticControl = false;
    this.manualBrakeActive = false;
    this.manualBrakingPercent = 0;

    const meta = SCENARIO_METADATA[scenarioKey];
    this.hazard.type = meta.hazardConfig.type;
    this.hazard.label = meta.hazardConfig.label;
    this.hazard.distanceM = meta.hazardConfig.initialDistance;
    this.hazard.targetDistanceM = meta.hazardConfig.targetDistance;
    this.hazard.speedKmh = meta.hazardConfig.speedKmh;
    this.hazard.lane = meta.hazardConfig.lane;
    this.hazard.direction = 'AHEAD';

    // Apply baseline driver config to DMS state machine
    if (meta.driverConfig.dmsMode) {
      driverMonitoringService.setSimulationMode(meta.driverConfig.dmsMode);
    }
    this.driver = driverMonitoringService.getDriverState();

    // Reset emergency status if not emergency scenario
    if (scenarioKey !== SCENARIOS.EMERGENCY) {
      this.emergencyStatus.triggered = false;
      this.emergencyStatus.vehicleStabilized = false;
      this.emergencyStatus.gpsLocked = false;
      this.emergencyStatus.alertDispatched = false;
      this.emergencyStatus.nearestHelpIdentified = false;
    } else {
      this.emergencyStatus.triggered = true;
      this.emergencyStatus.emergencyType = 'Driver Incapacitation';
    }

    this.logEvent(`Scenario selected: ${meta.name}`, 'INFO', { scenario: scenarioKey });
    this.notify();
  }

  /**
   * Reset simulation to nominal cruise baseline (Requirement 22)
   */
  resetSimulation() {
    this.currentScenario = SCENARIOS.NORMAL;
    this.scenarioProgress = 0;
    this.aebEngaged = false;
    this.degradedSensor = false;
    this.automaticControl = false;
    this.manualSteeringInput = 0;
    this.manualBrakeActive = false;
    this.manualBrakingPercent = 0;

    driverMonitoringService.reset();
    driverMonitoringService.setSimulationMode('NORMAL');
    this.driver = driverMonitoringService.getDriverState();

    this.physics = {
      ...INITIAL_PHYSICS_STATE,
      speedKmh: 48.0,
      targetSpeedKmh: 48.0,
      brakingPercent: 0,
      throttlePercent: 35,
      accelerationMps2: 0.0,
      steeringInput: 0,
      steeringAngle: 0,
      vehicleX: 0,
      vehicleRotation: 0,
      currentLane: 'CENTER LANE',
      laneOffset: 0,
      pitch: 0,
      roll: 0,
      gear: 'D',
      brakeActive: false,
    };

    this.hazard = {
      id: 'target-01',
      type: 'VEHICLE',
      label: 'SEDAN (LEAD)',
      distanceM: 50.0,
      targetDistanceM: 50.0,
      speedKmh: 48.0,
      relativeSpeedKmh: 0,
      lane: 0,
      width: 1.9,
      length: 4.4,
      height: 1.45,
      wheelRotation: 0,
      direction: 'AHEAD',
    };

    this.traffic = JSON.parse(JSON.stringify(INITIAL_TRAFFIC));

    this.emergencyStatus = {
      triggered: false,
      emergencyType: 'Driver Incapacitation',
      vehicleStatus: 'Nominal Cruise',
      vehicleStabilized: false,
      gpsLocked: false,
      alertDispatched: false,
      nearestHelpIdentified: false,
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: 'US-101 Northbound, Mile 42.8',
      hospitalName: 'Bay Regional Trauma Center',
      hospitalDistanceKm: 2.8,
      hospitalEtaMin: 4,
      familyAlert: 'SIMULATED',
      emergencyCall: 'SIMULATED',
    };

    this.lastLoggedRiskLevel = 'LOW';
    this.lastLoggedAction = 'NORMAL DRIVING';
    this.lastLoggedDrowsiness = 'LOW';

    this.logEvent('Simulation reset to nominal cruise baseline', 'SUCCESS');
    this.notify();
  }

  toggleWeather() {
    const sequence = ['CLEAR', 'RAIN', 'FOG'];
    const currentIndex = sequence.indexOf(this.environment.weather);
    const nextWeather = sequence[(currentIndex + 1) % sequence.length];
    this.setWeather(nextWeather);
  }

  setWeather(weather) {
    this.environment.weather = weather;
    if (weather === 'RAIN') {
      this.environment.roadCondition = 'WET';
      this.environment.environmentRisk = 30;
      this.environment.visibilityM = 450;
    } else if (weather === 'FOG') {
      this.environment.roadCondition = 'LOW_VISIBILITY';
      this.environment.environmentRisk = 45;
      this.environment.visibilityM = 180;
    } else {
      this.environment.roadCondition = 'DRY';
      this.environment.environmentRisk = 10;
      this.environment.visibilityM = 850;
    }
    this.logEvent(`Weather updated to ${weather} (Road: ${this.environment.roadCondition})`, 'INFO');
    this.notify();
  }

  toggleTimeOfDay() {
    this.environment.timeOfDay = this.environment.timeOfDay === 'NIGHT' ? 'DAY' : 'NIGHT';
    this.logEvent(`Lighting mode changed to ${this.environment.timeOfDay}`, 'INFO');
    this.notify();
  }

  setTimeOfDay(tod) {
    this.environment.timeOfDay = tod;
    this.notify();
  }

  setRoadCondition(condition) {
    this.environment.roadCondition = condition;
    if (condition === 'POOR_SURFACE') {
      this.environment.environmentRisk = 35;
    } else if (condition === 'WET') {
      this.environment.environmentRisk = 28;
    } else if (condition === 'LOW_VISIBILITY') {
      this.environment.environmentRisk = 40;
    } else {
      this.environment.environmentRisk = 10;
    }
    this.logEvent(`Road condition set to ${condition}`, 'INFO');
    this.notify();
  }

  setSimulationSpeed(speed) {
    this.simulationSpeed = Math.max(0.5, Math.min(2.5, speed));
    this.notify();
  }

  setTrafficDensity(density) {
    this.trafficDensity = Math.max(1, Math.min(4, density));
    this.notify();
  }

  toggleDegradedSensor() {
    this.degradedSensor = !this.degradedSensor;
    if (this.degradedSensor) {
      this.logEvent('⚠ CAMERA DEGRADED: SafePilot switched to fallback safety mode', 'WARNING', {
        details: 'Visual perception confidence reduced. Relying primarily on Radar and LiDAR telemetry.',
      });
    } else {
      this.logEvent('Camera visual perception restored to 100% nominal operation', 'SUCCESS');
    }
    this.notify();
  }

  triggerEmergency(type = 'Driver Incapacitation') {
    this.emergencyStatus.triggered = true;
    this.emergencyStatus.emergencyType = type;
    this.setScenario(SCENARIOS.EMERGENCY);
  }

  clearEmergency() {
    this.resetSimulation();
  }

  startSimulation() {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
    if (this.animationFrameId) return;

    this.lastTimestamp = performance.now();
    const tick = (now) => {
      const rawDt = Math.min((now - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = now;

      const dt = rawDt * this.simulationSpeed;

      if (!this.isConnectedToBackend) {
        this.stepSimulation(dt);
      }

      this.notify();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  stopSimulation() {
    if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main Physics & Safety Simulation Tick
   */
  stepSimulation(dt) {
    this.scenarioProgress += dt;
    const egoSpeedMps = (this.physics.speedKmh * 1000) / 3600;

    // 1. Step the Driver Monitoring System (DMS) State Machine
    this.driver = driverMonitoringService.update(dt);

    // 2. Scenario-Specific State Machine Progression
    switch (this.currentScenario) {
      case SCENARIOS.NORMAL: {
        const targetDist = 50.0 + Math.sin(this.scenarioProgress * 0.3) * 2.0;
        this.hazard.distanceM = targetDist;
        this.hazard.speedKmh = this.physics.speedKmh + (targetDist - this.hazard.distanceM) * 0.2;
        this.hazard.lane = 0;
        break;
      }

      case SCENARIOS.MANUAL_STEERING: {
        // Highway driving with clear center distance, allowing user to steer freely
        this.hazard.distanceM = 55.0;
        this.hazard.speedKmh = this.physics.speedKmh;
        this.hazard.lane = 0;
        break;
      }

      case SCENARIOS.MANUAL_BRAKING: {
        this.hazard.distanceM = 45.0;
        this.hazard.speedKmh = 40.0;
        this.hazard.lane = 0;
        break;
      }

      case SCENARIOS.DROWSINESS: {
        // Drowsiness scenario progression
        this.hazard.speedKmh = Math.max(30, this.physics.speedKmh);
        const distDiff = (this.hazard.speedKmh - this.physics.speedKmh) * (1000 / 3600);
        this.hazard.distanceM = Math.min(55, Math.max(40, this.hazard.distanceM + distDiff * dt));
        break;
      }

      case SCENARIOS.REPEATED_BLINKING: {
        this.hazard.distanceM = 48.0;
        this.hazard.speedKmh = this.physics.speedKmh;
        break;
      }

      case SCENARIOS.OBSTACLE: {
        this.hazard.speedKmh = 0.0;
        this.hazard.lane = 0;
        // Obstacle closes as vehicle moves forward
        if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
          this.hazard.distanceM = Math.max(
            SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
            this.hazard.distanceM - egoSpeedMps * dt
          );
        }
        break;
      }

      case SCENARIOS.COLLISION_RISK: {
        this.hazard.speedKmh = Math.max(0.0, this.hazard.speedKmh - 16.0 * dt);
        const hazardMps = (this.hazard.speedKmh * 1000) / 3600;
        const closingSpeedMps = egoSpeedMps - hazardMps;
        if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
          this.hazard.distanceM = Math.max(
            SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
            this.hazard.distanceM - closingSpeedMps * dt
          );
        }
        break;
      }

      case SCENARIOS.SUDDEN_BRAKING: {
        this.hazard.speedKmh = Math.max(0.0, this.hazard.speedKmh - 30.0 * dt);
        const hazardMps = (this.hazard.speedKmh * 1000) / 3600;
        const closingSpeedMps = egoSpeedMps - hazardMps;
        if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
          this.hazard.distanceM = Math.max(
            SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
            this.hazard.distanceM - closingSpeedMps * dt
          );
        }
        break;
      }

      case SCENARIOS.VEHICLE_CUT_IN: {
        if (Math.abs(this.hazard.lane) > 0.05) {
          this.hazard.lane += (0 - this.hazard.lane) * Math.min(1.0, 1.8 * dt);
        } else {
          this.hazard.lane = 0;
        }
        this.hazard.speedKmh = Math.max(22.0, this.hazard.speedKmh - 8.0 * dt);
        const closingSpeedMps = egoSpeedMps - (this.hazard.speedKmh * 1000) / 3600;
        if (this.hazard.distanceM > 8.0) {
          this.hazard.distanceM = Math.max(8.0, this.hazard.distanceM - closingSpeedMps * dt);
        }
        break;
      }

      case SCENARIOS.PEDESTRIAN_CROSSING: {
        this.hazard.type = 'PEDESTRIAN';
        this.hazard.label = 'PEDESTRIAN CROSSING';
        this.hazard.speedKmh = 0.0;
        if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
          this.hazard.distanceM = Math.max(
            SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
            this.hazard.distanceM - egoSpeedMps * dt
          );
        }
        break;
      }

      case SCENARIOS.DRIVER_UNRESPONSIVE: {
        this.emergencyStatus.triggered = true;
        this.emergencyStatus.emergencyType = 'Driver Incapacitation';
        break;
      }

      case SCENARIOS.DROWSINESS_OBSTACLE: {
        // Combined Scenario (Requirement 12):
        // 1. Normal driving (t < 2s)
        // 2. Driver starts blinking & drowsiness escalates (2s - 4s)
        // 3. Warning & Unresponsive state (4s - 6s)
        // 4. Obstacle detected in lane ahead (t > 6s) -> TTC drops -> AEB activates -> Safe Stop -> Emergency Mode
        if (this.scenarioProgress < 2.5) {
          driverMonitoringService.setSimulationMode('DROWSY');
          this.hazard.distanceM = 55.0;
          this.hazard.speedKmh = 45.0;
        } else if (this.scenarioProgress < 5.5) {
          driverMonitoringService.setSimulationMode('UNRESPONSIVE');
          this.hazard.distanceM = Math.max(25.0, 55.0 - (this.scenarioProgress - 2.5) * 8);
          this.hazard.speedKmh = 0.0; // Hazard is stationary obstacle
        } else {
          // Obstacle close & driver incapacitated -> AEB & Emergency
          this.hazard.speedKmh = 0.0;
          if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
            this.hazard.distanceM = Math.max(
              SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
              this.hazard.distanceM - egoSpeedMps * dt
            );
          }
        }
        break;
      }

      case SCENARIOS.EMERGENCY: {
        this.hazard.speedKmh = 0.0;
        if (this.hazard.distanceM > SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M) {
          this.hazard.distanceM = Math.max(
            SIMULATION_CONFIG.BRAKING.SAFE_STOP_BUFFER_M,
            this.hazard.distanceM - egoSpeedMps * dt
          );
        }
        this.emergencyStatus.triggered = true;
        break;
      }
    }

    // 3. Multi-Lane Collision & TTC Kinematics
    const hazardLateralX = this.hazard.lane * 3.8;
    const egoLateralX = this.physics.vehicleX || 0;
    const isHazardInEgoPath = Math.abs(egoLateralX - hazardLateralX) < 1.9;

    let ttcMetrics;
    if (isHazardInEgoPath) {
      ttcMetrics = calculateTTC(this.hazard.distanceM, this.physics.speedKmh, this.hazard.speedKmh);
    } else {
      ttcMetrics = {
        ttc: 99.9,
        ttcDisplay: 'SAFE (LANE CLEAR)',
        relativeSpeedKmh: Math.round((this.physics.speedKmh - this.hazard.speedKmh) * 10) / 10,
        dangerLevel: 'LOW',
        isClosing: false,
        safeDistanceM: 20,
      };
    }

    const relativeSpeedKmh = Math.round((this.physics.speedKmh - this.hazard.speedKmh) * 10) / 10;
    let collisionRisk = 10;
    const isStoppedSafely = this.physics.speedKmh <= 0.5 && this.hazard.distanceM >= 5.5;

    if (isStoppedSafely) {
      collisionRisk = 10;
    } else if (isHazardInEgoPath) {
      if (
        ttcMetrics.dangerLevel === 'CRITICAL' ||
        ttcMetrics.ttc <= 2.0 ||
        (this.hazard.distanceM <= 18.0 && relativeSpeedKmh > 5) ||
        (this.currentScenario === SCENARIOS.SUDDEN_BRAKING && this.hazard.distanceM <= 28.0 && relativeSpeedKmh > 8)
      ) {
        collisionRisk = 95;
      } else if (
        ttcMetrics.dangerLevel === 'HIGH' ||
        ttcMetrics.ttc <= 3.5 ||
        (this.hazard.distanceM <= 30.0 && relativeSpeedKmh > 12)
      ) {
        collisionRisk = 75;
      } else if (ttcMetrics.dangerLevel === 'MEDIUM' || ttcMetrics.ttc <= 5.0) {
        collisionRisk = 45;
      }
    } else {
      collisionRisk = 10;
    }

    let vehicleRisk = (this.physics.brakingPercent > 0 || this.manualBrakeActive) ? 15 : 5;
    if (this.degradedSensor) vehicleRisk += 25;

    let environmentRisk = this.environment.environmentRisk;
    if (this.environment.weather === 'RAIN') environmentRisk = Math.max(environmentRisk, 32);
    if (this.environment.weather === 'FOG') environmentRisk = Math.max(environmentRisk, 45);
    if (this.environment.roadCondition === 'WET') environmentRisk = Math.max(environmentRisk, 28);
    if (this.environment.roadCondition === 'POOR_SURFACE') environmentRisk = Math.max(environmentRisk, 40);

    const effectiveTtc = (!isHazardInEgoPath || isStoppedSafely) ? 99.9 : ttcMetrics.ttc;
    const riskResult = evaluateRiskEngine({
      driverRisk: this.driver.driverRisk,
      vehicleRisk,
      collisionRisk,
      environmentRisk,
      ttc: effectiveTtc,
    });

    // 4. Driver DMS Triggers & Transitions (Requirements 6, 7, 8)
    if (this.driver.drowsiness === 'HIGH' && this.lastLoggedDrowsiness !== 'HIGH') {
      this.logEvent('⚠ DRIVER DROWSINESS DETECTED: Fatigue warning active', 'WARNING', {
        action: 'Visual & Audio Warning Triggered',
        details: 'Abnormal blink frequency and eyelid closure detected by DMS camera.',
      });
      this.lastLoggedDrowsiness = 'HIGH';
    } else if (this.driver.drowsiness === 'LOW' && this.lastLoggedDrowsiness !== 'LOW') {
      this.lastLoggedDrowsiness = 'LOW';
    }

    // Check if Driver State triggers Emergency Mode
    if (this.driver.emergencyTriggered || this.currentScenario === SCENARIOS.DRIVER_UNRESPONSIVE) {
      if (!this.emergencyStatus.triggered) {
        this.emergencyStatus.triggered = true;
        this.emergencyStatus.emergencyType = 'Driver Incapacitation';
        this.logEvent('🚨 EMERGENCY MODE: Driver Unresponsive — Autonomous Safety Protocol Initiated', 'CRITICAL', {
          action: 'AUTOMATIC BRAKING & STABILIZATION',
        });
      }
    }

    // Update Emergency Checklist Progress when Emergency is Active (Requirement 8)
    if (this.emergencyStatus.triggered) {
      this.automaticControl = true;
      if (this.physics.speedKmh <= 0.8) {
        this.emergencyStatus.vehicleStabilized = true;
        this.emergencyStatus.vehicleStatus = 'Stabilized & Stopped';
        if (this.scenarioProgress > 1.2 || this.emergencyStatus.triggered) {
          this.emergencyStatus.gpsLocked = true;
        }
        if (this.scenarioProgress > 2.2) {
          this.emergencyStatus.alertDispatched = true;
        }
        if (this.scenarioProgress > 3.2) {
          this.emergencyStatus.nearestHelpIdentified = true;
        }
      } else {
        this.emergencyStatus.vehicleStatus = 'Emergency Braking Active';
      }
    }

    // 5. Automated State Transition Event Logging
    if (riskResult.riskLevel !== this.lastLoggedRiskLevel) {
      if (riskResult.riskLevel === 'HIGH') {
        this.logEvent(`High risk detected (TTC: ${ttcMetrics.ttc.toFixed(1)}s)`, 'WARNING', {
          action: 'Speed reduction activated',
          riskLevel: 'HIGH',
        });
      } else if (riskResult.riskLevel === 'CRITICAL') {
        this.logEvent(`Critical risk imminent! (TTC: ${ttcMetrics.ttc.toFixed(1)}s)`, 'CRITICAL', {
          action: 'Automatic emergency braking engaged',
          riskLevel: 'CRITICAL',
        });
      }
      this.lastLoggedRiskLevel = riskResult.riskLevel;
    }

    if (riskResult.safetyAction !== this.lastLoggedAction) {
      if (riskResult.safetyAction === 'SPEED REDUCTION') {
        this.logEvent(`SafePilot ADAS: Initiated automated speed reduction`, 'WARNING', { action: 'SPEED REDUCTION' });
      } else if (riskResult.safetyAction === 'AUTOMATIC BRAKING') {
        this.logEvent(`SafePilot ADAS: Full Autonomous Emergency Braking (AEB) engaged`, 'CRITICAL', { action: 'AUTOMATIC BRAKING' });
      }
      this.lastLoggedAction = riskResult.safetyAction;
    }

    // 6. Map Safety Action to Vehicle Controls & Control Hierarchy (Requirements 9, 10)
    let targetSpeedKmh = 48.0;
    let emergencyBrake = false;
    let brakeForce = 0;

    if (
      this.currentScenario === SCENARIOS.EMERGENCY ||
      this.currentScenario === SCENARIOS.DRIVER_UNRESPONSIVE ||
      this.emergencyStatus.triggered ||
      riskResult.safetyAction === 'AUTOMATIC BRAKING' ||
      (this.aebEngaged && this.physics.speedKmh > 0.1)
    ) {
      this.aebEngaged = true;
      emergencyBrake = true;
      targetSpeedKmh = 0.0;
      brakeForce = 100;
      this.automaticControl = true;
    } else if (this.manualBrakeActive) {
      brakeForce = this.manualBrakingPercent || 85;
      targetSpeedKmh = 0.0;
    } else if (riskResult.safetyAction === 'SPEED REDUCTION') {
      brakeForce = 45;
      targetSpeedKmh =
        this.currentScenario === SCENARIOS.DROWSINESS
          ? 28.0
          : Math.min(25.0, Math.max(10.0, this.hazard.speedKmh));
    } else if (riskResult.safetyAction === 'DRIVER WARNING') {
      brakeForce = 15;
      targetSpeedKmh = 40.0;
    } else {
      targetSpeedKmh = 48.0;
      brakeForce = 0;
      emergencyBrake = false;
      this.automaticControl = false;
    }

    // 7. Step Vehicle Physics with Interactive Steering & Braking
    this.physics = updateVehiclePhysics(this.physics, dt, {
      targetSpeedKmh,
      emergencyBrake,
      brakeForce,
      steeringInput: this.manualSteeringInput,
      manualBrake: this.manualBrakeActive,
      manualBrakingPercent: this.manualBrakingPercent,
      automaticControl: this.automaticControl,
    });

    // 8. Lead Target Wheel Rotation
    const hazardSpeedMps = (this.hazard.speedKmh * 1000) / 3600;
    const wheelRadius = 0.33;
    const hazardAngularVel = hazardSpeedMps / wheelRadius;
    this.hazard.wheelRotation = ((this.hazard.wheelRotation || 0) + hazardAngularVel * dt) % (Math.PI * 2);

    // 9. Update Secondary Traffic Movement
    const currentEgoSpeed = this.physics.speedKmh;
    for (const car of this.traffic) {
      const relKmh = car.speedKmh - currentEgoSpeed;
      const relMps = (relKmh * 1000) / 3600;
      car.distanceM += relMps * dt;

      const carSpeedMps = (car.speedKmh * 1000) / 3600;
      car.wheelRotation = ((car.wheelRotation || 0) + (carSpeedMps / wheelRadius) * dt) % (Math.PI * 2);

      if (car.distanceM > 80) {
        car.distanceM = -45;
      } else if (car.distanceM < -50) {
        car.distanceM = 75;
      }
    }

    // 10. Sample Telemetry History Buffer (every ~0.5 seconds)
    const nowMs = performance.now();
    if (nowMs - this.lastHistorySample > 500) {
      this.lastHistorySample = nowMs;
      const sample = {
        time: new Date().toTimeString().split(' ')[0],
        speed: Math.round(this.physics.speedKmh),
        ttc: Math.min(10, Math.round(ttcMetrics.ttc * 10) / 10),
        riskScore: riskResult.riskScore,
        driverRisk: this.driver.driverRisk,
        vehicleRisk,
        collisionRisk,
        environmentRisk,
        braking: Math.round(this.physics.brakingPercent),
        steering: Math.round(this.physics.steeringAngle),
      };
      this.historyBuffer = [...this.historyBuffer.slice(-59), sample];

      // Sample Risk Map Waypoint
      if (riskResult.riskLevel !== 'LOW' || nowMs - this.lastMapSample > 5000) {
        this.lastMapSample = nowMs;
        const newWp = {
          id: `wp-${Date.now()}`,
          x: Math.round(15 + Math.random() * 70),
          z: Math.round(20 + Math.random() * 60),
          riskLevel: riskResult.riskLevel,
          speedKmh: Math.round(this.physics.speedKmh),
          ttc: Math.min(10, Math.round(ttcMetrics.ttc * 10) / 10),
          label: `${riskResult.riskLevel} Risk Event (Mile 43.${this.riskMapPoints.length})`,
          action: riskResult.safetyAction,
          timestamp: new Date().toTimeString().split(' ')[0],
        };
        this.riskMapPoints = [...this.riskMapPoints.slice(-14), newWp];
      }
    }
  }

  connectToBackend(url) {
    try {
      this.webSocket = new WebSocket(url);
      this.webSocket.onopen = () => {
        this.isConnectedToBackend = true;
        this.notify();
      };
      this.webSocket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.physics) this.physics = { ...this.physics, ...packet.physics };
          if (packet.hazard) this.hazard = { ...this.hazard, ...packet.hazard };
          if (packet.driver) this.driver = { ...this.driver, ...packet.driver };
          this.notify();
        } catch (e) {
          console.error('[SafePilot AI] Malformed telemetry frame:', e);
        }
      };
      this.webSocket.onclose = () => {
        this.isConnectedToBackend = false;
        this.notify();
      };
    } catch (e) {
      console.error('[SafePilot AI] Failed to initialize WebSocket:', e);
    }
  }
}

export const telemetryService = new TelemetryService();
telemetryService.startSimulation();
