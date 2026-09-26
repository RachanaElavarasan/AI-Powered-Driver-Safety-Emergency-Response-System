/**
 * SafePilot AI - Vehicle Physics & Dynamic State Simulator
 * 
 * Enhanced to support:
 * - Interactive steering control with smooth angular interpolation
 * - Lateral velocity kinematics & strict road boundaries enforcement
 * - Dynamic yaw rotation (heading angle) & suspension body roll
 * - Dual-mode braking (Manual Driver Braking + AI AEB Safety Braking)
 * - Wheel yaw and rolling angular velocities
 */

import { SIMULATION_CONFIG } from './simulationConfig.js';

export const INITIAL_PHYSICS_STATE = {
  speedKmh: 48.0,
  targetSpeedKmh: 48.0,
  accelerationMps2: 0.0,
  brakingPercent: 0,
  throttlePercent: 35,

  // Lateral Position & Steering State (Requirement 2 & 13)
  steeringInput: 0, // -1.0 (Left) to +1.0 (Right)
  steeringAngle: 0.0, // Degrees: -28° to +28°
  steeringAngleDeg: 0.0, // Alias for backward compatibility
  vehicleX: 0.0, // Lateral position in meters (-5.8m to +5.8m)
  vehicleRotation: 0.0, // Body yaw angle in radians
  currentLane: 'CENTER LANE', // 'LEFT LANE', 'CENTER LANE', 'RIGHT LANE'
  laneOffset: 0.0, // Normalized lane offset (-1.0 to +1.0)
  targetLaneOffset: 0.0,

  // Suspension Dynamics
  pitch: 0.0, // Suspension tilt: negative = nose down (braking), positive = nose up
  roll: 0.0,  // Body roll on lateral steering
  wheelRotation: 0.0, // Rolling wheel rotation around axle
  frontWheelYaw: 0.0, // Front steering wheel turn angle in radians

  odometerKm: 1420.5,
  gear: 'D',
  brakeActive: false,
};

/**
 * Step vehicle physics one tick
 * @param {Object} current Current physics state
 * @param {number} delta Delta time in seconds (e.g. 1/60)
 * @param {Object} controlParams Safety controller inputs { targetSpeedKmh, emergencyBrake, brakeForce, steeringInput, centerSteering, manualBrake }
 */
export function updateVehiclePhysics(current, delta, controlParams = {}) {
  const dt = Math.min(delta, 0.1);
  const cfg = SIMULATION_CONFIG;

  let {
    targetSpeedKmh,
    emergencyBrake = false,
    brakeForce = 0,
    steeringInput = current.steeringInput,
    centerSteering = false,
    manualBrake = false,
    automaticControl = false,
  } = controlParams;

  if (targetSpeedKmh === undefined) {
    targetSpeedKmh = current.targetSpeedKmh;
  }

  // If centering requested, reset steering input
  if (centerSteering) {
    steeringInput = 0;
  }

  // 1. Interactive Steering Angle Interpolation (No teleportation)
  let currentSteerAngle = current.steeringAngle || 0;
  const targetSteerAngle = steeringInput * cfg.STEERING.MAX_STEER_ANGLE_DEG;

  if (Math.abs(steeringInput) > 0.05) {
    // Turning smoothly towards target angle
    const steerStep = cfg.STEERING.STEER_SPEED_DEG_PER_SEC * dt;
    if (currentSteerAngle < targetSteerAngle) {
      currentSteerAngle = Math.min(targetSteerAngle, currentSteerAngle + steerStep);
    } else if (currentSteerAngle > targetSteerAngle) {
      currentSteerAngle = Math.max(targetSteerAngle, currentSteerAngle - steerStep);
    }
  } else {
    // Smoothly return towards center (0 degrees)
    const centerStep = cfg.STEERING.CENTERING_SPEED_DEG_PER_SEC * dt;
    if (currentSteerAngle > 0.5) {
      currentSteerAngle = Math.max(0, currentSteerAngle - centerStep);
    } else if (currentSteerAngle < -0.5) {
      currentSteerAngle = Math.min(0, currentSteerAngle + centerStep);
    } else {
      currentSteerAngle = 0;
    }
  }

  // 2. Braking & Longitudinal Kinematics
  let currentSpeed = current.speedKmh;
  let accel = 0;
  let brake = current.brakingPercent;
  let throttle = current.throttlePercent;
  const isManualBrakeActive = manualBrake || (controlParams.manualBrakingPercent > 0);

  if (emergencyBrake) {
    // AI Autonomous Emergency Braking (AEB)
    const decelRate = cfg.BRAKING.AEB_EMERGENCY_DECEL_RATE; // ~42 km/h per second
    currentSpeed = Math.max(0, currentSpeed - decelRate * dt);
    if (currentSpeed < 0.6) currentSpeed = 0.0;
    accel = -8.5;
    brake = 100;
    throttle = 0;
  } else if (isManualBrakeActive) {
    // Manual Driver Brake Pedal
    const manualForce = controlParams.manualBrakingPercent !== undefined ? controlParams.manualBrakingPercent : 85;
    const decelRate = cfg.BRAKING.MANUAL_BRAKE_DECEL_RATE * (manualForce / 100);
    currentSpeed = Math.max(0, currentSpeed - decelRate * dt);
    if (currentSpeed < 0.5) currentSpeed = 0.0;
    accel = -(manualForce / 100) * 6.5;
    brake = manualForce;
    throttle = 0;
  } else if (brakeForce > 0) {
    // Controlled AI speed reduction
    const decelRate = 18.0 * (brakeForce / 100);
    currentSpeed = Math.max(targetSpeedKmh, currentSpeed - decelRate * dt);
    accel = -(brakeForce / 100) * 4.2;
    brake = brakeForce;
    throttle = 0;
  } else {
    // Normal autonomous cruising / acceleration
    if (currentSpeed < targetSpeedKmh) {
      const accelRate = cfg.BRAKING.NORMAL_ACCEL_RATE;
      currentSpeed = Math.min(targetSpeedKmh, currentSpeed + accelRate * dt);
      accel = 1.4;
      throttle = 55;
      brake = Math.max(0, brake - 250 * dt);
    } else if (currentSpeed > targetSpeedKmh) {
      const naturalDecel = cfg.BRAKING.NATURAL_DECEL_RATE;
      currentSpeed = Math.max(targetSpeedKmh, currentSpeed - naturalDecel * dt);
      accel = -1.6;
      throttle = 10;
      brake = Math.min(45, (currentSpeed - targetSpeedKmh) * 1.5);
    } else {
      accel = 0.04 * Math.sin(Date.now() * 0.002);
      brake = 0;
      throttle = Math.min(60, Math.max(20, currentSpeed * 0.5));
    }
  }

  // 3. Lateral Movement Kinematics (Steering affects vehicle lateral position)
  let vehicleX = current.vehicleX || 0;
  const speedMps = (currentSpeed * 1000) / 3600;

  if (Math.abs(currentSteerAngle) > 0.1 && currentSpeed > 0.5) {
    // Lateral velocity based on front steering angle and vehicle forward speed
    // Steer Right (> 0) moves positive X, Steer Left (< 0) moves negative X
    const steerRad = (currentSteerAngle * Math.PI) / 180;
    const lateralSpeedMps = speedMps * Math.sin(steerRad) * (cfg.STEERING.LATERAL_ACCEL_FACTOR / 2.0);
    vehicleX += lateralSpeedMps * dt;
  }

  // Strict road boundaries clamp (Never leaves the paved road)
  vehicleX = Math.max(cfg.ROAD.MIN_X, Math.min(cfg.ROAD.MAX_X, vehicleX));

  // Determine current lane from lateral position
  let currentLane = 'CENTER LANE';
  if (vehicleX < -1.8) {
    currentLane = 'LEFT LANE';
  } else if (vehicleX > 1.8) {
    currentLane = 'RIGHT LANE';
  }

  const laneOffset = vehicleX / cfg.ROAD.LANE_WIDTH;

  // 4. Vehicle Heading Rotation (Yaw) & Body Roll
  // When steering, vehicle rotates slightly in heading yaw angle
  const targetYawRad = (currentSteerAngle / cfg.STEERING.MAX_STEER_ANGLE_DEG) * (cfg.STEERING.MAX_YAW_DEG * (Math.PI / 180));
  const vehicleRotation = THREE_lerp(current.vehicleRotation || 0, targetYawRad, dt * 6);

  // Body roll: suspension rolls slightly into/away from the turn
  const targetRoll = -(currentSteerAngle / cfg.STEERING.MAX_STEER_ANGLE_DEG) * 0.06;
  const roll = THREE_lerp(current.roll || 0, targetRoll, dt * 5);

  // Suspension pitch: nose dips forward under braking, slight squat under acceleration
  const targetPitch = accel < 0 ? Math.max(-0.065, accel * 0.009) : Math.min(0.025, accel * 0.006);
  const pitch = THREE_lerp(current.pitch || 0, targetPitch, dt * 8);

  // Front wheels steering turn angle (radians)
  const frontWheelYaw = (currentSteerAngle * Math.PI) / 180;

  // Rolling wheel rotation (radians around horizontal axis)
  const wheelRadius = 0.33;
  const angularVelocity = speedMps / wheelRadius;
  const wheelRotation = (current.wheelRotation + angularVelocity * dt) % (Math.PI * 2);

  // Odometer
  const odometerKm = current.odometerKm + (speedMps * dt) / 1000;

  // Gear indicator
  const gear = currentSpeed < 0.5 ? 'P' : 'D';
  const brakeActive = brake > 8;

  return {
    ...current,
    speedKmh: Math.round(currentSpeed * 10) / 10,
    targetSpeedKmh,
    accelerationMps2: Math.round(accel * 10) / 10,
    brakingPercent: Math.round(brake),
    throttlePercent: Math.round(throttle),

    // Steering & Lateral
    steeringInput,
    steeringAngle: Math.round(currentSteerAngle * 10) / 10,
    steeringAngleDeg: Math.round(currentSteerAngle * 10) / 10,
    vehicleX: Math.round(vehicleX * 100) / 100,
    vehicleRotation,
    currentLane,
    laneOffset: Math.round(laneOffset * 100) / 100,
    targetLaneOffset: laneOffset,

    // 3D Visual Angles
    pitch,
    roll,
    frontWheelYaw,
    wheelRotation,

    odometerKm: Math.round(odometerKm * 100) / 100,
    gear,
    brakeActive,
  };
}

function THREE_lerp(start, end, alpha) {
  return start + (end - start) * Math.min(1, Math.max(0, alpha));
}
