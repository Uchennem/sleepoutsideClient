import type { Product } from "./types.mts";
import { setLocalStorage, getLocalStorage } from "./utils.mts";
import { findProductById } from "./productData.mts";

function showProductError(message: string) {
  const addContainer = document.querySelector(".product-detail__add") as HTMLElement | null;
  if (addContainer) {
    addContainer.innerHTML = `<p class="product-error" role="alert">${message}</p>`;
    return;
  }

  const detailSection = document.querySelector(".product-detail");
  if (!detailSection) return;

  const errorMessage = document.createElement("p");
  errorMessage.className = "product-error";
  errorMessage.setAttribute("role", "alert");
  errorMessage.textContent = message;
  detailSection.append(errorMessage);
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
  } catch {
    showProductError("Product not found. Unable to add to cart.");
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
