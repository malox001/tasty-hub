document.addEventListener("DOMContentLoaded", () => {
    const menuGrid = document.getElementById("menu-grid");
    const menuCards = [
        ...document.querySelectorAll(".menu-food-card")
    ];

    const categoryButtons = [
        ...document.querySelectorAll(".menu-filter")
    ];

    const menuSearch = document.getElementById("menu-search");
    const desktopSearch = document.getElementById("desktop-meal-search");

    const searchForm = document.getElementById("search-form");
    const mobileSearchButton = document.getElementById("search-submit");

    const clearSearchButton = document.getElementById(
        "clear-menu-search"
    );

    const resultCount = document.getElementById("menu-result-count");
    const emptyState = document.getElementById("menu-empty");
    const resetButton = document.getElementById("reset-menu");

    let activeCategory = "all";
    let searchTerm = "";

    /*
     * FILTER AND SEARCH MEALS
     */
    function filterMeals() {
        let visibleCount = 0;

        menuCards.forEach((card) => {
            const category = card.dataset.category || "";
            const name = card.dataset.name || "";

            const heading = card.querySelector("h3")?.textContent || "";
            const description =
                card.querySelector(".food-card-content p")?.textContent || "";

            const searchableText = (
                name + " " + heading + " " + description + " " + category
            ).toLowerCase();

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            const matchesSearch =
                searchableText.includes(searchTerm);

            const shouldDisplay =
                matchesCategory && matchesSearch;

            card.hidden = !shouldDisplay;

            if (shouldDisplay) {
                visibleCount++;
            }
        });

        resultCount.textContent =
            `Showing ${visibleCount} ${visibleCount === 1 ? "meal" : "meals"}`;

        emptyState.hidden = visibleCount !== 0;
        menuGrid.hidden = visibleCount === 0;
    }

    /*
     * CATEGORY BUTTONS
     */
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "all";

            categoryButtons.forEach((item) => {
                const isActive = item === button;

                item.classList.toggle("active", isActive);

                item.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            filterMeals();
        });
    });

    /*
     * MENU SEARCH
     */
    function applySearch(value) {
        searchTerm = value.trim().toLowerCase();

        menuSearch.value = value;

        if (desktopSearch) {
            desktopSearch.value = value;
        }

        filterMeals();
    }

    menuSearch.addEventListener("input", () => {
        applySearch(menuSearch.value);
    });

    /*
     * CLEAR SEARCH
     */
    clearSearchButton.addEventListener("click", () => {
        applySearch("");

        menuSearch.focus();
    });

    /*
     * DESKTOP SEARCH FORM
     */
    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();

            applySearch(desktopSearch.value);

            document.getElementById("food-menu").scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    /*
     * MOBILE SEARCH BUTTON
     */
    if (mobileSearchButton) {
        mobileSearchButton.addEventListener("click", () => {
            applySearch(
                document.getElementById("meal-search").value
            );

            document.getElementById("food-menu").scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    /*
     * HOMEPAGE SEARCH ICON
     */
    document
        .querySelectorAll("[data-focus-search]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const searchBar = document.querySelector(".desktop-search");

                if (searchBar) {
                    searchBar.classList.add("search-open");
                }

                if (desktopSearch) {
                    desktopSearch.focus();
                }
            });
        });

    /*
     * RESET FILTERS
     */
    function resetMenu() {
        activeCategory = "all";

        categoryButtons.forEach((button) => {
            const isActive = button.dataset.category === "all";

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        applySearch("");

        const mobileSearch = document.getElementById("meal-search");

        if (mobileSearch) {
            mobileSearch.value = "";
        }

        document.getElementById("food-menu").scrollIntoView({
            behavior: "smooth"
        });
    }

    resetButton.addEventListener("click", resetMenu);

    /*
     * READ SEARCH AND CATEGORY FROM URL
     *
     * Example:
     * menu.html?category=rice
     * menu.html?search=jollof
     */
    const params = new URLSearchParams(window.location.search);

    const requestedCategory = params.get("category");
    const requestedSearch = params.get("search");

    const validCategories = [
        "all",
        "rice",
        "fast-food",
        "soups",
        "snacks",
        "drinks"
    ];

    if (
        requestedCategory &&
        validCategories.includes(requestedCategory)
    ) {
        const categoryButton = categoryButtons.find(
            (button) =>
                button.dataset.category === requestedCategory
        );

        if (categoryButton) {
            categoryButton.click();
        }
    }

    if (requestedSearch) {
        applySearch(requestedSearch);
    }

    /*
     * UPDATE FOOTER YEAR
     */
    const footerYear = document.getElementById("footer-year");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /*
     * BASIC MOBILE SIDEBAR CONTROLS
     *
     * These selectors follow the existing Home.html markup.
     */
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.getElementById("mobile-sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");

    function closeSidebar() {
        if (!sidebar || !menuToggle) return;

        sidebar.classList.remove("open");

        if (backdrop) {
            backdrop.classList.remove("show");
        }

        sidebar.setAttribute("aria-hidden", "true");

        menuToggle.setAttribute("aria-expanded", "false");
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("open");

            if (backdrop) {
                backdrop.classList.toggle("show", isOpen);
            }

            sidebar.setAttribute(
                "aria-hidden",
                String(!isOpen)
            );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }

    document
        .querySelectorAll("[data-close-menu]")
        .forEach((element) => {
            element.addEventListener("click", closeSidebar);
        });

    sidebar?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeSidebar);
    });

    /*
     * INITIAL RENDER
     */
    filterMeals();
});