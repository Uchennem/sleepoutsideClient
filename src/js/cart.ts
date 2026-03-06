import { getLocalStorage, setLocalStorage } from "./utils.mts";
import type { Product } from "./types.mts";

function renderCartContents() {
  const listEl = document.querySelector(".product-list") as HTMLElement | null;
  if (!listEl) return;

  const storedCart = getLocalStorage("so-cart");
  const cartItems = Array.isArray(storedCart) ? storedCart : [];

  if (cartItems.length === 0) {
    listEl.innerHTML = "<li class=\"cart-card divider\">Your cart is empty.</li>";
    return;
  }

  const htmlItems = cartItems.map((item: Product, index: number) => cartItemTemplate(item, index));
  listEl.innerHTML = htmlItems.join("");

  if (!listEl.dataset.removeListenerAttached) {
    listEl.addEventListener("click", removeFromCartHandler);
    listEl.dataset.removeListenerAttached = "true";
  }
}

function cartItemTemplate(item: Product, index: number) {
  const newItem = `<li class="cart-card divider">
  <button class="cart-card__remove" data-id="${item.id}" data-index="${index}" aria-label="Remove ${item.name} from cart" title="Remove from cart">&times;</button>
  <a href="#" class="cart-card__image">
    <img
      src="${item.images.primaryMedium}"
      alt="${item.name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${item.colors[0].colorName}</p>
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

renderCartContents();
