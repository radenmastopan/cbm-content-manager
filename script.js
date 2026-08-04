const API_URL = "https://script.google.com/macros/s/AKfycbz45ypG0d5pwwn-4jXYICcH6kXGVDT4y5s8cxOLsp024SrmV-7Axc3abJdK2DyW8KxpHg/exec";


async function loadData(){

    try{

        const res = await fetch(API_URL);

        const json = await res.json();

        console.log("HASIL API:", json);


        if(!json.success){

            tampilError("API tidak sukses");

            return;

        }


        let page = window.location.pathname;


        if(page.includes("onprocess")){

            showData(json.data.ON_PROCESS);

        }

        else if(page.includes("stock")){

            showData(json.data.STOCK);

        }

        else if(page.includes("upload")){

            showData(json.data.UPLOAD);

        }

        else if(page.includes("booster")){

            showData(json.data.BOOSTER);

        }


    }

    catch(err){

        console.log(err);

        tampilError(
            "Gagal mengambil data"
        );

    }

}





function showData(data){


    const box =
    document.getElementById("contentList");


    if(!box) return;



    box.innerHTML="";



    if(!Array.isArray(data)){

        box.innerHTML =
        `
        <div class="card">
        Data tidak tersedia
        </div>
        `;

        return;

    }



    data.forEach(row=>{


        let isi="";


        Object.keys(row).forEach(key=>{


            if(row[key] !== ""){


                isi += `

                <p>
                <b>${key}</b><br>
                ${row[key]}
                </p>

                `;


            }


        });



        box.innerHTML +=

        `

        <div class="card">

        ${isi}

        </div>

        `;


    });


}





function tampilError(text){


const box =
document.getElementById("contentList");


if(box){

box.innerHTML =
`
<div class="card">
❌ ${text}
</div>
`;

}


}



loadData();
