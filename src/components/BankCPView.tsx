import React, { useState, useEffect } from 'react';
import { CP_DATABASE } from '../data/kurikulumData';
import { CapaianPembelajaran } from '../types';
import { SubjectPicker } from './SubjectPicker';
import { getAllSubjects, saveCustomSubject } from '../utils/subjectManager';

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
  const [allSubjectsList, setAllSubjectsList] = useState<string[]>(getAllSubjects());
  const [cpList, setCpList] = useState<CapaianPembelajaran[]>(() => {
    try {
      const stored = localStorage.getItem('custom_cp_database');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Gagal membaca custom_cp_database:', e);
    }
    return CP_DATABASE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCp, setEditingCp] = useState<CapaianPembelajaran | null>(null);
  const [formSubject, setFormSubject] = useState('Bahasa Indonesia');
  const [formElement, setFormElement] = useState('');
  const [formCode, setFormCode] = useState('SK BSKAP Revisi 2024');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTpLines, setFormTpLines] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setAllSubjectsList(getAllSubjects());
    };
    window.addEventListener('subjects_updated', handleUpdate);
    return () => window.removeEventListener('subjects_updated', handleUpdate);
  }, []);

  const subjects = Array.from(new Set(['Semua', ...allSubjectsList, ...cpList.map((c) => c.subject)]));

  const filtered = cpList.filter((cp) => {
    const matchSubject = selectedSubject === 'Semua' || cp.subject === selectedSubject;
    const matchSearch =
      !search ||
      cp.element.toLowerCase().includes(search.toLowerCase()) ||
      cp.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
      cp.subject.toLowerCase().includes(search.toLowerCase()) ||
      cp.code.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingCp(null);
    setFormSubject(selectedSubject === 'Semua' ? 'Bahasa Indonesia' : selectedSubject);
    setFormElement('');
    setFormCode('SK BSKAP No. 033/H/KR/2024 & Revisi');
    setFormDeskripsi('');
    setFormTpLines('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cp: CapaianPembelajaran) => {
    setEditingCp(cp);
    setFormSubject(cp.subject);
    setFormElement(cp.element);
    setFormCode(cp.code);
    setFormDeskripsi(cp.deskripsi);
    setFormTpLines(cp.tujuanPembelajaran.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveCp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formElement.trim() || !formDeskripsi.trim()) {
      alert('Nama elemen dan deskripsi CP wajib diisi.');
      return;
    }

    const tpArray = formTpLines
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let updatedList: CapaianPembelajaran[];
    saveCustomSubject(formSubject);

    if (editingCp) {
      updatedList = cpList.map((item) =>
        item.id === editingCp.id
          ? {
              ...item,
              subject: formSubject,
              element: formElement,
              code: formCode,
              deskripsi: formDeskripsi,
              tujuanPembelajaran: tpArray.length > 0 ? tpArray : ['Menentukan dan menguasai kompetensi esensial materi.'],
            }
          : item
      );
      setToastMessage(`Capaian Pembelajaran "${formElement}" berhasil diperbarui.`);
    } else {
      const newCp: CapaianPembelajaran = {
        id: `cp-custom-${Date.now()}`,
        subject: formSubject,
        element: formElement,
        fase: 'Fase D (Kelas VII-IX)',
        code: formCode,
        deskripsi: formDeskripsi,
        tujuanPembelajaran: tpArray.length > 0 ? tpArray : ['Menentukan dan menguasai kompetensi esensial materi.'],
      };
      updatedList = [newCp, ...cpList];
      setToastMessage(`Capaian Pembelajaran "${formElement}" berhasil ditambahkan.`);
    }

    setCpList(updatedList);
    try {
      localStorage.setItem('custom_cp_database', JSON.stringify(updatedList));
    } catch (err) {
      console.error('Gagal menyimpan ke localStorage:', err);
    }
    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh Bank Capaian Pembelajaran ke regulasi standar resmi BSKAP?')) {
      setCpList(CP_DATABASE);
      localStorage.removeItem('custom_cp_database');
      setToastMessage('Bank CP telah dikembalikan ke standar regulasi BSKAP.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[22px] sm:text-[24px]">
              menu_book
            </span>
            <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
              Bank Capaian Pembelajaran (CP) Resmi & Fleksibel
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5 sm:mt-1">
            Database lengkap Capaian Pembelajaran Fase D (Kelas 7-9 SMP). Terintegrasi SK BSKAP terbaru dan siap disesuaikan jika pusat merilis pembaruan regulasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:scale-[1.01] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Sesuaikan / Tambah CP Baru</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 text-[11px] sm:text-xs font-semibold transition-colors"
            title="Kembalikan ke standar awal BSKAP"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span className="hidden sm:inline">Reset Standar</span>
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filtered.map((cp) => (
          <div
            key={cp.id}
            className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#00236f] text-[10.5px] sm:text-[11px] font-bold border border-[#dce9ff]">
                  {cp.subject}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">
                    {cp.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cp)}
                    className="p-1 rounded text-slate-400 hover:text-[#0051d5] hover:bg-slate-100 transition-colors"
                    title="Ubah / Perbarui Teks CP ini"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] mb-0.5">
                Elemen: {cp.element}
              </h3>
              <span className="text-[10.5px] sm:text-[11px] text-slate-500 block mb-2 font-medium">
                {cp.fase}
              </span>

              <p className="text-[11.5px] sm:text-xs text-slate-700 leading-relaxed bg-[#f8f9ff] p-3 rounded-xl border border-slate-100 mb-3">
                {cp.deskripsi}
              </p>

              <div className="space-y-1.5 mb-4">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-700 block">
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

            <div className="pt-2.5 sm:pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(cp)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#00236f]"
              >
                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                <span>Edit Regulasi</span>
              </button>

              <div className="flex items-center gap-1.5">
                {onOpenCurriculumExpert && (
                  <button
                    type="button"
                    onClick={() => onOpenCurriculumExpert(cp.subject, 'cp_analysis')}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white font-bold text-[11px] sm:text-xs shadow-xs hover:scale-[1.01] transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">psychology</span>
                    <span>Analisis CP & Rancang ATP</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectCpForGenerator(cp.subject)}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[11px] sm:text-xs transition-all border border-[#dce9ff]"
                >
                  <span>Buat Modul</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog: Tambah / Edit CP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 px-5 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {editingCp ? 'edit_note' : 'add_circle'}
                </span>
                <h3 className="font-bold text-sm sm:text-base font-['Plus_Jakarta_Sans']">
                  {editingCp ? 'Perbarui Capaian Pembelajaran (CP)' : 'Tambah Capaian Pembelajaran (CP) Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCp} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <SubjectPicker
                    value={formSubject}
                    onChange={(newSub) => setFormSubject(newSub)}
                    label="Mata Pelajaran"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nama Elemen</label>
                  <input
                    type="text"
                    value={formElement}
                    onChange={(e) => setFormElement(e.target.value)}
                    placeholder="Contoh: Menyimak, Aljabar, Ekologi..."
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0051d5]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Nomor Referensi SK / Regulasi BSKAP
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Contoh: SK BSKAP No. 033/H/KR/2024 atau SK Revisi Baru"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0051d5]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Teks Resmi Capaian Pembelajaran (CP) dari Pusat
                </label>
                <textarea
                  rows={4}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Salin dan tempel kalimat CP per elemen sesuai edaran / SK Kepala BSKAP resmi..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs leading-relaxed focus:ring-1 focus:ring-[#0051d5]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Contoh Alur / Tujuan Pembelajaran (TP) (Opsional, 1 baris per TP)
                </label>
                <textarea
                  rows={3}
                  value={formTpLines}
                  onChange={(e) => setFormTpLines(e.target.value)}
                  placeholder="Masukkan contoh TP atau biarkan kosong agar AI merumuskannya secara otomatis..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs shadow-xs"
                >
                  {editingCp ? 'Simpan Pembaruan CP' : 'Simpan CP Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
