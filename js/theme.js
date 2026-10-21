(() => {
    const key = "portfolio-theme";

    function apply(theme) {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.bsTheme = theme;
        return theme === "dark";
    }

    let saved;
    try {
        saved = localStorage.getItem(key);
    } catch (error) {
        console.warn("Theme preference could not be read from browser storage.", error);
    }

    apply(saved === "dark" || saved === "light" ? saved
        : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    window.portfolioTheme = {
        isDark: () => document.documentElement.dataset.theme === "dark",
        toggle: () => {
            const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            apply(theme);
            try {
                localStorage.setItem(key, theme);
            } catch (error) {
                console.warn("Theme preference could not be saved to browser storage.", error);
            }
            return theme === "dark";
        }
    };
})();
