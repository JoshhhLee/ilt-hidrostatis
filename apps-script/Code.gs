/**
 * ILT Tekanan Hidrostatis — penerima hasil siswa (Google Apps Script)
 *
 * Cara pasang: lihat README.md, langkah 1.
 * Ganti PASSWORD_GURU di bawah sebelum dipakai.
 */
const PASSWORD_GURU = 'ganti-password-ini';

const SHEET_HASIL = 'Hasil';
const SHEET_LOG = 'Log Percobaan';

const HEAD_HASIL = [
  'Waktu kirim', 'ID sesi', 'Nama', 'Kelas', 'No. absen',
  'Mulai', 'Selesai', 'Durasi (menit)', 'Waktu habis',
  'Skor Tabel 1', 'Skor Tabel 2', 'Skor Tabel 3', 'Skor Kesimpulan', 'Skor Peluang',
  'CRR (IKTP 8)', 'PBR (IKTP 9)',
  'Percobaan T1', 'Percobaan T2', 'Percobaan T3', 'Percobaan Kes', 'Percobaan Pel',
  'Kunci tampil (percobaan ke-)', 'Jenis kesalahan',
  'Refleksi 1', 'Refleksi 2', 'Data lengkap (JSON)'
];
const HEAD_LOG = [
  'ID sesi', 'Nama', 'Kelas', 'Layar', 'Percobaan', 'Waktu', 'Keyakinan (1-4)',
  'Status', 'Kalimat / pilihan (✓/✗)', 'Kode kesalahan', 'Pesan ditampilkan', 'Kunci ditampilkan'
];
const LAYAR = ['t1', 't2', 't3', 'kes', 'pel'];
const NAMA_LAYAR = { t1: 'Tabel 1', t2: 'Tabel 2', t3: 'Tabel 3', kes: 'Kesimpulan', pel: 'Peluang' };

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#e8eeff');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Sel Google Sheets maksimal 50.000 karakter; bila terlalu panjang, log dilepas (tetap ada di sheet Log).
function fullJson_(d) {
  const full = JSON.stringify(d);
  if (full.length < 49000) return full;
  return JSON.stringify(Object.assign({}, d, { log: [], logTruncated: true }));
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.submissionId || !d.nama) return json_({ ok: false, error: 'data tidak lengkap' });

    const hasil = sheet_(SHEET_HASIL, HEAD_HASIL);
    // Abaikan kiriman ganda (siswa menekan kirim dua kali / kirim ulang)
    const last = hasil.getLastRow();
    if (last > 1) {
      const ids = hasil.getRange(2, 2, last - 1, 1).getValues().flat();
      if (ids.indexOf(d.submissionId) !== -1) return json_({ ok: true, duplicate: true });
    }

    const s = d.scores || {}, a = d.attempts || {}, k = d.keyShown || {};
    const kunci = LAYAR.filter(function (id) { return k[id]; })
      .map(function (id) { return NAMA_LAYAR[id] + ': ' + k[id]; }).join('; ');
    hasil.appendRow([
      new Date(), d.submissionId, d.nama, d.kelas, d.absen,
      d.startedAt ? new Date(d.startedAt) : '', d.finishedAt ? new Date(d.finishedAt) : '',
      d.durationSec != null ? Math.round(d.durationSec / 6) / 10 : '', d.timeUp ? 'ya' : 'tidak',
      s.t1, s.t2, s.t3, s.kes, s.pel, d.crr, d.pbr,
      a.t1, a.t2, a.t3, a.kes, a.pel,
      kunci || '-', (d.errorCodes || []).join(', '),
      d.kmc1 || '', d.kmc2 || '', fullJson_(d)
    ]);

    const log = sheet_(SHEET_LOG, HEAD_LOG);
    const rows = (d.log || []).map(function (l) {
      const isi = l.items
        ? l.items.map(function (it) { return (it.ok ? '✓ ' : '✗ ') + it.text; }).join('\n')
        : Object.keys(l.choice || {}).map(function (q) { return q + ': ' + l.choice[q]; }).join(', ');
      return [
        d.submissionId, d.nama, d.kelas, NAMA_LAYAR[l.screen] || l.screen, l.attempt,
        l.at ? new Date(l.at) : '', l.confidence, l.status, isi,
        (l.codes || []).join(', '), (l.shown || []).join(', '), l.keyShown ? 'ya' : 'tidak'
      ];
    });
    if (rows.length) log.getRange(log.getLastRow() + 1, 1, rows.length, HEAD_LOG.length).setValues(rows);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Dipakai halaman guru (guru.html) untuk membaca semua hasil. */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'list') return json_({ ok: true, info: 'ILT Hidrostatis aktif' });
  if (p.key !== PASSWORD_GURU) return json_({ ok: false, error: 'password salah' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_HASIL);
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, rows: [] });
  const col = HEAD_HASIL.indexOf('Data lengkap (JSON)') + 1;
  const vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
  const rows = [];
  vals.forEach(function (v) {
    try { rows.push(JSON.parse(v[0])); } catch (err) { /* baris rusak / terpotong dilewati */ }
  });
  return json_({ ok: true, rows: rows });
}
