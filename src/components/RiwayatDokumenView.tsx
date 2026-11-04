import React, { useState } from 'react';
import { RecentDocument } from '../types';

interface RiwayatDokumenViewProps {
  documents: RecentDocument[];
  onOpenDocument: (doc: RecentDocument) => void;
  onDeleteDocument: (id: string) => void;
  onNewDocument: () => void;
  onOpenCurriculumExpert?: () => void;
  onOpenAssessmentModal?: () => void;
}

export const RiwayatDokumenView: React.FC<RiwayatDokumenViewProps> = ({
  documents,
  onOpenDocument,
  onDeleteDocument,
  onNewDocument,
  onOpenCurriculumExpert,
  onOpenAssessmentModal,
}) => {
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [search, setSearch] = useState('');

  const filtered = documents.filter((doc) => {
    const matchSubject = filterSubject === 'Semua' || doc.subject === filterSubject;
    const matchStatus = filterStatus === 'Semua' || doc.status === filterStatus;
    const matchSearch =
      !search ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.subTitle.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col w-full pb-10 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[22px] sm:text-[24px]">
              history_edu
            </span>
            <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
              Riwayat Dokumen Administrasi
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5 sm:mt-1">
            Arsip seluruh Modul Ajar, ATP, LKPD, dan Asesmen yang telah disusun untuk Fase D SMP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
          {onOpenCurriculumExpert && (
            <button
              onClick={onOpenCurriculumExpert}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[17px]">psychology</span>
              <span>+ Rancang CP-TP-ATP</span>
            </button>
          )}

          {onOpenAssessmentModal && (
            <button
              onClick={onOpenAssessmentModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[17px]">fact_check</span>
              <span>+ Asesmen & KKTP</span>
            </button>
          )}

          <button
            onClick={onNewDocument}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[11px] sm:text-xs font-bold transition-all border border-[#b6c4ff]"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_circle</span>
            <span>+ Buat Dokumen</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] sm:text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dalam riwayat..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0051d5]"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="Semua">Semua Mapel</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Ilmu Pengetahuan Alam">IPA</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
            <option value="Pendidikan Pancasila">Pancasila</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Siap Cetak / PDF">Siap Cetak</option>
            <option value="Draf (70%)">Draf</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <span className="text-[10.5px] sm:text-xs text-slate-500 font-medium self-end sm:self-auto">
          Ditemukan {filtered.length} berkas
        </span>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="sm:hidden space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-2.5 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#e5eeff] text-[#00236f] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30] leading-snug">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{doc.subTitle}</span>
                  </div>
                </div>

                {doc.status === 'Siap Cetak / PDF' ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#00236f] text-[9.5px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[11px]">check_circle</span>
                    Siap
                  </span>
                ) : doc.status === 'Draf (70%)' ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9.5px] font-bold shrink-0 border border-amber-200">
                    <span className="material-symbols-outlined text-[11px]">pending</span>
                    Draf
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9.5px] font-bold shrink-0 border border-emerald-200">
                    <span className="material-symbols-outlined text-[11px]">check_circle</span>
                    Selesai
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#f1f5f9] text-[10.5px]">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#00236f] font-semibold text-[10px]">
                    {doc.subject}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {doc.type}
                  </span>
                  <span className="text-slate-400 text-[10px]">{doc.lastModified}</span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenDocument(doc)}
                    className="p-1 rounded hover:bg-[#e5eeff] text-slate-600 hover:text-[#00236f]"
                    title="Buka / Edit"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit_square</span>
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Hapus"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 bg-white rounded-xl border border-[#e2e8f0] text-center text-slate-400 text-xs">
            Tidak ada dokumen yang sesuai kriteria filter.
          </div>
        )}
      </div>

      {/* Tablet / Desktop Table View (>= 640px) */}
      <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eff4ff] text-[#444651] text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">NAMA DOKUMEN</th>
                <th className="py-3 px-4 font-bold">JENIS</th>
                <th className="py-3 px-4 font-bold">MAPEL</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">TERAKHIR DIUBAH</th>
                <th className="py-3 px-4 text-right font-bold">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#0b1c30] divide-y divide-[#f1f5f9]">
              {filtered.length > 0 ? (
                filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-[#eff4ff]/60 transition-colors cursor-pointer group"
                    onClick={() => onOpenDocument(doc)}
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#e5eeff] text-[#00236f] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">
                            description
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-[#0051d5] transition-colors leading-snug">
                            {doc.title}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            {doc.subTitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10.5px] font-bold text-slate-700">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">{doc.subject}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.status === 'Siap Cetak / PDF' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#00236f] text-[10.5px] font-bold">
                          <span className="material-symbols-outlined text-[13px]">
                            check_circle
                          </span>
                          Siap Cetak
                        </span>
                      ) : doc.status === 'Draf (70%)' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-bold border border-amber-200">
                          <span className="material-symbols-outlined text-[13px]">
                            pending
                          </span>
                          Draf (70%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                          <span className="material-symbols-outlined text-[13px]">
                            check_circle
                          </span>
                          Selesai
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {doc.lastModified}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onOpenDocument(doc)}
                          className="p-1.5 rounded hover:bg-[#e5eeff] text-slate-600 hover:text-[#00236f]"
                          title="Buka / Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit_square
                          </span>
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada dokumen yang sesuai kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
