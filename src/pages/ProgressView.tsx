import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Play,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COURSES_CATALOG, useApp } from '../context/AppContext';

interface ProgressViewProps {
  onOpenCourse: (courseId: string, lessonId?: string) => void;
  onExploreCourses: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  onOpenCourse,
  onExploreCourses,
}) => {
  const { enrollments, progressList, quizAttempts, stats, settings } = useApp();
  const isDark = settings.theme === 'dark';

  const quizChartData = [...quizAttempts]
    .reverse()
    .map((a, idx) => ({
      attempt: `#${idx + 1}`,
      title: a.quizTitle,
      score: a.percentage,
    }));

  const enrolledRows = enrollments
    .map((enr) => {
      const course = COURSES_CATALOG.find((c) => c.id === enr.courseId);
      const prog = progressList.find((p) => p.courseId === enr.courseId);
      return course ? { enrollment: enr, course, progress: prog } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          My Learning Progress
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Every metric below is computed directly from your completed lessons, study time, and quiz submissions.
        </p>
      </div>

      {/* Top KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.overallProgressPercent}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.coursesCompleted}/{stats.totalEnrolled} courses completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Quiz Performance</span>
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {quizAttempts.length > 0 ? `${stats.averageQuizScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {quizAttempts.length > 0 ? `Best score: ${stats.bestQuizScore}%` : 'Take a quiz to track'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.streakDays} day{stats.streakDays === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consecutive active days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Study Time</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.learningHoursLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.totalMinutes} minutes logged
          </p>
        </div>
      </section>

      {/* Interactive Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Weekly Study Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded lesson and quiz minutes over the last 7 days
            </p>
          </div>
          <div className="h-64 w-full">
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
                  name="Minutes"
                  fill={isDark ? '#8B5CF6' : '#4F46E5'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Quiz Score Trajectory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentage accuracy across submitted assessments
            </p>
          </div>

          {quizChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-center px-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Submit a quiz to visualize your score trend over time.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quizChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? '#1E293B' : '#E2E8F0'}
                  />
                  <XAxis
                    dataKey="attempt"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#1E293B' : '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Score (%)"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Course-wise Progress */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Course-Wise Progress
        </h2>

        {enrolledRows.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No enrolled courses yet. Enroll in a course to track lesson-by-lesson completion.
            </p>
            <button
              type="button"
              onClick={onExploreCourses}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {enrolledRows.map(({ course, progress }) => {
              const completed = progress?.completedLessonIds.length || 0;
              const pct = progress?.progressPercent || 0;
              const mins = progress?.minutesSpent || 0;
              return (
                <div
                  key={course.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {course.category} · {completed}/{course.lessonsCount} lessons · {mins}m studied
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-violet-400 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCourse(course.id, progress?.lastLessonId)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{pct === 100 ? 'Review' : 'Continue'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Achievements */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Learning Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl border p-5 space-y-2 ${
                ach.unlocked
                  ? 'border-indigo-200 dark:border-violet-800/70 bg-white dark:bg-[#10182C]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0C1324] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-violet-400 tabular-nums">
                  {ach.unlocked ? 'Unlocked' : ach.progressLabel}
                </span>
                {ach.unlocked ? (
                  <Award className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {ach.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {ach.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
