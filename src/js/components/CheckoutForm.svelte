<script lang="ts">
  import { getLocalStorage, setLocalStorage } from "../utils.mts";
  import type { Product, CheckoutFormData } from "../types.mts";
  import { calculateOrderTotals, submitOrder } from "../checkout.ts";

  let cartItems = $state<Product[]>([]);
  let totals = $state({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  });

  let formData = $state<CheckoutFormData>({
    fname: "",
    lname: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiration: "",
    code: ""
  });

  let errors = $state<Partial<Record<keyof CheckoutFormData, string>>>({});
  let isSubmitting = $state(false);
  let submitMessage = $state<{ type: "success" | "error"; text: string } | null>(null);

  $effect(() => {
    const storedCart = getLocalStorage("so-cart");
    cartItems = Array.isArray(storedCart) ? storedCart as Product[] : [];
    
    if (cartItems.length > 0) {
      totals = calculateOrderTotals(cartItems);
    }
  });

  function validateField(field: keyof CheckoutFormData, value: string): string {
    switch (field) {
      case "fname":
      case "lname":
        return value.trim() ? "" : "This field is required";
      case "street":
        return value.trim() ? "" : "Street address is required";
      case "city":
        return value.trim() ? "" : "City is required";
      case "state":
        return value.trim().length === 2 ? "" : "Enter 2-letter state code";
      case "zip":
        return /^\d{5}(-\d{4})?$/.test(value) ? "" : "Enter valid ZIP code";
      case "cardNumber":
        return /^\d{13,19}$/.test(value.replace(/\s/g, "")) ? "" : "Enter valid card number";
      case "expiration":
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? "" : "Use MM/YY format";
      case "code":
        return /^\d{3,4}$/.test(value) ? "" : "Enter 3-4 digit code";
      default:
        return "";
    }
  }

  function handleInput(field: keyof CheckoutFormData, event: Event) {
    const target = event.target as HTMLInputElement;
    formData[field] = target.value;
    errors[field] = validateField(field, target.value);
  }

  function validateForm(): boolean {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
    let isValid = true;

    for (const field in formData) {
      const error = validateField(field as keyof CheckoutFormData, formData[field as keyof CheckoutFormData]);
      if (error) {
        newErrors[field as keyof CheckoutFormData] = error;
        isValid = false;
      }
    }

    errors = newErrors;
    return isValid;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    submitMessage = null;

    if (!validateForm()) {
      submitMessage = { type: "error", text: "Please fix the errors in the form." };
      return;
    }

    isSubmitting = true;

    try {
      const result = await submitOrder(formData);

      if (result.success) {
        submitMessage = { type: "success", text: result.message };
        // Clear cart on success
        setLocalStorage("so-cart", []);
        cartItems = [];
        totals = {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          itemCount: 0
        };
        // Reset form
        formData = {
          fname: "",
          lname: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          cardNumber: "",
          expiration: "",
          code: ""
        };
      } else {
        submitMessage = { type: "error", text: result.message };
      }
    } catch (error) {
      submitMessage = { type: "error", text: "An unexpected error occurred. Please try again." };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="checkout-container">
  {#if cartItems.length === 0}
    <div class="empty-cart-message">
      <p>Your cart is empty. <a href="/cart">Go to cart</a> to add items.</p>
    </div>
  {:else}
    <div class="checkout-grid">
      <div class="checkout-form-section">
        <h3>Shipping Information</h3>
        <form onsubmit={handleSubmit} novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="fname">First Name *</label>
              <input
                type="text"
                id="fname"
                value={formData.fname}
                oninput={(e) => handleInput("fname", e)}
                class:error={errors.fname}
                disabled={isSubmitting}
                required
              />
              {#if errors.fname}<span class="error-message">{errors.fname}</span>{/if}
            </div>
            <div class="form-group">
              <label for="lname">Last Name *</label>
              <input
                type="text"
                id="lname"
                value={formData.lname}
                oninput={(e) => handleInput("lname", e)}
                class:error={errors.lname}
                disabled={isSubmitting}
                required
              />
              {#if errors.lname}<span class="error-message">{errors.lname}</span>{/if}
            </div>
          </div>

          <div class="form-group">
            <label for="street">Street Address *</label>
            <input
              type="text"
              id="street"
              value={formData.street}
              oninput={(e) => handleInput("street", e)}
              class:error={errors.street}
              disabled={isSubmitting}
              required
            />
            {#if errors.street}<span class="error-message">{errors.street}</span>{/if}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City *</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                oninput={(e) => handleInput("city", e)}
                class:error={errors.city}
                disabled={isSubmitting}
                required
              />
              {#if errors.city}<span class="error-message">{errors.city}</span>{/if}
            </div>
            <div class="form-group">
              <label for="state">State *</label>
              <input
                type="text"
                id="state"
                value={formData.state}
                oninput={(e) => handleInput("state", e)}
                class:error={errors.state}
                placeholder="CA"
                maxlength="2"
                disabled={isSubmitting}
                required
              />
              {#if errors.state}<span class="error-message">{errors.state}</span>{/if}
            </div>
            <div class="form-group">
              <label for="zip">ZIP Code *</label>
              <input
                type="text"
                id="zip"
                value={formData.zip}
                oninput={(e) => handleInput("zip", e)}
                class:error={errors.zip}
                placeholder="12345"
                disabled={isSubmitting}
                required
              />
              {#if errors.zip}<span class="error-message">{errors.zip}</span>{/if}
            </div>
          </div>

          <h3>Payment Information</h3>

          <div class="form-group">
            <label for="cardNumber">Card Number *</label>
            <input
              type="text"
              id="cardNumber"
              value={formData.cardNumber}
              oninput={(e) => handleInput("cardNumber", e)}
              class:error={errors.cardNumber}
              placeholder="1234567890123456"
              disabled={isSubmitting}
              required
            />
            {#if errors.cardNumber}<span class="error-message">{errors.cardNumber}</span>{/if}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="expiration">Expiration *</label>
              <input
                type="text"
                id="expiration"
                value={formData.expiration}
                oninput={(e) => handleInput("expiration", e)}
                class:error={errors.expiration}
                placeholder="MM/YY"
                maxlength="5"
                disabled={isSubmitting}
                required
              />
              {#if errors.expiration}<span class="error-message">{errors.expiration}</span>{/if}
            </div>
            <div class="form-group">
              <label for="code">Security Code *</label>
              <input
                type="text"
                id="code"
                value={formData.code}
                oninput={(e) => handleInput("code", e)}
                class:error={errors.code}
                placeholder="123"
                maxlength="4"
                disabled={isSubmitting}
                required
              />
              {#if errors.code}<span class="error-message">{errors.code}</span>{/if}
            </div>
          </div>

          {#if submitMessage}
            <div class="submit-message {submitMessage.type}">
              {submitMessage.text}
            </div>
          {/if}

          <button type="submit" class="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>

      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-items">
          {#each cartItems as item}
            <div class="summary-item">
              <span class="item-name">{item.name}</span>
              <span class="item-price">${item.finalPrice.toFixed(2)}</span>
            </div>
          {/each}
        </div>
        <div class="summary-totals">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (6%):</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>${totals.shipping.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
