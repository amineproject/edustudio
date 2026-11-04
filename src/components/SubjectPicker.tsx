import React, { useState, useEffect } from 'react';
import {
  getAllSubjects,
  saveCustomSubject,
  getCustomSubjects,
  isUserCustomSubject,
} from '../utils/subjectManager';

interface SubjectPickerProps {
  value: string;
  onChange: (subject: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  compact?: boolean;
  allowCustomInput?: boolean;
}

export const SubjectPicker: React.FC<SubjectPickerProps> = ({
  value,
  onChange,
  label = 'Mata Pelajaran',
  required = true,
  className = '',
  compact = false,
  allowCustomInput = true,
}) => {
  const [subjects, setSubjects] = useState<string[]>(getAllSubjects());
  const [isTypingMode, setIsTypingMode] = useState<boolean>(() => {
    // If current value is not in standard list and not empty, start in typing mode or select mode
    const all = getAllSubjects();
    return Boolean(value && !all.includes(value));
  });
  const [customInputValue, setCustomInputValue] = useState<string>(value || '');
  const [saveToFavorites, setSaveToFavorites] = useState<boolean>(true);

  // Sync available subjects whenever storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setSubjects(getAllSubjects());
    };
    window.addEventListener('subjects_updated', handleUpdate);
    return () => window.removeEventListener('subjects_updated', handleUpdate);
  }, []);

  // Update internal input when external value changes
  useEffect(() => {
    if (value && value !== customInputValue) {
      setCustomInputValue(value);
      if (!subjects.includes(value)) {
        setSubjects(getAllSubjects());
      }
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__CUSTOM_INPUT__') {
      setIsTypingMode(true);
      setCustomInputValue('');
    } else {
      setIsTypingMode(false);
      onChange(selected);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setCustomInputValue(newVal);
    onChange(newVal);
  };

  const handleApplyCustom = () => {
    const trimmed = customInputValue.trim();
    if (trimmed) {
      if (saveToFavorites) {
        saveCustomSubject(trimmed);
        setSubjects(getAllSubjects());
      }
      onChange(trimmed);
      setIsTypingMode(false);
    }
  };

  if (compact) {
    if (isTypingMode) {
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <input
            type="text"
            value={customInputValue}
            onChange={handleCustomInputChange}
            placeholder="Ketik mapel..."
            className="w-28 sm:w-36 px-2 py-1 bg-white rounded border border-[#0051d5] text-[11px] sm:text-xs font-bold text-[#0b1c30] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleApplyCustom}
            className="p-1 rounded bg-[#00236f] text-white hover:bg-[#00174d]"
            title="Simpan Mapel"
          >
            <span className="material-symbols-outlined text-[14px]">check</span>
          </button>
          <button
            type="button"
            onClick={() => setIsTypingMode(false)}
            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
            title="Pilih dari daftar"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <select
          value={subjects.includes(value) ? value : '__CUSTOM_INPUT__'}
          onChange={handleSelectChange}
          className="bg-transparent text-[11px] sm:text-xs text-[#0b1c30] font-bold focus:outline-none cursor-pointer pr-1"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          {allowCustomInput && (
            <option value="__CUSTOM_INPUT__" className="font-semibold text-[#0051d5]">
              ✏️ + Ketik Mapel Sendiri...
            </option>
          )}
        </select>
        {allowCustomInput && (
          <button
            type="button"
            onClick={() => {
              setIsTypingMode(true);
              setCustomInputValue(value || '');
            }}
            className="p-0.5 text-slate-400 hover:text-[#0051d5]"
            title="Ketik Mapel Kustom"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-slate-800 text-xs block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {allowCustomInput && !isTypingMode && (
            <button
              type="button"
              onClick={() => {
                setIsTypingMode(true);
                setCustomInputValue(value || '');
              }}
              className="text-[11px] text-[#0051d5] font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[13px]">edit_note</span>
              Ketik Sendiri
            </button>
          )}
          {allowCustomInput && isTypingMode && (
            <button
              type="button"
              onClick={() => setIsTypingMode(false)}
              className="text-[11px] text-slate-500 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[13px]">list</span>
              Pilih dari Daftar
            </button>
          )}
        </div>
      )}

      {isTypingMode ? (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px]">
              edit
            </span>
            <input
              type="text"
              value={customInputValue}
              onChange={handleCustomInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCustom();
                }
              }}
              placeholder="Contoh: IPS Terpadu, Informatika, Prakarya, dsb..."
              className="w-full pl-8 pr-20 py-2.5 rounded-lg border border-[#0051d5] text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white font-semibold text-slate-900 shadow-xs"
              autoFocus
              required={required}
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-2 py-1 rounded bg-[#00236f] text-white text-[10.5px] font-bold hover:bg-[#00174d] transition-colors"
                title="Terapkan dan simpan mapel ini"
              >
                Gunakan
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-slate-500 px-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToFavorites}
                onChange={(e) => setSaveToFavorites(e.target.checked)}
                className="rounded text-[#00236f] accent-[#00236f]"
              />
              <span>Simpan ke daftar mapel untuk dipakai lagi</span>
            </label>
            <span className="text-[#0051d5] font-medium">Bebas ketik mapel apa saja</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <select
            value={subjects.includes(value) ? value : '__CUSTOM_INPUT__'}
            onChange={handleSelectChange}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none bg-white cursor-pointer font-semibold text-slate-800"
          >
            <optgroup label="Mata Pelajaran Kurikulum Merdeka">
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s} {isUserCustomSubject(s) ? '★ (Kustom Anda)' : ''}
                </option>
              ))}
            </optgroup>
            {allowCustomInput && (
              <optgroup label="Pilihan Lain">
                <option value="__CUSTOM_INPUT__" className="text-[#0051d5] font-bold">
                  ✏️ + Ketik Mata Pelajaran Sendiri...
                </option>
              </optgroup>
            )}
          </select>
        </div>
      )}
    </div>
  );
};
