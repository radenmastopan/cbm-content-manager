/*************************************************
 CBM SOCIAL REPORT
 Frontend Controller
*************************************************/


const API_URL =
"https://script.google.com/macros/s/AKfycbzqkMeq70pXCoZPKAlqHBlCVVgXPoPQpbiesSigkMQacH6cZNpUHC57jPa2cNUovX8nQ/exec";


let dataStore = {

    onProcess: [],
    stock: [],
    upload: [],
    boosterLive: []

};


let currentPage = "home";



document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadData();

        setupNavigation();

        setupSearch();

    }
);





/*
====================================
 FETCH DATA
====================================
*/


async function loadData(){


    showLoading();


    try {


        const res =
            await fetch(API_URL);



        dataStore =
            await res.json();



        renderPage("home");



    } catch(error){


        console.error(
            "API Error:",
            error
        );


        showToast(
            "Gagal mengambil data"
        );


    }


    hideLoading();


}







/*
====================================
 NAVIGATION
====================================
*/


function setupNavigation(){


    const buttons =
    document.querySelectorAll(
        "[data-page]"
    );



    buttons.forEach(btn=>{


        btn.addEventListener(
            "click",
            ()=>{


                const page =
                btn.dataset.page;



                currentPage =
                page;



                setActiveMenu(
                    page
                );



                renderPage(
                    page
                );


            }
        );


    });


}






function setActiveMenu(page){


    document
    .querySelectorAll(
        ".menu-item, .bottom-item"
    )
    .forEach(item=>{


        item.classList.remove(
            "active"
        );


        if(item.dataset.page === page){


            item.classList.add(
                "active"
            );


        }


    });


}






/*
====================================
 RENDER PAGE
====================================
*/


function renderPage(page){


    const title =
    document.getElementById(
        "pageTitle"
    );



    const grid =
    document.getElementById(
        "dashboardGrid"
    );



    const content =
    document.getElementById(
        "contentArea"
    );



    grid.innerHTML = "";

    content.innerHTML = "";




    if(page === "home"){


        title.innerText =
        "Dashboard";



        renderStats();



        renderRecentUpload();


        return;


    }




    if(page === "onprocess"){


        title.innerText =
        "On Process";


        renderCards(
            dataStore.onProcess,
            "onprocess"
        );


    }





    if(page === "stock"){


        title.innerText =
        "Stock Konten";


        renderCards(
            dataStore.stock,
            "stock"
        );


    }





    if(page === "upload"){


        title.innerText =
        "Konten Terupload";


        renderCards(
            dataStore.upload,
            "upload"
        );


    }





    if(page === "booster"){


        title.innerText =
        "Booster Live";


        renderCards(
            dataStore.boosterLive,
            "booster"
        );


    }


}








/*
====================================
 DASHBOARD HOME
====================================
*/


function renderStats(){


const grid =
document.getElementById(
"dashboardGrid"
);



const cards = [


{
title:"On Process",
value:dataStore.onProcess.length,
icon:"fa-pen-to-square"
},


{
title:"Stock",
value:dataStore.stock.length,
icon:"fa-box"
},


{
title:"Upload",
value:dataStore.upload.length,
icon:"fa-film"
},


{
title:"Booster Live",
value:dataStore.boosterLive.length,
icon:"fa-rocket"
}


];





cards.forEach(card=>{


grid.innerHTML += `

<div class="stat-card card ripple">


<i class="fa-solid ${card.icon}">
</i>


<div>

<h3>
${card.title}
</h3>


<h2>
${card.value}
</h2>


</div>


</div>

`;


});


}








function renderRecentUpload(){


const area =
document.getElementById(
"contentArea"
);



area.innerHTML = `

<h2>
Upload Terbaru
</h2>

<div class="card-grid" id="uploadPreview">

</div>

`;



const box =
document.getElementById(
"uploadPreview"
);



dataStore.upload
.slice(0,6)
.forEach(item=>{


box.innerHTML += createCard(
item,
"upload"
);


});


}








/*
====================================
 CARD RENDER
====================================
*/


function renderCards(data,type){


const area =
document.getElementById(
"contentArea"
);



area.innerHTML = `

<div class="card-grid">

${

data.map(item=>

createCard(
item,
type
)

).join("")

}

</div>

`;



}






function createCard(item,type){



let title="-";

let body="";





if(type==="onprocess"){


title =
item["Judul Konten"] || "-";


body = `

<p>
Editor:
${item["Editor"] || "-"}
</p>


<p>
Status:
${item["Status"] || "-"}
</p>

`;



}




if(type==="stock"){


title =
item["Judul Konten"] || "-";


body = `

<p>
Editor:
${item["Editor"] || "-"}
</p>


<p>
Akun:
${item["Akun Tiktok"] || "-"}
</p>

`;



}





if(type==="upload"){


title =
item["Judul Konten"] || "-";


body = `

<p>
Akun:
${item["Akun Tiktok"] || "-"}
</p>


<p>
Booster:
${item["Jenis Booster"] || "-"}
</p>


<a href="${item["Link Konten"] || "#"}"
target="_blank">

Lihat Konten

</a>

`;



}




if(type==="booster"){


title =
item["CABANG YANG DI BOOSTER"] || "-";


body = `


<p>
Tanggal:
${item["TANGGAL BOOSTER"] || "-"}
</p>


<p>
Budget:
${item["BUDGET BOOSTER"] || "-"}
</p>


<p>
Host:
${item["HOST LIVE"] || "-"}
</p>


`;



}





return `


<div class="card ripple">


<div class="card-header">


<h3>
${title}
</h3>


</div>


<div class="card-body">

${body}

</div>


</div>


`;



}







/*
====================================
 SEARCH
====================================
*/


function setupSearch(){


const input =
document.getElementById(
"searchInput"
);



if(!input) return;



input.addEventListener(
"input",
()=>{


const keyword =
input.value
.toLowerCase();



document
.querySelectorAll(
".card"
)
.forEach(card=>{


card.style.display =
card.innerText
.toLowerCase()
.includes(keyword)

?

"block"

:

"none";


});


});


}






/*
====================================
 LOADING + TOAST
====================================
*/


function showLoading(){

const el =
document.getElementById(
"loading"
);


if(el)
el.style.display="flex";


}



function hideLoading(){

const el =
document.getElementById(
"loading"
);


if(el)
el.style.display="none";


}



function showToast(msg){


const toast =
document.getElementById(
"toast"
);


if(!toast) return;


toast.innerText =
msg;


toast.classList.add(
"show"
);



setTimeout(()=>{

toast.classList.remove(
"show"
);

},3000);


}
