document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENT SELECTORS
    ========================================== */

    const guestLinks = document.querySelectorAll("[data-guest-link]");
    const authLinks = document.querySelectorAll("[data-auth-link]");
    const logoutButtons = document.querySelectorAll("[data-logout]");

    const loadingOverlay = document.getElementById("loading-overlay");
    const toast = document.querySelector(".toast");


    /* =========================================
       TOAST NOTIFICATIONS
    ========================================== */

    let toastTimer;

    const showToast = (message, type = "success") => {

        if (!toast) return;

        clearTimeout(toastTimer);

        toast.textContent = message;

        toast.classList.remove(
            "show",
            "toast-success",
            "toast-error"
        );

        toast.classList.add(
            type === "error" ? "toast-error" : "toast-success"
        );

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);

    };


    /* =========================================
       LOADING OVERLAY
    ========================================== */

    const showLoader = () => {

        if (!loadingOverlay) return;

        loadingOverlay.classList.add("active");

        loadingOverlay.setAttribute("aria-hidden", "false");

        document.body.classList.add("loading-active");

    };


    const hideLoader = () => {

        if (!loadingOverlay) return;

        loadingOverlay.classList.remove("active");

        loadingOverlay.setAttribute("aria-hidden", "true");

        document.body.classList.remove("loading-active");

    };


    /* =========================================
       UPDATE ACCOUNT DROPDOWN
    ========================================== */

    const updateAccountMenu = (authenticated) => {

        guestLinks.forEach(link => {
            link.hidden = authenticated;
        });

        authLinks.forEach(link => {
            link.hidden = !authenticated;
        });

    };


    /* =========================================
       CHECK AUTHENTICATION STATUS
    ========================================== */

    const checkAuthentication = async () => {

        try {

            const response = await fetch(
                "backend/api/check-session.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to verify authentication.");
            }

            const result = await response.json();

            updateAccountMenu(
                result.authenticated === true
            );

        } catch (error) {

            console.error(
                "Authentication check failed:",
                error
            );

            updateAccountMenu(false);

        }

    };


    /* =========================================
       LOGOUT FUNCTIONALITY
    ========================================== */

    logoutButtons.forEach(button => {

        button.addEventListener("click", async () => {

            button.disabled = true;

            showLoader();

            try {

                const response = await fetch(
                    "backend/api/logout.php",
                    {
                        method: "POST",
                        credentials: "same-origin",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message || "Logout failed."
                    );

                }


                updateAccountMenu(false);

                showToast(
                    "You have been logged out successfully."
                );


                setTimeout(() => {

                    window.location.href = "/Login.html";

                }, 1000);


            } catch (error) {

                console.error("Logout error:", error);

                hideLoader();

                button.disabled = false;

                showToast(
                    error.message || "Unable to log out. Please try again.",
                    "error"
                );

            }

        });

    });


    /* =========================================
       INITIALIZE AUTHENTICATION
    ========================================== */

    checkAuthentication();

});