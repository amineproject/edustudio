import React, { useState } from 'react';

interface TemplatePanduanViewProps {
  onUseTemplate: (templateName: string) => void;
}

export const TemplatePanduanView: React.FC<TemplatePanduanViewProps> = ({ onUseTemplate }) => {
  const [activeTab, setActiveTab] = useState<'template' | 'panduan'>('template');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const templates = [
    {
      id: 't1',
      title: 'Template Modul Ajar Lengkap (Format Resmi BSKAP)',
      type: 'DOCX / Word',
      category: 'Perangkat Inti',
      desc: 'Format lengkap meliputi informasi umum, komponen inti, skenario diferensiasi konten/proses/produk, dan lampiran LKPD.',
      downloads: '1.4k kali diunduh',
    },
    {
      id: 't2',
      title: 'Matriks Alur Tujuan Pembelajaran (ATP) Fase D',
      type: 'XLSX / Excel',
      category: 'Perencanaan',
      desc: 'Tabel sekuensial hierarki materi kelas VII, VIII, dan IX lengkap dengan alokasi jam pelajaran (JP) dan asesmen prasyarat.',
      downloads: '980 kali diunduh',
    },
    {
      id: 't3',
      title: 'Instrumen Asesmen Awal & Rubrik Observasi P3',
      type: 'DOCX / PDF',
      category: 'Evaluasi',
      desc: 'Kisi-kisi asesmen diagnostik non-kognitif gaya belajar dan lembar observasi dimensi Profil Pelajar Pancasila.',
      downloads: '2.1k kali diunduh',
    },
    {
      id: 't4',
      title: 'Lembar Kerja Peserta Didik (LKPD) Berbasis Masalah (PBL)',
      type: 'DOCX / Word',
      category: 'Bahan Ajar',
      desc: 'Rancangan aktivitas kolaboratif murid investigasi studi kasus dengan panduan kerja kelompok bertingkat.',
      downloads: '1.7k kali diunduh',
    },
  ];

  const guides = [
    {
      id: 'g1',
      title: 'Panduan Pembelajaran dan Asesmen (PPA) SMP Revisi 2024',
      publisher: 'Kemendikbudristek BSKAP',
      desc: 'Pedoman resmi pelaksanaan pembelajaran berpusat pada murid, asesmen formatif berkala, dan pelaporan hasil belajar (rapor).',
      badge: 'Regulasi Utama',
    },
    {
      id: 'g2',
      title: 'Panduan Pengembangan Projek Profil Pelajar Pancasila (P5)',
      publisher: 'Pusat Kurikulum dan Pembelajaran',
      desc: 'Strategi penentuan tema projek (Kearifan Lokal, Gaya Hidup Berkelanjutan, Rekayasa Teknologi) dan modul fasilitasi.',
      badge: 'Ko-Kurikuler',
    },
    {
      id: 'g3',
      title: 'Pedoman Pembelajaran Berdiferensiasi di Tingkat SMP',
      publisher: 'Direktorat SMP',
      desc: 'Strategi diferensiasi konten, proses, dan produk tanpa diskriminasi kemampuan murid di kelas heterogen.',
      badge: 'Pedoman Praktis',
    },
  ];

  const handleDownload = (name: string) => {
    setDownloadNotice(`Templat "${name}" sedang disiapkan untuk diunduh.`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[22px] sm:text-[24px]">
              library_books
            </span>
            <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
              Template & Dokumen Panduan Resmi
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5 sm:mt-1">
            Kumpulan format baku administrasi dan panduan implementasi Kurikulum Merdeka Fase D SMP terbitan Kemendikbudristek.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff] self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('template')}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeTab === 'template'
                ? 'bg-white text-[#00236f] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Template Perangkat
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeTab === 'panduan'
                ? 'bg-white text-[#00236f] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buku Panduan
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 text-[#0051d5] border border-blue-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">cloud_download</span>
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Content */}
      {activeTab === 'template' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#00236f] text-[10.5px] font-bold">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{tmpl.type}</span>
                </div>

                <h3 className="text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] mb-2">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-[#444651] leading-relaxed mb-4">
                  {tmpl.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {tmpl.downloads}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(tmpl.title)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Unduh
                  </button>
                  <button
                    onClick={() => onUseTemplate(tmpl.title)}
                    className="px-3 py-1.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Gunakan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guides.map((g) => (
            <div
              key={g.id}
              className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold mb-3">
                  {g.badge}
                </span>

                <h3 className="text-sm font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-snug mb-1">
                  {g.title}
                </h3>
                <span className="text-[11px] text-[#0051d5] font-semibold block mb-2">
                  {g.publisher}
                </span>

                <p className="text-xs text-[#444651] leading-relaxed mb-4">
                  {g.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex justify-end">
                <button
                  onClick={() => handleDownload(g.title)}
                  className="w-full py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Buka Salinan PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
