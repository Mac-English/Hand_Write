import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3 pb-6 border-b border-neutral-200">
        <button
          onClick={onBack}
          className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>HandWrite AI Privacy Policy</span>
          </h1>
          <p className="text-xs text-neutral-500">Effective Date: October 2026</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-xs space-y-6 text-xs text-neutral-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-neutral-900 text-sm">1. Commitment to Student Privacy</h2>
          <p>
            HandWrite AI ("we", "us", or "the platform") is designed with privacy-by-design principles. We recognize that student handwriting and academic coursework represent personal and sensitive educational artifacts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-neutral-900 text-sm">2. Voluntary Handwriting Sample Uploads</h2>
          <p>
            Students voluntarily provide photographs of their notebook pages strictly to extract stylistic parameters (such as slant angle, stroke width, ink tone, and line height).
          </p>
          <p className="font-semibold text-indigo-900 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
            Strict Non-Training Guarantee: Your uploaded handwriting photographs and study materials are never used to train public foundation models or shared with third-party advertising networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-neutral-900 text-sm">3. Data Isolation via Row Level Security (RLS)</h2>
          <p>
            All application databases utilize PostgreSQL Row Level Security (RLS) policies. Every user’s assignments, handwriting profiles, and generated PDF documents are isolated by their authenticated unique user identifier.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-neutral-900 text-sm">4. Data Deletion and Export Rights</h2>
          <p>
            You have the absolute right to export all stored project records or delete your handwriting profiles and assignments at any time. When deleted, all associated records are permanently erased from the system.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-neutral-900 text-sm">5. Contact Information</h2>
          <p>
            For inquiries regarding privacy, data retention, or deletion requests, please contact our privacy compliance team at{' '}
            <span className="font-mono text-neutral-900">privacy@handwrite.ai</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
