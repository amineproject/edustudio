import React, { useState } from 'react';
import { CP_DATABASE } from '../data/kurikulumData';

interface BankCPViewProps {
  onSelectCpForGenerator: (subject: string) => void;
  onOpenCurriculumExpert?: (subject: string, focus?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow') => void;
}

export const BankCPView: React.FC<BankCPViewProps> = ({
  onSelectCpForGenerator,
  onOpenCurriculumExpert,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [search, setSearch] = useState('');

  const subjects = [
    'Semua',
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam',
    'Bahasa Inggris',
    'Pendidikan Pancasila',
  ];

  const filtered = CP_DATABASE.filter((cp) => {
    const matchSubject = selectedSubject === 'Semua' || cp.subject === selectedSubject;
    const matchSearch =
      !search ||
      cp.element.toLowerCase().includes(search.toLowerCase()) ||
      cp.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
      cp.subject.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="flex flex-col w-full pb-10 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[22px] sm:text-[24px]">
              menu_book
            </span>
            <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
              Bank Capaian Pembelajaran (CP) Resmi
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5 sm:mt-1">
            Database lengkap Capaian Pembelajaran Fase D (Kelas 7-9 SMP) berlandaskan Keputusan Kepala BSKAP No. 033/H/KR/2024.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#dbe1ff] text-[#00236f] text-[10.5px] sm:text-xs font-bold border border-[#b6c4ff] self-start md:self-auto">
          <span className="material-symbols-outlined text-[14px] sm:text-[16px]">verified</span>
          <span>BSKAP No. 033/H/KR/2024</span>
        </div>
      </div>

      {/* Filter Chips & Search */}
      <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                selectedSubject === sub
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-slate-700 hover:bg-[#e2e8f0]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] sm:text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari elemen atau kata kunci..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0051d5]"
          />
        </div>
      </div>

      {/* CP Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((cp) => (
          <div
            key={cp.id}
            className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#00236f] text-[11px] font-bold border border-[#dce9ff]">
                  {cp.subject}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">
                  {cp.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] mb-1">
                Elemen: {cp.element}
              </h3>
              <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                {cp.fase}
              </span>

              <p className="text-xs text-slate-600 leading-relaxed bg-[#f8f9ff] p-3 rounded-xl border border-slate-100 mb-3">
                {cp.deskripsi}
              </p>

              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Contoh Alur / Tujuan Pembelajaran (TP):
                </span>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {cp.tujuanPembelajaran.map((tp, idx) => (
                    <li key={idx} className="leading-snug">
                      {tp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-end gap-2">
              {onOpenCurriculumExpert && (
                <button
                  type="button"
                  onClick={() => onOpenCurriculumExpert(cp.subject, 'cp_analysis')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white font-bold text-xs shadow-xs hover:scale-[1.01] transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Analisis CP & Rancang ATP</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectCpForGenerator(cp.subject)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-xs transition-all border border-[#dce9ff]"
              >
                <span>Buat Modul Cepat</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
