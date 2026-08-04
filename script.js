const API =
"https://script.google.com/macros/s/AKfycbwtoUQAPS1Trbt69ZranpTkm3R7NA_cmu2YTeh5_hUMe7GijgarvFLs8D0Ye1deXldzjA/exec";



let data={};



async function loadData(){

try{


let response =
await fetch(API);



data =
await response.json();



console.log(data);



document.getElementById("processCount")
.innerText =
data.data.ON_PROCESS.length;



document.getElementById("stockCount")
.innerText =
data.data.STOCK.length;



document.getElementById("uploadCount")
.innerText =
data.data.UPLOAD.length;



let booster =
data.data.UPLOAD.filter(item=>

item["Jenis Booster"]=="Booster"

);



document.getElementById("boosterCount")
.innerText =
booster.length;



showActivity();



}

catch(error){

console.log(error);

document.getElementById("activity")
.innerHTML=
`
<div class="activity-card">
Gagal mengambil data
</div>
`;

}


}



function showActivity(){


let box =
document.getElementById("activity");


let list =
data.data.UPLOAD.slice(1,4);



box.innerHTML="";


list.forEach(item=>{


box.innerHTML +=

`

<div class="activity-card">

🎬
<b>
${item["Judul Konten "] || "-"}
</b>

<br>

Upload:
${item["Tanggal Upload Tiktok "] || "-"}

</div>


`;

});


}





function goPage(page){

alert(
"Halaman "+page+" akan dibuat"
);

}



loadData();
