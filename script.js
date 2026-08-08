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
    injectRuntimeStyles();
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
            window.scrollTo({ top: 0, behavior: "smooth" });
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
    return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(formatValue(val) || "-")}</p>`;
}

function metricHtml(label, before, after) {
    if (!before && !after) return "";
    return `<div class="metric-row"><span class="metric-label">${escapeHtml(label)}</span><span class="metric-values">${escapeHtml(formatValue(before) || "-")} → ${escapeHtml(formatValue(after) || "-")}</span></div>`;
}

function reviewHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<p><button type="button" class="preview-button" data-preview-url="${escapeAttribute(url)}"><i class="fa-brands fa-tiktok"></i> Review Konten</button></p>`;
}

function linkHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<p><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>`;
}

function bindPreviewButtons(root) {
    root.querySelectorAll(".preview-button").forEach(button => {
        button.addEventListener("click", () => openTikTokPreview(button.dataset.previewUrl || ""));
    });
}

async function openTikTokPreview(url) {
    if (!url) return;

    const modal = ensurePreviewModal();
    const body = modal.querySelector(".tiktok-preview-body");
    const openButton = modal.querySelector(".tiktok-open-button");

    openButton.href = url;
    modal.classList.add("show");
    document.body.classList.add("modal-open");
    body.innerHTML = `
        <div class="preview-loading">
            <div class="loader"></div>
            <p>Memuat video TikTok...</p>
        </div>`;

    try {
        // TikTok's oEmbed endpoint accepts a TikTok video URL and returns
        // the canonical post information, including the post ID.
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) throw new Error(`oEmbed HTTP ${response.status}`);
        const data = await response.json();
        const html = String(data.html || "");
        const idMatch = html.match(/data-video-id=["'](\d+)["']/i);
        const id = idMatch ? idMatch[1] : "";

        if (!id) throw new Error("TikTok post ID tidak ditemukan");

        const playerUrl = `https://www.tiktok.com/player/v1/${id}?controls=1&description=1&music_info=1&loop=0`;

        body.innerHTML = `
            <iframe
                class="tiktok-player"
                src="${escapeAttribute(playerUrl)}"
                title="TikTok video preview"
                allow="fullscreen; autoplay"
                allowfullscreen
                loading="eager">
            </iframe>`;
    } catch (error) {
        console.warn("TikTok embedded preview gagal:", error);
        body.innerHTML = `
            <div class="preview-fallback">
                <i class="fa-brands fa-tiktok"></i>
                <h3>Preview TikTok tidak dapat dimuat</h3>
                <p>Browser atau TikTok menolak embed untuk link ini. Kamu tetap bisa membuka videonya langsung.</p>
                <a class="tiktok-fallback-link" href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Video di TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>`;
    }
}

function ensurePreviewModal() {
    let modal = $("#tiktokPreviewModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "tiktokPreviewModal";
    modal.className = "tiktok-preview-modal";
    modal.innerHTML = `
        <div class="tiktok-preview-dialog" role="dialog" aria-modal="true" aria-label="Preview TikTok">
            <button type="button" class="tiktok-preview-close" aria-label="Tutup">×</button>
            <div class="tiktok-preview-body"></div>
            <a class="tiktok-open-button" href="#" target="_blank" rel="noopener noreferrer">Buka di TikTok</a>
        </div>`;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
        if (event.target === modal || event.target.closest(".tiktok-preview-close")) closePreviewModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closePreviewModal();
    });

    return modal;
}

function closePreviewModal() {
    const modal = $("#tiktokPreviewModal");
    if (!modal) return;
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    const body = modal.querySelector(".tiktok-preview-body");
    if (body) body.innerHTML = "";
}

function filterData(data) {
    if (!searchTerm) return data || [];
    return (data || []).filter(item => {
        try {
            return Object.values(item || {}).some(value => String(value ?? "").toLowerCase().includes(searchTerm));
        } catch {
            return false;
        }
    });
}

function sectionName(type) {
    return {
        onprocess: "On Process",
        stock: "Stock Konten",
        upload: "Konten Terupload",
        booster: "Booster Live"
    }[type] || "Data";
}

function emptyState(text) {
    return `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><h3>${escapeHtml(text)}</h3></div>`;
}

function renderError(message) {
    const content = $("#contentArea");
    if (content) content.innerHTML = emptyState(message);
}

function formatValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function cleanValue(value) {
    return formatValue(value);
}

function normalizeKey(key) {
    return String(key ?? "")
        .toLowerCase()
        .replace(/[\u00a0\r\n]+/g, " ")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}

function value(item, type, sheet) {
    const aliases = {
        judul: ["judulkonten", "judul", "namakonten", "title"],
        editor: ["editor"],
        akun: ["akuntiktok", "akuntiktok", "akun"],
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
        viewsBefore: ["jumlahviewlikesebelumbooster", "viewsbefore", "viewbefore", "view"],
        likesBefore: ["likesbefore", "likebefore", "like"],
        viewsAfter: ["jumlahviewlikesetelahbooster", "viewsafter", "viewafter"],
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
        status: /status/i,
        cabang: /cabang.*booster|cabang/i,
        tanggal: /tanggal.*booster/i,
        asalBiaya: /asal.*biaya/i,
        budget: /budget.*booster|budget/i,
        host: /host.*live|host/i
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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function showLoading(show) {
    const el = $("#loading");
    if (el) el.classList.toggle("show", !!show);
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function openAddModal() {
    let modal = $("#addModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "addModal";
        modal.className = "simple-modal";
        modal.innerHTML = `
            <div class="simple-modal-box">
                <button class="simple-modal-close" type="button">×</button>
                <h2>Tambah Konten</h2>
                <p class="modal-note">Form input siap ditambahkan ke tahap berikutnya.</p>
                <button class="modal-ok" type="button">Tutup</button>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector(".simple-modal-close").onclick = () => modal.remove();
        modal.querySelector(".modal-ok").onclick = () => modal.remove();
        modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    }
}

function injectRuntimeStyles() {
    if ($("#cbm-runtime-styles")) return;
    const style = document.createElement("style");
    style.id = "cbm-runtime-styles";
    style.textContent = `
        body.modal-open{overflow:hidden}
        .tiktok-preview-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(10,18,35,.72);backdrop-filter:blur(8px)}
        .tiktok-preview-modal.show{display:flex}
        .tiktok-preview-dialog{position:relative;width:min(430px,92vw);height:min(780px,90vh);background:#fff;border-radius:24px;box-shadow:0 25px 80px rgba(0,0,0,.35);overflow:hidden;display:flex;flex-direction:column}
        .tiktok-preview-body{flex:1;min-height:0;background:#111;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .tiktok-player{width:100%;height:100%;border:0;background:#000}
        .tiktok-preview-close{position:absolute;right:12px;top:12px;z-index:3;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.94);font-size:25px;line-height:38px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.16)}
        .tiktok-open-button{display:block;text-align:center;text-decoration:none;background:#fff;color:#111;font-weight:700;padding:15px 18px;border-top:1px solid #eee}
        .preview-loading,.preview-fallback{color:#fff;text-align:center;padding:30px;max-width:330px}
        .preview-fallback i{font-size:42px;margin-bottom:12px}.preview-fallback h3{margin:8px 0;font-size:20px}.preview-fallback p{opacity:.8;line-height:1.5}
        .tiktok-fallback-link{display:inline-block;margin-top:12px;padding:12px 16px;border-radius:12px;background:#fff;color:#111;text-decoration:none;font-weight:700}
        .preview-loading .loader{width:32px;height:32px;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:cbmspin .8s linear infinite;margin:0 auto 12px}
        @keyframes cbmspin{to{transform:rotate(360deg)}}
        .simple-modal{position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(10,18,35,.65);padding:20px}
        .simple-modal-box{position:relative;background:#fff;border-radius:20px;padding:28px;width:min(420px,92vw);box-shadow:0 25px 70px rgba(0,0,0,.25)}
        .simple-modal-close{position:absolute;right:12px;top:12px;border:0;background:#f2f4f8;border-radius:50%;width:34px;height:34px;font-size:22px;cursor:pointer}.simple-modal h2{margin-top:0}.modal-note{color:#64748b}.modal-ok{border:0;border-radius:12px;padding:11px 18px;font-weight:700;cursor:pointer}
        @media(max-width:600px){.tiktok-preview-modal{padding:0}.tiktok-preview-dialog{width:100vw;height:100vh;border-radius:0}.tiktok-preview-body{min-height:0}}
    `;
    document.head.appendChild(style);
}
