const API_URL = "https://script.google.com/macros/s/AKfycbzM4JSZ41tolaev4_DiQ9BJP9thOmCEToaAv4TmzEuTsREl9Dtucnlc8BGJSzDeaV-MJQ/exec";


// =========================
// LOAD GOOGLE SHEETS DATA
// =========================

async function loadData(){

    try {

        console.log("Menghubungkan ke Google Sheets...");


        const response = await fetch(API_URL);


        if(!response.ok){

            throw new Error(
                "API Error: " + response.status
            );

        }


        const result = await response.json();


        console.log("Data berhasil:", result);



        if(result.success){

            updateDashboard(result.data);

        }else{

            console.log(result.error);

        }



    }catch(error){

        console.error(
            "Gagal mengambil data:",
            error
        );


        const list = document.getElementById("contentList");


        if(list){

            list.innerHTML =
            "<p>Gagal mengambil data Google Sheets.</p>";

        }

    }

}




// =========================
// UPDATE STATISTIK
// =========================


function updateDashboard(data){


    let process = hitung(data.ON_PROCESS);

    let stock = hitung(data.STOCK);

    let upload = hitung(data.UPLOAD);

    let booster = hitung(data.BOOSTER);



    setValue(
        "totalKonten",
        process + stock + upload + booster
    );


    setValue(
        "onProcess",
        process
    );


    setValue(
        "stock",
        stock
    );


    setValue(
        "upload",
        upload
    );



    tampilkanKonten(data.STOCK);


}




function hitung(data){

    if(!Array.isArray(data)){

        return 0;

    }


    return data.filter(item=>{

        return Object.values(item)
        .some(v=>v !== "");

    }).length;

}




function setValue(id,value){

    const el=document.getElementById(id);

    if(el){

        el.innerText=value;

    }

}




// =========================
// LIST KONTEN
// =========================


function tampilkanKonten(data){


    const list=document.getElementById(
        "contentList"
    );


    if(!list) return;



    list.innerHTML="";



    if(!Array.isArray(data)){

        list.innerHTML =
        "<p>Belum ada data.</p>";

        return;

    }



    let isi=data.filter(item=>{

        return item["Judul Konten "] 
        && item["Judul Konten "].trim() !== "";

    });



    if(isi.length===0){

        list.innerHTML =
        "<p>Belum ada data.</p>";

        return;

    }



    isi.slice(0,10)
    .forEach(item=>{


        list.innerHTML += `

        <div class="card">

            <h3>
            ${item["Judul Konten "]}
            </h3>

            <p>
            👤 Editor:
            ${item["Editor "] || "-"}
            </p>


            <p>
            📅 Selesai Edit:
            ${item["Tanggal Selesai Edit "] || "-"}
            </p>


        </div>

        `;


    });



}




loadData();
