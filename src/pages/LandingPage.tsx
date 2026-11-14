import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { CourseThumbnail } from '../components/CourseThumbnail';
import { COURSES_CATALOG, COURSE_CATEGORIES } from '../data/catalog';
import { useApp } from '../context/AppContext';
import type { CourseCategory } from '../types/lms';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  onEnterDashboard: (courseId?: string) => void;
}

const BENEFITS = [
  {
    num: '01.',
    title: 'Structured Curriculum with Real Progress Persistence',
    body: 'Every course breaks complex computer science, AI, and mathematics topics into focused lessons with runnable code examples and automatic cloud progress tracking.',
    span: 'lg:col-span-2',
  },
  {
    num: '02.',
    title: 'Timed MCQ Assessments with Line-by-Line Explanations',
    body: 'Practice under realistic countdown timers, jump between questions freely, and review detailed explanations for every answer choice.',
    span: 'lg:col-span-1',
  },
  {
    num: '03.',
    title: 'EduSpark AI Tutor Grounded in Your Active Course',
    body: 'Ask for plain-language explanations, step-by-step debugging help, custom study schedules, or extra practice questions whenever you get stuck.',
    span: 'lg:col-span-1',
  },
  {
    num: '04.',
    title: 'Honest Analytics Derived from Real Study Activity',
    body: 'Track completed lessons, study hours, quiz score trajectories, and multi-day streaks calculated directly from your saved activity.',
    span: 'lg:col-span-2',
  },
];

const TESTIMONIALS = [
  {
    name: 'Nadia Kowalski',
    role: 'MSc Computer Science Candidate',
    org: 'ETH Zurich',
    quote:
      'Before EduSpark AI, I kept bouncing between scattered lecture slides and video playlists. Having structured lessons, timed algorithm quizzes, and an AI tutor that explains Big-O step by step cut my exam prep time in half.',
  },
  {
    name: 'Devon Takahashi',
    role: 'Junior Backend Engineer',
    org: 'Northstar Systems',
    quote:
      'The Python and TypeScript tracks bridge theory and production habits cleanly. Tracking my daily study minutes alongside quiz score trends kept me consistent across six straight weeks.',
  },
  {
    name: 'Amina Benali',
    role: 'Data Analyst',
    org: 'CivicMetrics Lab',
    quote:
      'Linear Algebra and Applied Data Science finally clicked once I paired the written lessons with custom practice questions from EduSpark AI Tutor.',
  },
];

const FAQS = [
  {
    q: 'How does EduSpark AI save my course progress and quiz results?',
    a: 'When you sign in with Google or a verified email account, your profile, enrollments, completed lessons, quiz attempts, AI tutor history, and theme preferences persist in Cloud Firestore in real time. You can also explore everything locally in Demo Mode.',
  },
  {
    q: 'What makes EduSpark AI Tutor different from a generic chat window?',
    a: 'EduSpark AI Tutor connects server-side to Gemini and lets you attach your active course as context—so explanations, code examples, and study plans match what you are currently studying.',
  },
  {
    q: 'Are the quizzes timed and do they show explanations?',
    a: 'Yes. Each quiz includes a live countdown timer, question navigator, submission confirmation, automatic percentage grading, and full answer-by-answer review with explanations.',
  },
  {
    q: 'Can I switch between light mode and deep navy dark mode?',
    a: 'Yes. Toggle light or dark mode anytime from the navigation bar, workspace header, or Settings page. Your preference is saved automatically across sessions.',
  },
  {
    q: 'Does EduSpark AI work on phones and tablets?',
    a: 'Every screen—from the landing page and course reader to the quiz runner, charts, and AI chat—is responsive across desktop monitors, laptops, tablets, and mobile phones.',
  },
];

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateAuth,
  onEnterDashboard,
}) => {
  const { isAuthenticated, settings, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const visibleCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COURSES_CATALOG.filter((c) => {
      const catMatch = selectedCategory === 'All' || c.category === selectedCategory;
      const textMatch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return catMatch && textMatch;
    }).slice(0, 6);
  }, [selectedCategory, searchQuery]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080D1A] dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#080D1A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a href="#top" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
            <BrandMark />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('courses')}
              className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
            >
              Benefits
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('testimonials')}
              className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
            >
              Testimonials
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => (isAuthenticated ? onEnterDashboard() : onNavigateAuth('register'))}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1426] px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => scrollToSection('courses')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Benefits
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Testimonials
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              FAQ
            </button>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) onEnterDashboard();
                  else onNavigateAuth('register');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAuth('login');
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero Split */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 lg:pt-16 lg:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-medium text-indigo-600 dark:text-violet-400">
                Intelligent Learning Management Platform
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 dark:text-white text-balance leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)' }}
              >
                Learn Smarter. Grow Faster.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 dark:from-indigo-400 dark:via-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Achieve More.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Master computer science, programming, artificial intelligence, data science, and mathematics in one cohesive workspace—combining structured interactive lessons, timed MCQ quizzes, live progress analytics, and an on-demand AI Study Tutor.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => (isAuthenticated ? onEnterDashboard() : onNavigateAuth('register'))}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('courses')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#11192E] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Courses</span>
                </button>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => onNavigateAuth('login')}
                    className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#11192E]">
                <CourseThumbnail
                  src="/src/assets/images/hero_learning_studio_1794636275774.jpg"
                  alt="Students collaborating on laptops in a sunlit modern computer science and design studio"
                  title="EduSpark AI Learning Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Platform Statistics Strip below hero */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C]">
            <div className="p-6">
              <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                8 Courses
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                44 interactive lessons with code
              </p>
            </div>
            <div className="p-6">
              <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                6 Disciplines
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                CS, AI, Data Science, Web & Math
              </p>
            </div>
            <div className="p-6">
              <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                20 Questions
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                4 timed MCQ quizzes with review
              </p>
            </div>
            <div className="p-6">
              <p className="font-display text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-violet-400 tabular-nums">
                24/7 AI Tutor
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Course-aware study guidance
              </p>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section id="courses" className="py-16 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                  Featured Courses Across Core Technical Disciplines
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Preview our curriculum below. Enroll inside your student workspace to track lesson completion and sync progress.
                </p>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses or instructors..."
                  aria-label="Search featured courses"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Category filter segmented tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
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

            {visibleCourses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-10 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No courses matched "{searchQuery}".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCourses.map((course) => (
                  <article
                    key={course.id}
                    className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] overflow-hidden hover:border-indigo-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <CourseThumbnail
                        src={course.thumbnail}
                        alt={`${course.title} illustration`}
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
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 flex-1">
                        {course.description}
                      </p>
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {course.instructor} · <span className="tabular-nums">{course.lessonsCount} lessons</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            isAuthenticated ? onEnterDashboard(course.id) : onNavigateAuth('register')
                          }
                          className="text-xs font-semibold text-indigo-600 dark:text-violet-400 hover:text-indigo-500 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                        >
                          <span>{isAuthenticated ? 'Open Course' : 'Enroll'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Platform Benefits Bento */}
        <section id="benefits" className="py-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Built for Deep Understanding, Not Passive Watching
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Every workflow in EduSpark AI reinforces active recall, immediate feedback, and measurable consistency.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {BENEFITS.map((item) => (
                <div
                  key={item.num}
                  className={`${item.span} rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#10182C] p-7`}
                >
                  <p className="font-mono text-sm font-semibold text-indigo-600 dark:text-violet-400 tabular-nums">
                    {item.num}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-16 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                How Learners Use EduSpark AI Every Week
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex flex-col justify-between"
                >
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{t.quote}"
                  </p>
                  <footer className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.role} · {t.org}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {FAQS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-5 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-2xl border border-indigo-200 dark:border-violet-800/60 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/50 dark:via-[#10182C] dark:to-violet-950/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Ready to start your next learning streak?
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Create your free account or open the dashboard immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => (isAuthenticated ? onEnterDashboard() : onNavigateAuth('register'))}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 whitespace-nowrap shrink-0"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <BrandMark />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} EduSpark AI. Built for focused technical mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <button type="button" onClick={() => scrollToSection('courses')} className="hover:text-slate-900 dark:hover:text-white">
              Courses
            </button>
            <button type="button" onClick={() => scrollToSection('benefits')} className="hover:text-slate-900 dark:hover:text-white">
              Benefits
            </button>
            <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-slate-900 dark:hover:text-white">
              FAQ
            </button>
            <button
              type="button"
              onClick={() => onNavigateAuth('login')}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
            >
              {settings.theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
