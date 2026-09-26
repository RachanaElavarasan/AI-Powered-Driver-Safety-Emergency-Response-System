/**
 * SafePilot AI - AI Risk Engine
 * Multi-factor risk assessment synthesizing:
 * - Driver Risk (Eye state, drowsiness, distraction)
 * - Vehicle Risk (Braking status, tire traction, system health)
 * - Collision Risk (TTC, closing velocity, obstacle proximity)
 * - Environment Risk (Weather, road surface, visibility, lighting)
 */

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Weights for composite risk score
 */
const WEIGHTS = {
  COLLISION: 0.40,
  DRIVER: 0.30,
  ENVIRONMENT: 0.15,
  VEHICLE: 0.15,
};

/**
 * Evaluate composite risk score and recommended safety action
 * @param {Object} inputs { driverRisk, vehicleRisk, collisionRisk, environmentRisk, ttc }
 * @returns {Object} Composite risk metrics, level, and safety action
 */
export function evaluateRiskEngine(inputs) {
  const {
    driverRisk = 10,       // 0 - 100
    vehicleRisk = 5,       // 0 - 100
    collisionRisk = 12,    // 0 - 100
    environmentRisk = 10,  // 0 - 100
    ttc = 99.9,
  } = inputs;

  // Composite weighted score (0 - 100)
  let rawScore =
    collisionRisk * WEIGHTS.COLLISION +
    driverRisk * WEIGHTS.DRIVER +
    environmentRisk * WEIGHTS.ENVIRONMENT +
    vehicleRisk * WEIGHTS.VEHICLE;

  // If TTC is dangerously low or proximity close, collision risk overrides to ensure safety trigger
  if (collisionRisk >= 90 || ttc <= 2.2) {
    rawScore = Math.max(rawScore, 88); // CRITICAL -> AUTOMATIC BRAKING
  } else if (collisionRisk >= 70 || ttc <= 3.8) {
    rawScore = Math.max(rawScore, 68); // HIGH -> SPEED REDUCTION
  }

  // When driver attention drops / drowsiness detected, elevate risk score
  if (driverRisk >= 80) {
    rawScore = Math.max(rawScore, 68); // HIGH -> SPEED REDUCTION
  } else if (driverRisk >= 40) {
    rawScore = Math.max(rawScore, 38); // MEDIUM -> DRIVER WARNING
  }

  const riskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let riskLevel = RISK_LEVELS.LOW;
  let safetyAction = 'NORMAL DRIVING';
  let actionCode = 'NONE';
  let badgeColor = 'emerald';
  let warningMessage = 'All Systems Nominal';

  // Strict specification thresholds: 0-29 LOW, 30-59 MEDIUM, 60-79 HIGH, 80-100 CRITICAL
  if (riskScore >= 80) {
    riskLevel = RISK_LEVELS.CRITICAL;
    safetyAction = 'AUTOMATIC BRAKING';
    actionCode = 'AEB_ACTIVE';
    badgeColor = 'rose';
    warningMessage = 'CRITICAL RISK — AUTOMATIC BRAKING ENGAGED';
  } else if (riskScore >= 60) {
    riskLevel = RISK_LEVELS.HIGH;
    safetyAction = 'SPEED REDUCTION';
    actionCode = 'SPEED_DECEL';
    badgeColor = 'amber';
    warningMessage = 'HIGH RISK — SPEED REDUCTION ACTIVE';
  } else if (riskScore >= 30) {
    riskLevel = RISK_LEVELS.MEDIUM;
    safetyAction = 'DRIVER WARNING';
    actionCode = 'CAUTION_ALERT';
    badgeColor = 'yellow';
    warningMessage = 'DRIVER WARNING — HAZARD DETECTED';
  } else {
    riskLevel = RISK_LEVELS.LOW;
    safetyAction = 'NORMAL DRIVING';
    actionCode = 'NOMINAL';
    badgeColor = 'emerald';
    warningMessage = 'LANE CLEAR — AUTONOMOUS CRUISE';
  }

  return {
    riskScore,
    riskLevel,
    safetyAction,
    actionCode,
    badgeColor,
    warningMessage,
    breakdown: {
      driverRisk: Math.round(driverRisk),
      vehicleRisk: Math.round(vehicleRisk),
      collisionRisk: Math.round(collisionRisk),
      environmentRisk: Math.round(environmentRisk),
    },
  };
}
