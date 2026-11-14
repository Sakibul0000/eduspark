import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Loader2,
  Play,
  Search,
  Trash2,
} from 'lucide-react';
import { COURSES_CATALOG, useApp } from '../context/AppContext';
import { COURSE_CATEGORIES } from '../data/catalog';
import { CourseThumbnail } from '../components/CourseThumbnail';
import type { CourseCategory, DifficultyLevel } from '../types/lms';

interface CoursesViewProps {
  mode: 'explore' | 'my-courses';
  onOpenCourse: (courseId: string, lessonId?: string) => void;
  onSwitchExplore: () => void;
}

type SortOption = 'popular' | 'duration' | 'title';

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  mode,
  onOpenCourse,
  onSwitchExplore,
}) => {
  const { enrollments, progressList, enrollInCourse, unenrollFromCourse } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.courseId)), [enrollments]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = COURSES_CATALOG.filter((course) => {
      if (mode === 'my-courses' && !enrolledIds.has(course.id)) return false;
      if (selectedCategory !== 'All' && course.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && course.difficulty !== selectedDifficulty) return false;
      if (q) {
        const hay = `${course.title} ${course.instructor} ${course.description} ${course.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'popular') return b.popularity - a.popularity;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return a.title.localeCompare(b.title);
    });
  }, [mode, enrolledIds, selectedCategory, selectedDifficulty, searchQuery, sortBy]);

  const handleEnroll = async (courseId: string) => {
    setActionError(null);
    setBusyCourseId(courseId);
    try {
      await enrollInCourse(courseId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to enroll right now.');
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    setActionError(null);
    setBusyCourseId(courseId);
    try {
      await unenrollFromCourse(courseId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to unenroll right now.');
    } finally {
      setBusyCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {mode === 'my-courses' ? 'My Enrolled Courses' : 'Explore Courses'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {mode === 'my-courses'
              ? 'Resume your active tracks, review completed syllabi, or manage your enrollments.'
              : 'Browse structured courses across computer science, AI, programming, data science, web development, and math.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Difficulty filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'All')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            aria-label="Sort courses"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="popular">Sort: Most Popular</option>
            <option value="duration">Sort: Shortest Duration</option>
            <option value="title">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course title, topic, or instructor..."
            aria-label="Search courses"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-[#10182C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-[#10182C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300"
        >
          {actionError}
        </div>
      )}

      {/* Course Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-12 text-center space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'my-courses' && enrollments.length === 0
              ? 'No enrolled courses yet'
              : 'No matching courses found'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {mode === 'my-courses' && enrollments.length === 0
              ? 'Explore our 8 technical courses to enroll and start tracking your lesson progress.'
              : 'Try clearing your search term or switching category and difficulty filters.'}
          </p>
          {mode === 'my-courses' && enrollments.length === 0 ? (
            <button
              type="button"
              onClick={onSwitchExplore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            const prog = progressList.find((p) => p.courseId === course.id);
            const pct = prog?.progressPercent || 0;
            const isBusy = busyCourseId === course.id;

            return (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] overflow-hidden"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <CourseThumbnail
                    src={course.thumbnail}
                    alt={`${course.title} thumbnail`}
                    title={course.title}
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-indigo-600 dark:text-violet-400">
                      {course.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{course.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatDuration(course.durationMinutes)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{course.lessonsCount} lessons</span>
                  </div>

                  <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                    {course.title}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Instructor: {course.instructor}
                  </p>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 flex-1">
                    {course.description}
                  </p>

                  {isEnrolled && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Course Progress</span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-violet-400 tabular-nums">
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
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    {isEnrolled ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenCourse(course.id, prog?.lastLessonId)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{pct > 0 ? 'Continue Learning' : 'Start Lessons'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUnenroll(course.id)}
                          title="Unenroll from course"
                          aria-label={`Unenroll from ${course.title}`}
                          className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 transition-colors disabled:opacity-50"
                        >
                          {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleEnroll(course.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-60 whitespace-nowrap"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Enroll Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCourse(course.id)}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                        >
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
