document.addEventListener("DOMContentLoaded", () => {
    const toast = document.querySelector(".toast");
    let toastTimer;

    // Display notification messages
    const showToast = (message) => {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    };

    // Desktop search toggle
    const searchToggle = document.querySelector("[data-focus-search]");
    const searchBar = document.querySelector(".site-header .desktop-search");

    if (searchToggle && searchBar) {
        searchToggle.addEventListener("click", (event) => {
            event.preventDefault();

            const open = searchBar.classList.toggle("search-open");

            if (open) {
                setTimeout(() => {
                    searchBar.querySelector("input")?.focus();
                }, 100);
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

    // Mobile sidebar navigation
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector("#mobile-sidebar");

    const closeMenu = () => {
        document.body.classList.remove("menu-open");

        menuToggle?.setAttribute("aria-expanded", "false");
        sidebar?.setAttribute("aria-hidden", "true");
    };

    menuToggle?.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", String(open));
        sidebar?.setAttribute("aria-hidden", String(!open));
    });

    document
        .querySelectorAll("[data-close-menu], .mobile-sidebar a")
        .forEach((element) => {
            element.addEventListener("click", closeMenu);
        });

    // Close menus when Escape is pressed
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();

            document
                .querySelectorAll(".account-nav.open, .category-nav.open")
                .forEach((element) => {
                    element.classList.remove("open");
                });

            document
                .querySelectorAll(".account-toggle, .dropdown-toggle")
                .forEach((button) => {
                    button.setAttribute("aria-expanded", "false");
                });
        }
    });

    // Categories dropdown
    document.querySelector(".dropdown-toggle")?.addEventListener(
        "click",
        (event) => {
            const parent = event.currentTarget.closest(".category-nav");

            const open = parent.classList.toggle("open");

            event.currentTarget.setAttribute(
                "aria-expanded",
                String(open)
            );
        }
    );

    // Account dropdown
    document.querySelector(".account-toggle")?.addEventListener(
        "click",
        (event) => {
            const parent = event.currentTarget.closest(".account-nav");

            const open = parent.classList.toggle("open");

            event.currentTarget.setAttribute(
                "aria-expanded",
                String(open)
            );
        }
    );

    // Close dropdowns when clicking outside them
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".account-nav")) {
            document
                .querySelector(".account-nav")
                ?.classList.remove("open");

            document
                .querySelector(".account-toggle")
                ?.setAttribute("aria-expanded", "false");
        }

        if (!event.target.closest(".category-nav")) {
            document
                .querySelector(".category-nav")
                ?.classList.remove("open");

            document
                .querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "false");
        }
    });

    // Menu filtering and search
    const cards = [...document.querySelectorAll(".meal-card")];

    const filterButtons = [
        ...document.querySelectorAll(".filter-button")
    ];

    const emptyMessage = document.querySelector(".no-meals-message");

    const desktopSearch = document.querySelector("#desktop-meal-search");
    const mobileSearch = document.querySelector("#meal-search");

    let activeCategory = "all";
    let searchQuery = "";

    // Match category links from the Home page
    const categoryAliases = {
        all: "all",
        rice: "rice",
        "fast-food": "snacks",
        soups: "swallow",
        swallow: "swallow",
        snacks: "snacks",
        drinks: "drinks"
    };

    // Apply category and search filters
    function applyFilters() {
        let visible = 0;

        cards.forEach((card) => {
            const category = (
                card.dataset.category || ""
            ).toLowerCase();

            const searchable = `
                ${card.dataset.name || ""}
                ${card.querySelector("h3")?.textContent || ""}
                ${card.querySelector(".meal-info > p")?.textContent || ""}
            `.toLowerCase();

            const categoryMatch =
                activeCategory === "all" ||
                category === activeCategory;

            const searchMatch =
                !searchQuery ||
                searchable.includes(searchQuery);

            const show = categoryMatch && searchMatch;

            card.hidden = !show;

            if (show) {
                visible++;
            }
        });

        if (emptyMessage) {
            emptyMessage.hidden = visible > 0;
        }
    }

    // Filter meals when a category button is clicked
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "all";

            filterButtons.forEach((item) => {
                item.classList.toggle("active", item === button);
            });

            applyFilters();
        });
    });

    // Keep desktop and mobile searches synchronized
    function syncSearch(value, source) {
        searchQuery = value.trim().toLowerCase();

        [desktopSearch, mobileSearch].forEach((input) => {
            if (input && input !== source) {
                input.value = value;
            }
        });

        applyFilters();
    }

    // Search meals as the user types
    [desktopSearch, mobileSearch].forEach((input) => {
        input?.addEventListener("input", () => {
            syncSearch(input.value, input);
        });
    });

    // Desktop search form submission
    const searchForm = document.querySelector("#search-form");

    searchForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!desktopSearch?.value.trim()) {
            showToast("Enter a meal or dish to search for.");
            desktopSearch?.focus();
            return;
        }

        syncSearch(desktopSearch.value, desktopSearch);

        document
            .querySelector("#menu-items")
            ?.scrollIntoView({ behavior: "smooth" });
    });

    // Mobile search button
    document
        .querySelector("#search-submit")
        ?.addEventListener("click", () => {
            if (!mobileSearch?.value.trim()) {
                showToast("Enter a meal or dish to search for.");
                mobileSearch?.focus();
                return;
            }

            syncSearch(mobileSearch.value, mobileSearch);

            document
                .querySelector("#menu-items")
                ?.scrollIntoView({ behavior: "smooth" });
        });

    // Read category and search parameters from the URL
    const params = new URLSearchParams(window.location.search);

    const incomingCategory =
        categoryAliases[params.get("category") || "all"] || "all";

    if (incomingCategory !== "all") {
        activeCategory = incomingCategory;

        filterButtons.forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.category === activeCategory
            );
        });
    }

    const incomingSearch = params.get("search");

    if (incomingSearch) {
        if (desktopSearch) {
            desktopSearch.value = incomingSearch;
        }

        if (mobileSearch) {
            mobileSearch.value = incomingSearch;
        }

        searchQuery = incomingSearch.toLowerCase();
    }

    // Display the correct meals on page load
    applyFilters();

    // Shopping cart shared through localStorage
    let cart = [];

    try {
        cart = JSON.parse(
            localStorage.getItem("tastyHubCart") || "[]"
        );

        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch {
        cart = [];
    }

    // Update the cart count
    function updateCartCount() {
        const count = cart.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0);
        }, 0);

        document.querySelectorAll(".cart-count").forEach((badge) => {
            badge.textContent = count;
        });

        try {
            localStorage.setItem(
                "tastyHubCart",
                JSON.stringify(cart)
            );
        } catch {
            // Continue if localStorage is unavailable
        }
    }

    // Add meals to the cart
    document
        .querySelectorAll(".add-to-cart, .add-cart")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const name =
                    button.dataset.name ||
                    button
                        .closest(".meal-card")
                        ?.querySelector("h3")
                        ?.textContent
                        ?.trim();

                const price = Number(button.dataset.price || 0);

                if (!name || !price) {
                    showToast(
                        "This meal could not be added. Please try again."
                    );
                    return;
                }

                const existing = cart.find(
                    (item) => item.name === name
                );

                if (existing) {
                    existing.quantity =
                        (Number(existing.quantity) || 0) + 1;
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

    // Open the cart and display its contents
    document
        .querySelectorAll("[data-open-cart]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                if (!cart.length) {
                    showToast(
                        "Your cart is empty. Add a meal to get started."
                    );
                    return;
                }

                const total = cart.reduce((sum, item) => {
                    return (
                        sum +
                        Number(item.price || 0) *
                            Number(item.quantity || 0)
                    );
                }, 0);

                const summary = cart
                    .map((item) => {
                        const itemTotal =
                            item.price * item.quantity;

                        return `${item.quantity} × ${item.name} — ₦${itemTotal.toLocaleString("en-NG")}`;
                    })
                    .join("\n");

                setTimeout(() => {
                    const proceed = window.confirm(
                        `${summary}\n\nTotal: ₦${total.toLocaleString("en-NG")}\n\nGo to checkout?`
                    );

                    if (proceed) {
                        window.location.href = "/cart";
                    }
                }, 150);
            });
        });

    // Update cart count when the page loads
    updateCartCount();

    // Set the user's delivery location
    document
        .querySelector("[data-location]")
        ?.addEventListener("click", () => {
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
        });

    // Automatically update the footer year if the element exists
    const year = document.getElementById("current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
});