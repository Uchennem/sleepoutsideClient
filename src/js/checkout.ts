import { getLocalStorage } from "./utils.mts";
import type { Product, OrderItem, Order, CheckoutFormData, OrderResponse } from "./types.mts";
import { userStore } from "./auth.svelte.ts";

const baseURL = import.meta.env.PUBLIC_SERVER_URL;

export function calculateTax(subtotal: number): number {
  return subtotal * 0.06;
}

export function calculateShipping(itemCount: number): number {
  if (itemCount === 0) return 0;
  return 10 + (itemCount - 1) * 2;
}

export function formatCartItems(): OrderItem[] {
  const storedCart = getLocalStorage("so-cart");
  const cartItems = Array.isArray(storedCart) ? storedCart as Product[] : [];
  
  return cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.finalPrice,
    quantity: 1
  }));
}

export function calculateOrderTotals(cartItems: Product[]) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.finalPrice, 0);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(cartItems.length);
  const total = subtotal + tax + shipping;
  
  return {
    subtotal,
    tax,
    shipping,
    total,
    itemCount: cartItems.length
  };
}

export async function submitOrder(formData: CheckoutFormData): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    if (!userStore.isLoggedIn || !userStore.user?._id || !userStore.token) {
      return {
        success: false,
        message: "You must be logged in to place an order."
      };
    }

    const storedCart = getLocalStorage("so-cart");
    const cartItems = Array.isArray(storedCart) ? storedCart as Product[] : [];
    
    if (cartItems.length === 0) {
      return {
        success: false,
        message: "Your cart is empty."
      };
    }

    const orderItems = formatCartItems();
    const totals = calculateOrderTotals(cartItems);
    
    const order: Order = {
      items: orderItems,
      orderDate: new Date().toISOString(),
      fname: formData.fname,
      lname: formData.lname,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      cardNumber: formData.cardNumber,
      expiration: formData.expiration,
      code: formData.code,
      orderTotal: totals.total,
      tax: totals.tax,
      shipping: totals.shipping,
      userId: userStore.user._id
    };

    const response = await fetch(`${baseURL}orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userStore.token}`
      },
      body: JSON.stringify(order)
    });

    const data = await response.json() as OrderResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Order failed: ${response.statusText}`
      };
    }

    return {
      success: true,
      message: "Order placed successfully!",
      orderId: data._id
    };
  } catch (error) {
    console.error("Order submission error:", error);
    return {
      success: false,
      message: "Unable to submit order. Please try again."
    };
  }
}
