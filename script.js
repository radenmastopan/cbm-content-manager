const API_URL = "https://script.google.com/macros/s/AKfycbwRevkyAu5WXShxXEVhteQ_c3Bb-u06plEGSZsTNV5NFlanVJK8SCM1YcGY2Lnhk3YxGw/exec";


// Ambil data Google Sheets

async function loadData(){

    try{

        const response = await fetch(API_URL);

        const result = await response.json();


        console.log(result);


        if(result.success){

            updateDashboard(result.data);

        }


    }catch(error){

        console.error(
            "Gagal mengambil data:",
            error
        );

    }

}




function updateDashboard(data){


    let onProcess =
    data.ON_PROCESS?.length || 0;


    let stock =
    data.STOCK?.length || 0;


    let upload =
    data.UPLOAD?.length || 0;


    let booster =
    data.BOOSTER?.length || 0;



    let total =
    onProcess + stock + upload + booster;



    const totalEl =
    document.getElementById("totalKonten");


    const processEl =
    document.getElementById("onProcess");


    const stockEl =
    document.getElementById("stock");


    const uploadEl =
    document.getElementById("upload");



    if(totalEl)
        totalEl.innerText = total;


    if(processEl)
        processEl.innerText = onProcess;


    if(stockEl)
        stockEl.innerText = stock;


    if(uploadEl)
        uploadEl.innerText = upload;



    tampilkanKonten(
        data.STOCK
    );


}





function tampilkanKonten(data){


    const list =
    document.getElementById("contentList");


    if(!list) return;



    list.innerHTML="";



    if(!data || data.length===0){

        list.innerHTML =
        "<p>Belum ada data.</p>";

        return;

    }



    data.slice(0,10)
    .forEach(item=>{


        list.innerHTML += `

        <div class="card">

            <h3>
            ${item["Judul Konten "] || "-"}
            </h3>

            <p>
            👤 Editor:
            ${item["Editor "] || "-"}
            </p>


            <p>
            📌 Status:
            Stock
            </p>


        </div>

        `;


    });


}



loadData();
