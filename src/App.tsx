import React, { Component, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { DashboardView } from './pages/DashboardView';
import { CoursesView } from './pages/CoursesView';
import { CoursePlayerView } from './pages/CoursePlayerView';
import { QuizView } from './pages/QuizView';
import { AiTutorView } from './pages/AiTutorView';
import { ProgressView } from './pages/ProgressView';
import { ProfileView } from './pages/ProfileView';
import { SettingsView } from './pages/SettingsView';
import type { AuthMode, WorkspaceTab } from './types/lms';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-4">
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type RootView = 'landing' | 'auth' | 'workspace';

const AppRouter: React.FC = () => {
  const { authReady, isAuthenticated, needsEmailVerification } = useApp();

  const [rootView, setRootView] = useState<RootView>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string>('ai-ml-foundations');
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);
  const [pendingQuizId, setPendingQuizId] = useState<string | null>(null);
  const [tutorContextCourse, setTutorContextCourse] = useState<string | undefined>(undefined);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string | undefined>(undefined);

  // Route protection & automatic transition after sign-in / sign-out
  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated && rootView === 'auth') {
      setRootView('workspace');
    } else if (!isAuthenticated && rootView === 'workspace') {
      setRootView(needsEmailVerification ? 'auth' : 'landing');
    }
  }, [authReady, isAuthenticated, needsEmailVerification, rootView]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading EduSpark AI...</span>
        </div>
      </div>
    );
  }

  const openCoursePlayer = (courseId: string, lessonId?: string) => {
    setActiveCourseId(courseId);
    setActiveLessonId(lessonId);
    setActiveTab('course-player');
    setRootView('workspace');
  };

  if (rootView === 'landing') {
    return (
      <LandingPage
        onNavigateAuth={(mode) => {
          setAuthMode(mode);
          setRootView('auth');
        }}
        onEnterDashboard={(courseId) => {
          if (!isAuthenticated) {
            setAuthMode('register');
            setRootView('auth');
            return;
          }
          if (courseId) {
            openCoursePlayer(courseId);
          } else {
            setActiveTab('dashboard');
            setRootView('workspace');
          }
        }}
      />
    );
  }

  if (rootView === 'auth' || !isAuthenticated) {
    return (
      <AuthPage
        initialMode={authMode}
        onBackHome={() => setRootView('landing')}
      />
    );
  }

  return (
    <WorkspaceLayout
      activeTab={activeTab}
      onSelectTab={(tab) => setActiveTab(tab)}
      onNavigateHome={() => setRootView('landing')}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          onOpenCourse={openCoursePlayer}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onStartQuiz={(quizId) => {
            setPendingQuizId(quizId);
            setActiveTab('quizzes');
          }}
        />
      )}

      {(activeTab === 'explore' || activeTab === 'my-courses') && (
        <CoursesView
          mode={activeTab === 'my-courses' ? 'my-courses' : 'explore'}
          onOpenCourse={openCoursePlayer}
          onSwitchExplore={() => setActiveTab('explore')}
        />
      )}

      {activeTab === 'course-player' && (
        <CoursePlayerView
          courseId={activeCourseId}
          initialLessonId={activeLessonId}
          onBack={() => setActiveTab('my-courses')}
          onAskTutor={(courseTitle, lessonTitle) => {
            setTutorContextCourse(courseTitle);
            setTutorInitialPrompt(`Explain "${lessonTitle}" from ${courseTitle} simply with an example.`);
            setActiveTab('ai-tutor');
          }}
        />
      )}

      {activeTab === 'quizzes' && (
        <QuizView
          initialQuizId={pendingQuizId}
          onClearInitialQuiz={() => setPendingQuizId(null)}
        />
      )}

      {activeTab === 'ai-tutor' && (
        <AiTutorView
          initialCourseContext={tutorContextCourse}
          initialPrompt={tutorInitialPrompt}
          onConsumeInitialPrompt={() => setTutorInitialPrompt(undefined)}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressView
          onOpenCourse={openCoursePlayer}
          onExploreCourses={() => setActiveTab('explore')}
        />
      )}

      {activeTab === 'profile' && <ProfileView />}

      {activeTab === 'settings' && <SettingsView />}
    </WorkspaceLayout>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AppErrorBoundary>
  );
}
