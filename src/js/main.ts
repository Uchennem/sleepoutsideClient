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

function setupNewsletterSignup() {
	const form = document.getElementById("newsletter-form") as HTMLFormElement | null;
	const message = document.getElementById("newsletter-message") as HTMLParagraphElement | null;

	if (!form || !message) return;

	form.addEventListener("submit", (event) => {
		event.preventDefault();

		const formData = new FormData(form);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();

		if (!name || !email) return;

		const existing = getLocalStorage("so-newsletter-signups");
		const signups = Array.isArray(existing) ? existing : [];
		signups.push({ name, email, signedUpAt: new Date().toISOString() });
		localStorage.setItem("so-newsletter-signups", JSON.stringify(signups));

		message.textContent = `Thanks ${name}! You are signed up.`;
		message.classList.remove("hide");
		form.reset();
	});
}

setupNewsletterSignup();
