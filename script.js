const API_URL = "https://script.google.com/macros/s/AKfycbz45ypG0d5pwwn-4jXYICcH6kXGVDT4y5s8cxOLsp024SrmV-7Axc3abJdK2DyW8KxpHg/exec";



// =============================
// LOAD DATA
// =============================

async function loadData(){


try{


const response =
await fetch(API_URL);



const result =
await response.json();



console.log(result);



if(result.success){


tampilkanHalaman(
result.data
);


updateDashboard(
result.data
);



}



}

catch(error){


console.error(error);


const list =
document.getElementById("contentList");


if(list){

list.innerHTML =
"<p>Gagal mengambil data</p>";

}


}



}






// =============================
// DETEKSI HALAMAN
// =============================

function tampilkanHalaman(data){


const page =
window.location.pathname;



if(page.includes("onprocess")){


renderCard(
data.ON_PROCESS,
"On Process"
);


}



else if(page.includes("stock")){


renderCard(
data.STOCK,
"Stock"
);


}



else if(page.includes("upload")){


renderCard(
data.UPLOAD,
"Terupload"
);


}



else if(page.includes("booster")){


renderCard(
data.BOOSTER,
"Booster Live"
);


}



}







// =============================
// RENDER CARD
// =============================


function renderCard(data,status){



const list =
document.getElementById(
"contentList"
);



if(!list)
return;



list.innerHTML="";





if(!Array.isArray(data) || data.length===0){


list.innerHTML =
"<p>Data tidak ditemukan</p>";


return;


}






data.forEach(item=>{



let html = `

<div class="card">


<h3>
${get(item,"Judul Konten")}
</h3>


<p>
📌 Status:
${status}
</p>



`;





// SEMUA KONTEN

html += `


<p>
👤 Editor:
${get(item,"Editor")}
</p>


<p>
📱 Akun TikTok:
${get(item,"Akun Tiktok")}
</p>



<p>
✂️ Selesai Edit:
${tanggal(get(item,"Tanggal Selesai Edit"))}
</p>


<p>
👥 Review:
${tanggal(get(item,"Tanggal Upload ke Grup Review"))}
</p>


<p>
✅ ACC:
${tanggal(get(item,"Tanggal ACC konten"))}
</p>



`;






if(status==="Terupload"){


html += `


<p>
🎬 Upload TikTok:
${tanggal(get(item,"Tanggal Upload Tiktok"))}
</p>


<p>
🚀 Jenis Booster:
${get(item,"Jenis Booster")}
</p>


<p>
💰 Nominal Booster:
${get(item,"Nominal Booster")}
</p>


<p>
💳 Dana Booster:
${get(item,"Asal Dana Booster")}
</p>



`;



}







if(status==="Booster Live"){


html += `



<hr>


<h4>
🚀 Data Booster
</h4>



<p>
Jenis Booster:
${get(item,"Jenis Booster")}
</p>


<p>
💰 Nominal:
${get(item,"Nominal Booster")}
</p>



<p>
💳 Asal Dana:
${get(item,"Asal Dana Booster")}
</p>



<p>
📊 Sebelum Booster:
${get(item,"Jumlah View Sebelum Booster")}
View
</p>



<p>
❤️ Like Sebelum:
${get(item,"Jumlah Like Sebelum Booster")}
</p>



<p>
💬 Komentar Sebelum:
${get(item,"Komentar Sebelum Booster")}
</p>




<p>
🚀 Sesudah Booster:
${get(item,"Jumlah View Setelah Booster")}
View
</p>



<p>
❤️ Like Sesudah:
${get(item,"Jumlah Like Setelah Booster")}
</p>



<p>
💬 Komentar Sesudah:
${get(item,"Komentar Setelah Booster")}
</p>




`;



}






html += `



<p>
🔗 Link:
${get(item,"Link Konten")}
</p>



<p>
📝 Keterangan:
${get(item,"Keterangan")}
</p>



</div>



`;





list.innerHTML += html;



});



}







// =============================
// GET DATA AMAN
// =============================


function get(obj,key){



if(obj[key] !== undefined &&
obj[key] !== ""){


return obj[key];


}



return "-";



}








// =============================
// FORMAT TANGGAL
// =============================


function tanggal(value){


if(!value || value==="-" )
return "-";



if(value.includes("T")){


return value
.split("T")[0];


}


return value;


}






// =============================
// DASHBOARD
// =============================

function updateDashboard(data){



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


setText(
"booster",
jumlah(data.BOOSTER)
);



}




function jumlah(data){

return Array.isArray(data)
?
data.length
:
0;


}




function setText(id,value){


const el =
document.getElementById(id);


if(el){

el.innerText=value;

}


}





loadData();
