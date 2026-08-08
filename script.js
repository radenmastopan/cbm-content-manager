const API_URL = "https://script.google.com/macros/s/AKfycbxO0mk7oMI9hF__zieQyVV5icjJ6IxtcUyD2881tQe0_Q4VQvbQltKyFvlziPvyiTHilg/exec";

let appData = { onProcess: [], stock: [], upload: [], boosterLive: [] };
let currentPage = "home";
let searchTerm = "";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

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
        const response = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store", redirect: "follow" });
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
        console.error(error);
        renderError("Gagal mengambil data Google Sheets. Pastikan Web App Apps Script sudah di-deploy sebagai Anyone.");
        showToast("Gagal mengambil data");
    } finally {
        showLoading(false);
    }
}

function bindNavigation() {
    $$('[data-page]').forEach(button => button.addEventListener("click", () => {
        currentPage = button.dataset.page || "home";
        setActiveNavigation();
        renderPage(currentPage);
    }));
}

function setActiveNavigation() {
    $$('.menu-item, .bottom-item').forEach(button => button.classList.toggle("active", button.dataset.page === currentPage));
}

function bindSearch() {
    const input = $("#searchInput");
    if (!input) return;
    input.addEventListener("input", e => {
        searchTerm = e.target.value.trim().toLowerCase();
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
    const titles = { home:"Dashboard", onprocess:"On Process", stock:"Stock Konten", upload:"Konten Terupload", booster:"Booster Live" };
    title.textContent = titles[page] || "Dashboard";
    grid.innerHTML = "";
    content.innerHTML = "";
    if (page === "home") return renderHome();
    const source = page === "onprocess" ? appData.onProcess : page === "stock" ? appData.stock : page === "upload" ? appData.upload : appData.boosterLive;
    renderSection(source, page);
}

function renderHome() {
    const grid = $("#dashboardGrid"), content = $("#contentArea");
    const stats = [["On Process",appData.onProcess.length,"fa-pen-to-square","onprocess"],["Stock",appData.stock.length,"fa-box","stock"],["Upload",appData.upload.length,"fa-film","upload"],["Booster Live",appData.boosterLive.length,"fa-rocket","booster"]];
    grid.innerHTML = stats.map(([label,n,icon,page]) => `<button class="card stat-card ripple" data-page="${page}" type="button"><div class="card-header"><h3>${escapeHtml(label)}</h3><span><i class="fa-solid ${icon}"></i></span></div><div class="card-body"><strong class="stat-number">${n}</strong></div></button>`).join("");
    $$("#dashboardGrid [data-page]").forEach(b => b.addEventListener("click", () => { currentPage=b.dataset.page; setActiveNavigation(); renderPage(currentPage); }));
    const latest = filterData(appData.upload).slice(-6).reverse();
    content.innerHTML = `<div class="section-heading"><div><h2>Konten Terbaru</h2><p>${latest.length} konten terakhir</p></div></div><div class="card-grid">${latest.length ? latest.map(createUploadCard).join("") : emptyState("Belum ada data upload.")}</div>`;
}

function renderSection(data,type) {
    const filtered = filterData(data), content=$("#contentArea");
    content.innerHTML = `<div class="section-heading"><div><h2>${escapeHtml(sectionName(type))}</h2><p>${filtered.length} data</p></div></div><div class="card-grid">${filtered.length ? filtered.map(item=>createCard(item,type)).join("") : emptyState("Tidak ada data yang ditemukan.")}</div>`;
}

function createCard(item,type) {
    if(type==="onprocess") return createOnProcessCard(item);
    if(type==="stock") return createStockCard(item);
    if(type==="upload") return createUploadCard(item);
    return createBoosterCard(item);
}

function createOnProcessCard(item) {
    return cardTemplate(value(item,"judul","onprocess"), `${field("Editor",value(item,"editor","onprocess"))}${field("Bahan mentah diterima",value(item,"bahan","onprocess"))}${field("Mulai edit",value(item,"mulaiEdit","onprocess"))}${field("Konten jadi",value(item,"jadiKonten","onprocess"))}${field("Upload grup review",value(item,"uploadReview","onprocess"))}${field("Tanggal ACC",value(item,"acc","onprocess"))}${field("Status",value(item,"status","onprocess"))}${field("Keterangan",value(item,"keterangan","onprocess"))}`);
}

function createStockCard(item) {
    return cardTemplate(value(item,"judul","stock"), `${field("Akun TikTok",value(item,"akun","stock"))}${field("Editor",value(item,"editor","stock"))}${field("Selesai edit",value(item,"selesaiEdit","stock"))}${field("Upload grup review",value(item,"uploadReview","stock"))}${field("Tanggal ACC",value(item,"acc","stock"))}${field("Penjadwalan",value(item,"jadwal","stock"))}${field("Keterangan",value(item,"keterangan","stock"))}${linkHtml(value(item,"link","stock"))}`);
}

function createUploadCard(item) {
    const vb=value(item,"viewsBefore","upload"), va=value(item,"viewsAfter","upload"), lb=value(item,"likesBefore","upload"), la=value(item,"likesAfter","upload");
    return cardTemplate(value(item,"judul","upload"), `${field("Akun TikTok",value(item,"akun","upload"))}${field("Editor",value(item,"editor","upload"))}${field("Tanggal Upload TikTok",value(item,"uploadTikTok","upload"))}${field("Tanggal ACC",value(item,"acc","upload"))}${field("Booster",value(item,"jenisBooster","upload") || "Tanpa Booster")}${field("Nominal Booster",value(item,"nominalBooster","upload"))}${field("Asal Dana",value(item,"asalDana","upload"))}${metricHtml("Views",vb,va)}${metricHtml("Likes",lb,la)}${linkHtml(value(item,"link","upload"))}`);
}

function createBoosterCard(item) {
    return cardTemplate(value(item,"cabang","booster") || "Booster Live", `${field("Tanggal Booster",value(item,"tanggal","booster"))}${field("Asal biaya",value(item,"asalBiaya","booster"))}${field("Budget",value(item,"budget","booster"))}${field("Host Live",value(item,"host","booster"))}`);
}

function cardTemplate(title,body) {
    return `<article class="card ripple"><div class="card-header"><h3>${escapeHtml(title || "Tanpa Judul")}</h3><span><i class="fa-solid fa-chart-simple"></i></span></div><div class="card-body">${body}</div></article>`;
}

function field(label,val) { return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(val || "-")}</p>`; }
function metricHtml(label,before,after) { if(!before&&!after) return ""; return `<p><b>${escapeHtml(label)}</b><br>${escapeHtml(before||"-")} <span aria-hidden="true">→</span> ${escapeHtml(after||"-")}</p>`; }

/*
   The API may return either objects (normal Apps Script response) or arrays
   (older deployments). This reader supports both formats so the UI does not
   depend on exact header spelling.
*/
function value(item,type,sheet) {
    const aliases = {
        judul:["judulkonten","judul","namakonten","title"],
        editor:["editor"],
        akun:["akuntiktok","akun"],
        bahan:["tanggalbahanmentahditerima"],
        mulaiEdit:["tanggalmulaiedit"],
        jadiKonten:["tanggaljadikonten"],
        uploadReview:["tanggaluploadkegrupreview"],
        acc:["tanggalacckonten","tanggalacc"],
        status:["status"],
        keterangan:["keterangan","keterengan"],
        selesaiEdit:["tanggalselesaiEdit","tanggalselesai"] ,
        jadwal:["penjadwalankontenupload"],
        link:["linkkonten","link"],
        uploadTikTok:["tanggaluploadtiktok"],
        jenisBooster:["jenisbooster","booster"],
        nominalBooster:["nominalbooster"],
        asalDana:["asaldanabooster","asaldana"],
        viewsBefore:["jumlahviewlikesebelumboosterview","viewsbefore","viewbefore"],
        viewsAfter:["jumlahviewliksetelahboosterview","jumlahviewlikesetelahboosterview","viewsafter","viewafter"],
        likesBefore:["jumlahviewlikesebelumboosterlike","likesbefore","likebefore"],
        likesAfter:["jumlahviewliksetelahboosterlike","jumlahviewlikesetelahboosterlike","likesafter","likeafter"],
        cabang:["cabangyangdibooster","cabang"],
        tanggal:["tanggalbooster"],
        asalBiaya:["asalbiayabooster","asalbiaya"],
        budget:["budgetbooster","budget"],
        host:["hostlive","host"]
    };
    const wanted=aliases[type]||[type];
    if(item && typeof item === "object" && !Array.isArray(item)) {
        const entries=Object.entries(item).filter(([,v])=>v!==null&&v!==undefined&&String(v).trim()!=="");
        for(const [key,raw] of entries) {
            const k=normalizeKey(key);
            if(wanted.some(a=>k===a)) return String(raw).trim();
        }
        for(const [key,raw] of entries) {
            const k=normalizeKey(key);
            if(wanted.some(a=>k.includes(a)||a.includes(k))) return String(raw).trim();
        }
        const positional=objectValues(item);
        const idx=indexFor(sheet,type);
        if(idx>=0 && positional[idx]!==undefined && String(positional[idx]).trim()!=="") return String(positional[idx]).trim();
    }
    if(Array.isArray(item)) {
        const idx=indexFor(sheet,type);
        if(idx>=0 && item[idx]!==undefined && String(item[idx]).trim()!=="") return String(item[idx]).trim();
    }
    return "";
}

function objectValues(item) { return Object.keys(item).sort((a,b)=>numericKey(a)-numericKey(b)).map(k=>item[k]); }
function numericKey(k) { return /^\d+$/.test(k) ? Number(k) : 999999; }

function indexFor(sheet,type) {
    const maps={
        onprocess:{judul:1,bahan:2,mulaiEdit:3,jadiKonten:4,editor:5,uploadReview:6,acc:7,status:8,keterangan:9},
        stock:{judul:1,selesaiEdit:2,uploadReview:3,acc:4,akun:5,editor:6,jadwal:7,keterangan:8,link:9},
        upload:{judul:1,selesaiEdit:2,uploadReview:3,acc:4,akun:5,uploadTikTok:6,editor:7,jenisBooster:8,nominalBooster:9,asalDana:10,viewsBefore:13,likesBefore:14,viewsAfter:15,likesAfter:16,link:17},
        booster:{cabang:1,tanggal:2,asalBiaya:3,budget:4,host:5}
    };
    return maps[sheet]?.[type] ?? -1;
}

function normalizeKey(k) { return String(k||"").toLowerCase().replace(/[^a-z0-9]/g,""); }
function linkHtml(url) { return url && /^https?:\/\//i.test(url) ? `<p><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Buka Konten <i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>` : ""; }
function filterData(data) { if(!searchTerm) return data; return data.filter(item=>Object.values(item||{}).some(v=>String(v??"").toLowerCase().includes(searchTerm))); }
function sectionName(type) { return {onprocess:"Konten On Process",stock:"Stock Konten",upload:"Konten Terupload",booster:"Booster Live"}[type]||"Dashboard"; }
function emptyState(message) { return `<div class="card empty-state"><h3>${escapeHtml(message)}</h3></div>`; }
function renderError(message) { const g=$("#dashboardGrid"),c=$("#contentArea"); if(g)g.innerHTML=""; if(c)c.innerHTML=emptyState(message); }
function showLoading(show) { const e=$("#loading"); if(e)e.style.display=show?"flex":"none"; }
function showToast(message) { const e=$("#toast"); if(!e)return; e.textContent=message;e.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>e.classList.remove("show"),3000); }

function openAddModal() {
    if($("#cbmAddModal")){ $("#cbmAddModal").classList.add("show"); return; }
    const sheet=currentPage==="onprocess"?"onProcess":currentPage==="stock"?"stock":currentPage==="upload"?"upload":currentPage==="booster"?"boosterLive":"upload";
    const modal=document.createElement("div"); modal.id="cbmAddModal";
    modal.innerHTML=`<div class="cbm-modal-backdrop"></div><div class="cbm-modal" role="dialog" aria-modal="true"><div class="cbm-modal-head"><div><h2>Tambah Data</h2><p>${escapeHtml(sectionName(currentPage==="home"?"upload":currentPage))}</p></div><button type="button" class="cbm-close" id="cbmCloseModal">×</button></div><form id="cbmAddForm" class="cbm-form"><input type="hidden" name="sheet" value="${sheet}">${addFieldsForPage(sheet)}<button class="cbm-submit" type="submit"><i class="fa-solid fa-plus"></i> Tambahkan</button></form></div>`;
    document.body.appendChild(modal); addModalStyles();
    $("#cbmCloseModal").addEventListener("click",closeAddModal); modal.querySelector(".cbm-modal-backdrop").addEventListener("click",closeAddModal); $("#cbmAddForm").addEventListener("submit",submitAddForm); requestAnimationFrame(()=>modal.classList.add("show"));
}

function addFieldsForPage(page) {
    if(page==="onProcess") return inputField("Judul Konten","judulKonten",true)+inputField("Editor","editor")+inputField("Tanggal Bahan Mentah diterima","tanggalBahanMentahDiterima",false,"date")+inputField("Tanggal Mulai Edit","tanggalMulaiEdit",false,"date")+inputField("Status","status")+inputField("Keterangan","keterangan");
    if(page==="stock") return inputField("Judul Konten","judulKonten",true)+inputField("Akun TikTok","akunTiktok")+inputField("Editor","editor")+inputField("Tanggal Selesai Edit","tanggalSelesaiEdit",false,"date")+inputField("Tanggal Upload ke Grup Review","tanggalUploadKeGrupReview",false,"date")+inputField("Penjadwalan Konten Upload","penjadwalanKontenUpload",false,"date")+inputField("Link Konten","linkKonten");
    if(page==="boosterLive") return inputField("Cabang yang di Booster","cabangYangDiBooster",true)+inputField("Tanggal Booster","tanggalBooster",false,"date")+inputField("Asal Biaya Booster","asalBiayaBooster")+inputField("Budget Booster","budgetBooster")+inputField("Host Live","hostLive");
    return inputField("Judul Konten","judulKonten",true)+inputField("Akun TikTok","akunTiktok")+inputField("Tanggal Upload TikTok","tanggalUploadTiktok",false,"date")+inputField("Editor","editor")+inputField("Jenis Booster","jenisBooster")+inputField("Nominal Booster","nominalBooster")+inputField("Asal Dana Booster","asalDanaBooster")+inputField("Views Sebelum Booster","viewsBefore")+inputField("Likes Sebelum Booster","likesBefore")+inputField("Views Setelah Booster","viewsAfter")+inputField("Likes Setelah Booster","likesAfter")+inputField("Link Konten","linkKonten");
}
function inputField(label,name,required=false,type="text") { return `<label class="cbm-field"><span>${escapeHtml(label)}${required?" *":""}</span><input name="${escapeAttribute(name)}" type="${type}" ${required?"required":""}></label>`; }

async function submitAddForm(event) {
    event.preventDefault(); const form=event.currentTarget,button=form.querySelector("button[type=submit]"),fd=new FormData(form),payload={action:"add",sheet:fd.get("sheet"),data:{}};
    fd.forEach((v,k)=>{if(k!=="sheet"&&String(v).trim()!=="")payload.data[k]=String(v).trim();});
    button.disabled=true;button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    try{const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});const text=await response.text();let result={};try{result=JSON.parse(text)}catch(_){}if(!response.ok||result.success===false)throw new Error(result.message||`HTTP ${response.status}`);closeAddModal();showToast("Data berhasil ditambahkan");await loadData();}catch(error){console.error(error);showToast("Belum tersimpan. Apps Script perlu mendukung POST.");}finally{button.disabled=false;button.innerHTML='<i class="fa-solid fa-plus"></i> Tambahkan';}
}
function closeAddModal(){const modal=$("#cbmAddModal");if(!modal)return;modal.classList.remove("show");setTimeout(()=>modal.remove(),180);}

function addModalStyles(){
    if($("#cbmModalStyles"))return; const style=document.createElement("style");style.id="cbmModalStyles";style.textContent=`#cbmAddModal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s ease}#cbmAddModal.show{opacity:1}.cbm-modal-backdrop{position:absolute;inset:0;background:rgba(10,18,35,.45);backdrop-filter:blur(6px)}.cbm-modal{position:relative;width:min(560px,calc(100% - 28px));max-height:88vh;overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.2);transform:translateY(12px);transition:transform .18s ease}#cbmAddModal.show .cbm-modal{transform:translateY(0)}.cbm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.cbm-modal-head h2{margin:0 0 4px;font-size:22px}.cbm-modal-head p{margin:0;opacity:.65}.cbm-close{border:0;background:#f1f4f8;border-radius:12px;width:38px;height:38px;font-size:25px;cursor:pointer}.cbm-form{display:grid;gap:13px}.cbm-field{display:grid;gap:7px}.cbm-field span{font-weight:600;font-size:13px}.cbm-field input{width:100%;box-sizing:border-box;border:1px solid #dfe5ed;border-radius:12px;padding:12px 13px;font:inherit;outline:none;background:#fbfcfe}.cbm-field input:focus{border-color:#2f6df6;box-shadow:0 0 0 3px rgba(47,109,246,.12)}.cbm-submit{border:0;border-radius:13px;padding:13px 16px;background:#2868ee;color:#fff;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;margin-top:4px}.cbm-submit:disabled{opacity:.6;cursor:wait}@media(max-width:600px){.cbm-modal{padding:18px;border-radius:18px;max-height:84vh}.cbm-modal-head h2{font-size:20px}}`;document.head.appendChild(style);
}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function escapeAttribute(value){return escapeHtml(value);}
