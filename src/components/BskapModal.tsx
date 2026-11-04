import React from 'react';

interface BskapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BskapModal: React.FC<BskapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#e5eeff] bg-[#f8faff]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                Salinan Panduan SK BSKAP No. 033/H/KR/2024
              </h3>
              <p className="text-xs text-[#444651]">
                Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Menengah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <h4 className="font-bold text-[#00236f] text-sm mb-1">
              Prinsip Pokok Fase D (SMP Kelas VII, VIII, IX)
            </h4>
            <p className="text-[#444651] leading-relaxed">
              Fase D dirancang untuk murid usia 13–15 tahun yang berada pada masa transisi remaja. Pembelajaran menekankan penalaran kritis (HOTS), penguatan literasi dan numerasi kontekstual, serta pembiasaan Profil Pelajar Pancasila secara nyata.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              3 Pilar Utama Administrasi Pembelajaran:
            </h4>

            <div className="p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-[#1e3a8a] block">
                1. Penyelarasan CP ➔ TP ➔ ATP
              </span>
              <p className="mt-0.5 text-slate-600">
                Tujuan Pembelajaran diturunkan langsung dari elemen Capaian Pembelajaran resmi dengan memuat kompetensi operasional (Kata Kerja Operasional) dan materi esensial. Alur Tujuan Pembelajaran disusun secara runtut dan logis.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-[#1e3a8a] block">
                2. Pembelajaran Berdiferensiasi
              </span>
              <p className="mt-0.5 text-slate-600">
                Penyusunan Modul Ajar wajib mengakomodasi diferensiasi konten (bahan ajar beragam), diferensiasi proses (scaffolding bagi yang membutuhkan), dan diferensiasi produk (ragam bentuk karya murid).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-[#1e3a8a] block">
                3. Asesmen Berkelanjutan (Formative-Driven)
              </span>
              <p className="mt-0.5 text-slate-600">
                Pemberian umpan balik (feedback) secara berkala selama kegiatan inti berlangsung lebih diutamakan ketimbang tes angka sumatif semata.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5eeff] bg-[#f8faff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00236f] text-white font-bold text-xs hover:bg-[#1e3a8a] transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
