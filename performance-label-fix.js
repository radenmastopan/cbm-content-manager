/* CBM PERFORMANCE LABEL FIX
   Keep the labels already rendered by script.js. The previous version
   removed the <span>, which is exactly why the labels disappeared.
*/
(function () {
    const LABELS = [
        "Views sebelum booster",
        "Views setelah booster",
        "Likes sebelum booster",
        "Likes setelah booster"
    ];

    function fixPerformanceLabels(root) {
        const scope = root || document;
        scope.querySelectorAll(".performance-grid").forEach(grid => {
            [...grid.children].slice(0, 4).forEach((box, index) => {
                if (!box) return;

                let label = box.querySelector(".performance-label");
                if (!label) {
                    label = box.querySelector("span");
                }
                if (!label) {
                    label = document.createElement("span");
                    box.insertBefore(label, box.querySelector("strong") || null);
                }

                label.className = "performance-label";
                label.textContent = LABELS[index];
            });
        });
    }

    function start() {
        fixPerformanceLabels(document);
        const observer = new MutationObserver(() => fixPerformanceLabels(document));
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
