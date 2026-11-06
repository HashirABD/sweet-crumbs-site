// =============================================================================
// Sweet Crumbs Lahore - Application Logic & WhatsApp Ordering System
// =============================================================================

(function () {
  // Ensure SITE_CONFIG is loaded
  const cfg = window.SITE_CONFIG || {};
  const menu = Array.isArray(cfg.menu) ? cfg.menu : [];

  // 1. WhatsApp & Phone Setup
  const waNumber = String(cfg.whatsappNumber || "923233732647").replace(/\D/g, "");
  const phoneDigits = String(cfg.phoneDisplay || "0323 3732647").replace(/[\s-]/g, "");
  const simpleOrderUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent("Hello! I want to place an order.");

  function setElementHref(id, url) {
    const el = document.getElementById(id);
    if (el) el.href = url;
  }

  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Bind simple inquiry / order links across the page
  setElementHref("nav-whatsapp-btn", simpleOrderUrl);
  setElementHref("hero-whatsapp-btn", simpleOrderUrl);
  setElementHref("contact-whatsapp-link", simpleOrderUrl);
  setElementHref("delivery-whatsapp-btn", simpleOrderUrl);
  setElementHref("footer-whatsapp-link", simpleOrderUrl);

  setElementHref("contact-phone-link", "tel:" + phoneDigits);
  setElementText("contact-phone-link", cfg.phoneDisplay || "0323 3732647");
  setElementHref("footer-phone-link", "tel:" + phoneDigits);
  setElementText("footer-phone-link", cfg.phoneDisplay || "0323 3732647");

  if (cfg.instagramUrl) {
    setElementHref("contact-instagram-link", cfg.instagramUrl);
    setElementText("contact-instagram-link", cfg.instagramHandle || "@sweetcrumbslahore");
    setElementHref("footer-instagram-link", cfg.instagramUrl);
  }

  // 2. State Management
  // Cart is ONE object mapping item ID -> quantity, e.g. { 1: 2, 4: 1 }
  const cart = {};

  // Card-level quantity selector before adding to cart: item ID -> selector value (min 1)
  const cardQuantities = {};

  // Initialize card quantities to 1
  menu.forEach(item => {
    cardQuantities[item.id] = 1;
  });

  // 3. WhatsApp Message Builder
  function buildOrderMessage() {
    const activeItemIds = Object.keys(cart)
      .map(id => parseInt(id, 10))
      .filter(id => (cart[id] || 0) > 0);

    if (activeItemIds.length === 0) return "";

    let message = "Hello Sweet Crumbs! I want to place an order:\n\n";
    let grandTotal = 0;

    activeItemIds.forEach((id, index) => {
      const item = menu.find(m => m.id === id);
      if (!item) return;
      const qty = cart[id];
      const lineTotal = item.pricePKR * qty;
      grandTotal += lineTotal;
      message += (index + 1) + ". " + item.name + " x " + qty + " = PKR " + lineTotal.toLocaleString() + "\n";
    });

    message += "\nTotal: PKR " + grandTotal.toLocaleString();

    const nameInput = document.getElementById("order-customer-name");
    const addrInput = document.getElementById("order-customer-address");
    const name = nameInput ? nameInput.value.trim() : "";
    const address = addrInput ? addrInput.value.trim() : "";

    if (name) {
      message += "\nName: " + name;
    }
    if (address) {
      message += "\nAddress: " + address;
    }

    message += "\n\nPlease confirm my order. Thank you!";
    return message;
  }

  function updateWhatsAppOrderLink() {
    const sendBtn = document.getElementById("btn-send-whatsapp-order");
    if (!sendBtn) return;

    const message = buildOrderMessage();
    if (!message) {
      sendBtn.removeAttribute("href");
      return;
    }

    sendBtn.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(message);
  }

  // 4. Modal Open / Close Logic
  const modalBackdrop = document.getElementById("order-modal-backdrop");

  function openOrderModal() {
    if (modalBackdrop) modalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeOrderModal() {
    if (modalBackdrop) modalBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  // 5. Central Render Function
  function render() {
    // 5A. Update card quantity displays on the menu
    menu.forEach(item => {
      const qtyEl = document.getElementById("card-qty-" + item.id);
      if (qtyEl) {
        qtyEl.textContent = cardQuantities[item.id] || 1;
      }
    });

    // 5B. Compute cart totals
    const activeItemIds = Object.keys(cart)
      .map(id => parseInt(id, 10))
      .filter(id => (cart[id] || 0) > 0);

    let totalItems = 0;
    let totalPrice = 0;

    activeItemIds.forEach(id => {
      const item = menu.find(m => m.id === id);
      if (!item) return;
      const qty = cart[id];
      totalItems += qty;
      totalPrice += item.pricePKR * qty;
    });

    // 5C. Update Bottom Floating Order Bar
    const barCount = document.getElementById("order-bar-count");
    if (barCount) {
      barCount.textContent = totalItems + (totalItems === 1 ? " item" : " items");
    }

    const barTotal = document.getElementById("order-bar-total");
    if (barTotal) {
      barTotal.textContent = "PKR " + totalPrice.toLocaleString();
    }

    // 5D. Update Order Panel (Modal)
    const modalTotal = document.getElementById("order-modal-total");
    if (modalTotal) {
      modalTotal.textContent = "PKR " + totalPrice.toLocaleString();
    }

    const listEl = document.getElementById("order-items-list");
    const emptyMsg = document.getElementById("order-empty-message");
    const formInputs = document.getElementById("order-form-inputs");
    const sendBtn = document.getElementById("btn-send-whatsapp-order");
    const sendBtnLabel = document.getElementById("send-order-btn-label");

    if (activeItemIds.length === 0) {
      if (listEl) listEl.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = "block";
      if (formInputs) formInputs.style.display = "none";
      if (sendBtn) {
        sendBtn.removeAttribute("href");
        sendBtn.setAttribute("disabled", "true");
        sendBtn.style.pointerEvents = "none";
        sendBtn.style.opacity = "0.5";
      }
      if (sendBtnLabel) sendBtnLabel.textContent = "Add an item first";
    } else {
      if (emptyMsg) emptyMsg.style.display = "none";
      if (formInputs) formInputs.style.display = "flex";

      if (listEl) {
        listEl.innerHTML = activeItemIds.map(id => {
          const item = menu.find(m => m.id === id);
          if (!item) return "";
          const qty = cart[id];
          const lineTotal = item.pricePKR * qty;
          return `
            <li class="order-item-row" data-id="${id}">
              <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-unit-price">PKR ${item.pricePKR.toLocaleString()} each</div>
              </div>
              <div class="order-item-row-controls">
                <div class="qty-selector" style="padding: 0.15rem;">
                  <button type="button" class="qty-btn" style="width: 24px; height: 24px; font-size: 0.8rem;" data-action="minus" data-id="${id}" aria-label="Decrease quantity">−</button>
                  <span class="qty-display" style="width: 22px; font-size: 0.82rem;">${qty}</span>
                  <button type="button" class="qty-btn" style="width: 24px; height: 24px; font-size: 0.8rem;" data-action="plus" data-id="${id}" aria-label="Increase quantity">+</button>
                </div>
                <div class="order-item-line-total">PKR ${lineTotal.toLocaleString()}</div>
                <button type="button" class="order-remove-btn" data-action="remove" data-id="${id}" title="Remove item" aria-label="Remove item">✕</button>
              </div>
            </li>
          `;
        }).join("");
      }

      if (sendBtn) {
        sendBtn.removeAttribute("disabled");
        sendBtn.style.pointerEvents = "auto";
        sendBtn.style.opacity = "1";
      }
      if (sendBtnLabel) sendBtnLabel.textContent = "Send Order on WhatsApp";

      updateWhatsAppOrderLink();
    }
  }

  // 6. Action Handlers
  function handleCardQtyChange(id, delta) {
    const cur = cardQuantities[id] || 1;
    const next = Math.max(1, Math.min(50, cur + delta));
    cardQuantities[id] = next;
    render();
  }

  function handleAddToCart(id) {
    const item = menu.find(m => m.id === id);
    if (!item) return;

    const qtyToAdd = cardQuantities[id] || 1;
    cart[id] = (cart[id] || 0) + qtyToAdd;

    // Visual feedback on button
    const btn = document.getElementById("add-btn-" + id);
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.classList.add("added");
      btn.innerHTML = "<span>✓ Added!</span>";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.innerHTML = origHtml;
      }, 1000);
    }

    render();
  }

  function handleCartQtyChange(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) {
      delete cart[id];
    }
    render();
  }

  function handleRemoveFromCart(id) {
    delete cart[id];
    render();
  }

  // 7. Event Delegation: Menu Grid
  const menuGrid = document.getElementById("menu-grid");
  if (menuGrid) {
    menuGrid.addEventListener("click", function (e) {
      const actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;

      const action = actionEl.getAttribute("data-action");
      const id = parseInt(actionEl.getAttribute("data-id"), 10);
      if (!id) return;

      if (action === "minus") {
        handleCardQtyChange(id, -1);
      } else if (action === "plus") {
        handleCardQtyChange(id, 1);
      } else if (action === "add") {
        handleAddToCart(id);
      }
    });
  }

  // 8. Event Delegation: Floating Order Bar
  const orderBar = document.getElementById("floating-order-bar");
  if (orderBar) {
    orderBar.addEventListener("click", function (e) {
      const actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;

      const action = actionEl.getAttribute("data-action");
      if (action === "open-order") {
        openOrderModal();
      }
    });
  }

  // 9. Event Delegation: Order Modal (Panel)
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function (e) {
      if (e.target === modalBackdrop) {
        closeOrderModal();
        return;
      }

      const actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;

      const action = actionEl.getAttribute("data-action");
      const id = parseInt(actionEl.getAttribute("data-id"), 10);

      if (action === "close-order") {
        closeOrderModal();
      } else if (action === "minus" && id) {
        handleCartQtyChange(id, -1);
      } else if (action === "plus" && id) {
        handleCartQtyChange(id, 1);
      } else if (action === "remove" && id) {
        handleRemoveFromCart(id);
      } else if (action === "send") {
        const activeCount = Object.keys(cart).filter(k => (cart[k] || 0) > 0).length;
        if (activeCount === 0) {
          e.preventDefault();
          return;
        }
        updateWhatsAppOrderLink();
      }
    });
  }

  // 10. Form Input Listeners (typing in Name or Address updates WhatsApp URL)
  const nameInput = document.getElementById("order-customer-name");
  const addrInput = document.getElementById("order-customer-address");
  if (nameInput) nameInput.addEventListener("input", updateWhatsAppOrderLink);
  if (addrInput) addrInput.addEventListener("input", updateWhatsAppOrderLink);

  // 11. Keyboard Esc Listener
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeOrderModal();
  });

  // 12. Global Testing Interface
  window.cart = cart;
  window.cardQuantities = cardQuantities;
  window.openOrderModal = openOrderModal;
  window.closeOrderModal = closeOrderModal;
  window.render = render;

  // Initial render
  render();
})();

