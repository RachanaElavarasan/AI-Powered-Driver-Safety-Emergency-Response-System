/**
 * SafePilot AI - Modular Trip History Service
 * 
 * Modular architecture: local storage persistence ready for seamless
 * FastAPI / PostgreSQL integration (e.g. GET /api/trips, POST /api/trips).
 */

const STORAGE_KEY = 'safepilot_trip_history';

const SEED_TRIPS = [
  {
    id: 'trip-today-1',
    dateLabel: 'Today',
    timeLabel: '10:42 AM',
    distanceKm: 12.4,
    durationMin: 42,
    safetyScore: 94,
    warnings: 1,
    criticalEvents: 0,
    startLocation: 'Financial District, SF',
    endLocation: 'Silicon Valley Campus',
    weather: 'CLEAR',
    road: 'DRY',
    speedHistory: [48, 49, 50, 48, 45, 42, 48, 50, 48, 47, 49, 48, 45, 30, 0, 42, 48],
    ttcHistory: [9.5, 8.2, 7.8, 6.5, 5.2, 4.8, 6.0, 7.5, 8.0, 9.2, 8.4, 4.2, 3.8, 2.5, 99.9, 8.5, 9.0],
    riskHistory: [10, 12, 11, 15, 22, 28, 18, 14, 12, 10, 15, 38, 52, 65, 10, 12, 10],
    brakingEvents: [
      { time: '10:55 AM', speedBefore: 48, speedAfter: 30, trigger: 'Traffic congestion slowdown', severity: 'MILD' },
      { time: '11:12 AM', speedBefore: 45, speedAfter: 0, trigger: 'Autonomous stop at intersection', severity: 'CONTROLLED' }
    ],
    drowsinessEvents: [
      { time: '11:04 AM', durationSec: 3.2, eyeState: 'DROOPY', warningIssued: true }
    ],
    detectedHazards: [
      { time: '10:48 AM', type: 'VEHICLE', distanceM: 24.5, relativeSpeedKmh: -8.0 },
      { time: '11:10 AM', type: 'ROAD_CONSTRUCTION', distanceM: 45.0, relativeSpeedKmh: 0.0 }
    ],
    emergencyEvents: []
  },
  {
    id: 'trip-yesterday-1',
    dateLabel: 'Yesterday',
    timeLabel: '05:20 PM',
    distanceKm: 18.7,
    durationMin: 51,
    safetyScore: 88,
    warnings: 3,
    criticalEvents: 0,
    startLocation: 'SOMA Center',
    endLocation: 'Palo Alto Tech Hub',
    weather: 'RAIN',
    road: 'WET',
    speedHistory: [45, 42, 40, 38, 30, 25, 40, 44, 42, 35, 28, 20, 0, 35, 42, 44],
    ttcHistory: [7.2, 6.5, 5.8, 4.2, 3.2, 2.8, 5.0, 6.2, 5.5, 4.0, 3.1, 2.2, 99.9, 6.0, 7.2, 8.0],
    riskHistory: [20, 24, 28, 45, 62, 74, 35, 25, 28, 48, 65, 78, 15, 22, 20, 18],
    brakingEvents: [
      { time: '05:32 PM', speedBefore: 42, speedAfter: 25, trigger: 'Lead vehicle sudden deceleration in wet conditions', severity: 'MODERATE' },
      { time: '05:48 PM', speedBefore: 38, speedAfter: 0, trigger: 'Automated pedestrian yield', severity: 'CONTROLLED' }
    ],
    drowsinessEvents: [
      { time: '05:40 PM', durationSec: 4.5, eyeState: 'CLOSED (WARNING)', warningIssued: true },
      { time: '05:55 PM', durationSec: 2.8, eyeState: 'DROOPY', warningIssued: true }
    ],
    detectedHazards: [
      { time: '05:28 PM', type: 'VEHICLE_CUT_IN', distanceM: 18.2, relativeSpeedKmh: -12.5 },
      { time: '05:45 PM', type: 'STATIONARY_OBSTACLE', distanceM: 32.0, relativeSpeedKmh: 0.0 }
    ],
    emergencyEvents: []
  },
  {
    id: 'trip-prev-2',
    dateLabel: '3 Days Ago',
    timeLabel: '08:15 AM',
    distanceKm: 31.2,
    durationMin: 68,
    safetyScore: 96,
    warnings: 0,
    criticalEvents: 0,
    startLocation: 'Marin County',
    endLocation: 'SF Downtown',
    weather: 'CLEAR',
    road: 'DRY',
    speedHistory: [52, 54, 52, 50, 48, 52, 50, 48, 52, 54, 50, 48, 50, 52],
    ttcHistory: [10, 9.8, 9.2, 8.5, 8.0, 8.8, 9.0, 8.6, 9.2, 9.5, 8.8, 8.4, 9.0, 9.2],
    riskHistory: [8, 9, 8, 10, 12, 10, 9, 11, 8, 9, 10, 12, 10, 8],
    brakingEvents: [],
    drowsinessEvents: [],
    detectedHazards: [
      { time: '08:35 AM', type: 'LEAD_VEHICLE', distanceM: 52.0, relativeSpeedKmh: 0.0 }
    ],
    emergencyEvents: []
  }
];

class TripService {
  constructor() {
    this.trips = [...SEED_TRIPS];
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.trips = JSON.parse(stored);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trips));
      }
    } catch {
      // Fallback to in-memory seed
    }
  }

  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trips));
      } catch (e) {
        console.error('Failed to save trip to localStorage:', e);
      }
    }
  }

  getTrips() {
    return [...this.trips];
  }

  getTripById(id) {
    return this.trips.find((t) => t.id === id) || this.trips[0];
  }

  addTrip(tripData) {
    const newTrip = {
      id: `trip-${Date.now()}`,
      dateLabel: 'Today',
      timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: tripData.distanceKm || 5.2,
      durationMin: tripData.durationMin || 14,
      safetyScore: tripData.safetyScore || 92,
      warnings: tripData.warnings || 0,
      criticalEvents: tripData.criticalEvents || 0,
      startLocation: 'Current Simulation Origin',
      endLocation: 'Safe Destination Halt',
      weather: tripData.weather || 'CLEAR',
      road: tripData.road || 'DRY',
      speedHistory: tripData.speedHistory || [48, 48, 45, 30, 0],
      ttcHistory: tripData.ttcHistory || [8.5, 6.0, 3.2, 1.8, 99.9],
      riskHistory: tripData.riskHistory || [10, 25, 65, 95, 10],
      brakingEvents: tripData.brakingEvents || [],
      drowsinessEvents: tripData.drowsinessEvents || [],
      detectedHazards: tripData.detectedHazards || [],
      emergencyEvents: tripData.emergencyEvents || []
    };

    this.trips = [newTrip, ...this.trips];
    this.saveToStorage();
    return newTrip;
  }
}

export const tripService = new TripService();
