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
    
    const id = rawData.id ?? rawData.Id;
    const _id = rawData._id ?? rawData.Id ?? rawData.id;
    if (!id && !_id) return null;

    // Normalize colors from either camelCase or PascalCase source data
    const colors = (rawData.colors ?? rawData.Colors ?? []).map((c: any) => ({
      colorCode: c.colorCode ?? c.ColorCode ?? "",
      colorName: c.colorName ?? c.ColorName ?? "",
      colorChipImageSrc: c.colorChipImageSrc ?? c.ColorChipImageSrc ?? "",
      colorPreviewImageSrc: c.colorPreviewImageSrc ?? c.ColorPreviewImageSrc ?? ""
    }));

    // Normalize sizesAvailable: map any known key variant to { zipper }
    const rawSizes = rawData.sizesAvailable ?? rawData.SizesAvailable ?? {};
    const sizesAvailable = {
      zipper: rawSizes.zipper ?? rawSizes.ZIPPER ?? rawSizes.Zipper ?? []
    };

    // Normalize brand from either camelCase or PascalCase source data
    const rawBrand = rawData.brand ?? rawData.Brand ?? {};
    const brand = {
      id: rawBrand.id ?? rawBrand.Id ?? "",
      url: rawBrand.url ?? rawBrand.Url ?? "",
      productsUrl: rawBrand.productsUrl ?? rawBrand.ProductsUrl ?? "",
      logoSrc: rawBrand.logoSrc ?? rawBrand.LogoSrc ?? "",
      name: rawBrand.name ?? rawBrand.Name ?? ""
    };

    // Normalize the product data to match the Product type
    const normalized: Product = {
      _id,
      id,
      isClearance: rawData.isClearance ?? rawData.IsClearance ?? false,
      category: rawData.category ?? rawData.Category ?? "",
      isNew: rawData.isNew ?? rawData.IsNew ?? false,
      url: rawData.url ?? rawData.Url ?? "",
      reviews: {
        reviewsUrl: rawData.reviews?.reviewsUrl ?? rawData.Reviews?.ReviewsUrl ?? "",
        reviewCount: rawData.reviews?.reviewCount ?? rawData.Reviews?.ReviewCount ?? 0,
        averageRating: rawData.reviews?.averageRating ?? rawData.Reviews?.AverageRating ?? 0
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
      sizesAvailable,
      colors,
      descriptionHtmlSimple: rawData.descriptionHtmlSimple ?? rawData.DescriptionHtmlSimple ?? "",
      suggestedRetailPrice: rawData.suggestedRetailPrice ?? rawData.SuggestedRetailPrice ?? 0,
      brand,
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
