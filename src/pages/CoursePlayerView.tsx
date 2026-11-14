import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { COURSES_CATALOG, useApp } from '../context/AppContext';
import { MarkdownMessage } from '../components/MarkdownMessage';

interface CoursePlayerViewProps {
  courseId: string;
  initialLessonId?: string;
  onBack: () => void;
  onAskTutor: (courseTitle: string, lessonTitle: string) => void;
}

export const CoursePlayerView: React.FC<CoursePlayerViewProps> = ({
  courseId,
  initialLessonId,
  onBack,
  onAskTutor,
}) => {
  const {
    enrollments,
    progressList,
    enrollInCourse,
    toggleLessonComplete,
    touchCourseAccess,
  } = useApp();

  const course = COURSES_CATALOG.find((c) => c.id === courseId) || COURSES_CATALOG[0];
  const isEnrolled = enrollments.some((e) => e.courseId === course.id);
  const progress = progressList.find((p) => p.courseId === course.id);
  const completedSet = new Set(progress?.completedLessonIds || []);

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (initialLessonId && course.lessons.some((l) => l.id === initialLessonId)) {
      return initialLessonId;
    }
    if (progress?.lastLessonId && course.lessons.some((l) => l.id === progress.lastLessonId)) {
      return progress.lastLessonId;
    }
    return course.lessons[0].id;
  });
  const [busy, setBusy] = useState(false);

  const activeIndex = Math.max(
    0,
    course.lessons.findIndex((l) => l.id === activeLessonId)
  );
  const activeLesson = course.lessons[activeIndex];
  const isLessonCompleted = completedSet.has(activeLesson.id);

  useEffect(() => {
    if (isEnrolled) {
      touchCourseAccess(course.id, activeLesson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, activeLesson.id, isEnrolled]);

  const handleToggleComplete = async () => {
    setBusy(true);
    try {
      if (!isEnrolled) {
        await enrollInCourse(course.id);
      }
      await toggleLessonComplete(course.id, activeLesson.id, activeLesson.durationMinutes);
    } finally {
      setBusy(false);
    }
  };

  const handleEnroll = async () => {
    setBusy(true);
    try {
      await enrollInCourse(course.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </button>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {course.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {course.category} · {course.instructor} ·{' '}
            <span className="tabular-nums">
              {completedSet.size}/{course.lessons.length} lessons completed ({progress?.progressPercent || 0}%)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isEnrolled && (
            <button
              type="button"
              disabled={busy}
              onClick={handleEnroll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Enroll in Course</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onAskTutor(course.title, activeLesson.title)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Split: Lesson Syllabus + Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Syllabus Sidebar */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-4 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Course Syllabus
            </h2>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {progress?.progressPercent || 0}%
            </span>
          </div>
          <div className="h-1.5 mx-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
              style={{ width: `${progress?.progressPercent || 0}%` }}
            />
          </div>

          <div className="pt-2 space-y-1">
            {course.lessons.map((lesson) => {
              const isActive = lesson.id === activeLesson.id;
              const done = completedSet.has(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug">
                      {lesson.order}. {lesson.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {lesson.durationMinutes} min
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Lesson Content Reader */}
        <article className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 sm:p-8 space-y-6">
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-indigo-600 dark:text-violet-400 tabular-nums">
                Lesson {activeLesson.order} of {course.lessons.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {activeLesson.durationMinutes} min read
              </span>
              {isLessonCompleted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                </>
              )}
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {activeLesson.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{activeLesson.summary}</p>
          </div>

          <div className="space-y-4 text-slate-700 dark:text-slate-200 text-base leading-relaxed">
            {activeLesson.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {activeLesson.codeExample && (
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Code Reference
              </h3>
              <MarkdownMessage
                content={`\`\`\`${activeLesson.codeExample.language}\n${activeLesson.codeExample.code}\n\`\`\``}
              />
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B1120] p-5 space-y-2.5">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Key Takeaways
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              {activeLesson.keyTakeaways.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Lesson Footer Controls */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveLessonId(course.lessons[activeIndex - 1].id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={activeIndex === course.lessons.length - 1}
                onClick={() => setActiveLessonId(course.lessons[activeIndex + 1].id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isLessonCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white'
              }`}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isLessonCompleted ? 'Completed (Click to Undo)' : 'Mark Lesson Complete'}</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
