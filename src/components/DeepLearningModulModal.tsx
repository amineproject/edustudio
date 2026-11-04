import React, { useState, useEffect } from 'react';
import { CP_DATABASE } from '../data/kurikulumData';
import { DeepLearningInput, DeepLearningResult, generateDeepLearningModul } from '../utils/deepLearningEngine';
import { RecentDocument, TeacherProfile } from '../types';
import { SubjectPicker } from './SubjectPicker';
import { getRecommendedElements } from '../utils/subjectManager';

interface DeepLearningModulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: RecentDocument) => void;
  onProceedToAssessment?: (subject: string, tp: string, topic: string) => void;
  profile: TeacherProfile;
  initialSubject?: string;
  initialTp?: string;
}

export const DeepLearningModulModal: React.FC<DeepLearningModulModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  onProceedToAssessment,
  profile,
  initialSubject = 'Bahasa Indonesia',
  initialTp = '',
}) => {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [subject, setSubject] = useState(initialSubject);
  const [grade, setGrade] = useState('Kelas VII');
  const [semester, setSemester] = useState('Genap');
  const [topic, setTopic] = useState('');
  const [targetTp, setTargetTp] = useState(initialTp);
  const [cpElement, setCpElement] = useState('');
  const [meetingsCount, setMeetingsCount] = useState(2);
  const [durationPerMeeting, setDurationPerMeeting] = useState('2 Pertemuan x 40 Menit (4 JP)');
  const [totalStudents, setTotalStudents] = useState(32);
  const [studentCharacteristics, setStudentCharacteristics] = useState(
    'Taraf perkembangan remaja awal (usia 13–15 tahun); minat beragam, gaya belajar visual dan kinestetik mendominasi, dengan 25% murid memerlukan bimbingan membaca intensif.'
  );
  const [initialCompetency, setInitialCompetency] = useState(
    'Peserta didik telah memahami konsep dasar observasi lingkungan dan mampu menulis kalimat efektif.'
  );
  const [facilities, setFacilities] = useState(
    'LCD Proyektor, laptop, LKPD investigasi cetak, taman sekolah, dan bahan referensi perpustakaan.'
  );
  const [learningModel, setLearningModel] = useState('Problem Based Learning (PBL)');
  const [localContext, setLocalContext] = useState(
    'Eksplorasi ekosistem taman sekolah dan kearifan budaya nusantara'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<DeepLearningResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'skenario' | 'lkpd' | 'rubrik' | 'diferensiasi'>('all');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const subLower = subject.toLowerCase();
    const recommended = getRecommendedElements(subject);

    if (subLower.includes('indonesia')) {
      setTopic('Teks Laporan Hasil Observasi (LHO) - Eksplorasi Keanekaragaman Hayati');
      setCpElement('Menyimak & Menulis');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu menganalisis struktur teks LHO dan menyusun laporan observasi ilmiah secara kritis dan orisinal.');
      }
    } else if (subLower.includes('matematika')) {
      setTopic('Persamaan Linier Satu Variabel & Penerapan Jual Beli Pasar Tradisional');
      setCpElement('Aljabar & Bilangan');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu memodelkan situasi nyata ke dalam persamaan aljabar dan menyelesaikannya secara akurat.');
      }
    } else if (subLower.includes('ipa') || subLower.includes('alam')) {
      setTopic('Klasifikasi Makhluk Hidup & Investigasi Ekosistem Mikro');
      setCpElement('Pemahaman IPA & Keterampilan Proses');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu merancang penyelidikan ilmiah menggunakan mikroskop dan mengklasifikasikan spesimen flora/fauna lokal.');
      }
    } else if (subLower.includes('ips') || subLower.includes('sosial')) {
      setTopic('Keragaman Sosial Budaya & Interaksi Ekonomi Antar-Wilayah');
      setCpElement('Pemahaman Konsep & Keterampilan Inkuiri');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu menganalisis pengaruh kondisi geografis terhadap aktivitas ekonomi dan keragaman sosial budaya.');
      }
    } else if (subLower.includes('inggris')) {
      setTopic('Describing People, Daily Activities & Personal Routine');
      setCpElement('Listening & Speaking');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu bertukar ide dan mendeskripsikan aktivitas harian dengan kosakata dan tata bahasa yang tepat.');
      }
    } else if (subLower.includes('informatika') || subLower.includes('komputer')) {
      setTopic('Berpikir Komputasional & Perancangan Solusi Algoritmik');
      setCpElement('Berpikir Komputasional & Algoritma');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu merumuskan persoalan kontekstual melalui dekomposisi dan menghasilkan algoritma terstruktur.');
      }
    } else if (subLower.includes('pjok') || subLower.includes('olahraga')) {
      setTopic('Keterampilan Gerak Spesifik Permainan Invasi dan Kebugaran');
      setCpElement('Keterampilan Gerak & Pemanfaatan Gerak');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu mempraktikkan keterampilan gerak spesifik dan menginternalisasi nilai sportivitas.');
      }
    } else if (subLower.includes('pancasila')) {
      setTopic('Penguatan Nilai-nilai Gotong Royong dalam Kehidupan Bermasyarakat');
      setCpElement('Pancasila & UUD NRI 1945');
      if (!initialTp) {
        setTargetTp('Peserta didik mampu mengidentifikasi dan mempraktikkan norma hukum dan kebiasaan santun di lingkungan sekolah.');
      }
    } else {
      setTopic(`Eksplorasi Konsep Esensial dan Studi Kasus ${subject}`);
      setCpElement(recommended.slice(0, 2).join(' & '));
      if (!initialTp) {
        setTargetTp(`Peserta didik mampu memahami konsep mendasar, menerapkan prosedur pemecahan masalah, dan menyajikan refleksi bermakna dalam materi ${subject}.`);
      }
    }
  }, [subject, initialTp]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    const input: DeepLearningInput = {
      schoolName: profile.school,
      teacherName: profile.name,
      nip: profile.nip,
      subject,
      grade,
      semester,
      academicYear: profile.academicYear,
      topic,
      targetTp,
      cpElement,
      meetingsCount,
      durationPerMeeting,
      totalStudents,
      studentCharacteristics,
      initialCompetency,
      facilities,
      learningModel,
      localContext,
      headmasterName: profile.headmaster,
      headmasterNip: profile.headmasterNip,
    };

    try {
      const generated = await generateDeepLearningModul(input);
      setResult(generated);
      setStep('preview');
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
    link.download = `Modul_Ajar_DeepLearning_${subject.replace(/\s+/g, '_')}_${topic.slice(0, 20).replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDashboard = () => {
    if (!result) return;
    const newDoc: RecentDocument = {
      id: `doc-deep-${Date.now()}`,
      title: `Modul Ajar Deep Learning: ${topic}`,
      subTitle: `Fase D (${grade}) • Kerangka 8-3-3-4 • ${meetingsCount} Pertemuan`,
      subject,
      fase: `Fase D (${grade})`,
      status: 'Siap Cetak / PDF',
      lastModified: 'Baru saja disusun',
      type: 'Modul Ajar',
      content: result.markdown,
    };
    onSaveDocument(newDoc);
    alert('Modul Ajar Deep Learning berhasil disimpan ke Riwayat Dokumen!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[95vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 px-3.5 sm:px-6 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">auto_stories</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-[#00236f] text-[9.5px] sm:text-[10px] font-bold">
                  Kerangka 8-3-3-4
                </span>
                <span className="text-[10px] sm:text-[11px] text-blue-100 font-medium hidden xs:inline">
                  Deep Thinking • Meaningful • Application
                </span>
              </div>
              <h2 className="text-xs sm:text-base font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                Penyusun Modul Ajar Deep Learning
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

        {/* Tab Switcher */}
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
              1. Parameter Deep Learning
            </button>
            <button
              disabled={!result}
              onClick={() => result && setStep('preview')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                step === 'preview'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px]">description</span>
              2. Dokumen Lengkap (A – M)
            </button>
          </div>

          <span className="text-[11px] text-[#0051d5] font-semibold hidden md:inline shrink-0">
            Terintegrasi ATP Modul 1
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-[#f8f9ff] text-xs">
          {step === 'input' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Pillar Notice */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0051d5] text-[22px] mt-0.5 shrink-0">
                  psychology
                </span>
                <div className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#00236f] block">
                    Fondasi 3 Pilar Pembelajaran Mendalam (Deep Learning):
                  </span>
                  Modul ini secara otomatis menyusun skenario 3 Pengalaman Belajar: <strong>Tahap 1: Memahami</strong> (*Deep Thinking*), <strong>Tahap 2: Mengaplikasikan</strong> (*Meaningful Practice*), dan <strong>Tahap 3: Merefleksikan</strong> (*Reflective Dialogue*) lengkap dengan LKPD, Asesmen, dan Rubrik Skala 1–4.
                </div>
              </div>

              {/* Grid 1: Subject, Grade, Model */}
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
                  <label className="font-bold text-slate-800 block mb-1">Fase & Kelas</label>
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
                  <label className="font-bold text-slate-800 block mb-1">Model Pembelajaran</label>
                  <select
                    value={learningModel}
                    onChange={(e) => setLearningModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                  >
                    <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                    <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                    <option value="Discovery Learning">Discovery Learning</option>
                    <option value="Inkuiri Kontekstual">Inkuiri Kontekstual</option>
                  </select>
                </div>
              </div>

              {/* Topic & Specific TP */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Topik Pembelajaran Kontekstual <span className="text-rose-500">*</span>
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
                    placeholder="Salin atau ketikkan rumusan TP yang telah disusun pada tahap ATP..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                    required
                  />
                  <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                    Menjadi fondasi utama perancangan skenario 3 Pengalaman Belajar & rubrik penilaian.
                  </span>
                </div>
              </div>

              {/* Meeting count & local context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Alokasi Waktu Pertemuan
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={meetingsCount}
                      onChange={(e) => setMeetingsCount(parseInt(e.target.value) || 2)}
                      className="w-1/2 p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold"
                    >
                      <option value={1}>1 Pertemuan</option>
                      <option value={2}>2 Pertemuan</option>
                      <option value={3}>3 Pertemuan</option>
                      <option value={4}>4 Pertemuan</option>
                    </select>
                    <input
                      type="text"
                      value={durationPerMeeting}
                      onChange={(e) => setDurationPerMeeting(e.target.value)}
                      placeholder="e.g. 2 x 40 Menit"
                      className="w-1/2 p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Konteks Lingkungan & Kearifan Lokal
                  </label>
                  <input
                    type="text"
                    value={localContext}
                    onChange={(e) => setLocalContext(e.target.value)}
                    placeholder="Contoh: Taman sekolah, kuliner tradisional, lingkungan sekitar..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Student Characteristics & Facilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Karakteristik & Kesiapan Murid
                  </label>
                  <textarea
                    rows={2}
                    value={studentCharacteristics}
                    onChange={(e) => setStudentCharacteristics(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Sarana & Prasarana Pendukung
                  </label>
                  <textarea
                    rows={2}
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            result && (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Initial Draft Reminder Banner */}
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-xs flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      Pengingat Profesional Guru:
                    </h4>
                    <p className="text-xs leading-relaxed mt-0.5">
                      Modul Ajar ini adalah <strong>DRAF AWAL (Initial Draft)</strong> berbasis pendekatan <em>Deep Learning</em> 8-3-3-4. Anda dipersilakan mengadaptasi alokasi menit, pertanyaan pemantik, dan jenis produk sesuai dinamika nyata peserta didik di kelas Anda.
                    </p>
                  </div>
                </div>

                {/* Markdown Box */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs overflow-x-auto text-slate-800 font-sans leading-relaxed text-xs">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800">
                    {result.markdown}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
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
                    <span>Menyusun Modul...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">auto_stories</span>
                    <span>Generate Modul Deep Learning ➔</span>
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

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#00236f] text-[#00236f] hover:bg-[#eff4ff] text-[11px] sm:text-xs font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bookmark_added</span>
                  <span>Simpan Arsip</span>
                </button>

                {onProceedToAssessment && (
                  <button
                    type="button"
                    onClick={() => {
                      onProceedToAssessment(subject, targetTp, topic);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:scale-[1.01] transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">fact_check</span>
                    <span>Lanjut ke Asesmen (Modul 3) ➔</span>
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
