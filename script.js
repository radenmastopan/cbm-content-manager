// ===============================
// CBM Content Manager
// Google Sheets Integration
// ===============================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlPqf1zeuieOKH3AdpGMlH7agQQVGlAqRxQa3Awkmz8gD0wJ_1nTeHWQI-sa-qmKD3sA/exec";

async function simpanKonten() {

    const data = {
        judul: document.getElementById("judul").value.trim(),
        tglBahan: document.getElementById("tglBahan").value,
        tglEdit: document.getElementById("tglEdit").value,
        tglJadi: document.getElementById("tglJadi").value,
        editor: document.getElementById("editor").value,
        review: document.getElementById("review").value,
        acc: document.getElementById("acc").value,
        status: document.getElementById("status").value,
        keterangan: document.getElementById("keterangan").value.trim()
    };

    // Validasi
    if (data.judul === "") {
        alert("Judul konten wajib diisi.");
        return;
    }

    if (data.editor === "") {
        alert("Silakan pilih editor.");
        return;
    }

    try {

        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {

            alert("✅ Konten berhasil disimpan!");

            document.getElementById("judul").value = "";
            document.getElementById("tglBahan").value = "";
            document.getElementById("tglEdit").value = "";
            document.getElementById("tglJadi").value = "";
            document.getElementById("editor").selectedIndex = 0;
            document.getElementById("review").value = "";
            document.getElementById("acc").value = "";
            document.getElementById("status").selectedIndex = 0;
            document.getElementById("keterangan").value = "";

        } else {

            alert("❌ Gagal menyimpan data.");

        }

    } catch (error) {

        console.error(error);
        alert("❌ Tidak dapat terhubung ke Google Sheets.");

    }

}

// ===============================
// Ambil Data Dashboard
// ===============================

async function loadData() {

    const list = document.getElementById("contentList");

    if (!list) return;

    try {

        const response = await fetch(SCRIPT_URL);

        const data = await response.json();

        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<p>Belum ada data.</p>";
            return;
        }

        data.forEach(item => {

            list.innerHTML += `
                <div class="card">
                    <h3>${item["Judul Konten"] || "-"}</h3>
                    <p><b>Editor:</b> ${item["Editor"] || "-"}</p>
                    <p><b>Status:</b> ${item["Status"] || "-"}</p>
                </div>
            `;

        });

        const total = document.getElementById("totalKonten");
        if (total) total.innerText = data.length;

    } catch (err) {

        console.error(err);

        if (list) {
            list.innerHTML = "<p>Gagal mengambil data.</p>";
        }

    }

}

document.addEventListener("DOMContentLoaded", loadData);
