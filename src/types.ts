export type ModuleCategory = 'all' | 'perencanaan' | 'bahan' | 'evaluasi';

export interface ModuleItem {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'perencanaan' | 'bahan' | 'evaluasi';
  tag1: string;
  tag2: string;
  icon: string;
  description: string;
  footerTag: string;
  footerIcon: string;
  isPopular?: boolean;
  actionText: string;
}

export interface RecentDocument {
  id: string;
  title: string;
  subTitle: string;
  subject: string;
  fase: string;
  status: 'Siap Cetak / PDF' | 'Draf (70%)' | 'Selesai';
  lastModified: string;
  type: 'Modul Ajar' | 'LKPD' | 'ATP' | 'Asesmen' | 'Prota' | 'Promes' | 'Bahan Ajar';
  content?: string;
}

export interface CapaianPembelajaran {
  id: string;
  subject: string;
  element: string;
  fase: string;
  code: string;
  deskripsi: string;
  tujuanPembelajaran: string[];
}

export interface TeacherProfile {
  name: string;
  role: string;
  school: string;
  nip: string;
  headmaster: string;
  headmasterNip: string;
  academicYear: string;
  semester: string;
}
