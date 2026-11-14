import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Play,
  Sparkles,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COURSES_CATALOG, QUIZZES_CATALOG, useApp } from '../context/AppContext';
import { CourseThumbnail } from '../components/CourseThumbnail';
import type { WorkspaceTab } from '../types/lms';

interface DashboardViewProps {
  onOpenCourse: (courseId: string, lessonId?: string) => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onStartQuiz: (quizId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCourse,
  onNavigateTab,
  onStartQuiz,
}) => {
  const { profile, settings, enrollments, progressList, quizAttempts, stats, dataLoading } =
    useApp();

  const enrolledCourses = enrollments
    .map((enr) => {
      const course = COURSES_CATALOG.find((c) => c.id === enr.courseId);
      const prog = progressList.find((p) => p.courseId === enr.courseId);
      return course ? { enrollment: enr, course, progress: prog } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Build upcoming learning activities from real uncompleted lessons + untaken quizzes
  const upcomingActivities: {
    id: string;
    title: string;
    subtitle: string;
    durationLabel: string;
    actionLabel: string;
    onClick: () => void;
  }[] = [];

  for (const item of enrolledCourses) {
    const completedSet = new Set(item.progress?.completedLessonIds || []);
    const nextLesson = item.course.lessons.find((l) => !completedSet.has(l.id));
    if (nextLesson) {
      upcomingActivities.push({
        id: `lesson-${nextLesson.id}`,
        title: nextLesson.title,
        subtitle: `${item.course.title} · Lesson ${nextLesson.order} of ${item.course.lessonsCount}`,
        durationLabel: `${nextLesson.durationMinutes} min`,
        actionLabel: 'Continue',
        onClick: () => onOpenCourse(item.course.id, nextLesson.id),
      });
    }
    if (upcomingActivities.length >= 3) break;
  }

  const takenQuizIds = new Set(quizAttempts.map((a) => a.quizId));
  for (const quiz of QUIZZES_CATALOG) {
    if (upcomingActivities.length >= 4) break;
    if (!takenQuizIds.has(quiz.id)) {
      upcomingActivities.push({
        id: `quiz-${quiz.id}`,
        title: quiz.title,
        subtitle: `Assessment · ${quiz.questions.length} questions`,
        durationLabel: `${Math.round(quiz.timeLimitSeconds / 60)} min`,
        actionLabel: 'Take Quiz',
        onClick: () => onStartQuiz(quiz.id),
      });
    }
  }

  const isDark = settings.theme === 'dark';

  if (dataLoading && !profile) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-indigo-600 dark:text-violet-400">
            Student Overview
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {profile?.fullName || 'Scholar'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {stats.totalEnrolled > 0
              ? `You are ${stats.overallProgressPercent}% through your enrolled courses with a ${stats.streakDays}-day active streak.`
              : 'Enroll in your first course to start tracking lessons, quizzes, and study streaks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('ai-tutor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
            <span>Ask AI Tutor</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('explore')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all whitespace-nowrap shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Courses</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.totalEnrolled}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Out of {COURSES_CATALOG.length} catalog courses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Courses Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.coursesCompleted}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            100% syllabus mastery
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Learning Hours</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.learningHoursLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Daily goal: {settings.dailyGoalMinutes}m
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Average Quiz Score</span>
            <Award className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {quizAttempts.length > 0 ? `${stats.averageQuizScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {quizAttempts.length > 0
              ? `Across ${quizAttempts.length} attempt${quizAttempts.length === 1 ? '' : 's'}`
              : 'No quizzes submitted yet'}
          </p>
        </div>
      </section>

      {/* Overall Progress + Weekly Activity Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Weekly Learning Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minutes studied across the last 7 days
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('progress')}
              className="text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:underline whitespace-nowrap shrink-0"
            >
              Full Analytics
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyActivity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? '#1E293B' : '#E2E8F0'}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                  unit="m"
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
                <Bar
                  dataKey="minutes"
                  name="Study Minutes"
                  fill={isDark ? '#8B5CF6' : '#4F46E5'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Progress + Upcoming Activities */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Overall Learning Progress
              </h2>
              <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-violet-400 tabular-nums">
                {stats.overallProgressPercent}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                style={{ width: `${stats.overallProgressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Current streak: {stats.streakDays} day{stats.streakDays === 1 ? '' : 's'}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Upcoming Learning Activities
            </h3>
            {upcomingActivities.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                All enrolled lessons and available quizzes are complete. Explore more courses to keep growing.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingActivities.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {act.subtitle} · <span className="tabular-nums">{act.durationLabel}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={act.onClick}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:bg-indigo-50 dark:hover:bg-violet-950/50 transition-colors whitespace-nowrap shrink-0"
                    >
                      {act.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Accessed Courses & Recent Quiz Results */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recently Accessed Courses
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('my-courses')}
              className="text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:underline whitespace-nowrap shrink-0"
            >
              View All
            </button>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You haven’t enrolled in any courses yet.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('explore')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                <span>Browse Course Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 3).map(({ course, progress }) => {
                const pct = progress?.progressPercent || 0;
                const completedCount = progress?.completedLessonIds.length || 0;
                return (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0 border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-full sm:w-28 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                      <CourseThumbnail
                        src={course.thumbnail}
                        alt={course.title}
                        title={course.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {course.category} · <span className="tabular-nums">{completedCount}/{course.lessonsCount} lessons</span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600 dark:bg-violet-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCourse(course.id, progress?.lastLessonId)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Continue</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Quiz Results */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recent Quiz Results
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('quizzes')}
              className="text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:underline whitespace-nowrap shrink-0"
            >
              All Quizzes
            </button>
          </div>

          {quizAttempts.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Complete your first quiz to see scores and performance trends here.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('quizzes')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>Open Quizzes</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {quizAttempts.slice(0, 4).map((attempt) => (
                <div key={attempt.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {attempt.quizTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {attempt.score}/{attempt.totalQuestions} correct ·{' '}
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        attempt.percentage >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : attempt.percentage >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {attempt.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
