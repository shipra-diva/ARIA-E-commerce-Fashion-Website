// ARIA — shared site interactivity
// Cart is persisted in localStorage so items added on any product page
// actually show up on cart.html after navigating there. Wishlist is still
// in-memory only (resets on navigation) — same as before.

(function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Catalogue used by the search page                                 */
  /* ---------------------------------------------------------------- */
  var PRODUCTS = [
    { name: "Denim Wrap Halter Top", price: "₹2,299", category: "Women", img: "https://i.pinimg.com/1200x/94/f0/2d/94f02dfb0105bea8475310a9a32cc9fa.jpg", url: "women.html" },
    { name: "Linen Relaxed Shirt", price: "₹2,899", category: "Women", img: "https://i.pinimg.com/736x/54/34/b1/5434b1efbe0a124a57fc91197ee6a906.jpg", url: "women.html" },
    { name: "Scarlet Satin Cocktail Dress", price: "₹5,499", category: "Women", img: "https://i.pinimg.com/1200x/2a/52/82/2a52829f08709be5a6d1f65b81222eaa.jpg", url: "women.html" },
    { name: "Vintage Denim Shorts", price: "₹2,899", category: "Women", img: "https://i.pinimg.com/736x/1b/b8/31/1bb8310dfadc08b8a2e6ee8b997b984a.jpg", url: "women.html" },
    { name: "Ivory Tailored Blazer Set", price: "₹4,299", category: "Women", img: "https://i.pinimg.com/736x/9a/96/69/9a9669cb43c9f0a0e6fd3c314f1d8fea.jpg", url: "women.html" },
    { name: "Ivory Zari Kurta Set", price: "₹3,499", category: "Ethnic Wear", img: "https://i.pinimg.com/736x/9a/96/69/9a9669cb43c9f0a0e6fd3c314f1d8fea.jpg", url: "ethnic.html" },
    { name: "Maroon Silk Anarkali Gown", price: "₹6,299", category: "Ethnic Wear", img: "https://i.pinimg.com/1200x/2a/52/82/2a52829f08709be5a6d1f65b81222eaa.jpg", url: "ethnic.html" },
    { name: "Rust Handloom Saree Drape", price: "₹4,899", category: "Ethnic Wear", img: "https://i.pinimg.com/1200x/94/f0/2d/94f02dfb0105bea8475310a9a32cc9fa.jpg", url: "ethnic.html" },
    { name: "Sage Green Kurti Set", price: "₹2,999", category: "Ethnic Wear", img: "https://i.pinimg.com/736x/54/34/b1/5434b1efbe0a124a57fc91197ee6a906.jpg", url: "ethnic.html" },
    { name: "Celeste Temple Jewellery Set", price: "₹2,499", category: "Ethnic Wear", img: "https://i.pinimg.com/736x/76/a8/5d/76a85d0bf6ba5adf7afd69d19b4a9173.jpg", url: "ethnic.html" },
    { name: "Luna Metallic Handbag", price: "₹3,999", category: "Accessories", img: "https://i.pinimg.com/1200x/66/19/af/6619af204896a5458776bb3ad510a420.jpg", url: "accessories.html" },
    { name: "Noir Luxe Sunglasses", price: "₹1,999", category: "Accessories", img: "https://i.pinimg.com/1200x/3f/5c/4d/3f5c4d69a9160363fc01dd2c6e07ea6a.jpg", url: "accessories.html" },
    { name: "Celeste Layered Necklace", price: "₹1,799", category: "Accessories", img: "https://i.pinimg.com/736x/76/a8/5d/76a85d0bf6ba5adf7afd69d19b4a9173.jpg", url: "accessories.html" },
    { name: "Gilded Leather Belt", price: "₹1,499", category: "Accessories", img: "https://i.pinimg.com/736x/4b/20/6a/4b206ad5f9fff55f68342601fd91886d.jpg", url: "accessories.html" },
    { name: "Ivory Lace Slingback Heels", price: "₹4,499", category: "Footwear", img: "https://i.pinimg.com/736x/64/3c/51/643c51814b8b6d609425501f936fceda.jpg", url: "footwear.html" },
    { name: "Camel Suede Ankle Boots", price: "₹3,799", category: "Footwear", img: "https://i.pinimg.com/736x/59/0e/ca/590eca2303761b1f31b53b4b1ad2bc23.jpg", url: "footwear.html" },
    { name: "Noir Patent Pumps", price: "₹4,199", category: "Footwear", img: "https://i.pinimg.com/736x/64/3c/51/643c51814b8b6d609425501f936fceda.jpg", url: "footwear.html" }
  ];

  /* ---------------------------------------------------------------- */
  /* Toast                                                             */
  /* ---------------------------------------------------------------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------------------------------------------------------------- */
  /* Helpers                                                            */
  /* ---------------------------------------------------------------- */
  function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function parsePrice(text) {
    var matches = text.match(/[\d,]+(?:\.\d+)?/g);
    if (!matches) return 0;
    return parseFloat(matches[matches.length - 1].replace(/,/g, "")) || 0;
  }

  function formatINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  /* ---------------------------------------------------------------- */
  /* Persistent cart (localStorage)                                     */
  /* ---------------------------------------------------------------- */
  var CART_KEY = "aria_cart";

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  function getCartCount() {
    return getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.find(function (c) { return c.id === item.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      item.qty = 1;
      cart.push(item);
    }
    saveCart(cart);
  }

  /* ---------------------------------------------------------------- */
  /* Cart / wishlist badges                                            */
  /* Cart count comes from localStorage now; wishlist stays in-memory   */
  /* ---------------------------------------------------------------- */
  var wishlistCount = 0;

  function refreshBadges() {
    var cartCount = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = cartCount;
      el.classList.toggle("is-visible", cartCount > 0);
    });
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = wishlistCount;
      el.classList.toggle("is-visible", wishlistCount > 0);
    });
  }

  // Seed wishlist badge from any items pre-populated on the wishlist page
  wishlistCount = document.querySelectorAll("[data-wishlist-card]").length;
  refreshBadges();

  /* ---------------------------------------------------------------- */
  /* Add to cart (product cards)                                       */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll(".btn-add-cart").forEach(function (btn) {
    // Skip wishlist "move to cart" buttons — handled separately below
    if (btn.hasAttribute("data-wishlist-move")) return;

    btn.addEventListener("click", function () {
      var card = btn.closest(".product-card");
      if (!card) return;

      var nameEl = card.querySelector(".product-card__name");
      var imgEl = card.querySelector(".product-card__image");
      var priceEl = card.querySelector(".product-card__price");

      var name = nameEl ? nameEl.textContent.trim() : "Item";
      var image = imgEl ? imgEl.getAttribute("src") : "";
      var price = priceEl ? parsePrice(priceEl.textContent) : 0;

      addToCart({
        id: slugify(name),
        name: name,
        image: image,
        price: price,
        variant: "One Size"
      });

      refreshBadges();
      showToast(name + " added to your cart");

      var original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.classList.add("is-added");
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("is-added");
        btn.disabled = false;
      }, 1400);
    });
  });

  /* ---------------------------------------------------------------- */
  /* Wishlist heart toggle (product cards)                             */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll(".btn-wishlist").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isActive = btn.classList.toggle("is-active");
      wishlistCount += isActive ? 1 : -1;
      refreshBadges();
      var card = btn.closest(".product-card");
      var name = card ? card.querySelector(".product-card__name").textContent : "Item";
      showToast(isActive ? name + " added to wishlist" : name + " removed from wishlist");
    });
  });

  /* ---------------------------------------------------------------- */
  /* Cart page: render rows from localStorage, quantity steppers,      */
  /* remove, live totals                                                */
  /* ---------------------------------------------------------------- */
  var itemsWrap = document.querySelector("[data-cart-items]");
  if (itemsWrap) {
    var subtotalEl = document.querySelector("[data-cart-subtotal]");
    var totalEl = document.querySelector("[data-cart-total]");
    var emptyEl = document.querySelector("[data-cart-empty]");

    function renderCartPage() {
      var cart = getCart();
      itemsWrap.querySelectorAll("[data-cart-row]").forEach(function (r) { r.remove(); });

      var subtotal = 0;

      cart.forEach(function (item) {
        var lineTotal = item.price * item.qty;
        subtotal += lineTotal;

        var row = document.createElement("div");
        row.className = "cart-row";
        row.setAttribute("data-cart-row", "");
        row.setAttribute("data-id", item.id);
        row.setAttribute("data-price", item.price);
        row.innerHTML =
          '<img src="' + item.image + '" alt="' + item.name + '" class="cart-row__image">' +
          '<div class="cart-row__info">' +
            '<h3 class="cart-row__name">' + item.name + '</h3>' +
            '<p class="cart-row__variant">' + (item.variant || "") + '</p>' +
            '<button type="button" class="cart-row__remove" data-cart-remove>Remove</button>' +
          '</div>' +
          '<div class="cart-row__qty">' +
            '<button type="button" class="qty-btn" data-qty-decrease aria-label="Decrease quantity">&minus;</button>' +
            '<span class="qty-value" data-qty-value>' + item.qty + '</span>' +
            '<button type="button" class="qty-btn" data-qty-increase aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<p class="cart-row__price" data-cart-row-total>' + formatINR(lineTotal) + '</p>';

        itemsWrap.appendChild(row);
      });

      if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
      if (totalEl) totalEl.textContent = formatINR(subtotal);
      if (emptyEl) emptyEl.hidden = cart.length > 0;

      refreshBadges();
    }

    itemsWrap.addEventListener("click", function (e) {
      var row = e.target.closest("[data-cart-row]");
      if (!row) return;

      var id = row.getAttribute("data-id");
      var cart = getCart();
      var item = cart.find(function (c) { return c.id === id; });
      if (!item) return;

      if (e.target.closest("[data-qty-increase]")) {
        item.qty += 1;
        saveCart(cart);
        renderCartPage();
      } else if (e.target.closest("[data-qty-decrease]")) {
        if (item.qty > 1) {
          item.qty -= 1;
          saveCart(cart);
          renderCartPage();
        }
      } else if (e.target.closest("[data-cart-remove]")) {
        cart = cart.filter(function (c) { return c.id !== id; });
        saveCart(cart);
        renderCartPage();
        showToast(item.name + " removed from cart");
      }
    });

    renderCartPage();
  }

  /* ---------------------------------------------------------------- */
  /* Wishlist page: remove + move to cart                              */
  /* ---------------------------------------------------------------- */
  var wishlistGrid = document.querySelector("[data-wishlist-grid]");
  if (wishlistGrid) {
    var wishlistEmpty = document.querySelector("[data-wishlist-empty]");

    function recalcWishlist() {
      var cards = document.querySelectorAll("[data-wishlist-card]");
      wishlistCount = cards.length;
      refreshBadges();
      if (wishlistEmpty) wishlistEmpty.hidden = cards.length > 0;
    }

    wishlistGrid.addEventListener("click", function (e) {
      var card = e.target.closest("[data-wishlist-card]");
      if (!card) return;
      var name = card.querySelector(".wishlist-card__name").textContent;

      if (e.target.closest("[data-wishlist-remove]")) {
        card.remove();
        recalcWishlist();
        showToast(name + " removed from wishlist");
      } else if (e.target.closest("[data-wishlist-move]")) {
        var priceEl = card.querySelector(".wishlist-card__price");
        var imgEl = card.querySelector(".wishlist-card__image");
        addToCart({
          id: slugify(name),
          name: name,
          image: imgEl ? imgEl.getAttribute("src") : "",
          price: priceEl ? parsePrice(priceEl.textContent) : 0,
          variant: "One Size"
        });
        card.remove();
        recalcWishlist();
        refreshBadges();
        showToast(name + " moved to your cart");
      }
    });

    recalcWishlist();
  }

  /* ---------------------------------------------------------------- */
  /* Contact form                                                      */
  /* ---------------------------------------------------------------- */
  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    var successMsg = document.querySelector("[data-contact-success]");
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      if (successMsg) successMsg.classList.add("is-visible");
      contactForm.reset();
      showToast("Message sent — we'll be in touch soon");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Newsletter form (footer, on every page)                           */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("You're subscribed — welcome to the list");
      form.reset();
    });
  });

  /* ---------------------------------------------------------------- */
  /* Live search                                                       */
  /* ---------------------------------------------------------------- */
  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    var resultsEl = document.querySelector("[data-search-results]");
    var statusEl = document.querySelector("[data-search-status]");

    function renderResults(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        resultsEl.innerHTML = "";
        statusEl.textContent = "Start typing to search across Women, Ethnic Wear, Accessories and Footwear.";
        return;
      }

      var matches = PRODUCTS.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1 || p.category.toLowerCase().indexOf(q) !== -1;
      });

      statusEl.textContent = matches.length
        ? matches.length + " result" + (matches.length === 1 ? "" : "s") + " for \u201c" + query + "\u201d"
        : "No results for \u201c" + query + "\u201d — try “dress”, “kurta”, or “bag”.";

      resultsEl.innerHTML = matches.map(function (p) {
        return (
          '<article class="product-card">' +
            '<div class="product-card__image-wrap">' +
              '<a href="' + p.url + '"><img src="' + p.img + '" alt="' + p.name + '" class="product-card__image" loading="lazy"></a>' +
            '</div>' +
            '<div class="product-card__info">' +
              '<p class="product-card__eyebrow-small">' + p.category + '</p>' +
              '<h3 class="product-card__name">' + p.name + '</h3>' +
              '<p class="product-card__price">' + p.price + '</p>' +
              '<a href="' + p.url + '" class="btn-outline-dark">View in ' + p.category + '</a>' +
            '</div>' +
          '</article>'
        );
      }).join("");
    }

    searchInput.addEventListener("input", function () {
      renderResults(searchInput.value);
    });

    document.querySelectorAll("[data-search-tag]").forEach(function (tag) {
      tag.addEventListener("click", function () {
        searchInput.value = tag.textContent;
        searchInput.focus();
        renderResults(searchInput.value);
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Shop pages: filter chips (by category) + sort-by (price/newest)   */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll(".shop-section").forEach(function (section) {
    var filterBar = section.querySelector("[data-filter-bar]");
    var grid = section.querySelector("[data-product-grid]");
    var emptyEl = section.querySelector("[data-filter-empty]");
    var countEl = section.querySelector("[data-filter-count]");
    var sortSelect = section.querySelector("[data-sort-select]");
    if (!filterBar || !grid) return;

    var cards = Array.from(grid.querySelectorAll(".product-card"));
    // Remember original DOM order so "Newest" / "Most Popular" can restore it
    cards.forEach(function (card, i) { card.dataset.originalOrder = i; });

    var activeCategory = "All";

    function applyFilter() {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var matches = activeCategory === "All" || card.getAttribute("data-category") === activeCategory;
        card.hidden = !matches;
        if (matches) visibleCount++;
      });
      if (countEl) {
        countEl.textContent = visibleCount + (visibleCount === 1 ? " product" : " products");
      }
      if (emptyEl) {
        emptyEl.hidden = visibleCount > 0;
      }
    }

    function applySort() {
      if (!sortSelect) return;
      var mode = sortSelect.value;
      var sorted = cards.slice();

      if (mode === "price-asc") {
        sorted.sort(function (a, b) {
          return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        });
      } else if (mode === "price-desc") {
        sorted.sort(function (a, b) {
          return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        });
      } else {
        // "newest" and "popular" both fall back to original catalogue order
        sorted.sort(function (a, b) {
          return a.dataset.originalOrder - b.dataset.originalOrder;
        });
      }

      sorted.forEach(function (card) { grid.appendChild(card); });
    }

    filterBar.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter-chip]");
      if (!chip) return;
      filterBar.querySelectorAll(".filter-chip").forEach(function (c) {
        c.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      activeCategory = chip.getAttribute("data-filter-chip");
      applyFilter();
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }

    applyFilter();
    applySort();
  });

  /* ---------------------------------------------------------------- */
  /* Mobile menu toggle                                                */
  /* ---------------------------------------------------------------- */
  var menuToggle = document.querySelector(".menu-toggle");
  var navbarNav = document.querySelector(".navbar__nav");
  if (menuToggle && navbarNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = navbarNav.classList.toggle("is-open");
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
})();









