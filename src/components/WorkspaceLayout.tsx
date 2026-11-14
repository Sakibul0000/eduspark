import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useApp } from '../context/AppContext';
import type { WorkspaceTab } from '../types/lms';

interface WorkspaceLayoutProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-courses', label: 'My Courses', icon: BookOpen },
  { id: 'explore', label: 'Explore Courses', icon: Compass },
  { id: 'quizzes', label: 'Quizzes', icon: CheckSquare },
  { id: 'ai-tutor', label: 'AI Study Assistant', icon: Sparkles },
  { id: 'progress', label: 'My Progress', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TAB_TITLES: Record<WorkspaceTab, string> = {
  dashboard: 'Dashboard',
  'my-courses': 'My Courses',
  explore: 'Explore Courses',
  'course-player': 'Course Player',
  quizzes: 'Quizzes',
  'ai-tutor': 'AI Study Assistant',
  progress: 'My Progress',
  profile: 'Profile',
  settings: 'Settings',
};

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  activeTab,
  onSelectTab,
  onNavigateHome,
  children,
}) => {
  const { profile, settings, isDemoMode, toggleTheme, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: WorkspaceTab) => {
    setMobileOpen(false);
    onSelectTab(tab);
  };

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onNavigateHome}
          title="Return to EduSpark AI Home"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
        >
          <BrandMark compact={!isMobile && collapsed} />
        </button>

        {!isMobile ? (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Student Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (activeTab === 'course-player' && item.id === 'my-courses');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              title={!isMobile && collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-violet-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {(isMobile || !collapsed) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => logout()}
          title={!isMobile && collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(isMobile || !collapsed) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] transition-[width] duration-200 sticky top-0 h-screen ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 h-full z-10">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
              {TAB_TITLES[activeTab]}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => toggleTheme()}
              aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors max-w-[200px]"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate hidden sm:inline">
                {profile?.fullName || 'Student'}
              </span>
            </button>
          </div>
        </header>

        {isDemoMode && (
          <div className="px-4 sm:px-6 py-2 border-b border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              Local Demo Mode active — changes are saved in your browser rather than Cloud Firestore.
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="font-semibold underline hover:no-underline"
            >
              Switch to Cloud Account
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
