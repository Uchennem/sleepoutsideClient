import type { Product } from "./types.mts";
import { setLocalStorage, getLocalStorage } from "./utils.mts";
import { findProductById } from "./productData.mts";

function animateCartIcon() {
  const cartIcon = document.querySelector(".cart svg") as SVGElement | null;
  if (!cartIcon) return;

  cartIcon.classList.remove("animate");
  void cartIcon.getBoundingClientRect();
  cartIcon.classList.add("animate");
}

function addProductToCart(product: Product) {
  const cart = getLocalStorage("so-cart");
  cart.push(product);
  setLocalStorage("so-cart", cart);
}
// add to cart button event handler
async function addToCartHandler(e: Event) {
  const target = e.target as HTMLButtonElement;
  if (target.dataset.id) {
    const product = await findProductById(target.dataset.id);
    addProductToCart(product);
    animateCartIcon();
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
