export interface DeepLearningInput {
  schoolName: string;
  teacherName: string;
  nip: string;
  subject: string;
  grade: string; // 'Kelas VII' | 'Kelas VIII' | 'Kelas IX'
  semester: string; // 'Ganjil' | 'Genap'
  academicYear: string;
  topic: string;
  targetTp: string;
  cpElement: string;
  meetingsCount: number; // e.g. 2
  durationPerMeeting: string; // e.g. '2 Pertemuan x 40 Menit (4 JP)'
  totalStudents: number; // e.g. 32
  studentCharacteristics: string;
  initialCompetency: string;
  facilities: string;
  learningModel: string; // 'Problem Based Learning (PBL)' | 'Project Based Learning (PjBL)' | etc.
  localContext: string; // Kearifan lokal / konteks lingkungan
}

export interface DeepLearningResult {
  markdown: string;
  source: 'gemini_ai' | 'deep_learning_engine';
  topic: string;
  subject: string;
  grade: string;
  sectionsCount: number;
}

// Built-in offline generator for 8-3-3-4 Deep Learning Framework
export function generateDeepLearningModulOffline(input: DeepLearningInput): DeepLearningResult {
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
  } = input;

  const effectiveTp = targetTp || `Peserta didik mampu menganalisis, mengaplikasikan konsep ${topic}, serta merefleksikan solusinya dalam kehidupan nyata.`;
  const effectiveModel = learningModel || 'Problem Based Learning (PBL)';
  const effectiveContext = localContext || 'Studi kasus lingkungan dan budaya nusantara';

  const markdown = `# MODUL AJAR KURIKULUM MERDEKA (FASE D SMP)
## PENDEKATAN PEMBELAJARAN MENDALAM (*DEEP LEARNING*)
### Pilar: Berpikir Mendalam (*Deep Thinking*), Belajar Bermakna (*Meaningful Learning*), dan Berkarya Nyata (*Real-World Application*)

---

> **PENTING / PERINGATAN GURU:**  
> Dokumen ini berfungsi sebagai **DRAF AWAL** (Initial Draft) berbasis kerangka *Deep Learning 8-3-3-4*. Guru dianjurkan melakukan adaptasi, penyesuaian kontekstual, dan validasi sesuai karakteristik nyata siswa dan sarana di sekolah.

---

## A. DATA AWAL PEMBELAJARAN
1. **Identitas Satuan Pendidikan:** ${schoolName}
2. **Nama Guru / NIP:** ${teacherName} / ${nip || '-'}
3. **Mata Pelajaran:** ${subject}
4. **Fase / Kelas:** Fase D / ${grade}
5. **Semester / Tahun Pelajaran:** Semester ${semester} / T.A. ${academicYear}
6. **Materi Pokok / Topik:** ${topic}
7. **Alokasi Waktu:** ${meetingsCount} Pertemuan • ${durationPerMeeting}
8. **Jumlah Peserta Didik:** ${totalStudents} Murid
9. **Karakteristik Peserta Didik:** ${studentCharacteristics || 'Taraf perkembangan remaja awal (usia 13–15 tahun); gaya belajar kombinasi visual, auditori, dan kinestetik dengan tingkat literasi dan kemandirian heterogen.'}
10. **Kompetensi Awal (Prerequisite):** ${initialCompetency || 'Peserta didik telah mengenal istilah dasar materi dan mampu melakukan pengamatan sederhana.'}
11. **Sarana & Prasarana:** ${facilities || 'LCD Proyektor, laptop/komputer, LKPD cetak/digital, lingkungan sekolah, bahan bacaan perpustakaan.'}
12. **Model & Metode Pembelajaran:** Model ${effectiveModel}; Metode Diskusi Kelompok, Observasi Kontekstual, Eksperimen/Studi Kasus, Penugasan Karya Nyata.
13. **Konteks Lingkungan & Kearifan Lokal:** ${effectiveContext}
14. **Capaian Pembelajaran (CP) Elemen [${cpElement}]:** Peserta didik mampu menguasai kompetensi esensial elemen ${cpElement} melalui eksplorasi konseptual, penalaran analitis, dan aplikasi kontekstual dalam kehidupan bermasyarakat.

---

## B. 8 DIMENSI PROFIL LULUSAN & KETERKAITANNYA
Modul ini mengintegrasikan 8 Dimensi Profil Lulusan / Profil Pelajar Pancasila secara autentik:
1. **Keimanan & Ketakwaan terhadap Tuhan YME:** Menyadari keteraturan alam semesta dan bersyukur atas akal budi melalui doa dan etika ilmiah.
2. **Kewargaan & Kebinekaan Global:** Menghargai keberagaman perspektif dalam diskusi kelompok dan menjunjung tinggi kearifan lokal.
3. **Kemandirian:** Mengambil inisiatif dalam tugas mandiri, manajemen waktu kerja, serta bertanggung jawab atas proses belajar.
4. **Kolaborasi / Gotong Royong:** Bekerja sama secara sinergis dalam kelompok belajar untuk memecahkan persoalan bersama.
5. **Penalaran Kritis (*Deep Thinking*):** Mengidentifikasi fakta, membedakan opini, menganalisis data, dan mengevaluasi solusi secara logis.
6. **Kreativitas (*Real-World Application*):** Menghasilkan gagasan orisinal, produk aplikatif, dan solusi pemecahan masalah yang inovatif.
7. **Komunikasi Efektif:** Menyampaikan gagasan secara terstruktur, santun, dan meyakinkan baik secara lisan maupun visual/tulisan.
8. **Kegigihan & Ketangguhan (*Growth Mindset*):** Pantang menyerah saat menghadapi kendala dan terbuka terhadap revisi serta umpan balik korektif.

---

## C. 3 PRINSIP PEMBELAJARAN MENDALAM (*DEEP LEARNING*)
1. **Berekspos / Berkesadaran (*Mindful Learning*):**
   - Murid hadir secara utuh (fokus mental dan emosional) dalam pembelajaran.
   - Menggunakan latihan kesadaran awal (*mindfulness breathing*) dan asesmen diagnostik non-kognitif sebelum memulai materi.
2. **Bermakna (*Meaningful Learning*):**
   - Mengaitkan konsep abstrak materi ${topic} dengan pengalaman nyata kehidupan sehari-hari murid di lingkungan sekitar.
   - Menjawab pertanyaan esensial: *"Mengapa materi ini penting bagi masa depan dan lingkunganku?"*
3. **Menggembirakan (*Joyful Learning*):**
   - Menciptakan suasana belajar yang aman, suportif, interaktif, dan bebas dari rasa takut salah (*psychological safety*).
   - Memadukan permainan edukatif, simulasi peran, dan apresiasi positif terhadap pencapaian belajar murid.

---

## D. 4 KERANGKA PEMBELAJARAN
1. **Praktik Pedagogis:** Menerapkan pembelajaran berbasis inkuiri dan pemecahan masalah dengan scaffolding terstruktur dari taraf pemula hingga mandiri.
2. **Kemitraan Pembelajaran:** Membangun relasi timbal balik setara antara guru-murid (*co-learners*), tutor sebaya, dan kolaborasi dengan orang tua/komunitas.
3. **Lingkungan Pembelajaran:** Menata ruang kelas yang fleksibel (meja diskusi melingkar), iklim suportif, serta pemanfaatan area terbuka sekolah sebagai laboratorium hidup.
4. **Pemanfaatan Digital:** Memanfaatkan platform presentasi interaktif, lembar kerja digital, dan pencarian sumber informasi kredibel untuk memperluas cakrawala berpikir.

---

## E. IDENTIFIKASI PEMBELAJARAN
1. **Analisis Kesiapan Belajar:**
   - *Kelompok Mahir (High Readiness):* Mampu menganalisis materi secara mandiri dan memerlukan tugas eksplorasi lanjutan.
   - *Kelompok Berkembang (Medium Readiness):* Memahami konsep dasar namun memerlukan panduan terstruktur dalam studi kasus.
   - *Kelompok Perlu Bimbingan (Low Readiness):* Membutuhkan scaffolding bertahap dengan pendampingan langsung guru atau tutor sebaya.
2. **Materi Esensial:** Konsep inti ${topic}, struktur/prosedur kunci, hubungan sebab-akibat, dan penerapannya dalam kehidupan nyata.
3. **Profil Lulusan yang Ditargetkan:** Fokus penguatan dimensi Penalaran Kritis, Kolaborasi, dan Komunikasi Efektif.
4. **Identifikasi Kebutuhan:** Fasilitasi media multimodal (teks visual bertingkat, video/audio peraga, dan benda konkret).

---

## F. DESAIN PEMBELAJARAN
- **Tujuan Pembelajaran (TP):** ${effectiveTp}
- **Pendekatan:** Pembelajaran Mendalam (*Deep Learning Approach*).
- **Model Pembelajaran:** ${effectiveModel}.
- **Metode Pembelajaran:** Diskusi panel, eksperimen/studi kasus, observasi lapangan, presentasi karya.
- **Pertanyaan Pemantik (*Driving Questions*):**
  1. *"Bagaimana fenomena ${topic} berdampak langsung pada kehidupan kita sehari-hari?"*
  2. *"Jika kamu menjadi seorang ahli di bidang ini, solusi kreatif apa yang akan kamu gagas untuk menyelesaikan permasalahan di lingkunganmu?"*
- **Pemahaman Bermakna (*Enduring Understandings*):**
  - Peserta didik menyadari bahwa penguasaan materi ${topic} bukan sekadar hafalan teoritis, melainkan bekal kecakapan hidup (*life skills*) untuk mengambil keputusan bijak dan bertanggung jawab.
- **Strategi Diferensiasi:**
  - *Diferensiasi Konten:* Bahan ajar bertingkat (infografik ringkas, artikel mendalam, video interaktif).
  - *Diferensiasi Proses:* Pembagian kelompok kerja bertingkat dengan variasi scaffolding.
  - *Diferensiasi Produk:* Pilihan bentuk karya akhir (laporan infografik, esai tertulis, rekaman siniar/podcast, atau video demonstrasi).

---

## G. SKENARIO PEMBELAJARAN PER PERTEMUAN

### PERTEMUAN 1: Eksplorasi Konseptual & Penyelidikan Kasus (40-80 Menit)
#### 1. Kegiatan Pendahuluan (10–15 Menit)
- Guru membuka pembelajaran dengan salam ramah, doa bersama, dan presensi berkesadaran (*Mindful Check-in*).
- Guru menayangkan fenomena pemantik terkait konteks lokal ${effectiveContext}.
- Apersepsi dan pengajuan Pertanyaan Pemantik untuk mengaktifkan skema berpikir murid (*Deep Thinking*).
- Penyampaian Tujuan Pembelajaran, manfaat praktis, dan kesepakatan belajar bersama.

#### 2. Kegiatan Inti: 3 Pengalaman Belajar Deep Learning (55–60 Menit)
- **Tahap 1: Memahami (Deep Thinking - 20 Menit)**
  - *Mengamati & Eksplorasi:* Murid mencermati bahan ajar bertingkat mengenai ${topic}.
  - *Menganalisis & Diskusi Konsep:* Dalam kelompok kecil heterogen, murid mengidentifikasi kata kunci dan struktur masalah pada LKPD Bagian 1.
  - *Tanya Jawab Mendalam:* Guru memfasilitasi dialog interaktif yang mendorong murid merumuskan hipotesis dengan bahasa sendiri.
- **Tahap 2: Mengaplikasikan (Meaningful Practice - 25 Menit)**
  - *Studi Kasus Kontekstual:* Kelompok memecahkan studi kasus nyata berbasis masalah lingkungan sekitar.
  - *Eksperimen / Simulasi Data:* Murid mengolah data pengamatan dan merancang draf solusi atau model pemecahan masalah.
  - *Diferensiasi Proses Berjalan:* Guru mendampingi kelompok yang membutuhkan bimbingan khusus, sementara kelompok mandiri memperluas cakupan analisis.
- **Tahap 3: Merefleksikan (Reflective Dialogue - 15 Menit)**
  - *Refleksi Berpasangan:* Murid bertukar temuan awal dengan kelompok lain (*peer feedback*).
  - *Jurnal Singkat:* Murid menuliskan satu hal baru yang dipahami dan satu hal yang masih menantang.
  - *Penyimpulan Sementara:* Guru dan perwakilan murid mengonfirmasi pemahaman konsep inti.

#### 3. Kegiatan Penutup (10 Menit)
- Guru dan murid merangkum intisari kegiatan pembelajaran Pertemuan 1.
- Refleksi bersama: *"Pengalaman belajar apa yang paling bermakna hari ini?"*
- Pemberian arahan untuk persiapan investigasi/pembuatan karya nyata pada Pertemuan 2.
- Doa penutup dan salam perpisahan.

---

### PERTEMUAN 2: Kolaborasi Berkarya Nyata & Evaluasi Asesmen (40-80 Menit)
#### 1. Kegiatan Pendahuluan (10 Menit)
- Salam pembuka, energizer menggembirakan (*Joyful Learning*), dan kilas balik pemahaman Pertemuan 1.
- Penyampaian target pertemuan: memfinalisasi karya aplikasi nyata (*Real-World Application*) dan asesmen unjuk kerja.

#### 2. Kegiatan Inti: 3 Pengalaman Belajar Deep Learning (60 Menit)
- **Tahap 1: Memahami Kembali & Uji Rencana (10 Menit)**
  - Murid meninjau kembali kriteria keberhasilan pada rubrik penilaian.
- **Tahap 2: Mengaplikasikan & Berkarya Nyata (35 Menit)**
  - *Produksi Karya Berdiferensiasi:* Kelompok menyelesaikan produk akhir sesuai minat (infografik, draf laporan investigasi, rekaman siniar, atau simulasi model).
  - *Pameran Karya Mini (Gallery Walk):* Setiap kelompok memajang karyanya; anggota kelompok berkeliling memberikan apresiasi dan catatan konstruktif.
- **Tahap 3: Merefleksikan & Asesmen Sumatif (15 Menit)**
  - *Presentasi Reflektif:* Perwakilan kelompok memaparkan solusi dan merefleksikan kendala yang dihadapi.
  - *Asesmen Autentik:* Guru dan rekan sejawat menilai karya menggunakan Rubrik Skala 1–4.
  - *Penarikan Makna Hidup:* Mengaitkan hasil karya dengan kontribusi positif bagi keluarga dan masyarakat.

#### 3. Kegiatan Penutup (10 Menit)
- Kesimpulan komprehensif pembelajaran materi ${topic}.
- Apresiasi guru terhadap kerja keras, kolaborasi, dan daya tahan belajar murid (*Growth Mindset*).
- Informasi tindak lanjut remedial bagi yang memerlukan penguatan dan pengayaan bagi yang telah tuntas.
- Doa penutup pembelajaran.

---

## H. LEMBAR KERJA PESERTA DIDIK (LKPD) TERSTRUKTUR

\`\`\`text
========================================================================================
                      LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS DEEP LEARNING
                                 MATA PELAJARAN: ${subject.toUpperCase()}
========================================================================================
Nama Kelompok / Anggota : 1. ....................  3. ....................
                          2. ....................  4. ....................
Kelas / Semester        : ${grade} / Semester ${semester}
Topik Pembelajaran      : ${topic}
Alokasi Waktu           : 40 Menit

A. TUJUAN KEGIATAN:
   Melalui penyelidikan masalah kontekstual, peserta didik mampu:
   1. Menganalisis konsep esensial ${topic} secara kritis dan logis.
   2. Merancang solusi nyata pemecahan masalah dalam bentuk karya tim yang bermakna.

B. STIMULUS FENOMENA NYATA (STUDI KASUS):
   Bacalah fenomena berikut:
   "Di lingkungan sekitar kita, fenomena terkait ${topic} sering kali menimbulkan persoalan jika 
   tidak dikelola dengan pengetahuan yang tepat. Beberapa warga belum memahami prinsip dasarnya..."

C. LANGKAH PENYELIDIKAN (MEMAHAMI & MENGAPLIKASIKAN):
   1. Identifikasilah minimal 3 fakta pokok dari fenomena di atas!
      Jawaban: .........................................................................
   2. Analisislah apa faktor penyebab utama dan dampaknya bagi lingkungan sekitar!
      Jawaban: .........................................................................
   3. Diskusikan solusi inovatif yang dapat kamu gagas bersama kelompokmu!
      Jawaban: .........................................................................

D. LEMBAR KARYA & REFLEKSI (MEREFLEKSIKAN):
   1. Tuangkan rancangan solusimu ke dalam bentuk produk pilihan (poster/tabel/bagan)!
   2. Tuliskan refleksi kelompok: "Apa pelajaran paling berharga yang kalian dapatkan hari ini?"
      Jawaban: .........................................................................
========================================================================================
\`\`\`

---

## I. ASESMEN PEMBELAJARAN
1. **Asesmen Diagnostik (Awal):**
   - *Teknik:* Tes lisan singkat 3 pertanyaan pemantik + ceklist kesiapan emosional/minat.
   - *Instrumen:* Lembar ceklis pemahaman prasyarat materi ${topic}.
   - *Tindak Lanjut:* Mengelompokkan murid ke dalam kelompok diferensiasi proses (*scaffolding vs mandiri*).
2. **Asesmen Formatif (Sepanjang Proses):**
   - *Teknik:* Observasi keterlibatan diskusi, cek berkala LKPD, dan penilaian antar-teman (*peer feedback*).
   - *Instrumen:* Lembar observasi dimensi Bernalar Kritis & Gotong Royong.
   - *Tindak Lanjut:* Memberikan umpan balik langsung (*immediate descriptive feedback*) saat kegiatan berlangsung.
3. **Asesmen Sumatif (Akhir):**
   - *Teknik:* Penilaian produk karya nyata dan tes penalaran tertulis.
   - *Instrumen:* Rubrik penilaian analitik skala 1–4.
   - *Tindak Lanjut:* Penentuan ketercapaian tujuan pembelajaran dan dasar nilai rapor.

---

## J. RUBRIK PENILAIAN ANALITIK (SKALA 1–4)

| Aspek Penilaian | Skor 1 (Perlu Bimbingan) | Skor 2 (Cukup) | Skor 3 (Baik) | Skor 4 (Sangat Baik / Mahir) |
| :--- | :--- | :--- | :--- | :--- |
| **Penguasaan Materi & Konsep** | Belum mampu mengidentifikasi konsep esensial; banyak miskonsepsi. | Mengidentifikasi konsep dasar dengan bantuan bimbingan guru. | Menjelaskan konsep ${topic} dengan tepat, runut, dan minim kesalahan. | Menganalisis konsep secara mendalam, komprehensif, dan mengaitkan antardisiplin ilmu. |
| **Penalaran Kritis (*Deep Thinking*)** | Menerima informasi mentah tanpa analisis atau verifikasi data. | Mulai mengajukan pertanyaan tetapi argumen belum didukung fakta. | Mampu menganalisis data, membedakan fakta/opini, dan berargumen logis. | Mampu mengevaluasi argumen secara kritis, mendeteksi bias, dan menawarkan solusi inovatif. |
| **Kreativitas & Produk Nyata** | Produk meniru contoh persis tanpa ada modifikasi atau nilai tambah. | Produk cukup rapi namun gagasan pemecahan masalah masih standar. | Produk informatif, menarik, kontekstual, dan solutif bagi lingkungan. | Produk orisinal, inspiratif, berdaya guna tinggi, dan estetis secara visual/fungsional. |
| **Kolaborasi & Komunikasi** | Pasif dalam kelompok atau mendominasi tanpa mendengar pendapat rekan. | Berpartisipasi sebatas tugas minimal; komunikasi kurang terbuka. | Bekerja sama aktif, menghargai pendapat, dan mempresentasikan hasil secara jelas. | Menunjukkan kepemimpinan empati, memotivasi seluruh anggota, dan artikulasi presentasi prima. |

---

## K. STRATEGI PEMBELAJARAN BERDIFERENSIASI
1. **Diferensiasi Konten:**
   - *Siswa Belum Siap:* Disediakan infografik ringkas berwarna dengan glosarium istilah sederhana.
   - *Siswa Siap:* Membaca teks artikel naratif kontekstual modul ajar.
   - *Siswa Mahir:* Diberikan artikel ilmiah populer tambahan atau data riset kasus lingkungan untuk dianalisis lebih lanjut.
2. **Diferensiasi Proses:**
   - Guru memberikan bimbingan langsung pada kelompok yang masih kesulitan (*guided inquiry*), sedangkan kelompok mandiri dipersilakan melakukan eksplorasi dengan instruksi pemandu minimal.
3. **Diferensiasi Produk:**
   - Murid bebas memilih format penyajian hasil penyelidikan: laporan poster visual, esai tulisan naratif, rekaman suara siniar (podcast), atau presentasi lisan singkat.

---

## L. REMEDIAL, PENGAYAAN, & TUGAS TAMBAHAN
1. **Program Remedial:**
   - Diberikan kepada peserta didik yang belum mencapai kriteria ketuntasan tujuan pembelajaran.
   - Dilakukan melalui pembelajaran ulang materi kunci dengan bantuan tutor sebaya dan latihan terbimbing dengan LKPD sederhana.
2. **Program Pengayaan:**
   - Diberikan kepada peserta didik yang telah mencapai ketuntasan lebih cepat.
   - Mempelajari studi kasus kontemporer atau merancang proyek lanjutan yang dapat diimplementasikan di lingkungan rumah.
3. **Tugas Tambahan Reflektif:**
   - Berbagi pengalaman belajar materi ${topic} kepada orang tua di rumah dan meminta tanda tangan apresiasi.

---

## M. REFLEKSI GURU & PESERTA DIDIK
1. **Refleksi Peserta Didik:**
   - *"Bagian pembelajaran mana yang paling membuatmu bersemangat dan berpikir mendalam hari ini?"*
   - *"Tantangan apa yang kamu hadapi dan bagaimana caramu mengatasinya bersama teman kelompokmu?"*
   - *"Jika diberi kesempatan mengulang, hal apa yang ingin kamu perbaiki dari karyamu?"*
2. **Refleksi Guru:**
   - *"Apakah seluruh peserta didik terlibat aktif dalam 3 tahap pengalaman belajar (Memahami-Mengaplikasikan-Merefleksikan)?"*
   - *"Apakah diferensiasi konten dan proses berhasil menjangkau murid yang membutuhkan bimbingan khusus?"*
   - *"Perbaikan apa yang harus saya terapkan pada modul berikutnya agar pembelajaran semakin menggembirakan dan bermakna?"*

---
*Disahkan di:* ${schoolName}  
*Mengetahui,*  
**Kepala Sekolah** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Guru Mata Pelajaran**

*(........................................................)* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **${teacherName}**  
NIP. .................................................... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NIP. ${nip || '....................................................'}
`;

  return {
    markdown,
    source: 'deep_learning_engine',
    topic,
    subject,
    grade,
    sectionsCount: 13,
  };
}

// Client generator dispatcher
export async function generateDeepLearningModul(
  input: DeepLearningInput
): Promise<DeepLearningResult> {
  try {
    const response = await fetch('/api/generate-modul-ajar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.source === 'gemini_ai' && data.markdown) {
        return {
          markdown: data.markdown,
          source: 'gemini_ai',
          topic: input.topic,
          subject: input.subject,
          grade: input.grade,
          sectionsCount: 13,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Modul Ajar AI API not reachable, using offline Deep Learning engine:', err);
  }

  // Deterministic 8-3-3-4 Deep Learning engine fallback
  return generateDeepLearningModulOffline(input);
}
