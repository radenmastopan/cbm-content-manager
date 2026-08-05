/* ==========================================================
   CBM SOCIAL REPORT
   Production Version
========================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbwtoUQAPS1Trbt69ZranpTkm3R7NA_cmu2YTeh5_hUMe7GijgarvFLs8D0Ye1deXldzjA/exec";


/* ==========================================================
   GLOBAL STATE
========================================================== */

let appData = {

    onProcess: [],

    stock: [],

    upload: [],

    booster: []

};

let currentPage = "home";

let filteredData = [];


/* ==========================================================
   DOM
========================================================== */

const dashboardGrid = document.getElementById("dashboardGrid");

const contentArea = document.getElementById("contentArea");

const searchInput = document.getElementById("searchInput");

const loading = document.getElementById("loading");

const toast = document.getElementById("toast");

const pageTitle = document.getElementById("pageTitle");

const sidebarMenu =
document.querySelectorAll(".menu-item");

const bottomMenu =
document.querySelectorAll(".bottom-item");


/* ==========================================================
   INIT
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    init();

});


async function init(){

    bindMenu();

    bindSearch();

    rippleEffect();

    await loadData();

}


/* ==========================================================
   LOAD DATA
========================================================== */

async function loadData(){

    showLoading();

    try{

        const response = await fetch(API_URL);

        if(!response.ok){

            throw new Error("API Error");

        }

        const json = await response.json();

        appData.onProcess =
            json.onProcess || [];

        appData.stock =
            json.stock || [];

        appData.upload =
            json.upload || [];

        appData.booster =
            json.booster || [];

        renderHome();

        hideLoading();

    }

    catch(error){

        hideLoading();

        console.error(error);

        showToast("Gagal mengambil data");

    }

}


/* ==========================================================
   HOME
========================================================== */

function renderHome(){

    currentPage = "home";

    pageTitle.textContent = "Dashboard";

    renderDashboardCards();

    renderLatestUpload();

}


/* ==========================================================
   DASHBOARD CARDS
========================================================== */

function renderDashboardCards(){

    dashboardGrid.innerHTML = "";

    const cards = [

        {

            title:"On Process",

            value:appData.onProcess.length,

            icon:"fa-pen-to-square"

        },

        {

            title:"Stock",

            value:appData.stock.length,

            icon:"fa-box"

        },

        {

            title:"Upload",

            value:appData.upload.length,

            icon:"fa-film"

        },

        {

            title:"Booster",

            value:appData.booster.length,

            icon:"fa-rocket"

        }

    ];

    cards.forEach(card=>{

        dashboardGrid.innerHTML += `

        <div class="card fade-in">

            <div class="stat-card">

                <div class="stat-left">

                    <div class="stat-title">

                        ${card.title}

                    </div>

                    <div class="stat-value counter">

                        ${card.value}

                    </div>

                </div>

                <div class="stat-icon">

                    <i class="fa-solid ${card.icon}"></i>

                </div>

            </div>

        </div>

        `;

    });

    animateCounter();

}


/* ==========================================================
   LATEST UPLOAD
========================================================== */

function renderLatestUpload(){

    contentArea.innerHTML = "";

    const latest =
    [...appData.upload].reverse();

    latest.slice(0,8).forEach(item=>{

        contentArea.innerHTML += `

        <div class="card fade-in">

            <div class="content-card">

                <h3>

                    ${item.Judul || "-"}

                </h3>

                <p>

                    ${item.Editor || "-"}

                </p>

                <div class="content-meta">

                    <span class="meta">

                        ${item.Akun || "-"}

                    </span>

                    <span class="meta">

                        ${item["Tanggal Upload"] || "-"}

                    </span>

                </div>

            </div>

        </div>

        `;

    });

}


/* ==========================================================
   MENU
========================================================== */

function bindMenu(){

    [...sidebarMenu,...bottomMenu].forEach(btn=>{

        btn.addEventListener("click",()=>{

            changePage(
                btn.dataset.page
            );

        });

    });

}


function changePage(page){

    sidebarMenu.forEach(btn=>{

        btn.classList.remove("active");

        if(btn.dataset.page===page){

            btn.classList.add("active");

        }

    });

    bottomMenu.forEach(btn=>{

        btn.classList.remove("active");

        if(btn.dataset.page===page){

            btn.classList.add("active");

        }

    });

    switch(page){

        case "home":

            renderHome();

        break;

        case "onprocess":

            renderOnProcess();

        break;

        case "stock":

            renderStock();

        break;

        case "upload":

            renderUpload();

        break;

        case "booster":

            renderBooster();

        break;

    }

}
/* ==========================================================
   ON PROCESS
========================================================== */

function renderOnProcess() {

    currentPage = "onprocess";

    pageTitle.textContent = "On Process";

    dashboardGrid.innerHTML = "";

    contentArea.innerHTML = "";

    appData.onProcess.forEach(item => {

        contentArea.innerHTML += createContentCard(item);

    });

}


/* ==========================================================
   STOCK
========================================================== */

function renderStock() {

    currentPage = "stock";

    pageTitle.textContent = "Stock";

    dashboardGrid.innerHTML = "";

    contentArea.innerHTML = "";

    appData.stock.forEach(item => {

        contentArea.innerHTML += createContentCard(item);

    });

}


/* ==========================================================
   UPLOAD
========================================================== */

function renderUpload() {

    currentPage = "upload";

    pageTitle.textContent = "Upload";

    dashboardGrid.innerHTML = "";

    contentArea.innerHTML = "";

    appData.upload.forEach(item => {

        contentArea.innerHTML += createUploadCard(item);

    });

}


/* ==========================================================
   BOOSTER
========================================================== */

function renderBooster() {

    currentPage = "booster";

    pageTitle.textContent = "Booster";

    dashboardGrid.innerHTML = "";

    contentArea.innerHTML = "";

    appData.booster.forEach(item => {

        contentArea.innerHTML += createUploadCard(item);

    });

}


/* ==========================================================
   CARD ON PROCESS & STOCK
========================================================== */

function createContentCard(item) {

    return `

    <div class="card fade-in">

        <div class="content-card">

            <h3>${item.Judul || "-"}</h3>

            <p>${item.Editor || "-"}</p>

            <div class="content-meta">

                <span class="meta">
                    ${item.Akun || "-"}
                </span>

                <span class="meta">
                    ${item["Tanggal Edit"] || "-"}
                </span>

            </div>

        </div>

    </div>

    `;

}


/* ==========================================================
   CARD UPLOAD
========================================================== */

function createUploadCard(item) {

    return `

    <div class="card fade-in">

        <div class="content-card">

            <h3>${item.Judul || "-"}</h3>

            <p>

                👤 ${item.Editor || "-"}

            </p>

            <div class="content-meta">

                <span class="badge primary">

                    ${item.Akun || "-"}

                </span>

                <span class="badge success">

                    👁 ${item["Views After"] || 0}

                </span>

                <span class="badge warning">

                    ❤️ ${item["Likes After"] || 0}

                </span>

                <span class="badge danger">

                    💬 ${item["Komentar After"] || 0}

                </span>

            </div>

            ${
                item["Link TikTok"]
                ?

                `

                <a
                    href="${item["Link TikTok"]}"
                    target="_blank"
                    class="meta">

                    🎬 Buka TikTok

                </a>

                `

                :

                ""

            }

        </div>

    </div>

    `;

}


/* ==========================================================
   SEARCH
========================================================== */

function bindSearch() {

    searchInput.addEventListener("input", searchData);

}


function searchData() {

    const keyword =
    searchInput.value.toLowerCase();

    let source = [];

    switch(currentPage){

        case "home":

            renderHome();

            return;

        case "onprocess":

            source = appData.onProcess;

        break;

        case "stock":

            source = appData.stock;

        break;

        case "upload":

            source = appData.upload;

        break;

        case "booster":

            source = appData.booster;

        break;

    }

    const result = source.filter(item =>

        JSON.stringify(item)
        .toLowerCase()
        .includes(keyword)

    );

    contentArea.innerHTML = "";

    result.forEach(item=>{

        if(currentPage==="upload" || currentPage==="booster"){

            contentArea.innerHTML += createUploadCard(item);

        }else{

            contentArea.innerHTML += createContentCard(item);

        }

    });

}
/* ==========================================================
   COUNTER ANIMATION
========================================================== */

function animateCounter() {

    const counters =
    document.querySelectorAll(".counter");

    counters.forEach(counter => {

        const target =
        Number(counter.innerText) || 0;

        let current = 0;

        const increment =
        Math.max(1, Math.ceil(target / 40));

        const timer = setInterval(() => {

            current += increment;

            if (current >= target) {

                current = target;

                clearInterval(timer);

            }

            counter.innerText =
            current.toLocaleString("id-ID");

        }, 20);

    });

}


/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    loading.classList.add("show");

}

function hideLoading() {

    loading.classList.remove("show");

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(message = "") {

    toast.innerText = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* ==========================================================
   RIPPLE EFFECT
========================================================== */

function rippleEffect() {

    document.addEventListener("click", e => {

        const button =
        e.target.closest(".ripple");

        if (!button) return;

        const circle =
        document.createElement("span");

        const size =
        Math.max(button.clientWidth, button.clientHeight);

        const rect =
        button.getBoundingClientRect();

        circle.style.width = size + "px";
        circle.style.height = size + "px";

        circle.style.left =
            e.clientX - rect.left - size / 2 + "px";

        circle.style.top =
            e.clientY - rect.top - size / 2 + "px";

        button.appendChild(circle);

        setTimeout(() => {

            circle.remove();

        }, 600);

    });

}


/* ==========================================================
   FAB
========================================================== */

const fab =
document.getElementById("fab");

if (fab) {

    fab.addEventListener("click", () => {

        showToast("Feature coming soon");

    });

}


/* ==========================================================
   FORMAT NUMBER
========================================================== */

function formatNumber(value) {

    if (!value) return "0";

    return Number(value)
    .toLocaleString("id-ID");

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d)) return date;

    return d.toLocaleDateString("id-ID", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


/* ==========================================================
   EMPTY STATE
========================================================== */

function showEmptyState(message = "Data tidak ditemukan") {

    contentArea.innerHTML = `

        <div class="card fade-in">

            <div class="content-card">

                <h3>📭 Tidak Ada Data</h3>

                <p>${message}</p>

            </div>

        </div>

    `;

}


/* ==========================================================
   REFRESH
========================================================== */

async function refreshData() {

    await loadData();

    showToast("Data berhasil diperbarui");

}


/* ==========================================================
   AUTO REFRESH
========================================================== */

// Refresh setiap 5 menit

setInterval(() => {

    refreshData();

}, 300000);


/* ==========================================================
   SHORTCUT
========================================================== */

document.addEventListener("keydown", e => {

    // Ctrl + R

    if (e.ctrlKey && e.key === "r") {

        e.preventDefault();

        refreshData();

    }

});


/* ==========================================================
   DEBUG
========================================================== */

console.log(
    "%cCBM Social Report",
    "color:#2563eb;font-size:18px;font-weight:bold;"
);

console.log("Application Ready");


/* ==========================================================
   END
========================================================== */
