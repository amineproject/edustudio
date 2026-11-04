import React, { useState } from 'react';
import { CP_DATABASE } from '../data/kurikulumData';
import { saveCustomSubject } from '../utils/subjectManager';

interface QuickDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: {
    faseClass: string;
    subject: string;
    docType: string;
    selectedCps: string[];
    useP3: boolean;
    useDifferentiated: boolean;
  }) => void;
  initialSubject?: string;
  initialDocType?: string;
}

export const QuickDocModal: React.FC<QuickDocModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  initialSubject = 'Bahasa Indonesia',
  initialDocType = 'Modul Ajar / RPP+',
}) => {
  const [faseClass, setFaseClass] = useState('Fase D - Kelas VII');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [customSubjectText, setCustomSubjectText] = useState('');
  const [docType, setDocType] = useState(initialDocType);
  const [activeSourceTab, setActiveSourceTab] = useState<'database' | 'upload'>('database');
  const [cpSearch, setCpSearch] = useState('');
  const [selectedCpIds, setSelectedCpIds] = useState<string[]>([
    'cp-indo-1',
    'cp-indo-2',
  ]);
  const [useP3, setUseP3] = useState(true);
  const [useDifferentiated, setUseDifferentiated] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const subjectOptions = [
    {
      id: 'Bahasa Indonesia',
      name: 'Bahasa Indonesia',
      icon: 'article',
      color: 'text-[#1e3a8a]',
      badge: '4 Elemen CP',
      desc: 'Elemen: Menyimak, Membaca-Memirsa, Berbicara-Mempresentasikan, Menulis',
    },
    {
      id: 'Matematika',
      name: 'Matematika',
      icon: 'calculate',
      color: 'text-[#0051d5]',
      badge: '5 Elemen CP',
      desc: 'Elemen: Bilangan, Aljabar, Pengukuran, Geometri, Analisis Data & Peluang',
    },
    {
      id: 'Ilmu Pengetahuan Alam',
      name: 'Ilmu Pengetahuan Alam (IPA)',
      icon: 'science',
      color: 'text-[#004a31]',
      badge: '2 Domain Utama',
      desc: 'Pemahaman IPA (Hakikat Sains, Zat, Ekologi) & Keterampilan Proses Sains',
    },
    {
      id: 'Bahasa Inggris',
      name: 'Bahasa Inggris',
      icon: 'translate',
      color: 'text-[#0051d5]',
      badge: '4 Keterampilan Bahasa',
      desc: 'Listening, Speaking, Reading, Writing and Viewing',
    },
    {
      id: 'Pendidikan Pancasila',
      name: 'Pendidikan Pancasila',
      icon: 'shield',
      color: 'text-[#1e3a8a]',
      badge: '4 Elemen Kebangsaan',
      desc: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika, dan NKRI',
    },
  ];

  const docTypeOptions = [
    {
      id: 'Modul Ajar / RPP+',
      title: 'Modul Ajar / RPP+',
      subtitle: 'Sintaks lengkap & diferensiasi konten',
    },
    {
      id: 'LKPD Interaktif',
      title: 'LKPD Interaktif',
      subtitle: 'Lembar kerja siswa kontekstual & studi kasus',
    },
    {
      id: 'Alur Tujuan Pembelajaran (ATP)',
      title: 'Alur Tujuan Pembelajaran (ATP)',
      subtitle: 'Urutan sekuensial hirarki capaian Fase D',
    },
    {
      id: 'Instrumen Asesmen HOTS',
      title: 'Instrumen Asesmen HOTS',
      subtitle: 'Kisi-kisi soal, rubrik analitik, tes sumatif',
    },
  ];

  const filteredCps = CP_DATABASE.filter((cp) => {
    const matchSubject =
      selectedSubject === 'Semua' ||
      cp.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
      selectedSubject.toLowerCase().includes(cp.subject.toLowerCase());
    const matchSearch =
      cp.element.toLowerCase().includes(cpSearch.toLowerCase()) ||
      cp.deskripsi.toLowerCase().includes(cpSearch.toLowerCase());
    return matchSubject && matchSearch;
  });

  const toggleCp = (id: string) => {
    if (selectedCpIds.includes(id)) {
      setSelectedCpIds(selectedCpIds.filter((item) => item !== id));
    } else {
      setSelectedCpIds([...selectedCpIds, id]);
    }
  };

  const handleSelectAllCps = () => {
    const currentSubjectCpIds = filteredCps.map((c) => c.id);
    setSelectedCpIds(Array.from(new Set([...selectedCpIds, ...currentSubjectCpIds])));
  };

  const handleStartGenerate = () => {
    onGenerate({
      faseClass,
      subject: selectedSubject,
      docType,
      selectedCps: selectedCpIds,
      useP3,
      useDifferentiated,
    });
  };

  return (
    <div
      id="quickDocModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#cbd5e1]/40 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-[#e5eeff]">
          <div className="flex flex-col pr-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#dbe1ff] text-[#00236f] font-bold">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </span>
              <h3 className="text-lg font-bold text-[#0b1c30] tracking-tight font-['Plus_Jakarta_Sans']">
                Buat Dokumen Administrasi Cepat
              </h3>
            </div>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed">
              Pilih mata pelajaran, fase kelas, dan jenis perangkat ajar untuk mulai membuat dokumen otomatis berbasis Kurikulum Merdeka.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#eff4ff] transition-colors shrink-0"
            type="button"
            aria-label="Tutup Modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Section 1: Jenjang & Fase Kelas */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#1e3a8a]">
                school
              </span>
              <span>Jenjang & Fase Kelas</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Fase D - Kelas VII', 'Fase D - Kelas VIII', 'Fase D - Kelas IX'].map((item) => {
                const isSelected = faseClass === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFaseClass(item)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'border-2 border-[#1e3a8a] bg-[#eff4ff] text-[#1e3a8a] shadow-xs'
                        : 'border border-[#cbd5e1]/60 hover:border-slate-400 text-slate-600 hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Pilih Mata Pelajaran */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px] text-[#1e3a8a]">
                  menu_book
                </span>
                <span>Pilih Mata Pelajaran (Fase D SMP)</span>
              </label>
              <span className="text-[11px] text-[#0051d5] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Sesuai SK BSKAP 033/H/KR/2024
              </span>
            </div>

            <div className="border border-[#cbd5e1] rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#f1f5f9] border-b border-[#e2e8f0]">
                <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
                  Menu Pemilihan Mata Pelajaran (Terbuka)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Klik untuk memilih CP resmi
                </span>
              </div>

              <div className="grid grid-cols-1 divide-y divide-[#f1f5f9] max-h-48 overflow-y-auto">
                {subjectOptions.map((subj) => {
                  const isSelected = selectedSubject === subj.id;
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => setSelectedSubject(subj.id)}
                      className={`w-full flex items-start justify-between p-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-[#eff4ff] border-l-4 border-[#1e3a8a]'
                          : 'hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`material-symbols-outlined ${subj.color} text-[20px] mt-0.5`}
                        >
                          {subj.icon}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isSelected ? 'text-[#1e3a8a]' : 'text-slate-800'
                              }`}
                            >
                              {subj.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                isSelected
                                  ? 'bg-[#1e3a8a] text-white'
                                  : 'bg-[#e2e8f0] text-slate-700'
                              }`}
                            >
                              {isSelected ? 'Terpilih' : subj.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {subj.desc}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isSelected ? 'text-[#1e3a8a]' : 'text-slate-300'
                        }`}
                      >
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Direct Input in QuickDocModal */}
              <div className="p-2.5 bg-[#f8faff] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="material-symbols-outlined text-[#0051d5] text-[18px]">
                    edit_note
                  </span>
                  <input
                    type="text"
                    placeholder="Atau ketik mapel sendiri (contoh: Informatika, IPS, Prakarya)..."
                    value={customSubjectText}
                    onChange={(e) => {
                      setCustomSubjectText(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedSubject(e.target.value.trim());
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0051d5] focus:outline-none font-medium"
                  />
                </div>
                {customSubjectText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      saveCustomSubject(customSubjectText.trim());
                      alert(`Mata pelajaran "${customSubjectText.trim()}" disimpan ke daftar favorit.`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#00236f] text-white text-[10.5px] font-bold hover:bg-[#00174d] shrink-0"
                  >
                    Simpan Mapel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Pilih Jenis Perangkat Ajar */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#1e3a8a]">
                auto_stories
              </span>
              <span>Pilih Jenis Perangkat Ajar</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {docTypeOptions.map((opt) => {
                const isSelected = docType === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setDocType(opt.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-[#0051d5] bg-[#eff4ff]'
                        : 'border border-[#cbd5e1]/60 hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="doc_type"
                      checked={isSelected}
                      onChange={() => setDocType(opt.id)}
                      className="mt-0.5 text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5]"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-xs">
                        {opt.title}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        {opt.subtitle}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Sumber Acuan & Capaian Pembelajaran (CP) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px] text-[#1e3a8a]">
                  dataset
                </span>
                <span>Sumber Acuan & Capaian Pembelajaran (CP)</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#004a31] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Terintegrasi BSKAP 2024
              </span>
            </div>

            {/* Toggle Tab */}
            <div className="grid grid-cols-2 p-1 bg-[#eff4ff] rounded-xl gap-1 text-center">
              <button
                type="button"
                onClick={() => setActiveSourceTab('database')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeSourceTab === 'database'
                    ? 'bg-white text-[#1e3a8a] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">database</span>
                <span>Database Resmi BSKAP (Rekomendasi)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('upload')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeSourceTab === 'upload'
                    ? 'bg-white text-[#1e3a8a] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Unggah Mandiri (KSP/Silabus)</span>
              </button>
            </div>

            {/* Database View */}
            {activeSourceTab === 'database' && (
              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#f8f9ff] border border-[#dce9ff]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Pratinjau Database CP BSKAP:
                    </span>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e3a8a] text-white text-[10px] font-semibold">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      No. 033/H/KR/2024
                    </div>
                  </div>
                  <div className="relative flex-1 sm:max-w-[200px]">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={cpSearch}
                      onChange={(e) => setCpSearch(e.target.value)}
                      placeholder="Cari elemen..."
                      className="w-full bg-white text-slate-800 text-[11px] pl-7 pr-2 py-1 rounded-md border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#0051d5]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#1e3a8a]">
                      checklist
                    </span>
                    Centang elemen capaian untuk di-generate:
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllCps}
                    className="text-[#0051d5] font-semibold hover:underline cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                </div>

                {/* CP Items List */}
                <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                  {filteredCps.length > 0 ? (
                    filteredCps.map((cp) => {
                      const isChecked = selectedCpIds.includes(cp.id);
                      return (
                        <label
                          key={cp.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                            isChecked
                              ? 'bg-[#eff4ff] border-[#0051d5]'
                              : 'bg-white border-[#e2e8f0] hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCp(cp.id)}
                            className="mt-1 text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5] rounded"
                          />
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[#1e3a8a] text-xs">
                                {cp.subject} — {cp.element}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#dce9ff] text-slate-600 font-medium">
                                {cp.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                              {cp.deskripsi}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      Tidak ada elemen CP yang cocok dengan pencarian.
                    </div>
                  )}
                </div>

                {/* Banner notice */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#eff4ff] text-[11px] border border-[#dce9ff]">
                  <span className="text-[#1e3a8a] flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-[#004a31]">
                      check_circle
                    </span>
                    {selectedCpIds.length} Elemen terpilih dari BSKAP 033/H/KR/2024 akan otomatis dikonversi ke {docType}
                  </span>
                </div>
              </div>
            )}

            {/* Upload View */}
            {activeSourceTab === 'upload' && (
              <div className="border-2 border-dashed border-[#cbd5e1] hover:border-[#0051d5] rounded-xl p-5 bg-[#f8f9ff] transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  id="kspFileInput"
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsUploading(true);
                      setTimeout(() => {
                        setUploadedFileName(e.target.files![0].name);
                        setIsUploading(false);
                      }, 600);
                    }
                  }}
                />
                <label htmlFor="kspFileInput" className="cursor-pointer w-full">
                  <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#1e3a8a] flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[22px]">
                      {isUploading ? 'sync' : 'cloud_upload'}
                    </span>
                  </div>
                  {uploadedFileName ? (
                    <div className="text-green-700 font-bold text-xs">
                      ✓ Berkas terunggah: {uploadedFileName}
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 text-xs">
                        <span className="text-[#0051d5]">Tarik file ke sini</span> atau{' '}
                        <span className="underline decoration-[#0051d5]">klik untuk telusuri</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Unggah silabus kurikulum operasional satuan pendidikan (KOSP/KSP) (PDF, DOCX maks 15MB).
                      </p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Section 5: Preferensi Tambahan */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#e2e8f0]">
            <span className="text-[10.5px] text-slate-500 uppercase font-bold tracking-wider">
              Preferensi Tambahan
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#eff4ff] flex-1 cursor-pointer hover:bg-[#e5eeff] transition-colors">
                <input
                  type="checkbox"
                  checked={useP3}
                  onChange={(e) => setUseP3(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5]"
                />
                <span className="text-slate-800 font-semibold text-xs">
                  Integrasikan Profil Pelajar Pancasila (P3)
                </span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#eff4ff] flex-1 cursor-pointer hover:bg-[#e5eeff] transition-colors">
                <input
                  type="checkbox"
                  checked={useDifferentiated}
                  onChange={(e) => setUseDifferentiated(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5]"
                />
                <span className="text-slate-800 font-semibold text-xs">
                  Alur Pembelajaran Berdiferensiasi
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-5 border-t border-[#e5eeff] bg-[#f8fafe]">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg border border-[#cbd5e1] font-semibold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleStartGenerate}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1e3a8a] hover:bg-[#00236f] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
            <span>Mulai Generate Dokumen ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
