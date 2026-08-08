/* CBM PERFORMANCE LABEL FIX
   Keeps the existing data and layout, but guarantees that the four
   performance metrics always have visible labels.
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
                    label = document.createElement("div");
                    label.className = "performance-label";

                    const oldSpan = box.querySelector("span");
                    if (oldSpan) {
                        oldSpan.remove();
                    }

                    const value = box.querySelector("strong");
                    box.insertBefore(label, value || null);
                }

                label.textContent = LABELS[index];
            });
        });
    }

    function start() {
        fixPerformanceLabels(document);

        const observer = new MutationObserver(() => {
            fixPerformanceLabels(document);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
