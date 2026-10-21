let controller;

export function initialize(layout) {
    dispose();
    controller = new ScrollNavigation(layout);
}

export function sync() {
    controller?.sync();
}

export function dispose() {
    controller?.dispose();
    controller = undefined;
}

class ScrollNavigation {
    constructor(layout) {
        this.layout = layout;
        this.path = location.pathname;
        this.lastY = window.scrollY;
        this.locked = false;
        this.ready = true;
        this.direction = 0;
        this.inputDirection = 0;
        this.inputTime = -Infinity;
        this.abort = new AbortController();
        const options = { passive: true, signal: this.abort.signal };

        window.addEventListener("scroll", () => this.onScroll(), options);
        window.addEventListener("pointerdown", event => {
            this.scrollbarDragging = event.clientX >= document.documentElement.clientWidth;
        }, options);
        window.addEventListener("pointerup", () => {
            this.scrollbarDragging = false;
        }, options);
        window.addEventListener("wheel", event => this.onInput(event, Math.sign(event.deltaY)), options);
        window.addEventListener("keydown", event => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            const down = ["ArrowDown", "PageDown", "End"];
            const up = ["ArrowUp", "PageUp", "Home"];
            const direction = event.key === " " ? (event.shiftKey ? -1 : 1)
                : down.includes(event.key) ? 1 : up.includes(event.key) ? -1 : 0;
            this.onInput(event, direction);
        }, options);
        window.addEventListener("touchstart", event => {
            this.touchY = event.touches[0]?.clientY;
        }, options);
        window.addEventListener("touchmove", event => {
            const y = event.touches[0]?.clientY;
            if (y !== undefined && this.touchY !== undefined) {
                this.onInput(event, Math.sign(this.touchY - y));
            }
            this.touchY = y;
        }, options);
    }

    blocked(target) {
        return target instanceof Element &&
            (target.closest("input, textarea, select, button, a, [contenteditable='true']") ||
                document.querySelector(".menu-toggle[aria-expanded='true']"));
    }

    onInput(event, direction) {
        if (!direction || this.blocked(event.target)) return;
        if (this.locked) {
            this.releaseAfterIdle();
            return;
        }
        if (!this.ready) return;

        // Let scrollable controls consume their own input.
        for (let element = event.target; element instanceof Element &&
            element !== document.body; element = element.parentElement) {
            const style = getComputedStyle(element);
            if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) {
                return;
            }
        }
        this.inputDirection = direction;
        this.inputTime = performance.now();
        this.checkEdge(direction);
    }

    onScroll() {
        const y = window.scrollY;
        const direction = Math.sign(y - this.lastY);
        this.lastY = y;
        if (this.locked) {
            this.releaseAfterIdle();
        } else if (this.ready && !this.blocked(document.activeElement) &&
            (this.scrollbarDragging ||
                (direction === this.inputDirection && performance.now() - this.inputTime < 1500))) {
            this.checkEdge(direction);
        }
    }

    checkEdge(direction) {
        const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if ((direction > 0 && window.scrollY >= maxY - 2) ||
            (direction < 0 && window.scrollY <= 2)) {
            const routes = [...document.querySelectorAll("#main-navigation a")]
                .map(link => new URL(link.href).pathname);
            const index = routes.indexOf(location.pathname);
            const next = routes[index + direction];
            if (index < 0 || !next) return;

            this.locked = true;
            this.ready = false;
            this.direction = direction;
            this.releaseAfterIdle();
            this.layout.invokeMethodAsync("NavigateOnScroll", next).catch(error => {
                this.ready = true;
                console.error("Scroll navigation failed.", error);
            });
        }
    }

    sync() {
        if (this.path === location.pathname) return;
        this.path = location.pathname;
        this.ready = false;
        this.inputDirection = 0;
        const direction = this.direction;
        this.direction = 0;
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => {
            this.frame = requestAnimationFrame(() => {
                const bottom = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: direction < 0 ? bottom : 0, behavior: "instant" });
                this.lastY = window.scrollY;
                this.ready = true;
                this.releaseAfterIdle();
            });
        });
    }

    releaseAfterIdle() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (this.ready) this.locked = false;
        }, 300);
    }

    dispose() {
        this.abort.abort();
        clearTimeout(this.timer);
        cancelAnimationFrame(this.frame);
    }
}
