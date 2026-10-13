import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  FileText,
  Upload,
  Download,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Layers,
  Palette,
  Eye,
  Sliders,
  Globe2,
  BookOpen,
} from 'lucide-react';
import { HandwritingFont, PaperStyle } from '../../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  // Interactive mini-playground state
  const [sampleFont, setSampleFont] = useState<HandwritingFont>('Caveat');
  const [sampleInk, setSampleInk] = useState('#1e3a8a');
  const [samplePaper, setSamplePaper] = useState<PaperStyle>('ruled');
  const [sampleText, setSampleText] = useState(
    'Thermodynamics Assignment 01\nQuestion 1: State the first law of thermodynamics.\nAnswer: Energy can neither be created nor destroyed; it can only transform from one state to another. Delta U = Q - W.'
  );

  const inkColors = [
    { label: 'Royal Blue', hex: '#1e3a8a' },
    { label: 'Classic Navy', hex: '#1d4ed8' },
    { label: 'Charcoal Black', hex: '#1e293b' },
    { label: 'Emerald Ink', hex: '#047857' },
    { label: 'Violet Ink', hex: '#6b21a8' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-neutral-200/80 bg-linear-to-b from-white via-indigo-50/20 to-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Assignments. Your Handwriting.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.12]">
                Turn Your Study Materials into Personalized Handwritten Pages
              </h1>

              <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                Organize your study materials, prepare assignment drafts with AI assistance, and create beautifully formatted pages in your own handwriting style.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onExploreDemo}
                  className="px-6 py-3.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-colors cursor-pointer"
                >
                  See How It Works
                </button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Printable Multi-page PDF
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Authentic Ruled Notebook Paper
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  English & Urdu Support
                </span>
              </div>
            </div>

            {/* Right Column: Live Interactive Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 text-xs font-medium text-neutral-500">
                  <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                    <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Handwriting Renderer</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">Interactive Preview</span>
                </div>

                {/* Quick style switches */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 mb-1">Handwriting Style</label>
                    <select
                      value={sampleFont}
                      onChange={(e) => setSampleFont(e.target.value as HandwritingFont)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800"
                    >
                      <option value="Custom My Hand">⭐ Custom My Hand (Drawn Characters)</option>
                      <option value="Caveat">Caveat (Casual Cursive)</option>
                      <option value="Patrick Hand">Patrick Hand (Neat Print)</option>
                      <option value="Kalam">Kalam (Pen Script)</option>
                      <option value="Indie Flower">Indie Flower (Relaxed Hand)</option>
                      <option value="Homemade Apple">Homemade Apple (Fast Script)</option>
                      <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (اردو)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 mb-1">Notebook Paper</label>
                    <select
                      value={samplePaper}
                      onChange={(e) => setSamplePaper(e.target.value as PaperStyle)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800"
                    >
                      <option value="ruled">Classic Ruled Notebook</option>
                      <option value="legal">Yellow Legal Pad</option>
                      <option value="grid">Engineering Graph Grid</option>
                      <option value="cream">Vintage Warm Cream</option>
                      <option value="plain">Clean White</option>
                    </select>
                  </div>
                </div>

                {/* Ink Color Picker */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] text-neutral-500 font-medium">Ink Tone:</span>
                  <div className="flex items-center gap-1.5">
                    {inkColors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setSampleInk(c.hex)}
                        title={c.label}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          sampleInk === c.hex ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Notebook Page Mockup */}
                <div
                  className={`w-full min-h-[260px] p-4 rounded-lg border border-neutral-200 relative overflow-hidden transition-colors ${
                    samplePaper === 'legal'
                      ? 'bg-[#fefaec]'
                      : samplePaper === 'cream'
                      ? 'bg-[#fefcf3]'
                      : 'bg-white'
                  }`}
                >
                  {/* Ruled lines */}
                  {(samplePaper === 'ruled' || samplePaper === 'legal') && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                        backgroundPosition: '0 20px',
                      }}
                    />
                  )}
                  {/* Red Margin Line */}
                  {(samplePaper === 'ruled' || samplePaper === 'legal') && (
                    <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-red-400 pointer-events-none" />
                  )}

                  {/* Editable preview text */}
                  <textarea
                    rows={7}
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full h-full bg-transparent resize-none border-none focus:outline-hidden relative z-10 pl-6 leading-[28px]"
                    style={{
                      fontFamily: sampleFont === 'Noto Nastaliq Urdu' ? "'Noto Nastaliq Urdu', serif" : `'${sampleFont}', cursive, sans-serif`,
                      fontSize: '18px',
                      color: sampleInk,
                      direction: sampleFont === 'Noto Nastaliq Urdu' ? 'rtl' : 'ltr',
                      textAlign: sampleFont === 'Noto Nastaliq Urdu' ? 'right' : 'left',
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Type above to test live rendering</span>
                  <button
                    onClick={onGetStarted}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Open Full Wizard →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
            How HandWrite AI Works
          </h2>
          <p className="text-neutral-600 mt-3 text-base">
            From raw study materials and handwriting photos to ready-to-submit formatted notebook pages.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            {
              step: '1',
              title: 'Upload Handwriting Samples',
              desc: 'Upload clear photos of your notebook pages to calibrate slant, ink tone, and spacing.',
              icon: Upload,
            },
            {
              step: '2',
              title: 'Upload Study Materials',
              desc: 'Upload lecture slides, PDF documents, or question prompts with automatic OCR extraction.',
              icon: BookOpen,
            },
            {
              step: '3',
              title: 'Review & Edit Draft',
              desc: 'Gemini AI drafts structured answers, explanations, or essays. Review and edit before rendering.',
              icon: Sparkles,
            },
            {
              step: '4',
              title: 'Customize & Preview',
              desc: 'Pick notebook ruled lines, margin rules, font slant, and student header blocks.',
              icon: Sliders,
            },
            {
              step: '5',
              title: 'Export Multi-page PDF',
              desc: 'Download authentic multi-page PDF files or individual page PNG images for submission.',
              icon: Download,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-neutral-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-white border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Engineered for Students
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
              Comprehensive Assignment Preparation
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              Every detail is tuned for academic formatting, realistic notebook aesthetics, and privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: PenTool,
                title: 'Personalized Handwriting Calibration',
                desc: 'Upload sample notebook images to analyze your approximate slant angle, line spacing, and ink tone without claiming to forge signatures.',
              },
              {
                icon: Sparkles,
                title: 'AI Drafting & Section Refinement',
                desc: 'Generate complete assignments or refine selected sections: simplify wording, expand explanations, and correct grammar with Google Gemini.',
              },
              {
                icon: Layers,
                title: 'Authentic Notebook Paper Backgrounds',
                desc: 'Select from classic blue ruled notebook paper with red margin rules, yellow legal pads, engineering graph grid, and warm cream parchment.',
              },
              {
                icon: FileText,
                title: 'Multi-Page Smart Pagination',
                desc: 'Accurately breaks long text across multiple pages with consistent margins, student header blocks, and footer page numbers.',
              },
              {
                icon: Globe2,
                title: 'Multilingual: English & Urdu',
                desc: 'Full right-to-left (RTL) text rendering with authentic Noto Nastaliq Urdu typography alongside standard Latin fonts.',
              },
              {
                icon: ShieldCheck,
                title: 'Private & Secure Workspace',
                desc: 'Row Level Security ensures your documents and handwriting profiles remain private to your student account.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-neutral-200/70 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Privacy & Ethical Standards Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="bg-indigo-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 bg-indigo-800/60 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ethical AI & Academic Integrity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Your Handwriting. Your Privacy. No Shared Training.
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              We never use your handwriting photos or study notes to train public generative models. Your handwriting samples are analyzed strictly for your personal profile styling settings and can be deleted at any time with one click.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-indigo-200">
              <button onClick={onOpenPrivacy} className="underline hover:text-white">
                Read our Privacy Policy →
              </button>
              <button onClick={onOpenTerms} className="underline hover:text-white">
                Terms of Service →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Transparent Plans
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
              Proposed Student Plans
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              Start free today. Optional tier upgrades available for high-volume assignment workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Free Student</h3>
                <p className="text-xs text-neutral-500 mt-1">For basic coursework and study notes</p>
                <div className="mt-5 mb-6">
                  <span className="text-3xl font-bold text-neutral-900">$0</span>
                  <span className="text-xs text-neutral-500"> / forever</span>
                </div>
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 3 active assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 personalized handwriting profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ruled notebook paper rendering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-page PDF & PNG export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Student Plus */}
            <div className="bg-white rounded-2xl border-2 border-indigo-600 p-8 flex flex-col justify-between shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Student Plus</h3>
                <p className="text-xs text-neutral-500 mt-1">For active semester coursework</p>
                <div className="mt-5 mb-6">
                  <span className="text-3xl font-bold text-neutral-900">$6</span>
                  <span className="text-xs text-neutral-500"> / month (proposed)</span>
                </div>
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Unlimited assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>5 distinct handwriting profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>AI draft assistance & OCR extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>All paper backgrounds (Ruled, Legal, Grid, Cream)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>High-resolution Retina export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Start Plus Trial
              </button>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">Graduate / Pro</h3>
                <p className="text-xs text-neutral-500 mt-1">For thesis, research papers, and labs</p>
                <div className="mt-5 mb-6">
                  <span className="text-3xl font-bold text-neutral-900">$12</span>
                  <span className="text-xs text-neutral-500"> / month (proposed)</span>
                </div>
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Student Plus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited handwriting profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority OCR and document processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Urdu & multilingual support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Contact Academic Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            Answers & Clarity
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Does HandWrite AI create an exact clone of my handwriting from photos?',
              a: 'HandWrite AI uses your uploaded samples to calibrate style parameters: slant angle, stroke weight, line height, and ink tone. It matches them to carefully calibrated handwriting typography models rather than pretending to generate an untested neural forgery. This guarantees readability and consistent formatting.',
            },
            {
              q: 'Can I edit the draft before it renders into handwriting?',
              a: 'Yes, absolutely! The application requires you to review and edit the draft text before rendering. You have full control over every paragraph, question, and formula.',
            },
            {
              q: 'What paper styles are supported?',
              a: 'You can choose between classic ruled notebook paper with vertical red margin lines, engineering graph grid paper, yellow legal pads, vintage warm cream parchment, and clean plain white paper.',
            },
            {
              q: 'Does it support right-to-left languages like Urdu?',
              a: 'Yes! We support Urdu using Google Noto Nastaliq Urdu typography with authentic right-to-left layout and proper Arabic-script ligatures.',
            },
            {
              q: 'How does export work?',
              a: 'You can export complete multi-page documents as standard printable PDF files or download individual pages as high-resolution PNG images.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200/80 p-5">
              <h3 className="font-semibold text-neutral-900 text-sm">{faq.q}</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-neutral-200/80 bg-neutral-100/60 py-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <PenTool className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-neutral-800 text-sm">HandWrite AI</span>
            <span className="text-neutral-400">· Your Assignments. Your Handwriting.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenPrivacy} className="hover:text-neutral-900 transition-colors">
              Privacy Policy
            </button>
            <button onClick={onOpenTerms} className="hover:text-neutral-900 transition-colors">
              Terms & Conditions
            </button>
            <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-neutral-900 transition-colors">
              Pricing
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} HandWrite AI. Designed for authentic student assignment preparation.
          </div>
        </div>
      </footer>
    </div>
  );
};
