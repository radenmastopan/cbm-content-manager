const API_URL = "https://script.google.com/macros/s/AKfycbwRevkyAu5WXShxXEVhteQ_c3Bb-u06plEGSZsTNV5NFlanVJK8SCM1YcGY2Lnhk3YxGw/exec";



// ============================
// LOAD DATA
// ============================

async function loadData(){

    try{


        const response = await fetch(API_URL);


        const result = await response.json();



        console.log("API DATA:", result);



        if(result.success){


            tampilkanHalaman(result.data);


            updateDashboard(result.data);


        }



    }catch(error){


        console.error(
            "ERROR:",
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




// ============================
// DETEKSI HALAMAN
// ============================

function tampilkanHalaman(data){


    let halaman =
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





// ============================
// TAMPIL DATA CARD
// ============================


function tampilkanKonten(data,status){



    const list =
    document.getElementById("contentList");



    if(!list)
    return;



    list.innerHTML="";



    if(!data || data.length===0){


        list.innerHTML =
        "<p>Data tidak ditemukan.</p>";


        return;

    }




    data.forEach(item=>{


        const judul =
        ambil(item,
        [
        "Judul Konten ",
        "Judul Konten"
        ]);



        const editor =
        ambil(item,
        [
        "Editor ",
        "Editor"
        ]);



        const selesai =
        ambil(item,
        [
        "Tanggal Selesai Edit "
        ]);



        const review =
        ambil(item,
        [
        "Tanggal Upload ke Grup Review "
        ]);



        const acc =
        ambil(item,
        [
        "Tanggal ACC konten "
        ]);



        const upload =
        ambil(item,
        [
        "Tanggal Upload Tiktok "
        ]);



        const nominal =
        ambil(item,
        [
        "Nominal Booster"
        ]);



        const viewSebelum =
        ambil(item,
        [
        "Jumlah View & Like Sebelum Booster "
        ]);



        const likeSebelum =
        ambil(item,
        [
        "Like"
        ]);



        const viewSesudah =
        ambil(item,
        [
        "Jumlah View & Like Setelah Booster "
        ]);




        const komentarSebelum =
        ambil(item,
        [
        "Komentar Sebelum Booster"
        ]);



        const komentarSesudah =
        ambil(item,
        [
        "Komentar Setelah Booster"
        ]);




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



        <hr>



        <p>
        ✂️ Selesai Edit:
        ${formatTanggal(selesai)}
        </p>



        <p>
        👥 Review:
        ${formatTanggal(review)}
        </p>



        <p>
        ✅ ACC:
        ${formatTanggal(acc)}
        </p>



        <p>
        🎬 Upload:
        ${formatTanggal(upload)}
        </p>



        ${
        status==="Booster Live"

        ?

        `

        <hr>

        <p>
        💰 Nominal Booster:
        ${nominal}
        </p>


        <p>
        📊 Sebelum Booster:
        ${viewSebelum || "-"} View
        ${likeSebelum || "-"} Like
        ${komentarSebelum || "-"} Komentar
        </p>



        <p>
        🚀 Setelah Booster:
        ${viewSesudah || "-"} View
        ${komentarSesudah || "-"} Komentar
        </p>


        `

        :

        ""

        }


        </div>


        `;



    });



}




// ============================
// AMBIL DATA AMAN
// ============================

function ambil(obj,nama){


    for(let i=0;i<nama.length;i++){


        if(obj[nama[i]] !== undefined
        &&
        obj[nama[i]] !== ""){


            return obj[nama[i]];

        }

    }


    return "-";

}





// ============================
// FORMAT TANGGAL
// ============================

function formatTanggal(tanggal){


    if(!tanggal ||
    tanggal==="-" )
    return "-";



    if(tanggal.includes("T")){


        return tanggal
        .split("T")[0];

    }



    return tanggal;

}





// ============================
// DASHBOARD
// ============================

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


    let el =
    document.getElementById(id);



    if(el){

        el.innerText=value;

    }


}





loadData();
