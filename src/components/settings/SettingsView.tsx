import React, { useState } from 'react';
import {
  User,
  Database,
  Shield,
  Copy,
  CheckCircle2,
  Trash2,
  Download,
  Save,
  Globe2,
} from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { isSupabaseConfigured, supabaseConfigDetails } from '../../services/supabaseClient';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [preferredLang, setPreferredLang] = useState<Language>(user.preferredLanguage || 'en');
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      displayName,
      preferredLanguage: preferredLang,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopySqlInstructions = () => {
    navigator.clipboard.writeText(`-- HandWrite AI Supabase Migration
-- Check supabase/migrations/20261011_initial_schema.sql in the codebase repository
-- Run in your Supabase SQL Editor to establish profiles, handwriting_profiles, assignments, and generated_documents tables with Row Level Security (RLS).`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleExportWorkspaceJson = () => {
    const data = {
      user: storageService.getCurrentUser(),
      profiles: storageService.getHandwritingProfiles(),
      assignments: storageService.getAssignments(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handwrite_ai_backup_${Date.now()}.json`;
    a.click();
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to reset local storage? This will revert assignments to defaults.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Student Settings & Integrations
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your account profile, Supabase PostgreSQL database configuration, and data privacy.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {/* 1. Profile Information */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
        <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Student Account Profile</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full text-xs bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Default Assignment Language
            </label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as Language)}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
            >
              <option value="en">English (Left to Right)</option>
              <option value="ur">Urdu - اردو (Right to Left / Nastaliq)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Supabase Integration & Setup Guide */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Backend Database & Storage (Supabase)</span>
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs">
          <div>
            <div className="font-bold text-neutral-900">
              Connection Status:{' '}
              <span className={isSupabaseConfigured ? 'text-emerald-700 font-semibold' : 'text-amber-800 font-semibold'}>
                {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Local Workspace Mode (Active)'}
              </span>
            </div>
            <p className="text-neutral-500 mt-0.5">
              {isSupabaseConfigured
                ? `Endpoint: ${supabaseConfigDetails.url}`
                : 'To connect an external Supabase project, supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
            </p>
          </div>
        </div>

        {/* Database Migration Instructions */}
        <div className="space-y-2 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-800 block">Database Schema & RLS Policies:</span>
          <p>
            The project includes a complete migration script at{' '}
            <code className="bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded font-mono text-[11px]">
              supabase/migrations/20261011_initial_schema.sql
            </code>{' '}
            providing strict user isolation for handwriting profiles, assignments, generated documents, and storage buckets.
          </p>

          <button
            onClick={handleCopySqlInstructions}
            className="mt-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSql ? 'Copied migration path!' : 'Copy Migration SQL Info'}</span>
          </button>
        </div>
      </div>

      {/* 3. Data Privacy & Backup Controls */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Privacy & Data Management</span>
        </h2>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Your handwriting samples and assignment drafts are never used to train public foundation models. You maintain complete ownership and can export or purge your local records at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportWorkspaceJson}
            className="px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Workspace Backup (JSON)</span>
          </button>

          <button
            onClick={handleClearCache}
            className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Local Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
