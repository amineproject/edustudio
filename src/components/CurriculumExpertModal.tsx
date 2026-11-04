import React, { useState, useEffect } from 'react';
import { CP_DATABASE } from '../data/kurikulumData';
import { CurriculumInput, CurriculumGenerationResult, generateCurriculumPlan } from '../utils/curriculumEngine';
import { RecentDocument, CapaianPembelajaran } from '../types';
import { SubjectPicker } from './SubjectPicker';
import { getRecommendedElements } from '../utils/subjectManager';

interface CurriculumExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToDocuments: (doc: RecentDocument) => void;
  onProceedToModulAjar?: (subject: string, tp: string) => void;
  initialSubject?: string;
  initialFocus?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow';
}

export const CurriculumExpertModal: React.FC<CurriculumExpertModalProps> = ({
  isOpen,
  onClose,
  onSaveToDocuments,
  onProceedToModulAjar,
  initialSubject = 'Bahasa Indonesia',
  initialFocus = 'all',
}) => {
  // Wizard Step: 'input_mandatory' | 'input_optional' | 'result'
  const [step, setStep] = useState<'input_mandatory' | 'input_optional' | 'result'>('input_mandatory');

  // Mandatory Inputs
  const [subject, setSubject] = useState<string>(initialSubject);
  const [grade, setGrade] = useState<string>('Kelas VII');
  const [semester, setSemester] = useState<string>('Ganjil');
  const [effectiveWeeks, setEffectiveWeeks] = useState<number>(18);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [coreTopic, setCoreTopic] = useState<string>('');
  const [totalJp, setTotalJp] = useState<number>(72);
  const [customElementsList, setCustomElementsList] = useState<string[]>([]);
  const [newCustomElementInput, setNewCustomElementInput] = useState<string>('');

  // Optional Inputs
  const [officialCpText, setOfficialCpText] = useState<string>('');
  const [studentReadiness, setStudentReadiness] = useState<string>('Sebagian besar murid memiliki minat visual dan kinestetik; 30% murid memerlukan bimbingan membaca intensif.');
  const [schoolContext, setSchoolContext] = useState<string>('Tersedia ruang komputer terbatas, taman sekolah representatif, dan proyektor di kelas.');
  const [learningModel, setLearningModel] = useState<string>('Problem Based Learning (PBL)');
  const [focusMode, setFocusMode] = useState<'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow'>(initialFocus);

  // Status & Output State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorWarning, setErrorWarning] = useState<string | null>(null);
  const [result, setResult] = useState<CurriculumGenerationResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'all' | 'cp' | 'tp' | 'atp' | 'notes'>('all');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Sync elements when subject changes
  useEffect(() => {
    // Read combined database (default + user-saved CP)
    let combinedCps: CapaianPembelajaran[] = CP_DATABASE;
    try {
      const stored = localStorage.getItem('custom_cp_database');
      if (stored) {
        combinedCps = JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }

    const relevantCps = combinedCps.filter((c) =>
      c.subject.toLowerCase().includes(subject.toLowerCase()) ||
      subject.toLowerCase().includes(c.subject.toLowerCase())
    );

    const recommended = getRecommendedElements(subject);

    if (relevantCps.length > 0) {
      const els = Array.from(new Set([...relevantCps.map((c) => c.element), ...recommended]));
      setSelectedElements(els.slice(0, 3));
      setOfficialCpText(relevantCps[0].deskripsi);
    } else {
      setSelectedElements(recommended.slice(0, 3));
      setOfficialCpText(
        `Peserta didik mampu memahami konsep mendasar, menerapkan prosedur/keterampilan ilmiah, dan mengomunikasikan hasil pemikiran/karya nyata dalam mata pelajaran ${subject} Fase D sesuai regulasi BSKAP.`
      );
    }

    // Set topic recommendation if empty or switching standard subjects
    if (subject === 'Bahasa Indonesia') {
      setCoreTopic('Teks Laporan Hasil Observasi (LHO) & Menyimak Kritis');
      setTotalJp(72);
    } else if (subject === 'Matematika') {
      setCoreTopic('Bilangan Bulat, Pecahan, dan Pemodelan Aljabar');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('ipa') || subject.toLowerCase().includes('alam')) {
      setCoreTopic('Hakikat Sains, Pengukuran, dan Klasifikasi Materi');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('ips') || subject.toLowerCase().includes('sosial')) {
      setCoreTopic('Keragaman Sosial, Ekonomi, dan Konektivitas Antar-Ruang');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('inggris')) {
      setCoreTopic('Describing People, Daily Activities & Narrative');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('pancasila')) {
      setCoreTopic('Norma, Hak dan Kewajiban Warga Negara');
      setTotalJp(54);
    } else if (subject.toLowerCase().includes('informatika') || subject.toLowerCase().includes('komputer')) {
      setCoreTopic('Berpikir Komputasional & Algoritma Sederhana');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('pjok') || subject.toLowerCase().includes('olahraga')) {
      setCoreTopic('Keterampilan Gerak Spesifik Permainan Bola Besar');
      setTotalJp(72);
    } else if (subject.toLowerCase().includes('seni')) {
      setCoreTopic('Apresiasi dan Eksplorasi Karya Seni Kontekstual');
      setTotalJp(54);
    } else if (subject.toLowerCase().includes('prakarya')) {
      setCoreTopic('Rancangan dan Pembuatan Produk Kerajinan/Pengolahan');
      setTotalJp(54);
    } else if (subject.toLowerCase().includes('islam') || subject.toLowerCase().includes('agama')) {
      setCoreTopic('Meneladani Nilai Akhlak Mulia dalam Kehidupan Nyata');
      setTotalJp(54);
    } else {
      setCoreTopic(`Konsep Esensial dan Keterampilan Praktik ${subject}`);
      setTotalJp(54);
    }
  }, [subject]);

  if (!isOpen) return null;

  // Retrieve combined CP database (system default + user custom CP)
  let combinedCps: CapaianPembelajaran[] = CP_DATABASE;
  try {
    const stored = localStorage.getItem('custom_cp_database');
    if (stored) {
      combinedCps = JSON.parse(stored);
    }
  } catch (e) {
    // fallback
  }

  const currentSubjectCps = combinedCps.filter((c) =>
    c.subject.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(c.subject.toLowerCase())
  );

  const recommendedElements = getRecommendedElements(subject);

  // Dynamic set of all unique available elements
  const allAvailableElementNames = Array.from(
    new Set([
      ...currentSubjectCps.map((c) => c.element),
      ...recommendedElements,
      ...customElementsList,
      ...selectedElements,
    ])
  );

  const toggleElement = (el: string) => {
    if (selectedElements.includes(el)) {
      if (selectedElements.length > 1) {
        setSelectedElements(selectedElements.filter((item) => item !== el));
      }
    } else {
      setSelectedElements([...selectedElements, el]);
    }
  };

  const handleAddCustomElement = () => {
    const trimmed = newCustomElementInput.trim();
    if (trimmed) {
      if (!allAvailableElementNames.includes(trimmed)) {
        setCustomElementsList((prev) => [...prev, trimmed]);
      }
      if (!selectedElements.includes(trimmed)) {
        setSelectedElements((prev) => [...prev, trimmed]);
      }
      setNewCustomElementInput('');
    }
  };

  // Validation: Check mandatory fields
  const handleProceedToOptionalOrGenerate = () => {
    if (!subject) {
      setErrorWarning('Mata Pelajaran wajib dipilih.');
      return;
    }
    if (!grade) {
      setErrorWarning('Fase / Kelas wajib ditentukan.');
      return;
    }
    if (selectedElements.length === 0) {
      setErrorWarning('Pilih minimal 1 Elemen CP yang akan dianalisis.');
      return;
    }
    if (!totalJp || totalJp <= 0) {
      setErrorWarning('Alokasi Total Jam Pelajaran (JP) harus berupa angka positif.');
      return;
    }

    setErrorWarning(null);
    setStep('input_optional');
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setErrorWarning(null);

    const inputData: CurriculumInput = {
      subject,
      grade,
      semester,
      effectiveWeeks,
      cpElements: selectedElements,
      coreTopic,
      totalJp,
      officialCpText,
      studentReadiness,
      schoolContext,
      learningModel,
      focusMode,
    };

    try {
      const generated = await generateCurriculumPlan(inputData);
      setResult(generated);
      setStep('result');
    } catch (err: any) {
      setErrorWarning(err.message || 'Terjadi kesalahan saat memproses kurikulum.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CP_TP_ATP_${subject.replace(/\s+/g, '_')}_${grade.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDashboard = () => {
    if (!result) return;
    const newDoc: RecentDocument = {
      id: `doc-curriculum-${Date.now()}`,
      title: `Analisis CP, TP & ATP ${subject} - ${coreTopic || 'Materi Pokok'}`,
      subTitle: `Fase D (${grade}) • ${semester} • ${totalJp} JP • Terstandar BSKAP`,
      subject,
      fase: `Fase D (${grade})`,
      status: 'Siap Cetak / PDF',
      lastModified: 'Baru saja disimpan',
      type: 'ATP',
      content: result.markdown,
    };
    onSaveToDocuments(newDoc);
    alert('Dokumen CP, TP, dan ATP berhasil disimpan ke Riwayat Dokumen!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[94vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 px-3 sm:px-6 bg-[#f8faff] border-b border-[#e5eeff]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#00236f] to-[#0051d5] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#00236f] text-[9.5px] sm:text-[10.5px] font-bold">
                  Curriculum Expert
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#0051d5] font-semibold flex items-center gap-1 hidden xs:inline-flex">
                  <span className="material-symbols-outlined text-[12px] sm:text-[13px]">verified</span>
                  BSKAP 033
                </span>
              </div>
              <h2 className="text-xs sm:text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-tight">
                Generator Ahli: Analisis CP, Rumusan TP & Alur ATP
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 bg-white border-b border-[#f1f5f9] text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full">
            <button
              onClick={() => setStep('input_mandatory')}
              className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors ${
                step === 'input_mandatory'
                  ? 'text-[#00236f] border-b-2 border-[#00236f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#eff4ff] text-[#00236f] font-bold flex items-center justify-center text-[10.5px]">
                1
              </span>
              <span>Data Wajib Kurikulum</span>
            </button>

            <button
              onClick={() => handleProceedToOptionalOrGenerate()}
              className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors ${
                step === 'input_optional'
                  ? 'text-[#00236f] border-b-2 border-[#00236f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#eff4ff] text-[#00236f] font-bold flex items-center justify-center text-[10.5px]">
                2
              </span>
              <span>Konteks & Pedagogik (Opsional)</span>
            </button>

            <button
              disabled={!result}
              onClick={() => result && setStep('result')}
              className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors ${
                step === 'result'
                  ? 'text-[#00236f] border-b-2 border-[#00236f]'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#eff4ff] text-[#00236f] font-bold flex items-center justify-center text-[10.5px]">
                3
              </span>
              <span>Hasil Draf Resmi (CP, TP, ATP)</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex text-[11px] text-slate-400 font-medium">
            Tahap {step === 'input_mandatory' ? '1 dari 3' : step === 'input_optional' ? '2 dari 3' : '3 dari 3'}
          </span>
        </div>

        {/* Error Warning */}
        {errorWarning && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorWarning}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#f8f9ff] text-xs">
          {/* STEP 1: MANDATORY DATA */}
          {step === 'input_mandatory' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-slate-700 leading-relaxed">
                <span className="font-bold text-[#00236f] block mb-0.5">
                  Prinsip Wajib Perumusan TP & Alur ATP:
                </span>
                Sesuai panduan kurikulum, data berikut harus diinput secara tepat agar formula Tujuan Pembelajaran mengandung <strong>Kompetensi (Kata Kerja Operasional C1–C6)</strong>, <strong>Konten</strong>, dan <strong>Alokasi Waktu (JP)</strong> yang seimbang tanpa melebihi batas jam pelajaran sekolah.
              </div>

              {/* Grid 1: Subject, Grade, Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <SubjectPicker
                    value={subject}
                    onChange={(newSub) => setSubject(newSub)}
                    label="Mata Pelajaran"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Fase & Kelas (Fase D SMP) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="Kelas VII">Fase D — Kelas VII (Tujuh)</option>
                    <option value="Kelas VIII">Fase D — Kelas VIII (Delapan)</option>
                    <option value="Kelas IX">Fase D — Kelas IX (Sembilan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Semester & Pekan Efektif <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-1/2 p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white cursor-pointer font-semibold"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                    <input
                      type="number"
                      min={10}
                      max={24}
                      value={effectiveWeeks}
                      onChange={(e) => setEffectiveWeeks(parseInt(e.target.value) || 18)}
                      className="w-1/2 p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                      title="Jumlah pekan efektif"
                    />
                  </div>
                </div>
              </div>

              {/* CP Elements Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Elemen Capaian Pembelajaran (CP) Resmi & Kustom <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#0051d5] font-semibold">
                    {selectedElements.length} Elemen terpilih
                  </span>
                </div>
                
                <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {allAvailableElementNames.map((elName) => {
                      const isChecked = selectedElements.includes(elName);
                      // Look up description if from CP database
                      const matchedCp = currentSubjectCps.find((c) => c.element === elName);
                      return (
                        <label
                          key={elName}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-[#eff4ff] border-[#0051d5]'
                              : 'border-slate-200 hover:bg-[#f8f9ff]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleElement(elName)}
                            className="mt-0.5 text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5] rounded"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              {elName}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {matchedCp?.deskripsi || `Elemen capaian untuk materi pokok ${subject}.`}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Add Custom Element Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={newCustomElementInput}
                      onChange={(e) => setNewCustomElementInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomElement();
                        }
                      }}
                      placeholder="+ Ketik & tambah elemen CP sendiri..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-[#f8f9ff]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomElement}
                      className="px-3 py-1.5 rounded-lg bg-[#00236f] hover:bg-[#00174d] text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Tambah Elemen</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Core Topic & Total JP Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    Topik Spesifik / Konsep Inti Fokus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={coreTopic}
                    onChange={(e) => setCoreTopic(e.target.value)}
                    placeholder="Contoh: Teks LHO, Persamaan Aljabar, Ekosistem..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                    required
                  />
                  <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                    Menjadi jangkar perumusan konten pada seluruh Tujuan Pembelajaran (TP).
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Alokasi Waktu (Total JP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={144}
                      value={totalJp}
                      onChange={(e) => setTotalJp(parseInt(e.target.value) || 72)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none pr-10 font-bold text-[#00236f]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[11px]">
                      JP
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                    ATP akan membagi persis {totalJp} JP.
                  </span>
                </div>
              </div>

              {/* Sanity Check Badge */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    fact_check
                  </span>
                  <span className="font-medium">
                    Sanity Check: Alokasi {totalJp} JP terdistribusi pada {effectiveWeeks} pekan efektif (~{Math.round(totalJp / effectiveWeeks)} JP/pekan).
                  </span>
                </div>
                <span className="text-emerald-700 font-bold">Valid & Terukur</span>
              </div>
            </div>
          )}

          {/* STEP 2: OPTIONAL & CONTEXTUAL DATA */}
          {step === 'input_optional' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">
                  Informasi Tambahan Sangat Dianjurkan (Optional Context):
                </span>
                Data di bawah ini membantu perancangan strategi diferensiasi, pemilihan model pembelajaran, dan penyesuaian asesmen agar sesuai realitas kelas Anda.
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Teks Lengkap Capaian Pembelajaran (CP) BSKAP
                </label>
                <textarea
                  rows={3}
                  value={officialCpText}
                  onChange={(e) => setOfficialCpText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  placeholder="Salin atau edit teks CP resmi dari SK BSKAP 033/H/KR/2022..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Kesiapan Belajar Murid (Hasil Asesmen Awal Diagnostik)
                </label>
                <textarea
                  rows={2}
                  value={studentReadiness}
                  onChange={(e) => setStudentReadiness(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  placeholder="Contoh: 30% murid membutuhkan scaffolding membaca, 70% murid aktif praktik..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Konteks & Karakteristik Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    value={schoolContext}
                    onChange={(e) => setSchoolContext(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                    placeholder="Contoh: Dekat pesisir, ada taman sekolah, lab IPA terbatas..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Model Pembelajaran Utama
                  </label>
                  <select
                    value={learningModel}
                    onChange={(e) => setLearningModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                    <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                    <option value="Discovery / Inkuiri Terbimbing">Discovery / Inkuiri Terbimbing</option>
                    <option value="Pembelajaran Kooperatif Kontekstual">Pembelajaran Kooperatif Kontekstual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Fokus Dokumen yang Ingin Diutamakan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'Paket Lengkap (CP-TP-ATP)' },
                    { id: 'cp_analysis', label: 'Fokus Analisis CP' },
                    { id: 'tp_formulation', label: 'Fokus Rumusan TP' },
                    { id: 'atp_flow', label: 'Fokus Alur ATP' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFocusMode(item.id as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        focusMode === item.id
                          ? 'border-[#00236f] bg-[#eff4ff] text-[#00236f] shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT VIEW */}
          {step === 'result' && result && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Mandatory Teacher Judgment Reminder Banner */}
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-xs flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex flex-col">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                    Peringatan Wajib Guru (Mandatory Teacher Validation):
                  </h4>
                  <p className="text-xs leading-relaxed mt-0.5">
                    Hasil rancangan di bawah ini berfungsi sebagai <strong>DRAF AWAL (Initial Draft)</strong> berbasis standar BSKAP 033/H/KR/2022 & Taksonomi Bloom Revisi. Guru pengampu wajib melakukan penelaahan kritis, memvalidasi dengan kondisi riil murid, dan menyesuaikan rincian sesuai diskresi profesional serta kalender pendidikan sekolah.
                  </p>
                </div>
              </div>

              {/* Result Filter Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setActiveResultTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeResultTab === 'all'
                        ? 'bg-[#00236f] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Semua Dokumen
                  </button>
                  <button
                    onClick={() => setActiveResultTab('cp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeResultTab === 'cp'
                        ? 'bg-[#00236f] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    1. Analisis CP
                  </button>
                  <button
                    onClick={() => setActiveResultTab('tp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeResultTab === 'tp'
                        ? 'bg-[#00236f] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    2. Rumusan TP
                  </button>
                  <button
                    onClick={() => setActiveResultTab('atp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeResultTab === 'atp'
                        ? 'bg-[#00236f] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    3. Matriks ATP
                  </button>
                  <button
                    onClick={() => setActiveResultTab('notes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeResultTab === 'notes'
                        ? 'bg-[#00236f] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    4. Rekomendasi
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Engine: {result.source === 'gemini_ai' ? 'Gemini 3.8 Flash AI' : 'Kurikulum BSKAP Engine'}
                  </span>
                </div>
              </div>

              {/* Formatted Markdown Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs overflow-x-auto text-slate-800 font-sans leading-relaxed text-xs">
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800">
                  {result.markdown}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 px-3 sm:px-6 border-t border-[#e5eeff] bg-[#f8faff] gap-2">
          {step === 'input_mandatory' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProceedToOptionalOrGenerate}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>Lanjut ke Konteks & Generator ➔</span>
              </button>
            </div>
          )}

          {step === 'input_optional' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => setStep('input_mandatory')}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateDocument}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px] sm:text-[18px]">
                      progress_activity
                    </span>
                    <span>Menyusun Dokumen...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">psychology</span>
                    <span>Generate CP, TP & ATP ➔</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'result' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input_mandatory')}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Ubah Parameter
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                    {copiedToast ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedToast ? 'Tersalin!' : 'Salin'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">download</span>
                  <span>Unduh</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#00236f] text-[#00236f] hover:bg-[#eff4ff] text-[11px] sm:text-xs font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bookmark_added</span>
                  <span>Simpan Arsip</span>
                </button>

                {onProceedToModulAjar && (
                  <button
                    type="button"
                    onClick={() => {
                      onProceedToModulAjar(
                        subject,
                        `Peserta didik mampu menganalisis konsep ${coreTopic || subject} dan menyusun karya nyata solutif secara kritis dan mandiri.`
                      );
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:scale-[1.01] transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">auto_stories</span>
                    <span>Lanjut ke Modul Ajar ➔</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
