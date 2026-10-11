document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. TOAST NOTIFICATIONS
    // ========================================

    const toast = document.querySelector(".toast");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }


    // ========================================
    // 2. DESKTOP SEARCH TOGGLE
    // ========================================

    const searchToggle = document.querySelector(
        ".search-toggle, [data-search-toggle], [data-focus-search], #search-icon"
    );

    const searchBar = document.querySelector(
        ".desktop-search, .search-container, [data-search-bar]"
    );

    if (searchToggle && searchBar) {

        searchToggle.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            searchBar.classList.toggle("search-open");

            if (searchBar.classList.contains("search-open")) {
                const input = searchBar.querySelector("input");

                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        });

        document.addEventListener("click", (event) => {
            if (
                !searchBar.contains(event.target) &&
                !searchToggle.contains(event.target)
            ) {
                searchBar.classList.remove("search-open");
            }
        });
    }


    // ========================================
    // 3. MOBILE SIDEBAR
    // ========================================

    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".mobile-sidebar");

    function closeMenu() {
        document.body.classList.remove("menu-open");

        menuToggle?.setAttribute("aria-expanded", "false");
        sidebar?.setAttribute("aria-hidden", "true");
    }

    menuToggle?.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        sidebar?.setAttribute("aria-hidden", String(!isOpen));
    });

    document.querySelectorAll(
        "[data-close-menu], .mobile-sidebar a"
    ).forEach((element) => {
        element.addEventListener("click", closeMenu);
    });


    // ========================================
    // 4. CATEGORY DROPDOWN
    // ========================================

    const categoryToggle = document.querySelector(".dropdown-toggle");

    categoryToggle?.addEventListener("click", (event) => {
        event.stopPropagation();

        const parent = event.currentTarget.closest(".category-nav");

        if (!parent) return;

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    // ========================================
    // 5. ACCOUNT DROPDOWN
    // ========================================

    const accountToggle = document.querySelector(".account-toggle");

    accountToggle?.addEventListener("click", (event) => {
        event.stopPropagation();

        const parent = event.currentTarget.closest(".account-nav");

        if (!parent) return;

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    // Close dropdowns and menus with Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();

            searchBar?.classList.remove("search-open");

            document.querySelectorAll(
                ".account-nav.open, .category-nav.open"
            ).forEach((element) => {
                element.classList.remove("open");
            });

            document.querySelector(".account-toggle")
                ?.setAttribute("aria-expanded", "false");

            document.querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "false");
        }
    });


    // Close desktop dropdowns when clicking outside.
    document.addEventListener("click", (event) => {

        if (!event.target.closest(".account-nav")) {
            document.querySelector(".account-nav")
                ?.classList.remove("open");

            document.querySelector(".account-toggle")
                ?.setAttribute("aria-expanded", "false");
        }

        if (!event.target.closest(".category-nav")) {
            document.querySelector(".category-nav")
                ?.classList.remove("open");

            document.querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "false");
        }

    });


    // ========================================
    // 6. SEARCH FUNCTIONALITY
    // ========================================

    function runSearch(input) {
        const query = input?.value.trim();

        if (!query) {
            input?.focus();
            showToast("Enter a meal or dish to search for.");
            return;
        }

        window.location.href =
            `Menu.html?search=${encodeURIComponent(query)}`;
    }

    const desktopSearchForm = document.querySelector("#search-form");

    desktopSearchForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        runSearch(
            document.querySelector("#desktop-meal-search")
        );
    });

    const mobileSearchInput = document.querySelector("#meal-search");
    const mobileSearchButton = document.querySelector("#search-submit");

    mobileSearchButton?.addEventListener("click", () => {
        runSearch(mobileSearchInput);
    });

    mobileSearchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            runSearch(mobileSearchInput);
        }
    });


    // ========================================
    // 7. DELIVERY LOCATION
    // ========================================

    document.querySelector("[data-location]")
        ?.addEventListener("click", () => {

            const location = window.prompt(
                "Enter your delivery area (for example, Lekki or Ikeja):"
            );

            if (!location?.trim()) return;

            const locationLabel = document.querySelector(
                "[data-location] span"
            );

            if (locationLabel) {
                locationLabel.textContent = location.trim();
            }

            showToast(`Delivery area set to ${location.trim()}.`);
        });


    // ========================================
    // 8. SHOPPING CART
    // ========================================

    let cart = [];

    try {
        cart = JSON.parse(
            localStorage.getItem("tastyHubCart") || "[]"
        );

        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch (error) {
        cart = [];
    }

    function updateCartCount() {

        const count = cart.reduce((total, item) => {
            return total + (Number(item.quantity) || 0);
        }, 0);

        document.querySelectorAll(".cart-count").forEach((badge) => {
            badge.textContent = count;
        });

        localStorage.setItem(
            "tastyHubCart",
            JSON.stringify(cart)
        );
    }


    // ========================================
    // 9. ADD-TO-CART SUPPORT
    // ========================================

    document.querySelectorAll(".add-cart").forEach((button) => {

        button.addEventListener("click", () => {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isFinite(price)) {
                showToast("This meal could not be added to your cart.");
                return;
            }

            const existing = cart.find((item) => item.name === name);

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    name,
                    price,
                    quantity: 1
                });
            }

            updateCartCount();

            showToast(`${name} added to your cart.`);
        });

    });


    // ========================================
    // 10. OPEN CART
    // ========================================

    document.querySelectorAll("[data-open-cart]").forEach((button) => {

        button.addEventListener("click", () => {

            if (!cart.length) {
                showToast(
                    "Your cart is empty. Add a meal to get started."
                );
                return;
            }

            const summary = cart.map((item) => {
                const subtotal = item.price * item.quantity;

                return (
                    `${item.quantity} × ${item.name} — ₦` +
                    subtotal.toLocaleString("en-NG")
                );
            }).join("\n");

            const total = cart.reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0);

            showToast(
                `Cart total: ₦${total.toLocaleString("en-NG")}.`
            );

            setTimeout(() => {
                const proceed = window.confirm(
                    `${summary}\n\n` +
                    `Total: ₦${total.toLocaleString("en-NG")}\n\n` +
                    `Go to checkout?`
                );

                if (proceed) {
                    window.location.href = "/cart";
                }
            }, 250);

        });

    });


    // Initialize cart indicators.
    updateCartCount();


    // ========================================
    // 11. AUTOMATIC FOOTER YEAR
    // ========================================

    const year = document.getElementById("current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

});




// ========================================
// 12. SCROLL-TRIGGERED ANIMATIONS
// ========================================

const revealGroups = [
    {
        selector: ".story-visual",
        className: "about-reveal-left"
    },
    {
        selector: ".story-content",
        className: "about-reveal-right"
    },
    {
        selector: ".purpose-card",
        className: "about-reveal"
    },
    {
        selector: ".why-card",
        className: "about-reveal-scale"
    },
    {
        selector: ".chef-image",
        className: "about-reveal-left"
    },
    {
        selector: ".chef-content",
        className: "about-reveal-right"
    },
    {
        selector: ".value-item",
        className: "about-reveal"
    },
    {
        selector: ".about-cta .cta-content",
        className: "about-reveal"
    }
];

const revealElements = [];

revealGroups.forEach(({ selector, className }) => {
    document.querySelectorAll(selector).forEach((element) => {
        element.classList.add(className);
        revealElements.push(element);
    });
});

if ("IntersectionObserver" in window) {

    const aboutRevealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );

    revealElements.forEach((element) => {
        aboutRevealObserver.observe(element);
    });

} else {

    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });

}