import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { NewAssignmentWizard } from './components/assignment/NewAssignmentWizard';
import { HandwritingProfilesList } from './components/handwriting/HandwritingProfilesList';
import { HandwritingOnboarding } from './components/handwriting/HandwritingOnboarding';
import { HandwritingTestPreview } from './components/handwriting/HandwritingTestPreview';
import { HandwritingCalibrationSheet } from './components/handwriting/HandwritingCalibrationSheet';
import { CharacterGlyphStudio } from './components/handwriting/CharacterGlyphStudio';
import { ProjectsList } from './components/projects/ProjectsList';
import { SettingsView } from './components/settings/SettingsView';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';
import { HelpFaq } from './components/legal/HelpFaq';
import { AuthModal } from './components/auth/AuthModal';
import { RegisterPage } from './components/auth/RegisterPage';
import { LoginPage } from './components/auth/LoginPage';
import { PasswordResetPage } from './components/auth/PasswordResetPage';
import { SourceDocumentReviewPage } from './components/assignment/SourceDocumentReviewPage';
import { AssignmentEditorPage } from './components/assignment/AssignmentEditorPage';
import { HandwritingCustomizationPage } from './components/assignment/HandwritingCustomizationPage';
import { PaginatedDocumentPreviewPage } from './components/assignment/PaginatedDocumentPreviewPage';
import { ExportDownloadPage } from './components/assignment/ExportDownloadPage';
import { NotFoundView } from './components/common/NotFoundView';
import { storageService } from './services/storageService';
import { PdfService } from './services/pdfService';
import {
  UserProfile,
  Assignment,
  HandwritingProfile,
  GeneratedDocument,
  StyleSettings,
} from './types';

export default function App() {
  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [previousView, setPreviousView] = useState<string>('landing');

  // User state
  const [user, setUser] = useState<UserProfile | null>(storageService.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showCalibrationSheet, setShowCalibrationSheet] = useState(false);

  // Data lists
  const [assignments, setAssignments] = useState<Assignment[]>(storageService.getAssignments());
  const [handwritingProfiles, setHandwritingProfiles] = useState<HandwritingProfile[]>(
    storageService.getHandwritingProfiles()
  );
  const [exportedDocs, setExportedDocs] = useState<GeneratedDocument[]>(
    storageService.getGeneratedDocuments()
  );

  // Active items for editing
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(assignments[0] || null);
  const [activeProfileToEdit, setActiveProfileToEdit] = useState<HandwritingProfile | null>(null);

  // Synchronize state from storage
  const refreshData = () => {
    setUser(storageService.getCurrentUser());
    setAssignments(storageService.getAssignments());
    setHandwritingProfiles(storageService.getHandwritingProfiles());
    setExportedDocs(storageService.getGeneratedDocuments());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const navigateTo = (view: string) => {
    setPreviousView(currentView);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    refreshData();
    navigateTo('dashboard');
  };

  const handleLogout = async () => {
    await storageService.logout();
    refreshData();
    navigateTo('landing');
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    const updated = storageService.updateUserProfile(updates);
    setUser(updated);
  };

  // Assignment Actions
  const handleStartNewAssignment = () => {
    setActiveAssignment(null);
    navigateTo('new-assignment');
  };

  const handleOpenAssignment = (id: string) => {
    const found = storageService.getAssignment(id);
    if (found) {
      setActiveAssignment(found);
      navigateTo('new-assignment');
    }
  };

  const handleSaveAssignment = (
    assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const saved = storageService.saveAssignment(assignmentData);
    refreshData();
    setActiveAssignment(saved);
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Delete this assignment?')) {
      storageService.deleteAssignment(id);
      refreshData();
      if (activeAssignment?.id === id) {
        setActiveAssignment(null);
      }
    }
  };

  const handleRenameAssignment = (id: string, newTitle: string) => {
    const a = storageService.getAssignment(id);
    if (a) {
      storageService.saveAssignment({ ...a, title: newTitle });
      refreshData();
    }
  };

  const handleExportPdf = (assignment: Assignment) => {
    if (assignment.draftContent && assignment.styleSettings) {
      PdfService.generatePdf(
        assignment.title,
        assignment.draftContent,
        assignment.styleSettings,
        assignment.language
      );
      storageService.saveGeneratedDocument({
        assignmentId: assignment.id,
        title: assignment.title,
        pageCount: assignment.pageCount || 1,
        pagePreviews: [],
      });
      refreshData();
    } else {
      handleOpenAssignment(assignment.id);
    }
  };

  // Handwriting Profile Actions
  const handleStartNewProfile = () => {
    setActiveProfileToEdit(null);
    navigateTo('handwriting-onboarding');
  };

  const handleEditProfile = (profile: HandwritingProfile) => {
    setActiveProfileToEdit(profile);
    navigateTo('handwriting-onboarding');
  };

  const handleSaveProfile = (
    profileData: Omit<HandwritingProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    storageService.saveHandwritingProfile(profileData);
    refreshData();
    navigateTo('my-handwriting');
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Delete this handwriting profile?')) {
      storageService.deleteHandwritingProfile(id);
      refreshData();
    }
  };

  const currentAssignment = activeAssignment || assignments[0];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Universal Top Navigation conforming to Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* Page 1: Public Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user && !user.isDemoUser) {
                navigateTo('dashboard');
              } else {
                handleStartNewAssignment();
              }
            }}
            onExploreDemo={() => navigateTo('how-it-works')}
            onOpenPrivacy={() => navigateTo('privacy')}
            onOpenTerms={() => navigateTo('terms')}
          />
        )}

        {/* Page 2: Standalone Registration Page */}
        {currentView === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigateLogin={() => navigateTo('login')}
          />
        )}

        {/* Page 3: Standalone Login Page */}
        {currentView === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigateRegister={() => navigateTo('register')}
            onNavigateForgotPassword={() => navigateTo('password-reset')}
          />
        )}

        {/* Page 4: Standalone Password Reset Page */}
        {currentView === 'password-reset' && (
          <PasswordResetPage onNavigateLogin={() => navigateTo('login')} />
        )}

        {/* Page 5: Student Dashboard */}
        {currentView === 'dashboard' && user && (
          <DashboardView
            user={user}
            assignments={assignments}
            handwritingProfiles={handwritingProfiles}
            exportedDocs={exportedDocs}
            onNewAssignment={handleStartNewAssignment}
            onOpenAssignment={handleOpenAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onManageHandwriting={() => navigateTo('my-handwriting')}
            onViewProjects={() => navigateTo('projects')}
            onOpenSettings={() => navigateTo('settings')}
            onExportAssignment={handleExportPdf}
            onOpenCharacterStudio={() => navigateTo('character-studio')}
          />
        )}

        {/* Page 6: Handwriting Calibration & Onboarding */}
        {currentView === 'handwriting-onboarding' && (
          <HandwritingOnboarding
            initialProfile={activeProfileToEdit}
            onSaveProfile={handleSaveProfile}
            onCancel={() => navigateTo('my-handwriting')}
          />
        )}

        {/* Page 7: Handwriting Profile Management Page */}
        {currentView === 'my-handwriting' && (
          <HandwritingProfilesList
            profiles={handwritingProfiles}
            onCreateNew={handleStartNewProfile}
            onEditProfile={handleEditProfile}
            onDeleteProfile={handleDeleteProfile}
            onOpenCharacterStudio={() => navigateTo('character-studio')}
          />
        )}

        {/* Character Glyph Studio: Draw Real Handwritten Characters */}
        {currentView === 'character-studio' && (
          <CharacterGlyphStudio
            initialProfile={
              activeProfileToEdit ||
              handwritingProfiles.find(
                (p) => p.styleSettings.fontFamily === 'Custom My Hand' || p.id === 'hp-meri-handwriting'
              ) ||
              handwritingProfiles[0]
            }
            onSaveProfile={(profileData) => {
              handleSaveProfile(profileData);
              navigateTo('dashboard');
            }}
            onBack={() => navigateTo('dashboard')}
          />
        )}

        {/* Page 8: Handwriting Test-Preview Page */}
        {currentView === 'handwriting-test-preview' && (
          <HandwritingTestPreview
            profiles={handwritingProfiles}
            onBack={() => navigateTo('my-handwriting')}
            onOpenCalibration={() => setShowCalibrationSheet(true)}
          />
        )}

        {/* Page 9: New Assignment Wizard */}
        {currentView === 'new-assignment' && (
          <NewAssignmentWizard
            initialAssignment={activeAssignment}
            handwritingProfiles={handwritingProfiles}
            onSaveAssignment={handleSaveAssignment}
            onCancel={() => navigateTo('dashboard')}
          />
        )}

        {/* Page 10: Source Document Review Page */}
        {currentView === 'source-review' && currentAssignment && (
          <SourceDocumentReviewPage
            assignment={currentAssignment}
            onUpdateExtractedText={(text) => {
              handleSaveAssignment({ ...currentAssignment, extractedText: text });
            }}
            onNext={() => navigateTo('assignment-editor')}
            onBack={() => navigateTo('new-assignment')}
          />
        )}

        {/* Page 11: Assignment Editor Page */}
        {currentView === 'assignment-editor' && currentAssignment && (
          <AssignmentEditorPage
            assignment={currentAssignment}
            onUpdateDraft={(draft, updatedStyles) => {
              handleSaveAssignment({
                ...currentAssignment,
                draftContent: draft,
                styleSettings: updatedStyles || currentAssignment.styleSettings,
              });
            }}
            onNext={() => navigateTo('document-preview')}
            onBack={() => navigateTo('source-review')}
          />
        )}

        {/* Page 12: Handwriting Customization Page */}
        {currentView === 'handwriting-customization' && currentAssignment && (
          <HandwritingCustomizationPage
            assignment={currentAssignment}
            profiles={handwritingProfiles}
            onUpdateStyles={(newStyles: StyleSettings) => {
              handleSaveAssignment({ ...currentAssignment, styleSettings: newStyles });
            }}
            onNext={() => navigateTo('document-preview')}
            onBack={() => navigateTo('assignment-editor')}
          />
        )}

        {/* Page 13: Unified Handwriting Page Review and Export in ONE Single Page */}
        {(currentView === 'document-preview' || currentView === 'export-download') && currentAssignment && (
          <PaginatedDocumentPreviewPage
            assignment={currentAssignment}
            onBack={() => navigateTo('assignment-editor')}
            onReturnDashboard={() => navigateTo('dashboard')}
            onEditContent={() => navigateTo('assignment-editor')}
            onEditStyles={() => navigateTo('handwriting-customization')}
            onSaveAssignment={(updated) => handleSaveAssignment(updated)}
          />
        )}

        {/* Page 15: Saved Projects Page */}
        {currentView === 'projects' && (
          <ProjectsList
            assignments={assignments}
            onOpenAssignment={handleOpenAssignment}
            onNewAssignment={handleStartNewAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onRenameAssignment={handleRenameAssignment}
            onExportPdf={handleExportPdf}
          />
        )}

        {/* Page 16: User Settings Page */}
        {currentView === 'settings' && user && (
          <SettingsView user={user} onUpdateUser={handleUpdateUser} />
        )}

        {/* Page 17: Privacy Policy Page */}
        {currentView === 'privacy' && (
          <PrivacyPolicy onBack={() => navigateTo(previousView || 'landing')} />
        )}

        {/* Page 18: Terms and Conditions Page */}
        {currentView === 'terms' && (
          <TermsOfService onBack={() => navigateTo(previousView || 'landing')} />
        )}

        {/* Page 19: Help and FAQ Page */}
        {(currentView === 'faq' ||
          currentView === 'how-it-works' ||
          currentView === 'features' ||
          currentView === 'pricing') && (
          <HelpFaq
            onBack={() => navigateTo('landing')}
            onOpenCalibration={() => setShowCalibrationSheet(true)}
          />
        )}

        {/* Page 20: Useful Not-Found and Error Experience */}
        {currentView === 'not-found' && (
          <NotFoundView
            onNavigateHome={() => navigateTo('landing')}
            onNavigateDashboard={() => navigateTo('dashboard')}
          />
        )}

        {/* Catch-all for any unhandled view */}
        {![
          'landing',
          'register',
          'login',
          'password-reset',
          'dashboard',
          'handwriting-onboarding',
          'my-handwriting',
          'handwriting-test-preview',
          'new-assignment',
          'source-review',
          'assignment-editor',
          'handwriting-customization',
          'document-preview',
          'export-download',
          'projects',
          'settings',
          'privacy',
          'terms',
          'faq',
          'how-it-works',
          'features',
          'pricing',
          'not-found',
        ].includes(currentView) && (
          <NotFoundView
            onNavigateHome={() => navigateTo('landing')}
            onNavigateDashboard={() => navigateTo('dashboard')}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <HandwritingCalibrationSheet
        isOpen={showCalibrationSheet}
        onClose={() => setShowCalibrationSheet(false)}
      />
    </div>
  );
}
