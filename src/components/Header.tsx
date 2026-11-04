import React, { useState } from 'react';
import { TeacherProfile } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  profile: TeacherProfile;
  onOpenProfile: () => void;
  onOpenChatbot?: () => void;
  isSyncing?: boolean;
  onManualSync?: () => void;
  syncStatusText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  profile,
  onOpenProfile,
  onOpenChatbot,
  isSyncing = false,
  onManualSync,
  syncStatusText,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 1,
      title: 'Regulasi BSKAP No. 033/H/KR/2024 Aktif',
      desc: 'Salinan resmi Capaian Pembelajaran Fase D telah diperbarui dalam sistem.',
      time: '1 jam lalu',
      unread: true,
    },
    {
      id: 2,
      title: 'Pemberitahuan Supervisi Modul Ajar',
      desc: 'Modul Ajar Bahasa Indonesia kelas VII siap dicetak untuk kelengkapan administrasi.',
      time: '3 jam lalu',
      unread: true,
    },
    {
      id: 3,
      title: 'Pembaruan Rubrik Asesmen HOTS',
      desc: 'Template asesmen diagnostik matematika telah disesuaikan.',
      time: 'Kemarin',
      unread: false,
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff]">
      <div className="h-14 sm:h-16 w-full px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Hamburger (mobile) & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none shrink-0"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">menu</span>
          </button>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[#757682] text-[18px] sm:text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari modul, CP/TP, mapel..."
              className="w-full bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#757682] pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0051d5] transition-all border border-transparent focus:border-[#0051d5]/20"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#444651] text-xs shrink-0 font-semibold border border-[#dce9ff]">
            <span className="material-symbols-outlined text-[16px] text-[#00236f]">
              school
            </span>
            <span>SMP - Fase D</span>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00236f] to-[#0051d5] hover:opacity-95 text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[17px]">psychology</span>
              <span className="hidden sm:inline">Tanya Pakar AI</span>
              <span className="sm:hidden">Pakar AI</span>
            </button>
          )}

          {/* Cloud Sync Button */}
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`p-1.5 sm:p-2 rounded-lg text-[#444651] hover:bg-[#e5eeff] hover:text-[#0051d5] transition-colors relative flex items-center justify-center ${
                isSyncing ? 'opacity-80' : ''
              }`}
              title={syncStatusText || (isSyncing ? 'Sinkronisasi cloud & server...' : 'Sinkronkan Data Antar-Perangkat')}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[20px] sm:text-[22px] ${
                  isSyncing ? 'animate-spin text-[#0051d5]' : ''
                }`}
              >
                sync
              </span>
              {isSyncing && (
                <span className="sr-only">Sinkronisasi sedang berjalan</span>
              )}
            </button>
          )}

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg text-[#444651] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
              title="Notifikasi"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#e2e8f0] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafe] border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0b1c30]">Notifikasi</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0051d5] text-[10px] font-bold">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[11px] text-[#0051d5] hover:underline font-medium"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#f1f5f9] max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-[#f8f9ff] transition-colors ${
                          item.unread && unreadCount > 0 ? 'bg-[#f0f4ff]/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#0b1c30] leading-snug">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-[#f8fafe] border-t border-[#e2e8f0] text-center">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Pusat Informasi Kurikulum Merdeka Terintegrasi
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Card */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-[#0b1c30] leading-snug font-['Plus_Jakarta_Sans']">
                {profile.name}
              </span>
              <span className="text-[10.5px] text-[#444651]">
                {profile.role}
              </span>
            </div>
            <img
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#e2e8f0]"
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop"
              onError={(e) => {
                // Fallback avatar icon if network fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
