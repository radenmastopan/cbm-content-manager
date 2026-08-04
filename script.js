const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWM44-EGjL_9pw8_qBS9yKIjaR0ybtc8RjNSvSVD0669eajP3VJpj1z2koqVaZ-woJ/exec";

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

    if (!data.judul) {
        alert("Judul konten wajib diisi.");
        return;
    }

    if (!data.editor) {
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

            alert("❌ " + (result.error || "Gagal menyimpan data."));

        }

    } catch (error) {

        console.error(error);
        alert("❌ Gagal terhubung ke Google Sheets.");

    }

}
