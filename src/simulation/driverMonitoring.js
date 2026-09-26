/**
 * SafePilot AI - Driver Monitoring System (DMS) & Blink State Machine
 *
 * Implements temporal eye-tracking logic:
 *   OPEN -> CLOSING -> CLOSED -> RECOVERED
 *
 * Distinguishes between:
 *   - Normal short blinks (duration < 0.35s): Normal behavior, increments blink count, low risk.
 *   - Frequent/rapid blinking: Increases drowsiness index.
 *   - Prolonged closure (> 1.2s): Drowsiness Warning.
 *   - Persistent unresponsiveness (> 2.5s): Critical Driver State -> Emergency Mode trigger.
 */

import { SIMULATION_CONFIG } from './simulationConfig.js';

export const EYE_STATES = {
  OPEN: 'OPEN',
  CLOSING: 'CLOSING',
  CLOSED: 'CLOSED',
  RECOVERED: 'RECOVERED',
};

export const ATTENTION_LEVELS = {
  NORMAL: 'NORMAL',
  DISTRACTED: 'DISTRACTED',
  DROWSY: 'DROWSY',
  UNRESPONSIVE: 'UNRESPONSIVE',
};

export const DROWSINESS_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export class DriverMonitoringStateMachine {
  constructor(config = SIMULATION_CONFIG.DMS) {
    this.config = config;
    this.reset();
  }

  reset() {
    this.eyeState = EYE_STATES.OPEN;
    this.attentionLevel = ATTENTION_LEVELS.NORMAL;
    this.drowsinessLevel = DROWSINESS_LEVELS.LOW;
    this.drowsinessScore = 8; // 0 - 100
    this.driverRisk = 8; // 0 - 100
    this.blinkCount = 0;
    this.blinkRatePerMin = this.config.NORMAL_BLINK_RATE_PER_MIN;
    this.blinkRateStatus = 'NORMAL';
    this.currentClosureDuration = 0; // seconds current closure has lasted
    this.recentBlinks = []; // timestamps of recent blinks
    this.ear = this.config.EAR_OPEN; // Eye Aspect Ratio (0.05 - 0.35)
    this.warningActive = false;
    this.emergencyTriggered = false;
    this.simulationMode = 'AUTO'; // 'AUTO', 'DROWSY', 'REPEATED_BLINK', 'UNRESPONSIVE', 'MANUAL'
    this.simulatedTimer = 0;
    this.simulatedBlinkInterval = 3.5; // seconds between blinks
  }

  setSimulationMode(mode) {
    this.simulationMode = mode;
    this.simulatedTimer = 0;
    if (mode === 'DROWSY' || mode === 'UNRESPONSIVE') {
      this.drowsinessScore = Math.max(this.drowsinessScore, 50);
    }
  }

  /**
   * Step the DMS state machine
   * @param {number} dt Delta time in seconds
   * @param {Object} overrideInputs Optional manual inputs or scenario directives
   */
  update(dt, overrideInputs = {}) {
    this.simulatedTimer += dt;
    const now = performance.now();

    // Clean up blinks older than 60 seconds for running rate calculation
    this.recentBlinks = this.recentBlinks.filter((t) => now - t < 60000);
    this.blinkRatePerMin = Math.max(
      12,
      Math.min(50, Math.round(this.recentBlinks.length * (60000 / Math.max(10000, now - (this.recentBlinks[0] || now)))))
    );

    // Determine target eye closure intent based on simulation mode or overrides
    let targetEyelidClosed = false;

    if (overrideInputs.forcedEyeClosed !== undefined) {
      targetEyelidClosed = overrideInputs.forcedEyeClosed;
    } else {
      switch (this.simulationMode) {
        case 'DROWSY':
          // Slow, frequent droop and longer closures
          if (this.simulatedTimer > 2.0) {
            targetEyelidClosed = (this.simulatedTimer % 3.0) < 1.4;
          }
          break;

        case 'REPEATED_BLINK':
          // Rapid fluttering eye blinks (high frequency)
          targetEyelidClosed = (this.simulatedTimer % 0.8) < 0.25;
          break;

        case 'UNRESPONSIVE':
          // Persistent prolonged closure after 1.5s
          targetEyelidClosed = this.simulatedTimer > 1.2;
          break;

        case 'NORMAL':
        default:
          // Occasional normal short blink every 3.5 - 4.5 seconds
          const cycle = this.simulatedTimer % 4.0;
          targetEyelidClosed = cycle < 0.22;
          break;
      }
    }

    // Step the Eye State Transition Machine
    const previousState = this.eyeState;

    if (targetEyelidClosed) {
      if (this.eyeState === EYE_STATES.OPEN || this.eyeState === EYE_STATES.RECOVERED) {
        this.eyeState = EYE_STATES.CLOSING;
        this.currentClosureDuration = 0;
      } else if (this.eyeState === EYE_STATES.CLOSING) {
        this.currentClosureDuration += dt;
        if (this.currentClosureDuration >= 0.08) {
          this.eyeState = EYE_STATES.CLOSED;
        }
      } else if (this.eyeState === EYE_STATES.CLOSED) {
        this.currentClosureDuration += dt;
      }
    } else {
      if (this.eyeState === EYE_STATES.CLOSED || this.eyeState === EYE_STATES.CLOSING) {
        this.eyeState = EYE_STATES.RECOVERED;
        // Register a completed blink
        this.blinkCount += 1;
        this.recentBlinks.push(now);

        // Check if previous closure was abnormal
        if (this.currentClosureDuration >= this.config.ABNORMAL_CLOSURE_THRESHOLD_SEC) {
          this.drowsinessScore = Math.min(100, this.drowsinessScore + 18);
        } else {
          // Normal blink - slight decay of drowsiness if driver stays awake
          this.drowsinessScore = Math.max(8, this.drowsinessScore - 2 * dt);
        }
        this.currentClosureDuration = 0;
      } else if (this.eyeState === EYE_STATES.RECOVERED) {
        this.eyeState = EYE_STATES.OPEN;
      } else {
        // OPEN state - natural drowsiness decay if attentive
        if (this.simulationMode === 'NORMAL') {
          this.drowsinessScore = Math.max(8, this.drowsinessScore - 3 * dt);
        }
      }
    }

    // Eye Aspect Ratio (EAR) simulation for realistic metric display
    if (this.eyeState === EYE_STATES.CLOSED) {
      this.ear = THREE_lerp(this.ear, this.config.EAR_CLOSED, dt * 18);
    } else if (this.eyeState === EYE_STATES.CLOSING) {
      this.ear = THREE_lerp(this.ear, 0.14, dt * 20);
    } else if (this.eyeState === EYE_STATES.RECOVERED) {
      this.ear = THREE_lerp(this.ear, 0.28, dt * 15);
    } else {
      // Open
      const droopOffset = (this.drowsinessScore / 100) * 0.12;
      this.ear = THREE_lerp(this.ear, this.config.EAR_OPEN - droopOffset, dt * 10);
    }

    // Cumulative Drowsiness Evolution based on prolonged closure & abnormal frequency
    if (this.eyeState === EYE_STATES.CLOSED) {
      if (this.currentClosureDuration > this.config.ABNORMAL_CLOSURE_THRESHOLD_SEC) {
        // Accelerating drowsiness accumulation
        this.drowsinessScore = Math.min(100, this.drowsinessScore + 25 * dt);
      }
    }

    // Blink Rate classification
    if (this.recentBlinks.length >= 8 && this.blinkRatePerMin >= this.config.HIGH_BLINK_RATE_PER_MIN) {
      this.blinkRateStatus = 'HIGH';
      this.drowsinessScore = Math.min(100, this.drowsinessScore + 6 * dt);
    } else if (this.blinkRatePerMin > 24) {
      this.blinkRateStatus = 'ELEVATED';
    } else {
      this.blinkRateStatus = 'NORMAL';
    }

    // Drowsiness Level Classification
    if (this.drowsinessScore >= 80 || this.currentClosureDuration >= this.config.CRITICAL_UNRESPONSIVE_SEC) {
      this.drowsinessLevel = DROWSINESS_LEVELS.CRITICAL;
      this.attentionLevel = ATTENTION_LEVELS.UNRESPONSIVE;
      this.driverRisk = Math.min(100, Math.round(Math.max(88, this.drowsinessScore)));
    } else if (this.drowsinessScore >= 60 || this.currentClosureDuration >= this.config.DROWSINESS_WARNING_CLOSURE_SEC) {
      this.drowsinessLevel = DROWSINESS_LEVELS.HIGH;
      this.attentionLevel = ATTENTION_LEVELS.DROWSY;
      this.driverRisk = Math.round(this.drowsinessScore);
    } else if (this.drowsinessScore >= 35) {
      this.drowsinessLevel = DROWSINESS_LEVELS.MEDIUM;
      this.attentionLevel = ATTENTION_LEVELS.DISTRACTED;
      this.driverRisk = Math.round(this.drowsinessScore);
    } else {
      this.drowsinessLevel = DROWSINESS_LEVELS.LOW;
      this.attentionLevel = ATTENTION_LEVELS.NORMAL;
      this.driverRisk = Math.max(8, Math.round(this.drowsinessScore));
    }

    // Temporal Hazard Triggers:
    // Warning activates when Drowsiness becomes HIGH
    this.warningActive = this.drowsinessLevel === DROWSINESS_LEVELS.HIGH || this.drowsinessLevel === DROWSINESS_LEVELS.CRITICAL;

    // Emergency activates if driver remains prolonged unresponsive (> 2.8s closure or CRITICAL sustained)
    if (
      this.currentClosureDuration >= this.config.CRITICAL_UNRESPONSIVE_SEC ||
      (this.drowsinessLevel === DROWSINESS_LEVELS.CRITICAL && this.simulatedTimer > 3.0)
    ) {
      this.emergencyTriggered = true;
    } else if (this.simulationMode === 'NORMAL' && this.drowsinessScore < 30) {
      this.emergencyTriggered = false;
    }

    return this.getState();
  }

  getState() {
    return {
      eyeState: this.eyeState,
      attention: this.attentionLevel,
      drowsiness: this.drowsinessLevel,
      drowsinessPercent: Math.round(this.drowsinessScore),
      driverRisk: this.driverRisk,
      blinkCount: this.blinkCount,
      blinkRatePerMin: Math.max(14, this.blinkRatePerMin || 16),
      blinkRateStatus: this.blinkRateStatus,
      ear: Math.round(this.ear * 100) / 100,
      closureDurationSec: Math.round(this.currentClosureDuration * 10) / 10,
      warningActive: this.warningActive,
      emergencyTriggered: this.emergencyTriggered,
      cameraStatus: 'ACTIVE',
    };
  }
}

function THREE_lerp(start, end, alpha) {
  return start + (end - start) * Math.min(1, Math.max(0, alpha));
}
