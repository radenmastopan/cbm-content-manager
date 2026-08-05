const API_URL = "https://script.google.com/macros/s/AKfycbzqkMeq70pXCoZPKAlqHBlCVVgXPoPQpbiesSigkMQacH6cZNpUHC57jPa2cNUovX8nQ/exec";


fetch(API_URL)
.then(res => res.json())
.then(data => {

    console.log("DATA GOOGLE SHEET:", data);

    document.getElementById("contentArea").innerHTML = 
    `
    <div class="card">
        <h2>API TERHUBUNG</h2>
        <p>
        On Process: ${data.onProcess.length}
        </p>
        <p>
        Stock: ${data.stock.length}
        </p>
        <p>
        Upload: ${data.upload.length}
        </p>
        <p>
        Booster: ${data.boosterLive.length}
        </p>
    </div>
    `;

})
.catch(err=>{

    console.log(err);

    document.getElementById("contentArea").innerHTML =
    `
    <div class="card">
    API ERROR
    </div>
    `;

});
