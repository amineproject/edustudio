import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { RecentDocument, TeacherProfile } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Built-in default credentials so mobile and desktop connect to Supabase out-of-the-box
export const DEFAULT_SUPABASE_URL = 'https://ffhdkelzdlvyrawnxynr.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_q0I_mAuTdtYEzFu6pZYO9Q_QO7FvMIQ';

// Get saved Supabase config from localStorage, env, or built-in project credentials
export const getSupabaseConfig = (): SupabaseConfig => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('edumerdeka_supabase_url') : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('edumerdeka_supabase_key') : '';

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim(),
    anonKey: (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim(),
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  const trimmedUrl = config.url.trim();
  const trimmedKey = config.anonKey.trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem('edumerdeka_supabase_url', trimmedUrl);
    localStorage.setItem('edumerdeka_supabase_key', trimmedKey);
  }

  // Clear cached client so it gets re-initialized with new credentials
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';

  // Sync with server if server endpoint is available
  fetch('/api/supabase-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey }),
  }).catch(() => {});
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
        detectSessionInUrl: true,
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

// =========================================================================
// Authentication Helpers (Requirement 3: Cross-Device Auth & User ID)
// =========================================================================

export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
};

export const signInWithEmail = async (
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi.' };
  }
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error) {
      return { success: false, message: `Gagal masuk: ${error.message}` };
    }
    return {
      success: true,
      user: data.user || undefined,
      message: 'Berhasil masuk ke akun guru! Data cloud tersinkronisasi.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan saat masuk.' };
  }
};

export const signUpWithEmail = async (
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi.' };
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password: pass,
    });
    if (error) {
      return { success: false, message: `Pendaftaran gagal: ${error.message}` };
    }
    return {
      success: true,
      user: data.user || undefined,
      message: 'Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi jika diperlukan.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan pendaftaran.' };
  }
};

export const signOutUser = async (): Promise<void> => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => {
    sub?.subscription?.unsubscribe();
  };
};

// Helper: Convert any string ID (e.g. 'doc-1', 'doc-173000...') to RFC 4122 compliant UUID
export function toValidUUID(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const pad = '0123456789abcdef0123456789abcdef';
  const fullHex = (hex + pad).slice(0, 32);
  return `${fullHex.slice(0, 8)}-${fullHex.slice(8, 12)}-4${fullHex.slice(13, 16)}-a${fullHex.slice(17, 20)}-${fullHex.slice(20, 32)}`;
}

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
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Terhubung ke server Supabase! (Catatan: Tabel database belum dibuat, silakan jalankan skrip SQL di modal SQL Supabase).',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Database cloud aktif & siap menyinkronkan data antar-perangkat.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Kendala jaringan: ${err.message || 'Tidak dapat menghubungi server Supabase'}`,
    };
  }
};

// =========================================================================
// Profile CRUD (Save, Fetch)
// =========================================================================
export const saveProfileToSupabase = async (
  profile: TeacherProfile
): Promise<{ success: boolean; message: string }> => {
  // Mirror to server endpoint as secondary backup
  fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).catch(() => {});

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: 'Profil disimpan lokal. Hubungkan Supabase untuk sinkronisasi antar perangkat.',
    };
  }

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || profile.userId || null;

    // Full payload
    const fullPayload: any = {
      full_name: profile.name,
      nip: profile.nip,
      role: profile.role,
      school_name: profile.school,
      headmaster_name: profile.headmaster,
      headmaster_nip: profile.headmasterNip || '',
      academic_year: profile.academicYear,
      semester: profile.semester,
      updated_at: new Date().toISOString(),
    };
    if (userId) fullPayload.user_id = userId;

    // Payload without headmaster_nip in case column hasn't been added yet
    const safePayload: any = {
      full_name: profile.name,
      nip: profile.nip,
      role: profile.role,
      school_name: profile.school,
      headmaster_name: profile.headmaster,
      academic_year: profile.academicYear,
      semester: profile.semester,
      updated_at: new Date().toISOString(),
    };
    if (userId) safePayload.user_id = userId;

    // Determine query filter
    let query = client.from('profiles').select('id');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data: existing } = await query.limit(1);

    // Attempt save with fullPayload
    let saveError: any = null;
    let usedPayload = fullPayload;

    if (existing && existing.length > 0) {
      const res = await client.from('profiles').update(fullPayload).eq('id', existing[0].id);
      saveError = res.error;
    } else {
      const res = await client.from('profiles').insert([fullPayload]);
      saveError = res.error;
    }

    // If failed because headmaster_nip column is missing (PGRST204), retry with safePayload
    if (saveError && (saveError.code === 'PGRST204' || saveError.message?.includes('headmaster_nip'))) {
      usedPayload = safePayload;
      if (existing && existing.length > 0) {
        const retryRes = await client.from('profiles').update(safePayload).eq('id', existing[0].id);
        saveError = retryRes.error;
      } else {
        const retryRes = await client.from('profiles').insert([safePayload]);
        saveError = retryRes.error;
      }
    }

    if (saveError) {
      console.warn('Supabase profile save notice:', saveError.message);
      return {
        success: false,
        message: `Gagal menyimpan ke Supabase: ${saveError.message}`,
      };
    }

    const nipNotice =
      usedPayload === safePayload && profile.headmasterNip
        ? ' (Catatan: Jalankan skrip SQL di menu Pengaturan untuk menambahkan kolom NIP Kepala Sekolah di database).'
        : '';

    return {
      success: true,
      message: `Profil guru berhasil disimpan & disinkronkan ke cloud Supabase!${nipNotice}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menyimpan ke Supabase: ${err.message}`,
    };
  }
};

export const fetchProfileFromSupabase = async (): Promise<TeacherProfile | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const currentUser = await getCurrentUser();
    let query = client.from('profiles').select('*');

    if (currentUser?.id) {
      query = query.or(`user_id.eq.${currentUser.id},user_id.is.null`);
    }

    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

    if (error || !data || data.length === 0) return null;

    const row = data[0];
    return {
      name: row.full_name || '',
      role: row.role || 'Guru Penggerak • SMP Negeri 1',
      school: row.school_name || '',
      nip: row.nip || '',
      headmaster: row.headmaster_name || '',
      headmasterNip: row.headmaster_nip || '',
      academicYear: row.academic_year || '2024/2025',
      semester: row.semester || 'Genap',
      email: currentUser?.email || undefined,
      userId: row.user_id || currentUser?.id || undefined,
    };
  } catch (err) {
    console.warn('Error fetching profile from Supabase:', err);
    return null;
  }
};

// =========================================================================
// Document CRUD (Save, Delete, Fetch) - Requirement 1 & 2
// =========================================================================

export const saveDocumentToSupabase = async (
  doc: RecentDocument,
  profile: TeacherProfile
): Promise<{ success: boolean; message: string; error?: any }> => {
  // Mirror to server endpoint as backup
  fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  }).catch(() => {});

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Koneksi Supabase belum aktif. Konfigurasi URL & Anon Key di Pengaturan.',
    };
  }

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || profile.userId || null;

    // 1. First, attempt upserting into unified table 'recent_documents'
    const unifiedPayload: any = {
      id: doc.id,
      title: doc.title,
      sub_title: doc.subTitle,
      subject: doc.subject,
      fase: doc.fase,
      status: doc.status,
      type: doc.type,
      content: doc.content || doc.title,
      updated_at: new Date().toISOString(),
    };
    if (userId) unifiedPayload.user_id = userId;

    const { error: unifiedError } = await client.from('recent_documents').upsert(unifiedPayload);

    if (!unifiedError) {
      return {
        success: true,
        message: 'Dokumen berhasil disimpan & disinkronkan ke cloud Supabase!',
      };
    }

    // 2. If 'recent_documents' does not exist yet in schema cache (PGRST205 / 42P01),
    // save to existing modular tables ('curriculum_plans', 'modul_ajar', 'assessment_plans')
    const docUuid = toValidUUID(doc.id);
    let modularError: any = null;

    if (doc.type === 'ATP' || doc.type === 'Prota' || doc.type === 'Promes') {
      const payload: any = {
        id: docUuid,
        subject: doc.subject,
        grade: doc.fase,
        semester: profile.semester || 'Genap',
        total_jp: 72,
        selected_elements: [{ doc_id: doc.id, type: doc.type, sub_title: doc.subTitle }],
        core_topic: doc.title,
        generated_markdown: doc.content || doc.title,
        status: doc.status || 'Siap Cetak / PDF',
        updated_at: new Date().toISOString(),
      };
      if (userId) payload.user_id = userId;

      const res = await client.from('curriculum_plans').upsert(payload);
      modularError = res.error;
    } else if (doc.type === 'Asesmen') {
      const payload: any = {
        id: docUuid,
        subject: doc.subject,
        grade: doc.fase,
        semester: profile.semester || 'Genap',
        topic: doc.title,
        target_tp: doc.subTitle || 'Asesmen HOTS dan KKTP',
        cp_element: doc.type,
        assessment_form: 'Tes Tertulis & Kinerja',
        kktp_approach: 'Rubrik Skala Kualitatif',
        duration_minutes: 80,
        generated_markdown: doc.content || doc.title,
        status: doc.status || 'Selesai',
        updated_at: new Date().toISOString(),
      };
      if (userId) payload.user_id = userId;

      const res = await client.from('assessment_plans').upsert(payload);
      modularError = res.error;
    } else {
      // Modul Ajar, LKPD, Bahan Ajar, Media
      const payload: any = {
        id: docUuid,
        subject: doc.subject,
        grade: doc.fase,
        semester: profile.semester || 'Genap',
        topic: doc.title,
        target_tp: doc.subTitle || 'Tujuan Pembelajaran',
        cp_element: doc.type,
        meetings_count: 2,
        duration_per_meeting: '2 Pertemuan x 40 Menit',
        total_students: 32,
        learning_model: 'Problem Based Learning (PBL)',
        generated_markdown: doc.content || doc.title,
        status: doc.status || 'Draf',
        updated_at: new Date().toISOString(),
      };
      if (userId) payload.user_id = userId;

      const res = await client.from('modul_ajar').upsert(payload);
      modularError = res.error;
    }

    if (modularError) {
      console.warn('Supabase modular document save error:', modularError);
      return {
        success: false,
        message: `Gagal menyimpan dokumen ke Supabase: ${modularError.message}`,
        error: modularError,
      };
    }

    return {
      success: true,
      message: 'Dokumen berhasil disimpan & disinkronkan ke Supabase!',
    };
  } catch (e: any) {
    console.error('Supabase document save exception:', e);
    return {
      success: false,
      message: `Error koneksi Supabase: ${e.message}`,
      error: e,
    };
  }
};

export const deleteDocumentFromSupabase = async (
  docId: string
): Promise<{ success: boolean; message: string }> => {
  // Mirror deletion on server
  fetch(`/api/documents/${docId}`, { method: 'DELETE' }).catch(() => {});

  const client = getSupabaseClient();
  if (!client) return { success: true, message: 'Dihapus secara lokal.' };

  try {
    const docUuid = toValidUUID(docId);

    // Try deleting from recent_documents
    await client.from('recent_documents').delete().eq('id', docId);

    // Also delete from modular tables
    await client.from('curriculum_plans').delete().eq('id', docUuid);
    await client.from('modul_ajar').delete().eq('id', docUuid);
    await client.from('assessment_plans').delete().eq('id', docUuid);

    return {
      success: true,
      message: 'Dokumen berhasil dihapus dari cloud database Supabase.',
    };
  } catch (e: any) {
    console.warn('Error deleting from Supabase:', e);
    return {
      success: false,
      message: `Gagal menghapus dari Supabase: ${e.message}`,
    };
  }
};

export const fetchDocumentsFromSupabase = async (): Promise<RecentDocument[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    // 1. Try unified table 'recent_documents' first
    let unifiedQuery = client.from('recent_documents').select('*');
    if (userId) {
      unifiedQuery = unifiedQuery.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data: unified, error: uErr } = await unifiedQuery.order('updated_at', {
      ascending: false,
    });

    if (!uErr && unified && unified.length > 0) {
      return unified.map((row: any) => ({
        id: row.id,
        title: row.title,
        subTitle: row.sub_title || row.subtitle || '',
        subject: row.subject,
        fase: row.fase,
        status: row.status || 'Siap Cetak / PDF',
        lastModified: 'Tersinkron Cloud',
        type: row.type || 'Modul Ajar',
        content: row.content,
      }));
    }

    // 2. Fallback: Query all modular tables that exist in the database
    const results: RecentDocument[] = [];

    // ATP / Curriculum Plans
    let cpQuery = client.from('curriculum_plans').select('*');
    if (userId) cpQuery = cpQuery.or(`user_id.eq.${userId},user_id.is.null`);
    const { data: cpPlans } = await cpQuery.order('updated_at', { ascending: false }).limit(50);
    if (cpPlans) {
      cpPlans.forEach((row: any) => {
        let originalDocId = row.id;
        let originalType = 'ATP';
        let originalSubtitle = `${row.grade} • ${row.semester} • ${row.total_jp || 72} JP`;

        if (Array.isArray(row.selected_elements) && row.selected_elements[0]) {
          const meta = row.selected_elements[0];
          if (meta.doc_id) originalDocId = meta.doc_id;
          if (meta.type) originalType = meta.type;
          if (meta.sub_title) originalSubtitle = meta.sub_title;
        }

        results.push({
          id: originalDocId,
          title: row.core_topic,
          subTitle: originalSubtitle,
          subject: row.subject,
          fase: row.grade,
          status: row.status || 'Siap Cetak / PDF',
          lastModified: 'Tersinkron Cloud',
          type: originalType as any,
          content: row.generated_markdown,
        });
      });
    }

    // Modul Ajar / LKPD / Bahan Ajar
    let modulQuery = client.from('modul_ajar').select('*');
    if (userId) modulQuery = modulQuery.or(`user_id.eq.${userId},user_id.is.null`);
    const { data: modulList } = await modulQuery.order('updated_at', { ascending: false }).limit(50);
    if (modulList) {
      modulList.forEach((row: any) => {
        results.push({
          id: row.id,
          title: row.topic,
          subTitle: row.target_tp || `${row.grade} • ${row.learning_model || 'PBL'}`,
          subject: row.subject,
          fase: row.grade,
          status: row.status || 'Siap Cetak / PDF',
          lastModified: 'Tersinkron Cloud',
          type: (row.cp_element && ['Modul Ajar', 'LKPD', 'Bahan Ajar', 'Media Pembelajaran'].includes(row.cp_element)
            ? row.cp_element
            : 'Modul Ajar') as any,
          content: row.generated_markdown,
        });
      });
    }

    // Assessment Plans
    let assessQuery = client.from('assessment_plans').select('*');
    if (userId) assessQuery = assessQuery.or(`user_id.eq.${userId},user_id.is.null`);
    const { data: assessList } = await assessQuery.order('updated_at', { ascending: false }).limit(50);
    if (assessList) {
      assessList.forEach((row: any) => {
        results.push({
          id: row.id,
          title: row.topic,
          subTitle: row.target_tp || `${row.grade} • ${row.kktp_approach || 'Rubrik'}`,
          subject: row.subject,
          fase: row.grade,
          status: row.status || 'Siap Cetak / PDF',
          lastModified: 'Tersinkron Cloud',
          type: 'Asesmen',
          content: row.generated_markdown,
        });
      });
    }

    return results;
  } catch (e) {
    console.warn('Error fetching documents from Supabase:', e);
    return [];
  }
};

// =========================================================================
// Realtime Subscription Helper (Requirement 2: Cross-Device Live Sync)
// =========================================================================

export const subscribeToRealtimeChanges = (
  onDataChanged: (table: string, eventType: string) => void
): (() => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('edustudio_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        onDataChanged('profiles', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recent_documents' }, (payload) => {
        onDataChanged('recent_documents', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'curriculum_plans' }, (payload) => {
        onDataChanged('curriculum_plans', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modul_ajar' }, (payload) => {
        onDataChanged('modul_ajar', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_plans' }, (payload) => {
        onDataChanged('assessment_plans', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_subjects' }, (payload) => {
        onDataChanged('custom_subjects', payload.eventType);
      })
      .subscribe((status) => {
        console.log('Realtime sync channel status:', status);
      });

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Could not set up Supabase Realtime channel:', err);
    return () => {};
  }
};

// =========================================================================
// Custom Subjects Sync Helpers
// =========================================================================

export const fetchCustomSubjectsFromSupabase = async (): Promise<string[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    let query = client.from('custom_subjects').select('subject_name');
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      return data.map((r: any) => r.subject_name).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
};

export const saveCustomSubjectToSupabase = async (
  subjectName: string
): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client not initialized' };

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    const payload: any = {
      subject_name: subjectName.trim(),
      updated_at: new Date().toISOString(),
    };
    if (userId) payload.user_id = userId;

    const { error } = await client.from('custom_subjects').upsert(payload, {
      onConflict: 'user_id,subject_name',
    });

    if (error) {
      console.warn('Supabase custom subject save notice:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Mata pelajaran berhasil disinkronkan ke Supabase.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error simpan mapel kustom' };
  }
};

export const deleteCustomSubjectFromSupabase = async (
  subjectName: string
): Promise<{ success: boolean }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false };

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    let query = client.from('custom_subjects').delete().eq('subject_name', subjectName.trim());
    if (userId) {
      query = query.eq('user_id', userId);
    }

    await query;
    return { success: true };
  } catch {
    return { success: false };
  }
};

// =========================================================================
// Full Multi-Device Cloud Synchronization
// Supabase as the Single Source of Truth
// =========================================================================

export const syncAllDataAcrossDevices = async (
  currentDocs: RecentDocument[],
  currentProfile: TeacherProfile
): Promise<{
  syncedDocs: RecentDocument[];
  syncedProfile: TeacherProfile;
  source: 'supabase' | 'server' | 'local';
}> => {
  // Step 1: Ensure Supabase client is initialized
  const client = getSupabaseClient();
  if (!client) {
    return {
      syncedDocs: currentDocs,
      syncedProfile: currentProfile,
      source: 'local',
    };
  }

  try {
    // Step 2: Fetch authoritative data from Supabase
    const cloudDocs = await fetchDocumentsFromSupabase();
    const cloudProfile = await fetchProfileFromSupabase();

    // If Supabase has data, Supabase is the Single Source of Truth!
    if (cloudDocs.length > 0 || cloudProfile) {
      // If cloudProfile exists or cloudDocs was found, the cloud database is initialized.
      // If cloudDocs has records, use cloudDocs. If cloudProfile exists but cloudDocs is empty,
      // it means the user's cloud library is empty, so we should not resurrect deleted local dummy documents.
      const activeDocs = cloudDocs.length > 0 ? cloudDocs : (cloudProfile ? [] : currentDocs);
      const activeProfile = cloudProfile ? { ...currentProfile, ...cloudProfile } : currentProfile;

      // Update local storage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('edumerdeka_docs', JSON.stringify(activeDocs));
        localStorage.setItem('edumerdeka_profile', JSON.stringify(activeProfile));

        // Sync Custom Subjects from Supabase
        const cloudSubjects = await fetchCustomSubjectsFromSupabase();
        if (cloudSubjects.length > 0) {
          try {
            const localRaw = localStorage.getItem('edumerdeka_custom_subjects');
            const localList: string[] = localRaw ? JSON.parse(localRaw) : [];
            const merged = Array.from(new Set([...localList, ...cloudSubjects]));
            localStorage.setItem('edumerdeka_custom_subjects', JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('subjects_updated', { detail: merged }));
          } catch {}
        }
      }

      // Mirror to server for secondary dev sync
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: activeDocs, profile: activeProfile }),
      }).catch(() => {});

      return {
        syncedDocs: activeDocs,
        syncedProfile: activeProfile,
        source: 'supabase',
      };
    }

    // If Supabase is connected but completely empty, upload current initial documents to Supabase!
    if (currentDocs.length > 0) {
      console.log('Bootstrapping cloud with initial user documents...');
      for (const doc of currentDocs) {
        await saveDocumentToSupabase(doc, currentProfile);
      }
      await saveProfileToSupabase(currentProfile);

      return {
        syncedDocs: currentDocs,
        syncedProfile: currentProfile,
        source: 'supabase',
      };
    }
  } catch (err) {
    console.warn('Supabase sync notice:', err);
  }

  // Fallback to server sync if Supabase is unreachable
  try {
    const srvRes = await fetch('/api/sync');
    if (srvRes.ok) {
      const srvData = await srvRes.json();
      let effectiveDocs = currentDocs;
      let effectiveProfile = currentProfile;

      if (Array.isArray(srvData.documents) && srvData.documents.length > 0) {
        effectiveDocs = srvData.documents;
      }
      if (srvData.profile && srvData.profile.name) {
        effectiveProfile = srvData.profile;
      }

      return {
        syncedDocs: effectiveDocs,
        syncedProfile: effectiveProfile,
        source: 'server',
      };
    }
  } catch {}

  return {
    syncedDocs: currentDocs,
    syncedProfile: currentProfile,
    source: 'local',
  };
};

// Batch Manual Sync helper
export const syncDocumentsToSupabase = async (
  documents: RecentDocument[],
  profile: TeacherProfile
): Promise<{ success: boolean; syncedCount: number; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCount: 0,
      message: 'Koneksi Supabase belum aktif. Mohon periksa URL & Anon Key di menu Pengaturan.',
    };
  }

  try {
    await saveProfileToSupabase(profile);

    let synced = 0;
    for (const doc of documents) {
      const res = await saveDocumentToSupabase(doc, profile);
      if (res.success) synced++;
    }

    return {
      success: true,
      syncedCount: synced,
      message: `Berhasil menyinkronkan profil dan ${synced} dokumen ke cloud database Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal menyinkronkan dokumen: ${err.message || 'Error Supabase'}`,
    };
  }
};
