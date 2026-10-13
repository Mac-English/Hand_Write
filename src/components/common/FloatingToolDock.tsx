import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Sliders,
  Check,
  PenTool,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface ToolDockItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  badge?: string | number;
  activeIndicatorColor?: string;
  tooltip?: string;
}

interface FloatingToolDockProps {
  items: ToolDockItem[];
  activeItemId: string | null;
  onSelectItem: (id: string | null) => void;
  renderDrawerContent: (activeId: string) => React.ReactNode;
  title?: string;
  subtitle?: string;
  position?: 'right' | 'left' | 'bottom';
  className?: string;
  /** Breakpoint in pixels below which the dock automatically expands horizontally at the bottom (default: 768px) */
  mobileBreakpoint?: number;
  /** Whether the mobile dock begins collapsed to minimize initial canvas obstruction */
  defaultMobileCollapsed?: boolean;
  /** Callback fired when mobile dock collapses or expands */
  onMobileCollapseChange?: (collapsed: boolean) => void;
}

export const FloatingToolDock: React.FC<FloatingToolDockProps> = ({
  items,
  activeItemId,
  onSelectItem,
  renderDrawerContent,
  title,
  subtitle,
  position = 'right',
  className = '',
  mobileBreakpoint = 768,
  defaultMobileCollapsed = false,
  onMobileCollapseChange,
}) => {
  // Responsive breakpoint check state
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < mobileBreakpoint;
    }
    return false;
  });

  const [isMobileCollapsed, setIsMobileCollapsed] = useState<boolean>(defaultMobileCollapsed);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic responsive breakpoint listener: seamlessly detect phone/tablet/desktop transitions
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

    const handleResize = () => {
      const matches = window.innerWidth < mobileBreakpoint;
      setIsMobile(matches);
    };

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Initial check
    setIsMobile(window.innerWidth < mobileBreakpoint);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectItem]);

  const activeItem = items.find((item) => item.id === activeItemId);

  const toggleMobileCollapse = () => {
    const nextState = !isMobileCollapsed;
    setIsMobileCollapsed(nextState);
    if (onMobileCollapseChange) {
      onMobileCollapseChange(nextState);
    }
  };

  return (
    <>
      {/* ========================================================== */}
      {/* MOBILE EXPERIENCE: Automatically Expands Horizontally at   */}
      {/* Bottom of Screen with Accessible Touch Targets (min 48px)  */}
      {/* and Non-Obstructive Collapse Controls for Handwriting      */}
      {/* ========================================================== */}
      <div className={`${isMobile ? 'block' : 'hidden md:hidden'}`}>
        {/* COLLAPSED STATE ON MOBILE: Floating unobtrusive compact pill */}
        {isMobileCollapsed ? (
          <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-auto animate-fadeIn">
            <button
              onClick={toggleMobileCollapse}
              className="min-w-[48px] min-h-[48px] px-3.5 py-2.5 bg-stone-900/95 hover:bg-stone-800 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-xl flex items-center gap-2 cursor-pointer touch-manipulation active:scale-95 transition-all select-none"
              title="Expand editing tools"
              aria-label="Expand tools"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-tight">Tools</span>
              <span className="bg-stone-800 text-stone-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono border border-stone-700">
                {items.length}
              </span>
              <ChevronUp className="w-4 h-4 text-stone-400 ml-0.5" />
            </button>
          </div>
        ) : (
          /* EXPANDED HORIZONTAL DOCK ON MOBILE: Automatically spans screen width at bottom */
          <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto transition-transform duration-300 ease-out">
            <div className="w-full bg-stone-900/95 backdrop-blur-2xl border-t border-white/15 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] px-2 sm:px-4 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-1">
                {/* Horizontal tool list automatically distributed for mobile touch */}
                <div className="flex-1 flex items-center justify-around overflow-x-auto scrollbar-none py-0.5 gap-1">
                  {items.map((item) => {
                    const isActive = activeItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(isActive ? null : item.id)}
                        className={`min-w-[48px] min-h-[48px] flex-1 max-w-[68px] relative p-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation select-none ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-102 ring-2 ring-emerald-400/40'
                            : 'text-stone-300 hover:text-white hover:bg-stone-800/80 active:scale-95'
                        }`}
                        title={item.tooltip || item.label}
                        aria-label={item.label}
                      >
                        <span className="w-5 h-5 flex items-center justify-center shrink-0">
                          {item.icon}
                        </span>
                        <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap text-center">
                          {item.shortLabel || item.label}
                        </span>
                        {item.badge && (
                          <span className="absolute top-1 right-1 bg-amber-400 text-stone-950 text-[9px] font-black rounded-full px-1.5 shadow-xs">
                            {item.badge}
                          </span>
                        )}
                        {item.activeIndicatorColor && !isActive && (
                          <span
                            className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-stone-900"
                            style={{ backgroundColor: item.activeIndicatorColor }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Minimize / Collapse Toggle Button: Keeps handwriting canvas unobstructed */}
                <div className="shrink-0 pl-1 border-l border-white/10 ml-1">
                  <button
                    onClick={toggleMobileCollapse}
                    className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 flex flex-col items-center justify-center transition-colors cursor-pointer touch-manipulation active:scale-95"
                    title="Minimize toolbar for unobstructed handwriting"
                    aria-label="Minimize toolbar"
                  >
                    <ChevronDown className="w-5 h-5" />
                    <span className="text-[9px] font-medium text-stone-400 mt-0.5">Hide</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Slide-up Bottom Sheet Drawer */}
        {activeItemId && activeItem && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto animate-fadeIn">
            {/* Backdrop: tap anywhere to close drawer and return to canvas */}
            <div
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => onSelectItem(null)}
              aria-label="Close drawer"
            />

            {/* Bottom Sheet Card */}
            <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[82vh] flex flex-col overflow-hidden border-t border-stone-200/80 animate-slideUp">
              {/* Sheet Drag Handle & Header */}
              <div className="pt-3 pb-2 px-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0">
                <div
                  className="w-12 h-1.5 bg-stone-300 hover:bg-stone-400 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer transition-colors"
                  onClick={() => onSelectItem(null)}
                  title="Close sheet"
                />
                <div className="flex items-center gap-2.5 mt-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                    {activeItem.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 leading-tight">
                      {activeItem.label}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {activeItem.tooltip || 'Adjust tools & preferences'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectItem(null)}
                  className="min-w-[40px] min-h-[40px] p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer mt-2 flex items-center justify-center"
                  title="Close panel"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Body with custom touch scrolling */}
              <div className="p-4 overflow-y-auto overscroll-contain flex-1 max-h-[70vh]">
                {renderDrawerContent(activeItemId)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* DESKTOP & TABLET EXPERIENCE: Floating Glass Dock & Flyout  */}
      {/* ========================================================== */}
      <div
        ref={containerRef}
        className={`${isMobile ? 'hidden' : 'hidden md:block'} fixed right-4 top-20 z-40 pointer-events-auto select-none ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Flyout Drawer Card (Expands to the left of the dock) */}
          {activeItemId && activeItem && (
            <div className="w-84 lg:w-96 bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-110px)] animate-fadeIn">
              {/* Flyout Header */}
              <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                    {activeItem.icon}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-stone-900 truncate uppercase tracking-wider">
                      {activeItem.label}
                    </h4>
                    {activeItem.tooltip && (
                      <p className="text-[10px] text-stone-500 truncate">
                        {activeItem.tooltip}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectItem(null)}
                  className="p-1 text-stone-400 hover:text-stone-800 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Close flyout"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Flyout Content */}
              <div className="p-4 overflow-y-auto flex-1 max-h-[calc(100vh-180px)] scrollbar-thin">
                {renderDrawerContent(activeItemId)}
              </div>
            </div>
          )}

          {/* Unified Vertical Dock Pill */}
          <div className="bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-1.5 flex flex-col items-center gap-1.5 transition-all">
            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800/80 transition-colors cursor-pointer"
              title={isDesktopCollapsed ? 'Expand tool dock' : 'Minimize tool dock'}
            >
              {isDesktopCollapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {!isDesktopCollapsed && (
              <>
                <div className="w-6 h-[1px] bg-stone-800 my-0.5" />

                {/* Tool Icons */}
                {items.map((item) => {
                  const isActive = activeItemId === item.id;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => onSelectItem(isActive ? null : item.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                            : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                        }`}
                        title={item.tooltip || item.label}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>

                        {/* Dot indicator if active */}
                        {isActive && (
                          <span className="absolute -left-1 w-1 h-3 rounded-full bg-white shadow-xs" />
                        )}

                        {/* Color badge preview if specified */}
                        {item.activeIndicatorColor && (
                          <span
                            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-stone-900 shadow-xs"
                            style={{ backgroundColor: item.activeIndicatorColor }}
                          />
                        )}
                      </button>

                      {/* Tooltip on hover */}
                      <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-stone-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
