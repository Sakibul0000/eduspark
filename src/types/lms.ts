export type CourseCategory =
  | 'Computer Science'
  | 'Programming'
  | 'Artificial Intelligence'
  | 'Data Science'
  | 'Web Development'
  | 'Mathematics';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string;
  keyTakeaways: string[];
  codeExample?: {
    language: string;
    code: string;
  };
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  instructor: string;
  instructorRole: string;
  description: string;
  thumbnail: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  lessonsCount: number;
  popularity: number;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  order: number;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: CourseCategory;
  courseId: string;
  description: string;
  timeLimitSeconds: number;
  difficulty: DifficultyLevel;
  questions: QuizQuestion[];
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed';
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface LearningProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  totalLessons: number;
  progressPercent: number;
  minutesSpent: number;
  activityDates: string[];
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  answers: number[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  courseContext?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  studyReminders: boolean;
  weeklyDigest: boolean;
  dailyGoalMinutes: number;
  updatedAt: string;
}

export type AuthMode = 'login' | 'register' | 'forgot';

export type WorkspaceTab =
  | 'dashboard'
  | 'my-courses'
  | 'explore'
  | 'course-player'
  | 'quizzes'
  | 'ai-tutor'
  | 'progress'
  | 'profile'
  | 'settings';
