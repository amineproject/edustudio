import React, { useState } from 'react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- ============================================================================
-- AUDIT & OPTIMISASI DATABASE SUPABASE EDUSTUDIO (KURIKULUM MERDEKA SMP)
-- Solusi Sinkronisasi Real-Time Multi-Perangkat (Laptop & HP) + Keamanan RLS
-- ============================================================================

-- 1. TABEL PROFIL GURU & SATUAN PENDIDIKAN
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nip VARCHAR(50),
    role TEXT DEFAULT 'Guru Penggerak • SMP Negeri 1',
    school_name TEXT NOT NULL,
    headmaster_name TEXT NOT NULL,
    headmaster_nip VARCHAR(50),
    academic_year VARCHAR(20) DEFAULT '2024/2025',
    semester VARCHAR(10) DEFAULT 'Genap',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrasi kolom aman jika tabel sudah ada sebelumnya
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headmaster_nip VARCHAR(50);
ALTER TABLE public.profiles ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. TABEL TERPADU DOKUMEN PEMBELAJARAN (Single Source of Truth Dokumen)
CREATE TABLE IF NOT EXISTS public.recent_documents (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    sub_title TEXT,
    subject VARCHAR(100) NOT NULL,
    fase VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Siap Cetak / PDF',
    type VARCHAR(50) NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recent_documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.recent_documents ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. TABEL PERENCANAAN KURIKULUM (Modul 1: CP, TP, ATP)
CREATE TABLE IF NOT EXISTS public.curriculum_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    effective_weeks INT DEFAULT 18,
    total_jp INT NOT NULL DEFAULT 72,
    selected_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    core_topic TEXT NOT NULL,
    official_cp_text TEXT,
    student_readiness TEXT,
    school_context TEXT,
    learning_model VARCHAR(100) DEFAULT 'Problem Based Learning (PBL)',
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Siap Cetak / PDF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.curriculum_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.curriculum_plans ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 4. TABEL MODUL AJAR PEMBELAJARAN MENDALAM / DEEP LEARNING (Modul 2, LKPD)
CREATE TABLE IF NOT EXISTS public.modul_ajar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    curriculum_plan_id UUID REFERENCES public.curriculum_plans(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    topic TEXT NOT NULL,
    target_tp TEXT NOT NULL,
    cp_element TEXT NOT NULL,
    meetings_count INT DEFAULT 2,
    duration_per_meeting VARCHAR(100) DEFAULT '2 Pertemuan x 40 Menit',
    total_students INT DEFAULT 32,
    learning_model VARCHAR(100) DEFAULT 'Problem Based Learning (PBL)',
    local_context TEXT,
    student_characteristics TEXT,
    facilities TEXT,
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Draf',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.modul_ajar ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.modul_ajar ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 5. TABEL ASESMEN HOTS & KKTP RAPOR (Modul 3)
CREATE TABLE IF NOT EXISTS public.assessment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    modul_ajar_id UUID REFERENCES public.modul_ajar(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    topic TEXT NOT NULL,
    target_tp TEXT NOT NULL,
    cp_element TEXT NOT NULL,
    assessment_form VARCHAR(100) DEFAULT 'Tes Tertulis & Kinerja',
    kktp_approach VARCHAR(100) DEFAULT 'Rubrik Skala Kualitatif',
    duration_minutes INT DEFAULT 80,
    local_stimulus TEXT,
    generated_markdown TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Selesai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessment_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_plans ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 6. TABEL MATA PELAJARAN KUSTOM GURU (Sinkronisasi Antar-Perangkat)
CREATE TABLE IF NOT EXISTS public.custom_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_subject UNIQUE (user_id, subject_name)
);

ALTER TABLE public.custom_subjects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.custom_subjects ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============================================================================
-- INDEKS PERFORMA & INTEGRITAS DATA (Mencegah Full Table Scan pada RLS)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_documents_user_id ON public.recent_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_documents_updated_at ON public.recent_documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_curriculum_plans_user_id ON public.curriculum_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_plans_profile_id ON public.curriculum_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_modul_ajar_user_id ON public.modul_ajar(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_plans_user_id ON public.assessment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_subjects_user_id ON public.custom_subjects(user_id);

-- ============================================================================
-- TRIGGER OTOMATIS PEMBARUAN TIMESTAMP (updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_recent_docs_updated_at ON public.recent_documents;
CREATE TRIGGER set_recent_docs_updated_at BEFORE UPDATE ON public.recent_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_curriculum_plans_updated_at ON public.curriculum_plans;
CREATE TRIGGER set_curriculum_plans_updated_at BEFORE UPDATE ON public.curriculum_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_modul_ajar_updated_at ON public.modul_ajar;
CREATE TRIGGER set_modul_ajar_updated_at BEFORE UPDATE ON public.modul_ajar FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_assessment_plans_updated_at ON public.assessment_plans;
CREATE TRIGGER set_assessment_plans_updated_at BEFORE UPDATE ON public.assessment_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Menjamin isolasi data per akun guru (auth.uid()) dan mencegah data bocor
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modul_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_subjects ENABLE ROW LEVEL SECURITY;

-- 1. Policies untuk profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 2. Policies untuk recent_documents
DROP POLICY IF EXISTS "recent_documents_select_policy" ON public.recent_documents;
CREATE POLICY "recent_documents_select_policy" ON public.recent_documents
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "recent_documents_insert_policy" ON public.recent_documents;
CREATE POLICY "recent_documents_insert_policy" ON public.recent_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "recent_documents_update_policy" ON public.recent_documents;
CREATE POLICY "recent_documents_update_policy" ON public.recent_documents
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "recent_documents_delete_policy" ON public.recent_documents;
CREATE POLICY "recent_documents_delete_policy" ON public.recent_documents
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. Policies untuk curriculum_plans
DROP POLICY IF EXISTS "curriculum_plans_select_policy" ON public.curriculum_plans;
CREATE POLICY "curriculum_plans_select_policy" ON public.curriculum_plans
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "curriculum_plans_insert_policy" ON public.curriculum_plans;
CREATE POLICY "curriculum_plans_insert_policy" ON public.curriculum_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "curriculum_plans_update_policy" ON public.curriculum_plans;
CREATE POLICY "curriculum_plans_update_policy" ON public.curriculum_plans
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "curriculum_plans_delete_policy" ON public.curriculum_plans;
CREATE POLICY "curriculum_plans_delete_policy" ON public.curriculum_plans
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Policies untuk modul_ajar
DROP POLICY IF EXISTS "modul_ajar_select_policy" ON public.modul_ajar;
CREATE POLICY "modul_ajar_select_policy" ON public.modul_ajar
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "modul_ajar_insert_policy" ON public.modul_ajar;
CREATE POLICY "modul_ajar_insert_policy" ON public.modul_ajar
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "modul_ajar_update_policy" ON public.modul_ajar;
CREATE POLICY "modul_ajar_update_policy" ON public.modul_ajar
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "modul_ajar_delete_policy" ON public.modul_ajar;
CREATE POLICY "modul_ajar_delete_policy" ON public.modul_ajar
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Policies untuk assessment_plans
DROP POLICY IF EXISTS "assessment_plans_select_policy" ON public.assessment_plans;
CREATE POLICY "assessment_plans_select_policy" ON public.assessment_plans
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "assessment_plans_insert_policy" ON public.assessment_plans;
CREATE POLICY "assessment_plans_insert_policy" ON public.assessment_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "assessment_plans_update_policy" ON public.assessment_plans;
CREATE POLICY "assessment_plans_update_policy" ON public.assessment_plans
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "assessment_plans_delete_policy" ON public.assessment_plans;
CREATE POLICY "assessment_plans_delete_policy" ON public.assessment_plans
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 6. Policies untuk custom_subjects
DROP POLICY IF EXISTS "custom_subjects_select_policy" ON public.custom_subjects;
CREATE POLICY "custom_subjects_select_policy" ON public.custom_subjects
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "custom_subjects_insert_policy" ON public.custom_subjects;
CREATE POLICY "custom_subjects_insert_policy" ON public.custom_subjects
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "custom_subjects_update_policy" ON public.custom_subjects;
CREATE POLICY "custom_subjects_update_policy" ON public.custom_subjects
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "custom_subjects_delete_policy" ON public.custom_subjects;
CREATE POLICY "custom_subjects_delete_policy" ON public.custom_subjects
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- SUPABASE REALTIME CONFIGURATION (Sinkronisasi Seketika Laptop & HP)
-- ============================================================================
-- Wajib REPLICA IDENTITY FULL agar perubahan UPDATE & DELETE mengirimkan data lengkap
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.recent_documents REPLICA IDENTITY FULL;
ALTER TABLE public.curriculum_plans REPLICA IDENTITY FULL;
ALTER TABLE public.modul_ajar REPLICA IDENTITY FULL;
ALTER TABLE public.assessment_plans REPLICA IDENTITY FULL;
ALTER TABLE public.custom_subjects REPLICA IDENTITY FULL;

-- Daftarkan semua tabel ke publikasi Realtime Supabase
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.profiles, 
      public.recent_documents, 
      public.curriculum_plans, 
      public.modul_ajar, 
      public.assessment_plans, 
      public.custom_subjects;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
    WHEN OTHERS THEN
      RAISE NOTICE 'Notice: %', SQLERRM;
  END;
END $$;`;

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
