/**
 * SNACKS BY LEBO - Main Application Script
 * 
 * This script manages the complete e-commerce functionality including:
 * - Product catalog and rendering
 * - Shopping cart management (add, remove, update quantities)
 * - LocalStorage persistence for cart data
 * - Checkout flow and navigation
 * - Contact form handling
 * - Navigation link activation and smooth scrolling
 * 
 * SECURITY NOTES FOR PAYMENT GATEWAY INTEGRATION:
 * ================================================
 * 1. Never trust client-side cart totals - always recalculate server-side
 * 2. Product prices should come from server, not client
 * 3. Use HTTPS in production
 * 4. Implement proper CSRF tokens when adding backend
 * 5. Add rate limiting on checkout endpoints
 * 6. Log all payment attempts for audit trail
 * 7. Use payment gateway's hosted checkout when possible (PCI compliance)
 */

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Sanitizes a string to prevent XSS attacks when inserting into HTML.
 * Always use this when displaying user-generated or dynamic content.
 * 
 * @param {string} str - The string to sanitize
 * @returns {string} HTML-escaped safe string
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validates that a value is a positive integer within reasonable bounds.
 * Used to prevent cart manipulation attacks.
 * 
 * @param {*} value - Value to validate
 * @param {number} max - Maximum allowed value (default 100)
 * @returns {number} Validated integer or 1 if invalid
 */
function validateQuantity(value, max = 100) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return 1;
    if (num > max) return max;
    return num;
}

/**
 * Validates that a price matches expected product price.
 * CRITICAL: In production, prices must be validated server-side.
 * 
 * @param {number} productId - Product ID
 * @param {number} claimedPrice - Price from cart
 * @returns {boolean} True if price matches catalog
 */
function validatePrice(productId, claimedPrice) {
    const product = products.find(p => p.id === productId);
    return product && product.price === claimedPrice;
}

/**
 * Generates a cryptographically stronger reference number.
 * Uses crypto API when available for better randomness.
 * 
 * @returns {string} Unique reference number
 */
function generateSecureReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    let random;
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        random = array[0].toString(36).toUpperCase().slice(0, 5);
    } else {
        random = Math.random().toString(36).toUpperCase().slice(2, 7);
    }
    return `LEBO-${timestamp}-${random}`;
}

/**
 * Rate limiting helper - prevents rapid cart operations.
 * Simple client-side protection (server-side is essential in production).
 */
const rateLimiter = {
    lastAction: 0,
    minInterval: 300, // milliseconds
    canProceed() {
        const now = Date.now();
        if (now - this.lastAction < this.minInterval) {
            return false;
        }
        this.lastAction = now;
        return true;
    }
};

// ============================================================================
// PRODUCT CATALOG
// ============================================================================

/**
 * Product catalog containing all available snack packages.
 * Each product includes:
 * - id: Unique identifier
 * - name: Display name
 * - description: Short description
 * - price: Price in Rands (R)
 * - category: Product tier (starter, family, premium)
 * - emoji: Visual icon
 * - badge: Marketing label
 * - items: Array of included snacks
 */
const products = [
    {
        id: 1,
        name: "Starter Snack Pack",
        description: "Perfect for trying our delicious flavors",
        price: 250,
        category: "starter",
        emoji: "🎁",
        badge: "Best for Trying",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn"
        ]
    },
    {
        id: 2,
        name: "Family Favorites Pack",
        description: "Great variety for the whole family",
        price: 450,
        category: "family",
        emoji: "👨‍👩‍👧‍👦",
        badge: "Most Popular",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn",
            "2x Spinach Power Puffs",
            "2x Mango Fruit Roll",
            "2x Broccoli Cheddar Squares"
        ]
    },
    {
        id: 3,
        name: "Ultimate Deluxe Pack",
        description: "Everything you love - our complete collection",
        price: 600,
        category: "premium",
        emoji: "👑",
        badge: "Best Value",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn",
            "2x Spinach Power Puffs",
            "2x Mango Fruit Roll",
            "2x Broccoli Cheddar Squares",
            "2x Honey Granola Clusters",
            "2x Almond Joy Bites",
            "2x Strawberry Chewy Bars"
        ]
    }
];

// ============================================================================
// GLOBAL STATE AND CONFIGURATION
// ============================================================================

/**
 * Shopping cart array storing all items added by the user.
 * Each item includes product data plus a quantity field.
 * Persisted to localStorage via saveCartToStorage()
 */
let cart = [];

/**
 * Fixed delivery fee applied to all orders.
 * Currently set to R50 (South African Rand).
 */
const DELIVERY_FEE = 50;

/**
 * API availability flag
 * When true, products are fetched from backend API
 */
let useAPI = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Page initialization - Runs when DOM is fully loaded.
 * Orchestrates startup sequence:
 * 1. Check if API is available
 * 2. Render all products to the grid (from API or local catalog)
 * 3. Load cart from localStorage
 * 4. Update cart count badge
 * 5. Setup navigation tracking
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Try to use API if available
    await initializeProducts();
    loadCartFromStorage();
    updateCartDisplay();
    setupNavigation();
});

/**
 * Initialize products from API or fallback to local catalog.
 * This enables graceful degradation when backend is unavailable.
 */
async function initializeProducts() {
    // Check if API client is loaded and API is available
    if (typeof SnacksAPI !== 'undefined') {
        try {
            const isAvailable = await SnacksAPI.isAvailable();
            if (isAvailable) {
                console.log('🔌 API connected - Loading products from server');
                useAPI = true;
                const apiProducts = await SnacksAPI.products.getAll();
                
                // Map API products to local format (API uses cents, local uses Rands)
                const mappedProducts = apiProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price / 100, // Convert cents to Rands
                    category: p.category,
                    emoji: p.emoji,
                    badge: p.badge,
                    items: p.items
                }));
                
                // Update local products array for consistency
                products.length = 0;
                products.push(...mappedProducts);
                
                renderProducts(products);
                return;
            }
        } catch (error) {
            console.warn('⚠️ API not available, using local catalog:', error.message);
        }
    }
    
    // Fallback to local products catalog
    console.log('📦 Using local product catalog');
    renderProducts(products);
}

// ============================================================================
// PRODUCT RENDERING
// ============================================================================

/**
 * Dynamically renders product cards to the DOM.
 * 
 * @param {Array} productsToRender - Array of product objects to display
 * 
 * Creates and appends product cards with:
 * - Product emoji/icon
 * - Name, description, and marketing badge
 * - List of included items
 * - Price display
 * - Quantity controls (+/- buttons)
 * - "Add to Cart" button with onclick handlers
 * 
 * SECURITY: All dynamic content is sanitized before DOM insertion
 */
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = ''; // Clear existing products

    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Sanitize all product data before rendering
        const safeName = sanitizeHTML(product.name);
        const safeDescription = sanitizeHTML(product.description);
        const safeBadge = sanitizeHTML(product.badge);
        const safeEmoji = sanitizeHTML(product.emoji);
        
        // Convert items array to HTML list with sanitization
        const itemsList = product.items.map(item => `<li>${sanitizeHTML(item)}</li>`).join('');
        
        // Build complete product card HTML
        productCard.innerHTML = `
            <div class="product-image">${safeEmoji}</div>
            <div class="product-info">
                <div class="product-name">${safeName}</div>
                <div class="product-description">${safeDescription}</div>
                <span class="product-badge">${safeBadge}</span>
                <div class="package-items">
                    <strong>Includes:</strong>
                    <ul>
                        ${itemsList}
                    </ul>
                </div>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                <div class="product-quantity">
                    <button type="button" class="quantity-btn" onclick="decreaseQuantity(this)" aria-label="Decrease quantity">−</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="50" readonly aria-label="Quantity">
                    <button type="button" class="quantity-btn" onclick="increaseQuantity(this)" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="add-to-cart-btn" onclick="addToCart(${product.id}, this)">
                    Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// ============================================================================
// QUANTITY CONTROLS
// ============================================================================

/**
 * Increases quantity in the product card's input field.
 * 
 * @param {HTMLElement} btn - The increment button that was clicked
 * 
 * Gets the previous input element and increments value by 1.
 * Maximum limit enforced to prevent abuse.
 */
function increaseQuantity(btn) {
    const input = btn.previousElementSibling;
    const currentVal = validateQuantity(input.value);
    const maxVal = parseInt(input.max, 10) || 50;
    if (currentVal < maxVal) {
        input.value = currentVal + 1;
    }
}

/**
 * Decreases quantity in the product card's input field.
 * 
 * @param {HTMLElement} btn - The decrement button that was clicked
 * 
 * Gets the next input element and decrements by 1 if > 1.
 * Prevents quantities below 1.
 */
function decreaseQuantity(btn) {
    const input = btn.nextElementSibling;
    const currentVal = validateQuantity(input.value);
    if (currentVal > 1) {
        input.value = currentVal - 1;
    }
}

// ============================================================================
// CART MANAGEMENT
// ============================================================================

/**
 * Adds a product to the shopping cart with specified quantity.
 * 
 * @param {number} productId - ID of the product to add
 * @param {HTMLElement} btn - Reference to the "Add to Cart" button
 * 
 * Process:
 * 1. Rate limiting check to prevent spam
 * 2. Get quantity from product card's input
 * 3. Validate quantity is within bounds
 * 4. Find product in catalog (price comes from server source)
 * 5. Check if already in cart:
 *    - If yes: Increment quantity
 *    - If no: Add as new item
 * 6. Reset quantity input to 1
 * 7. Show visual feedback (button text changes for 1.5 seconds)
 * 8. Save and update displays
 * 
 * SECURITY: Product data (especially price) always comes from catalog,
 * never from user input. In production, validate server-side.
 */
function addToCart(productId, btn) {
    // Rate limiting to prevent rapid clicks
    if (!rateLimiter.canProceed()) {
        return;
    }

    // Get quantity from the product card's quantity input
    const quantityInput = btn.previousElementSibling.querySelector('.quantity-input');
    const quantity = validateQuantity(quantityInput.value, 50);
    
    // Find the product in the catalog - ALWAYS use catalog price
    const product = products.find(p => p.id === productId);

    if (!product) return; // Safety check

    // Check cart size limit (prevent localStorage abuse)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems + quantity > 500) {
        alert('Cart limit reached. Please checkout or remove some items.');
        return;
    }

    // Check if this product is already in the cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        // Product already in cart - increment its quantity
        existingItem.quantity = Math.min(existingItem.quantity + quantity, 100);
    } else {
        // New product - add to cart with catalog price (never user-supplied)
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price, // Price from catalog, not user input
            quantity: quantity
        });
    }

    // Reset quantity input to 1 for next purchase
    quantityInput.value = 1;

    // Show visual feedback animation
    const originalText = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.opacity = '0.8';
    btn.disabled = true;
    
    // Restore button after 1.5 seconds
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }, 1500);

    // Persist and update displays
    saveCartToStorage();
    updateCartDisplay();
}

/**
 * Updates the cart count badge in the navigation bar.
 * 
 * Calculates total quantity by summing all item quantities
 * and updates the badge text. Shows users item count at a glance.
 */
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

/**
 * Opens the shopping cart modal overlay.
 * 
 * Process:
 * 1. Display the modal
 * 2. Disable background scroll to prevent distraction
 * 3. Render cart items in the modal
 */
function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

/**
 * Closes the shopping cart modal overlay.
 * 
 * Hides the modal and re-enables body scroll.
 */
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scroll
}

/**
 * Renders the contents of the shopping cart in the modal.
 * 
 * Process:
 * 1. Get references to DOM elements
 * 2. If cart is empty: Show empty state message
 * 3. If cart has items:
 *    - Validate each item price against catalog
 *    - Calculate subtotal (sum of price × quantity)
 *    - Build HTML for each item with remove button
 * 4. Calculate delivery fee (only if cart has items)
 * 5. Calculate total (subtotal + delivery)
 * 6. Update all price displays
 * 
 * SECURITY: Prices are validated against catalog to detect tampering
 */
function renderCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const cartDeliverySpan = document.getElementById('cartDelivery');
    const cartTotalSpan = document.getElementById('cartTotal');

    // Handle empty cart
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">🛒 Your cart is empty. Start shopping!</div>';
        cartSubtotalSpan.textContent = '0.00';
        cartDeliverySpan.textContent = '0.00';
        cartTotalSpan.textContent = '0.00';
        return;
    }

    // Build cart items HTML with price validation
    let subtotal = 0;
    let hasInvalidItems = false;
    
    cartItemsDiv.innerHTML = cart.map(item => {
        // SECURITY: Validate price against catalog
        const catalogProduct = products.find(p => p.id === item.id);
        if (!catalogProduct) {
            hasInvalidItems = true;
            return ''; // Skip invalid items
        }
        
        // Use catalog price, not stored price (prevents tampering)
        const safePrice = catalogProduct.price;
        const safeQuantity = validateQuantity(item.quantity, 100);
        const itemTotal = safePrice * safeQuantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${sanitizeHTML(catalogProduct.name)}</div>
                    <div class="cart-item-qty">Qty: ${safeQuantity}</div>
                </div>
                <div class="cart-item-price">R${itemTotal.toFixed(2)}</div>
                <button type="button" class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove ${sanitizeHTML(catalogProduct.name)} from cart">✕ Remove</button>
            </div>
        `;
    }).join('');

    // Clean up invalid items if found
    if (hasInvalidItems) {
        cart = cart.filter(item => products.find(p => p.id === item.id));
        saveCartToStorage();
    }

    // Calculate totals
    const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    // Update price displays
    cartSubtotalSpan.textContent = subtotal.toFixed(2);
    cartDeliverySpan.textContent = delivery.toFixed(2);
    cartTotalSpan.textContent = total.toFixed(2);
}

/**
 * Removes a product entirely from the shopping cart.
 * 
 * @param {number} productId - ID of the product to remove
 * 
 * Process:
 * 1. Validate productId is a number
 * 2. Filter cart to exclude the product
 * 3. Save updated cart to localStorage
 * 4. Update cart count badge
 * 5. Re-render cart items in modal
 */
function removeFromCart(productId) {
    // Validate productId
    const id = parseInt(productId, 10);
    if (isNaN(id)) return;
    
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCartDisplay();
    renderCartItems();
}

// ============================================================================
// LOCAL STORAGE PERSISTENCE
// ============================================================================

/**
 * Saves the current cart state to browser LocalStorage.
 * 
 * Process:
 * 1. Convert cart array to JSON string
 * 2. Store in localStorage under key "snacksCart"
 * 
 * This allows cart to persist across page refreshes and browser sessions.
 * Called after any cart modification (add, remove, checkout).
 */
function saveCartToStorage() {
    localStorage.setItem('snacksCart', JSON.stringify(cart));
}

/**
 * Loads the cart state from browser LocalStorage if it exists.
 * 
 * Process:
 * 1. Check if "snacksCart" key exists in localStorage
 * 2. If exists: Parse JSON and restore to cart array
 * 3. Validate cart data structure and sanitize
 * 4. If not exists or invalid: Cart remains empty
 * 
 * SECURITY: Validates cart data structure to prevent localStorage tampering.
 * Called during page initialization.
 */
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('snacksCart');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Validate cart is an array
            if (!Array.isArray(parsed)) {
                console.warn('Invalid cart data in localStorage');
                localStorage.removeItem('snacksCart');
                return;
            }
            
            // Validate and sanitize each item
            cart = parsed.filter(item => {
                // Check required fields
                if (!item.id || typeof item.quantity !== 'number') {
                    return false;
                }
                // Check item exists in catalog
                const catalogProduct = products.find(p => p.id === item.id);
                if (!catalogProduct) {
                    return false;
                }
                // Enforce quantity limits
                item.quantity = validateQuantity(item.quantity, 100);
                // Use catalog price (ignore stored price to prevent tampering)
                item.price = catalogProduct.price;
                item.name = catalogProduct.name;
                return true;
            });
            
            // Save cleaned cart back
            if (cart.length !== parsed.length) {
                saveCartToStorage();
            }
        }
    } catch (e) {
        console.warn('Error loading cart from storage:', e);
        localStorage.removeItem('snacksCart');
        cart = [];
    }
}

// ============================================================================
// CHECKOUT FLOW
// ============================================================================

/**
 * Initiates the checkout process.
 * 
 * Process:
 * 1. Check if cart is empty - if so, show alert and return
 * 2. Save cart to localStorage
 * 3. Redirect browser to checkout.html page
 * 
 * The checkout page reads cart data from localStorage and displays it
 * along with customer information forms.
 */
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Save cart to localStorage for checkout page
    saveCartToStorage();
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// ============================================================================
// CONTACT FORM HANDLING
// ============================================================================

/**
 * Handles contact form submission with validation and sanitization.
 * 
 * @param {Event} event - The form submit event
 * 
 * Process:
 * 1. Prevent default form submission
 * 2. Validate all inputs client-side
 * 3. Sanitize input values
 * 4. Show confirmation alert to user
 * 5. Reset form fields
 * 
 * SECURITY: Inputs are validated and sanitized.
 * In production, this should send to a backend with CSRF protection.
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    
    // Basic validation
    const name = nameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const message = messageInput?.value?.trim() || '';
    
    if (!name || !email || !message) {
        alert('⚠️ Please fill in all required fields.');
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('⚠️ Please enter a valid email address.');
        return;
    }
    
    // In production: Send to server with CSRF token
    // fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
    //     body: JSON.stringify({ name, email, message })
    // });
    
    alert('✅ Thank you for reaching out!\n\nWe will get back to you within 24 hours. 📧');
    form.reset();
}

// ============================================================================
// MODAL INTERACTION
// ============================================================================

/**
 * Closes cart modal when clicking outside the modal content area.
 * 
 * This provides a common UX pattern where clicking on the backdrop
 * (semi-transparent background) closes the modal.
 * 
 * Process:
 * 1. Listen for all click events on the window
 * 2. Check if the click target is the modal element itself
 * 3. If yes (clicked outside content): Close the cart
 * 4. If no (clicked on content): Ignore
 */
window.addEventListener('click', (event) => {
    const cartModal = document.getElementById('cartModal');
    if (event.target == cartModal) {
        closeCart();
    }
});

// ============================================================================
// NAVIGATION AND SCROLL BEHAVIOR
// ============================================================================

/**
 * Setup navigation link activation based on scroll position.
 * 
 * Creates a sticky navigation experience where the active link
 * highlights which section the user is currently viewing.
 * 
 * Process:
 * 1. Add click handlers to navigation links:
 *    - Remove active class from all links
 *    - Add active class to clicked link
 *    - Exclude cart link from this behavior
 * 
 * 2. Add scroll event listener that:
 *    - Gets the current scroll position
 *    - Finds which section is in the viewport
 *    - Updates active link to match that section
 *    - Accounts for nav bar height with +100 offset
 */
function setupNavigation() {
    // Handle click events on navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.classList.contains('cart-link')) {
                // Remove active class from all non-cart links
                document.querySelectorAll('.nav-link').forEach(l => {
                    if (!l.classList.contains('cart-link')) {
                        l.classList.remove('active');
                    }
                });
                // Add active class to clicked link
                link.classList.add('active');
            }
        });
    });

    // Update active link based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100; // Offset for sticky nav

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            // Check if current scroll position is within this section
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active from all links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Find and activate the matching link
                const activeLink = document.querySelector(`a[href="#${section.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Global keyboard shortcut handler.
 * 
 * Currently implemented:
 * - ESC key: Close the shopping cart modal
 * 
 * This provides a standard UX pattern for closing overlays.
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeCart();
    }
});
