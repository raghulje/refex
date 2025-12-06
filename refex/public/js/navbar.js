document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        const navbar = document.querySelector(".navbar-brand");
        const navbarNav = document.querySelector(".navbar-nav");
        if (navbar || navbarNav) {
            navbar.innerHTML = `
                <img src="/assets/refex/img/logo.png" alt="Logo" style="height:30px;">
            `;
            observer.disconnect(); 
            const style = document.createElement("style");
            style.textContent = `
                .navbar-nav {
                    margin-bottom: -5px;
                }
            `;
            document.head.appendChild(style);
        }
        if (navbarNav) {
            const style = document.createElement("style");
            style.textContent = `
                .navbar-nav {
                    margin-bottom: -5px;
                }
            `;
            document.head.appendChild(style);
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
