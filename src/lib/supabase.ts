import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RecentDocument, TeacherProfile } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get saved Supabase config from localStorage or env
export const getSupabaseConfig = (): SupabaseConfig => {
  const localUrl = localStorage.getItem('edumerdeka_supabase_url');
  const localKey = localStorage.getItem('edumerdeka_supabase_key');

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || '',
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem('edumerdeka_supabase_url', config.url.trim());
  localStorage.setItem('edumerdeka_supabase_key', config.anonKey.trim());
};

// Create dynamic Supabase client
let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

// Test connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'URL atau Anon Key Supabase belum diisi.',
    };
  }

  try {
    // Attempt a light read from any table or auth
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, but connection succeeded
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Terhubung ke Supabase! (Catatan: Tabel belum dibuat, silakan jalankan SQL schema yang telah disediakan di SQL Editor Supabase).',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Database siap digunakan untuk sinkronisasi dokumen.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kendala jaringan: ${err.message || 'Tidak dapat menghubungi server Supabase'}`,
    };
  }
};

// Sync documents to Supabase
export const syncDocumentsToSupabase = async (
  documents: RecentDocument[],
  profile: TeacherProfile
): Promise<{ success: boolean; syncedCount: number; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCount: 0,
      message: 'Koneksi Supabase belum aktif. Mohon masukkan URL & Anon Key di menu Pengaturan.',
    };
  }

  try {
    let synced = 0;

    for (const doc of documents) {
      if (doc.type === 'ATP') {
        await client.from('curriculum_plans').upsert({
          id: doc.id.includes('-') && doc.id.length > 20 ? doc.id : undefined,
          subject: doc.subject,
          grade: doc.fase,
          semester: profile.semester,
          total_jp: 72,
          selected_elements: ['Elemen Kurikulum'],
          core_topic: doc.title,
          generated_markdown: doc.content || doc.title,
          status: doc.status,
          updated_at: new Date().toISOString(),
        });
        synced++;
      } else if (doc.type === 'Modul Ajar') {
        await client.from('modul_ajar').upsert({
          id: doc.id.includes('-') && doc.id.length > 20 ? doc.id : undefined,
          subject: doc.subject,
          grade: doc.fase,
          semester: profile.semester,
          topic: doc.title,
          target_tp: doc.subTitle,
          cp_element: 'Elemen Inti',
          generated_markdown: doc.content || doc.title,
          status: doc.status,
          updated_at: new Date().toISOString(),
        });
        synced++;
      } else {
        await client.from('assessment_plans').upsert({
          id: doc.id.includes('-') && doc.id.length > 20 ? doc.id : undefined,
          subject: doc.subject,
          grade: doc.fase,
          semester: profile.semester,
          topic: doc.title,
          target_tp: doc.subTitle,
          cp_element: 'Asesmen & KKTP',
          generated_markdown: doc.content || doc.title,
          status: doc.status,
          updated_at: new Date().toISOString(),
        });
        synced++;
      }
    }

    return {
      success: true,
      syncedCount: synced,
      message: `Berhasil menyinkronkan ${synced} dokumen ke cloud database Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal menyinkronkan dokumen: ${err.message || 'Error Supabase'}`,
    };
  }
};
