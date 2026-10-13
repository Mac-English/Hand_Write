import { supabase, isSupabaseConfigured } from './supabaseClient';
import { HandwritingProfile, Assignment, GeneratedDocument, UserProfile, UsageRecord, StyleSettings } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'handwrite_current_user',
  HANDWRITING_PROFILES: 'handwrite_profiles',
  ASSIGNMENTS: 'handwrite_assignments',
  GENERATED_DOCS: 'handwrite_docs',
  USAGE_LOGS: 'handwrite_usage_logs',
};

import { generateDefaultGlyphSet } from '../engine/glyphLibrary';

// Default initial styles
export const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  fontFamily: 'Custom My Hand',
  fontSize: 18,
  lineSpacing: 1.8,
  wordSpacing: 2.5,
  letterSpacing: 0.2,
  slantAngle: 0,
  inkColor: '#1e3a8a', // classic fountain pen royal blue
  penType: 'ballpoint', // default realistic pen simulation
  paperStyle: 'ruled',
  pageSize: 'a4',
  strokeWidth: 1.2,
  organicJitter: true,
  showStudentHeader: true,
  studentName: 'Mudasir Ali Channa',
  studentId: '12',
  studentSubject: 'Physics',
  studentDate: '12-10-2025',
  showPageNumber: true,
  marginTop: 40,
  marginBottom: 40,
  marginLeft: 55,
  marginRight: 40,
  customGlyphs: generateDefaultGlyphSet('#1e3a8a'),
};

// Seed default profile for immediate first-use pleasure
const SEED_PROFILES: HandwritingProfile[] = [
  {
    id: 'hp-meri-handwriting',
    profileName: '⭐ Meri Handwriting (My Custom Characters)',
    sampleImages: [],
    styleSettings: {
      ...DEFAULT_STYLE_SETTINGS,
      fontFamily: 'Custom My Hand',
      inkColor: '#1e3a8a',
      lineSpacing: 1.8,
      fontSize: 18,
      customGlyphs: generateDefaultGlyphSet('#1e3a8a'),
    },
    customGlyphs: generateDefaultGlyphSet('#1e3a8a'),
    analysisNotes: {
      clarityScore: 'Personalized Glyphs',
      estimatedSlant: 1,
      detectedInkColor: '#1e3a8a',
      handwritingStyle: 'Personal Captured Characters (A-Z, a-z, 0-9)',
      notes: 'Calibrated with required character strokes (A-Z, a-z, 0-9). Assignments render in your exact handwriting style.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hp-default-1',
    profileName: 'My Notebook Cursive (Blue Ink)',
    sampleImages: [],
    styleSettings: {
      ...DEFAULT_STYLE_SETTINGS,
      fontFamily: 'Caveat',
      inkColor: '#1e3a8a',
      lineSpacing: 1.8,
      fontSize: 18,
    },
    analysisNotes: {
      clarityScore: 'Excellent',
      estimatedSlant: 2,
      detectedInkColor: '#1e3a8a',
      handwritingStyle: 'Casual Cursive',
      notes: 'Calibrated from standard ruled lined notebook sample. Fluid character connection with subtle baseline jitter.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hp-default-2',
    profileName: 'Neat Exam Print (Black Gel Pen)',
    sampleImages: [],
    styleSettings: {
      ...DEFAULT_STYLE_SETTINGS,
      fontFamily: 'Patrick Hand',
      inkColor: '#1e293b',
      lineSpacing: 1.7,
      fontSize: 17,
      slantAngle: 0,
    },
    analysisNotes: {
      clarityScore: 'High',
      estimatedSlant: 0,
      detectedInkColor: '#1e293b',
      handwritingStyle: 'Neat Print',
      notes: 'Optimized for high-density formal assignments and technical exams.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed default assignment
const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-seed-physics',
    title: 'Physics Assignment',
    subject: 'Physics',
    courseName: 'PHYS 101',
    language: 'en',
    instructions: 'Summarize Newton\'s Laws of Motion with clear academic statements and formulas.',
    targetLength: 'medium',
    paperSize: 'a4',
    sourceDocuments: [],
    extractedText: 'Newton\'s laws describe the relationship between a body and the forces acting upon it.',
    draftContent: `Topic: Newton's Laws of Motion

1. First Law:
   An object at rest stays at rest, and an object in motion stays in motion with constant velocity unless acted upon by a net external force.

2. Second Law:
   Force is equal to the rate of change of momentum.
   F = ma

3. Third Law:
   For every action, there is an equal and opposite reaction.`,
    handwritingProfileId: 'hp-meri-handwriting',
    styleSettings: DEFAULT_STYLE_SETTINGS,
    status: 'rendered',
    pageCount: 2,
    createdAt: '2025-10-12T09:41:00.000Z',
    updatedAt: '2025-10-12T09:41:00.000Z',
  },
  {
    id: 'asg-seed-english',
    title: 'English Essay',
    subject: 'English',
    courseName: 'ENG 201',
    language: 'en',
    instructions: 'Analyze the impact of digital technology on modern learning and academic research.',
    targetLength: 'medium',
    paperSize: 'a4',
    sourceDocuments: [],
    extractedText: 'Technology in education: benefits, challenges, and future outlook.',
    draftContent: `Topic: The Impact of Technology on Education

Introduction:
Technology has fundamentally transformed modern education by creating accessible, flexible, and interactive learning environments for students globally.

Key Advantages:
1. Universal Knowledge Access:
   Online research repositories and digital libraries allow students to explore primary scientific sources instantly.
2. Personalized Learning Cadence:
   Adaptive learning platforms cater to individual student speeds, reinforcing foundational skills.

Conclusion:
Technology empowers curious minds to learn collaboratively while preparing for future innovation.`,
    handwritingProfileId: 'hp-meri-handwriting',
    styleSettings: DEFAULT_STYLE_SETTINGS,
    status: 'rendered',
    pageCount: 3,
    createdAt: '2025-10-10T09:41:00.000Z',
    updatedAt: '2025-10-10T09:41:00.000Z',
  },
  {
    id: 'asg-seed-biology',
    title: 'Biology Notes',
    subject: 'Biology',
    courseName: 'BIO 105',
    language: 'en',
    instructions: 'Comprehensive study notes on Cellular Respiration and Photosynthesis pathways.',
    targetLength: 'long',
    paperSize: 'a4',
    sourceDocuments: [],
    extractedText: 'Cellular respiration converts glucose into ATP. Photosynthesis produces glucose using sunlight.',
    draftContent: `Topic: Cellular Respiration and Photosynthesis

1. Cellular Respiration:
   The metabolic pathway through which cells break down glucose to produce ATP energy:
   C6H12O6 + 6O2 -> 6CO2 + 6H2O + 38 ATP

   Key Stages:
   - Glycolysis (Cytoplasm)
   - Krebs Citric Acid Cycle (Mitochondrial Matrix)
   - Electron Transport Chain (Inner Membrane)

2. Photosynthesis:
   Light-dependent and Calvin cycle reactions converting solar radiation into chemical bonds.`,
    handwritingProfileId: 'hp-meri-handwriting',
    styleSettings: DEFAULT_STYLE_SETTINGS,
    status: 'rendered',
    pageCount: 5,
    createdAt: '2025-10-08T09:41:00.000Z',
    updatedAt: '2025-10-08T09:41:00.000Z',
  },
];

// Universal local storage handler (works in Browser and Node.js testing)
const memoryStore: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      delete memoryStore[key];
    }
  },
  clear: (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    } else {
      Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    }
  },
};

class StorageService {
  private user: UserProfile | null = null;

  constructor() {
    this.initUser();
    this.ensureSeedData();
  }

  private initUser() {
    const stored = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        this.user = JSON.parse(stored);
      } catch {
        this.user = null;
      }
    }

    if (!this.user || this.user.email === 'alex.morgan@university.edu') {
      this.user = {
        id: 'usr_mudasir',
        email: 'mudasiralichanna214@gmail.com',
        displayName: 'Mudasir',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        isDemoUser: false,
      };
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.user));
    }
  }

  private ensureSeedData() {
    if (!safeStorage.getItem(STORAGE_KEYS.HANDWRITING_PROFILES)) {
      safeStorage.setItem(STORAGE_KEYS.HANDWRITING_PROFILES, JSON.stringify(SEED_PROFILES));
    }
    const storedAsg = safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (!storedAsg || !storedAsg.includes('asg-seed-physics')) {
      safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(SEED_ASSIGNMENTS));
    }
  }

  // User management
  public getCurrentUser(): UserProfile | null {
    return this.user;
  }

  public async register(email: string, displayName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'secure-default-password-123!',
          options: { data: { display_name: displayName } },
        });
        if (error) console.warn('Supabase auth notice:', error.message);
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            displayName,
            preferredLanguage: 'en',
            createdAt: new Date().toISOString(),
            isDemoUser: false,
          };
          this.user = newUser;
          safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
          this.logUsage('user_registered', `User registered: ${email}`);
          return newUser;
        }
      } catch (err) {
        console.warn('Falling back to local account registration:', err);
      }
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      displayName,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      isDemoUser: false,
    };
    this.user = newUser;
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    this.logUsage('user_registered', `User registered: ${email}`);
    return newUser;
  }

  public async login(email: string): Promise<UserProfile> {
    const existing = this.getCurrentUser();
    const user: UserProfile = {
      id: existing ? existing.id : `usr_${Date.now()}`,
      email,
      displayName: email.split('@')[0].replace(/[._]/g, ' '),
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      isDemoUser: false,
    };
    this.user = user;
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.logUsage('user_logged_in', `User logged in: ${email}`);
    return user;
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    this.user = {
      id: 'usr_guest',
      email: 'guest@handwrite.ai',
      displayName: 'Guest Student',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
    };
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.user));
    this.logUsage('user_logged_out', 'User logged out');
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    if (!this.user) throw new Error('No active user');
    this.user = { ...this.user, ...updates };
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.user));
    return this.user;
  }

  // Handwriting Profiles
  public getHandwritingProfiles(): HandwritingProfile[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.HANDWRITING_PROFILES);
      if (data) {
        const list: HandwritingProfile[] = JSON.parse(data);
        const hasMeriHandwriting = list.some(
          (p) => p.id === 'hp-meri-handwriting' || p.styleSettings.fontFamily === 'Custom My Hand'
        );
        if (!hasMeriHandwriting && SEED_PROFILES[0]) {
          list.unshift(SEED_PROFILES[0]);
          safeStorage.setItem(STORAGE_KEYS.HANDWRITING_PROFILES, JSON.stringify(list));
        }
        return list;
      }
      return SEED_PROFILES;
    } catch {
      return SEED_PROFILES;
    }
  }

  public getHandwritingProfile(id: string): HandwritingProfile | undefined {
    return this.getHandwritingProfiles().find((p) => p.id === id);
  }

  public saveHandwritingProfile(profile: Omit<HandwritingProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): HandwritingProfile {
    const list = this.getHandwritingProfiles();
    const now = new Date().toISOString();

    if (profile.id) {
      const index = list.findIndex((p) => p.id === profile.id);
      if (index >= 0) {
        const updated: HandwritingProfile = {
          ...list[index],
          ...profile,
          updatedAt: now,
        };
        list[index] = updated;
        safeStorage.setItem(STORAGE_KEYS.HANDWRITING_PROFILES, JSON.stringify(list));
        this.logUsage('profile_updated', `Profile updated: ${updated.profileName}`);
        return updated;
      }
    }

    const created: HandwritingProfile = {
      ...profile,
      id: `hp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(created);
    safeStorage.setItem(STORAGE_KEYS.HANDWRITING_PROFILES, JSON.stringify(list));
    this.logUsage('profile_created', `Profile created: ${created.profileName}`);
    return created;
  }

  public deleteHandwritingProfile(id: string): void {
    const list = this.getHandwritingProfiles().filter((p) => p.id !== id);
    safeStorage.setItem(STORAGE_KEYS.HANDWRITING_PROFILES, JSON.stringify(list));
    this.logUsage('profile_deleted', `Profile deleted: ${id}`);
  }

  // Assignments
  public getAssignments(): Assignment[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_ASSIGNMENTS;
    }
  }

  public getAssignment(id: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.id === id);
  }

  public saveAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Assignment {
    const list = this.getAssignments();
    const now = new Date().toISOString();

    if (assignment.id) {
      const index = list.findIndex((a) => a.id === assignment.id);
      if (index >= 0) {
        const updated: Assignment = {
          ...list[index],
          ...assignment,
          updatedAt: now,
        };
        list[index] = updated;
        safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
        this.logUsage('assignment_updated', `Assignment updated: ${updated.title}`);
        return updated;
      }
    }

    const created: Assignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(created);
    safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    this.logUsage('assignment_created', `Assignment created: ${created.title}`);
    return created;
  }

  public deleteAssignment(id: string): void {
    const list = this.getAssignments().filter((a) => a.id !== id);
    safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    this.logUsage('assignment_deleted', `Assignment deleted: ${id}`);
  }

  // Generated Documents
  public getGeneratedDocuments(): GeneratedDocument[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.GENERATED_DOCS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveGeneratedDocument(doc: Omit<GeneratedDocument, 'id' | 'createdAt'>): GeneratedDocument {
    const list = this.getGeneratedDocuments();
    const created: GeneratedDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(created);
    safeStorage.setItem(STORAGE_KEYS.GENERATED_DOCS, JSON.stringify(list));
    this.logUsage('document_exported', `Document exported: ${created.title} (${created.pageCount} pages)`);
    return created;
  }

  public deleteGeneratedDocument(id: string): void {
    const list = this.getGeneratedDocuments().filter((d) => d.id !== id);
    safeStorage.setItem(STORAGE_KEYS.GENERATED_DOCS, JSON.stringify(list));
  }

  // Usage Audit Records
  public getUsageLogs(): UsageRecord[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.USAGE_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logUsage(operationType: string, details: string): void {
    const list = this.getUsageLogs();
    const record: UsageRecord = {
      id: `log-${Date.now()}`,
      operationType,
      details,
      timestamp: new Date().toISOString(),
    };
    list.unshift(record);
    if (list.length > 50) list.pop();
    safeStorage.setItem(STORAGE_KEYS.USAGE_LOGS, JSON.stringify(list));
  }
}

export const storageService = new StorageService();
