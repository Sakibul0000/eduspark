import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import { COURSES_CATALOG, QUIZZES_CATALOG } from '../data/catalog';
import type {
  ChatMessage,
  Enrollment,
  LearningProgress,
  QuizAttempt,
  UserProfile,
  UserSettings,
} from '../types/lms';

const DEMO_STORAGE_KEY = 'eduspark_demo_state_v1';
const THEME_STORAGE_KEY = 'eduspark_theme';

export interface WeeklyPoint {
  day: string;
  dateKey: string;
  minutes: number;
  sessions: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressLabel: string;
}

export interface ComputedStats {
  totalEnrolled: number;
  coursesCompleted: number;
  totalMinutes: number;
  learningHoursLabel: string;
  averageQuizScore: number;
  bestQuizScore: number;
  overallProgressPercent: number;
  streakDays: number;
  weeklyActivity: WeeklyPoint[];
  achievements: AchievementItem[];
}

interface DemoPersistedState {
  active: boolean;
  profile: UserProfile;
  settings: UserSettings;
  enrollments: Enrollment[];
  progress: LearningProgress[];
  quizAttempts: QuizAttempt[];
  chatHistory: ChatMessage[];
}

interface AppContextValue {
  authReady: boolean;
  firebaseConnected: boolean;
  firebaseUser: User | null;
  needsEmailVerification: boolean;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  settings: UserSettings;
  enrollments: Enrollment[];
  progressList: LearningProgress[];
  quizAttempts: QuizAttempt[];
  chatHistory: ChatMessage[];
  stats: ComputedStats;
  dataLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  // Auth actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  enterDemoMode: (customName?: string) => void;
  logout: () => Promise<void>;
  // Course & Progress actions
  enrollInCourse: (courseId: string) => Promise<void>;
  unenrollFromCourse: (courseId: string) => Promise<void>;
  touchCourseAccess: (courseId: string, lessonId?: string) => Promise<void>;
  toggleLessonComplete: (courseId: string, lessonId: string, durationMinutes: number) => Promise<void>;
  // Quiz actions
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'userId' | 'createdAt'>) => Promise<QuizAttempt>;
  // AI Tutor actions
  appendChatMessage: (
    role: 'user' | 'assistant',
    content: string,
    courseContext?: string,
    isDemo?: boolean
  ) => Promise<void>;
  clearChatHistory: () => Promise<void>;
  // Profile & Settings actions
  updateUserProfileData: (updates: { fullName: string; bio?: string; photoUrl?: string }) => Promise<void>;
  updateUserSettingsData: (updates: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLast7DateKeys(): { day: string; dateKey: string }[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { day: string; dateKey: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(now.getDate() - i);
    result.push({
      day: labels[dt.getDay()],
      dateKey: getTodayDateKey(dt),
    });
  }
  return result;
}

function sanitizeId(raw: string, maxLen = 128): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
  return cleaned.slice(0, maxLen) || `id_${Date.now()}`;
}

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return 'light';
}

function applyThemeToDocument(theme: 'light' | 'dark') {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function createDefaultDemoState(name = 'Alex Rivera'): DemoPersistedState {
  const nowIso = new Date().toISOString();
  const today = getTodayDateKey();
  const yesterdayDt = new Date();
  yesterdayDt.setDate(yesterdayDt.getDate() - 1);
  const yesterday = getTodayDateKey(yesterdayDt);

  const twoDaysDt = new Date();
  twoDaysDt.setDate(twoDaysDt.getDate() - 2);
  const twoDaysAgo = getTodayDateKey(twoDaysDt);

  return {
    active: true,
    profile: {
      uid: 'demo_student_01',
      fullName: name,
      email: 'alex.rivera@eduspark.local',
      bio: 'Computer Science & Applied AI student exploring algorithms, TypeScript, and neural systems.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    settings: {
      userId: 'demo_student_01',
      theme: getInitialTheme(),
      emailNotifications: true,
      studyReminders: true,
      weeklyDigest: false,
      dailyGoalMinutes: 45,
      updatedAt: nowIso,
    },
    enrollments: [
      {
        id: 'demo_student_01_ai-ml-foundations',
        userId: 'demo_student_01',
        courseId: 'ai-ml-foundations',
        status: 'active',
        enrolledAt: twoDaysDt.toISOString(),
        lastAccessedAt: nowIso,
      },
      {
        id: 'demo_student_01_prog-python',
        userId: 'demo_student_01',
        courseId: 'prog-python',
        status: 'active',
        enrolledAt: twoDaysDt.toISOString(),
        lastAccessedAt: yesterdayDt.toISOString(),
      },
    ],
    progress: [
      {
        id: 'demo_student_01_ai-ml-foundations',
        userId: 'demo_student_01',
        courseId: 'ai-ml-foundations',
        completedLessonIds: ['ml-1', 'ml-2'],
        lastLessonId: 'ml-3',
        totalLessons: 6,
        progressPercent: 33,
        minutesSpent: 105,
        activityDates: [twoDaysAgo, yesterday, today],
        updatedAt: nowIso,
      },
      {
        id: 'demo_student_01_prog-python',
        userId: 'demo_student_01',
        courseId: 'prog-python',
        completedLessonIds: ['py-1'],
        lastLessonId: 'py-2',
        totalLessons: 6,
        progressPercent: 17,
        minutesSpent: 40,
        activityDates: [yesterday],
        updatedAt: yesterdayDt.toISOString(),
      },
    ],
    quizAttempts: [
      {
        id: 'demo_attempt_1',
        userId: 'demo_student_01',
        quizId: 'quiz-python',
        quizTitle: 'Python & Programming Fundamentals',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        durationSeconds: 142,
        answers: [2, 1, 1, 1, 0],
        createdAt: yesterdayDt.toISOString(),
      },
    ],
    chatHistory: [],
  };
}

function loadDemoState(): DemoPersistedState | null {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoPersistedState;
    if (parsed && parsed.active && parsed.profile?.uid) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDemoState(state: DemoPersistedState | null) {
  try {
    if (!state) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } else {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore storage quota errors
  }
}

function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase Console yet. Enable it under Authentication > Sign-in method, or use Google Sign-In / Local Demo Mode.';
    case 'auth/requires-recent-login':
      return 'For security, please sign out and sign back in before changing your password.';
    default:
      return error instanceof Error ? error.message : 'Authentication request failed.';
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [demoState, setDemoState] = useState<DemoPersistedState | null>(() => loadDemoState());
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [cloudProfile, setCloudProfile] = useState<UserProfile | null>(null);
  const [cloudSettings, setCloudSettings] = useState<UserSettings>(() => ({
    userId: '',
    theme: getInitialTheme(),
    emailNotifications: true,
    studyReminders: true,
    weeklyDigest: false,
    dailyGoalMinutes: 30,
    updatedAt: new Date().toISOString(),
  }));
  const [cloudEnrollments, setCloudEnrollments] = useState<Enrollment[]>([]);
  const [cloudProgress, setCloudProgress] = useState<LearningProgress[]>([]);
  const [cloudQuizAttempts, setCloudQuizAttempts] = useState<QuizAttempt[]>([]);
  const [cloudChatHistory, setCloudChatHistory] = useState<ChatMessage[]>([]);

  const isDemoMode = Boolean(!firebaseUser && demoState?.active);
  const needsEmailVerification = Boolean(firebaseUser && !firebaseUser.emailVerified);
  const isAuthenticated = Boolean((firebaseUser && firebaseUser.emailVerified) || isDemoMode);

  // Sync theme to <html>
  const activeTheme = isDemoMode ? demoState!.settings.theme : cloudSettings.theme;
  useEffect(() => {
    applyThemeToDocument(activeTheme);
  }, [activeTheme]);

  // Connection test & auth listener
  useEffect(() => {
    testFirestoreConnection().then(setFirebaseConnected);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (user) {
        setDemoState(null);
        saveDemoState(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ensure cloud user profile & settings exist upon verified login
  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified) {
      setCloudProfile(null);
      setCloudEnrollments([]);
      setCloudProgress([]);
      setCloudQuizAttempts([]);
      setCloudChatHistory([]);
      return;
    }

    const uid = sanitizeId(firebaseUser.uid);
    let cancelled = false;

    async function bootstrapUserDocs() {
      setDataLoading(true);
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists() && !cancelled) {
          const fallbackName =
            firebaseUser!.displayName?.trim() ||
            firebaseUser!.email?.split('@')[0] ||
            'EduSpark Student';
          await setDoc(userRef, {
            uid,
            fullName: fallbackName.slice(0, 120),
            email: (firebaseUser!.email || 'student@eduspark.app').slice(0, 254),
            bio: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        const settingsRef = doc(db, 'userSettings', uid);
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists() && !cancelled) {
          await setDoc(settingsRef, {
            userId: uid,
            theme: getInitialTheme(),
            emailNotifications: true,
            studyReminders: true,
            weeklyDigest: false,
            dailyGoalMinutes: 30,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Bootstrap user docs warning:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    bootstrapUserDocs();

    // Attach real-time Firestore listeners for verified authenticated user
    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCloudProfile({
            uid: String(d.uid || uid),
            fullName: String(d.fullName || 'Student'),
            email: String(d.email || firebaseUser.email || ''),
            photoUrl: typeof d.photoUrl === 'string' ? d.photoUrl : undefined,
            bio: typeof d.bio === 'string' ? d.bio : '',
            createdAt: toIsoString(d.createdAt),
            updatedAt: toIsoString(d.updatedAt),
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'userSettings', uid),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCloudSettings({
            userId: uid,
            theme: d.theme === 'dark' ? 'dark' : 'light',
            emailNotifications: Boolean(d.emailNotifications),
            studyReminders: Boolean(d.studyReminders),
            weeklyDigest: Boolean(d.weeklyDigest),
            dailyGoalMinutes: typeof d.dailyGoalMinutes === 'number' ? d.dailyGoalMinutes : 30,
            updatedAt: toIsoString(d.updatedAt),
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `userSettings/${uid}`)
    );

    const unsubEnrollments = onSnapshot(
      query(collection(db, 'enrollments'), where('userId', '==', uid)),
      (snap) => {
        const list: Enrollment[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: String(d.userId),
            courseId: String(d.courseId),
            status: d.status === 'completed' ? 'completed' : 'active',
            enrolledAt: toIsoString(d.enrolledAt),
            lastAccessedAt: toIsoString(d.lastAccessedAt),
          };
        });
        list.sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt));
        setCloudEnrollments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    const unsubProgress = onSnapshot(
      query(collection(db, 'learningProgress'), where('userId', '==', uid)),
      (snap) => {
        const list: LearningProgress[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: String(d.userId),
            courseId: String(d.courseId),
            completedLessonIds: Array.isArray(d.completedLessonIds) ? d.completedLessonIds.map(String) : [],
            lastLessonId: typeof d.lastLessonId === 'string' ? d.lastLessonId : undefined,
            totalLessons: typeof d.totalLessons === 'number' ? d.totalLessons : 1,
            progressPercent: typeof d.progressPercent === 'number' ? d.progressPercent : 0,
            minutesSpent: typeof d.minutesSpent === 'number' ? d.minutesSpent : 0,
            activityDates: Array.isArray(d.activityDates) ? d.activityDates.map(String) : [],
            updatedAt: toIsoString(d.updatedAt),
          };
        });
        setCloudProgress(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'learningProgress')
    );

    const unsubAttempts = onSnapshot(
      query(collection(db, 'quizAttempts'), where('userId', '==', uid)),
      (snap) => {
        const list: QuizAttempt[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: String(d.userId),
            quizId: String(d.quizId),
            quizTitle: String(d.quizTitle),
            score: Number(d.score || 0),
            totalQuestions: Number(d.totalQuestions || 5),
            percentage: Number(d.percentage || 0),
            durationSeconds: Number(d.durationSeconds || 0),
            answers: Array.isArray(d.answers) ? d.answers.map(Number) : [],
            createdAt: toIsoString(d.createdAt),
          };
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setCloudQuizAttempts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'quizAttempts')
    );

    const unsubChat = onSnapshot(
      query(collection(db, 'chatHistory'), where('userId', '==', uid)),
      (snap) => {
        const list: ChatMessage[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: String(d.userId),
            role: d.role === 'assistant' ? 'assistant' : 'user',
            content: String(d.content || ''),
            courseContext: typeof d.courseContext === 'string' ? d.courseContext : undefined,
            isDemo: Boolean(d.isDemo),
            createdAt: toIsoString(d.createdAt),
          };
        });
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        setCloudChatHistory(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'chatHistory')
    );

    return () => {
      cancelled = true;
      unsubProfile();
      unsubSettings();
      unsubEnrollments();
      unsubProgress();
      unsubAttempts();
      unsubChat();
    };
  }, [authReady, firebaseUser]);

  const profile = isDemoMode ? demoState!.profile : cloudProfile;
  const settings = isDemoMode ? demoState!.settings : cloudSettings;
  const enrollments = isDemoMode ? demoState!.enrollments : cloudEnrollments;
  const progressList = isDemoMode ? demoState!.progress : cloudProgress;
  const quizAttempts = isDemoMode ? demoState!.quizAttempts : cloudQuizAttempts;
  const chatHistory = isDemoMode ? demoState!.chatHistory : cloudChatHistory;

  // Derived real-time stats & weekly activity
  const stats = useMemo<ComputedStats>(() => {
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));
    const enrolledProgress = progressList.filter((p) => enrolledIds.has(p.courseId));

    const totalEnrolled = enrollments.length;
    const coursesCompleted = enrolledProgress.filter((p) => p.progressPercent >= 100).length;

    const lessonMinutes = progressList.reduce((sum, p) => sum + (p.minutesSpent || 0), 0);
    const quizMinutes = Math.round(
      quizAttempts.reduce((sum, q) => sum + (q.durationSeconds || 0), 0) / 60
    );
    const totalMinutes = lessonMinutes + quizMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const learningHoursLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const averageQuizScore =
      quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length)
        : 0;
    const bestQuizScore =
      quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.percentage)) : 0;

    const overallProgressPercent =
      totalEnrolled > 0
        ? Math.round(
            enrollments.reduce((sum, enr) => {
              const pr = progressList.find((p) => p.courseId === enr.courseId);
              return sum + (pr?.progressPercent || 0);
            }, 0) / totalEnrolled
          )
        : 0;

    // Collect activity dates for streak & weekly chart
    const activityDateSet = new Set<string>();
    const dateMinutesMap = new Map<string, number>();
    const dateSessionsMap = new Map<string, number>();

    progressList.forEach((p) => {
      const dates = p.activityDates || [];
      const avgPerDate = dates.length > 0 ? Math.max(15, Math.round(p.minutesSpent / dates.length)) : 0;
      dates.forEach((dk) => {
        activityDateSet.add(dk);
        dateMinutesMap.set(dk, (dateMinutesMap.get(dk) || 0) + avgPerDate);
        dateSessionsMap.set(dk, (dateSessionsMap.get(dk) || 0) + 1);
      });
    });

    quizAttempts.forEach((a) => {
      const dk = getTodayDateKey(new Date(a.createdAt));
      activityDateSet.add(dk);
      const minsForQuiz = Math.max(3, Math.round(a.durationSeconds / 60));
      dateMinutesMap.set(dk, (dateMinutesMap.get(dk) || 0) + minsForQuiz);
      dateSessionsMap.set(dk, (dateSessionsMap.get(dk) || 0) + 1);
    });

    // Streak count backwards from today (or yesterday if no activity today yet)
    let streakDays = 0;
    const cursor = new Date();
    if (!activityDateSet.has(getTodayDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (activityDateSet.has(getTodayDateKey(cursor))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const weeklyActivity: WeeklyPoint[] = getLast7DateKeys().map(({ day, dateKey }) => ({
      day,
      dateKey,
      minutes: dateMinutesMap.get(dateKey) || 0,
      sessions: dateSessionsMap.get(dateKey) || 0,
    }));

    const totalLessonsCompleted = progressList.reduce(
      (sum, p) => sum + p.completedLessonIds.length,
      0
    );

    const achievements: AchievementItem[] = [
      {
        id: 'first-enrollment',
        title: 'First Step',
        description: 'Enroll in your first course on EduSpark AI.',
        unlocked: totalEnrolled >= 1,
        progressLabel: `${Math.min(totalEnrolled, 1)}/1 course`,
      },
      {
        id: 'lesson-explorer',
        title: 'Momentum Builder',
        description: 'Complete at least 3 individual lessons.',
        unlocked: totalLessonsCompleted >= 3,
        progressLabel: `${Math.min(totalLessonsCompleted, 3)}/3 lessons`,
      },
      {
        id: 'quiz-challenger',
        title: 'Quiz Challenger',
        description: 'Submit your first timed MCQ assessment.',
        unlocked: quizAttempts.length >= 1,
        progressLabel: `${Math.min(quizAttempts.length, 1)}/1 quiz`,
      },
      {
        id: 'high-scorer',
        title: 'Distinction Score',
        description: 'Score 80% or higher on any quiz.',
        unlocked: bestQuizScore >= 80,
        progressLabel: bestQuizScore >= 80 ? `${bestQuizScore}% best` : 'Need 80%+',
      },
      {
        id: 'consistent-streak',
        title: 'Consistent Scholar',
        description: 'Maintain a 3-day learning streak.',
        unlocked: streakDays >= 3,
        progressLabel: `${Math.min(streakDays, 3)}/3 days`,
      },
      {
        id: 'course-graduate',
        title: 'Course Graduate',
        description: 'Complete 100% of lessons in any course.',
        unlocked: coursesCompleted >= 1,
        progressLabel: `${Math.min(coursesCompleted, 1)}/1 completed`,
      },
    ];

    return {
      totalEnrolled,
      coursesCompleted,
      totalMinutes,
      learningHoursLabel,
      averageQuizScore,
      bestQuizScore,
      overallProgressPercent,
      streakDays,
      weeklyActivity,
      achievements,
    };
  }, [enrollments, progressList, quizAttempts]);

  const updateDemo = (updater: (prev: DemoPersistedState) => DemoPersistedState) => {
    setDemoState((prev) => {
      const base = prev || createDefaultDemoState();
      const next = updater(base);
      saveDemoState(next);
      return next;
    });
  };

  // --- Auth Methods ---
  const clearAuthError = () => setAuthError(null);

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (fullName: string, email: string, password: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim().slice(0, 120) });
      await sendEmailVerification(cred.user);
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendResetPasswordEmail = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setAuthError(null);
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const refreshEmailVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    setFirebaseUser(refreshed ? ({ ...refreshed } as User) : null);
    // Force state update with actual User instance via getAuth check
    if (refreshed.emailVerified) {
      setFirebaseUser(auth.currentUser);
      return true;
    }
    return false;
  };

  const enterDemoMode = (customName?: string) => {
    setAuthError(null);
    const fresh = createDefaultDemoState(customName?.trim() || 'Alex Rivera');
    setDemoState(fresh);
    saveDemoState(fresh);
  };

  const logout = async () => {
    setAuthError(null);
    if (firebaseUser) {
      await signOut(auth);
    }
    setDemoState(null);
    saveDemoState(null);
  };

  // --- Course & Progress Methods ---
  const enrollInCourse = async (courseId: string) => {
    const course = COURSES_CATALOG.find((c) => c.id === courseId);
    if (!course) return;
    const today = getTodayDateKey();

    if (isDemoMode) {
      const uid = demoState!.profile.uid;
      const docId = `${uid}_${courseId}`;
      const nowIso = new Date().toISOString();
      updateDemo((prev) => {
        if (prev.enrollments.some((e) => e.courseId === courseId)) return prev;
        const newEnrollment: Enrollment = {
          id: docId,
          userId: uid,
          courseId,
          status: 'active',
          enrolledAt: nowIso,
          lastAccessedAt: nowIso,
        };
        const existingProg = prev.progress.find((p) => p.courseId === courseId);
        const newProgress: LearningProgress = existingProg || {
          id: docId,
          userId: uid,
          courseId,
          completedLessonIds: [],
          lastLessonId: course.lessons[0]?.id,
          totalLessons: course.lessons.length,
          progressPercent: 0,
          minutesSpent: 0,
          activityDates: [today],
          updatedAt: nowIso,
        };
        return {
          ...prev,
          enrollments: [newEnrollment, ...prev.enrollments],
          progress: existingProg ? prev.progress : [...prev.progress, newProgress],
        };
      });
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const docId = sanitizeId(`${uid}_${courseId}`, 260);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'enrollments', docId), {
        id: docId,
        userId: uid,
        courseId,
        status: 'active',
        enrolledAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      });
      const existingProg = cloudProgress.find((p) => p.courseId === courseId);
      if (!existingProg) {
        batch.set(doc(db, 'learningProgress', docId), {
          id: docId,
          userId: uid,
          courseId,
          completedLessonIds: [],
          lastLessonId: course.lessons[0]?.id || '',
          totalLessons: course.lessons.length,
          progressPercent: 0,
          minutesSpent: 0,
          activityDates: [today],
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `enrollments/${docId}`);
    }
  };

  const unenrollFromCourse = async (courseId: string) => {
    if (isDemoMode) {
      updateDemo((prev) => ({
        ...prev,
        enrollments: prev.enrollments.filter((e) => e.courseId !== courseId),
      }));
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const docId = sanitizeId(`${uid}_${courseId}`, 260);
    try {
      await deleteDoc(doc(db, 'enrollments', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `enrollments/${docId}`);
    }
  };

  const touchCourseAccess = async (courseId: string, lessonId?: string) => {
    const today = getTodayDateKey();
    if (isDemoMode) {
      const nowIso = new Date().toISOString();
      updateDemo((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) =>
          e.courseId === courseId ? { ...e, lastAccessedAt: nowIso } : e
        ),
        progress: prev.progress.map((p) => {
          if (p.courseId !== courseId) return p;
          const dates = p.activityDates.includes(today)
            ? p.activityDates
            : [...p.activityDates, today].slice(-365);
          return {
            ...p,
            lastLessonId: lessonId || p.lastLessonId,
            activityDates: dates,
            updatedAt: nowIso,
          };
        }),
      }));
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const docId = sanitizeId(`${uid}_${courseId}`, 260);
    const enrollment = cloudEnrollments.find((e) => e.courseId === courseId);
    const prog = cloudProgress.find((p) => p.courseId === courseId);
    if (!enrollment) return;

    try {
      await updateDoc(doc(db, 'enrollments', docId), {
        lastAccessedAt: serverTimestamp(),
      });
      if (prog) {
        const dates = prog.activityDates.includes(today)
          ? prog.activityDates
          : [...prog.activityDates, today].slice(-365);
        await updateDoc(doc(db, 'learningProgress', docId), {
          completedLessonIds: prog.completedLessonIds,
          lastLessonId: lessonId || prog.lastLessonId || '',
          progressPercent: prog.progressPercent,
          minutesSpent: prog.minutesSpent,
          activityDates: dates,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `enrollments/${docId}`);
    }
  };

  const toggleLessonComplete = async (
    courseId: string,
    lessonId: string,
    durationMinutes: number
  ) => {
    const course = COURSES_CATALOG.find((c) => c.id === courseId);
    if (!course) return;
    const today = getTodayDateKey();

    if (isDemoMode) {
      const nowIso = new Date().toISOString();
      updateDemo((prev) => {
        const existing = prev.progress.find((p) => p.courseId === courseId);
        const currentCompleted = existing?.completedLessonIds || [];
        const isAlreadyDone = currentCompleted.includes(lessonId);
        const nextCompleted = isAlreadyDone
          ? currentCompleted.filter((id) => id !== lessonId)
          : [...currentCompleted, lessonId];
        const nextPercent = Math.round((nextCompleted.length / course.lessons.length) * 100);
        const nextMinutes = Math.max(
          0,
          (existing?.minutesSpent || 0) + (isAlreadyDone ? -durationMinutes : durationMinutes)
        );
        const dates = (existing?.activityDates || []).includes(today)
          ? existing!.activityDates
          : [...(existing?.activityDates || []), today].slice(-365);

        const nextProg: LearningProgress = {
          id: `${prev.profile.uid}_${courseId}`,
          userId: prev.profile.uid,
          courseId,
          completedLessonIds: nextCompleted,
          lastLessonId: lessonId,
          totalLessons: course.lessons.length,
          progressPercent: nextPercent,
          minutesSpent: nextMinutes,
          activityDates: dates,
          updatedAt: nowIso,
        };

        return {
          ...prev,
          progress: existing
            ? prev.progress.map((p) => (p.courseId === courseId ? nextProg : p))
            : [...prev.progress, nextProg],
          enrollments: prev.enrollments.map((e) =>
            e.courseId === courseId
              ? {
                  ...e,
                  status: nextPercent === 100 ? 'completed' : 'active',
                  lastAccessedAt: nowIso,
                }
              : e
          ),
        };
      });
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const docId = sanitizeId(`${uid}_${courseId}`, 260);
    const existing = cloudProgress.find((p) => p.courseId === courseId);
    const currentCompleted = existing?.completedLessonIds || [];
    const isAlreadyDone = currentCompleted.includes(lessonId);
    const nextCompleted = isAlreadyDone
      ? currentCompleted.filter((id) => id !== lessonId)
      : [...currentCompleted, lessonId].slice(0, 50);
    const nextPercent = Math.round((nextCompleted.length / course.lessons.length) * 100);
    const nextMinutes = Math.max(
      0,
      (existing?.minutesSpent || 0) + (isAlreadyDone ? -durationMinutes : durationMinutes)
    );
    const dates = (existing?.activityDates || []).includes(today)
      ? existing!.activityDates
      : [...(existing?.activityDates || []), today].slice(-365);

    try {
      if (existing) {
        await updateDoc(doc(db, 'learningProgress', docId), {
          completedLessonIds: nextCompleted,
          lastLessonId: lessonId,
          progressPercent: nextPercent,
          minutesSpent: nextMinutes,
          activityDates: dates,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'learningProgress', docId), {
          id: docId,
          userId: uid,
          courseId,
          completedLessonIds: nextCompleted,
          lastLessonId: lessonId,
          totalLessons: course.lessons.length,
          progressPercent: nextPercent,
          minutesSpent: nextMinutes,
          activityDates: dates,
          updatedAt: serverTimestamp(),
        });
      }

      const enrollment = cloudEnrollments.find((e) => e.courseId === courseId);
      if (enrollment) {
        await updateDoc(doc(db, 'enrollments', docId), {
          status: nextPercent === 100 ? 'completed' : 'active',
          lastAccessedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `learningProgress/${docId}`);
    }
  };

  // --- Quiz Methods ---
  const saveQuizAttempt = async (
    attempt: Omit<QuizAttempt, 'id' | 'userId' | 'createdAt'>
  ): Promise<QuizAttempt> => {
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    if (isDemoMode) {
      const fullAttempt: QuizAttempt = {
        ...attempt,
        id: attemptId,
        userId: demoState!.profile.uid,
        createdAt: nowIso,
      };
      updateDemo((prev) => ({
        ...prev,
        quizAttempts: [fullAttempt, ...prev.quizAttempts],
      }));
      return fullAttempt;
    }

    if (!firebaseUser) throw new Error('Not authenticated');
    const uid = sanitizeId(firebaseUser.uid);
    const cleanAttempt: QuizAttempt = {
      ...attempt,
      id: attemptId,
      userId: uid,
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'quizAttempts', attemptId), {
        id: attemptId,
        userId: uid,
        quizId: attempt.quizId,
        quizTitle: attempt.quizTitle.slice(0, 180),
        score: Math.round(attempt.score),
        totalQuestions: Math.round(attempt.totalQuestions),
        percentage: Math.round(attempt.percentage),
        durationSeconds: Math.round(attempt.durationSeconds),
        answers: attempt.answers.map((a) => Math.round(a)),
        createdAt: serverTimestamp(),
      });
      return cleanAttempt;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `quizAttempts/${attemptId}`);
    }
  };

  // --- AI Tutor Methods ---
  const appendChatMessage = async (
    role: 'user' | 'assistant',
    content: string,
    courseContext?: string,
    isDemo = false
  ) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanContent = content.slice(0, 15000);
    const nowIso = new Date().toISOString();

    if (isDemoMode) {
      const msg: ChatMessage = {
        id: messageId,
        userId: demoState!.profile.uid,
        role,
        content: cleanContent,
        courseContext: courseContext?.slice(0, 180),
        isDemo,
        createdAt: nowIso,
      };
      updateDemo((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, msg],
      }));
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const payload: Record<string, unknown> = {
      id: messageId,
      userId: uid,
      role,
      content: cleanContent,
      isDemo,
      createdAt: serverTimestamp(),
    };
    if (courseContext) {
      payload.courseContext = courseContext.slice(0, 180);
    }

    try {
      await setDoc(doc(db, 'chatHistory', messageId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chatHistory/${messageId}`);
    }
  };

  const clearChatHistory = async () => {
    if (isDemoMode) {
      updateDemo((prev) => ({
        ...prev,
        chatHistory: [],
      }));
      return;
    }

    if (!firebaseUser) return;
    try {
      const batch = writeBatch(db);
      cloudChatHistory.forEach((msg) => {
        batch.delete(doc(db, 'chatHistory', msg.id));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'chatHistory');
    }
  };

  // --- Profile & Settings Methods ---
  const updateUserProfileData = async (updates: {
    fullName: string;
    bio?: string;
    photoUrl?: string;
  }) => {
    const cleanName = updates.fullName.trim().slice(0, 120);
    const cleanBio = (updates.bio || '').trim().slice(0, 500);
    const cleanPhoto = updates.photoUrl ? updates.photoUrl.slice(0, 120000) : undefined;

    if (isDemoMode) {
      updateDemo((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          fullName: cleanName || prev.profile.fullName,
          bio: cleanBio,
          photoUrl: cleanPhoto !== undefined ? cleanPhoto : prev.profile.photoUrl,
          updatedAt: new Date().toISOString(),
        },
      }));
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const payload: Record<string, unknown> = {
      fullName: cleanName || 'Student',
      bio: cleanBio,
      updatedAt: serverTimestamp(),
    };
    if (cleanPhoto !== undefined) {
      payload.photoUrl = cleanPhoto;
    }

    try {
      await updateDoc(doc(db, 'users', uid), payload);
      await updateProfile(firebaseUser, { displayName: cleanName });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateUserSettingsData = async (
    updates: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>
  ) => {
    if (isDemoMode) {
      updateDemo((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      }));
      return;
    }

    if (!firebaseUser) return;
    const uid = sanitizeId(firebaseUser.uid);
    const nextSettings = {
      theme: updates.theme ?? cloudSettings.theme,
      emailNotifications: updates.emailNotifications ?? cloudSettings.emailNotifications,
      studyReminders: updates.studyReminders ?? cloudSettings.studyReminders,
      weeklyDigest: updates.weeklyDigest ?? cloudSettings.weeklyDigest,
      dailyGoalMinutes: updates.dailyGoalMinutes ?? cloudSettings.dailyGoalMinutes,
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(doc(db, 'userSettings', uid), nextSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `userSettings/${uid}`);
    }
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    if (isDemoMode) {
      throw new Error('Password changes require a Firebase Cloud account rather than Local Demo Mode.');
    }
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('No email-authenticated user session found.');
    }
    try {
      const hasPasswordProvider = firebaseUser.providerData.some(
        (p) => p.providerId === 'password'
      );
      if (!hasPasswordProvider) {
        throw new Error(
          'Your account uses Google Sign-In. Password management is handled through your Google account.'
        );
      }
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const toggleTheme = async () => {
    const next = activeTheme === 'dark' ? 'light' : 'dark';
    applyThemeToDocument(next);
    if (isAuthenticated) {
      await updateUserSettingsData({ theme: next });
    } else {
      setCloudSettings((prev) => ({ ...prev, theme: next }));
    }
  };

  return (
    <AppContext.Provider
      value={{
        authReady,
        firebaseConnected,
        firebaseUser,
        needsEmailVerification,
        isDemoMode,
        isAuthenticated,
        profile,
        settings,
        enrollments,
        progressList,
        quizAttempts,
        chatHistory,
        stats,
        dataLoading,
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
        enrollInCourse,
        unenrollFromCourse,
        touchCourseAccess,
        toggleLessonComplete,
        saveQuizAttempt,
        appendChatMessage,
        clearChatHistory,
        updateUserProfileData,
        updateUserSettingsData,
        changeUserPassword,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}

export { COURSES_CATALOG, QUIZZES_CATALOG };
