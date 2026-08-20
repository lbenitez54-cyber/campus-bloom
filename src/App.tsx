import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, StudentProfile, Subject, ClassScheduleItem, Exam, BackgroundTheme, AuthUser, ThemeId } from './types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_SUBJECTS,
  INITIAL_SCHEDULE,
  INITIAL_EXAMS,
  BACKGROUND_THEMES,
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { ScheduleView } from './components/views/ScheduleView';
import { AttendanceView } from './components/views/AttendanceView';
import { ExamsView } from './components/views/ExamsView';
import { ResearchJuniorView } from './components/views/ResearchJuniorView';
import { ProfileView } from './components/views/ProfileView';
import { AuthView } from './components/views/AuthView';
import { ChangeBackgroundModal } from './components/modals/ChangeBackgroundModal';
import { PdfScheduleModal } from './components/modals/PdfScheduleModal';
import { SubjectDetailModal } from './components/modals/SubjectDetailModal';
import { SakuraPetals } from './components/effects/SakuraPetals';

const DEFAULT_AUTH_USER: AuthUser = {
  id: 'demo-liz',
  name: 'Liz Benítez',
  email: 'lbenitez54@fcmunca.edu.py',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813624-9b5961e6878c?auto=format&fit=crop&q=80&w=400',
  career: 'Medicina • 5to Año',
  university: 'Facultad de Ciencias Médicas - UNCA',
  createdAt: '2026-01-15',
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('campusbloom_current_user');
      return saved ? JSON.parse(saved) : DEFAULT_AUTH_USER;
    } catch {
      return DEFAULT_AUTH_USER;
    }
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('resumen');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Normalized key helper for current user
  const userKey = currentUser
    ? currentUser.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
    : 'default';

  // Helper to load user profile
  const loadUserProfile = useCallback((emailKey: string, user?: AuthUser | null): StudentProfile => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_profile`);
      if (saved) return JSON.parse(saved);
      // Legacy fallback
      const legacy = localStorage.getItem('campusbloom_profile');
      if (legacy && emailKey === 'lbenitez54_fcmunca_edu_py') return JSON.parse(legacy);

      if (user) {
        return {
          ...INITIAL_STUDENT_PROFILE,
          name: user.name || INITIAL_STUDENT_PROFILE.name,
          email: user.email || INITIAL_STUDENT_PROFILE.email,
          avatarUrl: user.avatarUrl || INITIAL_STUDENT_PROFILE.avatarUrl,
          career: user.career || INITIAL_STUDENT_PROFILE.career,
          university: user.university || INITIAL_STUDENT_PROFILE.university,
        };
      }
      return INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  }, []);

  // Helper to load user subjects
  const loadUserSubjects = useCallback((emailKey: string): Subject[] => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_subjects`);
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('campusbloom_subjects');
      if (legacy && emailKey === 'lbenitez54_fcmunca_edu_py') return JSON.parse(legacy);
      return INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  }, []);

  // Helper to load user schedule
  const loadUserSchedule = useCallback((emailKey: string): ClassScheduleItem[] => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_schedule`);
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('campusbloom_schedule');
      if (legacy && emailKey === 'lbenitez54_fcmunca_edu_py') return JSON.parse(legacy);
      return INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  }, []);

  // Helper to load user exams
  const loadUserExams = useCallback((emailKey: string): Exam[] => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_exams`);
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('campusbloom_exams');
      if (legacy && emailKey === 'lbenitez54_fcmunca_edu_py') return JSON.parse(legacy);
      return INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  }, []);

  // Helper to load user background
  const loadUserBg = useCallback((emailKey: string): BackgroundTheme => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_bg`);
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('campusbloom_bg');
      if (legacy && emailKey === 'lbenitez54_fcmunca_edu_py') return JSON.parse(legacy);
      return BACKGROUND_THEMES[0];
    } catch {
      return BACKGROUND_THEMES[0];
    }
  }, []);

  // Helper to load show research tab setting
  const loadUserShowResearch = useCallback((emailKey: string): boolean => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_show_research_tab`);
      if (saved !== null) return saved === 'true';
      const legacy = localStorage.getItem('campusbloom_show_research_tab');
      if (legacy !== null && emailKey === 'lbenitez54_fcmunca_edu_py') return legacy === 'true';
      return true;
    } catch {
      return true;
    }
  }, []);

  // Helper to load user theme
  const loadUserTheme = useCallback((emailKey: string): ThemeId => {
    try {
      const saved = localStorage.getItem(`campusbloom_${emailKey}_theme_id`) as ThemeId | null;
      if (saved && (saved === 'sakura-matcha' || saved === 'bosque-nocturno' || saved === 'azul-pizarra' || saved === 'grafito-monocromo')) {
        return saved;
      }
      const legacy = localStorage.getItem('campusbloom_theme_id') as ThemeId | null;
      if (legacy && (legacy === 'sakura-matcha' || legacy === 'bosque-nocturno' || legacy === 'azul-pizarra' || legacy === 'grafito-monocromo')) {
        return legacy;
      }
      return 'sakura-matcha';
    } catch {
      return 'sakura-matcha';
    }
  }, []);

  // App Data with local persistence per user
  const [profile, setProfile] = useState<StudentProfile>(() => loadUserProfile(userKey, currentUser));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadUserSubjects(userKey));
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>(() => loadUserSchedule(userKey));
  const [exams, setExams] = useState<Exam[]>(() => loadUserExams(userKey));
  const [currentBg, setCurrentBg] = useState<BackgroundTheme>(() => loadUserBg(userKey));
  const [showResearchTab, setShowResearchTab] = useState<boolean>(() => loadUserShowResearch(userKey));
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => loadUserTheme(userKey));

  const [customOverlay, setCustomOverlay] = useState<number>(0.18);
  const [isPetalsActive, setIsPetalsActive] = useState<boolean>(true);

  // Modals state
  const [isBgModalOpen, setIsBgModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Sync state whenever userKey changes
  useEffect(() => {
    if (currentUser) {
      setProfile(loadUserProfile(userKey, currentUser));
      setSubjects(loadUserSubjects(userKey));
      setSchedule(loadUserSchedule(userKey));
      setExams(loadUserExams(userKey));
      setCurrentBg(loadUserBg(userKey));
      setShowResearchTab(loadUserShowResearch(userKey));
      setActiveThemeId(loadUserTheme(userKey));
    }
  }, [userKey, currentUser, loadUserProfile, loadUserSubjects, loadUserSchedule, loadUserExams, loadUserBg, loadUserShowResearch, loadUserTheme]);

  // Set global HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeThemeId);
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_theme_id`, activeThemeId);
    }
  }, [activeThemeId, userKey, currentUser]);

  // Persistence effects for current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusbloom_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campusbloom_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_profile`, JSON.stringify(profile));
    }
  }, [profile, userKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_subjects`, JSON.stringify(subjects));
    }
  }, [subjects, userKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_schedule`, JSON.stringify(schedule));
    }
  }, [schedule, userKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_exams`, JSON.stringify(exams));
    }
  }, [exams, userKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_bg`, JSON.stringify(currentBg));
    }
  }, [currentBg, userKey, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campusbloom_${userKey}_show_research_tab`, String(showResearchTab));
    }
  }, [showResearchTab, userKey, currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setActiveTab('resumen');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('campusbloom_current_user');
    setActiveTab('resumen');
  };

  // Handlers
  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    // Recalculate GPA
    const totalGrades = subjects.reduce((sum, s) => sum + (s.id === updated.id ? updated.grade : s.grade), 0);
    const avg = parseFloat((totalGrades / subjects.length).toFixed(1));
    setProfile((p) => ({ ...p, gpa: avg }));
  };

  const handleUpdateAttendance = (subjectId: string, deltaAttended: number, deltaTotal: number) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            attendedClasses: Math.max(0, s.attendedClasses + deltaAttended),
            totalClasses: Math.max(1, s.totalClasses + deltaTotal),
          };
        }
        return s;
      })
    );

    setProfile((prev) => ({
      ...prev,
      attendedClasses: Math.max(0, prev.attendedClasses + deltaAttended),
      totalClasses: Math.max(1, prev.totalClasses + deltaTotal),
    }));
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: newProfile.name,
        avatarUrl: newProfile.avatarUrl,
        career: newProfile.career,
        university: newProfile.university,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('campusbloom_current_user', JSON.stringify(updatedUser));
    }
  };

  const handleAddClass = (newItem: ClassScheduleItem) => {
    setSchedule((prev) => [...prev, newItem]);
  };

  const handleImportSchedule = (items: ClassScheduleItem[]) => {
    setSchedule((prev) => [...items, ...prev]);
  };

  const handleAddExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const handleResetDefaults = () => {
    const defaultProf = currentUser
      ? {
          ...INITIAL_STUDENT_PROFILE,
          name: currentUser.name,
          email: currentUser.email,
          career: currentUser.career || INITIAL_STUDENT_PROFILE.career,
          university: currentUser.university || INITIAL_STUDENT_PROFILE.university,
        }
      : INITIAL_STUDENT_PROFILE;

    setProfile(defaultProf);
    setSubjects(INITIAL_SUBJECTS);
    setSchedule(INITIAL_SCHEDULE);
    setExams(INITIAL_EXAMS);
    setCurrentBg(BACKGROUND_THEMES[0]);
    setShowResearchTab(true);

    if (currentUser) {
      localStorage.removeItem(`campusbloom_${userKey}_profile`);
      localStorage.removeItem(`campusbloom_${userKey}_subjects`);
      localStorage.removeItem(`campusbloom_${userKey}_schedule`);
      localStorage.removeItem(`campusbloom_${userKey}_exams`);
      localStorage.removeItem(`campusbloom_${userKey}_bg`);
      localStorage.removeItem(`campusbloom_${userKey}_show_research_tab`);
      localStorage.removeItem(`campusbloom_${userKey}_cloud_drive_url`);
      localStorage.removeItem(`campusbloom_${userKey}_cloud_portal_url`);
      localStorage.removeItem(`campusbloom_${userKey}_spotify_playlist_url`);
      localStorage.removeItem(`campusbloom_${userKey}_research_target_hours`);
      localStorage.removeItem(`campusbloom_${userKey}_research_junior_logs`);
      localStorage.removeItem(`campusbloom_${userKey}_research_junior_projects`);
      localStorage.removeItem(`campusbloom_${userKey}_research_drive_config`);
      localStorage.removeItem(`campusbloom_${userKey}_research_timer`);
    }
  };

  return (
    <div
      id="campusbloom-root-container"
      data-theme={activeThemeId}
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden text-[#1b1c1c] selection:bg-[#ffb7c5] selection:text-[#514345]"
    >
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none z-0"
        style={{
          backgroundImage: `url("${currentBg.url}")`,
          transform: 'scale(1.02)',
        }}
      />

      {/* Atmospheric Soft Gradient / Frosted Blur Tint Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          backgroundColor: currentBg.isDark
            ? `rgba(20, 15, 18, ${customOverlay + 0.15})`
            : `rgba(253, 245, 246, ${customOverlay})`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Floating Sakura Petals Canvas Effect */}
      <SakuraPetals isActive={isPetalsActive} themeId={activeThemeId} />

      {/* If user is not authenticated, display botanical AuthView */}
      {!currentUser ? (
        <AuthView onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* App Content Layer for Logged-In User */
        <div className="relative z-20 flex flex-col min-h-screen">
          {/* Top Header */}
          <Header
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isPetalsActive={isPetalsActive}
            setIsPetalsActive={setIsPetalsActive}
            onOpenBackgroundModal={() => setIsBgModalOpen(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateToProfile={() => setActiveTab('perfil')}
          />

          {/* Main Content Layout with Left Sidebar + View Container */}
          <div className="flex-1 flex flex-col md:flex-row items-center md:items-start justify-center gap-4 sm:gap-6 px-3 sm:px-6 lg:px-8 py-2 md:py-6">
            {/* Vertical Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              showResearchTab={showResearchTab}
            />

            {/* Active Screen View */}
            <main className="flex-1 w-full max-w-7xl mx-auto pb-12 md:pb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12, scale: 0.992 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.992 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full"
                >
                  {activeTab === 'resumen' && (
                    <OverviewView
                      profile={profile}
                      subjects={subjects}
                      onOpenBackgroundModal={() => setIsBgModalOpen(true)}
                      onOpenPdfModal={() => setIsPdfModalOpen(true)}
                      onSelectSubject={(s) => setSelectedSubject(s)}
                      onNavigateToAttendance={() => setActiveTab('asistencia')}
                      onNavigateToExams={() => setActiveTab('examenes')}
                      onNavigateToResearch={() => setActiveTab('investigacion')}
                    />
                  )}

                  {activeTab === 'cronograma' && (
                    <ScheduleView
                      schedule={schedule}
                      subjects={subjects}
                      onOpenPdfModal={() => setIsPdfModalOpen(true)}
                      onAddClass={handleAddClass}
                    />
                  )}

                  {activeTab === 'asistencia' && (
                    <AttendanceView
                      profile={profile}
                      subjects={subjects}
                      onUpdateAttendance={handleUpdateAttendance}
                    />
                  )}

                  {activeTab === 'examenes' && (
                    <ExamsView
                      exams={exams}
                      subjects={subjects}
                      onAddExam={handleAddExam}
                    />
                  )}

                  {activeTab === 'investigacion' && (
                    <ResearchJuniorView userEmail={currentUser.email} />
                  )}

                  {activeTab === 'perfil' && (
                    <ProfileView
                      currentUser={currentUser}
                      profile={profile}
                      currentBg={currentBg}
                      activeThemeId={activeThemeId}
                      showResearchTab={showResearchTab}
                      onToggleResearchTab={(val) => {
                        setShowResearchTab(val);
                        if (!val && activeTab === 'investigacion') {
                          setActiveTab('resumen');
                        }
                      }}
                      onUpdateProfile={handleUpdateProfile}
                      onSelectBackground={setCurrentBg}
                      onSelectThemeId={(id) => setActiveThemeId(id)}
                      onResetDefaults={handleResetDefaults}
                      onLogout={handleLogout}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangeBackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        currentBg={currentBg}
        onSelectBackground={setCurrentBg}
        customOverlay={customOverlay}
        setCustomOverlay={setCustomOverlay}
      />

      <PdfScheduleModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onImportSchedule={handleImportSchedule}
      />

      <SubjectDetailModal
        subject={selectedSubject}
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        onUpdateSubject={handleUpdateSubject}
      />
    </div>
  );
}
