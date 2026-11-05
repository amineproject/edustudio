import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { QuickDocModal } from './components/QuickDocModal';
import { DocumentEditorModal } from './components/DocumentEditorModal';
import { RiwayatDokumenView } from './components/RiwayatDokumenView';
import { BankCPView } from './components/BankCPView';
import { TemplatePanduanView } from './components/TemplatePanduanView';
import { PengaturanView } from './components/PengaturanView';
import { BskapModal } from './components/BskapModal';
import { BantuanModal } from './components/BantuanModal';
import { CurriculumExpertModal } from './components/CurriculumExpertModal';
import { DeepLearningModulModal } from './components/DeepLearningModulModal';
import { AssessmentEvaluasiModal } from './components/AssessmentEvaluasiModal';
import { CurriculumChatbot } from './components/CurriculumChatbot';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { INITIAL_DOCUMENTS, INITIAL_TEACHER_PROFILE } from './data/kurikulumData';
import { RecentDocument, TeacherProfile } from './types';
import { User } from '@supabase/supabase-js';
import { AuthModal } from './components/AuthModal';
import {
  saveDocumentToSupabase,
  deleteDocumentFromSupabase,
  saveProfileToSupabase,
  syncAllDataAcrossDevices,
  getCurrentUser,
  onAuthStateChanged,
  subscribeToRealtimeChanges,
} from './lib/supabase';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Subject State
  const [activeSubject, setActiveSubject] = useState<string>('Bahasa Indonesia');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent Documents & Profile State
  const [documents, setDocuments] = useState<RecentDocument[]>(() => {
    const saved = localStorage.getItem('edumerdeka_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [profile, setProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('edumerdeka_profile');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_PROFILE;
  });

  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [syncStatusText, setSyncStatusText] = useState<string>('');

  // Authentication & Modal State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('edumerdeka_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('edumerdeka_profile', JSON.stringify(profile));
  }, [profile]);

  // Automated Multi-Device Sync on App Mount & Realtime updates
  // When opened on mobile or another device, automatically load shared profile & documents!
  const runCloudSync = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncingCloud(true);
    try {
      const result = await syncAllDataAcrossDevices(documents, profile);
      if (result && Array.isArray(result.syncedDocs)) {
        setDocuments(result.syncedDocs);
      }
      if (result && result.syncedProfile && result.syncedProfile.name) {
        setProfile(result.syncedProfile);
      }
      if (!isSilent) {
        if (result.source === 'supabase') {
          setSyncStatusText('Data tersinkron dari Cloud Supabase.');
        } else if (result.source === 'server') {
          setSyncStatusText('Data tersinkron antar-perangkat.');
        }
        setTimeout(() => setSyncStatusText(''), 3000);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
    } finally {
      if (!isSilent) setIsSyncingCloud(false);
    }
  }, [documents, profile]);

  // Initial Sync on load
  useEffect(() => {
    runCloudSync(false);
  }, []);

  // Supabase Auth state listener
  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
    });

    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        // Trigger fresh sync on login
        runCloudSync(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [runCloudSync]);

  // Supabase Realtime multi-device subscription (Cross-Device Live Sync)
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChanges((table, eventType) => {
      console.log(`[Realtime Sync] Perubahan pada tabel ${table} (${eventType}) terdeteksi dari perangkat lain.`);
      runCloudSync(true);
    });

    return () => {
      unsubscribe();
    };
  }, [runCloudSync]);

  // Modal States
  const [isQuickDocOpen, setIsQuickDocOpen] = useState<boolean>(false);
  const [quickDocConfig, setQuickDocConfig] = useState<{
    initialDocType?: string;
    initialSubject?: string;
  }>({});

  const [isDocEditorOpen, setIsDocEditorOpen] = useState<boolean>(false);
  const [activeDoc, setActiveDoc] = useState<RecentDocument | null>(null);

  const [isBskapModalOpen, setIsBskapModalOpen] = useState<boolean>(false);
  const [isBantuanModalOpen, setIsBantuanModalOpen] = useState<boolean>(false);

  // Curriculum Expert Generator State (CP, TP & ATP)
  const [isCurriculumExpertOpen, setIsCurriculumExpertOpen] = useState<boolean>(false);
  const [curriculumExpertConfig, setCurriculumExpertConfig] = useState<{
    subject?: string;
    focus?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow';
  }>({});

  const handleOpenCurriculumExpert = (
    subject?: string,
    focus?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow'
  ) => {
    setCurriculumExpertConfig({
      subject: subject || activeSubject,
      focus: focus || 'all',
    });
    setIsCurriculumExpertOpen(true);
  };

  // Deep Learning Modul Ajar Generator State (8-3-3-4 Framework)
  const [isDeepLearningOpen, setIsDeepLearningOpen] = useState<boolean>(false);
  const [deepLearningConfig, setDeepLearningConfig] = useState<{
    subject?: string;
    tp?: string;
  }>({});

  const handleOpenDeepLearning = (subject?: string, tp?: string) => {
    setDeepLearningConfig({
      subject: subject || activeSubject,
      tp: tp || '',
    });
    setIsDeepLearningOpen(true);
  };

  // Assessment & Evaluation Generator State (Modul 3: KKTP & HOTS)
  const [isAssessmentOpen, setIsAssessmentOpen] = useState<boolean>(false);
  const [assessmentConfig, setAssessmentConfig] = useState<{
    subject?: string;
    tp?: string;
    topic?: string;
  }>({});

  const handleOpenAssessment = (subject?: string, tp?: string, topic?: string) => {
    setAssessmentConfig({
      subject: subject || activeSubject,
      tp: tp || '',
      topic: topic || '',
    });
    setIsAssessmentOpen(true);
  };

  // AI Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Supabase SQL Schema Modal State
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);

  // Open Quick Doc Modal handler
  const handleOpenQuickDocModal = (initialDocType?: string, initialSubject?: string) => {
    setQuickDocConfig({
      initialDocType: initialDocType || 'Modul Ajar / RPP+',
      initialSubject: initialSubject || activeSubject,
    });
    setIsQuickDocOpen(true);
  };

  // Generate Document Handler
  const handleGenerateDocument = async (config: {
    faseClass: string;
    subject: string;
    docType: string;
    selectedCps: string[];
    useP3: boolean;
    useDifferentiated: boolean;
  }) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: RecentDocument = {
      id: newDocId,
      title: `${config.docType} ${config.subject} - Skenario Kurikulum Merdeka`,
      subTitle: `${config.faseClass} • Berbasis Capaian BSKAP 2024`,
      subject: config.subject,
      fase: config.faseClass,
      status: 'Siap Cetak / PDF',
      lastModified: 'Baru saja dibuat',
      type: (config.docType.includes('Modul Ajar')
        ? 'Modul Ajar'
        : config.docType.includes('LKPD')
        ? 'LKPD'
        : config.docType.includes('ATP')
        ? 'ATP'
        : 'Asesmen') as RecentDocument['type'],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsQuickDocOpen(false);
    setActiveDoc(newDoc);
    setIsDocEditorOpen(true);

    // Persist immediately to cloud & server
    setIsSyncingCloud(true);
    setSyncStatusText('Menyimpan ke Cloud Supabase...');
    const res = await saveDocumentToSupabase(newDoc, profile);
    setIsSyncingCloud(false);
    if (res.success) {
      setSyncStatusText('Tersimpan di Cloud Supabase!');
      setTimeout(() => setSyncStatusText(''), 3000);
    } else {
      setSyncStatusText(`Perhatian simpan cloud: ${res.message}`);
      setTimeout(() => setSyncStatusText(''), 4000);
    }
  };

  // Save Document changes (handles both existing document updates and new document insertions)
  const handleSaveDocument = async (updatedDoc: RecentDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === updatedDoc.id);
      return exists
        ? prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
        : [updatedDoc, ...prev];
    });
    setActiveDoc(updatedDoc);

    // Persist immediately to cloud & server
    setIsSyncingCloud(true);
    setSyncStatusText('Menyimpan ke Cloud Supabase...');
    const res = await saveDocumentToSupabase(updatedDoc, profile);
    setIsSyncingCloud(false);
    if (res.success) {
      setSyncStatusText('Tersimpan di Cloud Supabase!');
      setTimeout(() => setSyncStatusText(''), 3000);
    } else {
      setSyncStatusText(`Gagal simpan cloud: ${res.message}`);
      setTimeout(() => setSyncStatusText(''), 4000);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus arsip dokumen ini?')) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      // Delete immediately from cloud & server
      setIsSyncingCloud(true);
      setSyncStatusText('Menghapus dari Cloud Supabase...');
      const res = await deleteDocumentFromSupabase(id);
      setIsSyncingCloud(false);
      if (res.success) {
        setSyncStatusText('Berhasil dihapus dari cloud!');
        setTimeout(() => setSyncStatusText(''), 3000);
      } else {
        setSyncStatusText(`Gagal hapus cloud: ${res.message}`);
        setTimeout(() => setSyncStatusText(''), 4000);
      }
    }
  };

  const handleUpdateProfile = async (newProfile: TeacherProfile) => {
    setProfile(newProfile);
    setIsSyncingCloud(true);
    setSyncStatusText('Menyimpan profil ke Cloud Supabase...');
    const res = await saveProfileToSupabase(newProfile);
    setIsSyncingCloud(false);
    if (res.success) {
      setSyncStatusText('Profil tersimpan di Cloud Supabase!');
      setTimeout(() => setSyncStatusText(''), 3000);
    } else {
      setSyncStatusText(`Gagal simpan profil: ${res.message}`);
      setTimeout(() => setSyncStatusText(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-['Inter']">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenHelp={() => setIsBantuanModalOpen(true)}
        academicYear={profile.academicYear}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          profile={profile}
          onOpenProfile={() => setCurrentTab('pengaturan')}
          onOpenChatbot={() => setIsChatbotOpen(true)}
          isSyncing={isSyncingCloud}
          onManualSync={() => runCloudSync(false)}
          syncStatusText={syncStatusText}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="w-full pt-16 sm:pt-20 bg-[#f8f9ff] flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              activeSubject={activeSubject}
              onSubjectChange={setActiveSubject}
              onOpenQuickDocModal={handleOpenQuickDocModal}
              onOpenCurriculumExpert={handleOpenCurriculumExpert}
              onOpenDeepLearningModul={handleOpenDeepLearning}
              onOpenAssessmentModal={handleOpenAssessment}
              onOpenChatbot={() => setIsChatbotOpen(true)}
              onOpenDocumentEditor={(doc) => {
                setActiveDoc(doc);
                setIsDocEditorOpen(true);
              }}
              onOpenBskapGuide={() => setIsBskapModalOpen(true)}
              onViewAllHistory={() => setCurrentTab('riwayat-dokumen')}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'riwayat-dokumen' && (
            <RiwayatDokumenView
              documents={documents}
              onOpenDocument={(doc) => {
                setActiveDoc(doc);
                setIsDocEditorOpen(true);
              }}
              onDeleteDocument={handleDeleteDocument}
              onNewDocument={() => handleOpenQuickDocModal()}
              onOpenCurriculumExpert={() => handleOpenCurriculumExpert(activeSubject, 'all')}
              onOpenAssessmentModal={() => handleOpenAssessment(activeSubject)}
            />
          )}

          {currentTab === 'bank-cp' && (
            <BankCPView
              onSelectCpForGenerator={(subj) => {
                handleOpenQuickDocModal('Modul Ajar / RPP+', subj);
              }}
              onOpenCurriculumExpert={(subj, focus) => {
                handleOpenCurriculumExpert(subj, focus);
              }}
            />
          )}

          {currentTab === 'template-panduan' && (
            <TemplatePanduanView
              onUseTemplate={(name) => {
                handleOpenQuickDocModal(name, activeSubject);
              }}
            />
          )}

          {currentTab === 'pengaturan' && (
            <PengaturanView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              documents={documents}
              onOpenSqlModal={() => setIsSqlModalOpen(true)}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Chat Trigger Button - Mobile Optimized */}
      <div className="fixed bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white font-bold text-xs shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-blue-400/30"
          type="button"
          title="Tanya Pakar Kurikulum AI"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">psychology</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#00236f] animate-pulse"></span>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] tracking-wide hidden sm:inline">
            Tanya Pakar Deep Learning AI
          </span>
          <span className="font-['Plus_Jakarta_Sans'] tracking-wide sm:hidden text-[11px]">
            Tanya AI
          </span>
        </button>
      </div>

      {/* Modals */}
      <CurriculumExpertModal
        isOpen={isCurriculumExpertOpen}
        onClose={() => setIsCurriculumExpertOpen(false)}
        onSaveToDocuments={handleSaveDocument}
        onProceedToModulAjar={handleOpenDeepLearning}
        initialSubject={curriculumExpertConfig.subject || activeSubject}
        initialFocus={curriculumExpertConfig.focus || 'all'}
      />

      <DeepLearningModulModal
        isOpen={isDeepLearningOpen}
        onClose={() => setIsDeepLearningOpen(false)}
        onSaveDocument={handleSaveDocument}
        onProceedToAssessment={handleOpenAssessment}
        profile={profile}
        initialSubject={deepLearningConfig.subject || activeSubject}
        initialTp={deepLearningConfig.tp || ''}
      />

      <AssessmentEvaluasiModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onSaveDocument={handleSaveDocument}
        profile={profile}
        initialSubject={assessmentConfig.subject || activeSubject}
        initialTp={assessmentConfig.tp || ''}
        initialTopic={assessmentConfig.topic || ''}
      />

      <CurriculumChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onApplyToModul={(content) => {
          handleOpenDeepLearning(activeSubject, content);
        }}
      />

      <QuickDocModal
        isOpen={isQuickDocOpen}
        onClose={() => setIsQuickDocOpen(false)}
        onGenerate={handleGenerateDocument}
        initialDocType={quickDocConfig.initialDocType}
        initialSubject={quickDocConfig.initialSubject}
      />

      <DocumentEditorModal
        isOpen={isDocEditorOpen}
        onClose={() => setIsDocEditorOpen(false)}
        documentData={activeDoc}
        profile={profile}
        onSaveDocument={handleSaveDocument}
      />

      <BskapModal
        isOpen={isBskapModalOpen}
        onClose={() => setIsBskapModalOpen(false)}
      />

      <BantuanModal
        isOpen={isBantuanModalOpen}
        onClose={() => setIsBantuanModalOpen(false)}
      />

      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={() => runCloudSync(false)}
      />
    </div>
  );
}
