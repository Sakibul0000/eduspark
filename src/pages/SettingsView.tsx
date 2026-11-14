import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    isDemoMode,
    firebaseUser,
    updateUserSettingsData,
    changeUserPassword,
    logout,
  } = useApp();

  const [savingPref, setSavingPref] = useState(false);
  const [prefNotice, setPrefNotice] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const hasPasswordProvider = Boolean(
    firebaseUser?.providerData.some((p) => p.providerId === 'password')
  );

  const updatePref = async (patch: Parameters<typeof updateUserSettingsData>[0]) => {
    setSavingPref(true);
    setPrefNotice(null);
    try {
      await updateUserSettingsData(patch);
      setPrefNotice('Preferences saved.');
    } finally {
      setSavingPref(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSuccess('Your password has been updated.');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Customize appearance, study reminders, daily goals, and account security.
        </p>
      </div>

      {/* Theme & Study Goal */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Appearance & Daily Target
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savingPref ? 'Saving...' : prefNotice || 'Changes persist automatically.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Interface Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between crisp daylight mode and deep navy dark mode.
            </p>
          </div>
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => updatePref({ theme: 'light' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => updatePref({ theme: 'dark' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Daily Study Goal</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target study duration displayed on your student dashboard.
            </p>
          </div>
          <select
            aria-label="Daily study goal"
            value={settings.dailyGoalMinutes}
            onChange={(e) => updatePref({ dailyGoalMinutes: Number(e.target.value) })}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-xs font-semibold text-slate-900 dark:text-white tabular-nums"
          >
            <option value={15}>15 minutes / day</option>
            <option value={30}>30 minutes / day</option>
            <option value={45}>45 minutes / day</option>
            <option value={60}>60 minutes / day</option>
            <option value={90}>90 minutes / day</option>
          </select>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Notification Preferences
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            {
              key: 'emailNotifications' as const,
              title: 'Course Announcements',
              desc: 'Receive updates when new lessons or quizzes are published.',
              value: settings.emailNotifications,
            },
            {
              key: 'studyReminders' as const,
              title: 'Daily Study Reminders',
              desc: 'Gentle reminders to help protect your active learning streak.',
              value: settings.studyReminders,
            },
            {
              key: 'weeklyDigest' as const,
              title: 'Weekly Progress Digest',
              desc: 'Summary of study hours, quiz accuracy, and upcoming modules.',
              value: settings.weeklyDigest,
            },
          ].map((item) => (
            <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.value}
                onClick={() => updatePref({ [item.key]: !item.value })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  item.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    item.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Security / Change Password */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Security & Password
        </h2>

        {isDemoMode ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You are currently exploring EduSpark AI in Local Demo Mode. Sign in with an Email/Password Firebase account to manage passwords.
          </p>
        ) : !hasPasswordProvider ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your account is authenticated via Google Sign-In. Password and two-factor authentication settings are managed directly in your Google Account.
          </p>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {pwError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="settings-current-pw"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Current password
              </label>
              <div className="relative">
                <input
                  id="settings-current-pw"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label="Toggle current password visibility"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="settings-new-pw"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="settings-new-pw"
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label="Toggle new password visibility"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-confirm-pw"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm new password
                </label>
                <input
                  id="settings-confirm-pw"
                  type={showNew ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-60"
              >
                {pwSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Sign Out */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Sign Out
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End your current session on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </section>
    </div>
  );
};
