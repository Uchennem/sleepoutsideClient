import { getLocalStorage, setLocalStorage, getWishlistItems, setWishlistItems, getItemColor } from "./utils.mts";
import type { Product } from "./types.mts";

function renderCartContents() {
  const listEl = document.querySelector(".product-list") as HTMLElement | null;
  const cartFooterEl = document.querySelector(".cart-footer") as HTMLElement | null;
  const cartTotalEl = document.querySelector(".cart-total") as HTMLElement | null;
  if (!listEl) return;

  const storedCart = getLocalStorage("so-cart");
  const cartItems = Array.isArray(storedCart) ? storedCart as Product[] : [];

  if (cartItems.length === 0) {
    listEl.innerHTML = "<li class=\"cart-card divider\">Your cart is empty.</li>";
    cartFooterEl?.classList.add("hide");
    return;
  }

  const htmlItems = cartItems.map((item: Product, index: number) => cartItemTemplate(item, index));
  listEl.innerHTML = htmlItems.join("");

  const total = cartItems.reduce((sum, item) => sum + item.finalPrice, 0);
  if (cartFooterEl && cartTotalEl) {
    cartTotalEl.innerHTML = `Total: $${total.toFixed(2)}`;
    cartFooterEl.classList.remove("hide");
  }

  if (!listEl.dataset.removeListenerAttached) {
    listEl.addEventListener("click", removeFromCartHandler);
    listEl.dataset.removeListenerAttached = "true";
  }
}

function cartItemTemplate(item: Product, index: number) {
  const newItem = `<li class="cart-card divider">
  <button class="cart-card__remove" data-id="${item.id}" data-index="${index}" aria-label="Remove ${item.name} from cart" title="Remove from cart">&times;</button>
  <a href="/products/${item.id}" class="cart-card__image">
    <img
      src="${item.images?.primaryMedium ?? ""}"
      alt="${item.name}"
    />
  </a>
  <a href="/products/${item.id}">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${getItemColor(item)}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.finalPrice}</p>
</li>`;

  return newItem;
}

function removeFromCartHandler(e: Event) {
  const target = e.target as HTMLElement;
  const removeButton = target.closest(".cart-card__remove") as HTMLButtonElement | null;
  if (!removeButton) return;

  const indexValue = removeButton.dataset.index;
  if (typeof indexValue !== "string") return;

  const index = Number(indexValue);
  if (Number.isNaN(index)) return;

  const cartData = getLocalStorage("so-cart");
  const cartItems = Array.isArray(cartData) ? cartData : [];
  cartItems.splice(index, 1);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function renderWishlistContents() {
  const wishlistEl = document.querySelector(".wishlist-list") as HTMLElement | null;
  if (!wishlistEl) return;

  const wishlistItems = getWishlistItems();

  if (wishlistItems.length === 0) {
    wishlistEl.innerHTML = "<li class=\"cart-card divider\">Your wishlist is empty.</li>";
    return;
  }

  wishlistEl.innerHTML = wishlistItems.map((item, index) => wishlistItemTemplate(item, index)).join("");

  if (!wishlistEl.dataset.wishlistListenerAttached) {
    wishlistEl.addEventListener("click", wishlistActionHandler);
    wishlistEl.dataset.wishlistListenerAttached = "true";
  }
}

function wishlistItemTemplate(item: Product, index: number) {
  return `<li class="cart-card divider">
  <button class="cart-card__remove" data-index="${index}" aria-label="Remove ${item.name} from wishlist" title="Remove from wishlist">&times;</button>
  <a href="/products/${item.id}" class="cart-card__image">
    <img
      src="${item.images?.primaryMedium ?? ""}"
      alt="${item.name}"
    />
  </a>
  <a href="/products/${item.id}">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${getItemColor(item)}</p>
  <p class="cart-card__quantity">Saved for later</p>
  <p class="cart-card__price">$${item.finalPrice}</p>
  <div class="cart-card__actions">
    <button class="wishlist-move" data-index="${index}" aria-label="Move ${item.name} to cart">Move to Cart</button>
  </div>
</li>`;
}

function wishlistActionHandler(e: Event) {
  const target = e.target as HTMLElement;
  const moveButton = target.closest(".wishlist-move") as HTMLButtonElement | null;
  const removeButton = target.closest(".cart-card__remove") as HTMLButtonElement | null;

  const indexValue = moveButton?.dataset.index ?? removeButton?.dataset.index;
  if (typeof indexValue !== "string") return;

  const index = Number(indexValue);
  if (Number.isNaN(index)) return;

  const wishlistItems = getWishlistItems();
  const selectedItem = wishlistItems[index];
  if (!selectedItem) return;

  if (moveButton) {
    const cartData = getLocalStorage("so-cart");
    const cartItems = Array.isArray(cartData) ? cartData : [];
    cartItems.push(selectedItem);
    setLocalStorage("so-cart", cartItems);
  }

  wishlistItems.splice(index, 1);
  setWishlistItems(wishlistItems);

  renderCartContents();
  renderWishlistContents();
}

renderCartContents();
renderWishlistContents();
