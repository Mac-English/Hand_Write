import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Copy,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Assignment } from '../../types';

interface ProjectsListProps {
  assignments: Assignment[];
  onOpenAssignment: (id: string) => void;
  onNewAssignment: () => void;
  onDeleteAssignment: (id: string) => void;
  onRenameAssignment: (id: string, newTitle: string) => void;
  onExportPdf: (assignment: Assignment) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  assignments,
  onOpenAssignment,
  onNewAssignment,
  onDeleteAssignment,
  onRenameAssignment,
  onExportPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subject && a.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const startRename = (a: Assignment) => {
    setEditingId(a.id);
    setEditTitle(a.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameAssignment(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            My Projects & Assignments
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review, reopen, rename, and export your saved handwritten assignments.
          </p>
        </div>

        <button
          onClick={onNewAssignment}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-indigo-500 text-neutral-800"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'rendered', label: 'Ready to Submit' },
            { id: 'drafting', label: 'Drafts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-xs">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-800">No matching projects found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Create an assignment to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-neutral-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {a.subject || 'General'}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-700">
                    {a.language === 'ur' ? 'Urdu' : 'English'}
                  </span>
                </div>

                {/* Title (or in-place rename input) */}
                {editingId === a.id ? (
                  <div className="flex items-center gap-1.5 mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(a.id)}
                      autoFocus
                      className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-indigo-400 rounded px-2 py-1 flex-1"
                    />
                    <button
                      onClick={() => saveRename(a.id)}
                      className="text-xs font-semibold text-indigo-600 px-2 py-1 bg-indigo-50 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h3
                    onClick={() => onOpenAssignment(a.id)}
                    className="font-bold text-neutral-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 mb-2"
                  >
                    {a.title}
                  </h3>
                )}

                <div className="text-xs text-neutral-500 line-clamp-2 mb-3">
                  {a.instructions || 'Standard assignment coursework draft.'}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-400 border-t border-neutral-100 pt-3">
                  <span>{a.pageCount || 1} Pages</span>
                  <span>·</span>
                  <span>{new Date(a.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100 text-xs">
                <button
                  onClick={() => onOpenAssignment(a.id)}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Open Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onExportPdf(a)}
                    title="Export PDF"
                    className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startRename(a)}
                    title="Rename"
                    className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAssignment(a.id)}
                    title="Delete"
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
