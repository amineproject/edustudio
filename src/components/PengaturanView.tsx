import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { TeacherProfile, RecentDocument } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncDocumentsToSupabase,
  saveProfileToSupabase,
} from '../lib/supabase';
import {
  getAllSubjects,
  getCustomSubjects,
  saveCustomSubject,
  removeCustomSubject,
  isUserCustomSubject,
} from '../utils/subjectManager';

interface PengaturanViewProps {
  profile: TeacherProfile;
  onUpdateProfile: (p: TeacherProfile) => void;
  documents?: RecentDocument[];
  onOpenSqlModal?: () => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  profile,
  onUpdateProfile,
  documents = [],
  onOpenSqlModal,
  currentUser,
  onOpenAuth,
}) => {
  const [formData, setFormData] = useState<TeacherProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [saveStatusDetail, setSaveStatusDetail] = useState('');

  // Custom Subjects Management State
  const [subjectsList, setSubjectsList] = useState<string[]>(getAllSubjects());
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectToast, setSubjectToast] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSubjectsList(getAllSubjects());
    };
    window.addEventListener('subjects_updated', handleUpdate);
    return () => window.removeEventListener('subjects_updated', handleUpdate);
  }, []);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;
    saveCustomSubject(trimmed);
    setNewSubjectName('');
    setSubjectToast(`Mata pelajaran "${trimmed}" berhasil ditambahkan ke sistem.`);
    setTimeout(() => setSubjectToast(null), 3000);
  };

  const handleDeleteSubject = (name: string) => {
    if (window.confirm(`Hapus mata pelajaran kustom "${name}" dari daftar?`)) {
      removeCustomSubject(name);
      setSubjectToast(`Mata pelajaran "${name}" telah dihapus.`);
      setTimeout(() => setSubjectToast(null), 3000);
    }
  };

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.anonKey);
    if (config.url && config.anonKey) {
      setConnStatus('success');
      setConnMessage('Konfigurasi Supabase tersimpan.');
    }
  }, []);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setSaveStatusDetail('Menyimpan ke database cloud Supabase...');

    // Save to Supabase (Single Source of Truth)
    const res = await saveProfileToSupabase(formData);
    onUpdateProfile(formData);
    setSaveStatusDetail(res.message);

    setTimeout(() => {
      setSaved(false);
      setSaveStatusDetail('');
    }, 4500);
  };

  const handleSaveSupabase = async () => {
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseKey });
    setConnMessage('Menyimpan konfigurasi dan menyinkronkan profil ke Supabase...');
    const res = await saveProfileToSupabase(formData);
    setConnMessage(res.message);
    setTimeout(() => setConnMessage(''), 4500);
  };

  const handleTestConnection = async () => {
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseKey });
    setConnStatus('testing');
    setConnMessage('Menguji koneksi ke server Supabase...');

    const res = await testSupabaseConnection();
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
    } else {
      setConnStatus('error');
      setConnMessage(res.message);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage('Menyinkronkan dokumen kurikulum ke Supabase...');

    const res = await syncDocumentsToSupabase(documents, profile);
    setIsSyncing(false);
    setSyncMessage(res.message);
    setTimeout(() => setSyncMessage(''), 5000);
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-4 sm:space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00236f] text-[22px] sm:text-[24px]">
            settings
          </span>
          <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
            Pengaturan & Profil Satuan Pendidikan
          </h1>
        </div>
        <p className="text-[11px] sm:text-xs text-[#444651] mt-0.5 sm:mt-1">
          Kelola identitas guru, kepala sekolah, dan integrasi cloud database Supabase untuk sinkronisasi dokumen kurikulum antar-perangkat.
        </p>
      </div>

      {saved && (
        <div className="p-3 sm:p-4 rounded-xl bg-green-50 text-green-800 border border-green-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">check_circle</span>
          <div>
            <span>Profil guru dan identitas sekolah berhasil diperbarui!</span>
            {saveStatusDetail && (
              <p className="text-[11px] font-normal text-green-700 mt-0.5">{saveStatusDetail}</p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: PROFIL GURU & SEKOLAH */}
      <form
        onSubmit={handleSubmitProfile}
        className="bg-white p-4 sm:p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3 gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[18px] sm:text-[20px]">
              badge
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-[#00236f] font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
              1. Identitas Guru & Satuan Pendidikan
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Dicantumkan pada kop administrasi & pengesahan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Nama Lengkap & Gelar Guru
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              NIP (Nomor Induk Pegawai)
            </label>
            <input
              type="text"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Peran / Status Pengajar
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Contoh: Guru Penggerak • SMP Negeri 1"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Nama Satuan Pendidikan (Sekolah)
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Nama Lengkap Kepala Sekolah
            </label>
            <input
              type="text"
              value={formData.headmaster}
              onChange={(e) => setFormData({ ...formData, headmaster: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
              <span>NIP Kepala Sekolah</span>
              <span className="text-[10px] text-[#0051d5] font-semibold">Lembar Pengesahan</span>
            </label>
            <input
              type="text"
              value={formData.headmasterNip || ''}
              onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
              placeholder="Contoh: 19720315 199803 1 004"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Tahun Ajaran Aktif
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none"
              placeholder="2024/2025"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Semester
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white cursor-pointer"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Simpan Profil & Sekolah</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: MANAJEMEN MATA PELAJARAN (KUSTOM & BSKAP) */}
      <div className="bg-white p-4 sm:p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#00236f] flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[20px]">library_books</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-[#00236f] font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
                  2. Manajemen Mata Pelajaran (Bebas Tambah Sendiri)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {subjectsList.length} Mapel Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Guru dapat mengisi sendiri atau menambahkan mata pelajaran baru (misalnya Muatan Lokal, Informatika, Prakarya spesifik, atau ekstrakurikuler).
              </p>
            </div>
          </div>
        </div>

        {subjectToast && (
          <div className="p-3 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{subjectToast}</span>
          </div>
        )}

        {/* Add New Subject Form */}
        <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              edit
            </span>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Ketik mata pelajaran baru yang ingin ditambahkan (contoh: Bahasa Sunda, Robotika, IPS Terpadu)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Tambahkan Mapel</span>
          </button>
        </form>

        {/* Subjects List Chips */}
        <div>
          <label className="font-bold text-slate-700 text-xs block mb-2">
            Daftar Mata Pelajaran yang Tersedia di Seluruh Generator:
          </label>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
            {subjectsList.map((subj) => {
              const isCustom = isUserCustomSubject(subj);
              return (
                <div
                  key={subj}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isCustom
                      ? 'bg-amber-50/80 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] text-slate-400">
                    {isCustom ? 'stars' : 'check_circle'}
                  </span>
                  <span>{subj}</span>
                  {isCustom && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-full text-[9px] font-bold">
                      Kustom Anda
                    </span>
                  )}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(subj)}
                      className="ml-1 text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                      title="Hapus mapel ini"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: INTEGRASI CLOUD DATABASE (SUPABASE) */}
      <div className="bg-white p-4 sm:p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-[#00236f] font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
                  3. Koneksi Database Cloud Supabase
                </h2>
                {connStatus === 'success' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Terkoneksi
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    Penyimpanan Lokal Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Hubungkan ke akun Supabase Anda untuk menyimpan dan menyinkronkan seluruh ATP, Modul Ajar, dan Asesmen ke awan.
              </p>
            </div>
          </div>

          {onOpenSqlModal && (
            <button
              type="button"
              onClick={onOpenSqlModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-bold transition-colors border border-[#b6c4ff] self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>Lihat Skema SQL Lengkap</span>
            </button>
          )}
        </div>

        {/* User Account & Device Sync Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#eff4ff] to-white border border-[#dce9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              currentUser ? 'bg-emerald-500 text-white' : 'bg-[#00236f] text-white'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {currentUser ? 'verified_user' : 'account_circle'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#0b1c30]">
                  {currentUser ? `Akun Cloud: ${currentUser.email}` : 'Sinkronisasi Akun Guru Multi-Perangkat'}
                </span>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#444651] mt-0.5">
                {currentUser
                  ? 'Perangkat ini terhubung ke cloud Supabase. Perubahan dokumen & profil tersinkronkan seketika ke ponsel & laptop lain.'
                  : 'Masuk dengan email yang sama di Laptop dan HP agar dokumen dan profil Anda tersinkronisasi otomatis.'}
              </p>
            </div>
          </div>

          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00236f] to-[#0051d5] hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {currentUser ? 'manage_accounts' : 'login'}
              </span>
              <span>{currentUser ? 'Kelola Akun Guru' : 'Masuk / Sinkronkan Akun'}</span>
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {connMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              connStatus === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : connStatus === 'error'
                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {connStatus === 'success' ? 'check_circle' : connStatus === 'error' ? 'error' : 'info'}
            </span>
            <span>{connMessage}</span>
          </div>
        )}

        {syncMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Supabase Credential Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none font-mono"
            />
            <span className="text-[10.5px] text-slate-400 mt-0.5 block">
              Dapat ditemukan pada <em>Dashboard Supabase ➔ Project Settings ➔ API ➔ Project URL</em>.
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none font-mono"
            />
            <span className="text-[10.5px] text-slate-400 mt-0.5 block">
              Dapat ditemukan pada <em>Dashboard Supabase ➔ Project Settings ➔ API ➔ Project API keys (anon public)</em>.
            </span>
          </div>
        </div>

        {/* Database Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSupabase}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] sm:text-xs transition-colors flex-1 sm:flex-none justify-center"
            >
              Simpan Kredensial
            </button>
            <button
              type="button"
              disabled={connStatus === 'testing' || !supabaseUrl || !supabaseKey}
              onClick={handleTestConnection}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#b6c4ff] disabled:opacity-50 flex-1 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
                {connStatus === 'testing' ? 'progress_activity' : 'cloud_done'}
              </span>
              <span>{connStatus === 'testing' ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isSyncing || !supabaseUrl || !supabaseKey}
            onClick={handleSyncToSupabase}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSyncing ? 'sync' : 'cloud_upload'}
            </span>
            <span>{isSyncing ? 'Menyinkronkan...' : `Sinkronkan ${documents.length} Dokumen ke Supabase`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
