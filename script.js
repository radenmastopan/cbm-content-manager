const API_URL = "https://script.google.com/macros/s/AKfycbxO0mk7oMI9hF__zieQyVV5icjJ6IxtcUyD2881tQe0_Q4VQvbQltKyFvlziPvyiTHilg/exec";

let appData = {
    onProcess: [],
    stock: [],
    upload: [],
    boosterLive: []
};

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
        showToast("Tombol tambah siap digunakan. Form input akan ditambahkan pada tahap berikutnya.");
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
            <div class="card-body">
                <strong class="stat-number">${value}</strong>
            </div>
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
            <div>
                <h2>Konten Terbaru</h2>
                <p>${latest.length} konten terakhir</p>
            </div>
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
            <div>
                <h2>${escapeHtml(sectionName(type))}</h2>
                <p>${filtered.length} data</p>
            </div>
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
    const title = get(item, ["Judul Konten", "judulKonten"]);
    return cardTemplate(title, `
        <p><b>Editor</b><br>${escapeHtml(get(item, ["Editor", "editor"]) || "-")}</p>
        <p><b>Bahan diterima</b><br>${escapeHtml(get(item, ["Tanggal Bahan Mentah diterima", "tanggalBahanMentahDiterima"]) || "-")}</p>
        <p><b>Mulai edit</b><br>${escapeHtml(get(item, ["Tanggal Mulai Edit", "tanggalMulaiEdit"]) || "-")}</p>
        <p><b>Status</b><br>${escapeHtml(get(item, ["Status", "status"]) || "-")}</p>
    `);
}

function createStockCard(item) {
    const title = get(item, ["Judul Konten", "judulKonten"]);
    return cardTemplate(title, `
        <p><b>Akun TikTok</b><br>${escapeHtml(get(item, ["Akun Tiktok", "Akun TikTok", "akunTiktok"]) || "-")}</p>
        <p><b>Editor</b><br>${escapeHtml(get(item, ["Editor", "editor"]) || "-")}</p>
        <p><b>Upload grup review</b><br>${escapeHtml(get(item, ["Tanggal Upload ke Grup Review", "tanggalUploadKeGrupReview"]) || "-")}</p>
        ${linkHtml(get(item, ["Link Konten", "linkKonten"]))}
    `);
}

function createUploadCard(item) {
    const title = get(item, ["Judul Konten", "judulKonten"]);
    const booster = get(item, ["Jenis Booster", "jenisBooster"]);
    const viewsBefore = get(item, ["Jumlah View & Like Sebelum Booster View", "View"]);
    const viewsAfter = get(item, ["Jumlah View & Like Setelah Booster View", "View"]);
    return cardTemplate(title, `
        <p><b>Akun</b><br>${escapeHtml(get(item, ["Akun Tiktok", "Akun TikTok", "akunTiktok"]) || "-")}</p>
        <p><b>Tanggal Upload</b><br>${escapeHtml(get(item, ["Tanggal Upload Tiktok", "Tanggal Upload TikTok", "tanggalUploadTiktok"]) || "-")}</p>
        <p><b>Booster</b><br>${escapeHtml(booster || "-")}</p>
        ${viewsBefore || viewsAfter ? `<p><b>Views</b><br>${escapeHtml(viewsBefore || "-")} → ${escapeHtml(viewsAfter || "-")}</p>` : ""}
        ${linkHtml(get(item, ["Link Konten", "linkKonten"]))}
    `);
}

function createBoosterCard(item) {
    const branch = get(item, ["CABANG YANG DI BOOSTER", "Cabang Yang Di Booster", "cabangYangDiBooster"]);
    return cardTemplate(branch, `
        <p><b>Tanggal</b><br>${escapeHtml(get(item, ["TANGGAL BOOSTER", "Tanggal Booster", "tanggalBooster"]) || "-")}</p>
        <p><b>Asal biaya</b><br>${escapeHtml(get(item, ["ASAL BIAYA BOOSTER", "Asal Biaya Booster", "asalBiayaBooster"]) || "-")}</p>
        <p><b>Budget</b><br>${escapeHtml(get(item, ["BUDGET BOOSTER", "Budget Booster", "budgetBooster"]) || "-")}</p>
        <p><b>Host</b><br>${escapeHtml(get(item, ["HOST LIVE", "Host Live", "hostLive"]) || "-")}</p>
    `);
}

function cardTemplate(title, body) {
    return `
        <article class="card ripple">
            <div class="card-header">
                <h3>${escapeHtml(title || "Tanpa Judul")}</h3>
                <span><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
            </div>
            <div class="card-body">${body}</div>
        </article>
    `;
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

function get(item, keys) {
    for (const key of keys) {
        if (item && item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== "") return String(item[key]);
    }
    return "";
}

function linkHtml(url) {
    if (!url || !/^https?:\/\//i.test(url)) return "";
    return `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
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

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
