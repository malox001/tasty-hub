document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. TOAST NOTIFICATIONS
    // ========================================

    const toast = document.querySelector(".toast");
    let toastTimer;

    // =========================================
// TASTY HUB LOADER CONTROLLER
// =========================================

const loadingOverlay = document.querySelector("#loading-overlay");
const loaderTitle = document.querySelector(".loader-title");
const loaderDescription = document.querySelector(".loader-description");

let activeRequests = 0;

function showLoader(
    title = "Preparing Your Request",
    description = "Good things are worth the wait!"
) {
    if (!loadingOverlay) return;

    activeRequests++;

    // Update the loader text.
    if (loaderTitle) {
        loaderTitle.textContent = title;

        const dots = document.createElement("span");
        dots.className = "loader-dots";
        dots.setAttribute("aria-hidden", "true");

        loaderTitle.appendChild(dots);
    }

    if (loaderDescription) {
        loaderDescription.textContent = description;
    }

    // Reveal the overlay.
    loadingOverlay.inert = false;
    loadingOverlay.setAttribute("aria-hidden", "false");
    loadingOverlay.classList.add("is-active");

    // Prevent the page from scrolling behind the overlay.
    if (activeRequests === 1) {
        document.body.dataset.previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";
    }
}

function hideLoader() {
    if (!loadingOverlay) return;

    activeRequests = Math.max(0, activeRequests - 1);

    // Keep the loader visible if another tracked request is running.
    if (activeRequests > 0) return;

    loadingOverlay.classList.remove("is-active");
    loadingOverlay.setAttribute("aria-hidden", "true");
    loadingOverlay.inert = true;

    // Restore the previous scrolling setting.
    document.body.style.overflow =
        document.body.dataset.previousOverflow || "";

    delete document.body.dataset.previousOverflow;
}

    function showToast(message, type = "success") {
        if (!toast) return;

        toast.textContent = message;

        toast.classList.remove(
            "toast-success",
            "toast-error"
        );

        toast.classList.add(
            "show",
            type === "error" ? "toast-error" : "toast-success"
        );

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove(
                "show",
                "toast-success",
                "toast-error"
            );
        }, 3200);
    }


    // ========================================
    // 2. DESKTOP SEARCH
    // ========================================

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
    // 3. SCROLL REVEAL
    // ========================================

    const revealElements = document.querySelectorAll(
        ".animate-on-scroll"
    );

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

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

        sidebar?.setAttribute(
            "aria-hidden",
            "true"
        );

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


    // ========================================
    // 5. DROPDOWNS
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


    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeMenu();

            document.querySelectorAll(
                ".account-nav.open, .category-nav.open"
            ).forEach((element) => {
                element.classList.remove("open");
            });

            document.querySelector(".account-toggle")
                ?.setAttribute("aria-expanded", "false");

            document.querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "false");

            searchBar?.classList.remove("search-open");

        }

    });


    // ========================================
    // 6. SEARCH FUNCTIONALITY
    // ========================================

    const desktopSearchForm = document.querySelector("#search-form");

    const desktopSearchInput = document.querySelector(
        "#desktop-meal-search"
    );

    const mobileSearchInput = document.querySelector(
        "#meal-search"
    );

    const mobileSearchButton = document.querySelector(
        "#search-submit"
    );


    function runSearch(input) {

        const query = input?.value.trim();

        if (!query) {

            input?.focus();

            showToast(
                "Enter a meal or dish to search for.",
                "error"
            );

            return;

        }

        window.location.href =
            `/Menu.html?search=${encodeURIComponent(query)}`;

    }


    desktopSearchForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        runSearch(desktopSearchInput);

    });


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

            if (location?.trim()) {

                const locationLabel = document.querySelector(
                    "[data-location] span"
                );

                if (locationLabel) {
                    locationLabel.textContent = location.trim();
                }

                showToast(
                    `Delivery area set to ${location.trim()}.`
                );

            }

        });


    // ========================================
    // 8. CART COUNT
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

        const count = cart.reduce(
            (total, item) => total + (Number(item.quantity) || 0),
            0
        );

        document.querySelectorAll(".cart-count")
            .forEach((badge) => {
                badge.textContent = count;
            });

        localStorage.setItem(
            "tastyHubCart",
            JSON.stringify(cart)
        );

    }


    // ========================================
    // 9. OPEN CART
    // ========================================

    document.querySelectorAll("[data-open-cart]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                if (!cart.length) {

                    showToast(
                        "Your cart is empty. Explore the menu to get started.",
                        "error"
                    );

                    return;

                }


                const summary = cart.map((item) => {

                    const quantity = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;
                    const subtotal = quantity * price;

                    return (
                        `${quantity} × ${item.name} — ₦` +
                        subtotal.toLocaleString("en-NG")
                    );

                }).join("\n");


                const total = cart.reduce(
                    (sum, item) => {
                        return sum +
                            (Number(item.price) || 0) *
                            (Number(item.quantity) || 0);
                    },
                    0
                );


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

                }, 300);

            });

        });


    updateCartCount();


    // ========================================
    // 10. AUTOMATIC FOOTER YEAR
    // ========================================

    const year = document.getElementById("current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    // ========================================
    // 11. CONTACT FORM
    // ========================================

    const contactForm = document.querySelector("#contact-form");

    const nameInput = document.querySelector("#contact-name");
    const emailInput = document.querySelector("#contact-email");
    const subjectInput = document.querySelector("#contact-subject");
    const orderInput = document.querySelector("#contact-order");
    const messageInput = document.querySelector("#contact-message");
    const consentInput = document.querySelector("#contact-consent");

    const submitButton = document.querySelector("#contact-submit");
    const messageCounter = document.querySelector("#message-counter");


    // Display field validation errors.

    function setFieldError(input, errorElement, message) {

        if (!input || !errorElement) return;

        errorElement.textContent = message;

        input.classList.toggle("invalid", Boolean(message));

        input.setAttribute(
            "aria-invalid",
            String(Boolean(message))
        );

    }


    // Clear an error when the user edits the field.

    function clearFieldError(input, errorElement) {

        if (!input || !errorElement) return;

        setFieldError(input, errorElement, "");

    }


    const nameError = document.querySelector("#name-error");
    const emailError = document.querySelector("#email-error");
    const subjectError = document.querySelector("#subject-error");
    const messageError = document.querySelector("#message-error");
    const consentError = document.querySelector("#consent-error");


    nameInput?.addEventListener("input", () => {
        clearFieldError(nameInput, nameError);
    });


    emailInput?.addEventListener("input", () => {
        clearFieldError(emailInput, emailError);
    });


    subjectInput?.addEventListener("change", () => {
        clearFieldError(subjectInput, subjectError);
    });


    messageInput?.addEventListener("input", () => {

        clearFieldError(messageInput, messageError);

        if (messageCounter) {

            messageCounter.textContent =
                `${messageInput.value.length} / 1500`;

        }

    });


    consentInput?.addEventListener("change", () => {

        if (consentError) {
            consentError.textContent = "";
        }

    });


    // Validate the contact form.

    function validateContactForm() {

        let valid = true;

        const name = nameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const subject = subjectInput?.value || "";
        const message = messageInput?.value.trim() || "";


        if (name.length < 2) {

            setFieldError(
                nameInput,
                nameError,
                "Please enter your full name."
            );

            valid = false;

        } else {

            clearFieldError(nameInput, nameError);

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            setFieldError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            valid = false;

        } else {

            clearFieldError(emailInput, emailError);

        }


        if (!subject) {

            setFieldError(
                subjectInput,
                subjectError,
                "Please select an enquiry type."
            );

            valid = false;

        } else {

            clearFieldError(subjectInput, subjectError);

        }


        if (message.length < 10) {

            setFieldError(
                messageInput,
                messageError,
                "Please enter at least 10 characters."
            );

            valid = false;

        } else if (message.length > 1500) {

            setFieldError(
                messageInput,
                messageError,
                "Your message cannot exceed 1500 characters."
            );

            valid = false;

        } else {

            clearFieldError(messageInput, messageError);

        }


        if (!consentInput?.checked) {

            if (consentError) {
                consentError.textContent =
                    "Please confirm before continuing.";
            }

            valid = false;

        } else if (consentError) {

            consentError.textContent = "";

        }


        if (!valid) {

            const firstInvalid = contactForm?.querySelector(
                ".invalid, input[type='checkbox']:not(:checked)"
            );

            firstInvalid?.focus();

        }

        return valid;

    }




    // Contact form submission to PHP and MySQL.
let isSubmittingContactForm = false;

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Run the existing frontend validation first.
    if (!validateContactForm()) {
        showToast("Please review the highlighted fields.", "error");
        return;
    }

    // Prevent duplicate submissions.
    if (isSubmittingContactForm) {
        return;
    }

    isSubmittingContactForm = true;

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
    }

    const loaderStartTime = Date.now();

showLoader(
    "Sending Your Message",
    "Please wait while we send your enquiry to Tasty Hub."
);

    try {
        const response = await fetch("backend/contact.php", {
            method: "POST",
            body: new FormData(contactForm),
            headers: {
                "Accept": "application/json"
            }
        });

       const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "We could not send your message."
            );
        }

        const elapsedTime = Date.now() - loaderStartTime;
        const minimumLoaderTime = 1500;

if (elapsedTime < minimumLoaderTime) {
    await new Promise(resolve =>
        setTimeout(resolve, minimumLoaderTime - elapsedTime)
    );
}

        showToast(result.message, "success");

        contactForm.reset();

        if (messageCounter) {
            messageCounter.textContent = "0 / 1500";
        }

        // Clear previous validation errors.
        clearFieldError(nameInput, nameError);
        clearFieldError(emailInput, emailError);
        clearFieldError(subjectInput, subjectError);
        clearFieldError(messageInput, messageError);

        if (consentError) {
            consentError.textContent = "";
        }

    } catch (error) {
        console.error("Contact form submission failed:", error);

        showToast(
            error.message ||
            "Unable to connect to the server. Please try again.",
            "error"
        );

    } finally {
    hideLoader();

    isSubmittingContactForm = false;

    if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
    }
}
});
        /*
         * FRONTEND DEMONSTRATION ONLY.
         *
         * No email is sent and no message is stored on a server.
         * Connect this form to PHP/MySQL or an email service
         * before using it for real customer enquiries.
         */

        /*console.log(
            "Contact form submission preview:",
            formData
        );


        showToast(
            "Your form passed validation. Email delivery is not connected yet."
        );


        /*
         * Do not reset the form automatically.
         * This allows the user to retain their message until
         * backend submission has been implemented.
         */
});