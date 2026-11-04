import React from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
  academicYear: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenHelp,
  academicYear,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'riwayat-dokumen', label: 'Riwayat Dokumen', icon: 'history_edu' },
    { id: 'bank-cp', label: 'Bank Capaian Pembelajaran', icon: 'menu_book' },
    { id: 'template-panduan', label: 'Template & Panduan', icon: 'library_books' },
    { id: 'pengaturan', label: 'Pengaturan & Profil Sekolah', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e5eeff] transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center shadow-sm font-bold text-lg">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[17px] text-[#1e3a8a] leading-tight font-['Plus_Jakarta_Sans']">
                  EduMerdeka SMP
                </span>
                <span className="text-xs text-[#64748b] font-medium">
                  Fase D (Kelas 7-9)
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Tutup Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#1e3a8a] text-white shadow-xs font-semibold'
                      : 'text-[#475569] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-white' : 'text-[#64748b]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2.5 p-4 bg-[#eff4ff] mx-4 mb-4 rounded-xl border border-[#dce9ff]">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-[#475569] uppercase font-bold tracking-wider">
              Tahun Ajaran
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#003ea8] text-[11px] font-bold">
              T.A. {academicYear}
            </span>
          </div>

          <button
            onClick={onOpenHelp}
            className="flex items-center gap-2 text-[#475569] hover:text-[#1e3a8a] transition-colors text-xs font-semibold pt-1 border-t border-[#dce9ff]/60 text-left"
          >
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]">
              help_outline
            </span>
            <span>Pusat Bantuan & Panduan</span>
          </button>
        </div>
      </aside>
    </>
  );
};
