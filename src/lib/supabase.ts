import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RecentDocument, TeacherProfile, CapaianPembelajaran } from '../types';

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
  const trimmedUrl = config.url.trim();
  const trimmedKey = config.anonKey.trim();
  localStorage.setItem('edumerdeka_supabase_url', trimmedUrl);
  localStorage.setItem('edumerdeka_supabase_key', trimmedKey);

  // Sync with server so mobile devices can access the same Supabase config
  fetch('/api/supabase-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey }),
  }).catch((e) => console.warn('Could not sync Supabase config to server:', e));
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
    // Attempt a light read from profiles table
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Terhubung ke server Supabase! (Catatan: Tabel database belum dibuat, silakan jalankan skrip SQL di menu SQL Editor Supabase).',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Database aktif & siap menyinkronkan data antar-perangkat.',
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
  // Always mirror to server storage first for multi-device cross-sync
  fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).catch((e) => console.warn('Could not mirror profile to server:', e));

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: 'Profil disimpan secara lokal & server. (Untuk menyimpan ke cloud Supabase, masukkan URL & Key di bawah).',
    };
  }

  try {
    const payload = {
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

    // Check if any profile row exists
    const { data: existing } = await client.from('profiles').select('id').limit(1);
    let error;

    if (existing && existing.length > 0) {
      const res = await client.from('profiles').update(payload).eq('id', existing[0].id);
      error = res.error;
    } else {
      const res = await client.from('profiles').insert([payload]);
      error = res.error;
    }

    if (error) {
      console.warn('Supabase profile save notice:', error.message);
      return {
        success: false,
        message: `Tersimpan di perangkat & server, namun tabel 'profiles' di Supabase belum ada atau gagal: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Profil guru & NIP Kepala Sekolah berhasil disimpan di Supabase!',
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
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

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
    };
  } catch (err) {
    console.warn('Error fetching profile from Supabase:', err);
    return null;
  }
};

// =========================================================================
// Document CRUD (Save, Delete, Fetch)
// =========================================================================
export const saveDocumentToSupabase = async (
  doc: RecentDocument,
  profile: TeacherProfile
): Promise<void> => {
  // Always mirror to server storage first so mobile immediately gets it
  fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  }).catch((e) => console.warn('Could not mirror document to server:', e));

  const client = getSupabaseClient();
  if (!client) return;

  try {
    // 1. Try upserting to recent_documents unified table
    const { error: unifiedError } = await client.from('recent_documents').upsert({
      id: doc.id,
      title: doc.title,
      sub_title: doc.subTitle,
      subject: doc.subject,
      fase: doc.fase,
      status: doc.status,
      type: doc.type,
      content: doc.content || doc.title,
      updated_at: new Date().toISOString(),
    });

    if (unifiedError) {
      // 2. Fallback to specific type tables if recent_documents doesn't exist
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
      }
    }
  } catch (e) {
    console.warn('Supabase document save notice:', e);
  }
};

export const deleteDocumentFromSupabase = async (docId: string): Promise<void> => {
  // Mirror deletion on server
  fetch(`/api/documents/${docId}`, { method: 'DELETE' }).catch((e) =>
    console.warn('Could not mirror document delete on server:', e)
  );

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('recent_documents').delete().eq('id', docId);
    await client.from('curriculum_plans').delete().eq('id', docId);
    await client.from('modul_ajar').delete().eq('id', docId);
    await client.from('assessment_plans').delete().eq('id', docId);
  } catch (e) {
    console.warn('Error deleting from Supabase:', e);
  }
};

export const fetchDocumentsFromSupabase = async (): Promise<RecentDocument[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    // Try recent_documents table first
    const { data: unified, error: uErr } = await client
      .from('recent_documents')
      .select('*')
      .order('updated_at', { ascending: false });

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

    // Fallback: Query modular tables
    const results: RecentDocument[] = [];

    const { data: cpPlans } = await client.from('curriculum_plans').select('*').limit(50);
    if (cpPlans) {
      cpPlans.forEach((row: any) => {
        results.push({
          id: row.id,
          title: `Analisis CP, TP & ATP - ${row.core_topic}`,
          subTitle: `${row.grade} • ${row.semester} • ${row.total_jp || 72} JP`,
          subject: row.subject,
          fase: row.grade,
          status: row.status || 'Siap Cetak / PDF',
          lastModified: 'Tersinkron Cloud',
          type: 'ATP',
          content: row.generated_markdown,
        });
      });
    }

    const { data: modulList } = await client.from('modul_ajar').select('*').limit(50);
    if (modulList) {
      modulList.forEach((row: any) => {
        results.push({
          id: row.id,
          title: `Modul Ajar Deep Learning - ${row.topic}`,
          subTitle: `${row.grade} • ${row.learning_model || 'PBL'}`,
          subject: row.subject,
          fase: row.grade,
          status: row.status || 'Siap Cetak / PDF',
          lastModified: 'Tersinkron Cloud',
          type: 'Modul Ajar',
          content: row.generated_markdown,
        });
      });
    }

    const { data: assessList } = await client.from('assessment_plans').select('*').limit(50);
    if (assessList) {
      assessList.forEach((row: any) => {
        results.push({
          id: row.id,
          title: `Instrumen Asesmen HOTS - ${row.topic}`,
          subTitle: `${row.grade} • ${row.kktp_approach || 'Rubrik'}`,
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
// Full Multi-Device Cloud Synchronization
// Combines Supabase and Server Storage to ensure desktop and mobile match
// =========================================================================
export const syncAllDataAcrossDevices = async (
  currentDocs: RecentDocument[],
  currentProfile: TeacherProfile
): Promise<{
  syncedDocs: RecentDocument[];
  syncedProfile: TeacherProfile;
  source: 'supabase' | 'server' | 'local';
}> => {
  // Step 1: Ensure Supabase config is known on this device
  let cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    try {
      const res = await fetch('/api/supabase-config');
      if (res.ok) {
        const srvCfg = await res.json();
        if (srvCfg.url && srvCfg.anonKey) {
          saveSupabaseConfig(srvCfg);
          cfg = srvCfg;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Step 2: Try fetching from Supabase if connected
  let cloudDocs = await fetchDocumentsFromSupabase();
  let cloudProfile = await fetchProfileFromSupabase();

  if (cloudDocs.length > 0 || cloudProfile) {
    // If Supabase returned data, merge with current docs
    const mergedMap = new Map<string, RecentDocument>();
    currentDocs.forEach((d) => mergedMap.set(d.id, d));
    cloudDocs.forEach((d) => mergedMap.set(d.id, d));
    const mergedDocs = Array.from(mergedMap.values());

    const activeProfile = cloudProfile || currentProfile;

    // Cache locally
    localStorage.setItem('edumerdeka_docs', JSON.stringify(mergedDocs));
    localStorage.setItem('edumerdeka_profile', JSON.stringify(activeProfile));

    // Mirror to server
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: mergedDocs, profile: activeProfile }),
    }).catch(() => {});

    return {
      syncedDocs: mergedDocs,
      syncedProfile: activeProfile,
      source: 'supabase',
    };
  }

  // Step 3: Fallback to server sync (crucial when mobile opens without Supabase tables yet)
  try {
    const srvRes = await fetch('/api/sync');
    if (srvRes.ok) {
      const srvData = await srvRes.json();
      let effectiveDocs = currentDocs;
      let effectiveProfile = currentProfile;

      if (Array.isArray(srvData.documents) && srvData.documents.length > 0) {
        const map = new Map<string, RecentDocument>();
        currentDocs.forEach((d) => map.set(d.id, d));
        srvData.documents.forEach((d: RecentDocument) => map.set(d.id, d));
        effectiveDocs = Array.from(map.values());
      }

      if (srvData.profile && srvData.profile.name) {
        effectiveProfile = srvData.profile;
      }

      // If this device had more recent documents or profile, push to server
      if (currentDocs.length > (srvData.documents?.length || 0)) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documents: currentDocs, profile: currentProfile }),
        }).catch(() => {});
      }

      localStorage.setItem('edumerdeka_docs', JSON.stringify(effectiveDocs));
      localStorage.setItem('edumerdeka_profile', JSON.stringify(effectiveProfile));

      return {
        syncedDocs: effectiveDocs,
        syncedProfile: effectiveProfile,
        source: 'server',
      };
    }
  } catch (e) {
    console.warn('Server sync error:', e);
  }

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
      message: 'Koneksi Supabase belum aktif. Mohon simpan URL & Anon Key di menu Pengaturan.',
    };
  }

  try {
    // Save profile first
    await saveProfileToSupabase(profile);

    let synced = 0;
    for (const doc of documents) {
      await saveDocumentToSupabase(doc, profile);
      synced++;
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
