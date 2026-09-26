/**
 * SafePilot AI - Simulation Configuration Parameters
 * Configurable thresholds for physics, steering, braking, driver monitoring, and emergency response.
 */

export const SIMULATION_CONFIG = {
  // Road & Lane Geometry
  ROAD: {
    WIDTH: 18.0, // meters
    LANE_WIDTH: 3.8, // meters
    MIN_X: -5.8, // Left road boundary (meters)
    MAX_X: 5.8, // Right road boundary (meters)
    LANES: {
      LEFT: -3.8,
      CENTER: 0.0,
      RIGHT: 3.8,
    },
  },

  // Steering Physics & Dynamics
  STEERING: {
    MAX_STEER_ANGLE_DEG: 28.0, // Maximum front wheel turn angle
    STEER_SPEED_DEG_PER_SEC: 65.0, // Rate of steering change
    CENTERING_SPEED_DEG_PER_SEC: 85.0, // Rate of return to center
    LATERAL_ACCEL_FACTOR: 3.2, // Lateral movement speed multiplier
    MAX_YAW_DEG: 7.5, // Body yaw angle during steering
    BODY_ROLL_FACTOR: 0.006, // Suspension roll per degree of steer
  },

  // Braking & Deceleration
  BRAKING: {
    CRUISE_SPEED_KMH: 48.0,
    MAX_SPEED_KMH: 85.0,
    NORMAL_ACCEL_RATE: 12.0, // km/h per sec
    NATURAL_DECEL_RATE: 8.0, // km/h per sec coasting
    MANUAL_BRAKE_DECEL_RATE: 32.0, // km/h per sec during manual braking
    AEB_EMERGENCY_DECEL_RATE: 42.0, // km/h per sec during AEB emergency
    SAFE_STOP_BUFFER_M: 6.8, // Minimum stopping distance ahead of obstacle
  },

  // Driver Monitoring System (DMS) & Blink State Machine
  DMS: {
    NORMAL_BLINK_DURATION_SEC: 0.28, // Normal eyelid closure (< 0.35s)
    ABNORMAL_CLOSURE_THRESHOLD_SEC: 0.65, // Prolonged closure considered abnormal
    DROWSINESS_WARNING_CLOSURE_SEC: 1.4, // Continuous closure triggering Warning
    CRITICAL_UNRESPONSIVE_SEC: 2.8, // Continuous closure triggering Emergency Mode
    NORMAL_BLINK_RATE_PER_MIN: 16,
    HIGH_BLINK_RATE_PER_MIN: 34,
    EAR_OPEN: 0.34, // Eye Aspect Ratio when open
    EAR_CLOSED: 0.05, // Eye Aspect Ratio when closed
  },

  // Risk Thresholds (Simulation Only)
  RISK: {
    LOW_MAX: 29,
    MEDIUM_MAX: 59,
    HIGH_MAX: 79,
    CRITICAL_MIN: 80,
  },

  // Control Hierarchy
  HIERARCHY: {
    NORMAL: 'NORMAL',
    WARNING: 'WARNING',
    HIGH_RISK: 'HIGH_RISK',
    CRITICAL: 'CRITICAL',
    EMERGENCY: 'EMERGENCY',
  },
};
