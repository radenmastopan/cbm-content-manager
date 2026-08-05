const API_URL = 
"https://script.google.com/macros/s/AKfycbxO0mk7oMI9hF__zieQyVV5icjJ6IxtcUyD2881tQe0_Q4VQvbQltKyFvlziPvyiTHilg/exec";


let appData = {};



document.addEventListener(
"DOMContentLoaded",
()=>{

loadDashboard();

}

);




async function loadDashboard(){


try{


const response =
await fetch(API_URL);



appData =
await response.json();



console.log(appData);



renderHome();



}

catch(error){


console.error(error);


document.getElementById(
"contentArea"
).innerHTML =

`

<div class="card">

<h2>
Gagal mengambil data
</h2>

<p>
Cek koneksi API
</p>

</div>

`;

}


}







function renderHome(){



const grid =
document.getElementById(
"dashboardGrid"
);



grid.innerHTML = `



<div class="stat-card card">

<h3>
On Process
</h3>

<h1>
${appData.onProcess.length}
</h1>

</div>



<div class="stat-card card">

<h3>
Stock
</h3>

<h1>
${appData.stock.length}
</h1>

</div>



<div class="stat-card card">

<h3>
Upload
</h3>

<h1>
${appData.upload.length}
</h1>

</div>



<div class="stat-card card">

<h3>
Booster Live
</h3>

<h1>
${appData.boosterLive.length}
</h1>

</div>



`;




document.getElementById(
"contentArea"
).innerHTML = `


<h2>
Konten Terbaru
</h2>


<div class="card-grid">


${

appData.upload.slice(0,6)
.map(item=>{


return `


<div class="card ripple">


<h3>
${item["Judul Konten"] || "-"}
</h3>


<p>
Akun:
${item["Akun Tiktok"] || "-"}
</p>


<p>
Jenis:
${item["Jenis Booster"] || "-"}
</p>


</div>


`


})
.join("")

}


</div>


`;



}
