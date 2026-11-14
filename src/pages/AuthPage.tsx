import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useApp } from '../context/AppContext';
import type { AuthMode } from '../types/lms';

interface AuthPageProps {
  initialMode: AuthMode;
  onBackHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onBackHome }) => {
  const {
    firebaseUser,
    needsEmailVerification,
    authError,
    clearAuthError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendResetPasswordEmail,
    resendVerificationEmail,
    refreshEmailVerification,
    enterDemoMode,
    logout,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setLocalError(null);
    setSuccessMsg(null);
    clearAuthError();
  };

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    clearAuthError();

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setSubmitting(true);
      try {
        await sendResetPasswordEmail(email);
        setSuccessMsg('Password reset link sent. Check your inbox and spam folder.');
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Unable to send reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (fullName.trim().length < 2) {
        setLocalError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(fullName, email, password);
        setSuccessMsg('Account created! Check your email inbox to verify your address.');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setSuccessMsg(null);
    clearAuthError();
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckVerification = async () => {
    setLocalError(null);
    setSubmitting(true);
    try {
      const verified = await refreshEmailVerification();
      if (!verified) {
        setLocalError('Email is not verified yet. Please click the verification link sent to your inbox.');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to refresh status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setLocalError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await resendVerificationEmail();
      setSuccessMsg('Verification email resent. Please check your inbox.');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = localError || authError;

  // Email verification gate for newly registered Email/Password accounts
  if (needsEmailVerification && firebaseUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <BrandMark />
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign out
            </button>
          </div>

          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MailCheck className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Verify your email address
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We sent a verification link to <strong className="text-slate-900 dark:text-white">{firebaseUser.email}</strong>. Click the link to unlock Cloud Firestore sync for your account.
            </p>
          </div>

          {activeError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={submitting}
              onClick={handleCheckVerification}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>I’ve Verified My Email</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleResendVerification}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <BrandMark />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-7 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'register'
                ? 'Create your student account'
                : 'Reset your password'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              {mode === 'login'
                ? 'Sign in to continue your courses, quizzes, and AI study sessions.'
                : mode === 'register'
                ? 'Start learning with personalized progress tracking and AI tutoring.'
                : 'Enter your account email and we will send you a password reset link.'}
            </p>
          </div>

          {activeError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleSignIn}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151F38] text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.09.73-2.49 1.16-4.23 1.16-3.25 0-6.01-2.19-6.99-5.15H1.01v3.14C3.03 21.14 7.19 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.01 14c-.25-.73-.39-1.51-.39-2.32 0-.81.14-1.59.39-2.32V6.22H1.01C.37 7.86 0 9.69 0 11.68c0 1.99.37 3.82 1.01 5.46l4-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.85c1.8 0 3.41.62 4.68 1.83l3.51-3.51C18.07 1.19 15.3 0 12 0 7.19 0 3.03 2.86 1.01 6.22l4 3.14c.98-2.96 3.74-4.51 6.99-4.51Z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="px-3 text-xs text-slate-400">or with email</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-medium text-indigo-600 dark:text-violet-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm transition-all disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Send Reset Link'}
              </span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                New to EduSpark AI?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-indigo-600 dark:text-violet-400 hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-indigo-600 dark:text-violet-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => enterDemoMode(fullName || undefined)}
                className="w-full px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
              >
                Explore in Local Demo Mode (browser-only, no cloud sync)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
