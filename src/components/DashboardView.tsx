import React, { useState } from 'react';
import { ModuleCategory, ModuleItem, RecentDocument } from '../types';
import { MODULES_LIST } from '../data/kurikulumData';
import { SubjectPicker } from './SubjectPicker';

interface DashboardViewProps {
  documents: RecentDocument[];
  activeSubject: string;
  onSubjectChange: (sub: string) => void;
  onOpenQuickDocModal: (initialDocType?: string, initialSubject?: string) => void;
  onOpenCurriculumExpert: (subject?: string, focus?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow') => void;
  onOpenDeepLearningModul?: (subject?: string, tp?: string) => void;
  onOpenAssessmentModal?: (subject?: string) => void;
  onOpenChatbot?: () => void;
  onOpenDocumentEditor: (doc: RecentDocument) => void;
  onOpenBskapGuide: () => void;
  onViewAllHistory: () => void;
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  activeSubject,
  onSubjectChange,
  onOpenQuickDocModal,
  onOpenCurriculumExpert,
  onOpenDeepLearningModul,
  onOpenAssessmentModal,
  onOpenChatbot,
  onOpenDocumentEditor,
  onOpenBskapGuide,
  onViewAllHistory,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<ModuleCategory>('all');

  const filteredModules = MODULES_LIST.filter((mod) => {
    const matchCategory = activeTab === 'all' || mod.category === activeTab;
    const matchSearch =
      !searchQuery ||
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredDocuments = documents.filter((doc) => {
    return (
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Ambient Glow & Welcome Hero Section */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#eff4ff] p-4 sm:p-6 md:p-8 mb-5 sm:mb-6 shadow-xs border border-[#dce9ff]">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#0051d5]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 bottom-0 w-64 h-64 rounded-full bg-[#6ffbbe]/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
          <div className="max-w-3xl flex flex-col gap-2.5 sm:gap-3">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#00236f] text-white text-[10px] sm:text-[11px] font-bold shadow-xs">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">verified</span>
                BSKAP No. 033/H/KR/2024
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#e5eeff] text-[#00236f] text-[10px] sm:text-[11px] font-bold border border-[#dce9ff]">
                Fase D (SMP)
              </span>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#dce9ff] text-[#444651] text-[11px] font-medium">
                Status: Merdeka Mandiri Berbagi
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b1c30] tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              Selamat Datang, Guru Hebat! 👋
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#444651] leading-relaxed max-w-2xl font-normal">
              Platform Generator Administrasi Pembelajaran Kurikulum Merdeka SMP (Fase D). Susun administrasi kelas, modul ajar berdiferensiasi 8-3-3-4, LKPD kontekstual, dan asesmen HOTS terstandar BSKAP secara efisien.
            </p>

            {/* Quick Subject & Quick Start Selector */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <div className="inline-flex items-center bg-white px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs border border-[#cbd5e1]/60 text-xs">
                <span className="material-symbols-outlined text-[#0051d5] text-[18px] sm:text-[20px] mr-1.5">
                  subject
                </span>
                <span className="text-[11px] sm:text-xs text-[#444651] mr-1.5 font-medium">
                  Mapel:
                </span>
                <SubjectPicker
                  value={activeSubject}
                  onChange={onSubjectChange}
                  compact
                  allowCustomInput
                />
              </div>

              <button
                type="button"
                onClick={onOpenBskapGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11px] sm:text-xs font-semibold transition-colors border border-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-[#00236f]">
                  menu_book
                </span>
                <span>Panduan BSKAP</span>
              </button>
            </div>
          </div>

          {/* Quick Action Floating Card */}
          <div className="shrink-0 flex flex-col sm:flex-row xl:flex-col gap-2 bg-white p-3 sm:p-4 rounded-xl shadow-xs border border-[#e2e8f0] xl:w-72">
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-[10px] sm:text-[11px] text-[#444651] uppercase tracking-wider font-bold">
                Tindakan Kilat
              </span>
              <span className="inline-flex items-center w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <button
              onClick={() => onOpenCurriculumExpert(activeSubject, 'all')}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#00236f] to-[#0051d5] hover:opacity-95 text-white py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[17px]">psychology</span>
              <span>+ Rancang CP, TP & ATP</span>
            </button>

            {onOpenDeepLearningModul && (
              <button
                onClick={() => onOpenDeepLearningModul(activeSubject)}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#00236f] hover:bg-[#1e3a8a] text-white py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[17px]">auto_stories</span>
                <span>+ Modul Ajar Deep Learning</span>
              </button>
            )}

            {onOpenAssessmentModal && (
              <button
                onClick={() => onOpenAssessmentModal(activeSubject)}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[17px]">fact_check</span>
                <span>+ Asesmen & KKTP (Modul 3)</span>
              </button>
            )}

            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[17px]">chat</span>
                <span>Tanya Pakar Kurikulum AI</span>
              </button>
            )}

            <button
              onClick={() => onOpenQuickDocModal('Modul Ajar / RPP+', activeSubject)}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] py-1.5 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-colors border border-[#cbd5e1]"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">add_circle</span>
              <span>+ Dokumen Cepat</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics / Ringkasan Aktivitas Guru - Mobile Balanced 2 Columns */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[20px] sm:text-[22px]">
              analytics
            </span>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
              Ringkasan Aktivitas Pengajaran
            </h2>
          </div>
          <span className="text-[10.5px] sm:text-xs text-[#444651] font-medium">
            Semester Genap
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1 */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-xs border border-[#e2e8f0] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10.5px] sm:text-xs text-[#444651]">Total Dokumen</span>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                  <span className="text-xl sm:text-3xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                    24
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#444651]">Berkas</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#dce9ff] text-[#00236f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">
                  assignment_turned_in
                </span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-1 flex items-center justify-between">
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] text-[#004a31] font-bold bg-[#e5eeff] px-1.5 sm:px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px]">arrow_upward</span>
                +4 pekan ini
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#444651] hidden sm:inline">BSKAP</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-xs border border-[#e2e8f0] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10.5px] sm:text-xs text-[#444651]">Modul Ajar Aktif</span>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                  <span className="text-xl sm:text-3xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                    8
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#444651]">Modul</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#dce9ff] text-[#0051d5] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">menu_book</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[#0051d5] text-[14px] sm:text-[16px]">
                stars
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#444651] truncate">
                Fase D (P3)
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-xs border border-[#e2e8f0] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10.5px] sm:text-xs text-[#444651]">Alokasi JP</span>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                  <span className="text-xl sm:text-3xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                    68
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#444651]">/ 72 JP</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#dce9ff] text-[#00236f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">schedule</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-1 flex flex-col gap-1">
              <div className="w-full bg-[#e5eeff] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#0051d5] h-1.5 rounded-full"
                  style={{ width: '94.4%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[#444651] text-[10px] sm:text-[11px]">
                <span>Progress</span>
                <span className="font-bold text-[#0051d5]">94%</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl shadow-xs border border-[#e2e8f0] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10.5px] sm:text-xs text-[#444651]">Bank Asesmen</span>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                  <span className="text-xl sm:text-3xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                    16
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#444651]">Paket</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#dce9ff] text-[#264191] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">quiz</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-1 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#444651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#316bf3]"></span>
                HOTS & Rubrik
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#00236f] hidden sm:inline">+ KKTP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 10 Generator Modules Catalog Section */}
      <section className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#00236f] text-white text-[11px] sm:text-xs font-bold">
                10
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                Katalog Generator Modul Pembelajaran
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5">
              Pilih komponen perangkat ajar yang ingin Anda susun secara sistematis dan terstandar:
            </p>
          </div>

          {/* Filter Tabs - Horizontal Swipe on Mobile */}
          <div className="flex items-center bg-[#eff4ff] p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full border border-[#dce9ff] gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap font-medium ${
                activeTab === 'all'
                  ? 'bg-white text-[#00236f] shadow-xs font-bold'
                  : 'text-[#444651] hover:text-[#0b1c30]'
              }`}
              type="button"
            >
              Semua (10)
            </button>
            <button
              onClick={() => setActiveTab('perencanaan')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap font-medium ${
                activeTab === 'perencanaan'
                  ? 'bg-white text-[#00236f] shadow-xs font-bold'
                  : 'text-[#444651] hover:text-[#0b1c30]'
              }`}
              type="button"
            >
              Perencanaan (5)
            </button>
            <button
              onClick={() => setActiveTab('bahan')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap font-medium ${
                activeTab === 'bahan'
                  ? 'bg-white text-[#00236f] shadow-xs font-bold'
                  : 'text-[#444651] hover:text-[#0b1c30]'
              }`}
              type="button"
            >
              Bahan & Media (3)
            </button>
            <button
              onClick={() => setActiveTab('evaluasi')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap font-medium ${
                activeTab === 'evaluasi'
                  ? 'bg-white text-[#00236f] shadow-xs font-bold'
                  : 'text-[#444651] hover:text-[#0b1c30]'
              }`}
              type="button"
            >
              Evaluasi (2)
            </button>
          </div>
        </div>

        {/* 10 Modular Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5" id="moduleGrid">
          {filteredModules.map((item) => {
            const isFeatured = item.isPopular;

            return (
              <div
                key={item.id}
                className={`group bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isFeatured
                    ? 'border-[#316bf3]/40 shadow-xs hover:shadow-lg'
                    : 'border-[#e2e8f0] shadow-xs hover:shadow-md'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#316bf3]/10 rounded-full blur-xl pointer-events-none"></div>
                )}

                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                        isFeatured
                          ? 'bg-[#0051d5] text-white shadow-xs'
                          : 'bg-[#dce9ff] text-[#00236f]'
                      }`}
                    >
                      {item.tag1}
                    </span>
                    <span
                      className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded ${
                        isFeatured
                          ? 'text-[#00236f] bg-[#dce9ff] font-bold'
                          : 'text-[#444651] bg-[#eff4ff]'
                      }`}
                    >
                      {item.tag2}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-2 sm:mb-2.5">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isFeatured
                          ? 'bg-[#00236f] text-white shadow-xs'
                          : 'bg-[#eff4ff] text-[#0051d5] group-hover:bg-[#00236f] group-hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3
                        className={`text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans'] leading-tight transition-colors ${
                          isFeatured
                            ? 'text-[#00236f]'
                            : 'text-[#0b1c30] group-hover:text-[#00236f]'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[10.5px] sm:text-[11px] text-[#444651] mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11.5px] sm:text-xs text-[#444651] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 sm:pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                  <span
                    className={`text-[10.5px] sm:text-[11px] flex items-center gap-1 ${
                      isFeatured
                        ? 'text-[#0051d5] font-bold'
                        : 'text-[#444651]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px] sm:text-[15px]">
                      {item.footerIcon}
                    </span>
                    <span className="truncate max-w-[120px] sm:max-w-none">{item.footerTag}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.id === 'cp') {
                        onOpenCurriculumExpert(activeSubject, 'cp_analysis');
                      } else if (item.id === 'tp') {
                        onOpenCurriculumExpert(activeSubject, 'tp_formulation');
                      } else if (item.id === 'atp') {
                        onOpenCurriculumExpert(activeSubject, 'atp_flow');
                      } else if (item.id === 'modul_ajar' && onOpenDeepLearningModul) {
                        onOpenDeepLearningModul(activeSubject);
                      } else if (item.id === 'asesmen' && onOpenAssessmentModal) {
                        onOpenAssessmentModal(activeSubject);
                      } else {
                        onOpenQuickDocModal(item.title, activeSubject);
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all ${
                      isFeatured
                        ? 'bg-[#00236f] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-[#1e3a8a] shadow-xs'
                        : 'text-[#0051d5] group-hover:text-[#00236f] group-hover:translate-x-0.5'
                    }`}
                  >
                    <span>{item.actionText}</span>
                    <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dokumen Terbaru / Workflow Continuity Section */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs border border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 pb-2 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[20px] sm:text-[22px]">
              history_edu
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                Aktivitas Terakhir Disusun
              </h2>
              <span className="text-[10.5px] sm:text-[11px] text-[#444651]">
                Lanjutkan pengerjaan dokumen atau unduh berkas yang siap dicetak
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewAllHistory}
            className="inline-flex items-center gap-1 text-[#0051d5] hover:text-[#00236f] text-[11px] sm:text-xs font-bold self-start sm:self-auto"
          >
            <span>Lihat Semua Riwayat</span>
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Mobile-Friendly Card View (< 640px) */}
        <div className="sm:hidden space-y-2.5">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocumentEditor(doc)}
              className="p-3 rounded-xl bg-[#f8faff] border border-[#e2e8f0] flex flex-col gap-2 hover:bg-[#eff4ff] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#e5eeff] text-[#00236f] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30] leading-snug line-clamp-1">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-[#444651] block">{doc.subTitle}</span>
                  </div>
                </div>

                {doc.status === 'Siap Cetak / PDF' ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#00236f] text-[9.5px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Siap
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Selesai
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[10.5px]">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white text-[#0b1c30] font-semibold border border-[#dce9ff]">
                    {doc.subject}
                  </span>
                  <span className="text-[#64748b]">{doc.lastModified}</span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenDocumentEditor(doc)}
                    className="p-1 rounded hover:bg-[#dce9ff] text-[#00236f]"
                    title="Buka / Edit"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_square</span>
                  </button>
                  <button
                    onClick={() => onOpenDocumentEditor(doc)}
                    className="p-1 rounded hover:bg-[#dce9ff] text-[#0051d5]"
                    title="Unduh"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet / Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eff4ff] text-[#444651] text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg font-bold">NAMA DOKUMEN & PERANGKAT</th>
                <th className="py-3 px-4 font-bold">MATA PELAJARAN</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">TERAKHIR DIUBAH</th>
                <th className="py-3 px-4 rounded-r-lg text-right font-bold">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#0b1c30] divide-y divide-[#f1f5f9]">
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-[#eff4ff]/60 transition-colors cursor-pointer group"
                  onClick={() => onOpenDocumentEditor(doc)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#e5eeff] text-[#00236f] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          description
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[#0b1c30] font-bold group-hover:text-[#0051d5] transition-colors">
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-[#444651]">
                          {doc.subTitle}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eff4ff] text-[11px] text-[#0b1c30] font-medium border border-[#dce9ff]">
                      {doc.subject}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {doc.status === 'Siap Cetak / PDF' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#00236f] text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Siap Cetak / PDF
                      </span>
                    ) : doc.status === 'Draf (70%)' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#444651] text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        Draf (70%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Selesai
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#444651] text-[11px]">
                    {doc.lastModified}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onOpenDocumentEditor(doc)}
                        className="p-1.5 rounded-md hover:bg-[#e5eeff] text-[#444651] hover:text-[#00236f] transition-colors"
                        title="Unduh / Buka Dokumen"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          download
                        </span>
                      </button>
                      <button
                        onClick={() => onOpenDocumentEditor(doc)}
                        className="p-1.5 rounded-md hover:bg-[#e5eeff] text-[#444651] hover:text-[#0051d5] transition-colors"
                        title="Edit Dokumen"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit_square
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
