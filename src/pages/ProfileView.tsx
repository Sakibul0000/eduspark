import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Loader2, Trash2, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

async function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 180;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export const ProfileView: React.FC = () => {
  const { profile, stats, isDemoMode, updateUserProfileData } = useApp();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(profile?.photoUrl);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setBio(profile.bio || '');
      setPhotoUrl(profile.photoUrl);
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a PNG, JPG, or WebP image file.');
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPhotoUrl(dataUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to process image.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedNotice(null);
    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileData({
        fullName,
        bio,
        photoUrl: photoUrl || '',
      });
      setSavedNotice('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Student Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage your public student identity and avatar across EduSpark AI.
        </p>
      </div>

      {/* Summary Header Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName || 'Student avatar'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-9 h-9 text-indigo-600 dark:text-violet-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white truncate">
            {profile?.fullName || 'EduSpark Student'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {profile?.email}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {isDemoMode ? 'Local Demo Mode' : 'Cloud Firestore Synced'} ·{' '}
            {stats.totalEnrolled} enrolled · {stats.learningHoursLabel} studied
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </label>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              aria-label="Remove profile photo"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Edit Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-5"
      >
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Edit Account Details
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {savedNotice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-fullname"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Full name
            </label>
            <input
              id="profile-fullname"
              type="text"
              required
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="profile-bio"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Learning focus / bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what subjects or goals you are focusing on..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
