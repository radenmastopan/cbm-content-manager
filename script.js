const API_URL = "https://script.google.com/macros/s/AKfycbxO0mk7oMI9hF__zieQyVV5icjJ6IxtcUyD2881tQe0_Q4VQvbQltKyFvlziPvyiTHilg/exec";

let appData = { onProcess: [], stock: [], upload: [], boosterLive: [] };
let currentPage = "home";
let searchTerm = "";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

window.addEventListener("DOMContentLoaded", init);

async function init() {
    bindNavigation();
    bindSearch();
    bindFab();
    await loadData();
}

async function loadData() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}?t=${Date.now()}`, { method: "GET", cache: "no-store", redirect: "follow" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const raw = await response.json();
        const data = raw && raw.data && typeof raw.data === "object" ? raw.data : raw;

        appData = {
            onProcess: pickArray(data, ["onProcess", "onprocess", "kontenOnProcess", "kontenOnprocess"]),
            stock: pickArray(data, ["stock", "stockKonten"]),
            upload: pickArray(data, ["upload", "kontenTerupload", "terupload"]),
            boosterLive: pickArray(data, ["boosterLive", "boosterlive", "booster", "liveBooster"])
        };

        console.log("CBM Social Report API:", {
            onProcess: appData.onProcess.length,
            stock: appData.stock.length,
            upload: appData.upload.length,
            boosterLive: appData.boosterLive.length
        });
        renderPage(currentPage);
    } catch (error) {
        console.error("CBM API error:", error);
        renderError("Gagal mengambil data Google Sheets. Periksa deployment Apps Script dan akses Web App.");
        showToast("Gagal mengambil data");
    } finally {
        showLoading(false);
    }
}

function pickArray(data, keys) {
    for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
    return [];
}

function bindNavigation() {
    $$('[data-page]').forEach(button => button.addEventListener("click", () => {
        currentPage = button.dataset.page || "home";
        setActiveNavigation();
        renderPage(currentPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }));
}

function setActiveNavigation() {
    $$('.menu-item, .bottom-item').forEach(button => button.classList.toggle("active", button.dataset.page === currentPage));
}

function bindSearch() {
    const input = $("#searchInput");
    if (!input) return;
    input.addEventListener("input", event => {
        searchTerm = event.target.value.trim().toLowerCase();
        renderPage(currentPage);
    });
}

function bindFab() {
    const fab = $("#fab");
    if (fab) fab.addEventListener("click", openAddModal);
}

function renderPage(page) {
    const title = $("#pageTitle"), grid = $("#dashboardGrid"), content = $("#contentArea");
    if (!title || !grid || !content) return;
    const titles = { home: "Dashboard", onprocess: "On Process", stock: "Stock Konten", upload: "Konten Terupload", booster: "Booster Live" };
    title.textContent = titles[page] || "Dashboard";
    grid.innerHTML = "";
    content.innerHTML = "";
    if (page === "home") return renderHome();
    const source = page === "onprocess" ? appData.onProcess : page === "stock" ? appData.stock : page === "upload" ? appData.upload : appData.boosterLive;
    renderSection(source, page);
}

function renderHome() {
    const grid = $("#dashboardGrid"), content = $("#contentArea");
    const stats = [["On Process", appData.onProcess.length, "fa-pen-to-square", "onprocess"], ["Stock", appData.stock.length, "fa-box", "stock"], ["Upload", appData.upload.length, "fa-film", "upload"], ["Booster Live", appData.boosterLive.length, "fa-rocket", "booster"]];
    grid.innerHTML = stats.map(([label, number, icon, page]) => `<button class="card stat-card ripple" data-page="${page}" type="button"><div class="card-header"><h3>${escapeHtml(label)}</h3><span><i class="fa-solid ${icon}"></i></span></div><div class="card-body"><strong class="stat-number">${number}</strong></div></button>`).join("");
    $$("#dashboardGrid [data-page]").forEach(button => button.addEventListener("click", () => { currentPage = button.dataset.page; setActiveNavigation(); renderPage(currentPage); }));

    const latest = filterData(appData.upload).slice(-6).reverse();
    content.innerHTML = `<div class="section-heading"><div><h2>Konten Terbaru</h2><p>${latest.length} konten terakhir</p></div></div><div class="card-grid">${latest.length ? latest.map(createUploadCard).join("") : emptyState("Belum ada data upload.")}</div>`;
    bindPreviewButtons(content);
}

function renderSection(data, type) {
    const filtered = filterData(data), content = $("#contentArea");
    content.innerHTML = `<div class="section-heading"><div><h2>${escapeHtml(sectionName(type))}</h2><p>${filtered.length} data</p></div></div><div class="card-grid">${filtered.length ? filtered.map(item => createCard(item, type)).join("") : emptyState(type === "onprocess" ? "Data On Process belum diterima dari API Google Sheets." : "Tidak ada data yang ditemukan.")}</div>`;
    bindPreviewButtons(content);
}

function createCard(item, type) {
    if (type === "onprocess") return createOnProcessCard(item);
    if (type === "stock") return createStockCard(item);
    if (type === "upload") return createUploadCard(item);
    return createBoosterCard(item);
}

function createOnProcessCard(item) {
    return cardTemplate(value(item, "judul", "onprocess"), `${field("Editor", value(item, "editor", "onprocess"))}${field("Bahan mentah diterima", value(item, "bahan", "onprocess"))}${field("Mulai edit", value(item, "mulaiEdit", "onprocess"))}${field("Konten jadi", value(item, "jadiKonten", "onprocess"))}${field("Upload grup review", value(item, "uploadReview", "onprocess"))}${field("Tanggal ACC", value(item, "acc", "onprocess"))}${field("Status", value(item, "status", "onprocess"))}${field("Keterangan", value(item, "keterangan", "onprocess"))}`);
}

function createStockCard(item) {
    return cardTemplate(value(item, "judul", "stock"), `${field("Akun TikTok", value(item, "akun", "stock"))}${field("Editor", value(item, "editor", "stock"))}${field("Selesai edit", value(item, "selesaiEdit", "stock"))}${field("Upload grup review", value(item, "uploadReview", "stock"))}${field("Tanggal ACC", value(item, "acc", "stock"))}${field("Penjadwalan", value(item, "jadwal", "stock"))}${field("Keterangan", value(item, "keterangan", "stock"))}${linkHtml(value(item, "link", "stock"))}`);
}

function createUploadCard(item) {
    const vb = value(item, "viewsBefore", "upload"), va = value(item, "viewsAfter", "upload"), lb = value(item, "likesBefore", "upload"), la = value(item, "likesAfter", "upload");
    const booster = value(item, "jenisBooster", "upload") || "Tanpa Booster";
    const url = value(item, "link", "upload");
    return cardTemplate(value(item, "judul", "upload"), `${field("Akun TikTok", value(item, "akun", "upload"))}${field("Editor", value(item, "editor", "upload"))}${field("Tanggal Upload TikTok", value(item, "uploadTikTok", "upload"))}${field("Tanggal ACC", value(item, "acc", "upload"))}${field("Booster", booster)}${field("Nominal Booster", value(item, "nominalBooster", "upload"))}${field("Asal Dana", value(item, "asalDana", "upload"))}${metricHtml("Views", vb, va)}${metricHtml("Likes", lb, la)}${reviewHtml(url)}`);
}

function createBoosterCard(item) {
    return cardTemplate(value(item, "cabang", "booster") || "Booster Live", `${field("Tanggal Booster", value(item, "tanggal", "booster"))}${field("Asal biaya", value(item, "asalBiaya", "booster"))}${field("Budget", value(item, "budget", "booster"))}${field("Host Live", value(item, "host", "booster"))}`);
}

function cardTemplate(title, body) {
    return `<article class="card ripple"><div class="card-header"><h3>${escapeHtml(title || "Tanpa Judul")}</h3><span><i class="fa-solid fa-chart-simple"></i></span></div><div class="card-body">${body}</div></article>`;
}
function field(label, val) { return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(val || "-")}</p>`; }
function metricHtml(label, before, after) { if (!before && !after) return ""; return `<div class="metric-row"><span class="metric-label">${escapeHtml(label)}</span><span class="metric-values">${escapeHtml(before || "-")} → ${escapeHtml(after || "-")}</span></div>`; }
function reviewHtml(url) { return url && /^https?:\/\//i.test(url) ? `<p><button type="button" class="preview-button" data-preview-url="${escapeAttribute(url)}"><i class="fa-brands fa-tiktok"></i> Review Konten</button></p>` : ""; }

function value(item, type, sheet) {
    const aliases = {
        judul: ["judulkonten", "judul", "namakonten", "title", "namajudul"], editor: ["editor"], akun: ["akuntiktok", "akun"], bahan: ["tanggalbahanmentahditerima", "bahanmentahditerima", "tanggalbahan"], mulaiEdit: ["tanggalmulaiedit", "mulaiedit"], jadiKonten: ["tanggaljadikonten", "jadikonten"], uploadReview: ["tanggaluploadkegrupreview", "uploadkegrupreview", "tanggaluploadreview"], acc: ["tanggalacckonten", "tanggalacc", "acc"], status: ["status"], keterangan: ["keterangan", "keterengan", "catatan"], selesaiEdit: ["tanggalselesaiedit", "tanggalselesai"], jadwal: ["penjadwalankontenupload", "penjadwalan", "jadwal"], link: ["linkkonten", "link", "url"], uploadTikTok: ["tanggaluploadtiktok", "tanggalupload", "uploadtiktok"], jenisBooster: ["jenisbooster", "booster"], nominalBooster: ["nominalbooster"], asalDana: ["asaldanabooster", "asaldana"], viewsBefore: ["viewsbefore", "viewbefore", "jumlahviewlikesebelumbooster", "jumlahviewlikesebelumboosterview"], likesBefore: ["likesbefore", "likebefore", "jumlahviewlikesebelumboosterlike"], viewsAfter: ["viewsafter", "viewafter", "jumlahviewlikesetelahbooster", "jumlahviewlikesetelahboosterview"], likesAfter: ["likesafter", "likeafter", "jumlahviewlikesetelahboosterlike"], cabang: ["cabangyangdibooster", "cabang"], tanggal: ["tanggalbooster", "tanggal"], asalBiaya: ["asalbiayabooster", "asalbiaya"], budget: ["budgetbooster", "budget"], host: ["hostlive", "host"]
    };
    const wanted = (aliases[type] || [type]).map(normalizeKey);

    if (Array.isArray(item)) {
        const index = indexFor(sheet, type);
        return index >= 0 ? cleanValue(item[index]) : "";
    }
    if (!item || typeof item !== "object") return "";

    const entries = Object.entries(item).filter(([, raw]) => raw !== null && raw !== undefined && String(raw).trim() !== "");
    for (const [key, raw] of entries) {
        const normalized = normalizeKey(key);
        if (wanted.includes(normalized)) return cleanValue(raw);
    }
    for (const [key, raw] of entries) {
        const normalized = normalizeKey(key);
        if (wanted.some(alias => normalized.includes(alias) || alias.includes(normalized))) return cleanValue(raw);
    }

    const semantic = {
        judul: /judul|title|nama.?konten/i, akun: /akun.*tiktok|akun/i, editor: /^editor$/i, link: /link|url/i,
        uploadTikTok: /tanggal.*upload.*tiktok|upload.*tiktok/i, jenisBooster: /jenis.*booster|booster/i,
        nominalBooster: /nominal.*booster/i, asalDana: /asal.*dana/i, viewsBefore: /view.*sebelum/i,
        likesBefore: /like.*sebelum/i, viewsAfter: /view.*setelah/i, likesAfter: /like.*setelah/i,
        keterangan: /keter|catatan/i, status: /status/i
    };
    if (semantic[type]) {
        for (const [key, raw] of entries) if (semantic[type].test(String(key))) return cleanValue(raw);
    }

    const positional = Object.keys(item).sort((a, b) => numericKey(a) - numericKey(b)).map(key => item[key]);
    const index = indexFor(sheet, type);
    if (index >= 0 && positional[index] !== undefined) return cleanValue(positional[index]);
    return "";
}

function cleanValue(value) { return value === null || value === undefined ? "" : String(value).trim(); }
function numericKey(key) { return /^\d+$/.test(key) ? Number(key) : 999999; }
function indexFor(sheet, type) {
    const maps = {
        onprocess: { judul: 1, bahan: 2, mulaiEdit: 3, jadiKonten: 4, editor: 5, uploadReview: 6, acc: 7, status: 8, keterangan: 9 },
        stock: { judul: 1, selesaiEdit: 2, uploadReview: 3, acc: 4, akun: 5, editor: 6, jadwal: 7, keterangan: 8, link: 9 },
        upload: { judul: 1, selesaiEdit: 2, uploadReview: 3, acc: 4, akun: 5, uploadTikTok: 6, editor: 7, jenisBooster: 8, nominalBooster: 9, asalDana: 10, viewsBefore: 13, likesBefore: 14, viewsAfter: 15, likesAfter: 16, link: 17 },
        booster: { cabang: 1, tanggal: 2, asalBiaya: 3, budget: 4, host: 5 }
    };
    return maps[sheet]?.[type] ?? -1;
}
function normalizeKey(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function linkHtml(url) { return url && /^https?:\/\//i.test(url) ? `<p><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>` : ""; }
function filterData(data) { if (!searchTerm) return data; return data.filter(item => Object.values(item || {}).some(value => String(value ?? "").toLowerCase().includes(searchTerm))); }
function sectionName(type) { return { onprocess: "Konten On Process", stock: "Stock Konten", upload: "Konten Terupload", booster: "Booster Live" }[type] || "Dashboard"; }
function emptyState(message) { return `<div class="card empty-state"><h3>${escapeHtml(message)}</h3></div>`; }
function renderError(message) { const grid = $("#dashboardGrid"), content = $("#contentArea"); if (grid) grid.innerHTML = ""; if (content) content.innerHTML = emptyState(message); }
function showLoading(show) { const element = $("#loading"); if (element) element.classList.toggle("show", show); }
function showToast(message) { const element = $("#toast"); if (!element) return; element.textContent = message; element.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => element.classList.remove("show"), 3200); }

function bindPreviewButtons(root) { root.querySelectorAll("[data-preview-url]").forEach(button => button.addEventListener("click", () => openTikTokPreview(button.dataset.previewUrl))); }

async function openTikTokPreview(url) {
    const modal = getPreviewModal();
    const frame = modal.querySelector(".cbm-preview-frame"), fallback = modal.querySelector(".cbm-preview-fallback");
    frame.style.display = "none";
    fallback.style.display = "flex";
    fallback.innerHTML = `<i class="fa-brands fa-tiktok" style="font-size:42px"></i><strong>Menyiapkan preview TikTok...</strong><span style="color:#64748b;font-size:13px">Memuat konten dari link TikTok.</span>`;
    modal.classList.add("show");

    let playerUrl = extractTikTokPlayerUrl(url);
    if (!playerUrl) {
        try {
            const response = await fetch(`${API_URL}?action=resolveTikTok&url=${encodeURIComponent(url)}&t=${Date.now()}`, { cache: "no-store" });
            const result = await response.json();
            if (result && result.playerUrl) playerUrl = result.playerUrl;
        } catch (error) { console.warn("TikTok preview resolver unavailable:", error); }
    }

    if (playerUrl) {
        frame.src = playerUrl;
        frame.style.display = "block";
        fallback.style.display = "none";
    } else {
        fallback.innerHTML = `<i class="fa-brands fa-tiktok" style="font-size:42px"></i><strong>Preview TikTok belum tersedia</strong><span style="color:#64748b;font-size:13px">Link ini adalah short link TikTok. Setelah Apps Script versi terbaru dipasang, preview akan tampil langsung di sini.</span><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka di TikTok</a>`;
    }
}

function extractTikTokPlayerUrl(url) {
    const match = String(url || "").match(/\/video\/(\d+)/i);
    return match ? `https://www.tiktok.com/player/v1/${match[1]}?description=1&music_info=1&rel=0` : "";
}

function getPreviewModal() {
    let modal = $("#cbmPreviewModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "cbmPreviewModal";
    modal.className = "cbm-preview";
    modal.innerHTML = `<div class="cbm-preview-backdrop"></div><div class="cbm-preview-box" role="dialog" aria-modal="true" aria-label="TikTok Preview"><div class="cbm-preview-head"><strong><i class="fa-brands fa-tiktok"></i> TikTok Preview</strong><button type="button" class="cbm-preview-close" aria-label="Tutup">×</button></div><iframe class="cbm-preview-frame" title="TikTok Preview" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe><div class="cbm-preview-fallback"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector(".cbm-preview-close").addEventListener("click", closePreviewModal);
    modal.querySelector(".cbm-preview-backdrop").addEventListener("click", closePreviewModal);
    return modal;
}
function closePreviewModal() { const modal = $("#cbmPreviewModal"); if (!modal) return; modal.classList.remove("show"); const frame = modal.querySelector(".cbm-preview-frame"); setTimeout(() => { frame.src = "about:blank"; }, 200); }

function openAddModal() {
    if ($("#cbmAddModal")) { $("#cbmAddModal").classList.add("show"); return; }
    const page = currentPage === "home" ? "upload" : currentPage;
    const sheet = page === "onprocess" ? "onProcess" : page === "stock" ? "stock" : page === "upload" ? "upload" : "boosterLive";
    const modal = document.createElement("div");
    modal.id = "cbmAddModal";
    modal.innerHTML = `<div class="cbm-modal-backdrop"></div><div class="cbm-modal" role="dialog" aria-modal="true"><div class="cbm-modal-head"><div><h2>Tambah Data</h2><p>${escapeHtml(sectionName(page))}</p></div><button type="button" class="cbm-close" id="cbmCloseModal">×</button></div><form id="cbmAddForm" class="cbm-form"><input type="hidden" name="sheet" value="${sheet}">${addFieldsForPage(sheet)}<button class="cbm-submit" type="submit"><i class="fa-solid fa-plus"></i> Tambahkan</button></form></div>`;
    document.body.appendChild(modal);
    addModalStyles();
    $("#cbmCloseModal").addEventListener("click", closeAddModal);
    modal.querySelector(".cbm-modal-backdrop").addEventListener("click", closeAddModal);
    $("#cbmAddForm").addEventListener("submit", submitAddForm);
    requestAnimationFrame(() => modal.classList.add("show"));
}

function addFieldsForPage(page) {
    if (page === "onProcess") return inputField("Judul Konten", "judulKonten", true) + inputField("Editor", "editor") + inputField("Tanggal Bahan Mentah diterima", "tanggalBahanMentahDiterima", false, "date") + inputField("Tanggal Mulai Edit", "tanggalMulaiEdit", false, "date") + inputField("Tanggal Jadi Konten", "tanggalJadiKonten", false, "date") + inputField("Tanggal Upload ke Grup Review", "tanggalUploadKeGrupReview", false, "date") + inputField("Tanggal ACC", "tanggalAccKonten", false, "date") + inputField("Status", "status") + inputField("Keterangan", "keterangan");
    if (page === "stock") return inputField("Judul Konten", "judulKonten", true) + inputField("Akun TikTok", "akunTiktok") + inputField("Editor", "editor") + inputField("Tanggal Selesai Edit", "tanggalSelesaiEdit", false, "date") + inputField("Tanggal Upload ke Grup Review", "tanggalUploadKeGrupReview", false, "date") + inputField("Tanggal ACC Konten", "tanggalAccKonten", false, "date") + inputField("Penjadwalan Konten Upload", "penjadwalanKontenUpload", false, "date") + inputField("Keterangan", "keterangan") + inputField("Link Konten", "linkKonten");
    if (page === "boosterLive") return inputField("Cabang yang di Booster", "cabangYangDiBooster", true) + inputField("Tanggal Booster", "tanggalBooster", false, "date") + inputField("Asal Biaya Booster", "asalBiayaBooster") + inputField("Budget Booster", "budgetBooster") + inputField("Host Live", "hostLive");
    return inputField("Judul Konten", "judulKonten", true) + inputField("Akun TikTok", "akunTiktok") + inputField("Tanggal Upload TikTok", "tanggalUploadTikTok", false, "date") + inputField("Editor", "editor") + inputField("Jenis Booster", "jenisBooster") + inputField("Nominal Booster", "nominalBooster") + inputField("Asal Dana Booster", "asalDanaBooster") + inputField("Views Sebelum Booster", "viewsBefore") + inputField("Likes Sebelum Booster", "likesBefore") + inputField("Views Setelah Booster", "viewsAfter") + inputField("Likes Setelah Booster", "likesAfter") + inputField("Link Konten", "linkKonten");
}
function inputField(label, name, required = false, type = "text") { return `<label class="cbm-field"><span>${escapeHtml(label)}${required ? " *" : ""}</span><input name="${escapeAttribute(name)}" type="${type}" ${required ? "required" : ""}></label>`; }

async function submitAddForm(event) {
    event.preventDefault();
    const form = event.currentTarget, button = form.querySelector("button[type=submit]"), formData = new FormData(form), payload = { action: "add", sheet: formData.get("sheet"), data: {} };
    formData.forEach((value, key) => { if (key !== "sheet" && String(value).trim() !== "") payload.data[key] = String(value).trim(); });
    button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    try {
        const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
        const text = await response.text(); let result = {};
        try { result = JSON.parse(text); } catch (_) {}
        if (!response.ok || result.success === false) throw new Error(result.message || `HTTP ${response.status}`);
        closeAddModal(); showToast("Data berhasil ditambahkan"); await loadData();
    } catch (error) { console.error("Add data error:", error); showToast("Belum tersimpan. Apps Script perlu mendukung POST."); }
    finally { button.disabled = false; button.innerHTML = '<i class="fa-solid fa-plus"></i> Tambahkan'; }
}
function closeAddModal() { const modal = $("#cbmAddModal"); if (!modal) return; modal.classList.remove("show"); setTimeout(() => modal.remove(), 180); }
function addModalStyles() {
    if ($("#cbmModalStyles")) return;
    const style = document.createElement("style"); style.id = "cbmModalStyles";
    style.textContent = `#cbmAddModal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s ease}#cbmAddModal.show{opacity:1}.cbm-modal-backdrop{position:absolute;inset:0;background:rgba(10,18,35,.45);backdrop-filter:blur(6px)}.cbm-modal{position:relative;width:min(560px,calc(100% - 28px));max-height:88vh;overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.2);transform:translateY(12px);transition:transform .18s ease}#cbmAddModal.show .cbm-modal{transform:translateY(0)}.cbm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.cbm-modal-head h2{margin:0 0 4px;font-size:22px}.cbm-modal-head p{margin:0;opacity:.65}.cbm-close{border:0;background:#f1f4f8;border-radius:12px;width:38px;height:38px;font-size:25px;cursor:pointer}.cbm-form{display:grid;gap:13px}.cbm-field{display:grid;gap:7px}.cbm-field span{font-weight:600;font-size:13px}.cbm-field input{width:100%;box-sizing:border-box;border:1px solid #dfe5ed;border-radius:12px;padding:12px 13px;font:inherit;outline:none;background:#fbfcfe}.cbm-field input:focus{border-color:#2f6df6;box-shadow:0 0 0 3px rgba(47,109,246,.12)}.cbm-submit{border:0;border-radius:13px;padding:13px 16px;background:#2868ee;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;margin-top:4px}.cbm-submit:disabled{opacity:.6;cursor:wait}@media(max-width:600px){.cbm-modal{padding:18px;border-radius:18px;max-height:84vh}.cbm-modal-head h2{font-size:20px}}`;
    document.head.appendChild(style);
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function escapeAttribute(value) { return escapeHtml(value); }
