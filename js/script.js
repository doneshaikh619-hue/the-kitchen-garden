/**
 * THE KITCHEN GARDEN — SIALKOT, PAKISTAN
 * Master Client-side JavaScript: Dynamic Catalog, Cart Engine, WhatsApp Integration & Motion
 */

// ==========================================================================
// 1. BUSINESS CONFIGURATION & CONSTANTS
// ==========================================================================
// Easily identifiable and replaceable WhatsApp number in international format
const WHATSAPP_NUMBER = "+923002715559";
const BUSINESS_NAME = "The Kitchen Garden";
const BUSINESS_LOCATION = "Diamond City, Chaprar Rd, Sialkot, Pakistan";
const CART_STORAGE_KEY = "the_kitchen_garden_cart";

// ==========================================================================
// 2. STRUCTURED PRODUCT DATA CATALOG
// ==========================================================================
const PRODUCTS = [
  {
    id: "mix-bbq-platter",
    name: "Kitchen Garden Mix BBQ Platter",
    category: "bbq",
    price: 3450,
    image: "assets/bbq-platter.jpg",
    badge: "Chef's Special",
    description: "An extravagant platter featuring tender chicken malai boti, beef seekh kebabs, reshmi kebabs, grilled fish cubes, and spiced mutton chops, accompanied by fresh tandoori naan and mint raita."
  },
  {
    id: "malai-boti",
    name: "Tender Malai Boti",
    category: "bbq",
    price: 1250,
    image: "assets/malai-boti.jpg",
    badge: "Bestseller",
    description: "Boneless chicken cubes marinated overnight in velvety dairy cream, green chilies, coriander, and gentle royal cardamom, flame-kissed over charcoal embers."
  },
  {
    id: "chicken-manchurian",
    name: "Chicken Manchurian with Egg Fried Rice",
    category: "pan-asian",
    price: 1350,
    image: "assets/chicken-manchurian.jpg",
    badge: "Popular",
    description: "Crispy fried chicken chunks glazed in our signature sweet, tangy, and piquant garlic-tomato sauce, paired with aromatic wok-tossed egg fried basmati rice."
  },
  {
    id: "white-karahi",
    name: "Chicken White Karahi (Full)",
    category: "desi",
    price: 1850,
    image: "assets/white-karahi.jpg",
    badge: "Traditional",
    description: "Fresh chicken prepared in an authentic iron wok with rich cream, yogurt, crushed white peppercorns, julienne ginger, and fresh slit green chilies."
  },
  {
    id: "chicken-steak",
    name: "Sizzling Mushroom Chicken Steak",
    category: "continental",
    price: 1650,
    image: "assets/chicken-steak.jpg",
    badge: "House Specialty",
    description: "Char-grilled prime chicken breast fillet smothered in creamy wild mushroom sauce, served on a sizzling skillet with garden-fresh sautéed vegetables and buttered mash."
  },
  {
    id: "chicken-tenders",
    name: "Crispy Golden Chicken Tenders",
    category: "starters",
    price: 950,
    image: "assets/chicken-tenders.jpg",
    badge: "Crispy Starter",
    description: "Hand-breaded premium chicken breast strips fried to a delicate golden crisp, served with house honey-mustard dip and spicy garlic emulsion."
  },
  {
    id: "special-biryani",
    name: "Kitchen Garden Special Biryani",
    category: "desi",
    price: 980,
    image: "assets/special-biryani.jpg",
    badge: "Signature",
    description: "Fragrant extra-long grain basmati rice layered with succulent spiced chicken, saffron essence, browned shallots, and fresh mint leaves."
  },
  {
    id: "espresso",
    name: "Artisan Double Espresso",
    category: "drinks",
    price: 550,
    image: "assets/espresso.jpg",
    badge: "Hot Brew",
    description: "Freshly roasted Arabica beans pulled to perfection with a thick golden-hazelnut crema. Rich, aromatic, and bold."
  },
  {
    id: "mint-margarita",
    name: "Signature Chilled Mint Margarita",
    category: "drinks",
    price: 480,
    image: "assets/mint-margarita.jpg",
    badge: "Refreshing",
    description: "Crushed organic garden mint, fresh Sialkot lime juice, kala namak, and sparkling soda blended with crushed crystal ice for the ultimate palate cleanser."
  },
  {
    id: "dessert-brownie",
    name: "Sizzling Brownie with Vanilla Ice Cream",
    category: "desserts",
    price: 750,
    image: "assets/dessert-brownie.jpg",
    badge: "Sweet Finish",
    description: "Warm Belgian dark chocolate fudge brownie served on a smoking iron skillet, drizzled tableside with hot chocolate sauce and topped with artisan vanilla gelato."
  }
];

// ==========================================================================
// 3. CART MANAGEMENT (LOCALSTORAGE PERSISTENCE)
// ==========================================================================
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadges();
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
}

function addToCart(productId, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`);

  // If on add-to-cart.html, re-render cart
  if (document.getElementById("cartItemsContainer")) {
    renderCartPage();
  }
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
  if (document.getElementById("cartItemsContainer")) {
    renderCartPage();
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  const removedItem = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);

  if (removedItem) {
    showToast(`Removed "${removedItem.name}" from cart.`);
  }

  if (document.getElementById("cartItemsContainer")) {
    renderCartPage();
  }
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadges();
    showToast("Cart has been cleared.");
    if (document.getElementById("cartItemsContainer")) {
      renderCartPage();
    }
  }
}

function calculateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems };
}

function updateCartBadges() {
  const { totalItems, subtotal } = calculateCartTotals();
  
  // Header badges
  const navBadges = document.querySelectorAll(".cart-badge");
  navBadges.forEach(badge => {
    badge.textContent = totalItems;
  });

  // Floating cart pill
  const floatingPill = document.querySelector(".floating-cart-pill");
  if (floatingPill) {
    const floatingCount = floatingPill.querySelector(".floating-cart-count");
    const floatingPrice = floatingPill.querySelector(".floating-cart-total");
    if (floatingCount) floatingCount.textContent = totalItems;
    if (floatingPrice) floatingPrice.textContent = `PKR ${subtotal.toLocaleString()}`;
    
    // Show/hide floating pill based on items
    if (totalItems > 0) {
      floatingPill.style.display = "inline-flex";
    } else {
      floatingPill.style.display = "none";
    }
  }
}

// ==========================================================================
// 4. TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-success-icon">✓</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// ==========================================================================
// 5. RENDER MENU ON INDEX.HTML
// ==========================================================================
function renderMenuGrid(filterCategory = "all") {
  const container = document.getElementById("menuGrid");
  if (!container) return;

  const filtered = filterCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filterCategory);

  container.innerHTML = filtered.map(product => `
    <div class="menu-card" data-category="${product.category}">
      <div class="menu-card-img-wrap">
        <img src="${product.image}" alt="${product.name}" class="menu-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?w=600'">
        <span class="menu-card-badge">${product.badge}</span>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-header">
          <h3 class="menu-item-name">${product.name}</h3>
          <span class="menu-item-price">PKR ${product.price.toLocaleString()}</span>
        </div>
        <p class="menu-item-desc">${product.description}</p>
        <div class="menu-card-footer">
          <span class="item-category-tag">${product.category}</span>
          <button class="btn-add-to-cart" onclick="addToCart('${product.id}')">
            <span>+</span> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function initMenuFilters() {
  const filterButtons = document.querySelectorAll(".menu-filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.getAttribute("data-filter");
      renderMenuGrid(cat);
    });
  });
}

// ==========================================================================
// 6. RENDER CART PAGE (`add-to-cart.html`)
// ==========================================================================
function renderCartPage() {
  const container = document.getElementById("cartItemsContainer");
  const summaryBox = document.getElementById("cartSummaryBox");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <h3 class="empty-cart-title">Your Cart is Currently Empty</h3>
        <p class="empty-cart-desc">Explore our botanical dining menu and add signature BBQ, savory karahi, and refreshing drinks to your order.</p>
        <a href="index.html#menu" class="btn btn-primary">Browse Our Menu</a>
      </div>
    `;
    if (summaryBox) summaryBox.style.display = "none";
    return;
  }

  if (summaryBox) summaryBox.style.display = "block";

  const { subtotal } = calculateCartTotals();

  container.innerHTML = `
    <div class="cart-items-list">
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?w=600'">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="item-unit-price">Unit Price: PKR ${item.price.toLocaleString()}</div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" title="Decrease Quantity">−</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" title="Increase Quantity">+</button>
          </div>
          <div class="cart-item-total">
            PKR ${(item.price * item.quantity).toLocaleString()}
          </div>
          <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove Item">✕</button>
        </div>
      `).join("")}
    </div>
  `;

  // Update summary amounts
  const subtotalEl = document.getElementById("cartSubtotal");
  const overallEl = document.getElementById("cartOverallTotal");
  if (subtotalEl) subtotalEl.textContent = `PKR ${subtotal.toLocaleString()}`;
  if (overallEl) overallEl.textContent = `PKR ${subtotal.toLocaleString()}`;
}

// ==========================================================================
// 7. DYNAMIC WHATSAPP ORDER GENERATOR
// ==========================================================================
function sendWhatsAppOrder(event) {
  if (event) event.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty! Please add items before placing an order.");
    return;
  }

  const customerName = document.getElementById("customerName")?.value.trim() || "Valued Customer";
  const customerPhone = document.getElementById("customerPhone")?.value.trim() || "Not provided";
  const orderType = document.getElementById("orderType")?.value || "Dine-in / Garden Table";
  const specialNotes = document.getElementById("specialNotes")?.value.trim() || "None";

  const { subtotal } = calculateCartTotals();

  // Construct structured WhatsApp message
  let message = `*NEW ORDER — ${BUSINESS_NAME}*\n`;
  message += `Location: ${BUSINESS_LOCATION}\n\n`;
  message += `*Customer Details:*\n`;
  message += `• Name: ${customerName}\n`;
  message += `• Contact: ${customerPhone}\n`;
  message += `• Dining Option: ${orderType}\n`;
  if (specialNotes !== "None") {
    message += `• Special Notes: ${specialNotes}\n`;
  }
  message += `\n*Order Items:*\n`;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Qty: ${item.quantity} × PKR ${item.price.toLocaleString()} = PKR ${itemTotal.toLocaleString()}\n`;
  });

  message += `\n*Overall Total:* *PKR ${subtotal.toLocaleString()}*\n\n`;
  message += `Please confirm my order and approximate preparation time. Thank you!`;

  // Clean phone number for WhatsApp link
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp in a new tab
  window.open(whatsappUrl, "_blank");
}

// ==========================================================================
// 8. GLOBAL NAVIGATION, MOBILE MENU & SCROLL EFFECTS
// ==========================================================================
function initNavigation() {
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  // Sticky header background on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close on navigation click
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
}

// ==========================================================================
// 9. TABLE RESERVATION FORM HANDLER
// ==========================================================================
function initReservationForm() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name='resName']")?.value || "";
    const guests = form.querySelector("[name='resGuests']")?.value || "2";
    const date = form.querySelector("[name='resDate']")?.value || "";
    const time = form.querySelector("[name='resTime']")?.value || "";
    const seating = form.querySelector("[name='resSeating']")?.value || "Outdoor Garden";

    let message = `*TABLE RESERVATION REQUEST — ${BUSINESS_NAME}*\n\n`;
    message += `• Name: ${name}\n`;
    message += `• Guests: ${guests} Person(s)\n`;
    message += `• Date: ${date}\n`;
    message += `• Time: ${time}\n`;
    message += `• Preferred Seating: ${seating}\n\n`;
    message += `Please confirm my reservation.`;

    const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    showToast("Opening WhatsApp to confirm your table reservation!");
  });
}

// ==========================================================================
// 10. DOM READY INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  updateCartBadges();

  // If on index.html, initialize menu
  if (document.getElementById("menuGrid")) {
    renderMenuGrid("all");
    initMenuFilters();
  }

  // If on add-to-cart.html, render cart
  if (document.getElementById("cartItemsContainer")) {
    renderCartPage();
    const orderForm = document.getElementById("whatsappCheckoutForm");
    if (orderForm) {
      orderForm.addEventListener("submit", sendWhatsAppOrder);
    }
  }

  // If reservation form exists
  initReservationForm();
});
