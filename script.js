const API_URL = "https://script.google.com/macros/s/AKfycbxO0mk7oMI9hF__zieQyVV5icjJ6IxtcUyD2881tQe0_Q4VQvbQltKyFvlziPvyiTHilg/exec";

let appData = { onProcess: [], stock: [], upload: [], boosterLive: [] };
let currentPage = "home";
let searchTerm = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

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
        const data = await response.json();

        appData = {
            onProcess: Array.isArray(data.onProcess) ? data.onProcess : [],
            stock: Array.isArray(data.stock) ? data.stock : [],
            upload: Array.isArray(data.upload) ? data.upload : [],
            boosterLive: Array.isArray(data.boosterLive) ? data.boosterLive : []
        };

        renderPage(currentPage);
    } catch (error) {
        console.error("CBM API error:", error);
        renderError("Gagal mengambil data Google Sheets. Pastikan Web App Apps Script sudah di-deploy sebagai Anyone.");
        showToast("Gagal mengambil data");
    } finally {
        showLoading(false);
    }
}

function bindNavigation() {
    $$('[data-page]').forEach(button => {
        button.addEventListener("click", () => {
            currentPage = button.dataset.page || "home";
            setActiveNavigation();
            renderPage(currentPage);
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
    if (!fab) return;

    fab.addEventListener("click", () => {
        openAddModal();
    });
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

    if (page === "home") {
        renderHome();
        return;
    }

    const source = page === "onprocess" ? appData.onProcess
        : page === "stock" ? appData.stock
        : page === "upload" ? appData.upload
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

    grid.innerHTML = stats.map(([label, value, icon, page]) => `
        <button class="card stat-card ripple" data-page="${page}" type="button">
            <div class="card-header">
                <h3>${escapeHtml(label)}</h3>
                <span><i class="fa-solid ${icon}"></i></span>
            </div>
            <div class="card-body"><strong class="stat-number">${value}</strong></div>
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
            ${latest.length ? latest.map(item => createUploadCard(item)).join("") : emptyState("Belum ada data upload.")}
        </div>
    `;
}

function renderSection(data, type) {
    const content = $("#contentArea");
    const filtered = filterData(data);

    content.innerHTML = `
        <div class="section-heading">
            <div><h2>${escapeHtml(sectionName(type))}</h2><p>${filtered.length} data</p></div>
        </div>
        <div class="card-grid">
            ${filtered.length ? filtered.map(item => createCard(item, type)).join("") : emptyState("Tidak ada data yang ditemukan.")}
        </div>
    `;
}

function createCard(item, type) {
    if (type === "onprocess") return createOnProcessCard(item);
    if (type === "stock") return createStockCard(item);
    if (type === "upload") return createUploadCard(item);
    return createBoosterCard(item);
}

function createOnProcessCard(item) {
    const title = value(item, "judul");
    return cardTemplate(title, `
        ${field("Editor", value(item, "editor"))}
        ${field("Bahan mentah diterima", value(item, "bahan"))}
        ${field("Mulai edit", value(item, "mulaiEdit"))}
        ${field("Konten jadi", value(item, "jadiKonten"))}
        ${field("Upload grup review", value(item, "uploadReview"))}
        ${field("Tanggal ACC", value(item, "acc"))}
        ${field("Status", value(item, "status"))}
        ${field("Keterangan", value(item, "keterangan"))}
    `);
}

function createStockCard(item) {
    const title = value(item, "judul");
    return cardTemplate(title, `
        ${field("Akun TikTok", value(item, "akun"))}
        ${field("Editor", value(item, "editor"))}
        ${field("Selesai edit", value(item, "selesaiEdit"))}
        ${field("Upload grup review", value(item, "uploadReview"))}
        ${field("Tanggal ACC", value(item, "acc"))}
        ${field("Penjadwalan", value(item, "jadwal"))}
        ${field("Keterangan", value(item, "keterangan"))}
        ${linkHtml(value(item, "link"))}
    `);
}

function createUploadCard(item) {
    const title = value(item, "judul");
    const booster = value(item, "jenisBooster");
    const viewsBefore = value(item, "viewsBefore");
    const viewsAfter = value(item, "viewsAfter");
    const likesBefore = value(item, "likesBefore");
    const likesAfter = value(item, "likesAfter");

    return cardTemplate(title, `
        ${field("Akun TikTok", value(item, "akun"))}
        ${field("Editor", value(item, "editor"))}
        ${field("Tanggal Upload TikTok", value(item, "uploadTikTok"))}
        ${field("Tanggal ACC", value(item, "acc"))}
        ${field("Booster", booster)}
        ${field("Nominal Booster", value(item, "nominalBooster"))}
        ${field("Asal Dana", value(item, "asalDana"))}
        ${metricHtml("Views", viewsBefore, viewsAfter)}
        ${metricHtml("Likes", likesBefore, likesAfter)}
        ${linkHtml(value(item, "link"))}
    `);
}

function createBoosterCard(item) {
    return cardTemplate(value(item, "cabang") || "Booster Live", `
        ${field("Tanggal Booster", value(item, "tanggal"))}
        ${field("Asal biaya", value(item, "asalBiaya"))}
        ${field("Budget", value(item, "budget"))}
        ${field("Host Live", value(item, "host"))}
    `);
}

function cardTemplate(title, body) {
    return `
        <article class="card ripple">
            <div class="card-header">
                <h3>${escapeHtml(title || "Tanpa Judul")}</h3>
                <span><i class="fa-solid fa-chart-simple"></i></span>
            </div>
            <div class="card-body">${body}</div>
        </article>
    `;
}

function field(label, val) {
    return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(val || "-")}</p>`;
}

function metricHtml(label, before, after) {
    if (!before && !after) return "";
    return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(before || "-")} <span aria-hidden="true">→</span> ${escapeHtml(after || "-")}</p>`;
}

function value(item, type) {
    const aliases = {
        judul: ["judulKonten", "judul", "namaKonten", "title"],
        editor: ["editor"],
        akun: ["akunTiktok", "akunTikTok", "akunTiktok1", "akun"],
        bahan: ["tanggalBahanMentahDiterima", "tanggalBahanMentahDiterima"],
        mulaiEdit: ["tanggalMulaiEdit"],
        jadiKonten: ["tanggalJadiKonten"],
        uploadReview: ["tanggalUploadKeGrupReview"],
        acc: ["tanggalAccKonten", "tanggalAcc"],
        status: ["status"],
        keterangan: ["keterangan", "keterengan"],
        selesaiEdit: ["tanggalSelesaiEdit"],
        jadwal: ["penjadwalanKontenUpload"],
        link: ["linkKonten", "link"],
        uploadTikTok: ["tanggalUploadTiktok", "tanggalUploadTikTok"],
        jenisBooster: ["jenisBooster"],
        nominalBooster: ["nominalBooster"],
        asalDana: ["asalDanaBooster", "asalDana"],
        viewsBefore: ["jumlahViewLikeSebelumBoosterView", "viewsBefore", "viewBefore", "views"],
        viewsAfter: ["jumlahViewLikeSetelahBoosterView", "viewsAfter", "viewAfter"],
        likesBefore: ["jumlahViewLikeSebelumBoosterLike", "likesBefore", "likeBefore", "like"],
        likesAfter: ["jumlahViewLikeSetelahBoosterLike", "likesAfter", "likeAfter"],
        cabang: ["cabangYangDiBooster"],
        tanggal: ["tanggalBooster"],
        asalBiaya: ["asalBiayaBooster"],
        budget: ["budgetBooster"],
        host: ["hostLive"]
    };

    const aliasesForType = aliases[type] || [type];
    for (const key of aliasesForType) {
        const found = findValue(item, key);
        if (found !== "") return found;
    }
    return "";
}

function findValue(item, wantedKey) {
    if (!item || typeof item !== "object") return "";
    const wanted = normalizeKey(wantedKey);

    for (const [key, raw] of Object.entries(item)) {
        if (raw === null || raw === undefined || String(raw).trim() === "") continue;
        const normalized = normalizeKey(key);
        if (normalized === wanted || normalized.includes(wanted) || wanted.includes(normalized)) {
            return String(raw).trim();
        }
    }
    return "";
}

function normalizeKey(key) {
    return String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function linkHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<p><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>`;
}

function filterData(data) {
    if (!searchTerm) return data;
    return data.filter(item => Object.values(item).some(value => String(value ?? "").toLowerCase().includes(searchTerm)));
}

function sectionName(type) {
    return {
        onprocess: "Konten On Process",
        stock: "Stock Konten",
        upload: "Konten Terupload",
        booster: "Booster Live"
    }[type] || "Dashboard";
}

function emptyState(message) {
    return `<div class="card empty-state"><h3>${escapeHtml(message)}</h3></div>`;
}

function renderError(message) {
    const grid = $("#dashboardGrid");
    const content = $("#contentArea");
    if (grid) grid.innerHTML = "";
    if (content) content.innerHTML = emptyState(message);
}

function showLoading(show) {
    const loading = $("#loading");
    if (!loading) return;
    loading.style.display = show ? "flex" : "none";
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
    if ($("#cbmAddModal")) {
        $("#cbmAddModal").classList.add("show");
        return;
    }

    const sheetForPage = currentPage === "onprocess" ? "onProcess"
        : currentPage === "stock" ? "stock"
        : currentPage === "upload" ? "upload"
        : currentPage === "booster" ? "boosterLive"
        : "upload";

    const modal = document.createElement("div");
    modal.id = "cbmAddModal";
    modal.innerHTML = `
        <div class="cbm-modal-backdrop"></div>
        <div class="cbm-modal" role="dialog" aria-modal="true" aria-labelledby="cbmAddTitle">
            <div class="cbm-modal-head">
                <div><h2 id="cbmAddTitle">Tambah Data</h2><p>${escapeHtml(sectionName(currentPage === "home" ? "upload" : currentPage))}</p></div>
                <button type="button" class="cbm-close" id="cbmCloseModal" aria-label="Tutup">×</button>
            </div>
            <form id="cbmAddForm" class="cbm-form">
                <input type="hidden" name="sheet" value="${sheetForPage}">
                ${addFieldsForPage(sheetForPage)}
                <button class="cbm-submit" type="submit"><i class="fa-solid fa-plus"></i> Tambahkan</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    addModalStyles();

    $("#cbmCloseModal").addEventListener("click", closeAddModal);
    modal.querySelector(".cbm-modal-backdrop").addEventListener("click", closeAddModal);
    $("#cbmAddForm").addEventListener("submit", submitAddForm);
    requestAnimationFrame(() => modal.classList.add("show"));
}

function addFieldsForPage(page) {
    if (page === "onProcess") {
        return inputField("Judul Konten", "judulKonten", true) + inputField("Editor", "editor") + inputField("Tanggal Bahan Mentah diterima", "tanggalBahanMentahDiterima", false, "date") + inputField("Tanggal Mulai Edit", "tanggalMulaiEdit", false, "date") + inputField("Status", "status") + inputField("Keterangan", "keterangan");
    }
    if (page === "stock") {
        return inputField("Judul Konten", "judulKonten", true) + inputField("Akun TikTok", "akunTiktok") + inputField("Editor", "editor") + inputField("Tanggal Selesai Edit", "tanggalSelesaiEdit", false, "date") + inputField("Tanggal Upload ke Grup Review", "tanggalUploadKeGrupReview", false, "date") + inputField("Penjadwalan Konten Upload", "penjadwalanKontenUpload", false, "date") + inputField("Link Konten", "linkKonten");
    }
    if (page === "boosterLive") {
        return inputField("Cabang yang di Booster", "cabangYangDiBooster", true) + inputField("Tanggal Booster", "tanggalBooster", false, "date") + inputField("Asal Biaya Booster", "asalBiayaBooster") + inputField("Budget Booster", "budgetBooster") + inputField("Host Live", "hostLive");
    }
    return inputField("Judul Konten", "judulKonten", true) + inputField("Akun TikTok", "akunTiktok") + inputField("Tanggal Upload TikTok", "tanggalUploadTiktok", false, "date") + inputField("Editor", "editor") + inputField("Jenis Booster", "jenisBooster") + inputField("Nominal Booster", "nominalBooster") + inputField("Asal Dana Booster", "asalDanaBooster") + inputField("Views Sebelum Booster", "viewsBefore") + inputField("Likes Sebelum Booster", "likesBefore") + inputField("Views Setelah Booster", "viewsAfter") + inputField("Likes Setelah Booster", "likesAfter") + inputField("Link Konten", "linkKonten");
}

function inputField(label, name, required = false, type = "text") {
    return `<label class="cbm-field"><span>${escapeHtml(label)}${required ? " *" : ""}</span><input name="${escapeAttribute(name)}" type="${type}" ${required ? "required" : ""}></label>`;
}

async function submitAddForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    const formData = new FormData(form);
    const payload = { action: "add", sheet: formData.get("sheet"), data: {} };

    formData.forEach((val, key) => {
        if (key !== "sheet" && String(val).trim() !== "") payload.data[key] = String(val).trim();
    });

    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
        const text = await response.text();
        let result = {};
        try { result = JSON.parse(text); } catch (_) {}

        if (!response.ok || result.success === false) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        closeAddModal();
        showToast("Data berhasil ditambahkan");
        await loadData();
    } catch (error) {
        console.error("Add data error:", error);
        showToast("Belum tersimpan. Apps Script perlu mendukung POST.");
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-plus"></i> Tambahkan';
    }
}

function closeAddModal() {
    const modal = $("#cbmAddModal");
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 180);
}

function addModalStyles() {
    if ($("#cbmModalStyles")) return;
    const style = document.createElement("style");
    style.id = "cbmModalStyles";
    style.textContent = `
        #cbmAddModal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s ease}
        #cbmAddModal.show{opacity:1}
        .cbm-modal-backdrop{position:absolute;inset:0;background:rgba(10,18,35,.45);backdrop-filter:blur(6px)}
        .cbm-modal{position:relative;width:min(560px,calc(100% - 28px));max-height:88vh;overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.2);transform:translateY(12px);transition:transform .18s ease}
        #cbmAddModal.show .cbm-modal{transform:translateY(0)}
        .cbm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
        .cbm-modal-head h2{margin:0 0 4px;font-size:22px}.cbm-modal-head p{margin:0;opacity:.65}
        .cbm-close{border:0;background:#f1f4f8;border-radius:12px;width:38px;height:38px;font-size:25px;cursor:pointer}
        .cbm-form{display:grid;gap:13px}.cbm-field{display:grid;gap:7px}.cbm-field span{font-weight:600;font-size:13px}.cbm-field input{width:100%;box-sizing:border-box;border:1px solid #dfe5ed;border-radius:12px;padding:12px 13px;font:inherit;outline:none;background:#fbfcfe}.cbm-field input:focus{border-color:#2f6df6;box-shadow:0 0 0 3px rgba(47,109,246,.12)}
        .cbm-submit{border:0;border-radius:13px;padding:13px 16px;background:#2868ee;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;margin-top:4px}.cbm-submit:disabled{opacity:.6;cursor:wait}
        @media(max-width:600px){.cbm-modal{padding:18px;border-radius:18px;max-height:84vh}.cbm-modal-head h2{font-size:20px}}
    `;
    document.head.appendChild(style);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
}

function escapeAttribute(value) { return escapeHtml(value); }
