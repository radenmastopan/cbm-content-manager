/*************************************************
 CBM SOCIAL REPORT API
 Google Apps Script Web App
 Spreadsheet: Tester Laporan Konten Medsos 1
**************************************************/

const SPREADSHEET_ID = "1WMRrSXnDfzDuImVhuWjofopVRz8Xt34VEHGXymPFAjY";

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
      boosterLive: readSheet(SHEETS.BOOSTER, "booster")
    };
    result.data = result;
    return jsonOutput(result);
  } catch (error) {
    return jsonOutput({ success:false, message:error.message, onProcess:[], stock:[], upload:[], boosterLive:[], data:{onProcess:[],stock:[],upload:[],boosterLive:[]} });
  }
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (body.action !== "add") return jsonOutput({success:false,message:"Action tidak dikenali."});

    const sheetKey = String(body.sheet || "").trim();
    const sheetName = sheetNameFromKey(sheetKey);
    if (!sheetName) return jsonOutput({success:false,message:"Nama sheet tidak dikenali."});

    const sheet = getSheet(sheetName);
    const row = buildRow(sheetKey, body.data || {}, sheet);
    sheet.appendRow(row);

    return jsonOutput({success:true,message:"Data berhasil ditambahkan.",sheet:sheetName,rowNumber:sheet.getLastRow()});
  } catch (error) {
    return jsonOutput({success:false,message:error.message});
  }
}

function readSheet(sheetName, type) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return [];
  return values.slice(1).filter(row => hasRealData(row, type)).map(row => mapRow(row, type));
}

function hasRealData(row, type) {
  if (!row || !row.length) return false;
  return String(row[1] || "").trim() !== "";
}

function mapRow(row, type) {
  if (type === "onprocess") return {
    no:clean(row[0]), judul:clean(row[1]), judulKonten:clean(row[1]),
    bahan:clean(row[2]), tanggalBahanMentahDiterima:clean(row[2]),
    mulaiEdit:clean(row[3]), tanggalMulaiEdit:clean(row[3]),
    jadiKonten:clean(row[4]), tanggalJadiKonten:clean(row[4]), editor:clean(row[5]),
    uploadReview:clean(row[6]), tanggalUploadKeGrupReview:clean(row[6]),
    acc:clean(row[7]), tanggalAccKonten:clean(row[7]), status:clean(row[8]), keterangan:clean(row[9])
  };

  if (type === "stock") return {
    no:clean(row[0]), judul:clean(row[1]), judulKonten:clean(row[1]),
    selesaiEdit:clean(row[2]), tanggalSelesaiEdit:clean(row[2]),
    uploadReview:clean(row[3]), tanggalUploadKeGrupReview:clean(row[3]),
    acc:clean(row[4]), tanggalAccKonten:clean(row[4]), akun:clean(row[5]), akunTiktok:clean(row[5]),
    editor:clean(row[6]), jadwal:clean(row[7]), penjadwalanKontenUpload:clean(row[7]),
    keterangan:clean(row[8]), link:clean(row[9]), linkKonten:clean(row[9])
  };

  if (type === "upload") return {
    no:clean(row[0]), judul:clean(row[1]), judulKonten:clean(row[1]),
    selesaiEdit:clean(row[2]), tanggalSelesaiEdit:clean(row[2]),
    uploadReview:clean(row[3]), tanggalUploadKeGrupReview:clean(row[3]),
    acc:clean(row[4]), tanggalAccKonten:clean(row[4]), akun:clean(row[5]), akunTiktok:clean(row[5]),
    uploadTikTok:clean(row[6]), tanggalUploadTikTok:clean(row[6]), editor:clean(row[7]),
    jenisBooster:clean(row[8]), nominalBooster:clean(row[9]), asalDana:clean(row[10]), asalDanaBooster:clean(row[10]),
    nominalDompetSebelumBooster:clean(row[11]), nominalDompetSesudahBooster:clean(row[12]),
    viewsBefore:clean(row[13]), likesBefore:clean(row[14]), viewsAfter:clean(row[15]), likesAfter:clean(row[16]),
    link:clean(row[17]), linkKonten:clean(row[17])
  };

  return {
    no:clean(row[0]), cabang:clean(row[1]), cabangYangDiBooster:clean(row[1]),
    tanggal:clean(row[2]), tanggalBooster:clean(row[2]), asalBiaya:clean(row[3]), asalBiayaBooster:clean(row[3]),
    budget:clean(row[4]), budgetBooster:clean(row[4]), host:clean(row[5]), hostLive:clean(row[5])
  };
}

function buildRow(sheetKey, data, sheet) {
  const n = getNextNumber(sheet);
  if (sheetKey === "onProcess") return [n,v(data,["judulKonten","judul"]),d(v(data,["tanggalBahanMentahDiterima","bahan"])),d(v(data,["tanggalMulaiEdit","mulaiEdit"])),d(v(data,["tanggalJadiKonten","jadiKonten"])),v(data,["editor"]),d(v(data,["tanggalUploadKeGrupReview","uploadReview"])),d(v(data,["tanggalAccKonten","acc"])),v(data,["status"]),v(data,["keterangan"]),];
  if (sheetKey === "stock") return [n,v(data,["judulKonten","judul"]),d(v(data,["tanggalSelesaiEdit","selesaiEdit"])),d(v(data,["tanggalUploadKeGrupReview","uploadReview"])),d(v(data,["tanggalAccKonten","acc"])),v(data,["akunTiktok","akun"]),v(data,["editor"]),d(v(data,["penjadwalanKontenUpload","jadwal"])),v(data,["keterangan"]),v(data,["linkKonten","link"])];
  if (sheetKey === "upload") return [n,v(data,["judulKonten","judul"]),d(v(data,["tanggalSelesaiEdit","selesaiEdit"])),d(v(data,["tanggalUploadKeGrupReview","uploadReview"])),d(v(data,["tanggalAccKonten","acc"])),v(data,["akunTiktok","akun"]),d(v(data,["tanggalUploadTikTok","uploadTikTok"])),v(data,["editor"]),v(data,["jenisBooster"]),v(data,["nominalBooster"]),v(data,["asalDanaBooster","asalDana"]),v(data,["nominalDompetSebelumBooster"]),v(data,["nominalDompetSesudahBooster"]),v(data,["viewsBefore"]),v(data,["likesBefore"]),v(data,["viewsAfter"]),v(data,["likesAfter"]),v(data,["linkKonten","link"])];
  return [n,v(data,["cabangYangDiBooster","cabang"]),d(v(data,["tanggalBooster","tanggal"])),v(data,["asalBiayaBooster","asalBiaya"]),v(data,["budgetBooster","budget"]),v(data,["hostLive","host"])];
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const exact = ss.getSheetByName(name);
  if (exact) return exact;
  const wanted = normalize(name);
  return ss.getSheets().find(s => normalize(s.getName()) === wanted) || null;
}

function sheetNameFromKey(key) {
  return ({onProcess:SHEETS.ON_PROCESS,onprocess:SHEETS.ON_PROCESS,stock:SHEETS.STOCK,upload:SHEETS.UPLOAD,boosterLive:SHEETS.BOOSTER,booster:SHEETS.BOOSTER})[key] || "";
}

function getNextNumber(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return 1;
  const values = sheet.getRange(2,1,last-1,1).getDisplayValues();
  return values.reduce((max,r) => { const n=parseInt(String(r[0]).replace(/[^0-9]/g,""),10); return isNaN(n)?max:Math.max(max,n); },0)+1;
}

function v(data, keys) {
  for (const key of keys) if (data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== "") return String(data[key]).trim();
  return "";
}

function d(value) {
  const text=String(value||"").trim();
  const m=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]),Number(m[2])-1,Number(m[3])) : text;
}

function clean(value) { return value===null || value===undefined ? "" : String(value).trim(); }
function normalize(value) { return String(value||"").toLowerCase().replace(/[^a-z0-9]/g,""); }
function jsonOutput(object) { return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON); }
