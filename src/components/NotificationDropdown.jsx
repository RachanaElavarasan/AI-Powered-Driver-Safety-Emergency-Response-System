/**
 * SafePilot AI - Notification Center Dropdown
 * Displays notifications generated from actual simulation events.
 */

import React from 'react';
import { Bell, AlertTriangle, AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  onClearAll,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
            Notifications ({notifications.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono underline"
            >
              Mark read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No active alerts. All systems nominal.
          </div>
        ) : (
          notifications.map((notif) => {
            const isDanger = notif.type === 'danger';
            const isWarning = notif.type === 'warning';
            const isSuccess = notif.type === 'success';

            return (
              <div
                key={notif.id}
                className={`p-2.5 rounded-lg border text-xs font-mono transition ${
                  isDanger
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : isWarning
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : isSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isDanger ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[11px] truncate">{notif.title}</p>
                    {notif.message && (
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    )}
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {notif.timeAgo || 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
