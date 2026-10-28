/*
 * ISI ILT TEKANAN HIDROSTATIS
 * ---------------------------------------------------------------
 * Semua teks soal, pilihan kotak, umpan balik, dan kunci ada di file ini.
 * Teks boleh diubah langsung di sini tanpa menyentuh file lain.
 * Placeholder yang diisi otomatis oleh sistem:
 *   {X}, {Y}      -> titik pada kalimat salah yang pertama
 *   [perbedaan]   -> (Tabel 2, M3) kedalamannya / jenis cairannya / ...
 * Teks bertanda "DRAF" belum ada di file Excel dan perlu dicek.
 */
(function () {
  "use strict";

  /* ---------- Data gambar pipa-U ----------
   * Tinggi = jarak dari dasar pipa-U (relatif, cm).
   * Kedalaman = jarak dari permukaan cairan di sisinya (cm).
   * Kolom minyak 10 cm, kolom air di atas B 8 cm (ρ minyak 0,8 g/cm³, ρ air 1 g/cm³),
   * sehingga tekanan A = B. C dan D sama-sama 5 cm di bawah permukaan.
   */
  const HEIGHT = { A: 0, B: 0, C: 5, D: 3 };
  const DEPTH = { A: 10, B: 8, C: 5, D: 5 };
  const PRESSURE = { A: 8, B: 8, C: 4, D: 5 }; // sebanding dengan ρ·h
  const POINTS = ["A", "B", "C", "D"];

  const pairKey = (x, y) => [x, y].sort().join("");

  const MAIN_QUESTION =
    "Pipa-U terbuka di kedua ujungnya dan berisi dua jenis fluida yang berbeda. " +
    "Bagaimana tekanan hidrostatis di titik A, B, C, dan D berhubungan satu sama lain " +
    "pada susunan seperti gambar? Berikan alasan jawabanmu dengan menyusun kalimat pada Tabel 1, 2, dan 3.";

  /* =============================================================
   * TABEL 1. DESKRIPSI SKEMA
   * ============================================================= */
  const REL1 = {
    garis: "berada pada satu garis datar dengan",
    kedalaman: "berada pada kedalaman yang sama dengan",
    dalam: "lebih dalam dari",
    dangkal: "lebih dangkal dari",
  };

  const T1 = {
    id: "t1",
    kind: "builder",
    short: "Tabel 1",
    title: "Tabel 1. Deskripsi Skema",
    lead: "Perhatikan letak titik A, B, C, dan D pada gambar. Susun kalimat tentang letak dan kedalaman titik-titik itu.",
    tip: "Pilih satu kotak dari setiap kolom, lalu tekan “Tambahkan”. Kamu tidak perlu menyusun semua kalimat yang mungkin. Susun yang menurutmu penting.",
    slots: [
      { key: "x", label: "Titik", options: POINTS.map((p) => ({ v: p, text: "Titik " + p, hl: p })) },
      { key: "rel", label: "Hubungan", options: Object.keys(REL1).map((k) => ({ v: k, text: REL1[k] })) },
      {
        key: "y", label: "Titik",
        options: POINTS.map((p) => ({ v: p, text: "titik " + p, hl: p })),
        disabled: (sel, o) => sel.x === o.v,
      },
    ],
    sentence: (it) => `Titik ${it.x} ${REL1[it.rel]} titik ${it.y}.`,
    evaluate(it) {
      const dx = DEPTH[it.x], dy = DEPTH[it.y];
      let ok, type = null;
      if (it.rel === "garis") {
        ok = HEIGHT[it.x] === HEIGHT[it.y];
        if (!ok) type = "K1";
      } else if (it.rel === "kedalaman") {
        ok = dx === dy;
        if (!ok) type = "K2";
      } else if (dx === dy) {
        ok = false; type = "K4";
      } else {
        ok = it.rel === "dalam" ? dx > dy : dx < dy;
        if (!ok) type = "K3";
      }
      const cores = [];
      if (ok) {
        const p = pairKey(it.x, it.y);
        if (p === "AB" && it.rel === "garis") cores.push(1);
        if (p === "AB" && (it.rel === "dalam" || it.rel === "dangkal")) cores.push(2);
        if (p === "CD" && it.rel === "kedalaman") cores.push(3);
      }
      return { ok, type, cores };
    },
    // Kalimat yang tepat untuk pasangan titik yang sama (dipakai saat kunci ditampilkan)
    correctFor(it) {
      const dx = DEPTH[it.x], dy = DEPTH[it.y];
      const rel = dx === dy ? "kedalaman" : dx > dy ? "dalam" : "dangkal";
      return T1.sentence({ x: it.x, rel, y: it.y });
    },
    errors: {
      K1: {
        name: "“Satu garis datar” untuk titik yang tidak sama tinggi",
        1: "Periksa lagi: apakah kamu membandingkan tinggi titik dari dasar pipa-U, atau jarak titik dari permukaan cairan?",
        2: "Satu garis datar berarti sama tinggi dari dasar pipa-U. Kedalaman yang sama berarti sama jauh dari permukaan cairan di sisinya. Periksa titik {X} dan {Y} dengan kedua cara itu.",
      },
      K2: {
        name: "“Kedalaman yang sama” untuk titik yang tidak sama dalam",
        1: "Ukur jarak titik {X} dan titik {Y} dari permukaan cairan di sisinya masing-masing. Apakah jaraknya sama?",
        2: "Kedalaman diukur dari permukaan cairan di sisi yang sama dengan titik itu, bukan dari dasar pipa-U. Jarak titik {X} dan {Y} dari permukaan cairan masing-masing tidak sama.",
      },
      K3: {
        name: "“Lebih dalam/lebih dangkal” dengan urutan terbalik",
        1: "Periksa lagi urutannya. Bandingkan jarak titik {X} dan {Y} dari permukaan cairan di sisinya masing-masing. Titik mana yang lebih jauh?",
        2: "Kedalaman diukur dari permukaan cairan di sisi yang sama dengan titik itu. Hitung jarak titik {X} dan {Y}, lalu bandingkan: yang lebih jauh lebih dalam, yang sama jauh sama dalam.",
      },
      K4: {
        name: "“Lebih dalam/lebih dangkal” untuk titik yang sama dalam",
        1: "Bandingkan jarak titik {X} dan titik {Y} dari permukaan cairannya. Lihat angka pada gambar.",
        2: "Angka pada gambar menunjukkan jarak titik {X} dan {Y} dari permukaan cairan masing-masing sama, jadi tidak ada yang lebih dalam atau lebih dangkal.",
      },
    },
    cores: [
      {
        id: 1, name: "Letak A dan B",
        key: "Titik A berada pada satu garis datar dengan titik B.",
        1: "Masih ada hal penting tentang titik A dan B yang belum kamu sebut. Bagaimana letak A dan B dari dasar pipa-U?",
        2: "Susun kalimat tentang letak titik A dan B terhadap suatu garis datar.",
      },
      {
        id: 2, name: "Kedalaman A dan B",
        key: "Titik A lebih dalam dari titik B.",
        1: "Bandingkan kedalaman titik A dan titik B.",
        2: "Ukur jarak A dari permukaan minyak dan jarak B dari permukaan air, lalu bandingkan.",
      },
      {
        id: 3, name: "Kedalaman C dan D",
        key: "Titik C berada pada kedalaman yang sama dengan titik D.",
        1: "Bandingkan kedalaman titik C dan titik D.",
        2: "Lihat angka pada gambar untuk jarak C dan D dari permukaan cairan masing-masing.",
      },
    ],
    complete:
      "Semua kalimatmu tepat dan sudah lengkap. Ingat lagi cara yang kamu pakai tadi untuk membaca letak dan kedalaman titik-titik pada gambar. Cara itu akan berguna lagi di Tabel 2.",
    kcrNote:
      "Cocokkan dengan kalimatmu tadi. Perhatikan lagi data pada gambar, lalu perhatikan bagian yang tadi terlewat.",
  };

  /* =============================================================
   * TABEL 2. MEMBANDINGKAN PARAMETER
   * ============================================================= */
  const SUBJ2 = {
    pA: { kind: "p", pt: "A", val: PRESSURE.A, L: "Tekanan di titik A", R: "tekanan di titik A", hl: "A" },
    pB: { kind: "p", pt: "B", val: PRESSURE.B, L: "Tekanan di titik B", R: "tekanan di titik B", hl: "B" },
    pC: { kind: "p", pt: "C", val: PRESSURE.C, L: "Tekanan di titik C", R: "tekanan di titik C", hl: "C" },
    pD: { kind: "p", pt: "D", val: PRESSURE.D, L: "Tekanan di titik D", R: "tekanan di titik D", hl: "D" },
    air: { kind: "rho", val: 1000, L: "Massa jenis air", R: "massa jenis air", hl: "air" },
    minyak: { kind: "rho", val: 800, L: "Massa jenis minyak", R: "massa jenis minyak", hl: "minyak" },
  };
  const REL2 = { sama: "sama besar dengan", besar: "lebih besar dari", kecil: "lebih kecil dari" };
  const PERBEDAAN = {
    AC: "kedalamannya", BD: "kedalamannya",
    CD: "jenis cairannya",
    AD: "kedalaman dan jenis cairannya", BC: "kedalaman dan jenis cairannya",
  };
  const truth2 = (x, y) => {
    const v = SUBJ2[x].val, w = SUBJ2[y].val;
    return v === w ? "sama" : v > w ? "besar" : "kecil";
  };

  const T2 = {
    id: "t2",
    kind: "builder",
    short: "Tabel 2",
    title: "Tabel 2. Membandingkan Parameter",
    lead: "Bandingkan tekanan di titik-titik pada gambar, dan bandingkan massa jenis kedua cairan.",
    tip: "Tekanan hanya dibandingkan dengan tekanan, dan massa jenis hanya dengan massa jenis. Kotak kiri dan kanan tidak boleh sama.",
    slots: [
      { key: "x", label: "Besaran", options: Object.keys(SUBJ2).map((k) => ({ v: k, text: SUBJ2[k].L, hl: SUBJ2[k].hl })) },
      { key: "rel", label: "Hubungan", options: Object.keys(REL2).map((k) => ({ v: k, text: REL2[k] })) },
      {
        key: "y", label: "Besaran",
        options: Object.keys(SUBJ2).map((k) => ({ v: k, text: SUBJ2[k].R, hl: SUBJ2[k].hl })),
        disabled: (sel, o) => !!sel.x && (sel.x === o.v || SUBJ2[sel.x].kind !== SUBJ2[o.v].kind),
      },
    ],
    sentence: (it) => `${SUBJ2[it.x].L} ${REL2[it.rel]} ${SUBJ2[it.y].R}.`,
    evaluate(it) {
      const ok = it.rel === truth2(it.x, it.y);
      const a = SUBJ2[it.x], b = SUBJ2[it.y];
      let type = null, ctx = {};
      const p = a.kind === "p" ? pairKey(a.pt, b.pt) : null;
      if (a.kind === "p") ctx = { X: a.pt, Y: b.pt, perbedaan: PERBEDAAN[p] || "" };
      if (!ok) {
        if (a.kind === "rho") type = "M4";
        else if (p === "AB") type = "M2";
        else if (p === "CD" && it.rel === "sama") type = "M1";
        else type = "M3";
      }
      const cores = [];
      if (ok) {
        if (a.kind === "rho") cores.push(4);
        else if (p === "AB") cores.push(1);
        else if (p === "AC" || p === "BD") cores.push(2);
        else if (p === "CD") cores.push(3);
      }
      return { ok, type, cores, ctx };
    },
    correctFor: (it) => T2.sentence({ x: it.x, rel: truth2(it.x, it.y), y: it.y }),
    errors: {
      M1: {
        name: "“Sama besar” untuk tekanan C dan D",
        1: "Titik C dan D memang sama dalam. Tetapi apakah cairan di sekitar keduanya sama?",
        2: "Tekanan hidrostatis bergantung pada kedalaman dan massa jenis cairan. C dan D sama dalam, tetapi berada di cairan yang berbeda. Bandingkan massa jenis kedua cairan itu.",
      },
      M2: {
        name: "Tekanan A dan B dibedakan",
        1: "Ingat hasil Tabel 1: bagaimana letak titik A dan titik B? Apakah letak itu memengaruhi tekanan keduanya?",
        2: "Titik yang sejajar di dalam fluida yang sama dan saling terhubung mengikuti Hukum Pokok Hidrostatika. Titik A dan B memenuhi syarat itu karena terhubung oleh air. Terapkan aturan itu pada tekanan A dan B.",
      },
      M3: {
        name: "Urutan tekanan terbalik, atau “sama besar” untuk pasangan lain",
        1: "Apa yang membedakan titik {X} dan {Y}: kedalamannya, jenis cairannya, atau keduanya?",
        2: "Titik {X} dan {Y} berbeda dalam hal [perbedaan]. Tekanan hidrostatis dipengaruhi oleh hal itu. Pikirkan bagaimana perbedaan itu memengaruhi tekanan.",
      },
      M4: {
        name: "Perbandingan massa jenis salah",
        1: "Lihat susunan cairan pada gambar. Cairan mana yang berada di atas?",
        2: "Minyak berada di atas air. Cairan yang lebih ringan mengapung di atas cairan yang lebih berat. Bandingkan lagi massa jenis kedua cairan itu.",
      },
    },
    cores: [
      {
        id: 1, name: "Tekanan A dan B",
        key: "Tekanan di titik A sama besar dengan tekanan di titik B.",
        1: "Bandingkan tekanan di titik A dan titik B.",
        2: "Ingat hasil Tabel 1: bagaimana letak titik A dan B? Apa artinya bagi tekanannya?",
      },
      {
        id: 2, name: "Dua titik di cairan yang sama",
        key: "Tekanan di titik A lebih besar dari tekanan di titik C.",
        1: "Bandingkan tekanan dua titik yang berada di cairan yang sama.",
        2: "Pilih dua titik di dalam minyak (A dan C), atau dua titik di dalam air (B dan D), lalu bandingkan tekanannya.",
      },
      {
        id: 3, name: "Tekanan C dan D",
        key: "Tekanan di titik D lebih besar dari tekanan di titik C.",
        1: "Bandingkan tekanan di titik C dan titik D.",
        2: "Titik C dan D sama dalam tetapi berada di cairan yang berbeda. Bandingkan tekanan keduanya.",
      },
      {
        id: 4, name: "Massa jenis",
        key: "Massa jenis air lebih besar dari massa jenis minyak.",
        1: "Bandingkan massa jenis kedua cairan.",
        2: "Lihat susunan cairan pada gambar. Cairan mana yang berada di atas? Gunakan itu untuk membandingkan massa jenisnya.",
      },
    ],
    complete:
      "Semua kalimatmu tepat dan sudah lengkap. Ingat lagi cara yang kamu pakai tadi untuk membandingkan tekanan titik-titik. Cara itu akan berguna lagi di Tabel 3.",
    kcrNote:
      "Cocokkan dengan kalimatmu tadi. Ingat lagi hasil Tabel 1 dan data pada gambar, lalu perhatikan bagian yang tadi terlewat.",
  };

  /* =============================================================
   * TABEL 3. HUBUNGAN ANTARPARAMETER
   * ============================================================= */
  const COND3 = {
    fluida: { text: "Pada fluida yang sama,", q1: "kedalaman", q2: "tekanan", same: true, type: "N1", core: 1 },
    kedalaman: { text: "Pada kedalaman yang sama,", q1: "massa jenis", q2: "tekanan", same: true, type: "N2", core: 2 },
    tekanan: { text: "Pada tekanan yang sama,", q1: "massa jenis", q2: "kedalaman", same: false, type: "N3", core: 3 },
  };
  const DIR = { besar: "lebih besar", kecil: "lebih kecil" };
  const flip = (d) => (d === "besar" ? "kecil" : "besar");

  const T3 = {
    id: "t3",
    kind: "builder",
    short: "Tabel 3",
    title: "Tabel 3. Hubungan Antarparameter",
    lead: "Nyatakan hubungan antara kedalaman, massa jenis, dan tekanan. Gunakan temuanmu di Tabel 1 dan Tabel 2.",
    tip: "Pilih kondisinya dulu. Besaran [1] dan [2] akan terisi otomatis. Cukup satu kalimat untuk tiap kondisi.",
    slots: [
      { key: "cond", label: "Kondisi", options: Object.keys(COND3).map((k) => ({ v: k, text: COND3[k].text })) },
      { key: "q1", auto: (sel) => (sel.cond ? COND3[sel.cond].q1 : "besaran [1]") },
      { key: "d1", label: "Arah [1]", options: Object.keys(DIR).map((k) => ({ v: k, text: DIR[k] })) },
      { key: "berarti", fixed: "berarti" },
      { key: "q2", auto: (sel) => (sel.cond ? COND3[sel.cond].q2 : "besaran [2]") },
      { key: "d2", label: "Arah [2]", options: Object.keys(DIR).map((k) => ({ v: k, text: DIR[k] })) },
    ],
    sentence: (it) => {
      const c = COND3[it.cond];
      return `${c.text} ${c.q1} ${DIR[it.d1]} berarti ${c.q2} ${DIR[it.d2]}.`;
    },
    evaluate(it) {
      const c = COND3[it.cond];
      const ok = c.same ? it.d1 === it.d2 : it.d1 !== it.d2;
      return { ok, type: ok ? null : c.type, cores: ok ? [c.core] : [] };
    },
    correctFor(it) {
      const c = COND3[it.cond];
      return T3.sentence({ cond: it.cond, d1: it.d1, d2: c.same ? it.d1 : flip(it.d1) });
    },
    errors: {
      N1: {
        name: "Arah salah pada “fluida yang sama”",
        1: "Lihat tekanan dua titik yang berada di cairan yang sama (A dan C, atau B dan D) di Tabel 2. Titik yang lebih dalam, tekanannya bagaimana?",
        2: "Bandingkan kedalaman titik A dan C (atau B dan D) di Tabel 1 dengan tekanannya di Tabel 2. Kalimatmu harus sesuai dengan temuan itu.",
      },
      N2: {
        name: "Arah salah pada “kedalaman yang sama”",
        1: "Lihat titik C dan D. Keduanya sama dalam. Bagaimana tekanannya di Tabel 2, dan cairan mana yang massa jenisnya lebih besar?",
        2: "Titik C dan D sama dalam tetapi tekanannya berbeda. Bandingkan tekanan keduanya dengan massa jenis air dan minyak di Tabel 2. Kalimatmu harus sesuai dengan temuan itu.",
      },
      N3: {
        name: "Arah salah pada “tekanan yang sama”",
        1: "Lihat titik A dan B. Bagaimana tekanannya di Tabel 2, dan bagaimana kedalamannya di Tabel 1? Cairan mana yang berada di atas masing-masing titik?",
        2: "Tekanan A dan B sama, tetapi kedalamannya berbeda. Cairan di atas titik yang lebih dalam adalah cairan dengan massa jenis yang lebih kecil atau lebih besar? Perbaiki kalimatmu.",
      },
    },
    cores: [
      {
        id: 1, name: "Kedalaman dan tekanan",
        key: "Pada fluida yang sama, kedalaman lebih besar berarti tekanan lebih besar.",
        1: "Masih ada hubungan antara kedalaman dan tekanan yang belum kamu sebut.",
        2: "Pikirkan titik-titik yang berada di cairan yang sama (A dan C, atau B dan D). Bagaimana hubungan kedalaman dan tekanannya?",
      },
      {
        id: 2, name: "Massa jenis dan tekanan",
        key: "Pada kedalaman yang sama, massa jenis lebih besar berarti tekanan lebih besar.",
        1: "Masih ada hubungan antara massa jenis dan tekanan yang belum kamu sebut.",
        2: "Pikirkan titik C dan D yang sama dalam. Bagaimana hubungan massa jenis dan tekanannya?",
      },
      {
        id: 3, name: "Massa jenis dan kedalaman",
        key: "Pada tekanan yang sama, massa jenis lebih kecil berarti kedalaman lebih besar.",
        1: "Masih ada hubungan antara massa jenis dan kedalaman yang belum kamu sebut.",
        2: "Pikirkan titik A dan B yang tekanannya sama. Bagaimana hubungan massa jenis dan kedalamannya?",
      },
    ],
    complete: "Semua kalimatmu tepat dan sudah lengkap. Lanjut ke Kesimpulan.",
    // DRAF: Excel tidak memuat teks kunci untuk Tabel 3, jadi mengikuti pola Tabel 1–2.
    kcrNote:
      "Cocokkan dengan kalimatmu tadi. Ingat lagi hasil Tabel 1 dan Tabel 2, lalu perhatikan bagian yang tadi terlewat.",
  };

  /* =============================================================
   * KESIMPULAN
   * ============================================================= */
  const KES = {
    id: "kes",
    kind: "choice",
    short: "Kesimpulan",
    title: "Kesimpulan",
    lead: "Gunakan kalimat-kalimat yang sudah kamu susun di Tabel 1, 2, dan 3.",
    questions: [
      {
        key: "k",
        prompt: "Kolom minyak lebih tinggi daripada kolom air karena…",
        options: [
          { v: "a", text: "Tekanan di A sama dengan tekanan di B, dan massa jenis minyak lebih kecil daripada massa jenis air." },
          { v: "b", text: "Tekanan di A sama dengan tekanan di B, dan massa jenis minyak lebih besar daripada massa jenis air." },
          { v: "c", text: "Tekanan di A lebih besar daripada tekanan di B, dan massa jenis minyak lebih kecil daripada massa jenis air." },
          { v: "d", text: "Volume minyak lebih banyak daripada volume air, sehingga tekanannya lebih besar." },
        ],
        answer: "a",
      },
    ],
    // Kode jenis kesalahan untuk laporan guru
    codes: { b: "KS-b", c: "KS-c", d: "KS-d" },
    codeNames: {
      "KS-b": "Kesimpulan b: massa jenis terbalik",
      "KS-c": "Kesimpulan c: tekanan A dan B dibedakan",
      "KS-d": "Kesimpulan d: konsep volume",
    },
    feedback(sel, attempt) {
      const n = attempt >= 2 ? 2 : 1;
      const F = {
        a: { ok: true, 1: "Tepat. Tekanan di A sama dengan tekanan di B. Karena massa jenis minyak lebih kecil, kolom minyak harus lebih tinggi untuk menghasilkan tekanan yang sama." },
        b: {
          1: "Bagian tentang tekanan sudah tepat. Periksa bagian massa jenis. Lihat susunan cairan pada gambar: cairan mana yang berada di atas?",
          2: "Bagian tentang tekanan sudah tepat. Minyak berada di atas air. Cairan yang lebih ringan mengapung di atas cairan yang lebih berat, jadi massa jenis minyak lebih kecil daripada air.",
        },
        c: {
          1: "Bagian tentang massa jenis sudah tepat. Periksa bagian tekanan. Lihat kembali kalimat tekanan A dan B yang kamu susun di Tabel 2.",
          2: "Bagian tentang massa jenis sudah tepat. Titik A dan B sejajar dan terhubung oleh air, sehingga tekanannya sama (Tabel 2).",
        },
        d: {
          1: "Lihat kembali Tabel 3. Besaran apa saja yang memengaruhi tekanan?",
          2: "Volume cairan tidak memengaruhi tekanan hidrostatis. Yang berpengaruh adalah kedalaman dan massa jenis (Tabel 3). Gunakan keduanya untuk menjelaskan mengapa kolom minyak lebih tinggi.",
        },
      };
      const f = F[sel.k];
      if (f.ok) return { ok: true, marks: { k: true }, msgs: [{ tone: "ok", text: f[1] }], codes: [] };
      return { ok: false, marks: { k: false }, msgs: [{ tone: "bad", text: f[n] }], codes: [KES.codes[sel.k]] };
    },
    keyText: () => ["Jawaban yang tepat: a. Tekanan di A sama dengan tekanan di B, dan massa jenis minyak lebih kecil daripada massa jenis air."],
  };

  /* =============================================================
   * PELUANG
   * ============================================================= */
  const PEL = {
    id: "pel",
    kind: "choice",
    short: "Peluang",
    title: "Peluang",
    lead: "Lima kelompok mengukur tinggi kolom minyak pada pipa-U yang sama. Hasilnya (cm): 10,0 ; 10,0 ; 10,0 ; 9,8 ; 10,2.",
    data: ["10,0", "10,0", "10,0", "9,8", "10,2"],
    questions: [
      {
        key: "p1",
        label: "P.1 Jawaban",
        prompt: "Berapa peluang pengukuran berikutnya menghasilkan 10,0 cm?",
        options: [
          { v: "a", text: "3/5" },
          { v: "b", text: "1/3" },
          { v: "c", text: "1/2" },
          { v: "d", text: "Pasti 10,0 cm (peluangnya 1)" },
        ],
        answer: "a",
      },
      {
        key: "p2",
        label: "P.2 Alasan",
        prompt: "Alasan jawabanmu:",
        // DRAF: teks pilihan alasan tidak tertulis di Excel, disusun dari umpan baliknya. Mohon dicek.
        options: [
          { v: "a", text: "Dari 5 data, ada 3 data yang bernilai 10,0 cm." },
          { v: "b", text: "Hanya ada dua kemungkinan: hasilnya 10,0 cm atau bukan 10,0 cm." },
          { v: "c", text: "Pipa-U dan minyaknya sama, jadi hasil pengukurannya pasti selalu sama." },
          { v: "d", text: "Hasil pengukuran berikutnya tidak bisa diperkirakan karena setiap pengukuran bisa berbeda." },
        ],
        answer: "a",
      },
    ],
    codeNames: {
      "P1-b": "P.1 b (1/3): tiap nilai dianggap sama peluangnya",
      "P1-c": "P.1 c (1/2): dua kemungkinan",
      "P1-d": "P.1 d (pasti)",
      "P2-bc": "P.2 b/c: alasan tidak memakai data",
      "P2-d": "P.2 d: data dianggap tidak bisa dipakai",
    },
    feedback(sel, attempt) {
      const n = attempt >= 2 ? 2 : 1;
      const p1ok = sel.p1 === "a", p2ok = sel.p2 === "a";
      const P1 = {
        b: { 1: "Hitung berapa kali tiap nilai muncul.", 2: "Nilai yang berbeda tidak otomatis sama peluangnya. Dari 5 data, 10,0 muncul 3 kali, 9,8 muncul 1 kali, dan 10,2 muncul 1 kali." },
        c: { 1: "Gunakan banyaknya data yang muncul, bukan banyaknya pilihan.", 2: "Hasilnya bukan dua kemungkinan yang sama peluangnya. Peluang = banyak data bernilai 10,0 : seluruh data." },
        d: { 1: "Hitung berapa data yang bernilai 10,0 cm dari seluruh data.", 2: "Pengukuran nyata bisa berbeda tipis dari 10,0 cm (ada 9,8 dan 10,2 cm), jadi hasilnya tidak pasti 10,0 cm." },
      };
      const P2 = {
        b: { 1: "Alasannya belum tepat. Alasan yang tepat memakai data yang diberikan.", 2: "Alasannya belum tepat. Pilih alasan yang menyebut berapa data yang bernilai 10,0 cm." },
        d: { 1: "Alasannya belum tepat. Data berulang dapat dipakai untuk memperkirakan peluang.", 2: "Alasannya belum tepat. Pilih alasan yang menyebut berapa data yang bernilai 10,0 cm." },
      };
      P2.c = P2.b;
      const codes = [];
      if (!p1ok) codes.push("P1-" + sel.p1);
      if (!p2ok) codes.push(sel.p2 === "d" ? "P2-d" : "P2-bc");
      const marks = { p1: p1ok, p2: p2ok };

      if (p1ok && p2ok)
        return { ok: true, marks, codes, msgs: [{ tone: "ok", text: "Tepat. 3 dari 5 data bernilai 10,0 cm, jadi peluangnya 3/5." }] };
      if (p1ok)
        return { ok: false, marks, codes, msgs: [{ tone: "ok", text: "Jawabanmu tepat." }, { tone: "bad", text: P2[sel.p2][n] }] };
      const msgs = [{ tone: "bad", text: P1[sel.p1][n] }];
      if (p2ok) msgs.push({ tone: "ok", text: "Alasanmu sudah tepat. Gunakan alasan itu untuk menghitung jawabanmu." });
      else if (n === 2) msgs.push({ tone: "bad", text: P2[sel.p2][2] });
      return { ok: false, marks, codes, msgs };
    },
    keyText: () => [
      "Jawaban yang tepat: P.1 a. 3/5",
      "Alasan yang tepat: P.2 a. Dari 5 data, ada 3 data yang bernilai 10,0 cm.",
    ],
  };

  /* =============================================================
   * REFLEKSI (KMC) — DRAF: kalimat lengkap pertanyaan belum ada di Excel
   * ============================================================= */
  const KMC = [
    { key: "kmc1", q: "Apa yang kamu ubah dari jawabanmu setelah membaca umpan balik? Mengapa?" },
    { key: "kmc2", q: "Langkah apa yang paling membantumu menemukan jawaban yang tepat?" },
  ];

  const CONFIDENCE = [
    { v: 1, text: "Menebak" },
    { v: 2, text: "Kurang yakin" },
    { v: 3, text: "Yakin" },
    { v: 4, text: "Sangat yakin" },
  ];

  const INTRO_STEPS = [
    { t: "Susun kalimat", d: "Pilih satu kotak dari setiap kolom. Kamu juga bisa menyeret kotak ke tempatnya." },
    { t: "Tambahkan", d: "Masukkan kalimatmu ke daftar jawaban. Kalimat bisa diubah atau dihapus." },
    { t: "Pilih keyakinan", d: "Seberapa yakin kamu dengan jawabanmu? Pilih 1–4 sebelum memeriksa." },
    { t: "Periksa", d: "Kamu akan mendapat tanda ✓ atau ✗ dan petunjuk. Perbaiki lalu periksa lagi." },
  ];

  window.ILT_CONTENT = {
    MAIN_QUESTION,
    SCREENS: [T1, T2, T3, KES, PEL],
    KMC,
    CONFIDENCE,
    INTRO_STEPS,
    // Nama jenis kesalahan untuk dasbor guru
    ERROR_NAMES: Object.assign(
      {},
      ...[T1, T2, T3].map((t) => Object.fromEntries(Object.entries(t.errors).map(([k, e]) => [k, e.name]))),
      KES.codeNames,
      PEL.codeNames
    ),
    SCORE_RULE: "Tepat di percobaan ke-1 = 4, ke-2 = 3, kunci ditampilkan = 2, tidak dikerjakan = 1.",
  };
})();
