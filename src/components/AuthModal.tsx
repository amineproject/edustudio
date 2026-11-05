import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { signInWithEmail, signUpWithEmail, signOutUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 1000);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 1500);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOutUser();
    setSuccessMessage('Berhasil keluar dari akun guru.');
    setLoading(false);
    setTimeout(() => {
      onAuthSuccess();
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#00236f] to-[#0051d5] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </span>
            <div>
              <h3 className="text-base font-bold font-['Plus_Jakarta_Sans']">
                {currentUser ? 'Akun Guru Terhubung' : mode === 'signin' ? 'Masuk ke EduStudio' : 'Daftar Akun Guru'}
              </h3>
              <p className="text-[11px] text-blue-100">
                Sinkronisasi Dokumen & Profil Antar-Perangkat (Laptop & HP)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#444651] uppercase font-semibold tracking-wider block">
                    Status Akun Cloud:
                  </span>
                  <span className="text-sm font-bold text-[#0b1c30] block">{currentUser.email}</span>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersinkronisasi Otomatis Antar Perangkat
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs leading-relaxed border border-slate-200">
                Setiap dokumen pembelajaran yang Anda buat, edit, atau hapus di laptop atau ponsel ini akan otomatis tersinkron ke semua perangkat Anda yang masuk dengan akun ini.
              </div>

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>{loading ? 'Memproses...' : 'Keluar dari Akun'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-[#eff4ff] text-blue-900 border border-[#dce9ff] text-[11.5px] leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[#0051d5] text-[18px] shrink-0 mt-0.5">
                  sync
                </span>
                <div>
                  <strong>Sinkronisasi Antar-Perangkat:</strong> Gunakan akun email yang sama di laptop dan ponsel Anda agar data kurikulum langsung tersambung secara otomatis.
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-red-500">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Guru</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.guru@sekolah.sch.id"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0051d5] text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0051d5] text-xs"
                  required
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0051d5] text-xs"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00236f] to-[#0051d5] hover:opacity-95 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {mode === 'signin' ? 'login' : 'person_add'}
                  </span>
                )}
                <span>
                  {loading
                    ? 'Menghubungkan...'
                    : mode === 'signin'
                    ? 'Masuk & Sinkronkan Perangkat'
                    : 'Daftar Akun Baru'}
                </span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#0051d5] hover:underline font-semibold"
                >
                  {mode === 'signin'
                    ? 'Belum punya akun? Daftar akun guru baru di sini'
                    : 'Sudah punya akun? Masuk dengan email di sini'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
