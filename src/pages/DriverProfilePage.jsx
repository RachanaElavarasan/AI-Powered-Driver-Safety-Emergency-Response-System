/**
 * SafePilot AI - Driver Profile & Emergency Contacts Management Page
 * Requirement 15:
 * - Driver Profile display & edit (Name, Email, Phone, Vehicle Number, License, Blood Group)
 * - Emergency Contacts CRUD:
 *   - Add contact modal/form
 *   - Edit contact
 *   - Delete contact
 *   - Set Primary contact
 * - Completely separate auth/profile data layer from simulation logic
 */

import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Phone,
  Car,
  Shield,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  Star,
  Save,
  AlertCircle,
} from 'lucide-react';

export default function DriverProfilePage({ currentUser }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [contacts, setContacts] = useState(authService.getEmergencyContacts());

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (415) 555-0199',
    vehicle: user?.vehicle || 'SafePilot EV-4 Autonomous',
    licenseNumber: user?.licenseNumber || 'CA-948201-DL',
    bloodGroup: user?.bloodGroup || 'O+',
  });

  // Contact Form State (Add / Edit)
  const [editingContactId, setEditingContactId] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    relationship: 'Family',
    phone: '',
    isPrimary: false,
    notifyOnAEB: true,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(({ user: u, emergencyContacts }) => {
      if (u) {
        setUser(u);
        setProfileForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '+1 (415) 555-0199',
          vehicle: u.vehicle || 'SafePilot EV-4 Autonomous',
          licenseNumber: u.licenseNumber || 'CA-948201-DL',
          bloodGroup: u.bloodGroup || 'O+',
        });
      }
      setContacts(emergencyContacts || []);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await authService.updateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    authService.addEmergencyContact(contactForm);
    setContactForm({
      name: '',
      relationship: 'Family',
      phone: '',
      isPrimary: false,
      notifyOnAEB: true,
    });
    setShowAddContact(false);
  };

  const handleStartEditContact = (c) => {
    setEditingContactId(c.id);
    setContactForm({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      isPrimary: c.isPrimary,
      notifyOnAEB: c.notifyOnAEB,
    });
  };

  const handleSaveEditedContact = (e) => {
    e.preventDefault();
    authService.updateEmergencyContact(editingContactId, contactForm);
    setEditingContactId(null);
  };

  const handleDeleteContact = (id) => {
    authService.removeEmergencyContact(id);
  };

  const handleSetPrimary = (id) => {
    authService.setPrimaryContact(id);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-100 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-base text-slate-950 shadow-inner">
            {user?.avatarInitials || 'DR'}
          </div>
          <div>
            <h1 className="text-xl font-bold font-tech tracking-wider text-white uppercase glow-cyan">
              Driver Profile & Emergency Network
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Identity Verification & Designated Emergency Contact Configuration
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile((prev) => !prev)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditingProfile ? 'CANCEL EDITING' : 'EDIT DRIVER PROFILE'}</span>
        </button>
      </div>

      {/* Main Grid: Driver Profile Form (Left) + Emergency Contacts List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Driver Profile Section */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Driver Credentials
            </h2>
            <span className="text-[10px] font-mono text-cyan-400">AUTHENTICATED</span>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vehicle Model / Plate</label>
                <input
                  type="text"
                  value={profileForm.vehicle}
                  onChange={(e) => setProfileForm({ ...profileForm, vehicle: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Driver License</label>
                  <input
                    type="text"
                    value={profileForm.licenseNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  SAVE PROFILE
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">DRIVER NAME</span>
                <span className="text-base font-bold text-white mt-0.5 block">{user?.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">EMAIL ADDRESS</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{user?.email}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">PRIMARY PHONE</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{profileForm.phone}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">VEHICLE ASSIGNMENT</span>
                <span className="text-xs font-semibold text-cyan-300 mt-0.5 block">{user?.vehicle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">LICENSE NO.</span>
                  <span className="text-xs font-semibold text-slate-300 mt-0.5 block">{user?.licenseNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BLOOD TYPE</span>
                  <span className="text-xs font-semibold text-rose-300 mt-0.5 block">{user?.bloodGroup || 'O+'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contacts Management (Requirement 15) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                Emergency Contacts Directory ({contacts.length})
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">
                Primary and secondary verified escalation contacts
              </p>
            </div>

            {!showAddContact && (
              <button
                onClick={() => {
                  setShowAddContact(true);
                  setEditingContactId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD CONTACT</span>
              </button>
            )}
          </div>

          {/* Add / Edit Contact Form */}
          {(showAddContact || editingContactId) && (
            <form
              onSubmit={editingContactId ? handleSaveEditedContact : handleAddContact}
              className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-3 font-mono text-xs animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300">
                  {editingContactId ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContact(false);
                    setEditingContactId(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Mercer"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Mother / Physician"
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Mobile / Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.isPrimary}
                    onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                    className="w-3.5 h-3.5 accent-cyan-500"
                  />
                  <span className="text-slate-300 text-[11px]">Set as Primary Contact</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.notifyOnAEB}
                    onChange={(e) => setContactForm({ ...contactForm, notifyOnAEB: e.target.checked })}
                    className="w-3.5 h-3.5 accent-cyan-500"
                  />
                  <span className="text-slate-300 text-[11px]">Notify on Critical AEB</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContact(false);
                    setEditingContactId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold font-tech"
                >
                  {editingContactId ? 'UPDATE CONTACT' : 'SAVE CONTACT'}
                </button>
              </div>
            </form>
          )}

          {/* Contacts List */}
          <div className="space-y-3 font-mono text-xs">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  c.isPrimary
                    ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {c.isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold uppercase">
                        PRIMARY
                      </span>
                    )}
                    <span className="font-bold text-white text-sm truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.relationship})</span>
                  </div>

                  <p className="text-slate-300 mt-1 font-mono-nums">{c.phone}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!c.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(c.id)}
                      title="Set as Primary Contact"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleStartEditContact(c)}
                    title="Edit Contact"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    title="Delete Contact"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
