const API_URL = "https://script.google.com/macros/s/AKfycbzM4JSZ41tolaev4_DiQ9BJP9thOmCEToaAv4TmzEuTsREl9Dtucnlc8BGJSzDeaV-MJQ/exec";


// Ambil data dari Google Sheets

async function loadData(){

    try{

        const response = await fetch(API_URL);

        const result = await response.json();


        console.log(result);


        if(result.success){

            tampilkanDashboard(result.data);

        }


    }catch(error){

        console.log("Gagal mengambil data:", error);

    }

}




function tampilkanDashboard(data){


    // Hitung jumlah konten

    let onProcess = data.ON_PROCESS.length || 0;

    let stock = data.STOCK.length || 0;

    let upload = data.UPLOAD.length || 0;



    let total = onProcess + stock + upload;



    document.getElementById("totalKonten").innerText = total;

    document.getElementById("onProcess").innerText = onProcess;

    document.getElementById("stock").innerText = stock;

    document.getElementById("upload").innerText = upload;



    tampilkanList(data.STOCK);

}




function tampilkanList(items){


    const list = document.getElementById("contentList");


    if(!list) return;


    list.innerHTML="";



    if(items.length===0){

        list.innerHTML="<p>Belum ada data.</p>";

        return;

    }



    items.slice(0,10).forEach(item=>{


        list.innerHTML += `

        <div class="card">

            <h3>
            ${item["Judul Konten "] || "-"}
            </h3>


            <p>
            Editor:
            ${item["Editor "] || "-"}
            </p>


            <p>
            Status:
            Stock
            </p>


        </div>

        `;


    });


}





loadData();
