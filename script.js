const API_URL = "https://script.google.com/macros/s/AKfycbwRevkyAu5WXShxXEVhteQ_c3Bb-u06plEGSZsTNV5NFlanVJK8SCM1YcGY2Lnhk3YxGw/exec";


// ===============================
// AMBIL DATA GOOGLE SHEET
// ===============================

async function loadData(){

    try {

        const response = await fetch(API_URL);

        const result = await response.json();


        console.log("DATA API:", result);



        if(result.success){

            tampilkanHalaman(result.data);

            updateDashboard(result.data);

        }


    } catch(error){

        console.error(
            "Gagal mengambil data:",
            error
        );


        const list =
        document.getElementById("contentList");


        if(list){

            list.innerHTML =
            "<p>Gagal mengambil data.</p>";

        }

    }

}



// ===============================
// TENTUKAN HALAMAN
// ===============================

function tampilkanHalaman(data){


    const path =
    window.location.pathname;



    if(path.includes("onprocess")){


        tampilkanKonten(
            data.ON_PROCESS,
            "On Process"
        );


    }


    else if(path.includes("stock")){


        tampilkanKonten(
            data.STOCK,
            "Stock"
        );


    }


    else if(path.includes("upload")){


        tampilkanKonten(
            data.UPLOAD,
            "Terupload"
        );


    }


    else if(path.includes("booster")){


        tampilkanKonten(
            data.BOOSTER,
            "Booster"
        );


    }



}




// ===============================
// TAMPILKAN CARD KONTEN
// ===============================

function tampilkanKonten(data, status){


    const list =
    document.getElementById("contentList");


    if(!list) return;



    list.innerHTML="";



    if(!data || data.length===0){


        list.innerHTML =
        "<p>Tidak ada data.</p>";


        return;

    }



    data.forEach(item=>{


        let judul =
        item["Judul Konten "] ||
        item["Judul Konten"] ||
        "-";



        let editor =
        item["Editor "] ||
        item["Editor"] ||
        "-";



        list.innerHTML += `

        <div class="card">

            <h3>
            ${judul}
            </h3>


            <p>
            📌 Status:
            ${status}
            </p>


            <p>
            👤 Editor:
            ${editor}
            </p>


        </div>

        `;


    });


}





// ===============================
// DASHBOARD
// ===============================

function updateDashboard(data){


    setText(
        "totalKonten",
        jumlah(data.ON_PROCESS)
        +
        jumlah(data.STOCK)
        +
        jumlah(data.UPLOAD)
    );



    setText(
        "onProcess",
        jumlah(data.ON_PROCESS)
    );


    setText(
        "stock",
        jumlah(data.STOCK)
    );


    setText(
        "upload",
        jumlah(data.UPLOAD)
    );


}



function jumlah(data){

    if(!Array.isArray(data))
        return 0;


    return data.filter(row=>{

        return Object.values(row)
        .some(value=>value !== "");

    }).length;

}



function setText(id,value){

    const el =
    document.getElementById(id);


    if(el){

        el.innerText=value;

    }

}




loadData();
