import React, { useState, useEffect } from 'react';
import { AssessmentInput, AssessmentResult, generateAssessmentPlan } from '../utils/assessmentEngine';
import { RecentDocument, TeacherProfile } from '../types';
import { SubjectPicker } from './SubjectPicker';
import { getRecommendedElements } from '../utils/subjectManager';

interface AssessmentEvaluasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: RecentDocument) => void;
  profile: TeacherProfile;
  initialSubject?: string;
  initialTp?: string;
  initialTopic?: string;
}

export const AssessmentEvaluasiModal: React.FC<AssessmentEvaluasiModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  profile,
  initialSubject = 'Bahasa Indonesia',
  initialTp = '',
  initialTopic = '',
}) => {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [subject, setSubject] = useState(initialSubject);
  const [grade, setGrade] = useState('Kelas VII');
  const [semester, setSemester] = useState('Genap');
  const [topic, setTopic] = useState(initialTopic);
  const [targetTp, setTargetTp] = useState(initialTp);
  const [cpElement, setCpElement] = useState('');
  const [assessmentForm, setAssessmentForm] = useState('Tes Tertulis (PG & Uraian HOTS)');
  const [kktpApproach, setKktpApproach] = useState('Rubrik Skala Kualitatif');
  const [durationMinutes, setDurationMinutes] = useState(80);
  const [localStimulus, setLocalStimulus] = useState(
    'Data keanekaragaman flora lokal di lingkungan sekolah dan studi kasus kemasyarakatan'
  );
  const [schoolContext, setSchoolContext] = useState(profile.school);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const subLower = subject.toLowerCase();
    const recommended = getRecommendedElements(subject);

    if (subLower.includes('indonesia')) {
      if (!initialTopic) setTopic('Teks Laporan Hasil Observasi (LHO) Lingkungan Hidup');
      setCpElement('Menyimak & Menulis');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu menganalisis struktur dan kaidah kebahasaan teks LHO serta menyusun teks observasi objektif berbasis fakta.');
      }
    } else if (subLower.includes('matematika')) {
      if (!initialTopic) setTopic('Operasi Aljabar & Persamaan Linear Satu Variabel');
      setCpElement('Aljabar & Bilangan');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu memodelkan situasi matematis kontekstual ke dalam bentuk aljabar dan menyelesaikannya secara presisi.');
      }
    } else if (subLower.includes('ipa') || subLower.includes('alam')) {
      if (!initialTopic) setTopic('Klasifikasi Makhluk Hidup & Ekosistem Mikro');
      setCpElement('Pemahaman Sains & Keterampilan Proses');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu mengklasifikasikan spesimen makhluk hidup berdasarkan karakteristik morfologis dan mikroskopis.');
      }
    } else if (subLower.includes('ips') || subLower.includes('sosial')) {
      if (!initialTopic) setTopic('Konektivitas Antar-Ruang dan Dampak Ekonomi Masyarakat');
      setCpElement('Pemahaman Konsep & Inkuiri');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu menganalisis pengaruh interaksi keruangan terhadap pemenuhan kebutuhan ekonomi dan pelestarian lingkungan.');
      }
    } else if (subLower.includes('inggris')) {
      if (!initialTopic) setTopic('Descriptive Text & Daily Routines Communication');
      setCpElement('Reading & Writing');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu menganalisis unsur kebahasaan dan struktur teks deskriptif serta menyusun teks deskripsi tertulis.');
      }
    } else if (subLower.includes('informatika') || subLower.includes('komputer')) {
      if (!initialTopic) setTopic('Analisis Masalah Komputasional dan Pemodelan Data');
      setCpElement('Berpikir Komputasional & Algoritma');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu memecahkan persoalan komputasi logis dan merancang representasi algoritma terstruktur.');
      }
    } else {
      if (!initialTopic) setTopic(`Asesmen Kompetensi Pokok ${subject}`);
      setCpElement(recommended.slice(0, 2).join(' & '));
      if (!initialTp) {
        setTargetTp(`Peserta didik mampu membuktikan penguasaan konsep, penalaran analitis, dan penerapan keterampilan nyata dalam mata pelajaran ${subject}.`);
      }
    }
  }, [subject, initialTopic, initialTp]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    const input: AssessmentInput = {
      subject,
      grade,
      semester,
      targetTp,
      cpElement,
      topic,
      assessmentForm,
      kktpApproach,
      durationMinutes,
      schoolContext,
      localStimulus,
    };

    try {
      const generated = await generateAssessmentPlan(input);
      setResult(generated);
      setStep('result');
    } catch (err) {
      console.error(err);
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

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Instrumen_Asesmen_${subject.replace(/\s+/g, '_')}_${topic.slice(0, 20).replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDashboard = () => {
    if (!result) return;
    const newDoc: RecentDocument = {
      id: `doc-asesmen-${Date.now()}`,
      title: `Instrumen Asesmen HOTS & KKTP: ${topic}`,
      subTitle: `Fase D (${grade}) • ${assessmentForm} • Deskripsi Rapor Kurikulum Merdeka`,
      subject,
      fase: `Fase D (${grade})`,
      status: 'Selesai',
      lastModified: 'Baru saja dirancang',
      type: 'Asesmen',
      content: result.markdown,
    };
    onSaveDocument(newDoc);
    alert('Instrumen Asesmen dan Pedoman Rapor berhasil disimpan ke Riwayat Dokumen!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[95vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 px-3.5 sm:px-6 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">fact_check</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-[#00236f] text-[9.5px] sm:text-[10px] font-bold">
                  Modul 3: Asesmen
                </span>
                <span className="text-[10px] sm:text-[11px] text-blue-100 font-medium hidden xs:inline">
                  Kisi-Kisi HOTS • Rubrik • KKTP Rapor
                </span>
              </div>
              <h2 className="text-xs sm:text-base font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                Perancang Asesmen & KKTP Rapor SMP
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[22px]">close</span>
          </button>
        </div>

        {/* Tab Stepper */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 bg-[#f8faff] border-b border-[#e5eeff] text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full">
            <button
              onClick={() => setStep('input')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                step === 'input'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px]">tune</span>
              1. Parameter Asesmen
            </button>
            <button
              disabled={!result}
              onClick={() => result && setStep('result')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                step === 'result'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px]">fact_check</span>
              2. Dokumen Asesmen & KKTP
            </button>
          </div>

          <span className="text-[11px] text-[#0051d5] font-semibold hidden md:inline shrink-0">
            Selaras Tiga Arah
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-[#f8f9ff] text-xs">
          {step === 'input' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Educational Rule Banner */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0051d5] text-[22px] mt-0.5 shrink-0">
                  assignment_turned_in
                </span>
                <div className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#00236f] block">
                    Prinsip Evaluasi Kurikulum Merdeka SMP:
                  </span>
                  Asesmen formatif hanya berfungsi sebagai <strong>umpan balik proses</strong> dan tidak digunakan untuk menghitung nilai rapor. Rapor Kurikulum Merdeka menggunakan <strong>Deskripsi Capaian Kompetensi</strong> berdasarkan KKTP, bukan angka atau formula konversi matematis.
                </div>
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
                  <label className="font-bold text-slate-800 block mb-1">Fase / Kelas</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                  >
                    <option value="Kelas VII">Fase D — Kelas VII</option>
                    <option value="Kelas VIII">Fase D — Kelas VIII</option>
                    <option value="Kelas IX">Fase D — Kelas IX</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              {/* Specific TP and Topic */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Topik / Materi Pembelajaran yang Diases <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none font-semibold text-[#00236f]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Tujuan Pembelajaran (TP) Spesifik dari ATP Modul 1 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={targetTp}
                    onChange={(e) => setTargetTp(e.target.value)}
                    placeholder="Rumusan Tujuan Pembelajaran yang diuji ketercapaiannya..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                    required
                  />
                  <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                    Setiap butir soal sumatif dan kriteria KKTP akan ditautkan secara langsung ke TP ini.
                  </span>
                </div>
              </div>

              {/* Assessment Form & KKTP Approach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Bentuk Asesmen Sumatif
                  </label>
                  <select
                    value={assessmentForm}
                    onChange={(e) => setAssessmentForm(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                  >
                    <option value="Tes Tertulis (PG & Uraian HOTS)">Tes Tertulis (PG & Uraian HOTS)</option>
                    <option value="Asesmen Kinerja / Praktik">Asesmen Kinerja / Praktik</option>
                    <option value="Penugasan Proyek">Penugasan Proyek</option>
                    <option value="Portofolio Karya">Portofolio Karya</option>
                    <option value="Kombinasi Tes & Kinerja">Kombinasi Tes & Kinerja</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Pendekatan KKTP Sekolah
                  </label>
                  <select
                    value={kktpApproach}
                    onChange={(e) => setKktpApproach(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                  >
                    <option value="Rubrik Skala Kualitatif">Rubrik Skala Kualitatif (Mahir, Cakap, Layak, Perlu Bimbingan)</option>
                    <option value="Deskripsi Kriteria">Deskripsi Kriteria Ketuntasan</option>
                    <option value="Interval Nilai">Interval Nilai Ketercapaian</option>
                  </select>
                </div>
              </div>

              {/* Stimulus Context & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    Stimulus Kontekstual Soal (Kearifan Lokal / Realita)
                  </label>
                  <input
                    type="text"
                    value={localStimulus}
                    onChange={(e) => setLocalStimulus(e.target.value)}
                    placeholder="Contoh: Studi kasus lingkungan pesisir, data konsumsi kantin, artikel berita lokal..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Alokasi Waktu Asesmen
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={30}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 80)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none pr-14 font-bold text-[#00236f]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[11px]">
                      Menit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            result && (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Initial Draft Banner */}
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-xs flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      Peringatan Validasi Asesmen Guru:
                    </h4>
                    <p className="text-xs leading-relaxed mt-0.5">
                      Dokumen evaluasi ini adalah <strong>DRAF AWAL</strong>. Guru pengampu dianjurkan melakukan telaah kisi-kisi, memastikan kejelasan stimulus soal HOTS, dan menyesuaikan kriteria ketuntasan dengan kebijakan kurikulum operasional sekolah (KOSP).
                    </p>
                  </div>
                </div>

                {/* Markdown Output */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs overflow-x-auto text-slate-800 font-sans leading-relaxed text-xs">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800">
                    {result.markdown}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 px-3 sm:px-6 border-t border-[#e5eeff] bg-[#f8faff] gap-2">
          {step === 'input' ? (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px] sm:text-[18px]">
                      progress_activity
                    </span>
                    <span>Menyusun Asesmen...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">fact_check</span>
                    <span>Generate Asesmen & KKTP ➔</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Ubah Parameter
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                    {copiedToast ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedToast ? 'Tersalin!' : 'Salin'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">download</span>
                  <span>Unduh</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  className="inline-flex items-center gap-1 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bookmark_added</span>
                  <span>Simpan ke Bank Asesmen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
