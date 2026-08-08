/*************************************************
 CBM SOCIAL REPORT API
 Google Apps Script Web App
 Spreadsheet: Tester Laporan Konten Medsos 1
**************************************************/

const SPREADSHEET_ID = "1WMRrSX8tD...";

const SHEETS = {
  ON_PROCESS: "Konten On Process",
  STOCK: "Stock konten",
  UPLOAD: "Konten Terupload",
  BOOSTER: "Booster live"
};

function doGet() {
  try {
    const result = {
      success: true,
      onProcess: readSheet(SHEETS.ON_PROCESS, "onprocess"),
      stock: readSheet(SHEETS.STOCK, "stock"),
      upload: readSheet(SHEETS.UPLOAD, "upload"),
      boosterLive: readSheet(SHEETS.BOOSTER, "booster"),
      data: {}
    };

    result.data = {
      onProcess: result.onProcess,
      stock: result.stock,
      upload: result.upload,
      boosterLive: result.boosterLive
    };

    return jsonOutput(result);
  } catch (error) {
    return jsonOutput({
      success: false,
      message: error.message,
      onProcess: [],
      stock: [],
      upload: [],
      boosterLive: [],
      data: {
        onProcess: [],
        stock: [],
        upload: [],
        boosterLive: []
      }
    });
  }
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};

    if (body.action !== "add") {
      return jsonOutput({ success: false, message: "Action tidak dikenali." });
    }

    const sheetKey = String(body.sheet || "").trim();
    const data = body.data || {};

    if (!sheetKey) {
      return jsonOutput({ success: false, message: "Sheet belum ditentukan." });
    }

    const sheetName = sheetNameFromKey(sheetKey);
    if (!sheetName) {
      return jsonOutput({ success: false, message: "Nama sheet tidak dikenali." });
    }

    const sheet = getSheet(sheetName);
    const row = buildRow(sheetKey, data, sheet);

    if (!row.some(v => String(v ?? "").trim() !== "")) {
      return jsonOutput({ success: false, message: "Tidak ada data yang dikirim." });
    }

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
      message: error.message
    });
  }
}

function readSheet(sheetName, type) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getDisplayValues();
  if (!values || values.length <= 1) return [];

  const rows = values.slice(1);

  return rows
    .filter(row => hasRealData(row, type))
    .map(row => mapRow(row, type));
}

function hasRealData(row, type) {
  if (!row || !row.length) return false;

  // Ignore completely empty rows and placeholder rows without a title/cabang.
  const firstContent = String(row[1] || "").trim();

  if (type === "booster") {
    return String(row[1] || "").trim() !== "";
  }

  return firstContent !== "";
}

function mapRow(row, type) {
  if (type === "onprocess") {
    return {
      no: clean(row[0]),
      judul: clean(row[1]),
      judulKonten: clean(row[1]),
      bahan: clean(row[2]),
      tanggalBahanMentahDiterima: clean(row[2]),
      mulaiEdit: clean(row[3]),
      tanggalMulaiEdit: clean(row[3]),
      jadiKonten: clean(row[4]),
      tanggalJadiKonten: clean(row[4]),
      editor: clean(row[5]),
      uploadReview: clean(row[6]),
      tanggalUploadKeGrupReview: clean(row[6]),
      acc: clean(row[7]),
      tanggalAccKonten: clean(row[7]),
      status: clean(row[8]),
      keterangan: clean(row[9])
    };
  }

  if (type === "stock") {
    return {
      no: clean(row[0]),
      judul: clean(row[1]),
      judulKonten: clean(row[1]),
      selesaiEdit: clean(row[2]),
      tanggalSelesaiEdit: clean(row[2]),
      uploadReview: clean(row[3]),
      tanggalUploadKeGrupReview: clean(row[3]),
      acc: clean(row[4]),
      tanggalAccKonten: clean(row[4]),
      akun: clean(row[5]),
      akunTiktok: clean(row[5]),
      editor: clean(row[6]),
      jadwal: clean(row[7]),
      penjadwalanKontenUpload: clean(row[7]),
      keterangan: clean(row[8]),
      link: clean(row[9]),
      linkKonten: clean(row[9])
    };
  }

  if (type === "upload") {
    return {
      no: clean(row[0]),
      judul: clean(row[1]),
      judulKonten: clean(row[1]),
      selesaiEdit: clean(row[2]),
      tanggalSelesaiEdit: clean(row[2]),
      uploadReview: clean(row[3]),
      tanggalUploadKeGrupReview: clean(row[3]),
      acc: clean(row[4]),
      tanggalAccKonten: clean(row[4]),
      akun: clean(row[5]),
      akunTiktok: clean(row[5]),
      uploadTikTok: clean(row[6]),
      tanggalUploadTikTok: clean(row[6]),
      editor: clean(row[7]),
      jenisBooster: clean(row[8]),
      nominalBooster: clean(row[9]),
      asalDana: clean(row[10]),
      asalDanaBooster: clean(row[10]),
      nominalDompetSebelumBooster: clean(row[11]),
      nominalDompetSesudahBooster: clean(row[12]),
      viewsBefore: clean(row[13]),
      likesBefore: clean(row[14]),
      viewsAfter: clean(row[15]),
      likesAfter: clean(row[16]),
      link: clean(row[17]),
      linkKonten: clean(row[17])
    };
  }

  return {
    no: clean(row[0]),
    cabang: clean(row[1]),
    cabangYangDiBooster: clean(row[1]),
    tanggal: clean(row[2]),
    tanggalBooster: clean(row[2]),
    asalBiaya: clean(row[3]),
    asalBiayaBooster: clean(row[3]),
    budget: clean(row[4]),
    budgetBooster: clean(row[4]),
    host: clean(row[5]),
    hostLive: clean(row[5])
  };
}

function buildRow(sheetKey, data, sheet) {
  const nextNo = getNextNumber(sheet);

  if (sheetKey === "onProcess") {
    return [
      nextNo,
      valueFrom(data, ["judulKonten", "judul"]),
      dateValue(valueFrom(data, ["tanggalBahanMentahDiterima", "bahan"])),
      dateValue(valueFrom(data, ["tanggalMulaiEdit", "mulaiEdit"])),
      dateValue(valueFrom(data, ["tanggalJadiKonten", "jadiKonten"])),
      valueFrom(data, ["editor"]),
      dateValue(valueFrom(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      dateValue(valueFrom(data, ["tanggalAccKonten", "acc"])),
      valueFrom(data, ["status"]),
      valueFrom(data, ["keterangan"])
    ];
  }

  if (sheetKey === "stock") {
    return [
      nextNo,
      valueFrom(data, ["judulKonten", "judul"]),
      dateValue(valueFrom(data, ["tanggalSelesaiEdit", "selesaiEdit"])),
      dateValue(valueFrom(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      dateValue(valueFrom(data, ["tanggalAccKonten", "acc"])),
      valueFrom(data, ["akunTiktok", "akun"]),
      valueFrom(data, ["editor"]),
      dateValue(valueFrom(data, ["penjadwalanKontenUpload", "jadwal"])),
      valueFrom(data, ["keterangan"]),
      valueFrom(data, ["linkKonten", "link"])
    ];
  }

  if (sheetKey === "upload") {
    return [
      nextNo,
      valueFrom(data, ["judulKonten", "judul"]),
      dateValue(valueFrom(data, ["tanggalSelesaiEdit", "selesaiEdit"])),
      dateValue(valueFrom(data, ["tanggalUploadKeGrupReview", "uploadReview"])),
      dateValue(valueFrom(data, ["tanggalAccKonten", "acc"])),
      valueFrom(data, ["akunTiktok", "akun"]),
      dateValue(valueFrom(data, ["tanggalUploadTikTok", "uploadTikTok"])),
      valueFrom(data, ["editor"]),
      valueFrom(data, ["jenisBooster"]),
      valueFrom(data, ["nominalBooster"]),
      valueFrom(data, ["asalDanaBooster", "asalDana"]),
      valueFrom(data, ["nominalDompetSebelumBooster"]),
      valueFrom(data, ["nominalDompetSesudahBooster"]),
      valueFrom(data, ["viewsBefore"]),
      valueFrom(data, ["likesBefore"]),
      valueFrom(data, ["viewsAfter"]),
      valueFrom(data, ["likesAfter"]),
      valueFrom(data, ["linkKonten", "link"])
    ];
  }

  return [
    nextNo,
    valueFrom(data, ["cabangYangDiBooster", "cabang"]),
    dateValue(valueFrom(data, ["tanggalBooster", "tanggal"])),
    valueFrom(data, ["asalBiayaBooster", "asalBiaya"]),
    valueFrom(data, ["budgetBooster", "budget"]),
    valueFrom(data, ["hostLive", "host"])
  ];
}

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const exact = ss.getSheetByName(sheetName);
  if (exact) return exact;

  const wanted = normalize(sheetName);
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (normalize(sheets[i].getName()) === wanted) return sheets[i];
  }

  throw new Error("Sheet tidak ditemukan: " + sheetName);
}

function sheetNameFromKey(key) {
  const map = {
    onProcess: SHEETS.ON_PROCESS,
    onprocess: SHEETS.ON_PROCESS,
    stock: SHEETS.STOCK,
    upload: SHEETS.UPLOAD,
    boosterLive: SHEETS.BOOSTER,
    booster: SHEETS.BOOSTER
  };
  return map[key] || "";
}

function getNextNumber(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  let max = 0;

  values.forEach(row => {
    const number = parseInt(String(row[0]).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(number)) max = Math.max(max, number);
  });

  return max + 1;
}

function valueFrom(data, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== "") {
      return String(data[key]).trim();
    }
  }
  return "";
}

function dateValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  // HTML date input sends yyyy-mm-dd.
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  return text;
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
