/**
 * SafePilot AI - Driver Profile & Emergency Contacts Drawer/Modal
 * Features:
 * - Driver Bio & Vehicle Metadata
 * - Emergency Contact Management (List, Add, Delete, Priority)
 * - Sign Out Button
 */

import React, { useState } from 'react';
import {
  Shield,
  Phone,
  Plus,
  Trash2,
  X,
  Heart,
  Car,
  FileText,
  LogOut,
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ProfileDrawer({ isOpen, onClose, onLogout }) {
  const [user] = useState(authService.getCurrentUser());
  const [contacts, setContacts] = useState(authService.getEmergencyContacts());
  const [showAddContact, setShowAddContact] = useState(false);

  // New contact form fields
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [notifyOnAEB, setNotifyOnAEB] = useState(true);

  if (!isOpen || !user) return null;

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    authService.addEmergencyContact({
      name: newContactName,
      relationship: newContactRel,
      phone: newContactPhone,
      isPrimary: contacts.length === 0,
      notifyOnAEB,
    });

    setContacts(authService.getEmergencyContacts());
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleRemoveContact = (id) => {
    authService.removeEmergencyContact(id);
    setContacts(authService.getEmergencyContacts());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-cyan-500/30 flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold font-mono">
              {user.avatarInitials || 'DR'}
            </div>
            <div>
              <h2 className="text-base font-bold font-tech uppercase tracking-wider text-white">
                Driver Profile & Safety Contacts
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                SafePilot Autonomous Driver Profile (DMS Linked)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Driver Bio Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white font-tech uppercase">{user.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              VERIFIED OPERATOR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>License: <strong className="text-white">{user.licenseNumber || 'CA-948201-DL'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Vehicle: <strong className="text-white">{user.vehicle || 'EV-4 Sedan'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Blood Group: <strong className="text-white">{user.bloodGroup || 'O+'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>eCall Dispatch: <strong className="text-emerald-400">ENABLED</strong></span>
            </div>
          </div>
        </div>

        {/* 2. Emergency Contacts Management (Requirement 15) */}
        <div className="flex flex-col gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-tech uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              Emergency Dispatch Contacts ({contacts.length})
            </span>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Contact</span>
            </button>
          </div>

          {/* New contact inline form */}
          {showAddContact && (
            <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col gap-2 text-xs">
              <div className="font-bold text-cyan-300 text-[11px]">New Emergency Contact</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Physician">Physician</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnAEB}
                    onChange={(e) => setNotifyOnAEB(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500"
                  />
                  <span>SMS Alert on Automatic Emergency Braking</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Contact List */}
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{contact.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                      {contact.relationship}
                    </span>
                    {contact.isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{contact.phone}</span>
                    {contact.notifyOnAEB && (
                      <span className="text-emerald-400">✓ Auto-SMS on AEB</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  title="Remove contact"
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions: Sign Out */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white font-mono text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Operator</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
