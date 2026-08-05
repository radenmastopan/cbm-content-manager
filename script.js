/*************************************************
 CBM SOCIAL REPORT
 Frontend Data Controller
*************************************************/


const API_URL = 
"https://script.google.com/macros/s/AKfycbzqkMeq70pXCoZPKAlqzHBlCVVgXPoPQpbiesSigkMQacH6cZNpUHC57jPa2cNUovX8nQ/exec";


let dashboardData = {
  onProcess: [],
  stock: [],
  upload: [],
  boosterLive: []
};



document.addEventListener(
  "DOMContentLoaded",
  loadDashboard
);



async function loadDashboard(){


  showLoading();



  try {


    const response =
      await fetch(API_URL);



    const data =
      await response.json();



    dashboardData = data;



    renderHome();



    renderOnProcess();



    renderStock();



    renderUpload();



    renderBooster();



    hideLoading();



  }


  catch(error){


    console.error(error);



    showError(
      "Gagal mengambil data"
    );


  }


}





/*************************************************
 HOME
*************************************************/


function renderHome(){


  setCounter(
    "total-process",
    dashboardData.onProcess.length
  );


  setCounter(
    "total-stock",
    dashboardData.stock.length
  );


  setCounter(
    "total-upload",
    dashboardData.upload.length
  );


  setCounter(
    "total-booster",
    dashboardData.boosterLive.length
  );


}





/*************************************************
 ON PROCESS
*************************************************/


function renderOnProcess(){


 const container =
 document.querySelector(
  "#on-process-list"
 );


 if(!container) return;



 container.innerHTML = "";



 dashboardData.onProcess
 .slice(0,20)
 .forEach(item=>{


  container.innerHTML += `

  <div class="content-card">


    <h3>
      ${item["Judul Konten"] || "-"}
    </h3>


    <p>
    Editor:
    ${item["Editor"] || "-"}
    </p>


    <span>
    ${item["Status"] || "On Process"}
    </span>


  </div>

  `;


 });


}





/*************************************************
 STOCK
*************************************************/


function renderStock(){


 const container =
 document.querySelector(
 "#stock-list"
 );


 if(!container) return;



 container.innerHTML = "";



 dashboardData.stock
 .forEach(item=>{


 container.innerHTML += `


 <div class="content-card">


 <h3>
 ${item["Judul Konten"] || "-"}
 </h3>


 <p>
 Editor:
 ${item["Editor"] || "-"}
 </p>


 <p>
 Akun:
 ${item["Akun Tiktok"] || "-"}
 </p>


 </div>


 `;


 });


}





/*************************************************
 UPLOAD
*************************************************/


function renderUpload(){


 const container =
 document.querySelector(
 "#upload-list"
 );


 if(!container) return;



 container.innerHTML="";



 dashboardData.upload
 .slice(0,30)
 .forEach(item=>{


 let booster =
 item["Jenis Booster"] || 
 "Tanpa Booster";



 container.innerHTML += `


 <div class="content-card">


 <h3>
 ${item["Judul Konten"] || "-"}
 </h3>


 <p>
 Akun:
 ${item["Akun Tiktok"] || "-"}
 </p>


 <p>
 Booster:
 ${booster}
 </p>


 <a href="${item["Link Konten"] || "#"}"
 target="_blank">

 Lihat Konten

 </a>


 </div>


 `;


 });


}






/*************************************************
 BOOSTER LIVE
*************************************************/


function renderBooster(){


 const container =
 document.querySelector(
 "#booster-list"
 );


 if(!container) return;



 container.innerHTML="";



 dashboardData.boosterLive
 .forEach(item=>{


 container.innerHTML += `


 <div class="content-card">


 <h3>
 ${item["CABANG YANG DI BOOSTER"] || "-"}
 </h3>


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


 </div>


 `;


 });


}





/*************************************************
 UTILITIES
*************************************************/


function setCounter(id,value){


 const el =
 document.getElementById(id);



 if(el){

  el.innerText=value;

 }

}



function showLoading(){

 const loader =
 document.querySelector(
 ".loading"
 );

 if(loader)
 loader.style.display="block";

}



function hideLoading(){

 const loader =
 document.querySelector(
 ".loading"
 );

 if(loader)
 loader.style.display="none";

}



function showError(message){

 console.log(message);

}
