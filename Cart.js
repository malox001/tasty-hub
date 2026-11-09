document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // CART ELEMENTS
    // =====================================

    const cartDrawer = document.querySelector("[data-cart-drawer]");
    const cartOverlay = document.querySelector("[data-cart-overlay]");
    const cartItemsContainer = document.querySelector("[data-cart-items]");
    const cartEmpty = document.querySelector("[data-cart-empty]");
    const cartFooter = document.querySelector("[data-cart-footer]");

    const cartSubtotal = document.querySelector("[data-cart-subtotal]");

    const CART_KEY = "tastyHubCart";

    if (!cartDrawer || !cartOverlay || !cartItemsContainer) {
        return;
    }


    // =====================================
    // LOAD CART FROM LOCAL STORAGE
    // =====================================

    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

        if (Array.isArray(savedCart)) {
            cart = savedCart.filter(item =>
                item &&
                typeof item.name === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) > 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0
            );
        }

    } catch (error) {
        cart = [];
    }


    // =====================================
    // HELPER FUNCTIONS
    // =====================================

    const formatPrice = amount => {
        return "₦" + Number(amount).toLocaleString("en-NG");
    };


    const saveCart = () => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    };


    const showToast = message => {
        const toast = document.querySelector(".toast");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(window.tastyCartToastTimer);

        window.tastyCartToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    };


    const updateCartCount = () => {

        const totalItems = cart.reduce((total, item) => {
            return total + Number(item.quantity);
        }, 0);

        document.querySelectorAll(".cart-count").forEach(badge => {
            badge.textContent = totalItems;
        });

    };


    // =====================================
    // OPEN AND CLOSE CART
    // =====================================

    const openCart = () => {

        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");

        document.body.classList.add("cart-open");

        cartDrawer.setAttribute("aria-hidden", "false");

    };


    const closeCart = () => {

        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");

        document.body.classList.remove("cart-open");

        cartDrawer.setAttribute("aria-hidden", "true");

    };


    document.querySelectorAll("[data-open-cart]").forEach(button => {
        button.addEventListener("click", openCart);
    });


    document.querySelectorAll("[data-close-cart]").forEach(button => {
        button.addEventListener("click", closeCart);
    });


    cartOverlay.addEventListener("click", closeCart);


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeCart();
        }

    });


    // =====================================
    // RENDER CART ITEMS
    // =====================================

    const renderCart = () => {

        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {

            cartEmpty.hidden = false;
            cartFooter.hidden = true;

        } else {

            cartEmpty.hidden = true;
            cartFooter.hidden = false;

        }


        cart.forEach((item, index) => {

            const itemElement = document.createElement("div");

            itemElement.className = "cart-item";

            const imageContainer = document.createElement("div");
            imageContainer.className = "cart-item-image";

            const image = document.createElement("img");

            image.src = item.image || "images/placeholder.png";
            image.alt = item.name;

            image.onerror = () => {
                image.style.display = "none";
            };

            imageContainer.appendChild(image);


            const details = document.createElement("div");
            details.className = "cart-item-details";

            const title = document.createElement("h4");
            title.textContent = item.name;

            const price = document.createElement("div");
            price.className = "cart-item-price";
            price.textContent = formatPrice(item.price);


            const controls = document.createElement("div");
            controls.className = "cart-item-controls";


            const decreaseButton = document.createElement("button");

            decreaseButton.type = "button";
            decreaseButton.className = "cart-quantity-btn";
            decreaseButton.dataset.cartAction = "decrease";
            decreaseButton.dataset.index = index;
            decreaseButton.setAttribute("aria-label", "Decrease quantity");

            decreaseButton.innerHTML = '<i class="fa-solid fa-minus"></i>';


            const quantity = document.createElement("span");

            quantity.className = "cart-item-quantity";
            quantity.textContent = item.quantity;


            const increaseButton = document.createElement("button");

            increaseButton.type = "button";
            increaseButton.className = "cart-quantity-btn";
            increaseButton.dataset.cartAction = "increase";
            increaseButton.dataset.index = index;
            increaseButton.setAttribute("aria-label", "Increase quantity");

            increaseButton.innerHTML = '<i class="fa-solid fa-plus"></i>';


            controls.append(
                decreaseButton,
                quantity,
                increaseButton
            );


            details.append(
                title,
                price,
                controls
            );


            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "cart-remove";
            removeButton.dataset.cartAction = "remove";
            removeButton.dataset.index = index;
            removeButton.setAttribute("aria-label", "Remove item");

            removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';


            itemElement.append(
                imageContainer,
                details,
                removeButton
            );


            cartItemsContainer.appendChild(itemElement);

        });


        const total = cart.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);


        if (cartSubtotal) {
            cartSubtotal.textContent = formatPrice(total);
        }


        updateCartCount();
        saveCart();

    };


    // =====================================
    // ADD MEALS TO CART
    // =====================================

    const addToCart = button => {

        const name = button.dataset.name;

        const price = Number(button.dataset.price);


        if (!name || !Number.isFinite(price) || price <= 0) {
            showToast("Unable to add this meal. Please try again.");
            return;
        }


        const card = button.closest(".food-card, .meal-card");

        const imageElement = card?.querySelector("img");

        const image = imageElement?.src || "";


        const existingItem = cart.find(item => {
            return item.name.trim().toLowerCase() === name.trim().toLowerCase();
        });


        if (existingItem) {

            existingItem.quantity += 1;

        } else {

            cart.push({
                name,
                price,
                quantity: 1,
                image
            });

        }


        renderCart();

        showToast(`${name} added to cart!`);

    };


    document.addEventListener("click", event => {

        const button = event.target.closest(".add-cart, .add-to-cart");

        if (!button) return;

        event.preventDefault();

        addToCart(button);

    });


    // =====================================
    // QUANTITY AND REMOVE CONTROLS
    // =====================================

    cartItemsContainer.addEventListener("click", event => {

        const button = event.target.closest("[data-cart-action]");

        if (!button) return;


        const index = Number(button.dataset.index);

        const action = button.dataset.cartAction;


        if (!Number.isInteger(index) || !cart[index]) {
            return;
        }


        if (action === "increase") {

            cart[index].quantity += 1;

        } else if (action === "decrease") {

            cart[index].quantity -= 1;

            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }

        } else if (action === "remove") {

            cart.splice(index, 1);

        }


        renderCart();

    });


    // =====================================
    // CHECKOUT BUTTON
    // =====================================

    const checkoutButton = document.querySelector("[data-cart-checkout]");

    if (checkoutButton) {

        checkoutButton.addEventListener("click", () => {

            if (cart.length === 0) {
                showToast("Your cart is empty.");
                return;
            }

            showToast("Checkout will be available soon!");

        });

    }


    // =====================================
    // INITIAL CART DISPLAY
    // =====================================

    renderCart();

});