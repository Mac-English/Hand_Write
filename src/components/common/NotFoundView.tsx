import React from 'react';
import { FileQuestion, ArrowLeft, Home, BookOpen, PenTool } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  onNavigateDashboard,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Error 404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Page Not Found
          </h1>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            The notebook page, assignment, or resource you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <button
            onClick={onNavigateDashboard}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Go to Student Dashboard</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>

        <div className="pt-2 text-[11px] text-neutral-400">
          Tip: You can also calibrate a handwriting profile or start a new assignment from the top navigation.
        </div>
      </div>
    </div>
  );
};
