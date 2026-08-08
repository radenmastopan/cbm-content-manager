/*************************************************
 CBM SOCIAL REPORT API
 Tester Laporan Konten Medsos 1
*************************************************/

const SPREADSHEET_ID = "1WMRrSXnDfzDuImVhuWjofopVRz8Xt34VEHGXymPFAjY";

const SHEETS = {
  ON_PROCESS: "Konten On Process",
  STOCK: "Stock konten",
  UPLOAD: "Konten Terupload",
  BOOSTER: "Booster live"
};

function doGet(e) {
  try {
    const action = String(e?.parameter?.action || "").trim();

    // Dipakai oleh tombol Review Konten untuk short-link TikTok.
    if (action === "resolveTikTok") {
      return resolveTikTok(e.parameter.url || "");
    }

    const result = {
      success: true,
      onProcess: readSheet(SHEETS.ON_PROCESS, "onProcess"),
      stock: readSheet(SHEETS.STOCK, "stock"),
      upload: readSheet(SHEETS.UPLOAD, "upload"),
      boosterLive: readSheet(SHEETS.BOOSTER, "boosterLive")
    };

    return jsonOutput(result);
  } catch (error) {
    return jsonOutput({
      success: false,
      message: String(error && error.message ? error.message : error),
      onProcess: [],
      stock: [],
      upload: [],
      boosterLive: []
    });
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const body = JSON.parse(raw);

    if (body.action !== "add") {
      return jsonOutput({ success: false, message: "Action tidak dikenali." });
    }

    const sheetKey = String(body.sheet || "").trim();
    const sheetName = sheetNameFromKey(sheetKey);
    if (!sheetName) {
      return jsonOutput({ success: false, message: "Nama sheet tidak dikenali." });
    }

    const sheet = getSheet(sheetName);
    if (!sheet) {
      return jsonOutput({ success: false, message: "Sheet tidak ditemukan: " + sheetName });
    }

    const row = buildRow(sheetKey, body.data || {}, sheet);
    sheet.appendRow(row);

    return jsonOutput({
      success: true,
      message: "Data berhasil ditambahkan.",
      sheet: sheetName,
      rowNumber: sheet.getLastRow()
    });
  } catch (error) {
    return jsonOutput({
      success: false,
      message: String(error && error.message ? error.message : error)
    });
  }
}

function readSheet(sheetName, type) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];

  const range = sheet.getDataRange();
  if (!range) return [];

  const values = range.getDisplayValues();
  if (!values || values.length < 2) return [];

  const headers = values[0].map(function(header) {
    return clean(header);
  });

  const result = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (isEmptyRow(row)) continue;

    const item = mapRowByHeader(headers, row, type);

    // Jangan mengirim baris kosong/template seperti baris nomor 12-20.
    if (!hasPrimaryContent(item, type)) continue;

    result.push(item);
  }

  return result;
}

function mapRowByHeader(headers, row, type) {
  // Simpan juga nama kolom asli supaya frontend lama tetap kompatibel.
  const item = {};

  headers.forEach(function(header, index) {
    if (!header) return;
    item[header] = clean(row[index]);
  });

  if (type === "onProcess") {
    item.no = cell(row, 0);
    item.judul = cell(row, 1);
    item.judulKonten = cell(row, 1);
    item.bahan = cell(row, 2);
    item.tanggalBahanMentahDiterima = cell(row, 2);
    item.mulaiEdit = cell(row, 3);
    item.tanggalMulaiEdit = cell(row, 3);
    item.jadiKonten = cell(row, 4);
    item.tanggalJadiKonten = cell(row, 4);
    item.editor = cell(row, 5);
    item.uploadReview = cell(row, 6);
    item.tanggalUploadKeGrupReview = cell(row, 6);
    item.acc = cell(row, 7);
    item.tanggalAccKonten = cell(row, 7);
    item.status = cell(row, 8);
    item.keterangan = cell(row, 9);
  }

  if (type === "stock") {
    item.no = cell(row, 0);
    item.judul = cell(row, 1);
    item.judulKonten = cell(row, 1);
    item.selesaiEdit = cell(row, 2);
    item.tanggalSelesaiEdit = cell(row, 2);
    item.uploadReview = cell(row, 3);
    item.tanggalUploadKeGrupReview = cell(row, 3);
    item.acc = cell(row, 4);
    item.tanggalAccKonten = cell(row, 4);
    item.akun = cell(row, 5);
    item.akunTiktok = cell(row, 5);
    item.editor = cell(row, 6);
    item.jadwal = cell(row, 7);
    item.penjadwalanKontenUpload = cell(row, 7);
    item.keterangan = cell(row, 8);
    item.link = cell(row, 9);
    item.linkKonten = cell(row, 9);
  }

  if (type === "upload") {
    item.no = cell(row, 0);
    item.judul = cell(row, 1);
    item.judulKonten = cell(row, 1);
    item.selesaiEdit = cell(row, 2);
    item.tanggalSelesaiEdit = cell(row, 2);
    item.uploadReview = cell(row, 3);
    item.tanggalUploadKeGrupReview = cell(row, 3);
    item.acc = cell(row, 4);
    item.tanggalAccKonten = cell(row, 4);
    item.akun = cell(row, 5);
    item.akunTiktok = cell(row, 5);
    item.uploadTikTok = cell(row, 6);
    item.tanggalUploadTikTok = cell(row, 6);
    item.editor = cell(row, 7);
    item.jenisBooster = cell(row, 8);
    item.nominalBooster = cell(row, 9);
    item.asalDana = cell(row, 10);
    item.asalDanaBooster = cell(row, 10);
    item.nominalDompetSebelumBooster = cell(row, 11);
    item.nominalDompetSesudahBooster = cell(row, 12);
    item.viewsBefore = cell(row, 13);
    item.likesBefore = cell(row, 14);
    item.viewsAfter = cell(row, 15);
    item.likesAfter = cell(row, 16);
    item.link = cell(row, 17);
    item.linkKonten = cell(row, 17);
  }

  if (type === "boosterLive") {
    item.no = cell(row, 0);
    item.cabang = cell(row, 1);
    item.cabangYangDiBooster = cell(row, 1);
    item.tanggal = cell(row, 2);
    item.tanggalBooster = cell(row, 2);
    item.asalBiaya = cell(row, 3);
    item.asalBiayaBooster = cell(row, 3);
    item.budget = cell(row, 4);
    item.budgetBooster = cell(row, 4);
    item.host = cell(row, 5);
    item.hostLive = cell(row, 5);
  }

  return item;
}

function hasPrimaryContent(item, type) {
  if (type === "boosterLive") return !!clean(item.cabang);
  return !!clean(item.judul);
}

function isEmptyRow(row) {
  return !row || row.every(function(value) {
    return clean(value) === "";
  });
}

function cell(row, index) {
  return row && row[index] !== undefined ? clean(row[index]) : "";
}

function buildRow(sheetKey, data, sheet) {
  const n = getNextNumber(sheet);

  if (sheetKey === "onProcess" || sheetKey === "onprocess") {
    return [
      n,
      v(data, ["judulKonten", "judul"]),
      d(v(data, ["tanggalBahanMentahDiterima", "bahan"])),
      d(v(data, ["tanggalMulaiEdit", "mulaiEdit"])),
      d(v(data, ["tanggalJadiKonten", "jadiKonten"])),
      v(data, ["editor"]),
      d(v(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      d(v(data, ["tanggalAccKonten", "acc"])),
      v(data, ["status"]),
      v(data, ["keterangan"])
    ];
  }

  if (sheetKey === "stock") {
    return [
      n,
      v(data, ["judulKonten", "judul"]),
      d(v(data, ["tanggalSelesaiEdit", "selesaiEdit"])),
      d(v(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      d(v(data, ["tanggalAccKonten", "acc"])),
      v(data, ["akunTiktok", "akun"]),
      v(data, ["editor"]),
      d(v(data, ["penjadwalanKontenUpload", "jadwal"])),
      v(data, ["keterangan"]),
      v(data, ["linkKonten", "link"])
    ];
  }

  if (sheetKey === "upload") {
    return [
      n,
      v(data, ["judulKonten", "judul"]),
      d(v(data, ["tanggalSelesaiEdit", "selesaiEdit"])),
      d(v(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      d(v(data, ["tanggalAccKonten", "acc"])),
      v(data, ["akunTiktok", "akun"]),
      d(v(data, ["tanggalUploadTikTok", "uploadTikTok"])),
      v(data, ["editor"]),
      v(data, ["jenisBooster"]),
      v(data, ["nominalBooster"]),
      v(data, ["asalDanaBooster", "asalDana"]),
      v(data, ["nominalDompetSebelumBooster"]),
      v(data, ["nominalDompetSesudahBooster"]),
      v(data, ["viewsBefore"]),
      v(data, ["likesBefore"]),
      v(data, ["viewsAfter"]),
      v(data, ["likesAfter"]),
      v(data, ["linkKonten", "link"])
    ];
  }

  return [
    n,
    v(data, ["cabangYangDiBooster", "cabang"]),
    d(v(data, ["tanggalBooster", "tanggal"])),
    v(data, ["asalBiayaBooster", "asalBiaya"]),
    v(data, ["budgetBooster", "budget"]),
    v(data, ["hostLive", "host"])
  ];
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const exact = ss.getSheetByName(name);
  if (exact) return exact;

  const wanted = normalize(name);
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (normalize(sheets[i].getName()) === wanted) return sheets[i];
  }

  return null;
}

function sheetNameFromKey(key) {
  return ({
    onProcess: SHEETS.ON_PROCESS,
    onprocess: SHEETS.ON_PROCESS,
    stock: SHEETS.STOCK,
    upload: SHEETS.UPLOAD,
    boosterLive: SHEETS.BOOSTER,
    booster: SHEETS.BOOSTER
  })[key] || "";
}

function getNextNumber(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return 1;

  const values = sheet.getRange(2, 1, last - 1, 1).getDisplayValues();
  let max = 0;

  values.forEach(function(row) {
    const number = parseInt(String(row[0] || "").replace(/[^0-9]/g, ""), 10);
    if (!isNaN(number)) max = Math.max(max, number);
  });

  return max + 1;
}

function v(data, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== "") {
      return String(data[key]).trim();
    }
  }
  return "";
}

function d(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  // HTML date input: yyyy-mm-dd
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  // Indonesian/common sheet formats: dd/mm/yy, dd/mm/yyyy, dd-mm-yy, dd-mm-yyyy
  match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);
  if (match) {
    let year = Number(match[3]);
    if (year < 100) year += 2000;
    return new Date(year, Number(match[2]) - 1, Number(match[1]));
  }

  return text;
}

function resolveTikTok(url) {
  const original = String(url || "").trim();
  if (!original) return jsonOutput({ success: false, playerUrl: "" });

  try {
    const response = UrlFetchApp.fetch(original, {
      followRedirects: true,
      muteHttpExceptions: true,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const finalUrl = response.getHeaders()["Location"] || response.getFinalUrl?.() || original;
    const html = response.getContentText() || "";

    let videoId = extractTikTokVideoId(String(finalUrl));
    if (!videoId) videoId = extractTikTokVideoId(html);

    if (videoId) {
      return jsonOutput({
        success: true,
        videoId: videoId,
        playerUrl: "https://www.tiktok.com/player/v1/" + videoId + "?description=1&music_info=1&rel=0"
      });
    }
  } catch (error) {
    // Short-link resolver gagal: frontend tetap menyediakan tombol Buka di TikTok.
  }

  return jsonOutput({ success: false, playerUrl: "", originalUrl: original });
}

function extractTikTokVideoId(text) {
  const source = String(text || "");
  const patterns = [
    /tiktok\.com\/@[^/]+\/video\/(\d+)/i,
    /\/video\/(\d+)/i,
    /"videoId"\s*:\s*"?(\d+)"?/i,
    /"itemId"\s*:\s*"?(\d+)"?/i
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = source.match(patterns[i]);
    if (match) return match[1];
  }

  return "";
}

function clean(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function jsonOutput(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
