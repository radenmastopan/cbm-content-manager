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
