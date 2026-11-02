document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENT SELECTORS
    ========================================== */

    const loginForm = document.getElementById("login-form");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    const rememberMe = document.getElementById("remember-me");

    const loginButton = document.getElementById("login-submit");
    const googleButton = document.getElementById("google-login");

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
            "toast-success",
            "toast-error",
            "show"
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
       CLEAR FIELD ERRORS
    ========================================== */

    const clearErrors = () => {

        if (emailError) {
            emailError.textContent = "";
        }

        if (passwordError) {
            passwordError.textContent = "";
        }

        emailInput?.classList.remove("invalid");
        passwordInput?.classList.remove("invalid");

    };


    /* =========================================
       DISPLAY FIELD ERRORS
    ========================================== */

    const showFieldError = (input, errorElement, message) => {

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (input) {
            input.classList.add("invalid");
        }

    };


    /* =========================================
       EMAIL VALIDATION
    ========================================== */

    const isValidEmail = (email) => {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);

    };


    /* =========================================
       PASSWORD VISIBILITY TOGGLE
    ========================================== */

    document.querySelectorAll("[data-toggle-password]").forEach(button => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.togglePassword;
            const targetInput = document.getElementById(targetId);

            if (!targetInput) return;

            const isPassword = targetInput.type === "password";

            targetInput.type = isPassword ? "text" : "password";

            button.innerHTML = isPassword
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';

            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

        });

    });


    /* =========================================
       REMOVE ERRORS WHILE TYPING
    ========================================== */

    emailInput?.addEventListener("input", () => {

        emailInput.classList.remove("invalid");

        if (emailError) {
            emailError.textContent = "";
        }

    });


    passwordInput?.addEventListener("input", () => {

        passwordInput.classList.remove("invalid");

        if (passwordError) {
            passwordError.textContent = "";
        }

    });


    /* =========================================
       LOGIN FORM SUBMISSION
    ========================================== */

    loginForm?.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const remember = rememberMe?.checked ? 1 : 0;

        let hasError = false;


        /* =====================================
           VALIDATE EMAIL
        ====================================== */

        if (!email) {

            showFieldError(
                emailInput,
                emailError,
                "Please enter your email address."
            );

            hasError = true;

        } else if (!isValidEmail(email)) {

            showFieldError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            hasError = true;

        }


        /* =====================================
           VALIDATE PASSWORD
        ====================================== */

        if (!password.trim()) {

            showFieldError(
                passwordInput,
                passwordError,
                "Please enter your password."
            );

            hasError = true;

        }


        if (hasError) {

            showToast(
                "Please correct the highlighted fields.",
                "error"
            );

            return;

        }


        /* =====================================
           PREPARE LOGIN REQUEST
        ====================================== */

        loginButton.disabled = true;

        const originalButtonContent = loginButton.innerHTML;

        showLoader();


        try {

            const response = await fetch("backend/api/login.php", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({

                    email: email,
                    password: password,
                    remember_me: remember

                })

            });


            /* =================================
               READ SERVER RESPONSE
            ================================== */

            let result;

            try {

                result = await response.json();

            } catch (error) {

                throw new Error(
                    "The server returned an invalid response. Please try again."
                );

            }


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message || "Login failed. Please check your details."
                );

            }


            /* =================================
               SUCCESSFUL LOGIN
            ================================== */

            showToast(
                result.message || "Login successful! Welcome back.",
                "success"
            );


            loginButton.innerHTML =
                '<i class="fa-solid fa-check"></i> Login Successful';


            setTimeout(() => {

                window.location.href = result.redirect || "Home.html";

            }, 1000);


        } catch (error) {

            console.error("Login error:", error);

            hideLoader();

            loginButton.disabled = false;

            loginButton.innerHTML = originalButtonContent;

            showToast(
                error.message || "Something went wrong. Please try again.",
                "error"
            );

        }

    });


    /* =========================================
       GOOGLE LOGIN BUTTON
       GOOGLE AUTHENTICATION WILL BE INTEGRATED
       IN A LATER PHASE.
    ========================================== */

    googleButton?.addEventListener("click", () => {

        showToast(
            "Google sign-in is coming soon!",
            "success"
        );

    });


    /* =========================================
       INITIAL BUTTON STATE
    ========================================== */

    if (loginButton) {
        loginButton.disabled = false;
    }

});