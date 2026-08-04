const API_URL = "https://script.google.com/macros/s/AKfycbz45ypG0d5pwwn-4jXYICcH6kXGVDT4y5s8cxOLsp024SrmV-7Axc3abJdK2DyW8KxpHg/exec";


// ===============================
// LOAD GOOGLE SHEET DATA
// ===============================

async function loadData(){

    try{

        const response = await fetch(API_URL);

        const json = await response.json();

        console.log("DATA:", json);


        if(json.success){

            const data = json.data;

            const page = window.location.pathname;


            if(page.includes("onprocess")){

                renderData(
                    data.ON_PROCESS,
                    "ON_PROCESS"
                );

            }


            else if(page.includes("stock")){

                renderData(
                    data.STOCK,
                    "STOCK"
                );

            }


            else if(page.includes("upload")){

                renderData(
                    data.UPLOAD,
                    "UPLOAD"
                );

            }


            else if(page.includes("booster")){

                renderData(
                    data.BOOSTER,
                    "BOOSTER"
                );

            }

        }


    }
    catch(error){

        console.log(error);

        document.getElementById("contentList").innerHTML =
        `
        <div class="card">
        ❌ Gagal mengambil data
        </div>
        `;

    }

}





// ===============================
// RENDER CARD
// ===============================

function renderData(data,type){


    const container =
    document.getElementById("contentList");


    if(!container) return;



    container.innerHTML="";



    if(!Array.isArray(data) || data.length===0){


        container.innerHTML =
        `
        <div class="card">
        Data tidak ditemukan
        </div>
        `;


        return;

    }




    data.forEach(item=>{


        let card = "";



        if(type==="ON_PROCESS"){


            card = `

            <div class="card">

            <h3>
            ${ambil(item,"Judul Konten")}
            </h3>


            <p>📌 No : ${ambil(item,"No")}</p>


            <p>📅 Tanggal Bahan :
            ${tanggal(ambil(item,"Tanggal Bahan"))}
            </p>


            <p>✂️ Selesai Edit :
            ${tanggal(ambil(item,"Tanggal Selesai Edit"))}
            </p>


            <p>👥 Review :
            ${tanggal(ambil(item,"Tanggal Upload ke Grup Review"))}
            </p>


            <p>✅ ACC :
            ${tanggal(ambil(item,"Tanggal ACC konten"))}
            </p>


            <p>📱 Akun :
            ${ambil(item,"Akun Tiktok")}
            </p>


            <p>🎨 Editor :
            ${ambil(item,"Editor")}
            </p>


            <p>📝 Keterangan :
            ${ambil(item,"Keterangan")}
            </p>


            </div>

            `;


        }






        if(type==="STOCK"){


            card = `

            <div class="card">


            <h3>
            ${ambil(item,"Judul Konten")}
            </h3>


            <p>✂️ Selesai Edit :
            ${tanggal(ambil(item,"Tanggal Selesai Edit"))}
            </p>


            <p>👥 Review :
            ${tanggal(ambil(item,"Tanggal Upload ke Grup Review"))}
            </p>


            <p>✅ ACC :
            ${tanggal(ambil(item,"Tanggal ACC konten"))}
            </p>


            <p>🎨 Editor :
            ${ambil(item,"Editor")}
            </p>


            <p>📱 Akun :
            ${ambil(item,"Akun Tiktok")}
            </p>


            <p>
            📝 ${ambil(item,"Keterangan")}
            </p>


            </div>

            `;


        }






        if(type==="UPLOAD"){


            card = `


            <div class="card">


            <h3>
            ${ambil(item,"Judul Konten")}
            </h3>



            <p>
            📅 Upload TikTok :
            ${tanggal(
            ambil(item,"Tanggal Upload Tiktok")
            )}
            </p>



            <p>
            🎨 Editor :
            ${ambil(item,"Editor")}
            </p>



            <p>
            🚀 Jenis Booster :
            ${ambil(item,"Jenis Booster")}
            </p>



            <p>
            💰 Nominal Booster :
            ${rupiah(
            ambil(item,"Nominal Booster")
            )}
            </p>



            <p>
            👁️ View Sebelum :
            ${ambil(item,"Jumlah View Sebelum Booster")}
            </p>



            <p>
            ❤️ Like Sebelum :
            ${ambil(item,"Jumlah Like Sebelum Booster")}
            </p>



            <p>
            🚀 View Setelah :
            ${ambil(item,"Jumlah View Setelah Booster")}
            </p>



            <p>
            ❤️ Like Setelah :
            ${ambil(item,"Jumlah Like Setelah Booster")}
            </p>


            <p>
            🔗 Link :
            ${ambil(item,"Link Konten")}
            </p>


            </div>


            `;


        }








        if(type==="BOOSTER"){


            card = `


            <div class="card">


            <h3>
            ${ambil(item,"Judul Konten")}
            </h3>



            <h4>
            🚀 Data Booster
            </h4>



            <p>
            Jenis Booster :
            ${ambil(item,"Jenis Booster")}
            </p>



            <p>
            💰 Nominal :
            ${rupiah(
            ambil(item,"
