import type { Product } from "./types.mts";
import { setLocalStorage, getLocalStorage } from "./utils.mts";

function showProductError(message: string) {
  const detailSection = document.querySelector(".product-detail");
  if (!detailSection) return;

  let errorEl = detailSection.querySelector(".product-error") as HTMLParagraphElement | null;
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.className = "product-error";
    errorEl.setAttribute("role", "alert");
    detailSection.appendChild(errorEl);
  }

  errorEl.textContent = message;
}

function showCartMessage(message: string) {
  let messageEl = document.querySelector(".cart-toast") as HTMLDivElement | null;

  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.className = "cart-toast";
    messageEl.setAttribute("role", "status");
    messageEl.setAttribute("aria-live", "polite");
    document.body.appendChild(messageEl);
  }

  messageEl.textContent = message;
  messageEl.classList.remove("show");
  void messageEl.offsetWidth;
  messageEl.classList.add("show");

  window.setTimeout(() => {
    messageEl?.classList.remove("show");
  }, 1800);
}

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

function getProductData(): Product | null {
  const productDataEl = document.getElementById("product-data");
  if (!productDataEl) return null;
  
  try {
    const rawData = JSON.parse(productDataEl.textContent || "{}");
    
    // Normalize the product data to match the Product type
    const normalized: Product = {
      _id: rawData._id ?? rawData.Id ?? rawData.id,
      id: rawData.id ?? rawData.Id,
      isClearance: rawData.isClearance ?? rawData.IsClearance ?? false,
      category: rawData.category ?? rawData.Category ?? "",
      isNew: rawData.isNew ?? rawData.IsNew ?? false,
      url: rawData.url ?? rawData.Url ?? "",
      reviews: rawData.reviews ?? rawData.Reviews ?? {
        reviewsUrl: "",
        reviewCount: 0,
        averageRating: 0
      },
      nameWithoutBrand: rawData.nameWithoutBrand ?? rawData.NameWithoutBrand ?? rawData.name ?? rawData.Name ?? "",
      name: rawData.name ?? rawData.Name ?? "",
      images: {
        primarySmall: rawData.images?.primarySmall ?? rawData.Images?.PrimarySmall ?? "",
        primaryMedium: rawData.images?.primaryMedium ?? rawData.Images?.PrimaryMedium ?? "",
        primaryLarge: rawData.images?.primaryLarge ?? rawData.Images?.PrimaryLarge ?? "",
        primaryExtraLarge: rawData.images?.primaryExtraLarge ?? rawData.Images?.PrimaryExtraLarge ?? "",
        extraImages: rawData.images?.extraImages ?? rawData.Images?.ExtraImages ?? []
      },
      sizesAvailable: rawData.sizesAvailable ?? rawData.SizesAvailable ?? { zipper: [] },
      colors: rawData.colors ?? rawData.Colors ?? [],
      descriptionHtmlSimple: rawData.descriptionHtmlSimple ?? rawData.DescriptionHtmlSimple ?? "",
      suggestedRetailPrice: rawData.suggestedRetailPrice ?? rawData.SuggestedRetailPrice ?? 0,
      brand: rawData.brand ?? rawData.Brand ?? { id: "", url: "", productsUrl: "", logoSrc: "", name: "" },
      listPrice: rawData.listPrice ?? rawData.ListPrice ?? 0,
      finalPrice: rawData.finalPrice ?? rawData.FinalPrice ?? 0
    };
    
    return normalized;
  } catch {
    return null;
  }
}

// add to cart button event handler
function addToCartHandler(e: Event) {
  const productData = getProductData();
  
  if (!productData) {
    showProductError("Product not found. Unable to add to cart.");
    return;
  }

  addProductToCart(productData);
  animateCartIcon();
  showCartMessage(`${productData.name} added to cart`);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
