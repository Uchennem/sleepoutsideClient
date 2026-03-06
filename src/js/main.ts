import { checkAuth } from "./auth.svelte";
import { getLocalStorage } from "./utils.mts";

checkAuth();

function updateCartCountBadge() {
	const badge = document.getElementById("cart-count") as HTMLSpanElement | null;
	if (!badge) return;

	const storedCart = getLocalStorage("so-cart");
	const count = Array.isArray(storedCart) ? storedCart.length : 0;

	badge.textContent = String(count);
	badge.classList.toggle("hidden", count === 0);
}

updateCartCountBadge();
window.addEventListener("so-cart-updated", updateCartCountBadge);
window.addEventListener("storage", (event) => {
	if (event.key === "so-cart") {
		updateCartCountBadge();
	}
});
