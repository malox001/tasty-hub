document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. ABOUT PAGE SCROLL REVEAL
    // ========================================

    const revealItems = document.querySelectorAll(".reveal-item");

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("revealed");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealItems.forEach((item) => {
            revealObserver.observe(item);
        });

    } else {

        revealItems.forEach((item) => {
            item.classList.add("revealed");
        });

    }


    // ========================================
    // 2. SMOOTH SCROLL FOR STORY BUTTON
    // ========================================

    document.querySelectorAll(
        'a[href="#our-story"]'
    ).forEach((link) => {

        link.addEventListener("click", (event) => {

            const target = document.querySelector("#our-story");

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

        });

    });


    // ========================================
    // 3. HERO FOOD IMAGE FALLBACK
    // ========================================

    const heroImage = document.querySelector(
        ".about-hero-image"
    );

    if (heroImage) {

        heroImage.addEventListener("error", () => {

            heroImage.classList.add("image-unavailable");

            heroImage.alt = "Tasty Hub food image unavailable";

        });

    }


    // ========================================
    // 4. FOOD IMAGE ENTRANCE EFFECT
    // ========================================

    const foodImages = document.querySelectorAll(
        ".story-image, .gallery-card img"
    );

    foodImages.forEach((image) => {

        image.addEventListener("load", () => {

            image.classList.add("image-loaded");

        });

        if (image.complete && image.naturalWidth > 0) {
            image.classList.add("image-loaded");
        }

    });


    // ========================================
    // 5. CURRENT FOOTER YEAR
    // ========================================

    const currentYear = document.querySelector("#current-year");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // ========================================
    // 6. OPTIONAL HERO IMAGE TILT
    // ========================================

    const heroFrame = document.querySelector(".hero-food-frame");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        heroFrame &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !reducedMotion
    ) {

        heroFrame.addEventListener("mousemove", (event) => {

            const bounds = heroFrame.getBoundingClientRect();

            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;

            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;

            const rotateY = ((x - centerX) / centerX) * 3;
            const rotateX = ((centerY - y) / centerY) * 3;

            heroFrame.style.animation = "none";

            heroFrame.style.transform =
                `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(-3deg)`;

        });

        heroFrame.addEventListener("mouseleave", () => {

            heroFrame.style.transform = "";
            heroFrame.style.animation = "";

        });

    }

});