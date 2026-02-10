class ProcedureGroup extends HTMLElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-group", ProcedureGroup, { extends: "section" });
    }
}


class ProcedureGroupTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-group-title", ProcedureGroupTitle, { extends: "h2" });
    }
}

class ProcedureContainer extends HTMLDivElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-container", ProcedureContainer, { extends: "div" });
    }
}

class ProcedureTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-title", ProcedureTitle, { extends: "h3" });
    }
}

class ProcedureSteps extends HTMLOListElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-steps", ProcedureSteps, { extends: "ol" });
    }
}

class ProcedureStep extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-step", ProcedureStep, { extends: "li" });
    }
}

// Localisation helper
const _isEn = document.documentElement.lang === "en";
const _i18n = {
    linkTitle:  _isEn ? "Copy link to this step" : "\u3053\u306e\u30b9\u30c6\u30c3\u30d7\u3078\u306e\u30ea\u30f3\u30af\u3092\u30b3\u30d4\u30fc",
    copied:     _isEn ? "\u2713 Copied" : "\u2713 \u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f",
    openImage:  _isEn ? "\u21F1 Open image" : "\u21F1 \u753b\u50CF\u3092\u958b\u304F",
};

// Add link copy buttons after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Helper to create a link copy button for a given element
    function createLinkBtn(targetEl) {
        const btn = document.createElement("button");
        btn.className = "proc-step-link-btn";
        btn.title = _i18n.linkTitle;
        btn.textContent = "\uD83D\uDD17";
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const url = location.origin + location.pathname + "#" + targetEl.id;
            navigator.clipboard.writeText(url).then(() => {
                btn.textContent = _i18n.copied;
                setTimeout(() => { btn.textContent = "\uD83D\uDD17"; }, 1500);
            });
        });
        return btn;
    }

    // proc-title (top-level section titles like "1 - Mod のインストール")
    document.querySelectorAll("proc-container > proc-title").forEach((title) => {
        const container = title.closest("proc-container");
        if (!container || !container.id) return;
        title.appendChild(createLinkBtn(container));
    });

    // proc-step titles within proc-steps
    document.querySelectorAll("proc-steps > proc-step").forEach((step) => {
        const title = step.querySelector(":scope > proc-steptitle");
        if (!title) return;
        if (!step.id) {
            const container = step.closest("proc-container");
            const baseId = container ? container.id : "step";
            const steps = Array.from(step.parentElement.children).filter(el => el.tagName.toLowerCase() === "proc-step");
            const index = steps.indexOf(step) + 1;
            step.id = baseId + "-step" + index;
        }
        title.appendChild(createLinkBtn(step));
    });
});


class ProcedureSubSteps extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-substeps", ProcedureSubSteps, { extends: "li" });
    }
}

class ProcedureSubStep extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-substep", ProcedureSubStep, { extends: "li" });
    }
}

class StepTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-steptitle", StepTitle, { extends: "h3" });
    }
}


class StepDescription extends HTMLDivElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-stepdesc", StepDescription, { extends: "div" });
    }
}

class ExpandableImage extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        const imageUrl = this.getAttribute("src");

        const thumb = document.createElement("img");
        thumb.src = imageUrl;
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", (e) => this.openOverlay(imageUrl, e.currentTarget));

        this.appendChild(thumb);
    }

    openOverlay(imageUrl, thumbEl) {
        const thumbRect = thumbEl.getBoundingClientRect();

        const overlay = document.createElement("div");
        overlay.className = "expandable-image-overlay";

        const img = document.createElement("img");
        img.src = imageUrl;

        // Keep fixed position throughout for smooth interpolation
        img.style.position = "fixed";
        img.style.left = thumbRect.left + "px";
        img.style.top = thumbRect.top + "px";
        img.style.width = thumbRect.width + "px";
        img.style.height = thumbRect.height + "px";
        img.style.objectFit = "contain";
        img.style.transition = "none";

        overlay.appendChild(img);

        // Open in browser button
        const openBtn = document.createElement("a");
        openBtn.href = imageUrl;
        openBtn.target = "_blank";
        openBtn.className = "expandable-image-open-btn";
        openBtn.textContent = _i18n.openImage;
        openBtn.addEventListener("click", (e) => e.stopPropagation());
        overlay.appendChild(openBtn);

        document.body.appendChild(overlay);

        // Calculate final centered size once the image's natural size is known
        const animateToCenter = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const maxW = vw * 0.9;
            const maxH = vh * 0.9;
            const natW = img.naturalWidth || thumbRect.width;
            const natH = img.naturalHeight || thumbRect.height;
            const scale = Math.min(maxW / natW, maxH / natH, 1);
            const finalW = natW * scale;
            const finalH = natH * scale;
            const finalLeft = (vw - finalW) / 2;
            const finalTop = (vh - finalH) / 2;

            // Force reflow then animate
            img.offsetHeight;
            requestAnimationFrame(() => {
                overlay.classList.add("active");
                img.style.transition = "left 0.3s cubic-bezier(0.2, 0, 0.2, 1), top 0.3s cubic-bezier(0.2, 0, 0.2, 1), width 0.3s cubic-bezier(0.2, 0, 0.2, 1), height 0.3s cubic-bezier(0.2, 0, 0.2, 1)";
                img.style.left = finalLeft + "px";
                img.style.top = finalTop + "px";
                img.style.width = finalW + "px";
                img.style.height = finalH + "px";
            });
        };

        if (img.complete && img.naturalWidth) {
            animateToCenter();
        } else {
            img.addEventListener("load", animateToCenter, { once: true });
            // Fallback if already cached
            setTimeout(animateToCenter, 50);
        }

        const closeOverlay = () => {
            document.removeEventListener("keydown", keyHandler);

            // Animate back to thumbnail
            const currentThumbRect = thumbEl.getBoundingClientRect();
            overlay.classList.remove("active");
            img.style.transition = "left 0.25s cubic-bezier(0.4, 0, 0.6, 1), top 0.25s cubic-bezier(0.4, 0, 0.6, 1), width 0.25s cubic-bezier(0.4, 0, 0.6, 1), height 0.25s cubic-bezier(0.4, 0, 0.6, 1)";
            img.style.left = currentThumbRect.left + "px";
            img.style.top = currentThumbRect.top + "px";
            img.style.width = currentThumbRect.width + "px";
            img.style.height = currentThumbRect.height + "px";

            img.addEventListener("transitionend", () => overlay.remove(), { once: true });
            // Fallback removal
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400);
        };

        const keyHandler = (e) => {
            if (e.key === "Escape") closeOverlay();
        };

        overlay.addEventListener("click", closeOverlay);
        document.addEventListener("keydown", keyHandler);
    }

    static {
        customElements.define("expandable-image", ExpandableImage);
    }
}