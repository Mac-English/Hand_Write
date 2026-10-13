import React, { useState } from 'react';
import { Plus, PenTool, Edit3, Trash2, CheckCircle2, Eye, Calendar, Sparkles } from 'lucide-react';
import { HandwritingProfile } from '../../types';
import { NotebookPagePreview } from '../assignment/NotebookPagePreview';
import { HandwritingEngine } from '../../engine/handwritingEngine';

interface HandwritingProfilesListProps {
  profiles: HandwritingProfile[];
  onCreateNew: () => void;
  onEditProfile: (profile: HandwritingProfile) => void;
  onDeleteProfile: (id: string) => void;
  onOpenCharacterStudio?: () => void;
}

export const HandwritingProfilesList: React.FC<HandwritingProfilesListProps> = ({
  profiles,
  onCreateNew,
  onEditProfile,
  onDeleteProfile,
  onOpenCharacterStudio,
}) => {
  const [previewProfile, setPreviewProfile] = useState<HandwritingProfile | null>(null);

  const sampleTestText =
    'Organic Chemistry Assignment\nQuestion: Explain the nucleophilic substitution mechanism (SN2).\nAnswer: The SN2 reaction proceeds via a concerted bimolecular pathway where the nucleophile attacks the electrophilic carbon from the backside simultaneously as the leaving group departs.';

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            My Handwriting Profiles
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your saved handwriting styles, ink pigments, and notebook paper calibrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCharacterStudio && (
            <button
              onClick={onOpenCharacterStudio}
              className="px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200"
            >
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>⭐ Meri Handwriting — Character Studio</span>
            </button>
          )}
          <button
            onClick={onCreateNew}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Handwriting Profile</span>
          </button>
        </div>
      </div>

      {/* Featured Banner: Meri Handwriting & Character Requirements */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
              Personalized Characters (اپنی ہینڈ رائٹنگ)
            </span>
            <span className="text-xs text-neutral-500">76 Required Characters Ready</span>
          </div>
          <h2 className="text-base font-bold text-neutral-900 mt-1">
            Write Assignments in Your Actual Handwriting
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5 max-w-2xl">
            Draw, calibrate, or upload your handwritten characters (Capital letters A-Z, small letters a-z, digits 0-9). The platform renders assignments word-by-word with your custom strokes.
          </p>
        </div>

        {onOpenCharacterStudio && (
          <button
            onClick={onOpenCharacterStudio}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Open Character Studio</span>
          </button>
        )}
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-xs">
          <PenTool className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-800">No handwriting profiles created yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Upload sample photographs of your notebook pages to create your first personalized handwriting profile.
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => {
            const previewPage = HandwritingEngine.paginate(sampleTestText, p.styleSettings, 'en')[0];

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors"
              >
                {/* Mini Preview Box */}
                <div className="bg-neutral-100 p-4 border-b border-neutral-100 flex items-center justify-center overflow-hidden h-44">
                  {previewPage && (
                    <div className="pointer-events-none transform scale-40 origin-center">
                      <NotebookPagePreview
                        page={previewPage}
                        style={p.styleSettings}
                        language="en"
                        scale={0.4}
                      />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-neutral-900 text-sm truncate">
                      {p.profileName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500">
                    <div>
                      <span>Font: </span>
                      <span className="font-medium text-neutral-800">{p.styleSettings.fontFamily}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Ink: </span>
                      <div
                        className="w-3 h-3 rounded-full border border-neutral-300 shrink-0"
                        style={{ backgroundColor: p.styleSettings.inkColor }}
                      />
                      <span className="font-medium text-neutral-800">{p.styleSettings.inkColor}</span>
                    </div>
                    <div>
                      <span>Paper: </span>
                      <span className="font-medium text-neutral-800 capitalize">{p.styleSettings.paperStyle}</span>
                    </div>
                    <div>
                      <span>Slant: </span>
                      <span className="font-medium text-neutral-800">{p.styleSettings.slantAngle}°</span>
                    </div>
                  </div>

                  {p.analysisNotes && (
                    <div className="text-[11px] bg-neutral-50 p-2 rounded text-neutral-600 border border-neutral-100">
                      <span className="font-semibold text-neutral-700">Analysis: </span>
                      {p.analysisNotes.handwritingStyle || 'Calibrated'} · Clarity: {p.analysisNotes.clarityScore}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                    <button
                      onClick={() => setPreviewProfile(p)}
                      className="text-neutral-600 hover:text-indigo-600 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditProfile(p)}
                        className="p-1 text-neutral-500 hover:text-neutral-800 rounded"
                        title="Edit profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProfile(p.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 rounded"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      {previewProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">{previewProfile.profileName}</h3>
                <span className="text-xs text-neutral-400">Created {new Date(previewProfile.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setPreviewProfile(null)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="bg-neutral-100/80 p-6 rounded-xl flex items-center justify-center max-h-[500px] overflow-auto">
              <NotebookPagePreview
                page={HandwritingEngine.paginate(sampleTestText, previewProfile.styleSettings, 'en')[0]}
                style={previewProfile.styleSettings}
                scale={0.55}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  const p = previewProfile;
                  setPreviewProfile(null);
                  onEditProfile(p);
                }}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
              >
                Edit Settings
              </button>
              <button
                onClick={() => setPreviewProfile(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
