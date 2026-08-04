const API_URL = "https://script.google.com/macros/s/AKfycbwtoUQAPS1Trbt69ZranpTkm3R7NA_cmu2YTeh5_hUMe7GijgarvFLs8D0Ye1deXldzjA/exec";


fetch(API_URL)
.then(response => response.json())
.then(result => {


    console.log(result);


    let page = window.location.pathname;


    let data = [];



    if(page.includes("onprocess")){
        data = result.data.ON_PROCESS;
    }


    else if(page.includes("stock")){
        data = result.data.STOCK;
    }


    else if(page.includes("upload")){
        data = result.data.UPLOAD;
    }


    else if(page.includes("booster")){
        data = result.data.BOOSTER;
    }



    const box = document.getElementById("contentList");


    box.innerHTML = "";



    data.forEach(item=>{


        box.innerHTML += `

        <div class="card">

        <h3>
        ${item["Judul Konten"] || "-"}
        </h3>


        <p>
        Editor:
        ${item["Editor"] || "-"}
        </p>


        <p>
        Tanggal:
        ${item["Tanggal Selesai Edit"] || "-"}
        </p>


        </div>

        `;


    });



})
.catch(error=>{

console.log(error);

document.getElementById("contentList").innerHTML =
"❌ Gagal mengambil data";

});
