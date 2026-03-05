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
  const cartData = getLocalStorage("so-cart");
  const cart = Array.isArray(cartData) ? cartData : [];
  cart.push(product);
  setLocalStorage("so-cart", cart);
}
// add to cart button event handler
async function addToCartHandler(e: Event) {
  const target = e.target as HTMLButtonElement;
  const productId = target.dataset.id;
  if (!productId) {
    showProductError("Product not found. Unable to add to cart.");
    return;
  }

  try {
    const product = await findProductById(productId);
    addProductToCart(product);
    animateCartIcon();
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
