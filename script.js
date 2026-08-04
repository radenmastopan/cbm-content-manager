const API_URL = "https://script.google.com/macros/s/AKfycbySzpw6mLo9SZBl0LOB7ANx1mxHQ1feFht-aH9hfs7xWnQ0fGwDpDw0GmPwiv_ieD4B6A/exec";


// ==============================
// AMBIL DATA DARI GOOGLE SHEET
// ==============================

async function loadData(){

    try{

        const response = await fetch(API_URL);

        const result = await response.json();


        console.log("DATA GOOGLE SHEET:", result);



        if(result.success){

            tampilkanSesuaiHalaman(result.data);

            updateDashboard(result.data);

        }



    }catch(error){

        console.error(error);


        const list =
        document.getElementById("contentList");


        if(list){

            list.innerHTML =
            "<p>Gagal mengambil data.</p>";

        }

    }

}



// ==============================
// PILIH DATA SESUAI HALAMAN
// ==============================

function tampilkanSesuaiHalaman(data){


    const halaman =
    window.location.pathname;



    if(halaman.includes("onprocess")){


        tampilkanKonten(
            data.ON_PROCESS,
            "On Process"
        );


    }


    else if(halaman.includes("stock")){


        tampilkanKonten(
            data.STOCK,
            "Stock"
        );


    }


    else if(halaman.includes("upload")){


        tampilkanKonten(
            data.UPLOAD,
            "Terupload"
        );


    }


    else if(halaman.includes("booster")){


        tampilkanKonten(
            data.BOOSTER,
            "Booster Live"
        );


    }


}




// ==============================
// TAMPIL CARD KONTEN
// ==============================

function tampilkanKonten(data,status){


    const list =
    document.getElementById("contentList");


    if(!list) return;



    list.innerHTML="";



    if(!data || data.length === 0){

        list.innerHTML =
        "<p>Belum ada data.</p>";

        return;

    }



    data.forEach(item=>{


        const judul =
        getData(item,
        [
            "Judul Konten",
            "Judul Konten "
        ]);



        let html = `

        <div class="card">

        <h3>
        ${judul}
        </h3>


        <p>
        📌 Status:
        ${status}
        </p>

        `;



        if(status !== "Booster Live"){


            html += `

            <p>
            ✂️ Selesai Edit:
            ${formatTanggal(
            getData(item,
            [
            "Tanggal Selesai Edit"
            ]))}
            </p>


            <p>
            👥 Review:
            ${formatTanggal(
            getData(item,
            [
            "Tanggal Upload ke Grup Review"
            ]))}
            </p>


            <p>
            ✅ ACC:
            ${formatTanggal(
            getData(item,
            [
            "Tanggal ACC konten"
            ]))}
            </p>


            <p>
            🎬 Upload:
            ${formatTanggal(
            getData(item,
            [
            "Tanggal Upload Tiktok"
            ]))}
            </p>


            <p>
            👤 Editor:
            ${getData(item,
            [
            "Editor"
            ])}
            </p>


            `;


        }



        if(status === "Booster Live"){


            html += `


            <p>
            💰 Nominal Booster:
            ${getData(item,
            [
            "Nominal Booster"
            ])}
            </p>



            <p>
            📊 Sebelum Booster:
            ${getData(item,
            [
            "Jumlah View & Like Sebelum Booster"
            ])}
            View
            </p>



            <p>
            ❤️ Like Sebelum:
            ${getData(item,
            [
            "Like"
            ])}
            </p>



            <p>
            🚀 Setelah Booster:
            ${getData(item,
            [
            "Jumlah View & Like Setelah Booster"
            ])}
            </p>


            `;

        }



        html += `

        </div>

        `;



        list.innerHTML += html;


    });



}





// ==============================
// AMBIL VALUE AMAN
// ==============================

function getData(obj,nama){


    for(let key of nama){


        if(obj[key] !== undefined &&
        obj[key] !== ""){


            return obj[key];


        }

    }


    return "-";

}





// ==============================
// FORMAT TANGGAL
// ==============================

function formatTanggal(value){


    if(!value || value === "-")
    return "-";



    if(value.includes("T")){


        return value
        .split("T")[0];


    }



    return value;

}





// ==============================
// DASHBOARD
// ==============================

function updateDashboard(data){



    setText(
    "onProcess",
    data.ON_PROCESS?.length || 0
    );


    setText(
    "stock",
    data.STOCK?.length || 0
    );


    setText(
    "upload",
    data.UPLOAD?.length || 0
    );


}




function setText(id,value){


    const el =
    document.getElementById(id);


    if(el){

        el.innerText=value;

    }

}




loadData();
