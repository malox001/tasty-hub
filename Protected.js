document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================
       CHECK WHETHER PAGE REQUIRES AUTHENTICATION
    ========================================== */

    const protectedPage = document.body.hasAttribute(
        "data-protected-page"
    );

    if (!protectedPage) return;


    /* =========================================
       PREVENT PAGE CONTENT FROM BEING USED
       BEFORE AUTHENTICATION IS VERIFIED
    ========================================== */

    document.body.classList.add("auth-checking");


    /* =========================================
       CHECK USER SESSION
    ========================================== */

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
            throw new Error("Unable to verify your session.");
        }


        const result = await response.json();


        /* =====================================
           REDIRECT UNAUTHENTICATED VISITORS
        ====================================== */

        if (
            !result.success ||
            result.authenticated !== true
        ) {

            window.location.replace("Login.html");

            return;

        }


        /* =====================================
           AUTHENTICATION SUCCESSFUL
        ====================================== */

        document.body.classList.remove("auth-checking");

        document.body.classList.add("authenticated-page");


        /* =====================================
           MAKE USER INFORMATION AVAILABLE
        ====================================== */

        document.dispatchEvent(
            new CustomEvent("tastyHubAuthenticated", {
                detail: {
                    user: result.user
                }
            })
        );


    } catch (error) {

        console.error(
            "Protected page authentication error:",
            error
        );

        window.location.replace("Login.html");

    }

});