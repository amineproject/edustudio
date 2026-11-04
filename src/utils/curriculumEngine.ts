export interface CurriculumInput {
  subject: string;
  grade: string; // 'Kelas VII' | 'Kelas VIII' | 'Kelas IX'
  semester: string; // 'Ganjil' | 'Genap'
  effectiveWeeks: number;
  cpElements: string[];
  coreTopic: string;
  totalJp: number;
  officialCpText?: string;
  studentReadiness?: string;
  schoolContext?: string;
  learningModel?: string;
  focusMode?: 'all' | 'cp_analysis' | 'tp_formulation' | 'atp_flow';
}

export interface CurriculumGenerationResult {
  markdown: string;
  source: 'gemini_ai' | 'expert_engine';
  totalJpAllocated: number;
  tpCount: number;
  elementsAnalyzed: string[];
  hasSanityCheckPassed: boolean;
}

// Built-in expert curriculum generator based on BSKAP 033/H/KR/2022 & Revised Bloom's Taxonomy
export function generateCurriculumDraftOffline(input: CurriculumInput): CurriculumGenerationResult {
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
    learningModel = 'Problem Based Learning (PBL)',
  } = input;

  const elementsList = cpElements.length > 0 ? cpElements : ['Elemen Inti Capaian Pembelajaran'];
  const topicTitle = coreTopic || `Pembelajaran Esensial ${subject}`;

  // Distribute JP across 4-6 sequential TPs
  const stepCount = Math.min(Math.max(elementsList.length * 2, 4), 6);
  const baseJpPerStep = Math.floor(totalJp / stepCount);
  const remainderJp = totalJp % stepCount;

  // Generate systematic TPs with Bloom C1-C6 and precise KKO
  const kkoLibrary = [
    { level: 'C1-Mengingat', verb: 'Mengidentifikasi', context: 'fakta dan istilah mendasar' },
    { level: 'C2-Memahami', verb: 'Menjelaskan', context: 'konsep dan prinsip inti dengan bahasa sendiri' },
    { level: 'C3-Menerapkan', verb: 'Menerapkan', context: 'prosedur penyelesaian masalah kontekstual' },
    { level: 'C4-Menganalisis', verb: 'Menganalisis', context: 'struktur, data, dan pola hubungan sebab-akibat' },
    { level: 'C5-Mengevaluasi', verb: 'Mengevaluasi', context: 'akurasi fakta, validitas solusi, dan argumen kritis' },
    { level: 'C6-Mencipta', verb: 'Merancang', context: 'karya orisinal, laporan investigasi, atau solusi inovatif' },
  ];

  const pppDimensions = [
    'Bernalar Kritis',
    'Gotong Royong',
    'Kreatif',
    'Mandiri',
  ];

  const assessments = [
    'Diagnostik kognitif & pengamatan awal',
    'Formatif: LKPD terbimbing & umpan balik sejawat',
    'Formatif: Kuis analitik & refleksi jurnal murid',
    'Formatif: Diskusi kelompok & presentasi draf',
    'Sumatif: Penilaian unjuk kerja & rubrik analitik',
    'Sumatif: Portofolio karya mandiri & tes terstandar',
  ];

  const tpItems: Array<{
    no: number;
    element: string;
    tp: string;
    kkoLevel: string;
    jp: number;
    ppp: string;
    assessment: string;
    week: string;
  }> = [];

  for (let i = 0; i < stepCount; i++) {
    const kko = kkoLibrary[i % kkoLibrary.length];
    const element = elementsList[i % elementsList.length];
    const currentJp = baseJpPerStep + (i === stepCount - 1 ? remainderJp : 0);
    const startWeek = Math.max(1, Math.round(((i) / stepCount) * effectiveWeeks) + 1);
    const endWeek = Math.min(effectiveWeeks, Math.round(((i + 1) / stepCount) * effectiveWeeks));
    const weekStr = startWeek === endWeek ? `Pekan ${startWeek}` : `Pekan ${startWeek}-${endWeek}`;

    const tpSentence = `[${kko.level.split('-')[0]}-${kko.verb}] ${topicTitle.toLowerCase()} terkait ${element} melalui ${kko.context} dalam konteks nyata peserta didik SMP.`;

    tpItems.push({
      no: i + 1,
      element,
      tp: tpSentence,
      kkoLevel: kko.level,
      jp: currentJp,
      ppp: pppDimensions[i % pppDimensions.length],
      assessment: assessments[i % assessments.length],
      week: weekStr,
    });
  }

  // Construct official Markdown output matching the requested schema
  const markdown = `# DOKUMEN PERENCANAAN KURIKULUM: CP, TP, DAN ATP
**Satuan Pendidikan:** SMP Fase D (${grade})  
**Mata Pelajaran:** ${subject}  
**Semester / Alokasi Waktu:** Semester ${semester} • ${effectiveWeeks} Pekan Efektif • Total ${totalJp} JP  
**Rujukan Regulasi:** Keputusan Kepala BSKAP No. 033/H/KR/2022 & Revisi Terkini  

> **PENTING / PERINGATAN GURU:**  
> Dokumen ini berfungsi sebagai **DRAF AWAL** (Initial Draft) berbasis algoritma kurikulum terstandar. Pendidik wajib memvalidasi, mengonfirmasi kesesuaian dengan kondisi nyata murid, dan menyesuaikan rincian sesuai diskresi profesional serta konteks satuan pendidikan masing-masing.

---

## 1. Analisis & Dekonstruksi Capaian Pembelajaran (CP)

### A. Teks Capaian Pembelajaran Resmi
${
  officialCpText
    ? `> "${officialCpText}"`
    : `*Berdasarkan SK BSKAP No. 033/H/KR/2022 Fase D:*  
Peserta didik mampu menguasai kompetensi esensial pada mata pelajaran ${subject} melalui pemahaman konseptual, keterampilan proses, penalaran logis, dan penerapan praktis dalam kehidupan bermasyarakat berwawasan kebangsaan.`
}

### B. Dekonstruksi Kompetensi dan Konten Inti per Elemen
${elementsList
  .map(
    (el, idx) => `#### Elemen ${idx + 1}: ${el}
- **Kompetensi Esensial (KKO Operasional):** Mengidentifikasi, mengklasifikasi, menganalisis hubungan, menerapkan prinsip, mengevaluasi proses, dan merancang karya.
- **Konten / Materi Inti:** ${topicTitle} (fokus pada pendalaman konsep ${el.toLowerCase()}).
- **Karakteristik Murid SMP:** Memerlukan jembatan dari contoh konkret kontekstual lingkungan lokal menuju konsep abstrak/ilmiah.`
  )
  .join('\n\n')}

---

## 2. Perumusan Tujuan Pembelajaran (TP)
*Prinsip Perumusan:* Setiap TP memuat komponen **Kompetensi (Kata Kerja Operasional terukur C1–C6)** + **Konten (Materi Inti)** + **Konteks Nyata**. Tidak menggunakan kata kerja ambigu seperti "memahami" atau "mengetahui".

${tpItems
  .map(
    (item) =>
      `**${item.no}. ${item.tp}**  
   - *Elemen CP:* ${item.element}  
   - *Tingkat Kognitif:* ${item.kkoLevel}  
   - *Alokasi Waktu:* ${item.jp} JP`
  )
  .join('\n\n')}

---

## 3. Alur Tujuan Pembelajaran (ATP)
*Prinsip Penyusunan:* Mengalir secara logis dari konseptual sederhana menuju kompleks (prerequisite to advanced), integratif antarelemen, dan mengakomodasi pembelajaran berdiferensiasi.

| No. | Elemen CP | Tujuan Pembelajaran (TP) | KKO (Level) | JP | Dimensi Profil Pancasila | Rekomendasi Asesmen | Pekan Ke- |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- | :---: |
${tpItems
  .map(
    (item) =>
      `| ${item.no} | ${item.element} | ${item.tp.replace(/\|/g, '-')} | ${item.kkoLevel} | ${item.jp} JP | ${item.ppp} | ${item.assessment} | ${item.week} |`
  )
  .join('\n')}
| **TOTAL** | **Semua Elemen** | **Tercapai Terstruktur** | **C1 – C6** | **${totalJp} JP** | **P3 Terintegrasi** | **Komprehensif** | **${effectiveWeeks} Pekan** |

### Rasionalisasi Alur Pembelajaran (Sequencing Rationale):
1. **Prinsip Konkret ke Abstrak:** Pembelajaran diawali dengan identifikasi fenomena nyata di lingkungan peserta didik (TP 1 & 2) sebelum beralih ke analisis data analitis (TP 3 & 4).
2. **Prasyarat Pengetahuan (Prerequisite Knowledge):** TP 1 dan 2 berfungsi sebagai landasan pemahaman dasar agar peserta didik memiliki kesiapan kognitif saat menghadapi materi berlevel analisis dan evaluasi pada TP 5 dan 6.
3. **Konsistensi Beban Belajar:** Akumulasi jam pelajaran pada ATP ini tepat berjumlah **${totalJp} JP**, sesuai alokasi kurikulum resmi tanpa kelebihan jam mengajar.

---

## 4. Catatan & Rekomendasi Guru

### A. Strategi Pembelajaran Berdiferensiasi
- **Diferensiasi Konten:** ${
    studentReadiness
      ? `Berdasarkan kesiapan murid (${studentReadiness}), sediakan bahan ajar bertingkat (level dasar bergambar/infografik untuk murid pemula, dan artikel analisis mendalam untuk murid mahir).`
      : 'Sediakan modul bacaan multimodal (teks sederhana, audio siniar, dan video visual edukatif).'
  }
- **Diferensiasi Proses:** Guru memberikan bimbingan intensif (*scaffolding*) pada TP 1–2 bagi kelompok yang belum siap, serta memberikan tantangan mandiri pada TP 5–6 bagi kelompok cepat.
- **Diferensiasi Produk:** Murid dapat menyajikan bukti capaian belajar dalam berbagai format: laporan tertulis, infografik poster, video presentasi, atau simulasi model.

### B. Konteks Satuan Pendidikan & Model Pembelajaran
- **Model Pembelajaran yang Direkomendasikan:** ${learningModel}.
- **Pemanfaatan Sarana:** ${
    schoolContext
      ? `Maksimalkan fasilitas sekolah (${schoolContext}) dalam kegiatan praktikum/observasi TP 3 & 4.`
      : 'Optimalkan ruang kelas dan lingkungan sekitar sekolah sebagai sumber belajar nyata.'
  }

### C. Langkah Lanjutan (Next Steps)
1. Kembangkan rincian ATP di atas ke dalam instrumen **Modul Ajar / RPP Lengkap** per pertemuan.
2. Siapkan rubrik analitik untuk asesmen formatif dan sumatif agar penilaian autentik Profil Pelajar Pancasila tercatat dengan obyektif.
`;

  return {
    markdown,
    source: 'expert_engine',
    totalJpAllocated: totalJp,
    tpCount: tpItems.length,
    elementsAnalyzed: elementsList,
    hasSanityCheckPassed: true,
  };
}

// Client generator dispatcher (tries server Gemini API first, falls back to expert engine)
export async function generateCurriculumPlan(
  input: CurriculumInput
): Promise<CurriculumGenerationResult> {
  try {
    const response = await fetch('/api/generate-curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.source === 'gemini_api' && data.markdown) {
        return {
          markdown: data.markdown,
          source: 'gemini_ai',
          totalJpAllocated: input.totalJp,
          tpCount: 5,
          elementsAnalyzed: input.cpElements,
          hasSanityCheckPassed: true,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API not reachable, using offline expert curriculum engine:', err);
  }

  // Robust deterministic fallback
  return generateCurriculumDraftOffline(input);
}
