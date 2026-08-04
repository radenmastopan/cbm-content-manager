const API_URL = "https://script.google.com/macros/s/AKfycbzM4JSZ41tolaev4_DiQ9BJP9thOmCEToaAv4TmzEuTsREl9Dtucnlc8BGJSzDeaV-MJQ/exec";


// ==============================
// AMBIL DATA GOOGLE SHEETS
// ==============================

async function loadData(){

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        console.log("DATA API:", result);


        if(result.success){

            updateDashboard(result.data);

        } else {

            console.log(result.error);

        }


    } catch(error){

        console.log("API ERROR:", error);

    }

}



// ==============================
// UPDATE DASHBOARD
// ==============================

function updateDashboard(data){


    const onProcess = Array.isArray(data.ON_PROCESS)
        ? data.ON_PROCESS.length
        : 0;


    const stock = Array.isArray(data.STOCK)
        ? bersihkanData(data.STOCK).length
        : 0;


    const upload = Array.isArray(data.UPLOAD)
        ? bersihkanData(data.UPLOAD).length
        : 0;



    const total = onProcess + stock + upload;



    const totalEl = document.getElementById("totalKonten");
    const processEl = document.getElementById("onProcess");
    const stockEl = document.getElementById("stock");
    const uploadEl = document.getElementById("upload");



    if(totalEl)
        totalEl.innerText = total;


    if(processEl)
        processEl.innerText = onProcess;


    if(stockEl)
        stockEl.innerText = stock;


    if(uploadEl)
        uploadEl.innerText = upload;



    tampilkanKontenTerbaru(
        data.STOCK
    );


}




// ==============================
// HAPUS BARIS KOSONG
// ==============================

function bersihkanData(data){

    return data.filter(item=>{

        return Object.values(item)
        .some(value => value !== "");

    });

}



// ==============================
// TAMPILKAN LIST KONTEN
// ==============================

function tampilkanKontenTerbaru(data){


    const list = document.getElementById("contentList");


    if(!list) return;



    list.innerHTML = "";



    const konten = bersihkanData(data || []);



    if(konten.length === 0){

        list.innerHTML =
        "<p>Belum ada data.</p>";

        return;

    }



    konten.slice(0,10)
    .forEach(item=>{


        list.innerHTML += `

        <div class="card">

            <h3>
            ${ambil(item,"Judul Konten ")}
            </h3>


            <p>
            👤 Editor:
            ${ambil(item,"Editor ")}
            </p>


            <p>
            📅 Selesai Edit:
            ${formatTanggal(
                ambil(item,"Tanggal Selesai Edit ")
            )}
            </p>


        </div>

        `;


    });


}




// ==============================
// AMBIL DATA KOLOM
// ==============================

function ambil(obj,nama){

    return obj[nama] || "-";

}




// ==============================
// FORMAT TANGGAL
// ==============================

function formatTanggal(tanggal){


    if(!tanggal)
        return "-";


    let date = new Date(tanggal);


    if(isNaN(date))
        return tanggal;



    return date.toLocaleDateString("id-ID");

}




// JALANKAN SAAT WEBSITE DIBUKA

loadData();
