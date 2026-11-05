// Utility for managing Kurikulum Merdeka SMP subjects (Standard BSKAP + User Custom Subjects)
import { saveCustomSubjectToSupabase, deleteCustomSubjectFromSupabase } from '../lib/supabase';

export const DEFAULT_SMP_SUBJECTS = [
  'Bahasa Indonesia',
  'Matematika',
  'Ilmu Pengetahuan Alam',
  'Ilmu Pengetahuan Sosial',
  'Bahasa Inggris',
  'Pendidikan Pancasila',
  'Informatika',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan',
  'Seni Budaya',
  'Prakarya',
  'Pendidikan Agama Islam',
  'Pendidikan Agama Kristen',
  'Pendidikan Agama Katolik',
  'Pendidikan Agama Hindu',
  'Pendidikan Agama Buddha',
  'Muatan Lokal / Bahasa Daerah',
  'Bimbingan dan Konseling (BK)',
];

const STORAGE_KEY = 'edumerdeka_custom_subjects';

export function getCustomSubjects(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Gagal membaca custom subjects dari localStorage:', e);
    return [];
  }
}

export function getAllSubjects(): string[] {
  const custom = getCustomSubjects();
  const set = new Set<string>();

  // Add default subjects first
  DEFAULT_SMP_SUBJECTS.forEach((s) => set.add(s));

  // Add custom user subjects
  custom.forEach((s) => {
    if (s && s.trim()) {
      set.add(s.trim());
    }
  });

  return Array.from(set);
}

export function saveCustomSubject(subjectName: string): boolean {
  const trimmed = subjectName?.trim();
  if (!trimmed) return false;

  const current = getCustomSubjects();
  // Check if already in custom or default (case-insensitive)
  const existsInCustom = current.some((s) => s.toLowerCase() === trimmed.toLowerCase());
  const existsInDefault = DEFAULT_SMP_SUBJECTS.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  if (!existsInCustom && !existsInDefault) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('subjects_updated', { detail: updated }));
      // Sync to Supabase Cloud
      saveCustomSubjectToSupabase(trimmed).catch(() => {});
      // Sync to server background
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSubjects: updated }),
      }).catch(() => {});
      return true;
    } catch (e) {
      console.error('Gagal menyimpan custom subject:', e);
      return false;
    }
  }

  return true;
}

export function removeCustomSubject(subjectName: string): boolean {
  const current = getCustomSubjects();
  const updated = current.filter((s) => s.toLowerCase() !== subjectName.toLowerCase());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('subjects_updated', { detail: updated }));
    // Delete from Supabase Cloud
    deleteCustomSubjectFromSupabase(subjectName).catch(() => {});
    // Sync to server background
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customSubjects: updated }),
    }).catch(() => {});
    return true;
  } catch (e) {
    console.error('Gagal menghapus custom subject:', e);
    return false;
  }
}

export function isUserCustomSubject(subjectName: string): boolean {
  const current = getCustomSubjects();
  return current.some((s) => s.toLowerCase() === subjectName.toLowerCase());
}

// Recommended CP Elements by Subject according to BSKAP regulations
export const SUBJECT_ELEMENTS_MAP: Record<string, string[]> = {
  'Bahasa Indonesia': [
    'Menyimak',
    'Membaca dan Memirsa',
    'Berbicara dan Mempresentasikan',
    'Menulis',
  ],
  'Matematika': [
    'Bilangan',
    'Aljabar',
    'Pengukuran',
    'Geometri',
    'Analisis Data dan Peluang',
  ],
  'Ilmu Pengetahuan Alam': [
    'Pemahaman IPA',
    'Keterampilan Proses Sains',
  ],
  'Ilmu Pengetahuan Sosial': [
    'Pemahaman Konsep (Keruangan & Konektivitas Antar-Ruang)',
    'Keterampilan Inkuiri Sosial',
  ],
  'Bahasa Inggris': [
    'Menyimak dan Berbicara (Listening & Speaking)',
    'Membaca dan Memirsa (Reading & Viewing)',
    'Menulis dan Mempresentasikan (Writing & Presenting)',
  ],
  'Pendidikan Pancasila': [
    'Pancasila',
    'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
    'Bhinneka Tunggal Ika',
    'Negara Kesatuan Republik Indonesia',
  ],
  'Informatika': [
    'Berpikir Komputasional (BK)',
    'Teknologi Informasi dan Komunikasi (TIK)',
    'Sistem Komputer (SK)',
    'Jaringan Komputer dan Internet (JKI)',
    'Analisis Data (AD)',
    'Algoritma dan Pemrograman (AP)',
    'Dampak Sosial Informatika (DSI)',
    'Praktik Lintas Bidang (PLB)',
  ],
  'Pendidikan Jasmani, Olahraga, dan Kesehatan': [
    'Keterampilan Gerak',
    'Pengetahuan Gerak',
    'Pemanfaatan Gerak',
    'Pengembangan Karakter dan Nilai Gerak',
  ],
  'Seni Budaya': [
    'Mengalami (Experiencing)',
    'Menciptakan (Making/Creating)',
    'Merefleksikan (Reflecting)',
    'Berpikir dan Bekerja Artistik',
    'Berdampak (Impacting)',
  ],
  'Prakarya': [
    'Observasi dan Eksplorasi',
    'Desain / Perencanaan Produk',
    'Produksi / Pembuatan Karya',
    'Refleksi dan Evaluasi',
  ],
  'Pendidikan Agama Islam': [
    'Al-Qur’an dan Hadis',
    'Akidah',
    'Akhlak',
    'Fikih',
    'Sejarah Peradaban Islam (SPI)',
  ],
  'Pendidikan Agama Kristen': [
    'Allah Berkarya',
    'Manusia dan Nilai-Nilai Kristiani',
    'Gereja dan Masyarakat Majemuk',
    'Alam dan Lingkungan Hidup',
  ],
  'Pendidikan Agama Katolik': [
    'Pribadi Peserta Didik',
    'Yesus Kristus',
    'Gereja',
    'Masyarakat',
  ],
  'Pendidikan Agama Hindu': [
    'Sraddha dan Bhakti',
    'Susila',
    'Acara',
    'Kitab Suci Veda',
    'Sejarah Agama Hindu',
  ],
  'Pendidikan Agama Buddha': [
    'Sejarah Perkembangan Agama Buddha',
    'Saddhā dan Kemoralan',
    'Meditasi dan Ketenteraman Batin',
    'Masyarakat dan Kehidupan Berbudaya',
  ],
  'Muatan Lokal / Bahasa Daerah': [
    'Menyimak Bahasa Daerah',
    'Membaca dan Memirsa Aksara/Teks Daerah',
    'Berbicara dan Unggah-Ungguh Basa',
    'Menulis Teks Bahasa Daerah',
  ],
  'Bimbingan dan Konseling (BK)': [
    'Bidang Pribadi',
    'Bidang Sosial',
    'Bidang Belajar',
    'Bidang Karier',
  ],
};

export function getRecommendedElements(subjectName: string): string[] {
  if (!subjectName) {
    return ['Pemahaman Konsep', 'Keterampilan Proses & Aplikasi'];
  }

  // Exact or case-insensitive match
  const match = Object.keys(SUBJECT_ELEMENTS_MAP).find(
    (key) => key.toLowerCase() === subjectName.toLowerCase()
  );
  if (match) return SUBJECT_ELEMENTS_MAP[match];

  // Partial match (e.g. "IPA", "IPS", "Informatika", "Islam", "Agama", "Pancasila")
  const subLower = subjectName.toLowerCase();
  if (subLower.includes('ipa') || subLower.includes('alam')) {
    return SUBJECT_ELEMENTS_MAP['Ilmu Pengetahuan Alam'];
  }
  if (subLower.includes('ips') || subLower.includes('sosial')) {
    return SUBJECT_ELEMENTS_MAP['Ilmu Pengetahuan Sosial'];
  }
  if (subLower.includes('komputer') || subLower.includes('informatika') || subLower.includes('coding')) {
    return SUBJECT_ELEMENTS_MAP['Informatika'];
  }
  if (subLower.includes('pjok') || subLower.includes('olahraga') || subLower.includes('jasmani')) {
    return SUBJECT_ELEMENTS_MAP['Pendidikan Jasmani, Olahraga, dan Kesehatan'];
  }
  if (subLower.includes('seni') || subLower.includes('musik') || subLower.includes('rupa') || subLower.includes('tari')) {
    return SUBJECT_ELEMENTS_MAP['Seni Budaya'];
  }
  if (subLower.includes('prakarya') || subLower.includes('kerajinan') || subLower.includes('rekayasa')) {
    return SUBJECT_ELEMENTS_MAP['Prakarya'];
  }
  if (subLower.includes('islam') || subLower.includes('pai')) {
    return SUBJECT_ELEMENTS_MAP['Pendidikan Agama Islam'];
  }
  if (subLower.includes('jawa') || subLower.includes('sunda') || subLower.includes('daerah') || subLower.includes('mulo')) {
    return SUBJECT_ELEMENTS_MAP['Muatan Lokal / Bahasa Daerah'];
  }
  if (subLower.includes('bk') || subLower.includes('konseling')) {
    return SUBJECT_ELEMENTS_MAP['Bimbingan dan Konseling (BK)'];
  }

  // Default fallback for completely custom subject
  return [
    'Pemahaman Konseptual & Teori',
    'Keterampilan Praktik & Karya Nyata',
    'Refleksi & Internalisasi Sikap',
  ];
}
