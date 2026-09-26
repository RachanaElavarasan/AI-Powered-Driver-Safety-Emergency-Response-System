/**
 * SafePilot AI - Modular Authentication & Driver Profile Service
 * 
 * Modular architecture designed to easily swap mock/local storage with
 * FastAPI backend endpoints (e.g. POST /api/auth/token, GET /api/driver/me, etc.)
 */

const STORAGE_KEYS = {
  USER: 'safepilot_user',
  TOKEN: 'safepilot_token',
  CONTACTS: 'safepilot_emergency_contacts',
};

const DEFAULT_DEMO_USER = {
  id: 'driver-01',
  name: 'Alex Mercer',
  email: 'alex.mercer@safepilot.ai',
  licenseNumber: 'CA-948201-DL',
  vehicle: 'SafePilot EV-4 Autonomous',
  bloodGroup: 'O+',
  medicalNotes: 'No known drug allergies',
  avatarInitials: 'AM',
  activeSince: '2025-04-12',
};

const DEFAULT_CONTACTS = [
  {
    id: 'ec-1',
    name: 'Sarah Mercer',
    relationship: 'Spouse',
    phone: '+1 (415) 555-0192',
    isPrimary: true,
    notifyOnAEB: true,
  },
  {
    id: 'ec-2',
    name: 'Dr. Robert Chen',
    relationship: 'Physician',
    phone: '+1 (415) 555-0844',
    isPrimary: false,
    notifyOnAEB: false,
  },
];

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.currentUser = null;
    this.token = null;
    this.emergencyContacts = [];
    this.init();
  }

  init() {
    this.currentUser = { ...DEFAULT_DEMO_USER };
    this.token = 'mock-jwt-safepilot-demo-token';
    this.emergencyContacts = [...DEFAULT_CONTACTS];

    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);

      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
      } else {
        // Pre-populate with default demo user for instant prototype testing
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, this.token);
      }

      if (storedContacts) {
        this.emergencyContacts = JSON.parse(storedContacts);
      } else {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.emergencyContacts));
      }
    } catch {
      // Storage unavailable, fallback already assigned
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({
      user: this.currentUser,
      isAuthenticated: Boolean(this.currentUser && this.token),
      emergencyContacts: this.emergencyContacts,
    });
    return () => this.listeners.delete(callback);
  }

  notify() {
    const data = {
      user: this.currentUser,
      isAuthenticated: Boolean(this.currentUser && this.token),
      emergencyContacts: this.emergencyContacts,
    };
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  /**
   * Authenticate user credentials
   * Future: replace with fetch(`${BACKEND_URL}/api/auth/login`)
   */
  async login({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 350)); // simulate network latency

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }

    // Accept demo credentials or any test account
    let name = 'Alex Mercer';
    if (email !== DEFAULT_DEMO_USER.email) {
      const prefix = email.split('@')[0];
      name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const user = {
      ...DEFAULT_DEMO_USER,
      email,
      name,
      avatarInitials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    const token = `jwt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    this.currentUser = user;
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }

    this.notify();
    return user;
  }

  /**
   * Register new driver account
   * Future: replace with fetch(`${BACKEND_URL}/api/auth/register`)
   */
  async signup({ name, email, password, licenseNumber, vehicle }) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    const user = {
      id: `driver-${Date.now()}`,
      name,
      email,
      licenseNumber: licenseNumber || 'DL-PENDING',
      vehicle: vehicle || 'SafePilot Autonomous EV',
      bloodGroup: 'A+',
      medicalNotes: 'None recorded',
      avatarInitials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      activeSince: new Date().toISOString().split('T')[0],
    };

    const token = `jwt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    this.currentUser = user;
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }

    this.notify();
    return user;
  }

  /**
   * Logout user and revoke session
   */
  logout() {
    this.currentUser = null;
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
    this.notify();
  }

  isAuthenticated() {
    return Boolean(this.currentUser && this.token);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Update driver profile attributes
   */
  async updateProfile(updates) {
    if (!this.currentUser) return null;
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  /**
   * Emergency Contacts Management
   */
  getEmergencyContacts() {
    return [...this.emergencyContacts];
  }

  addEmergencyContact(contact) {
    const newContact = {
      id: `ec-${Date.now()}`,
      name: contact.name || 'Emergency Contact',
      relationship: contact.relationship || 'Friend',
      phone: contact.phone || '+1 (555) 000-0000',
      isPrimary: Boolean(contact.isPrimary),
      notifyOnAEB: Boolean(contact.notifyOnAEB),
    };

    if (newContact.isPrimary) {
      this.emergencyContacts = this.emergencyContacts.map((c) => ({
        ...c,
        isPrimary: false,
      }));
    }

    this.emergencyContacts.push(newContact);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.emergencyContacts));
    }
    this.notify();
    return newContact;
  }

  updateEmergencyContact(id, updates) {
    this.emergencyContacts = this.emergencyContacts.map((c) => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      if (updates.isPrimary) {
        return { ...c, isPrimary: false };
      }
      return c;
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.emergencyContacts));
    }
    this.notify();
  }

  setPrimaryContact(id) {
    this.emergencyContacts = this.emergencyContacts.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.emergencyContacts));
    }
    this.notify();
  }

  removeEmergencyContact(id) {
    this.emergencyContacts = this.emergencyContacts.filter((c) => c.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.emergencyContacts));
    }
    this.notify();
  }
}

export const authService = new AuthService();
