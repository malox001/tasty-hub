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
    // 3. SCROLL REVEAL ANIMATIONS
    // ========================================

    const revealElements = document.querySelectorAll(
        ".offer-card, .benefit-card, .section-heading"
    );

    revealElements.forEach((element) => {
        element.classList.add("animate-on-scroll");
    });

    /*
       The Offers stylesheet already animates these elements.
       This observer reveals them when they enter the viewport.
    */

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach((element) => {
            element.classList.add("show");
        });

    }


    // ========================================
    // 4. MOBILE SIDEBAR
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

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        sidebar?.setAttribute(
            "aria-hidden",
            String(!isOpen)
        );

    });


    document.querySelectorAll(
        "[data-close-menu], .mobile-sidebar a"
    ).forEach((element) => {

        element.addEventListener("click", closeMenu);

    });


    // Close sidebar and dropdowns with Escape.

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeMenu();

            document.querySelectorAll(
                ".account-nav.open, .category-nav.open"
            ).forEach((element) => {
                element.classList.remove("open");
            });

        }

    });


    // ========================================
    // 5. CATEGORY DROPDOWN
    // ========================================

    const categoryToggle = document.querySelector(
        ".dropdown-toggle"
    );

    categoryToggle?.addEventListener("click", (event) => {

        const parent = event.currentTarget.closest(".category-nav");

        if (!parent) return;

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    // ========================================
    // 6. ACCOUNT DROPDOWN
    // ========================================

    const accountToggle = document.querySelector(
        ".account-toggle"
    );

    accountToggle?.addEventListener("click", (event) => {

        const parent = event.currentTarget.closest(".account-nav");

        if (!parent) return;

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    document.addEventListener("click", (event) => {

        if (!event.target.closest(".account-nav")) {

            document.querySelector(
                ".account-nav"
            )?.classList.remove("open");

            document.querySelector(
                ".account-toggle"
            )?.setAttribute("aria-expanded", "false");

        }


        if (!event.target.closest(".category-nav")) {

            document.querySelector(
                ".category-nav"
            )?.classList.remove("open");

            document.querySelector(
                ".dropdown-toggle"
            )?.setAttribute("aria-expanded", "false");

        }

    });


    // ========================================
// 7. SEARCH FUNCTIONALITY
// ========================================

const desktopSearchInput = document.querySelector(
    "#desktop-meal-search"
);

const mobileSearchInput = document.querySelector(
    "#meal-search"
);

function runSearch(input) {
    const query = input?.value.trim();

    if (!query) {
        input?.focus();

        showToast("Enter a meal or dish to search for.");

        return;
    }

    window.location.href =
        `/Menu.html?search=${encodeURIComponent(query)}`;
}

// Desktop search form
const desktopSearchForm = document.querySelector(
    "#desktop-search-form"
);

desktopSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    runSearch(desktopSearchInput);
});

// Mobile search form
const mobileSearchForm = document.querySelector(
    "#mobile-search-form"
);

mobileSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    runSearch(mobileSearchInput);
});

// Allow Enter to trigger a search from either input
[desktopSearchInput, mobileSearchInput].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            runSearch(input);
        }
    });
});

    // ========================================
    // 8. DELIVERY LOCATION
    // ========================================

    document.querySelector("[data-location]")?.addEventListener(
        "click",
        () => {

            const location = window.prompt(
                "Enter your delivery area (for example, Lekki or Ikeja):"
            );

            if (location?.trim()) {

                const locationText = document.querySelector(
                    "[data-location] span"
                );

                if (locationText) {
                    locationText.textContent = location.trim();
                }

                showToast(
                    `Delivery area set to ${location.trim()}.`
                );

            }

        }
    );


    // ========================================
    // 9. LOAD EXISTING CART
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


    // ========================================
    // 10. UPDATE CART COUNTS
    // ========================================

    function updateCartCount() {

        const count = cart.reduce(
            (total, item) => {
                return total + (Number(item.quantity) || 0);
            },
            0
        );


        document.querySelectorAll(".cart-count").forEach((badge) => {

            badge.textContent = count;

        });


        try {

            localStorage.setItem(
                "tastyHubCart",
                JSON.stringify(cart)
            );

        } catch (error) {

            showToast("Unable to save your cart in this browser.");

        }

    }


    // ========================================
    // 11. ADD OFFER TO CART
    // ========================================

    document.querySelectorAll(".add-cart").forEach((button) => {

        button.addEventListener("click", () => {

            const name = button.dataset.name;

            const price = Number(button.dataset.price);


            if (!name || !Number.isFinite(price) || price <= 0) {

                showToast("This offer is currently unavailable.");

                return;

            }


            const existing = cart.find(
                (item) => item.name === name
            );


            if (existing) {

                existing.quantity =
                    (Number(existing.quantity) || 0) + 1;

                /*
                   Update the price in case the saved item
                   came from a previous version of the page.
                */

                existing.price = price;

            } else {

                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }


            updateCartCount();

            showToast(`${name} added to your cart.`);


            // Temporary visual feedback.

            const originalContent = button.innerHTML;

            button.innerHTML =
                '<i class="fa-solid fa-check"></i> Added to Cart';

            button.classList.add("added");

            setTimeout(() => {

                button.innerHTML = originalContent;

                button.classList.remove("added");

            }, 1200);

        });

    });


    // ========================================
    // 12. OPEN CART
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

                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const subtotal = price * quantity;

                return (
                    `${quantity} × ${item.name} — ₦` +
                    subtotal.toLocaleString("en-NG")
                );

            }).join("\n");


            const total = cart.reduce((sum, item) => {

                return sum +
                    (Number(item.price) || 0) *
                    (Number(item.quantity) || 0);

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

                    /*
                       This follows the cart route from Home.js.
                       Make sure your checkout page uses this path.
                    */

                    window.location.href = "/cart";

                }

            }, 250);

        });

    });


    // ========================================
    // 13. INITIALIZE CART COUNTS
    // ========================================

    updateCartCount();


    // ========================================
    // 14. AUTOMATIC FOOTER YEAR
    // ========================================

    const year = document.getElementById("current-year");

    if (year) {

        year.textContent = new Date().getFullYear();

    }

});