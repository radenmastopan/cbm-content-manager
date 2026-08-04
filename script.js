const API_URL = "https://script.google.com/macros/s/AKfycbwtoUQAPS1Trbt69ZranpTkm3R7NA_cmu2YTeh5_hUMe7GijgarvFLs8D0Ye1deXldzjA/exec";


// ===============================
// AMBIL DATA
// ===============================

async function loadContent(){


    const container =
    document.getElementById("contentList");


    if(!container) return;



    try{


        const response =
        await fetch(API_URL);



        const result =
        await response.json();



        console.log(result);



        if(!result.success){

            throw new Error(
                "API gagal"
            );

        }




        const page =
        window.location.pathname;



        let data=[];



        if(page.includes("onprocess")){

            data =
            result.data.ON_PROCESS;

        }



        else if(page.includes("stock")){

            data =
            result.data.STOCK;

        }



        else if(page.includes("upload")){

            data =
            result.data.UPLOAD;

        }



        else if(page.includes("booster")){

            data =
            result.data.BOOSTER;

        }




        renderContent(
            data,
            container
        );



    }

    catch(error){


        console.error(error);


        container.innerHTML = `

        <div class="card">

        ❌ Gagal mengambil data

        </div>

        `;


    }



}







// ===============================
// TAMPILKAN DATA
// ===============================


function renderContent(data,container){



    container.innerHTML="";



    if(!data || data.length===0){


        container.innerHTML=

        `

        <div class="card">

        Data tidak ditemukan

        </div>

        `;


        return;

    }




    data.forEach(item=>{


        let html = `

        <div class="card content-card">

        `;




        Object.keys(item).forEach(key=>{


            let value =
            item[key];



            if(value!=="" && value!==null){


                html += `


                <div class="row">


                <span class="label">

                ${key}

                </span>



                <span class="value">

                ${formatValue(value)}

                </span>



                </div>


                `;


            }



        });





        html += `

        </div>

        `;



        container.innerHTML += html;



    });



}







// ===============================
// FORMAT DATA
// ===============================


function formatValue(value){



    if(typeof value === "string"){



        // format tanggal ISO

        if(value.includes("T")){


            return value
            .split("T")[0];


        }


    }




    return value;



}






// ===============================
// JALANKAN
// ===============================

loadContent();
