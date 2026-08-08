/* CBM TikTok Preview Fix
   Uses TikTok's official embed script instead of forcing a TikTok iframe.
*/
(function () {
    const EMBED_SCRIPT = "https://www.tiktok.com/embed.js";
    let embedScriptPromise = null;

    function loadTikTokScript() {
        if (window.tiktokEmbed) return Promise.resolve();
        if (embedScriptPromise) return embedScriptPromise;

        embedScriptPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[src="' + EMBED_SCRIPT + '"]');
            if (existing) {
                existing.addEventListener("load", resolve, { once: true });
                existing.addEventListener("error", reject, { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = EMBED_SCRIPT;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return embedScriptPromise;
    }

    function getModal() {
        let modal = document.getElementById("tiktokPreviewModal");
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = "tiktokPreviewModal";
        modal.className = "tiktok-preview-modal";
        modal.innerHTML = `
            <div class="tiktok-preview-dialog" role="dialog" aria-modal="true" aria-label="Preview TikTok">
                <button type="button" class="tiktok-preview-close" aria-label="Tutup">×</button>
                <div class="tiktok-preview-body"></div>
                <a class="tiktok-open-button" href="#" target="_blank" rel="noopener noreferrer">Buka di TikTok</a>
            </div>`;
        document.body.appendChild(modal);

        modal.addEventListener("click", function (event) {
            if (event.target === modal || event.target.closest(".tiktok-preview-close")) {
                modal.classList.remove("show");
                document.body.classList.remove("modal-open");
            }
        });

        return modal;
    }

    function escapeAttr(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    async function showTikTok(url) {
        if (!url) return;

        const modal = getModal();
        const body = modal.querySelector(".tiktok-preview-body");
        const openButton = modal.querySelector(".tiktok-open-button");

        openButton.href = url;
        modal.classList.add("show");
        document.body.classList.add("modal-open");

        body.innerHTML = `
            <div class="preview-loading">
                <div class="loader"></div>
                <p>Memuat preview TikTok...</p>
            </div>`;

        try {
            await loadTikTokScript();

            body.innerHTML = `
                <blockquote
                    class="tiktok-embed"
                    cite="${escapeAttr(url)}"
                    style="max-width:605px; min-width:325px; width:100%; margin:0 auto;">
                    <section></section>
                </blockquote>`;

            if (window.tiktokEmbed && typeof window.tiktokEmbed.lib === "function") {
                window.tiktokEmbed.lib.render();
            }

            // Give TikTok a few seconds. If it does not render, show a clear fallback.
            window.setTimeout(function () {
                const hasIframe = body.querySelector("iframe");
                const hasTikTokContent = body.querySelector("blockquote.tiktok-embed section > *");
                if (!hasIframe && !hasTikTokContent && modal.classList.contains("show")) {
                    body.innerHTML = `
                        <div class="preview-fallback">
                            <i class="fa-brands fa-tiktok"></i>
                            <h3>Preview TikTok tidak tersedia</h3>
                            <p>TikTok tidak mengizinkan posting ini ditampilkan di dalam website. Tombol di bawah tetap membuka posting aslinya.</p>
                            <a class="tiktok-fallback-link" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Buka Video di TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                        </div>`;
                }
            }, 5000);
        } catch (error) {
            console.error("TikTok embed error:", error);
            body.innerHTML = `
                <div class="preview-fallback">
                    <i class="fa-brands fa-tiktok"></i>
                    <h3>Preview TikTok tidak dapat dimuat</h3>
                    <p>Browser gagal memuat TikTok Embed.</p>
                    <a class="tiktok-fallback-link" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Buka Video di TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>`;
        }
    }

    // Capture the click BEFORE the old script.js handler. This lets us replace
    // the old oEmbed/iframe implementation without changing the existing UI.
    document.addEventListener("click", function (event) {
        const button = event.target.closest && event.target.closest(".preview-button");
        if (!button) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        showTikTok(button.dataset.previewUrl || "");
    }, true);
})();
