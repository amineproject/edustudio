import React, { useState } from 'react';
import { RecentDocument, TeacherProfile } from '../types';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: RecentDocument | null;
  profile: TeacherProfile;
  onSaveDocument: (doc: RecentDocument) => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  documentData,
  profile,
  onSaveDocument,
}) => {
  if (!isOpen || !documentData) return null;

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [docTitle, setDocTitle] = useState(documentData.title);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Content sections
  const [topik, setTopik] = useState('Teks Laporan Hasil Observasi (LHO) - Eksplorasi Biodiversitas Lokal');
  const [alokasiWaktu, setAlokasiWaktu] = useState('3 Pertemuan (6 JP x 40 Menit)');
  const [pemahamanBermakna, setPemahamanBermakna] = useState(
    'Observasi sistematis terhadap lingkungan sekitar membantu manusia memahami keanekaragaman hayati dan menjaga kelestarian alam secara bertanggung jawab.'
  );
  const [pertanyaanPemantik, setPertanyaanPemantik] = useState(
    '1. Bagaimana cara membedakan fakta ilmiah dengan opini saat mengamati lingkungan sekolah?\n2. Mengapa laporan observasi harus ditulis secara objektif dan sistematis?'
  );

  const handleCopy = () => {
    const textToCopy = `${docTitle}\n\n${documentData.subject} - ${documentData.fase}\nSatuan Pendidikan: ${profile.school}\nPengampu: ${profile.name}\n\nTopik: ${topik}\nAlokasi Waktu: ${alokasiWaktu}\n\nPemahaman Bermakna:\n${pemahamanBermakna}\n\nPertanyaan Pemantik:\n${pertanyaanPemantik}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const content = `
========================================================================
             PERANGKAT AJAR KURIKULUM MERDEKA (FASE D SMP)
                     ${profile.school.toUpperCase()}
           TERSTANDAR KEPUTUSAN BSKAP NO. 033/H/KR/2024
========================================================================

JUDUL DOKUMEN       : ${docTitle}
MATA PELAJARAN      : ${documentData.subject}
FASE / KELAS        : ${documentData.fase}
SEMESTER            : ${profile.semester} TA ${profile.academicYear}
PENYUSUN            : ${profile.name} (NIP. ${profile.nip})
KEPALA SEKOLAH      : ${profile.headmaster}
ALOKASI WAKTU       : ${alokasiWaktu}

------------------------------------------------------------------------
I. INFORMASI UMUM
------------------------------------------------------------------------
A. Identitas Modul
   - Mata Pelajaran: ${documentData.subject}
   - Kelas / Semester: VII / Genap
   - Topik Pembelajaran: ${topik}

B. Dimensi Profil Pelajar Pancasila (P3):
   1. Bernalar Kritis (Mengidentifikasi fakta objektif)
   2. Gotong Royong (Kolaborasi kelompok dalam observasi lapangan)
   3. Kreatif (Menyajikan infografik / laporan data observasi)

C. Sarana dan Prasarana:
   - LCD Proyektor, LKPD, Lembar Observasi Lapangan, Taman Sekolah

------------------------------------------------------------------------
II. KOMPONEN INTI
------------------------------------------------------------------------
A. Tujuan Pembelajaran (TP):
   1. Peserta didik mampu menganalisis struktur teks LHO (pernyataan umum, deskripsi bagian, dan deskripsi manfaat) secara kritis.
   2. Peserta didik mampu menyusun draf teks LHO berdasarkan observasi langsung dengan ejaan yang disempurnakan (EYD).

B. Pemahaman Bermakna:
   ${pemahamanBermakna}

C. Pertanyaan Pemantik:
   ${pertanyaanPemantik}

D. Kegiatan Pembelajaran Berdiferensiasi:
   1. Kegiatan Pendahuluan (15 Menit):
      - Guru menyapa dan asesmen diagnostik non-kognitif kesiapan belajar.
      - Apersepsi mengamati spesimen daun di sekitar kelas.
   
   2. Kegiatan Inti (50 Menit) - Pembelajaran Berdiferensiasi:
      - Diferensiasi Konten: Murid auditori menyimak audio laporan, murid visual mengamati foto rincian flora sekolah.
      - Diferensiasi Proses: Kelompok dibagi berdasarkan kesiapan belajar (Perlu bimbingan intensif vs Mandiri).
      - Diferensiasi Produk: Murid dapat menyajikan hasil observasi dalam bentuk poster, esai, rekaman siniar, atau video singkat.

   3. Kegiatan Penutup (15 Menit):
      - Refleksi bersama peserta didik dan penarikan kesimpulan pokok.

------------------------------------------------------------------------
III. ASESMEN & RUBRIK PENILAIAN
------------------------------------------------------------------------
- Asesmen Diagnostik : Tanya jawab pemantik & ceklist minat.
- Asesmen Formatif   : Observasi kerja kelompok & umpan balik sejawat.
- Asesmen Sumatif    : Rubrik penilaian naskah laporan observasi (Skala 1-4).

Mengetahui,                                 Guru Mata Pelajaran,
Kepala ${profile.school}

${profile.headmaster}                       ${profile.name}
NIP. 19720815 199803 1 004                  NIP. ${profile.nip}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const updated: RecentDocument = {
      ...documentData,
      title: docTitle,
      lastModified: 'Baru saja disimpan',
      status: 'Siap Cetak / PDF',
    };
    onSaveDocument(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1]/60 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[95vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 px-3.5 sm:px-6 bg-[#f8faff] border-b border-[#e5eeff]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">description</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#00236f] text-[9.5px] sm:text-[10px] font-bold">
                  {documentData.type}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate max-w-[180px] sm:max-w-none">
                  {documentData.subject} • {documentData.fase}
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-[#0b1c30] leading-snug font-['Plus_Jakarta_Sans'] line-clamp-1">
                {docTitle}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end">
            <button
              onClick={handleCopy}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#cbd5e1] hover:bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Salin Teks"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Disalin!' : 'Salin'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#cbd5e1] hover:bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Cetak Dokumen"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">print</span>
              <span>Cetak</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              title="Unduh Berkas"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">download</span>
              <span>Unduh</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Toast */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-1.5 sm:py-2 bg-white border-b border-[#f1f5f9] text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-[#1e3a8a] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[15px]">visibility</span>
              Pratinjau Resmi BSKAP
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-[#1e3a8a] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Sesuaikan Parameter
            </button>
          </div>

          {savedToast && (
            <span className="text-xs font-bold text-green-700 flex items-center gap-1 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Dokumen berhasil disimpan ke arsip!
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              BSKAP 033/H/KR/2024 Terpenuhi
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#f8f9ff]">
          {activeTab === 'preview' ? (
            /* Printable Document Layout */
            <div className="bg-white rounded-xl shadow-xs border border-[#e2e8f0] p-6 sm:p-10 max-w-3xl mx-auto text-slate-800 space-y-6">
              {/* Official Document Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h4 className="text-sm font-bold tracking-wider text-slate-600 uppercase">
                  PEMERINTAH DAERAH PROVINSI / KABUPATEN
                </h4>
                <h2 className="text-lg font-extrabold text-[#00236f] tracking-wide uppercase font-['Plus_Jakarta_Sans']">
                  DINAS PENDIDIKAN & KEBUDAYAAN
                </h2>
                <h1 className="text-xl font-black text-slate-900 uppercase font-['Plus_Jakarta_Sans']">
                  {profile.school}
                </h1>
                <p className="text-[11px] text-slate-500 mt-1">
                  Alamat: Jl. Pendidikan No. 45 Nusantara • Telp: (021) 7890123 • Email: smpn1@pendidikan.sch.id
                </p>
              </div>

              {/* Document Banner */}
              <div className="bg-[#eff4ff] p-4 rounded-lg border border-[#dce9ff] text-center">
                <span className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider block">
                  PERANGKAT AJAR KURIKULUM MERDEKA
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#00236f] mt-0.5 font-['Plus_Jakarta_Sans']">
                  {docTitle}
                </h2>
                <span className="text-xs text-slate-600 font-medium mt-1 block">
                  Mata Pelajaran: {documentData.subject} • {documentData.fase} • Semester {profile.semester}
                </span>
              </div>

              {/* Section 1: Informasi Umum */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-[#1e3a8a] rounded-xs"></span>
                  I. INFORMASI UMUM
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#f8faff] border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Nama Penyusun</span>
                    <span className="font-bold text-slate-800">{profile.name}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8faff] border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Satuan Pendidikan</span>
                    <span className="font-bold text-slate-800">{profile.school}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8faff] border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Alokasi Waktu</span>
                    <span className="font-bold text-slate-800">{alokasiWaktu}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8faff] border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Model Pembelajaran</span>
                    <span className="font-bold text-slate-800">Problem Based Learning (PBL) & Inkuiri</span>
                  </div>
                </div>

                <div className="mt-2 p-3 rounded-lg bg-[#f8faff] border border-slate-100">
                  <span className="text-slate-500 font-bold text-[11px] block mb-1">
                    Dimensi Profil Pelajar Pancasila (P3):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Bernalar Kritis', 'Gotong Royong', 'Kreatif', 'Mandiri'].map((dim) => (
                      <span
                        key={dim}
                        className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#1e3a8a] text-[11px] font-bold border border-[#dce9ff]"
                      >
                        ✓ {dim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Komponen Inti */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-[#1e3a8a] rounded-xs"></span>
                  II. KOMPONEN INTI
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">A. Capaian & Tujuan Pembelajaran (TP)</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2 leading-relaxed">
                      <li>
                        Peserta didik mampu mengidentifikasi ide pokok dan informasi faktual dalam teks LHO ilmiah secara kritis.
                      </li>
                      <li>
                        Peserta didik mampu menyusun draf naskah laporan hasil observasi dengan struktur yang runut dan bahasa baku.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">B. Pemahaman Bermakna</h4>
                    <p className="text-slate-600 bg-[#f8faff] p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {pemahamanBermakna}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">C. Pertanyaan Pemantik</h4>
                    <p className="text-slate-600 bg-[#f8faff] p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                      {pertanyaanPemantik}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">
                      D. Skenario Kegiatan Berdiferensiasi
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-[#1e3a8a] block">
                          1. Diferensiasi Konten
                        </span>
                        <p className="text-slate-600 mt-0.5">
                          Menyediakan teks bacaan bertingkat (level dasar, menengah, mahir) serta video audio-visual keanekaragaman flora lokal bagi peserta didik gaya auditori/visual.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-[#1e3a8a] block">
                          2. Diferensiasi Proses
                        </span>
                        <p className="text-slate-600 mt-0.5">
                          Peserta didik yang membutuhkan bimbingan intensif didampingi secara scaffolding dengan format pemandu (guiding template), sedangkan kelompok mandiri langsung menyusun rancangan observasi.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-[#1e3a8a] block">
                          3. Diferensiasi Produk
                        </span>
                        <p className="text-slate-600 mt-0.5">
                          Laporan hasil akhir dapat disajikan dalam bentuk artikel tertulis, infografik digital/manual, rekaman siniar (podcast), atau presentasi slide.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-700">
                <div className="text-center">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{profile.headmaster}</p>
                  <p className="text-[10px] text-slate-500">NIP. 19720815 199803 1 004</p>
                </div>

                <div className="text-center">
                  <p>Nusantara, 2025</p>
                  <p className="font-bold">Guru Mata Pelajaran</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{profile.name}</p>
                  <p className="text-[10px] text-slate-500">NIP. {profile.nip}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form View */
            <div className="bg-white rounded-xl shadow-xs border border-[#e2e8f0] p-6 max-w-2xl mx-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Topik / Materi Pokok</label>
                <input
                  type="text"
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Alokasi Waktu (JP)</label>
                <input
                  type="text"
                  value={alokasiWaktu}
                  onChange={(e) => setAlokasiWaktu(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Pemahaman Bermakna</label>
                <textarea
                  rows={3}
                  value={pemahamanBermakna}
                  onChange={(e) => setPemahamanBermakna(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Pertanyaan Pemantik</label>
                <textarea
                  rows={3}
                  value={pertanyaanPemantik}
                  onChange={(e) => setPertanyaanPemantik(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white font-bold hover:bg-[#00236f] transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-3.5 px-6 border-t border-[#e5eeff] bg-[#f8faff]">
          <span className="text-[11px] text-slate-500 font-medium">
            Dokumen siap diekspor ke format resmi Kemendikbudristek RI
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white text-xs font-bold hover:bg-[#00236f] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
              Simpan ke Modul Saya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
