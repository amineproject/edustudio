import React from 'react';

interface BantuanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BantuanModal: React.FC<BantuanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Bagaimana cara menghasilkan Modul Ajar berdiferensiasi secara instan?',
      a: 'Klik tombol "+ Dokumen Baru Cepat" di dashboard, pilih mata pelajaran dan jenis perangkat "Modul Ajar / RPP+", lalu centang elemen CP yang ingin dibahas. Sistem akan otomatis menyusun pemahaman bermakna, pertanyaan pemantik, dan skenario 3 diferensiasi (konten, proses, produk).',
    },
    {
      q: 'Apakah dokumen yang dihasilkan sesuai standar BSKAP terbaru?',
      a: 'Ya, seluruh basis data Capaian Pembelajaran dan format modul dalam platform ini telah diselaraskan dengan Keputusan Kepala BSKAP No. 033/H/KR/2024 untuk jenjang SMP (Fase D).',
    },
    {
      q: 'Bagaimana cara mengekspor dokumen ke format Word atau PDF?',
      a: 'Setelah dokumen selesai di-generate, klik "Unduh Berkas" untuk mengunduh naskah, atau klik "Cetak" untuk langsung mencetak atau menyimpannya sebagai file PDF.',
    },
    {
      q: 'Dapatkah saya mengubah data nama guru, NIP, dan kepala sekolah?',
      a: 'Buka menu "Pengaturan & Profil Sekolah" pada bilah navigasi kiri. Seluruh data identitas akan otomatis tersimpan dan diterapkan pada kop lembar pengesahan perangkat ajar.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#e5eeff] bg-[#f8faff]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                Pusat Bantuan & Panduan Guru
              </h3>
              <p className="text-xs text-[#444651]">
                Petunjuk penggunaan platform EduStudio Kurikulum Merdeka SMP
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

        {/* FAQs */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-[#eff4ff] rounded-xl text-slate-700 leading-relaxed border border-[#dce9ff]">
            Platform ini dirancang khusus untuk memangkas beban administrasi guru SMP di era Kurikulum Merdeka sehingga fokus utama dapat dicurahkan seutuhnya pada interaksi pembelajaran bermakna bersama murid.
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-[#00236f] text-xs flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-[#0051d5]">
                    help
                  </span>
                  {f.q}
                </h4>
                <p className="text-slate-600 pl-6 leading-relaxed mt-1">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5eeff] bg-[#f8faff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00236f] text-white font-bold text-xs hover:bg-[#1e3a8a] transition-colors"
          >
            Tutup Bantuan
          </button>
        </div>
      </div>
    </div>
  );
};
