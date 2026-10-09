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


    // ===============================
// DESKTOP SEARCH TOGGLE
// ===============================

const searchToggle = document.querySelector(
    '.search-toggle, [data-search-toggle], [data-focus-search], #search-icon'
);

const searchBar = document.querySelector(
    '.desktop-search, .search-container, [data-search-bar]'
);

if (searchToggle && searchBar) {
    searchToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        searchBar.classList.toggle("search-open");

        if (searchBar.classList.contains("search-open")) {
            const input = searchBar.querySelector("input");

            if (input) {
                setTimeout(() => {
                    input.focus();
                }, 100);
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


// Scroll Reveal Animation
const revealElements = document.querySelectorAll(
  '.food-card, .menu-card, .product-card, .category-card, .section-heading'
);

revealElements.forEach((element) => {
  element.classList.add('animate-on-scroll');
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
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
    element.classList.add('show');
  });
}


    // ========================================
    // 1. HOMEPAGE FOOD IMAGE CAROUSEL
    // ========================================

    const slides = [
        {
            src: "images/Jollof Rice.jpg",
            alt: "A delicious plate of jollof rice"
        },
        {
            src: "images/Fried Rice and Chicken.jpg",
            alt: "Fried rice served with chicken"
        },
        {
            src: "images/Eba and Egusi.jpg",
            alt: "Eba served with egusi soup"
        }
    ];

    const heroImage = document.getElementById("hero-food-image");

    const dots = [
        ...document.querySelectorAll(".slide-dot")
    ];

    let currentSlide = 0;
    let carouselTimer;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        if (heroImage) {
            heroImage.style.opacity = "0.25";

            setTimeout(() => {
                heroImage.src = slides[currentSlide].src;
                heroImage.alt = slides[currentSlide].alt;
                heroImage.style.opacity = "1";
            }, 130);
        }

        dots.forEach((dot, i) => {
            const active = i === currentSlide;

            dot.classList.toggle("active", active);

            dot.setAttribute(
                "aria-pressed",
                String(active)
            );
        });
    }

    function restartCarousel() {
        clearInterval(carouselTimer);

        carouselTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 4000);
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.slide));
            restartCarousel();
        });
    });

    restartCarousel();


    // ========================================
    // 2. MOBILE HAMBURGER MENU
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


    // Close menus when the Escape key is pressed
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
    // 3. CATEGORIES DROPDOWN
    // ========================================

    const categoryToggle = document.querySelector(
        ".dropdown-toggle"
    );

    categoryToggle?.addEventListener("click", (event) => {
        const parent = event.currentTarget.closest(
            ".category-nav"
        );

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    // ========================================
    // 4. CUSTOMER ACCOUNT DROPDOWN
    // ========================================

    const accountToggle = document.querySelector(
        ".account-toggle"
    );

    accountToggle?.addEventListener("click", (event) => {
        const parent = event.currentTarget.closest(
            ".account-nav"
        );

        const isOpen = parent.classList.toggle("open");

        event.currentTarget.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    // Close dropdowns when clicking outside them
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






// ===============================
// SEARCH FUNCTIONALITY
// ===============================

const searchInputs = document.querySelectorAll(
    '#meal-search, #desktop-meal-search'
);

function runSearch(input) {
    const query = input?.value.trim();

    if (!query) {
        input?.focus();
        showToast("Enter a meal or dish to search for.");
        return;
    }

    window.location.href =
        `/menu?search=${encodeURIComponent(query)}`;
}

searchInputs.forEach((input) => {
    const form = input.closest("form");

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            runSearch(input);
        });
    }

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !form) {
            event.preventDefault();
            runSearch(input);
        }
    });
});


    // 6. DELIVERY LOCATION
    // ========================================

    document.querySelector(
        "[data-location]"
    )?.addEventListener("click", () => {

        const location = window.prompt(
            "Enter your delivery area (for example, Lekki or Ikeja):"
        );

        if (location?.trim()) {

            document.querySelector(
                "[data-location] span"
            ).textContent = location.trim();

            showToast(
                `Delivery area set to ${location.trim()}.`
            );

        }

    });


    // ========================================
    // 7. SHOPPING CART
    // ========================================

    let cart = [];

    // Load saved cart items from browser storage
    try {
        cart = JSON.parse(
            localStorage.getItem("tastyHubCart") || "[]"
        );
    } catch (error) {
        cart = [];
    }


    // Update cart quantity indicators
    function updateCartCount() {

        const count = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        document.querySelectorAll(
            ".cart-count"
        ).forEach((badge) => {
            badge.textContent = count;
        });

        localStorage.setItem(
            "tastyHubCart",
            JSON.stringify(cart)
        );

    }


    // ========================================
    // 8. ADD FOOD TO CART
    // ========================================

    document.querySelectorAll(
        ".add-cart"
    ).forEach((button) => {

        button.addEventListener("click", () => {

            const name = button.dataset.name;

            const price = Number(
                button.dataset.price
            );

            // Check whether the food is already in the cart
            const existing = cart.find(
                (item) => item.name === name
            );

            if (existing) {

                // Increase quantity if already added
                existing.quantity += 1;

            } else {

                // Add a new food item
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }

            // Save changes and update cart indicators
            updateCartCount();

            showToast(
                `${name} added to your cart.`
            );

        });

    });


    // ========================================
    // 9. OPEN CART
    // ========================================

    document.querySelectorAll(
        "[data-open-cart]"
    ).forEach((button) => {

        button.addEventListener("click", () => {

            // Check if the cart is empty
            if (!cart.length) {

                showToast(
                    "Your cart is empty. Add a meal to get started."
                );

                return;
            }


            // Generate a summary of the cart
            const summary = cart.map((item) => {

                const subtotal =
                    item.price * item.quantity;

                return (
                    `${item.quantity} × ${item.name} — ₦` +
                    subtotal.toLocaleString("en-NG")
                );

            }).join("\n");


            // Calculate the total price
            const total = cart.reduce(
                (sum, item) => {
                    return sum +
                        item.price * item.quantity;
                },
                0
            );


            showToast(
                `Cart total: ₦${total.toLocaleString("en-NG")}.`
            );


            // Ask whether the customer wants to continue
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


    // Initialize cart indicators on page load
    updateCartCount();


    // ========================================
    // 10. AUTOMATIC FOOTER YEAR
    // ========================================

    const year = document.getElementById(
        "current-year"
    );

    if (year) {
        year.textContent = new Date().getFullYear();
    }

});

