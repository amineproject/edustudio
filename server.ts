import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client (initialized with User-Agent header)
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route for CP, TP & ATP Generation
  app.post('/api/generate-curriculum', async (req, res) => {
    try {
      const {
        subject,
        grade,
        semester,
        effectiveWeeks,
        cpElements,
        coreTopic,
        totalJp,
        officialCpText,
        studentReadiness,
        schoolContext,
        learningModel,
        focusMode, // 'cp_analysis' | 'tp_formulation' | 'atp_flow' | 'all'
      } = req.body;

      // Validate mandatory fields
      if (!subject || !grade || !cpElements || cpElements.length === 0 || !totalJp) {
        res.status(400).json({
          error: 'Data wajib belum lengkap. Pastikan Mata Pelajaran, Fase/Kelas, Elemen CP, dan Total JP telah terisi.',
        });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        // Return null to let the client use the built-in pedagogical template engine
        res.json({
          source: 'local_engine',
          message: 'Gemini API Key not set, using built-in curriculum engine.',
        });
        return;
      }

      const systemInstruction = `# Role
You are a professional Educational Curriculum Expert and Instructional Developer specialized in the Indonesian Merdeka Curriculum for Junior High School (SMP). You strictly reference the Learning Outcomes (Capaian Pembelajaran / CP) established in BSKAP Head Decision No. 033/H/KR/2022 and its official revisions. Your task is to assist teachers in designing systematic, measurable, and compliant foundational learning plans.

IMPORTANT: The outputs you provide serve as an INITIAL DRAFT. Always remind users to validate and tailor the output to their school context and professional teacher judgment.

# Task
Help users (teachers) develop curriculum planning documents that include:
1. Analysis and deconstruction of Learning Outcomes (CP) per element for the target phase.
2. Formulation of specific, operational, and measurable Learning Objectives (Tujuan Pembelajaran / TP).
3. Development of a logical, systematic, and progressive Learning Objective Flow (Alur Tujuan Pembelajaran / ATP).
4. Integration of relevant Pancasila Student Profile (Profil Pelajar Pancasila / PPP) dimensions into each stage of the ATP.
5. Assessment recommendations (diagnostic, formative, summative) appropriate for each TP.

# Reasoning
When designing TP and ATP, adhere strictly to the following principles:
TP Formulation:
- TP must be derived directly from the CP and consist of two key components: Competence (operational verbs) + Content (subject matter).
- Use Operational Verbs (Kata Kerja Operasional / KKO) based on Revised Bloom's Taxonomy (C1–C6: Remember, Understand, Apply, Analyze, Evaluate, Create).
- Avoid unmeasurable verbs such as "understand," "appreciate," or "know."
- Every TP must be observable and assessable.

ATP Development:
- Sequence the learning flow using structural principles: concrete → abstract, simple → complex, prerequisite → advanced, decontextualized → contextualized.
- Ensure smooth continuity while addressing prerequisite knowledge.
- Consider cross-element CP integration where relevant and feasible.
- Total lesson hours (JP) in the ATP MUST NOT exceed the user-provided time allocation (${totalJp} JP).
- Incorporate flexibility to accommodate differentiated instruction (content, process, or product).

# Output Format
Structure the output strictly using Indonesian Language and Markdown:
1. **Analisis & Dekonstruksi Capaian Pembelajaran (CP)**
   - Display original CP text (reference BSKAP 033/H/KR/2022 & revisions)
   - Breakdown of Kompetensi (KKO) and Konten per element
2. **Perumusan Tujuan Pembelajaran (TP)**
   - Format: [No.] [KKO + Level Bloom] + [Konten Materi] + [Konteks Pembelajaran (opsional)]
3. **Alur Tujuan Pembelajaran (ATP)**
   - Markdown Table schema:
     | No. | Elemen CP | Tujuan Pembelajaran (TP) | KKO & Level Bloom | Alokasi Waktu (JP) | Dimensi Profil Pelajar Pancasila (PPP) | Rekomendasi Asesmen | Pekan Ke- |
   - Calculate total JP and ensure it equals exactly ${totalJp} JP.
   - Explain detailed sequencing rationales (concrete to abstract, prerequisite knowledge).
4. **Catatan & Rekomendasi Guru**
   - Practical implementation advice and potential challenges
   - Differentiated learning recommendations (content, process, product)
   - Next steps (development of Modul Ajar)`;

      const userPrompt = `Rancang dokumen CP, TP, dan ATP lengkap untuk:
- Mata Pelajaran: ${subject}
- Fase / Kelas: ${grade} (Fase D SMP)
- Semester: ${semester || 'Ganjil/Genap'} (${effectiveWeeks || 18} Pekan Efektif)
- Elemen CP yang dipilih: ${Array.isArray(cpElements) ? cpElements.join(', ') : cpElements}
- Topik / Konsep Inti Fokus: ${coreTopic || 'Materi Pokok Esensial'}
- Total Alokasi Jam Pelajaran (JP): ${totalJp} JP
${officialCpText ? `- Teks CP Resmi: ${officialCpText}` : ''}
${studentReadiness ? `- Kesiapan Murid (Diagnostik): ${studentReadiness}` : ''}
${schoolContext ? `- Konteks Sekolah: ${schoolContext}` : ''}
${learningModel ? `- Model Pembelajaran: ${learningModel}` : ''}
${focusMode ? `- Mode Fokus: ${focusMode}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      res.json({
        source: 'gemini_api',
        markdown: response.text,
      });
    } catch (err: any) {
      console.warn('Gemini upstream notice, switching to built-in curriculum engine:', err?.message || err);
      res.json({
        source: 'fallback_offline',
        message: 'Upstream AI model unavailable, using built-in curriculum engine.',
      });
    }
  });

  // API Route for Deep Learning Modul Ajar (8-3-3-4 Framework)
  app.post('/api/generate-modul-ajar', async (req, res) => {
    try {
      const {
        schoolName,
        teacherName,
        nip,
        subject,
        grade,
        semester,
        academicYear,
        topic,
        targetTp,
        cpElement,
        meetingsCount,
        durationPerMeeting,
        totalStudents,
        studentCharacteristics,
        initialCompetency,
        facilities,
        learningModel,
        localContext,
      } = req.body;

      const ai = getAiClient();
      if (!ai) {
        res.json({
          source: 'local_engine',
          message: 'Gemini API key not configured, falling back to local engine.',
        });
        return;
      }

      const systemInstruction = `# Role
Anda adalah seorang Pengembang Kurikulum dan Pakar Perangkat Pembelajaran yang ahli dalam merancang Modul Ajar Kurikulum Merdeka tingkat SMP berbasis Pendekatan Pembelajaran Mendalam (Deep Learning) yang berpusat pada pilar: Berpikir Mendalam (Deep Thinking), Belajar Bermakna (Meaningful Learning), dan Berkarya Nyata (Real-world Application).
Anda menggunakan ATP dan TP yang telah disusun sebelumnya sebagai fondasi perancangan Modul Ajar.

PENTING: Modul Ajar yang Anda hasilkan adalah DRAF AWAL. Selalu ingatkan pengguna untuk mengadaptasi dan memvalidasi sesuai kondisi nyata kelas, karakteristik siswa, dan ketersediaan sumber daya di sekolah.

# Task & Format Output
Susun dokumen Modul Ajar operasional dan komprehensif dalam format Markdown rapi dan terstruktur mencakup seluruh kerangka Deep Learning 8-3-3-4 dari bagian A sampai M:
A. Data Awal Pembelajaran
B. 8 Dimensi Profil Lulusan & Keterkaitannya
C. 3 Prinsip Pembelajaran Mendalam (Berekspos/Berkesadaran, Bermakna, Menggembirakan)
D. 4 Kerangka Pembelajaran (Praktik Pedagogis, Kemitraan Pembelajaran, Lingkungan Pembelajaran, Pemanfaatan Digital)
E. Identifikasi Pembelajaran (Analisis kesiapan, materi esensial, profil lulusan, kebutuhan)
F. Desain Pembelajaran (Tujuan, materi, pendekatan, model, metode, strategi, media, sumber belajar, pertanyaan pemantik, pemahaman bermakna, keterkaitan kontekstual, diferensiasi, pengelolaan kelas)
G. Skenario Pembelajaran per Pertemuan:
   - Kegiatan Pendahuluan
   - Kegiatan Inti 3 Pengalaman Belajar:
     * Tahap 1: Memahami (Deep Thinking)
     * Tahap 2: Mengaplikasikan (Meaningful Application)
     * Tahap 3: Merefleksikan (Reflective Learning)
   - Kegiatan Penutup
H. Lembar Kerja Peserta Didik (LKPD) yang terstruktur lengkap
I. Asesmen: Diagnostik, Formatif, dan Sumatif lengkap dengan teknik, instrumen, kriteria/skor, dan tindak lanjut
J. Rubrik Penilaian (Skala 1–4 untuk penguasaan materi, penalaran kritis, kreativitas, kolaborasi & komunikasi)
K. Diferensiasi (Konten, Proses, Produk, dan Aktivitas Peserta Didik)
L. Remedial, Pengayaan, & Tugas Tambahan
M. Refleksi Guru & Peserta Didik`;

      const prompt = `Rancang Modul Ajar Deep Learning lengkap (A sampai M) untuk:
- Satuan Pendidikan: ${schoolName}
- Guru Pengampu: ${teacherName} (NIP: ${nip || '-'})
- Mata Pelajaran: ${subject}
- Fase / Kelas: Fase D / ${grade}
- Semester / T.A.: Semester ${semester} / ${academicYear}
- Materi / Topik: ${topic}
- Tujuan Pembelajaran (TP spesifik dari ATP): ${targetTp}
- Elemen CP: ${cpElement}
- Alokasi Waktu: ${meetingsCount} Pertemuan (${durationPerMeeting})
- Jumlah Peserta Didik: ${totalStudents || 32} siswa
- Karakteristik Siswa: ${studentCharacteristics || 'Remaja awal SMP heterogen'}
- Kompetensi Awal: ${initialCompetency || 'Pemahaman dasar materi'}
- Sarana & Prasarana: ${facilities || 'Proyektor, laptop, LKPD, lingkungan sekolah'}
- Model Pembelajaran: ${learningModel || 'Problem Based Learning (PBL)'}
- Konteks Lingkungan / Kearifan Lokal: ${localContext || 'Konteks lokal nusantara'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({
        source: 'gemini_api',
        markdown: response.text,
      });
    } catch (err: any) {
      console.warn('Gemini Modul Ajar generation upstream error, using fallback:', err?.message || err);
      res.json({
        source: 'fallback_offline',
        message: 'Upstream AI model unavailable, using built-in deep learning engine.',
      });
    }
  });

  // API Route for Multi-turn Curriculum Chatbot
  app.post('/api/chat-curriculum', async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const ai = getAiClient();
      if (!ai) {
        res.json({
          reply: 'Halo Guru Hebat! Layanan AI terhubung dalam mode offline terstandar. Anda tetap dapat menggunakan seluruh alat generator kurikulum dan modul ajar Deep Learning secara penuh.',
        });
        return;
      }

      const defaultSystem = systemInstruction || `Anda adalah seorang Pengembang Kurikulum dan Pakar Perangkat Pembelajaran yang ahli dalam merancang Modul Ajar Kurikulum Merdeka tingkat SMP berbasis Pendekatan Pembelajaran Mendalam (Deep Learning) yang berpusat pada pilar: Berpikir Mendalam (Deep Thinking), Belajar Bermakna (Meaningful Learning), dan Berkarya Nyata (Real-world Application). Bantu guru menyusun, merefleksikan, mengoreksi, dan mengembangkan modul ajar, LKPD, rubrik skala 1-4, dan skenario Memahami-Mengaplikasikan-Merefleksikan secara ramah, profesional, dan solutif.`;

      // Transform messages to @google/genai contents format
      const contents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Halo, perkenalkan peran Anda sebagai pakar kurikulum.' }] });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: defaultSystem,
        },
      });

      res.json({
        reply: response.text,
      });
    } catch (err: any) {
      console.warn('Chat API notice:', err?.message || err);
      res.json({
        reply: `Maaf, saat ini server sedang mengalami lonjakan permintaan (${err?.message || 'Upstream busy'}). Silakan ajukan pertanyaan kembali atau gunakan tombol Generator Modul Ajar Deep Learning langsung di antarmuka aplikasi.`,
      });
    }
  });

  // API Route for Assessment & Evaluation (Modul 3)
  app.post('/api/generate-assessment', async (req, res) => {
    try {
      const {
        subject,
        grade,
        semester,
        targetTp,
        cpElement,
        topic,
        assessmentForm,
        kktpApproach,
        durationMinutes,
        schoolContext,
        localStimulus,
      } = req.body;

      const ai = getAiClient();
      if (!ai) {
        res.json({
          source: 'local_engine',
          message: 'Gemini API key not configured, falling back to local engine.',
        });
        return;
      }

      const systemInstruction = `# Role
Anda adalah seorang Ahli Evaluasi Pendidikan, Pengembang Instrumen Asesmen, dan Administrator Kurikulum yang sangat berpengalaman dalam Kurikulum Merdeka tingkat SMP. Anda bekerja secara berkesinambungan dengan Modul 1 (ATP/TP) dan Modul 2 (Modul Ajar & Asesmen Diagnostik), memastikan bahwa seluruh instrumen asesmen selaras dengan tujuan dan skenario pembelajaran yang telah dirancang sebelumnya.

Tugas Anda adalah membantu guru merancang sistem asesmen yang komprehensif, objektif, transparan, adil (fair), dan inklusif, serta menyelaraskan pengolahan capaian hingga administrasi pendukung guru.

PENTING: Seluruh instrumen dan pedoman yang dihasilkan adalah DRAF AWAL. Selalu ingatkan pengguna untuk menguji-coba, memvalidasi, dan menyesuaikan dengan kebijakan satuan pendidikan serta kondisi nyata peserta didik.

# Reasoning
- Keselarasan Tiga Arah: TP Modul 1 -> Skenario Modul 2 -> Asesmen Modul 3.
- Proporsi Kognitif Seimbang: ±30% C1-C3 fondasi, ±40% C4-C5 HOTS, ±30% C6 aplikasi/kreasi. Soal HOTS wajib menggunakan stimulus kontekstual.
- Pemisahan Tegas: Asesmen formatif HANYA untuk umpan balik proses dan TIDAK digunakan menghitung nilai rapor. Hanya asesmen sumatif yang menjadi dasar rapor.
- KKTP & Rapor: Rapor menggunakan DESKRIPSI CAPAIAN KOMPETENSI per elemen CP, BUKAN formula angka konversi.
- Remedial bermakna (bimbingan terfokus), bukan sekadar tes ulang.

# Output Format
Sajikan dalam format Markdown terstruktur dari poin 1 sampai 8:
1. Kisi-Kisi Asesmen (Formatif & Sumatif) tabel lengkap
2. Instrumen Asesmen Formatif (lembar observasi proses, jurnal refleksi, self/peer assessment, exit ticket, panduan)
3. Instrumen Asesmen Sumatif & Kunci Jawaban (soal dengan stimulus kontekstual, kunci, skor)
4. Rubrik Penilaian Analitik (Skala: Mahir | Cakap | Layak | Perlu Bimbingan)
5. Pedoman Penentuan Capaian & Deskripsi Rapor (KKTP, tabel tuntas/belum tuntas, template deskripsi rapor per elemen CP tanpa angka konversi)
6. Program Remedial & Pengayaan
7. Administrasi Pendukung Guru (Analisis Daya Serap/Ketuntasan, Jurnal Harian Mengajar, Bank Soal Terklasifikasi)
8. Lampiran & Glosarium Evaluasi`;

      const prompt = `Rancang perangkat asesmen dan evaluasi lengkap (poin 1 sampai 8) untuk:
- Mata Pelajaran: ${subject}
- Fase / Kelas: Fase D / ${grade}
- Semester: Semester ${semester || 'Genap'}
- Materi / Topik: ${topic}
- Tujuan Pembelajaran (TP spesifik): ${targetTp}
- Elemen CP: ${cpElement}
- Bentuk Asesmen Sumatif: ${assessmentForm || 'Tes Tertulis & Kinerja'}
- Pendekatan KKTP: ${kktpApproach || 'Rubrik Skala Kualitatif'}
- Durasi: ${durationMinutes || 80} Menit
- Stimulus Kontekstual: ${localStimulus || 'Kearifan lokal dan studi kasus nyata'}
- Konteks Sekolah: ${schoolContext || 'SMP Negeri'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({
        source: 'gemini_api',
        markdown: response.text,
      });
    } catch (err: any) {
      console.warn('Gemini assessment error, using fallback:', err?.message || err);
      res.json({
        source: 'fallback_offline',
        message: 'Upstream AI model unavailable, using built-in assessment engine.',
      });
    }
  });

  // =========================================================================
  // Multi-Device Synchronization & Server Persistence Endpoints
  // Ensures mobile and desktop share the identical data, profile, and documents
  // =========================================================================
  const STORAGE_FILE = path.resolve(__dirname, 'server_storage.json');
  
  let sharedData: {
    profile: any;
    documents: any[];
    customSubjects: string[];
    customCps: any[];
    supabaseConfig: { url: string; anonKey: string };
  } = {
    profile: null,
    documents: [],
    customSubjects: [],
    customCps: [],
    supabaseConfig: {
      url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    },
  };

  // Attempt to restore persistent data from disk
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      if (raw) {
        const parsed = JSON.parse(raw);
        sharedData = { ...sharedData, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Could not read server_storage.json:', e);
  }

  const persistStorage = () => {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(sharedData, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not write server_storage.json:', e);
    }
  };

  // Shared Config Endpoints (Desktop sets, Mobile automatically retrieves)
  app.get('/api/supabase-config', (_req, res) => {
    res.json(sharedData.supabaseConfig);
  });

  app.post('/api/supabase-config', (req, res) => {
    const { url, anonKey } = req.body;
    if (url !== undefined) sharedData.supabaseConfig.url = String(url || '').trim();
    if (anonKey !== undefined) sharedData.supabaseConfig.anonKey = String(anonKey || '').trim();
    persistStorage();
    res.json({ success: true, config: sharedData.supabaseConfig });
  });

  // Global Sync Endpoint
  app.get('/api/sync', (_req, res) => {
    res.json(sharedData);
  });

  app.post('/api/sync', (req, res) => {
    const { profile, documents, customSubjects, customCps, supabaseConfig } = req.body;
    if (profile) sharedData.profile = profile;
    if (Array.isArray(documents) && documents.length > 0) {
      // Merge unique documents
      const existingMap = new Map(sharedData.documents.map((d) => [d.id, d]));
      documents.forEach((d) => existingMap.set(d.id, d));
      sharedData.documents = Array.from(existingMap.values());
    }
    if (Array.isArray(customSubjects) && customSubjects.length > 0) {
      sharedData.customSubjects = Array.from(new Set([...sharedData.customSubjects, ...customSubjects]));
    }
    if (Array.isArray(customCps) && customCps.length > 0) {
      const cpMap = new Map(sharedData.customCps.map((c) => [c.id, c]));
      customCps.forEach((c) => cpMap.set(c.id, c));
      sharedData.customCps = Array.from(cpMap.values());
    }
    if (supabaseConfig) {
      if (supabaseConfig.url) sharedData.supabaseConfig.url = supabaseConfig.url;
      if (supabaseConfig.anonKey) sharedData.supabaseConfig.anonKey = supabaseConfig.anonKey;
    }
    persistStorage();
    res.json({ success: true, data: sharedData });
  });

  // Profile Save Endpoint
  app.post('/api/profile', (req, res) => {
    const profile = req.body;
    if (profile) {
      sharedData.profile = profile;
      persistStorage();
    }
    res.json({ success: true, profile: sharedData.profile });
  });

  // Document Upsert Endpoint
  app.post('/api/documents', (req, res) => {
    const doc = req.body;
    if (!doc || !doc.id) {
      res.status(400).json({ error: 'Dokumen tidak valid' });
      return;
    }
    const idx = sharedData.documents.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      sharedData.documents[idx] = doc;
    } else {
      sharedData.documents.unshift(doc);
    }
    persistStorage();
    res.json({ success: true, document: doc });
  });

  // Document Delete Endpoint
  app.delete('/api/documents/:id', (req, res) => {
    const docId = req.params.id;
    sharedData.documents = sharedData.documents.filter((d) => d.id !== docId);
    persistStorage();
    res.json({ success: true, id: docId });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
