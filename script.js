const API_URL = "https://script.google.com/macros/s/AKfycbyqd9R3oJKeM5RBBW52MAhobmQCJVmOkF2fA69nPwTG2C48yc5F0s7XQ8wJJZpksRV4cA/exec";

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
        const response = await fetch(`${API_URL}?t=${Date.now()}`, {
            method: "GET",
            cache: "no-store",
            redirect: "follow"
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const raw = await response.json();
        const data = raw && raw.data && typeof raw.data === "object" ? raw.data : raw;

        appData = {
            onProcess: pickArray(data, ["onProcess", "onprocess"]),
            stock: pickArray(data, ["stock"]),
            upload: pickArray(data, ["upload"]),
            boosterLive: pickArray(data, ["boosterLive", "boosterlive", "booster"])
        };

        console.log("CBM Social Report API loaded", {
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
    $$('[data-page]').forEach(button => {
        button.addEventListener("click", () => {
            currentPage = button.dataset.page || "home";
            setActiveNavigation();
            renderPage(currentPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

function setActiveNavigation() {
    $$('.menu-item, .bottom-item').forEach(button => {
        button.classList.toggle("active", button.dataset.page === currentPage);
    });
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
    const title = $("#pageTitle");
    const grid = $("#dashboardGrid");
    const content = $("#contentArea");
    if (!title || !grid || !content) return;

    const titles = {
        home: "Dashboard",
        onprocess: "On Process",
        stock: "Stock Konten",
        upload: "Konten Terupload",
        booster: "Booster Live"
    };

    title.textContent = titles[page] || "Dashboard";
    grid.innerHTML = "";
    content.innerHTML = "";

    if (page === "home") return renderHome();

    const source = page === "onprocess"
        ? appData.onProcess
        : page === "stock"
            ? appData.stock
            : page === "upload"
                ? appData.upload
                : appData.boosterLive;

    renderSection(source, page);
}

function renderHome() {
    const grid = $("#dashboardGrid");
    const content = $("#contentArea");

    const stats = [
        ["On Process", appData.onProcess.length, "fa-pen-to-square", "onprocess"],
        ["Stock", appData.stock.length, "fa-box", "stock"],
        ["Upload", appData.upload.length, "fa-film", "upload"],
        ["Booster Live", appData.boosterLive.length, "fa-rocket", "booster"]
    ];

    grid.innerHTML = stats.map(([label, number, icon, page]) => `
        <button class="card stat-card ripple" data-page="${page}" type="button">
            <div class="card-header">
                <h3>${escapeHtml(label)}</h3>
                <span><i class="fa-solid ${icon}"></i></span>
            </div>
            <div class="card-body"><strong class="stat-number">${number}</strong></div>
        </button>
    `).join("");

    $$("#dashboardGrid [data-page]").forEach(button => {
        button.addEventListener("click", () => {
            currentPage = button.dataset.page;
            setActiveNavigation();
            renderPage(currentPage);
        });
    });

    const latest = filterData(appData.upload).slice(-6).reverse();
    content.innerHTML = `
        <div class="section-heading">
            <div><h2>Konten Terbaru</h2><p>${latest.length} konten terakhir</p></div>
        </div>
        <div class="card-grid">
            ${latest.length ? latest.map(createUploadCard).join("") : emptyState("Belum ada data upload.")}
        </div>
    `;
    bindPreviewButtons(content);
}

function renderSection(data, type) {
    const filtered = filterData(data);
    const content = $("#contentArea");

    content.innerHTML = `
        <div class="section-heading">
            <div><h2>${escapeHtml(sectionName(type))}</h2><p>${filtered.length} data</p></div>
        </div>
        <div class="card-grid">
            ${filtered.length
                ? filtered.map(item => createCard(item, type)).join("")
                : emptyState(type === "onprocess" ? "Data On Process belum diterima dari API Google Sheets." : "Tidak ada data yang ditemukan.")}
        </div>
    `;
    bindPreviewButtons(content);
}

function createCard(item, type) {
    if (type === "onprocess") return createOnProcessCard(item);
    if (type === "stock") return createStockCard(item);
    if (type === "upload") return createUploadCard(item);
    return createBoosterCard(item);
}

function createOnProcessCard(item) {
    return cardTemplate(
        value(item, "judul", "onprocess") || "Tanpa Judul",
        `${field("Editor", value(item, "editor", "onprocess"))}
         ${field("Bahan mentah diterima", value(item, "bahan", "onprocess"))}
         ${field("Mulai edit", value(item, "mulaiEdit", "onprocess"))}
         ${field("Konten jadi", value(item, "jadiKonten", "onprocess"))}
         ${field("Upload grup review", value(item, "uploadReview", "onprocess"))}
         ${field("Tanggal ACC", value(item, "acc", "onprocess"))}
         ${field("Status", value(item, "status", "onprocess"))}
         ${field("Keterangan", value(item, "keterangan", "onprocess"))}`
    );
}

function createStockCard(item) {
    const url = value(item, "link", "stock");
    return cardTemplate(
        value(item, "judul", "stock") || "Tanpa Judul",
        `${field("Akun TikTok", value(item, "akun", "stock"))}
         ${field("Editor", value(item, "editor", "stock"))}
         ${field("Selesai edit", value(item, "selesaiEdit", "stock"))}
         ${field("Upload grup review", value(item, "uploadReview", "stock"))}
         ${field("Tanggal ACC", value(item, "acc", "stock"))}
         ${field("Penjadwalan", value(item, "jadwal", "stock"))}
         ${field("Keterangan", value(item, "keterangan", "stock"))}
         ${linkHtml(url)}`
    );
}

function createUploadCard(item) {
    const vb = value(item, "viewsBefore", "upload");
    const va = value(item, "viewsAfter", "upload");
    const lb = value(item, "likesBefore", "upload");
    const la = value(item, "likesAfter", "upload");
    const booster = value(item, "jenisBooster", "upload") || "Tanpa Booster";
    const url = value(item, "link", "upload");

    return cardTemplate(
        value(item, "judul", "upload") || "Tanpa Judul",
        `${field("Akun TikTok", value(item, "akun", "upload"))}
         ${field("Editor", value(item, "editor", "upload"))}
         ${field("Tanggal Upload TikTok", value(item, "uploadTikTok", "upload"))}
         ${field("Tanggal ACC", value(item, "acc", "upload"))}
         ${field("Booster", booster)}
         ${field("Nominal Booster", value(item, "nominalBooster", "upload"))}
         ${field("Asal Dana", value(item, "asalDana", "upload"))}
         ${metricHtml("Views", vb, va)}
         ${metricHtml("Likes", lb, la)}
         ${reviewHtml(url)}`
    );
}

function createBoosterCard(item) {
    return cardTemplate(
        value(item, "cabang", "booster") || "Booster Live",
        `${field("Tanggal Booster", value(item, "tanggal", "booster"))}
         ${field("Asal biaya", value(item, "asalBiaya", "booster"))}
         ${field("Budget", value(item, "budget", "booster"))}
         ${field("Host Live", value(item, "host", "booster"))}`
    );
}

function cardTemplate(title, body) {
    return `<article class="card ripple">
        <div class="card-header">
            <h3>${escapeHtml(title || "Tanpa Judul")}</h3>
            <span><i class="fa-solid fa-chart-simple"></i></span>
        </div>
        <div class="card-body">${body}</div>
    </article>`;
}

function field(label, val) {
    return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(val || "-")}</p>`;
}

function metricHtml(label, before, after) {
    if (!before && !after) return "";
    return `<div class="metric-row"><span class="metric-label">${escapeHtml(label)}</span><span class="metric-values">${escapeHtml(before || "-")} → ${escapeHtml(after || "-")}</span></div>`;
}

function reviewHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<p><button type="button" class="preview-button" data-preview-url="${escapeAttribute(url)}"><i class="fa-brands fa-tiktok"></i> Review Konten</button></p>`;
}

function linkHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<p><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>`;
}

function value(item, type, sheet) {
    const aliases = {
        judul: ["judulkonten", "judul", "namakonten", "title"],
        editor: ["editor"],
        akun: ["akuntiktok", "akun"],
        bahan: ["tanggalbahanmentahditerima", "bahanmentahditerima", "tanggalbahan"],
        mulaiEdit: ["tanggalmulaiedit", "mulaiedit"],
        jadiKonten: ["tanggaljadikonten", "jadikonten"],
        uploadReview: ["tanggaluploadkegrupreview", "uploadkegrupreview", "tanggaluploadreview"],
        acc: ["tanggalacckonten", "tanggalacc", "acc"],
        status: ["status"],
        keterangan: ["keterangan", "keterengan", "catatan"],
        selesaiEdit: ["tanggalselesaiedit", "tanggalselesai"],
        jadwal: ["penjadwalankontenupload", "penjadwalan", "jadwal"],
        link: ["linkkonten", "link", "url"],
        uploadTikTok: ["tanggaluploadtiktok", "tanggalupload", "uploadtiktok"],
        jenisBooster: ["jenisbooster", "booster"],
        nominalBooster: ["nominalbooster"],
        asalDana: ["asaldanabooster", "asaldana"],
        viewsBefore: ["viewsbefore", "viewbefore"],
        likesBefore: ["likesbefore", "likebefore"],
        viewsAfter: ["viewsafter", "viewafter"],
        likesAfter: ["likesafter", "likeafter"],
        cabang: ["cabangyangdibooster", "cabang"],
        tanggal: ["tanggalbooster", "tanggal"],
        asalBiaya: ["asalbiayabooster", "asalbiaya"],
        budget: ["budgetbooster", "budget"],
        host: ["hostlive", "host"]
    };

    const wanted = (aliases[type] || [type]).map(normalizeKey);

    if (Array.isArray(item)) {
        const index = indexFor(sheet, type);
        return index >= 0 ? cleanValue(item[index]) : "";
    }
    if (!item || typeof item !== "object") return "";

    const entries = Object.entries(item).filter(([, raw]) => raw !== null && raw !== undefined && String(raw).trim() !== "");

    for (const [key, raw] of entries) {
        if (wanted.includes(normalizeKey(key))) return cleanValue(raw);
    }

    for (const [key, raw] of entries) {
        const normalized = normalizeKey(key);
        if (wanted.some(alias => normalized.includes(alias) || alias.includes(normalized))) return cleanValue(raw);
    }

    const semantic = {
        judul: /judul|title|nama.*konten/i,
        akun: /akun.*tiktok|akun/i,
        editor: /^editor$/i,
        link: /link|url/i,
        uploadTikTok: /tanggal.*upload.*tiktok|upload.*tiktok/i,
        jenisBooster: /jenis.*booster/i,
        nominalBooster: /nominal.*booster/i,
        asalDana: /asal.*dana/i,
        viewsBefore: /view.*sebelum/i,
        likesBefore: /like.*sebelum/i,
        viewsAfter: /view.*setelah/i,
        likesAfter: /like.*setelah/i,
        keterangan: /keter|catatan/i,
        status: /status/i
    };

    if (semantic[type]) {
        for (const [key, raw] of entries) {
            if (semantic[type].test(String(key))) return cleanValue(raw);
        }
    }

    return "";
}

function indexFor(sheet, type) {
    const maps = {
        onprocess: { judul: 1, bahan: 2, mulaiEdit: 3, jadiKonten: 4, editor: 5, uploadReview: 6, acc: 7, status: 8, keterangan: 9 },
        stock: { judul: 1, selesaiEdit: 2, uploadReview: 3, acc: 4, akun: 5, editor: 6, jadwal: 7, keterangan: 8, link: 9 },
        upload: { judul: 1, selesaiEdit: 2, uploadReview: 3, acc: 4, akun: 5, uploadTikTok: 6, editor: 7, jenisBooster: 8, nominalBooster: 9, asalDana: 10, viewsBefore: 13, likesBefore: 14, viewsAfter: 15, likesAfter: 16, link: 17 },
        booster: { cabang: 1, tanggal: 2, asalBiaya: 3, budget: 4, host: 5 }
    };
    return maps[sheet]?.[type] ?? -1;
}

function normalizeKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanValue(value) {
    return value === null || value === undefined ? "" : String(value).trim();
}

function filterData(data) {
    if (!searchTerm) return data;
    return data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm));
}

function sectionName(type) {
    return {
        onprocess: "On Process",
        stock: "Stock Konten",
        upload: "Konten Terupload",
        booster: "Booster Live"
    }[type] || "Konten";
}

function emptyState(message) {
    return `<div class="card empty-state"><div class="card-body"><p>${escapeHtml(message)}</p></div></div>`;
}

function bindPreviewButtons(root) {
    root.querySelectorAll("[data-preview-url]").forEach(button => {
        button.addEventListener("click", () => openPreview(button.dataset.previewUrl));
    });
}

function openPreview(url) {
    if (!url) return;
    const existing = document.getElementById("previewModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "previewModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:20px";
    modal.innerHTML = `<div style="position:relative;width:min(420px,100%);height:min(760px,90vh);background:#111;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)"><button id="closePreview" type="button" style="position:absolute;right:10px;top:10px;z-index:2;border:0;border-radius:50%;width:36px;height:36px;cursor:pointer;background:rgba(255,255,255,.9);font-size:20px">×</button><iframe src="${escapeAttribute(tiktokEmbedUrl(url))}" title="TikTok preview" style="width:100%;height:100%;border:0" allow="autoplay; encrypted-media" allowfullscreen></iframe><div style="position:absolute;left:12px;right:12px;bottom:12px;text-align:center"><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#fff;color:#111;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:600">Buka di TikTok</a></div></div>`;
    document.body.appendChild(modal);
    $("#closePreview").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", event => { if (event.target === modal) modal.remove(); });
}

function tiktokEmbedUrl(url) {
    const match = String(url).match(/\/video\/(\d+)/i);
    if (match) return `https://www.tiktok.com/player/v1/${match[1]}?description=1&music_info=1&rel=0`;
    return url;
}

function openAddModal() {
    const existing = document.getElementById("addModal");
    if (existing) existing.remove();

    const type = currentPage === "home" ? "upload" : currentPage;
    const labels = {
        onprocess: "Tambah On Process",
        stock: "Tambah Stock",
        upload: "Tambah Konten Terupload",
        booster: "Tambah Booster Live"
    };

    const modal = document.createElement("div");
    modal.id = "addModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px";
    modal.innerHTML = `<form id="addForm" style="width:min(560px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><h2 style="margin:0">${labels[type] || "Tambah Data"}</h2><button id="closeAdd" type="button" style="border:0;background:none;font-size:24px;cursor:pointer">×</button></div><div id="addFields">${addFields(type)}</div><button type="submit" style="width:100%;margin-top:18px;border:0;border-radius:12px;padding:13px;cursor:pointer;font-weight:700">Simpan</button></form>`;
    document.body.appendChild(modal);

    $("#closeAdd").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", event => { if (event.target === modal) modal.remove(); });
    $("#addForm").addEventListener("submit", async event => {
        event.preventDefault();
        await submitAdd(type, new FormData(event.currentTarget), modal);
    });
}

function addFields(type) {
    const common = {
        onprocess: [
            ["judul", "Judul Konten", "text"], ["bahan", "Tanggal Bahan Mentah Diterima", "date"], ["mulaiEdit", "Tanggal Mulai Edit", "date"], ["jadiKonten", "Tanggal Jadi Konten", "date"], ["editor", "Editor", "text"], ["uploadReview", "Tanggal Upload ke Grup Review", "date"], ["acc", "Tanggal ACC", "date"], ["status", "Status", "text"], ["keterangan", "Keterangan", "text"]
        ],
        stock: [
            ["judul", "Judul Konten", "text"], ["selesaiEdit", "Tanggal Selesai Edit", "date"], ["uploadReview", "Tanggal Upload ke Grup Review", "date"], ["acc", "Tanggal ACC Konten", "date"], ["akun", "Akun TikTok", "text"], ["editor", "Editor", "text"], ["jadwal", "Penjadwalan Konten Upload", "date"], ["keterangan", "Keterangan", "text"], ["link", "Link Konten", "url"]
        ],
        upload: [
            ["judul", "Judul Konten", "text"], ["selesaiEdit", "Tanggal Selesai Edit", "date"], ["uploadReview", "Tanggal Upload ke Grup Review", "date"], ["acc", "Tanggal ACC Konten", "date"], ["akun", "Akun TikTok", "text"], ["uploadTikTok", "Tanggal Upload TikTok", "date"], ["editor", "Editor", "text"], ["jenisBooster", "Jenis Booster", "text"], ["nominalBooster", "Nominal Booster", "text"], ["asalDana", "Asal Dana Booster", "text"], ["viewsBefore", "Views Sebelum Booster", "text"], ["likesBefore", "Likes Sebelum Booster", "text"], ["viewsAfter", "Views Setelah Booster", "text"], ["likesAfter", "Likes Setelah Booster", "text"], ["link", "Link Konten", "url"]
        ],
        booster: [
            ["cabang", "Cabang yang di Booster", "text"], ["tanggal", "Tanggal Booster", "date"], ["asalBiaya", "Asal Biaya Booster", "text"], ["budget", "Budget Booster", "text"], ["host", "Host Live", "text"]
        ]
    };

    return common[type].map(([name, label, inputType]) => `<label style="display:block;margin:12px 0;font-weight:600">${escapeHtml(label)}<input name="${name}" type="${inputType}" style="display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:11px;border:1px solid #ddd;border-radius:10px"></label>`).join("");
}

async function submitAdd(type, formData, modal) {
    const data = Object.fromEntries(formData.entries());
    showLoading(true);
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "add", sheet: type === "onprocess" ? "onProcess" : type, data })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Gagal menyimpan data");
        modal.remove();
        showToast("Data berhasil ditambahkan");
        await loadData();
    } catch (error) {
        console.error(error);
        showToast(error.message || "Gagal menyimpan data");
    } finally {
        showLoading(false);
    }
}

function renderError(message) {
    const content = $("#contentArea");
    if (content) content.innerHTML = emptyState(message);
}

function showLoading(show) {
    const loading = $("#loading");
    if (loading) loading.classList.toggle("show", !!show);
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
}
