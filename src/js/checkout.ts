import { checkAuth } from "./auth.svelte";
import { getLocalStorage, setLocalStorage } from "./utils.mts";

const baseURL = import.meta.env.PUBLIC_SERVER_URL;
const authStorageKey = "so-user";

type StoredAuth = {
  isLoggedIn?: boolean;
  token?: string;
  user?: {
    _id?: string;
    email?: string;
    name?: string | { firstName?: string; lastName?: string };
    address?: string;
    shippingAddress?: string;
  };
};

function redirectToLogin() {
  window.location.href = `/login/?redirect=${encodeURIComponent("/checkout")}`;
}

function ensureCheckoutAuth() {
  const authenticated = checkAuth();
  if (!authenticated) {
    redirectToLogin();
    return false;
  }
  return true;
}

function getAuthData(): StoredAuth {
  const authData = getLocalStorage(authStorageKey);
  return typeof authData === "object" && authData ? (authData as StoredAuth) : {};
}

function formatName(name: StoredAuth["user"]["name"]) {
  if (!name) return "";
  if (typeof name === "string") return name;
  return [name.firstName ?? "", name.lastName ?? ""].join(" ").trim();
}

function getSavedAddress(authData: StoredAuth) {
  const directAddress = authData.user?.address || authData.user?.shippingAddress;
  if (directAddress) return directAddress;

  const userId = authData.user?._id;
  if (!userId) return "";

  const profileData = getLocalStorage(`so-profile-${userId}`) as { address?: string } | null;
  return profileData?.address ?? "";
}

function saveAddressIfMissing(authData: StoredAuth, enteredAddress: string) {
  if (!enteredAddress) return;

  const hasSavedAddress = Boolean(getSavedAddress(authData));
  if (hasSavedAddress) return;

  const updatedAuth: StoredAuth = {
    ...authData,
    user: {
      ...authData.user,
      address: enteredAddress
    }
  };

  setLocalStorage(authStorageKey, updatedAuth);

  const userId = authData.user?._id;
  if (userId) {
    setLocalStorage(`so-profile-${userId}`, { address: enteredAddress });
  }
}

function prefillCheckoutForm() {
  const form = document.getElementById("checkout-form") as HTMLFormElement | null;
  if (!form) return;

  const authData = getAuthData();
  const name = formatName(authData.user?.name);
  const email = authData.user?.email ?? "";
  const address = getSavedAddress(authData);

  const nameInput = form.elements.namedItem("name") as HTMLInputElement | null;
  const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
  const addressInput = form.elements.namedItem("address") as HTMLTextAreaElement | null;

  if (nameInput) nameInput.value = name;
  if (emailInput) emailInput.value = email;
  if (addressInput) addressInput.value = address;
}

function buildOrderPayload(formData: FormData) {
  const cartData = getLocalStorage("so-cart");
  const items = Array.isArray(cartData)
    ? cartData.map((item: any) => item.id ?? item._id).filter(Boolean)
    : [];

  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    shipping_address: String(formData.get("address") ?? "").trim(),
    items
  };
}

function showCheckoutMessage(message: string, isError = false) {
  const messageEl = document.getElementById("checkout-message") as HTMLParagraphElement | null;
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.classList.remove("hide");
  messageEl.classList.toggle("checkout-message--error", isError);
}

function saveOrderLocally(order: any, userId: string) {
  const key = `so-orders-${userId}`;
  const savedOrders = getLocalStorage(key);
  const orders = Array.isArray(savedOrders) ? savedOrders : [];

  orders.unshift({
    ...order,
    createdAt: new Date().toISOString()
  });

  setLocalStorage(key, orders);
}

async function submitOrder(orderPayload: any, token: string) {
  try {
    const response = await fetch(`${baseURL}orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (response.ok) return { ok: true };

    if (response.status === 401 || response.status === 403) {
      return { ok: false, authError: true, message: "Your session expired. Please log in again." };
    }

    const data = await response.json().catch(() => ({}));
    return { ok: false, message: data?.message || "Unable to place order right now." };
  } catch {
    return { ok: false, message: "Unable to reach server. Please try again." };
  }
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureCheckoutAuth()) return;

    const authData = getAuthData();
    const token = authData?.token ?? "";
    const userId = authData?.user?._id ?? "";
    if (!token || !userId) {
      redirectToLogin();
      return;
    }

    const formData = new FormData(form);
    const orderPayload = buildOrderPayload(formData);

    if (!orderPayload.shipping_address) {
      showCheckoutMessage("Shipping address is required.", true);
      return;
    }

    if (!Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
      showCheckoutMessage("Your cart is empty.", true);
      return;
    }

    saveAddressIfMissing(authData, orderPayload.shipping_address);

    const result = await submitOrder(orderPayload, token);

    if (!result.ok) {
      if (result.authError) {
        showCheckoutMessage(result.message || "Please log in again.", true);
        redirectToLogin();
        return;
      }

      // Keep a local record to avoid dropping user progress if server is unavailable.
      saveOrderLocally(orderPayload, userId);
      setLocalStorage("so-cart", []);
      showCheckoutMessage("Order saved locally. We will sync it once the server is available.");
      return;
    }

    setLocalStorage("so-cart", []);
    showCheckoutMessage("Order placed successfully.");
    form.reset();
    prefillCheckoutForm();
  });
}

if (ensureCheckoutAuth()) {
  prefillCheckoutForm();
  setupCheckoutForm();
}
