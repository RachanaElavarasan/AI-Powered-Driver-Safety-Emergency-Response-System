/**
 * Comprehensive Automated Validation Test for SafePilot AI Feature Expansion
 */

import { telemetryService } from '../services/telemetryService.js';
import { authService } from '../services/authService.js';
import { tripService } from '../services/tripService.js';
import { settingsService } from '../services/settingsService.js';
import { SCENARIOS } from '../simulation/scenarios.js';

async function runTests() {
  console.log('====================================================');
  console.log('  SAFEPILOT AI - COMPREHENSIVE ACCEPTANCE TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
    }
  }

  // TEST 1: Authentication & Driver Profile & Emergency Contacts
  console.log('--- TEST 1: Auth & Driver Profile & Emergency Contacts ---');
  authService.logout();
  assert(!authService.isAuthenticated(), 'User is logged out initially');

  const loggedUser = await authService.login({
    email: 'alex.mercer@safepilot.ai',
    password: 'password123',
  });
  assert(authService.isAuthenticated(), 'User successfully authenticated');
  assert(loggedUser.name === 'Alex Mercer', 'Driver name correctly populated: Alex Mercer');
  assert(loggedUser.licenseNumber === 'CA-948201-DL', 'Driver license verified: CA-948201-DL');

  const initialContacts = authService.getEmergencyContacts();
  assert(initialContacts.length >= 2, `Emergency contacts loaded (${initialContacts.length} contacts)`);

  const added = authService.addEmergencyContact({
    name: 'David Vance',
    relationship: 'Brother',
    phone: '+1 (415) 555-9988',
    isPrimary: false,
    notifyOnAEB: true,
  });
  let contactsList = authService.getEmergencyContacts();
  assert(contactsList.some((c) => c.name === 'David Vance'), 'Successfully added emergency contact: David Vance');

  authService.setPrimaryContact(added.id);
  contactsList = authService.getEmergencyContacts();
  const primary = contactsList.find((c) => c.id === added.id);
  assert(primary?.isPrimary === true, 'Successfully set contact as primary');

  authService.removeEmergencyContact(added.id);
  assert(!authService.getEmergencyContacts().some((c) => c.id === added.id), 'Successfully removed emergency contact');

  // TEST 2: Central Simulation State Structure
  console.log('\n--- TEST 2: Central Simulation State Structure & Fields ---');
  const state = telemetryService.getSimulationState();
  const reqFields = [
    'scenario',
    'speed',
    'acceleration',
    'braking',
    'distance',
    'relativeSpeed',
    'ttc',
    'driverRisk',
    'vehicleRisk',
    'collisionRisk',
    'environmentRisk',
    'riskScore',
    'riskLevel',
    'action',
    'safetyScore',
    'safetyBreakdown',
    'eventTimeline',
    'notifications',
    'detectedObjects',
    'objectCounts',
    'vehicleHealth',
    'sensors',
    'degradedSensor',
    'simulationControls',
    'riskMapPoints',
  ];

  for (const field of reqFields) {
    assert(state[field] !== undefined, `State contains required field '${field}'`);
  }

  // TEST 3: Dynamic Safety Score Calculation
  console.log('\n--- TEST 3: Dynamic Safety Score Calculation ---');
  assert(state.safetyScore >= 0 && state.safetyScore <= 100, `Safety score is bounded: ${state.safetyScore}/100`);
  assert(state.safetyBreakdown.driverScore !== undefined, 'Safety breakdown includes driverScore');
  assert(state.safetyBreakdown.collisionScore !== undefined, 'Safety breakdown includes collisionScore');

  // TEST 4: NORMAL DRIVING Cruising Verification
  console.log('\n--- TEST 4: NORMAL DRIVING Cruising Verification ---');
  telemetryService.resetSimulation();
  for (let i = 0; i < 30; i++) telemetryService.stepSimulation(0.05);
  const normalState = telemetryService.getSimulationState();
  assert(normalState.speed >= 40 && normalState.speed <= 52, `Normal speed in 40-50 km/h range (Actual: ${normalState.speed} km/h)`);
  assert(normalState.riskLevel === 'LOW', `Normal driving risk is LOW (Score: ${normalState.riskScore})`);
  assert(normalState.action === 'NORMAL DRIVING', `Action is 'NORMAL DRIVING'`);
  assert(normalState.safetyScore >= 80, `Normal cruise has high safety score: ${normalState.safetyScore}`);

  // TEST 5: Complete Connected Chain: SUDDEN BRAKING -> AEB -> Events -> Timeline -> Safe Halt
  console.log('\n--- TEST 5: Connected Chain: SUDDEN BRAKING -> High Risk -> Speed Reduction -> AEB -> Stop ---');
  telemetryService.resetSimulation();
  telemetryService.setScenario(SCENARIOS.SUDDEN_BRAKING);
  const brakeInitial = telemetryService.getSimulationState();
  assert(brakeInitial.scenario === SCENARIOS.SUDDEN_BRAKING, 'Scenario set to SUDDEN_BRAKING');

  // Step simulation through aggressive braking
  let sawHighOrCritical = false;
  let sawAEB = false;

  for (let step = 0; step < 70; step++) {
    telemetryService.stepSimulation(0.05);
    const curr = telemetryService.getSimulationState();
    if (curr.riskLevel === 'HIGH' || curr.riskLevel === 'CRITICAL') sawHighOrCritical = true;
    if (curr.action === 'AUTOMATIC BRAKING') sawAEB = true;
  }

  assert(sawHighOrCritical, 'SUDDEN BRAKING elevated risk level to HIGH/CRITICAL');
  assert(sawAEB, 'Automatic Emergency Braking (AEB) safety action engaged');

  // Step to complete vehicle halt
  for (let step = 0; step < 80; step++) {
    telemetryService.stepSimulation(0.05);
  }
  const haltedState = telemetryService.getSimulationState();
  assert(haltedState.speed <= 0.5, `Vehicle safely stopped at: ${haltedState.speed} km/h`);
  assert(haltedState.distance >= 5.5, `Maintained safe stopping distance ahead: ${haltedState.distance}m`);
  assert(haltedState.eventTimeline.length > 1, `Live Risk Timeline recorded events (${haltedState.eventTimeline.length} events logged)`);

  // TEST 6: AI Perception Object Detection
  console.log('\n--- TEST 6: AI Perception Object Tracking ---');
  assert(haltedState.detectedObjects.length >= 2, `Perception tracks multiple targets (${haltedState.detectedObjects.length} targets)`);
  const leadObj = haltedState.detectedObjects[0];
  assert(leadObj.direction === 'AHEAD', `Lead hazard direction is AHEAD`);
  assert(leadObj.distanceM === haltedState.distance, `Lead target distance matches central distance: ${leadObj.distanceM}m`);

  // TEST 7: Simulation Lab Scenarios (CUT_IN, PEDESTRIAN, UNRESPONSIVE)
  console.log('\n--- TEST 7: Simulation Lab Additional Scenarios ---');
  telemetryService.setScenario(SCENARIOS.VEHICLE_CUT_IN);
  telemetryService.stepSimulation(0.1);
  const cutInState = telemetryService.getSimulationState();
  assert(cutInState.scenario === SCENARIOS.VEHICLE_CUT_IN, 'VEHICLE_CUT_IN active');

  telemetryService.setScenario(SCENARIOS.PEDESTRIAN_CROSSING);
  telemetryService.stepSimulation(0.1);
  const pedState = telemetryService.getSimulationState();
  assert(pedState.hazard.type === 'PEDESTRIAN', 'PEDESTRIAN_CROSSING spawns pedestrian hazard');

  telemetryService.setScenario(SCENARIOS.DRIVER_UNRESPONSIVE);
  telemetryService.stepSimulation(0.1);
  const unrespState = telemetryService.getSimulationState();
  assert(unrespState.driverState.attention === 'UNRESPONSIVE', 'DRIVER_UNRESPONSIVE triggers unresponsiveness');
  assert(unrespState.driverRisk >= 90, `Driver risk critical: ${unrespState.driverRisk}%`);

  // TEST 8: Weather & Road Condition Modifiers
  console.log('\n--- TEST 8: Environmental Modifiers ---');
  telemetryService.setWeather('RAIN');
  const rainState = telemetryService.getSimulationState();
  assert(rainState.environment.weather === 'RAIN', 'Weather set to RAIN');
  assert(rainState.environment.environmentRisk >= 25, `Rain increases environment risk: ${rainState.environment.environmentRisk}%`);

  telemetryService.setRoadCondition('POOR_SURFACE');
  const roadState = telemetryService.getSimulationState();
  assert(roadState.environment.roadCondition === 'POOR_SURFACE', 'Road condition set to POOR_SURFACE');

  // TEST 9: Vehicle Health & Degraded Sensor
  console.log('\n--- TEST 9: Vehicle Health & Degraded Sensor ---');
  assert(!telemetryService.degradedSensor, 'Sensor initially online');
  telemetryService.toggleDegradedSensor();
  assert(telemetryService.degradedSensor, 'Sensor degraded mode active');
  const degradedState = telemetryService.getSimulationState();
  assert(degradedState.vehicleHealth.camera === 'DEGRADED', 'Camera health marked DEGRADED');
  assert(degradedState.vehicleHealth.systemHealthScore < 90, `Health score reflects degraded sensor: ${degradedState.vehicleHealth.systemHealthScore}%`);
  telemetryService.toggleDegradedSensor(); // restore
  assert(!telemetryService.degradedSensor, 'Sensor restored to online');

  // TEST 10: Trip History Service & Settings Service
  console.log('\n--- TEST 10: Trip History & Settings Services ---');
  const trips = tripService.getTrips();
  assert(trips.length >= 3, `Trip history loaded ${trips.length} trips`);
  const firstTrip = tripService.getTripById(trips[0].id);
  assert(firstTrip.speedHistory.length > 0, 'Trip contains speed history curve');
  assert(firstTrip.ttcHistory.length > 0, 'Trip contains TTC history curve');

  const settings = settingsService.getSettings();
  assert(settings.driverPreferences.voiceAlerts !== undefined, 'Settings service holds voiceAlerts');
  settingsService.toggleSetting('driverPreferences', 'voiceAlerts');
  const updatedSettings = settingsService.getSettings();
  assert(updatedSettings.driverPreferences.voiceAlerts !== settings.driverPreferences.voiceAlerts, 'Settings toggle operates correctly');

  // TEST 11: RESET SIMULATION
  console.log('\n--- TEST 11: RESET SIMULATION ---');
  telemetryService.resetSimulation();
  const resetState = telemetryService.getSimulationState();
  assert(resetState.scenario === SCENARIOS.NORMAL, 'Reset restores NORMAL scenario');
  assert(resetState.riskLevel === 'LOW', 'Reset restores LOW risk');
  assert(!resetState.emergencyActive, 'Reset clears emergency state');

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
