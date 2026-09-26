/**
 * SafePilot AI - Time-To-Collision (TTC) & Kinematics Calculator
 */

export const TTC_THRESHOLDS = {
  CRITICAL: 1.8, // seconds - AEB required
  HIGH: 3.2,     // seconds - Speed reduction & FCW (Forward Collision Warning)
  MEDIUM: 5.0,   // seconds - Visual alert / tracking
  SAFE: 8.0,     // seconds - Nominal safe distance
};

/**
 * Calculate Time-to-Collision between ego vehicle and target
 * @param {number} distanceM Distance to target in meters
 * @param {number} egoSpeedKmh Ego vehicle speed in km/h
 * @param {number} targetSpeedKmh Target vehicle speed in km/h
 * @returns {Object} TTC in seconds, relative speed, and danger level
 */
export function calculateTTC(distanceM, egoSpeedKmh, targetSpeedKmh) {
  // Convert speeds to m/s
  const egoSpeedMps = (egoSpeedKmh * 1000) / 3600;
  const targetSpeedMps = (targetSpeedKmh * 1000) / 3600;
  
  // Closing velocity (positive means closing in)
  const relativeSpeedMps = egoSpeedMps - targetSpeedMps;
  const relativeSpeedKmh = Math.round((egoSpeedKmh - targetSpeedKmh) * 10) / 10;

  if (distanceM <= 0.1) {
    return {
      ttc: 0.1,
      ttcDisplay: '0.1s',
      relativeSpeedKmh,
      dangerLevel: 'CRITICAL',
      isClosing: true,
      safeDistanceM: 20,
    };
  }

  // Safe 2-second following rule distance
  const safeDistanceM = Math.max(12, Math.round(egoSpeedMps * 2.0));

  let ttc = 99.9;
  let isClosing = relativeSpeedMps > 0.05;

  if (isClosing) {
    ttc = distanceM / relativeSpeedMps;
  } else {
    // If target is matching, pulling away, or both stopped, TTC is SAFE / infinite
    ttc = 99.9;
  }

  // Bound TTC
  const clampedTTC = Math.max(0.1, Math.min(99.9, ttc));
  const roundedTTC = Math.round(clampedTTC * 10) / 10;

  let dangerLevel = 'LOW';
  if (isClosing) {
    if (roundedTTC <= TTC_THRESHOLDS.CRITICAL) {
      dangerLevel = 'CRITICAL';
    } else if (roundedTTC <= TTC_THRESHOLDS.HIGH) {
      dangerLevel = 'HIGH';
    } else if (roundedTTC <= TTC_THRESHOLDS.MEDIUM) {
      dangerLevel = 'MEDIUM';
    }
  }

  return {
    ttc: roundedTTC,
    ttcDisplay: !isClosing || roundedTTC >= 90 ? 'SAFE' : `${roundedTTC.toFixed(1)} s`,
    relativeSpeedKmh,
    dangerLevel,
    isClosing,
    safeDistanceM,
  };
}
