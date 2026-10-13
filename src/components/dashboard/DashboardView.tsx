import React from 'react';
import {
  Plus,
  Upload,
  Sparkles,
  FileText,
  ChevronRight,
  PenTool,
  Download,
  Star,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Assignment, HandwritingProfile, GeneratedDocument, UserProfile } from '../../types';

interface DashboardViewProps {
  user: UserProfile;
  assignments: Assignment[];
  handwritingProfiles: HandwritingProfile[];
  exportedDocs: GeneratedDocument[];
  onNewAssignment: () => void;
  onOpenAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onManageHandwriting: () => void;
  onViewProjects: () => void;
  onOpenSettings: () => void;
  onExportAssignment: (assignment: Assignment) => void;
  onOpenCharacterStudio?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  assignments,
  handwritingProfiles,
  exportedDocs,
  onNewAssignment,
  onOpenAssignment,
  onDeleteAssignment,
  onManageHandwriting,
  onViewProjects,
  onOpenSettings,
  onExportAssignment,
  onOpenCharacterStudio,
}) => {
  // Color palette helpers for project icons
  const getProjectIconStyle = (index: number) => {
    switch (index % 3) {
      case 0:
        return {
          bg: 'bg-red-50 text-red-600 border-red-200',
        };
      case 1:
        return {
          bg: 'bg-amber-50 text-amber-600 border-amber-200',
        };
      case 2:
      default:
        return {
          bg: 'bg-blue-50 text-blue-600 border-blue-200',
        };
    }
  };

  const displayName = user.displayName?.split(' ')[0] || 'Mudasir';

  return (
    <div className="max-w-xl mx-auto px-4 py-5 sm:py-7 space-y-6">
      {/* 1. Header: Greeting & Profile Avatar matching Screen 2 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-neutral-500">Good Morning,</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 flex items-center gap-1.5 tracking-tight">
            <span>{displayName}</span>
            <span className="text-2xl">👋</span>
          </h1>
        </div>

        <button
          onClick={onOpenSettings}
          className="relative w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-sm hover:scale-105 transition-transform cursor-pointer"
          title="Profile Settings"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <span className="font-bold text-emerald-800 text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Hero Banner: Mint Green with Notebook Illustration matching Screen 2 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100/90 via-teal-50 to-emerald-50 border border-emerald-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-[260px] sm:max-w-xs z-10">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
              Create Handwritten Assignments with AI
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Type, upload or add a topic and let HandWrite AI do the rest.
            </p>
          </div>

          {/* Notebook illustration on right */}
          <div className="shrink-0 relative">
            <div className="w-20 h-22 sm:w-24 sm:h-24 bg-white rounded-xl shadow-md border border-neutral-200 transform rotate-6 p-2 flex flex-col justify-between">
              {/* Spiral rings */}
              <div className="flex justify-between px-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                ))}
              </div>
              {/* Ruled lines */}
              <div className="space-y-1.5 py-1">
                <div className="h-1 bg-indigo-200/80 rounded w-full" />
                <div className="h-1 bg-neutral-200 rounded w-4/5" />
                <div className="h-1 bg-neutral-200 rounded w-full" />
              </div>
              <div className="text-[7px] text-emerald-700 font-bold text-right tracking-tight">
                Handwritten
              </div>
            </div>

            {/* Little floating pen */}
            <div className="absolute -bottom-1 -left-2 transform -rotate-45 w-7 h-2 bg-emerald-600 rounded-full shadow-xs border border-white" />
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Section matching Screen 2 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">
          Quick Actions
        </h3>

        <div className="space-y-2.5">
          {/* Action 1: New Assignment (Green icon) */}
          <button
            onClick={onNewAssignment}
            className="w-full bg-white hover:bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-neutral-900 leading-tight">
                  New Assignment
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Start from scratch
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 2: Upload Notes (Blue icon) */}
          <button
            onClick={onNewAssignment}
            className="w-full bg-white hover:bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-neutral-900 leading-tight">
                  Upload Notes
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  From photo or PDF
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 3: AI Draft Assistant (Purple icon) */}
          <button
            onClick={onNewAssignment}
            className="w-full bg-white hover:bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-neutral-900 leading-tight">
                  AI Draft Assistant
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Simplify, expand, improve
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* 4. My Projects Section matching Screen 2 */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            My Projects
          </h3>
          <button
            onClick={onViewProjects}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {assignments.slice(0, 4).map((assignment, idx) => {
            const iconStyle = getProjectIconStyle(idx);
            const dateStr = assignment.createdAt
              ? new Date(assignment.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '12 Oct 2025';

            return (
              <div
                key={assignment.id}
                onClick={() => onOpenAssignment(assignment.id)}
                className="w-full bg-white hover:bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${iconStyle.bg}`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-neutral-900 group-hover:text-emerald-800 transition-colors">
                      {assignment.title}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {assignment.pageCount || 2} pages • {dateStr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
