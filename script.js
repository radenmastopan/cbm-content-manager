const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrxtREyFMEZ9ZCDPIbUmEl350IB0nJZlMwti7kHI-EVerw36Fo_Qspr3QcdtVnMzTBcA/exec";

async function simpanKonten() {

    const data = {

        judul: document.getElementById("judul").value,
        tglBahan: document.getElementById("tglBahan").value,
        tglEdit: document.getElementById("tglEdit").value,
        tglJadi: document.getElementById("tglJadi").value,
        editor: document.getElementById("editor").value,
        review: document.getElementById("review").value,
        acc: document.getElementById("acc").value,
        status: document.getElementById("status").value,
        keterangan: document.getElementById("keterangan").value

    };

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
            document.getElementById("editor").value = "";
            document.getElementById("review").value = "";
            document.getElementById("acc").value = "";
            document.getElementById("status").value = "";
            document.getElementById("keterangan").value = "";

        } else {

            alert("❌ Gagal menyimpan.");

        }

    } catch (err) {

        console.error(err);
        alert("❌ Tidak bisa terhubung ke Google Sheets.");

    }

                }
