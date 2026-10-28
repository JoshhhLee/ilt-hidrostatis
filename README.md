# ILT Tekanan Hidrostatis

Interactive Learning Task (ILT) berbasis web untuk materi **tekanan hidrostatis** pada pipa-U berisi air dan minyak.
Siswa menyusun kalimat alasan dari kotak-kotak pilihan, mendapat umpan balik bertahap, lalu melihat skornya sendiri.
Hasil setiap siswa terkirim ke Google Sheets dan bisa dilihat guru di halaman dasbor.

| Halaman | Untuk | Isi |
|---|---|---|
| `index.html` | Siswa | Pengantar → Tabel 1 → Tabel 2 → Tabel 3 → Kesimpulan → Peluang → Hasil & refleksi |
| `guru.html` | Guru | Rekap skor, kesalahan paling sering, keyakinan vs ketepatan, rincian tiap siswa, unduh CSV |

Tidak perlu instalasi atau *build*: semua file statis (HTML, CSS, JavaScript).

---

## Langkah 1 — Siapkan Google Sheets (sekali saja)

1. Buka [sheets.new](https://sheets.new) untuk membuat Google Sheet baru, beri nama misalnya **Hasil ILT Hidrostatis**.
2. Menu **Ekstensi → Apps Script**.
3. Hapus isi `Code.gs`, lalu tempel seluruh isi file [`apps-script/Code.gs`](apps-script/Code.gs).
4. Di baris paling atas, ganti `ganti-password-ini` dengan password guru yang kamu inginkan.
5. Klik **Simpan** (ikon disket).
6. Klik **Terapkan → Deployment baru**.
   - Ikon roda gigi → pilih **Aplikasi web**.
   - *Jalankan sebagai*: **Saya**.
   - *Yang memiliki akses*: **Siapa saja**.
   - Klik **Terapkan**, lalu izinkan akses saat diminta (pilih akun Google-mu → *Lanjutan* → *Buka … (tidak aman)* → *Izinkan*).
7. Salin **URL aplikasi web** (berakhiran `/exec`).

> Sheet **Hasil** (satu baris per siswa) dan **Log Percobaan** (satu baris per kali menekan Periksa) dibuat otomatis saat siswa pertama mengirim hasil.
> Bila `Code.gs` diubah lagi, pakai **Terapkan → Kelola deployment → Edit → Versi baru** supaya URL-nya tetap sama.

## Langkah 2 — Hubungkan website ke Sheet

Buka `assets/js/config.js` dan tempel URL tadi:

```js
window.ILT_CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/XXXX/exec",
  maxAttempts: 2,          // percobaan sebelum kunci ditampilkan
  timeLimitMinutes: 25,    // 0 = tanpa batas waktu
};
```

Selama `scriptUrl` masih kosong, website tetap bisa dicoba: hasil hanya tersimpan di perangkat siswa (bisa diunduh sebagai file `.json`, lalu diimpor di dasbor guru).

## Langkah 3 — Online-kan dengan GitHub Pages

Repositori → **Settings → Pages** → *Source*: **Deploy from a branch** → branch `main`, folder `/ (root)` → **Save**.
Setelah ±1 menit website tersedia di `https://<username>.github.io/<nama-repo>/`.
Bagikan alamat itu ke siswa, dan `…/guru.html` untuk guru.

---

## Mengubah teks soal dan umpan balik

Semua teks ada di **`assets/js/content.js`**: soal, pilihan kotak, pesan umpan balik (K1–K4, M1–M4, N1–N3), hal inti, kunci, pilihan Kesimpulan dan Peluang, serta pertanyaan refleksi.
Ubah teks di dalam tanda kutip saja. Placeholder `{X}`, `{Y}`, dan `[perbedaan]` diisi otomatis oleh sistem.

## Aturan yang dipakai (dari file skema Excel)

- Satu kali menekan **Periksa** = satu percobaan; dihitung terpisah untuk tiap bagian.
- Sebelum Periksa, siswa wajib memilih **keyakinan 1–4**.
- Kalimat ✗ dikelompokkan per jenis kesalahan; jenis yang sama hanya satu pesan, **maksimal dua pesan** per percobaan; `{X}`/`{Y}` diambil dari kalimat salah yang pertama.
- Percobaan ke-1: tanda ✓/✗ + pertanyaan pengarah. Percobaan ke-2 dst: ✓/✗ + penjelasan + pertanyaan pengarah.
- Bila semua kalimat benar tetapi belum lengkap, muncul petunjuk hal inti yang belum disebut.
- Bila setelah percobaan ke-2 masih belum tepat: **kalimat yang tepat** ditampilkan (perbaikan kalimat yang salah + hal inti yang belum disebut), siswa boleh memperbaiki atau langsung lanjut.
- **Skor per bagian**: tepat di percobaan ke-1 = 4, ke-2 = 3, kunci ditampilkan = 2, tidak dikerjakan = 1.
- **CRR (IKTP 8)** = rata-rata skor Tabel 1, 2, 3, dan Kesimpulan (dibulatkan). **PBR (IKTP 9)** = skor Peluang.

Pemeriksaan sudah dicek terhadap file Excel: Tabel 1 = 48 kalimat (14 benar), Tabel 2 = 42 kalimat (14 benar, 10 kalimat inti), Tabel 3 = 12 kalimat (6 benar).

## Yang masih perlu dicek pemilik penelitian

1. **Jumlah percobaan.** Di file Excel ada tiga versi (kunci setelah percobaan ke-2, ke-3, atau usulan ke-5 dengan skor 1). Website memakai **2 percobaan** sesuai tabel skor; ubah `maxAttempts` di `config.js` bila perlu.
2. **Pilihan alasan P.2 (Peluang)** tidak tertulis di Excel. Teksnya disusun dari umpan balik dan ditandai `DRAF` di `content.js`.
3. **Pertanyaan refleksi (KMC)** di Excel hanya tertulis sebagian. Kalimat lengkapnya ditandai `DRAF`, dan saat ini ditampilkan di layar akhir.
4. **Teks kunci Tabel 3** (setelah percobaan ke-2) tidak ada di Excel; dibuat mengikuti pola Tabel 1–2.
5. Catatan bimbingan tentang **umpan balik berbasis AI** belum diterapkan. Versi ini memakai umpan balik berbasis aturan sesuai rancangan di Excel.

## Struktur folder

```
index.html            halaman siswa
guru.html             dasbor guru
assets/css/           tampilan
assets/js/config.js   pengaturan (URL Sheet, jumlah percobaan, batas waktu)
assets/js/content.js  semua teks & aturan ILT
assets/js/app.js      logika halaman siswa
assets/js/guru.js     logika dasbor guru
apps-script/Code.gs   penerima data di Google Sheets
```
