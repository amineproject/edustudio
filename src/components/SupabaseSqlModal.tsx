import React, { useState } from 'react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- ============================================================================
-- SKEMA DATABASE EDUSTUDIO KURIKULUM MERDEKA SMP (SUPABASE / POSTGRESQL)
-- ============================================================================

-- 1. Tabel Profil Guru & Satuan Pendidikan
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    nip VARCHAR(50),
    role TEXT DEFAULT 'Guru Penggerak • SMP Negeri 1',
    school_name TEXT NOT NULL,
    headmaster_name TEXT NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2024/2025',
    semester VARCHAR(10) DEFAULT 'Genap',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Dokumen Perencanaan Kurikulum (Modul 1: CP, TP, ATP)
CREATE TABLE IF NOT EXISTS curriculum_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    total_jp INT NOT NULL DEFAULT 72,
    selected_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    core_topic TEXT NOT NULL,
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Siap Cetak / PDF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Modul Ajar Pembelajaran Mendalam / Deep Learning 8-3-3-4 (Modul 2)
CREATE TABLE IF NOT EXISTS modul_ajar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    topic TEXT NOT NULL,
    target_tp TEXT NOT NULL,
    cp_element TEXT NOT NULL,
    meetings_count INT DEFAULT 2,
    learning_model TEXT DEFAULT 'Problem Based Learning (PBL)',
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Draf',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Asesmen HOTS & KKTP Rapor (Modul 3)
CREATE TABLE IF NOT EXISTS assessment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    topic TEXT NOT NULL,
    target_tp TEXT NOT NULL,
    cp_element TEXT NOT NULL,
    assessment_form VARCHAR(100) DEFAULT 'Tes Tertulis & Kinerja',
    kktp_approach VARCHAR(100) DEFAULT 'Rubrik Skala Kualitatif',
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Selesai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE modul_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_plans ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik Terbuka untuk Aplikasi Guru (Anon Key)
CREATE POLICY "Akses publik untuk membaca profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk mengelola profiles" ON profiles FOR ALL USING (true);

CREATE POLICY "Akses publik untuk membaca curriculum_plans" ON curriculum_plans FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk mengelola curriculum_plans" ON curriculum_plans FOR ALL USING (true);

CREATE POLICY "Akses publik untuk membaca modul_ajar" ON modul_ajar FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk mengelola modul_ajar" ON modul_ajar FOR ALL USING (true);

CREATE POLICY "Akses publik untuk membaca assessment_plans" ON assessment_plans FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk mengelola assessment_plans" ON assessment_plans FOR ALL USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px]">database</span>
            <div>
              <h3 className="text-base font-bold font-['Plus_Jakarta_Sans']">
                Skema SQL Database Supabase (PostgreSQL)
              </h3>
              <p className="text-[11px] text-blue-100">
                Tabel untuk Perencanaan Kurikulum, Modul Ajar Deep Learning, dan Asesmen KKTP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 leading-relaxed">
            <span className="font-bold block mb-1">Cara Menggunakan:</span>
            1. Buka <strong>supabase.com</strong> ➔ Masuk ke Dashboard Proyek Anda.  
            2. Klik menu <strong>SQL Editor</strong> di panel samping kiri.  
            3. Klik <strong>+ New Query</strong>, tempelkan (*paste*) kode SQL di bawah ini, lalu klik tombol hijau <strong>RUN</strong>.  
            4. Setelah tabel berhasil dibuat, ambil <code>Project URL</code> dan <code>Anon Key</code> di menu <em>Settings ➔ API</em> untuk dimasukkan ke aplikasi.
          </div>

          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <span className="font-bold text-slate-700">Kode SQL Lengkap:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 rounded-md bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Semua SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
              {sqlSchema}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5eeff] bg-[#f8faff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00236f] text-white font-bold text-xs hover:bg-[#1e3a8a]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
