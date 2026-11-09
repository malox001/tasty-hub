document.addEventListener("DOMContentLoaded", () => {

    const loadingOverlay = document.querySelector("#loading-overlay");
    const toast = document.querySelector(".toast");

    let toastTimer;


    // =====================================
    // LOADING OVERLAY
    // =====================================

    const showLoader = () => {
        if (!loadingOverlay) return;

        loadingOverlay.style.display = "flex";
        loadingOverlay.style.opacity = "1";
        loadingOverlay.style.visibility = "visible";
        loadingOverlay.style.pointerEvents = "auto";
    };


    const hideLoader = () => {
        if (!loadingOverlay) return;

        loadingOverlay.style.opacity = "0";
        loadingOverlay.style.visibility = "hidden";
        loadingOverlay.style.pointerEvents = "none";
    };


    // =====================================
    // TOAST NOTIFICATION
    // =====================================

    const showToast = (message) => {

        if (!toast) {
            console.log(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);

    };


    // =====================================
    // DISPLAY PROFILE INFORMATION
    // =====================================

    const displayProfile = (user) => {

        const firstName = user.full_name.trim().split(/\s+/)[0];


        // Welcome heading
        const welcomeName = document.querySelector(
            "[data-profile-name]"
        );

        if (welcomeName) {
            welcomeName.textContent = firstName;
        }


        // Profile overview name
        const fullName = document.querySelector(
            "[data-profile-full-name]"
        );

        if (fullName) {
            fullName.textContent = user.full_name;
        }


        // Profile overview email
        const profileEmail = document.querySelector(
            "[data-profile-email]"
        );

        if (profileEmail) {
            profileEmail.textContent = user.email;
        }


        // Personal information - full name
        const detailName = document.querySelector(
            "[data-profile-detail-name]"
        );

        if (detailName) {
            detailName.textContent = user.full_name;
        }


        // Personal information - email
        const detailEmail = document.querySelector(
            "[data-profile-detail-email]"
        );

        if (detailEmail) {
            detailEmail.textContent = user.email;
        }


        // Personal information - phone
        const detailPhone = document.querySelector(
            "[data-profile-detail-phone]"
        );

        if (detailPhone) {
            detailPhone.textContent = user.phone || "Not provided";
        }

    };


    // =====================================
    // FETCH PROFILE FROM DATABASE
    // =====================================

    const loadProfile = async () => {

        showLoader();

        try {

            const response = await fetch(
                "backend/api/profile.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",

                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            const result = await response.json();


            // Authentication expired
            if (response.status === 401) {
                window.location.replace("Login.html");
                return;
            }


            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load your profile."
                );
            }


            // Display retrieved user information
            displayProfile(result.user);


            console.log("Tasty Hub profile loaded successfully.");

        } catch (error) {

            console.error("Profile loading error:", error);

            showToast(
                error.message || "Something went wrong while loading your profile."
            );

        } finally {

            hideLoader();

        }

    };


    // =====================================
    // WAIT FOR AUTHENTICATION
    // =====================================

    document.addEventListener(
        "tastyHubAuthenticated",
        () => {
            loadProfile();
        },
        { once: true }
    );

});