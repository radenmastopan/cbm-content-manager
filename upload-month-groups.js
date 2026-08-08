/* CBM Upload Month Groups
   Groups Konten Terupload by Tanggal Upload TikTok.
   Does not change the existing content cards; it only adds monthly sections. */
(function () {
    let busy = false;
    let observerStarted = false;

    function start() {
        if (observerStarted) return;
        const area = document.querySelector('#contentArea');
        if (!area) {
            setTimeout(start, 100);
            return;
        }
        observerStarted = true;

        const observer = new MutationObserver(() => {
            if (busy) return;
            const title = document.querySelector('#pageTitle');
            if (!title || title.textContent.trim() !== 'Konten Terupload') return;
            renderMonthlyGroups();
        });

        observer.observe(area, { childList: true, subtree: true });
        setTimeout(renderMonthlyGroups, 250);
    }

    function renderMonthlyGroups() {
        const area = document.querySelector('#contentArea');
        const title = document.querySelector('#pageTitle');
        if (!area || !title || title.textContent.trim() !== 'Konten Terupload') return;
        if (area.dataset.monthGrouped === '1') return;
        if (typeof appData === 'undefined' || !Array.isArray(appData.upload)) return;

        const source = typeof filter === 'function' ? filter(appData.upload) : appData.upload;
        if (!source.length) return;

        busy = true;
        const groups = groupByMonth(source);

        const heading = `
            <div class="upload-report-head">
                <div>
                    <div class="eyebrow">CONTENT REPORT</div>
                    <h2>Konten Terupload</h2>
                    <p>${source.length} konten terupload secara keseluruhan</p>
                </div>
                <div class="upload-total-badge">
                    <strong>${source.length}</strong>
                    <span>Total Konten</span>
                </div>
            </div>`;

        const html = Object.entries(groups).map(([key, items]) => monthSection(key, items)).join('');
        area.innerHTML = heading + html;
        area.dataset.monthGrouped = '1';
        busy = false;
    }

    function groupByMonth(items) {
        const groups = {};
        items.forEach(item => {
            const date = getUploadDate(item);
            const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : 'unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return Object.fromEntries(
            Object.entries(groups).sort(([a], [b]) => {
                if (a === 'unknown') return 1;
                if (b === 'unknown') return -1;
                return b.localeCompare(a);
            })
        );
    }

    function getUploadDate(item) {
        const raw = typeof v === 'function' ? v(item, 'uploadTikTok', 'upload') : '';
        const text = String(raw || '').trim();
        const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
        if (!match) return null;

        const day = Number(match[1]);
        const month = Number(match[2]) - 1;
        let year = Number(match[3]);
        if (year < 100) year += 2000;

        const date = new Date(year, month, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function monthSection(key, items) {
        const date = key === 'unknown' ? null : new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1);
        const monthName = date
            ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
            : 'Tanggal Upload Belum Diisi';

        const boosterCount = items.filter(item => {
            const booster = typeof v === 'function' ? v(item, 'jenisBooster', 'upload') : '';
            const n = String(booster || '').toLowerCase().replace(/\s+/g, '');
            return n && n !== '-' && n !== 'tanpabooster';
        }).length;
        const noBoosterCount = items.length - boosterCount;

        return `
            <section class="upload-month-section">
                <div class="upload-month-header">
                    <div class="month-title-wrap">
                        <div class="month-icon"><i class="fa-regular fa-calendar"></i></div>
                        <div>
                            <h2>${escapeMonthText(monthName)}</h2>
                            <p>${items.length} konten terupload</p>
                        </div>
                    </div>
                    <div class="month-stats">
                        <span><b>${items.length}</b> Total</span>
                        <span><b>${boosterCount}</b> Booster</span>
                        <span><b>${noBoosterCount}</b> Tanpa Booster</span>
                    </div>
                </div>
                <div class="card-grid">
                    ${items.map(item => uploadCard(item)).join('')}
                </div>
            </section>`;
    }

    function escapeMonthText(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function injectStyles() {
        if (document.querySelector('#cbm-month-group-styles')) return;
        const style = document.createElement('style');
        style.id = 'cbm-month-group-styles';
        style.textContent = `
            .upload-report-head {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:24px;
                margin:4px 0 30px;
                padding:22px 24px;
                border:1px solid rgba(15,23,42,.07);
                border-radius:20px;
                background:linear-gradient(135deg,#ffffff,#f7f9fc);
                box-shadow:0 8px 30px rgba(15,23,42,.05);
            }
            .upload-report-head .eyebrow {
                font-size:10px;
                font-weight:800;
                letter-spacing:1.5px;
                color:#64748b;
                margin-bottom:5px;
            }
            .upload-report-head h2 { margin:0; font-size:24px; }
            .upload-report-head p { margin:5px 0 0; color:#64748b; font-size:13px; }
            .upload-total-badge {
                min-width:105px;
                padding:12px 16px;
                border-radius:16px;
                text-align:center;
                background:#0f172a;
                color:#fff;
            }
            .upload-total-badge strong { display:block; font-size:25px; line-height:1; }
            .upload-total-badge span { display:block; margin-top:5px; font-size:10px; opacity:.72; }
            .upload-month-section { margin-bottom:38px; }
            .upload-month-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:20px;
                margin:0 0 16px;
                padding:17px 19px;
                border-radius:18px;
                background:#fff;
                border:1px solid rgba(15,23,42,.07);
                box-shadow:0 6px 24px rgba(15,23,42,.045);
            }
            .month-title-wrap { display:flex; align-items:center; gap:13px; min-width:0; }
            .month-icon {
                width:42px;
                height:42px;
                flex:0 0 42px;
                display:grid;
                place-items:center;
                border-radius:13px;
                background:#f1f5f9;
                color:#334155;
            }
            .month-title-wrap h2 { margin:0; font-size:19px; text-transform:capitalize; }
            .month-title-wrap p { margin:3px 0 0; color:#64748b; font-size:12px; }
            .month-stats { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:7px; }
            .month-stats span {
                padding:7px 10px;
                border-radius:999px;
                background:#f8fafc;
                border:1px solid #e8edf5;
                color:#64748b;
                font-size:11px;
                white-space:nowrap;
            }
            .month-stats b { color:#0f172a; margin-right:2px; }
            @media (max-width: 720px) {
                .upload-report-head { padding:18px; }
                .upload-month-header { align-items:flex-start; flex-direction:column; }
                .month-stats { justify-content:flex-start; }
                .upload-total-badge { min-width:88px; }
            }
        `;
        document.head.appendChild(style);
    }

    window.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        start();
    });
})();
