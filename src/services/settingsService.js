/**
 * SafePilot AI - Settings Management Service
 * 
 * Manages Driver Preferences, Emergency Configuration,
 * and Simulation Visualization toggles with local storage persistence.
 */

const STORAGE_KEY = 'safepilot_app_settings';

const DEFAULT_SETTINGS = {
  driverPreferences: {
    voiceAlerts: true,
    warningNotifications: true,
    hapticFeedback: false,
    autoCruiseResume: true,
  },
  emergency: {
    automaticFamilyNotification: true,
    gpsLocationSharing: true,
    incidentDetailsSharing: true,
    emergencyCallWorkflow: true,
  },
  simulationVisualization: {
    detectionBoxes: true,
    ttcDisplay: true,
    trajectory: true,
    radar: true,
    trackingLines: true,
  },
};

class SettingsService {
  constructor() {
    this.listeners = new Set();
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.load();
  }

  load() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to default
    }
  }

  save() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.settings);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.settings);
    }
  }

  getSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  updateCategory(category, updates) {
    if (this.settings[category]) {
      this.settings[category] = { ...this.settings[category], ...updates };
      this.save();
    }
  }

  toggleSetting(category, key) {
    if (this.settings[category] && typeof this.settings[category][key] === 'boolean') {
      this.settings[category][key] = !this.settings[category][key];
      this.save();
    }
  }

  resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.save();
  }
}

export const settingsService = new SettingsService();
