export interface AssessmentInput {
  subject: string;
  grade: string; // 'Kelas VII' | 'Kelas VIII' | 'Kelas IX'
  semester: string; // 'Ganjil' | 'Genap'
  targetTp: string;
  cpElement: string;
  topic: string;
  assessmentForm: string; // 'Tes Tertulis (PG & Uraian HOTS)' | 'Asesmen Kinerja / Praktik' | 'Proyek' | 'Portofolio' | 'Kombinasi Tes & Kinerja'
  kktpApproach: string; // 'Rubrik Skala Kualitatif' | 'Deskripsi Kriteria' | 'Interval Nilai'
  durationMinutes: number; // e.g. 80
  schoolContext?: string;
  localStimulus?: string;
  studentCharacteristics?: string;
  totalStudents?: number;
}

export interface AssessmentResult {
  markdown: string;
  source: 'gemini_ai' | 'assessment_engine';
  subject: string;
  topic: string;
  grade: string;
  hasFormatif: boolean;
  hasSumatif: boolean;
  hasRubrik: boolean;
  hasRaporDescription: boolean;
}

// Built-in expert offline assessment generator based on Kurikulum Merdeka & BSKAP evaluation guidelines
export function generateAssessmentPlanOffline(input: AssessmentInput): AssessmentResult {
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
    localStimulus,
    schoolContext,
  } = input;

  const effectiveTp = targetTp || `Peserta didik mampu menganalisis konsep ${topic} dan memecahkan permasalahan nyata di lingkungannya secara kritis dan bertanggung jawab.`;
  const effectiveElement = cpElement || 'Pemahaman Konsep & Keterampilan Proses';
  const effectiveStimulus = localStimulus || 'Data fenomena lingkungan lokal sekolah dan studi kasus kemasyarakatan nusantara';

  const markdown = `# PERANGKAT ASESMEN, EVALUASI & ADMINISTRASI RAPOR
## KURIKULUM MERDEKA TINGKAT SMP (FASE D)
### Pendekatan: Keselarasan Konstruktif (Constructive Alignment) & Evaluasi Autentik Berbasis HOTS

---

> **PENTING / PERINGATAN VALIDASI GURU:**  
> Seluruh instrumen kisi-kisi, butir asesmen, rubrik penilaian analitik, dan pedoman KKTP di bawah ini merupakan **DRAF AWAL (Initial Draft)**. Guru pengampu dianjurkan melakukan telaah empiris, uji coba butir soal, serta penyesuaian kriteria berdasarkan karakteristik nyata peserta didik dan kebijakan kurikulum satuan pendidikan masing-masing.

---

## 1. KISI-KISI ASESMEN (FORMATIF & SUMATIF)
*Prinsip Penyusunan:* Keselarasan Tiga Arah (Tujuan Pembelajaran ➔ Skenario Belajar ➔ Instrumen Evaluasi) dengan proporsi kognitif berimbang (±30% C1–C3 Fondasi, ±40% C4–C5 HOTS, ±30% C6 Kreasi/Aplikasi).

| No | Elemen CP | Tujuan Pembelajaran (TP) | Lingkup Materi Pokok | Jenis Asesmen | Level Kognitif (Bloom Revisi) | Bentuk Instrumen | Indikator Ketercapaian / No. Soal |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| 1 | ${effectiveElement} | Mengidentifikasi konsep esensial materi | Konsep Dasar ${topic} | Formatif | C1–C2 (Pemahaman) | Lembar Observasi & Tanya Jawab | Observasi Proses (Selama Diskusi) |
| 2 | ${effectiveElement} | Menerapkan prosedur pemecahan masalah | Prinsip Kerja ${topic} | Formatif | C3 (Aplikasi) | Lembar Kerja Siswa (LKPD) & Exit Ticket | Exit Ticket (Akhir Pertemuan 1) |
| 3 | ${effectiveElement} | Menganalisis data stimulus kontekstual | Studi Kasus ${topic} | Sumatif | C4 (Analisis HOTS) | Pilihan Ganda Berstimulus | Soal No. 1 & 2 |
| 4 | ${effectiveElement} | Mengevaluasi dampak dan validitas solusi | Evaluasi Fenomena | Sumatif | C5 (Evaluasi HOTS) | Pilihan Ganda Kompleks / Menjodohkan | Soal No. 3 |
| 5 | ${effectiveElement} | ${effectiveTp} | Pemecahan Masalah Nyata | Sumatif | C6 (Mencipta / Sintesis) | Uraian Terstruktur / Kinerja | Soal No. 4 & 5 (Studi Kasus) |

---

## 2. INSTRUMEN ASESMEN FORMATIF (PROSES BELAJAR)
*PENTING:* Asesmen formatif berfungsi murni sebagai **umpan balik perbaikan proses belajar (*assessment for & as learning*)** dan **TIDAK DIGUNAKAN** untuk menghitung nilai rapor.

### A. Lembar Observasi Diskusi & Keterlibatan Murid (*Proses Berpikir Mendalam*)
| No | Nama Peserta Didik | Keaktifan Berpendapat (1-4) | Keterbukaan terhadap Umpan Balik (1-4) | Penalaran Kritis Argumen (1-4) | Catatan Anekdot & Bimbingan Khusus |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Siswa A | 3 | 4 | 3 | Mampu membedakan fakta dan opini dengan baik. |
| 2 | Siswa B | 2 | 3 | 2 | Perlu scaffolding dalam merumuskan kalimat sanggahan. |
| 3 | Siswa C | 4 | 4 | 4 | Menunjukkan kepemimpinan empati dalam kerja tim. |

### B. Instrumen Self-Assessment & Peer-Assessment (Refleksi Sejawat)
\`\`\`text
Petunjuk: Berilah tanda centang (✓) pada kolom yang sesuai dengan refleksimu secara jujur!
Pernyataan Penilaian Diri:
[ ] 1. Saya dapat menjelaskan konsep inti ${topic} dengan kalimat saya sendiri.
[ ] 2. Saya menemukan keterkaitan antara materi ini dengan fenomena di sekitar rumah saya.
[ ] 3. Saya mendengarkan pendapat teman dan aktif berdiskusi mencari jalan keluar.
Hal yang masih membingungkan bagi saya: .....................................................
\`\`\`

### C. Exit Ticket (Tiket Keluar - Pengecekan Cepat 5 Menit)
1. *"Tuliskan SATU ide paling bermakna yang kamu pahami hari ini tentang ${topic}!"*
2. *"Jika kamu harus menjelaskan materi hari ini kepada adikmu, contoh apa yang akan kamu gunakan?"*

---

## 3. INSTRUMEN ASESMEN SUMATIF & KUNCI JAWABAN
*Bentuk:* ${assessmentForm} • *Alokasi Waktu:* ${durationMinutes} Menit • *Konteks:* ${effectiveStimulus}

### STIMULUS BACAAN / DATA KASUS:
> **Wacana:** *"Di era modern, pemahaman terhadap ${topic} menjadi sangat krusial bagi kehidupan bermasyarakat. Berdasarkan data pengamatan di lingkungan sekitar, terdapat kecenderungan bahwa penerapan prinsip yang tepat dapat meningkatkan efisiensi dan menjaga keseimbangan ekosistem sosial maupun alamiah. Namun, tantangan muncul ketika sebagian warga belum menyadari prosedur yang benar..."*

---

### BUTIR SOAL ASESMEN SUMATIF:

#### Butir 1 (Pilihan Ganda - Level C4 Analisis HOTS)
Berdasarkan wacana stimulus di atas, manakah pernyataan berikut yang paling tepat menggambarkan hubungan sebab-akibat terkait penerapan konsep ${topic}?  
A. Penerapan konsep hanya berdampak pada individu tanpa memengaruhi lingkungan sekitar.  
B. Kurangnya kesadaran terhadap prosedur ilmiah berpotensi memicu ketidakseimbangan sistem yang lebih luas. *(Kunci Benar)*  
C. Fenomena tersebut merupakan peristiwa alami yang tidak dapat dianalisis menggunakan prinsip sains.  
D. Efisiensi dapat tercapai secara maksimal meskipun prinsip dasar materi diabaikan.  
- **Kunci Jawaban:** B  
- **Skor:** 15 poin  
- **Pedoman Penskoran:** Pilihan B tepat karena menganalisis korelasi kausalitas antara kepatuhan prosedur dengan keseimbangan sistem secara logis.

#### Butir 2 (Pilihan Ganda Kompleks - Level C4)
Perhatikan tabel data pengamatan berikut! Berilah tanda centang (✓) pada kolom Benar atau Salah untuk setiap pernyataan:
1. Pernyataan 1: Peningkatan efisiensi berbanding lurus dengan ketepatan analisis awal. [Benar]
2. Pernyataan 2: Konsep ${topic} tidak relevan jika diterapkan di luar area perkotaan. [Salah]
- **Kunci Jawaban:** 1-Benar, 2-Salah  
- **Skor:** 15 poin  

#### Butir 3 (Uraian HOTS - Level C5 Evaluasi)
Jelaskan mengapa suatu solusi yang tampak mudah diterapkan terkadang tidak efektif dalam jangka panjang jika tidak mempertimbangkan karakteristik lokal ${schoolContext || 'sekolah'}! Berikan analisis kritismu!  
- **Kunci Jawaban Model:**  
  *Jawaban harus mencakup: (1) Identifikasi variabel lokal yang memengaruhi keberhasilan, (2) Argumentasi logis mengenai dampak jangka panjang, dan (3) Rekomendasi penyesuaian strategi.*  
- **Skor Maksimum:** 30 poin (3 aspek terpenuhi = 30; 2 aspek = 20; 1 aspek = 10).

#### Butir 4 (Studi Kasus Solutif - Level C6 Mencipta / Desain Solusi)
Rancanglah sebuah rencana aksi ringkas (terdiri dari: Nama Inisiatif, Tahapan Tindakan, dan Bukti Ketercapaian) untuk mengatasi persoalan terkait ${topic} yang terjadi di satuan pendidikanmu!  
- **Kunci Jawaban Model:** Rancangan bersifat aplikatif, terukur, dan memanfaatkan kearifan lokal.  
- **Skor Maksimum:** 40 poin.

---

## 4. RUBRIK PENILAIAN ANALITIK (SKALA 4 TINGKAT KELAYAKAN)
*Pendekatan:* ${kktpApproach}

| Aspek Penilaian | Perlu Bimbingan (1) | Layak / Cukup (2) | Cakap / Baik (3) | Mahir / Sangat Baik (4) |
| :--- | :--- | :--- | :--- | :--- |
| **Ketepatan Analisis Konsep** | Menunjukkan miskonsepsi mendasar; belum mampu menghubungkan fakta stimulus. | Menyebutkan konsep dasar namun hubungan sebab-akibat masih belum runtut. | Menganalisis konsep materi secara tepat dan menghubungkan variabel stimulus dengan logis. | Menganalisis konsep secara komprehensif, kritis, mendalam, dan mampu memprediksi dampak lanjutan. |
| **Kualitas Argumentasi & Penalaran** | Argumen bersifat opini bebas tanpa dukungan data atau bukti faktual. | Menyajikan argumen yang didukung sedikit data, namun penalaran belum tuntas. | Argumen terstruktur, didukung bukti wacana yang relevan dan penalaran masuk akal. | Argumen tajam, berbasis bukti ilmiah/data kuat, objektif, dan mempertimbangkan sudut pandang alternatif. |
| **Solusi & Orisinalitas Desain** | Tidak memberikan solusi atau solusi tidak relevan dengan permasalahan. | Solusi bersifat normatif umum dan sulit diimplementasikan secara nyata. | Solusi aplikatif, terarah, realistis, dan relevan dengan konteks lingkungan sekolah. | Solusi orisinal, inovatif, berdaya guna tinggi, kontekstual, dan mudah diterapkan berkelanjutan. |

---

## 5. PEDOMAN PENENTUAN CAPAIAN KOMPETENSI (KKTP) & DESKRIPSI RAPOR
*PENTING:* Rapor Kurikulum Merdeka **TIDAK MENGGUNAKAN FORMULA KONVERSI ANGKA MATEMATIS**. Rapor berfokus pada **DESKRIPSI KUALITATIF NARATIF** berdasarkan ketuntasan indikator TP.

### A. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
- **Tuntas (Tercapai):** Peserta didik memperoleh minimal kategori **"Cakap"** pada 2 dari 3 aspek rubrik penilaian, atau menjawab benar minimal 70% indikator sumatif.
- **Belum Tuntas (Perlu Bimbingan):** Peserta didik berada pada kategori **"Perlu Bimbingan"** atau **"Layak"** pada aspek kunci analisis konsep.

### B. Template Narasi Deskripsi Rapor per Elemen CP:
1. **Bagi Murid yang Sangat Mahir (Tuntas Melampaui):**  
   > *"Ananda [Nama Siswa] menunjukkan penguasaan yang **sangat baik** dalam menganalisis konsep ${topic} pada elemen ${effectiveElement}, serta mampu merancang gagasan solusi kontekstual yang orisinal dan bernalar kritis."*
2. **Bagi Murid yang Berkembang Sesuai Harapan (Tuntas Cakap):**  
   > *"Ananda [Nama Siswa] telah **mencapai tujuan pembelajaran** pada elemen ${effectiveElement}, khususnya dalam memahami prinsip ${topic} dan memecahkan soal berbasis studi kasus dengan tepat."*
3. **Bagi Murid yang Memerlukan Bimbingan (Belum Tuntas):**  
   > *"Ananda [Nama Siswa] telah mampu mengidentifikasi fakta dasar ${topic}, namun **masih memerlukan bimbingan intensif** dalam menganalisis korelasi sebab-akibat dan mengevaluasi data stimulus secara mandiri."*

---

## 6. PROGRAM REMEDIAL & PENGAYAAN YANG TERSTRUKTUR

### A. Program Remedial (*Bukan Sekadar Tes Ulang*)
- **Sasaran:** Peserta didik yang belum tuntas pada kompetensi analisis konsep.
- **Strategi Bimbingan:**  
  1. *Diagnosis Kendala:* Identifikasi miskonsepsi spesifik melalui wawancara singkat 5 menit.  
  2. *Bimbingan Tutor Sebaya / Scaffolding:* Belajar bersama rekan berkemampuan cakap dengan panduan *concept-map* bergambar.  
  3. *Asesmen Ulang Berfokus:* Diberikan penugasan berbasis studi kasus sederhana yang setara (bukan tes yang sama persis).

### B. Program Pengayaan (*Tantangan Berpikir Tingkat Tinggi*)
- **Sasaran:** Peserta didik yang mencapai kategori Mahir lebih awal.
- **Bentuk Aktivitas:** Menjadi mentor kelompok diskusi (*peer-tutor*), menganalisis jurnal ilmiah populer remaja, atau membuat poster infografik edukasi untuk dipajang di mading sekolah.

---

## 7. PERANGKAT ADMINISTRASI PENDUKUNG EVALUASI GURU

### A. Format Analisis Daya Serap & Ketuntasan Belajar Kelas
| No | Kode TP | Indikator Kompetensi | Jumlah Murid Tuntas | Jumlah Murid Belum Tuntas | % Daya Serap Klasikal | Rekomendasi Tindak Lanjut Guru |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | TP-01 | Analisis Konsep ${topic} | 24 | 8 | 75% | Remedial kelompok terfokus 8 murid |
| 2 | TP-02 | Perancangan Solusi Nyata | 28 | 4 | 87.5% | Pengayaan proyek mandiri |

### B. Format Jurnal Harian Pelaksanaan Asesmen
- **Hari/Tanggal:** ........................................
- **Mata Pelajaran / Kelas:** ${subject} / ${grade}
- **Fokus Asesmen:** Asesmen Formatif / Sumatif Materi ${topic}
- **Temuan Lapangan:** ............................................................................
- **Catatan Hambatan Murid:** ...................................................................
- **Solusi Pedagogis Guru:** .....................................................................

### C. Bank Soal Terklasifikasi Ringkas
1. *Tingkat Mudah (C2):* Jelaskan dengan kata-katamu sendiri apa yang dimaksud dengan ${topic}!  
2. *Tingkat Sedang (C3):* Berikan 2 contoh konkret penerapan ${topic} di lingkungan sekolahmu!  
3. *Tingkat Sukar / HOTS (C4–C5):* Bandingkan dua pendekatan penanganan masalah ${topic} dan analisislah mana yang paling berkelanjutan!

---
*Disahkan di:* Satuan Pendidikan SMP  
*Guru Pengampu Mata Pelajaran:*  
**(........................................................)**  
NIP. ....................................................
`;

  return {
    markdown,
    source: 'assessment_engine',
    subject,
    topic,
    grade,
    hasFormatif: true,
    hasSumatif: true,
    hasRubrik: true,
    hasRaporDescription: true,
  };
}

// Client generator dispatcher (calls server API or falls back)
export async function generateAssessmentPlan(input: AssessmentInput): Promise<AssessmentResult> {
  try {
    const response = await fetch('/api/generate-assessment', {
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
          subject: input.subject,
          topic: input.topic,
          grade: input.grade,
          hasFormatif: true,
          hasSumatif: true,
          hasRubrik: true,
          hasRaporDescription: true,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Assessment AI API not reachable, using offline assessment engine:', err);
  }

  // Fallback to deterministic assessment engine
  return generateAssessmentPlanOffline(input);
}
