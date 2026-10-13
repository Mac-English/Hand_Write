import React from 'react';
import {
  PenTool,
  Sparkles,
  User,
  LogOut,
  LayoutDashboard,
  FilePlus,
  FolderKanban,
  Star,
  Settings,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  deviceFrameMode?: boolean;
  onToggleDeviceFrame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  deviceFrameMode = false,
  onToggleDeviceFrame,
}) => {
  const isDashboardView =
    currentView === 'dashboard' ||
    currentView === 'new-assignment' ||
    currentView === 'my-handwriting' ||
    currentView === 'character-studio' ||
    currentView === 'projects' ||
    currentView === 'settings' ||
    currentView === 'assignment-editor' ||
    currentView === 'handwriting-customization' ||
    currentView === 'document-preview' ||
    currentView === 'export-download';

  const isCanvasEditorView =
    currentView === 'assignment-editor' || currentView === 'character-studio';

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          {/* Brand Wordmark matching showcase: Emerald rounded icon with pen & squiggle */}
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                <path d="M4 22h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1z" opacity="0.7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
                  HandWrite
                </span>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 hidden sm:block tracking-wide mt-0.5">
                Your Thoughts ✦ Your Handwriting ✦ Your Assignments
              </span>
            </div>
          </button>

          {/* Desktop navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {!isDashboardView ? (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 cursor-pointer ${
                    currentView === 'landing' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  FAQ & Help
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 cursor-pointer ${
                    currentView === 'dashboard' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('new-assignment')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 cursor-pointer ${
                    currentView === 'new-assignment' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => onNavigate('character-studio')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 flex items-center gap-1 cursor-pointer ${
                    currentView === 'character-studio' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
                  }`}
                >
                  <span className="text-amber-500 font-bold">⭐</span>
                  <span>Meri Handwriting</span>
                </button>
                <button
                  onClick={() => onNavigate('projects')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 cursor-pointer ${
                    currentView === 'projects' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
                  }`}
                >
                  My Projects
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-700 cursor-pointer ${
                    currentView === 'settings' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Mode Switcher: Device Frame Mockup Mode vs Full Screen */}
            {onToggleDeviceFrame && (
              <button
                onClick={onToggleDeviceFrame}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Toggle Phone Mockup View vs Full Desktop View"
              >
                {deviceFrameMode ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Desktop View</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Phone Mockup Mode</span>
                  </>
                )}
              </button>
            )}

            {!user || user.isDemoUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('new-assignment')}
                  className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Assignment</span>
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {(user.displayName || 'M')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.displayName || 'Mudasir'}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Android Bottom Navigation Bar (5 Icons, matches Screen 2 in image) */}
      {!isCanvasEditorView && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentView === 'dashboard' || currentView === 'landing'
              ? 'text-emerald-700 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('new-assignment')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentView === 'new-assignment'
              ? 'text-emerald-700 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FilePlus className="w-4 h-4 mb-0.5" />
          <span>Write</span>
        </button>

        <button
          onClick={() => onNavigate('character-studio')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentView === 'character-studio'
              ? 'text-emerald-700 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Star className="w-4 h-4 mb-0.5 text-amber-500 fill-amber-400" />
          <span>Meri Hand...</span>
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentView === 'projects'
              ? 'text-emerald-700 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FolderKanban className="w-4 h-4 mb-0.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentView === 'settings'
              ? 'text-emerald-700 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Settings</span>
        </button>
      </div>
      )}
    </>
  );
};
