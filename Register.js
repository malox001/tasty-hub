document.addEventListener("DOMContentLoaded", () => {
    // =====================================
    // ELEMENTS
    // =====================================

    const registerForm = document.querySelector("#register-form");

    const fullName = document.querySelector("#full-name");
    const email = document.querySelector("#email");
    const phone = document.querySelector("#phone");
    const password = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirm-password");
    const terms = document.querySelector("#terms");

    const registerButton = document.querySelector("#register-submit");
    const googleButton = document.querySelector("#google-signup");

    const toast = document.querySelector(".toast");

    const loadingOverlay = document.querySelector("#loading-overlay");
    const loaderTitle = document.querySelector(".loader-title");
    const loaderDescription = document.querySelector(".loader-description");

    const strengthBars = document.querySelectorAll(".strength-bars span");
    const strengthText = document.querySelector("#strength-text");


    // =====================================
    // TOAST NOTIFICATIONS
    // =====================================

    let toastTimer;

    function showToast(message, type = "success") {
        if (!toast) return;

        toast.textContent = message;

        toast.classList.remove("toast-success", "toast-error");
        toast.classList.add(type === "error" ? "toast-error" : "toast-success");
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }


    // =====================================
    // LOADING OVERLAY
    // =====================================

    function showLoader(
        title = "Creating Your Account",
        description = "Please wait while we prepare your Tasty Hub experience."
    ) {
        if (!loadingOverlay) return;

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

        loadingOverlay.inert = false;
        loadingOverlay.setAttribute("aria-hidden", "false");
        loadingOverlay.classList.add("is-active");

        document.body.dataset.previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }

    function hideLoader() {
        if (!loadingOverlay) return;

        loadingOverlay.classList.remove("is-active");
        loadingOverlay.setAttribute("aria-hidden", "true");
        loadingOverlay.inert = true;

        document.body.style.overflow =
            document.body.dataset.previousOverflow || "";

        delete document.body.dataset.previousOverflow;
    }


    // =====================================
    // ERROR HANDLING
    // =====================================

    function showError(input, errorElement, message) {
        if (input) {
            input.classList.add("invalid");
            input.setAttribute("aria-invalid", "true");
        }

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearError(input, errorElement) {
        if (input) {
            input.classList.remove("invalid");
            input.removeAttribute("aria-invalid");
        }

        if (errorElement) {
            errorElement.textContent = "";
        }
    }


    // =====================================
    // PASSWORD VISIBILITY
    // =====================================

    document.querySelectorAll("[data-toggle-password]").forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.togglePassword;
            const targetInput = document.getElementById(targetId);

            if (!targetInput) return;

            const isPassword = targetInput.type === "password";

            targetInput.type = isPassword ? "text" : "password";

            const icon = button.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-eye", !isPassword);
                icon.classList.toggle("fa-eye-slash", isPassword);
            }

            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );
        });
    });


    // =====================================
    // PASSWORD STRENGTH
    // =====================================

    function checkPasswordStrength(value) {
        let score = 0;

        if (value.length >= 8) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        const strengthLevels = [
            "",
            "Very Weak",
            "Weak",
            "Fair",
            "Good",
            "Strong"
        ];

        strengthBars.forEach((bar, index) => {
            bar.classList.toggle("active", index < score);
        });

        if (strengthText) {
            strengthText.textContent = value
                ? `Password strength: ${strengthLevels[score]}`
                : "Password strength";
        }

        return score;
    }

    if (password) {
        password.addEventListener("input", () => {
            checkPasswordStrength(password.value);

            if (password.value.length > 0) {
                clearError(
                    password,
                    document.querySelector("#password-error")
                );
            }

            if (confirmPassword && confirmPassword.value) {
                validateConfirmPassword();
            }
        });
    }


    // =====================================
    // FIELD VALIDATION
    // =====================================

    function validateFullName() {
        const error = document.querySelector("#name-error");
        const value = fullName?.value.trim() || "";

        if (!value) {
            showError(fullName, error, "Please enter your full name.");
            return false;
        }

        if (value.length < 3) {
            showError(fullName, error, "Your name must contain at least 3 characters.");
            return false;
        }

        clearError(fullName, error);
        return true;
    }


    function validateEmail() {
        const error = document.querySelector("#email-error");
        const value = email?.value.trim() || "";

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            showError(email, error, "Please enter your email address.");
            return false;
        }

        if (!emailPattern.test(value)) {
            showError(email, error, "Please enter a valid email address.");
            return false;
        }

        clearError(email, error);
        return true;
    }


    function validatePhone() {
        const error = document.querySelector("#phone-error");
        const value = phone?.value.trim() || "";

        const cleanedPhone = value.replace(/[\s()+-]/g, "");

        if (!value) {
            showError(phone, error, "Please enter your phone number.");
            return false;
        }

        if (!/^\d{7,15}$/.test(cleanedPhone)) {
            showError(phone, error, "Please enter a valid phone number.");
            return false;
        }

        clearError(phone, error);
        return true;
    }


    function validatePassword() {
        const error = document.querySelector("#password-error");
        const value = password?.value || "";

        if (!value) {
            showError(password, error, "Please create a password.");
            return false;
        }

        if (value.length < 8) {
            showError(password, error, "Password must contain at least 8 characters.");
            return false;
        }

        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value)) {
            showError(password, error, "Include both uppercase and lowercase letters.");
            return false;
        }

        if (!/[0-9]/.test(value)) {
            showError(password, error, "Include at least one number.");
            return false;
        }

        clearError(password, error);
        return true;
    }


    function validateConfirmPassword() {
        const error = document.querySelector("#confirm-error");
        const value = confirmPassword?.value || "";

        if (!value) {
            showError(confirmPassword, error, "Please confirm your password.");
            return false;
        }

        if (value !== password?.value) {
            showError(confirmPassword, error, "Your passwords do not match.");
            return false;
        }

        clearError(confirmPassword, error);
        return true;
    }


    function validateTerms() {
        const error = document.querySelector("#terms-error");

        if (!terms?.checked) {
            if (error) {
                error.textContent = "Please accept the Terms and Conditions.";
            }

            return false;
        }

        if (error) {
            error.textContent = "";
        }

        return true;
    }


    // =====================================
    // REAL-TIME VALIDATION
    // =====================================

    fullName?.addEventListener("blur", validateFullName);
    email?.addEventListener("blur", validateEmail);
    phone?.addEventListener("blur", validatePhone);
    password?.addEventListener("blur", validatePassword);
    confirmPassword?.addEventListener("blur", validateConfirmPassword);

    terms?.addEventListener("change", validateTerms);


    // =====================================
    // COMPLETE FORM VALIDATION
    // =====================================

    function validateForm() {
        const validations = [
            validateFullName(),
            validateEmail(),
            validatePhone(),
            validatePassword(),
            validateConfirmPassword(),
            validateTerms()
        ];

        return validations.every(Boolean);
    }


    // =====================================
    // REGISTRATION SUBMISSION
    // =====================================

    // =====================================
// REGISTRATION SUBMISSION
// =====================================

registerForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!validateForm()) {
        showToast("Please check the highlighted fields.", "error");

        const firstInvalid = registerForm.querySelector(".invalid");
        firstInvalid?.focus();

        return;
    }

    // Collect registration information
    const formData = {
        full_name: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        password: password.value,
        confirm_password: confirmPassword.value,
        terms: terms.checked
    };

    const originalButtonContent = registerButton?.innerHTML;

    let minimumLoaderTime = new Promise(resolve => {
        setTimeout(resolve, 1200);
    });

    try {
        // Prevent multiple submissions
        if (registerButton) {
            registerButton.disabled = true;
            registerButton.textContent = "Creating Account...";
        }

        // Show loader before backend request
        showLoader(
            "Creating Your Account",
            "Securing your details. Just a moment!"
        );

        // Send information to PHP
        const response = await fetch("api/register.php", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(formData)
        });

        // Read PHP response
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Registration failed. Please try again."
            );
        }

        await minimumLoaderTime;

        showToast(result.message, "success");

        // Clear registration form
        registerForm.reset();

        checkPasswordStrength("");

        document.querySelectorAll(".strength-bars span")
            .forEach(bar => bar.classList.remove("active"));

        // Redirect to login page
        setTimeout(() => {
            window.location.href = "Login.html";
        }, 1800);

    } catch (error) {

        await minimumLoaderTime;

        console.error("Registration error:", error);

        showToast(
            error.message || "Unable to create your account. Please try again.",
            "error"
        );

    } finally {

        hideLoader();

        if (registerButton) {
            registerButton.disabled = false;
            registerButton.innerHTML = originalButtonContent;
        }
    }
});

    // =====================================
    // GOOGLE SIGN-UP
    // =====================================

    googleButton?.addEventListener("click", () => {
        showToast(
            "Google sign-up will be activated when we connect Google authentication."
        );
    });


    // =====================================
    // INITIAL STATE
    // =====================================

    hideLoader();

    if (password) {
        checkPasswordStrength("");
    }

});