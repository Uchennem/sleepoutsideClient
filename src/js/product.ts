import type { Product } from "./types.mts";
import { setLocalStorage, getLocalStorage, getWishlistStorageKey, getWishlistItems, setWishlistItems } from "./utils.mts";

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

function showProductMessage(message: string) {
  let messageEl = document.querySelector(".product-toast") as HTMLDivElement | null;
  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.className = "product-toast";
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

function normalizeColor(color: any) {
  return {
    colorCode: color?.colorCode ?? color?.ColorCode ?? "",
    colorName: color?.colorName ?? color?.ColorName ?? "",
    colorChipImageSrc: color?.colorChipImageSrc ?? color?.ColorChipImageSrc ?? "",
    colorPreviewImageSrc: color?.colorPreviewImageSrc ?? color?.ColorPreviewImageSrc ?? ""
  };
}

function getProductData(): Product | null {
  const productDataEl = document.getElementById("product-data");
  if (!productDataEl) return null;
  
  try {
    const rawData = JSON.parse(productDataEl.textContent || "{}") as any;
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
      colors: (Array.isArray(rawData.colors ?? rawData.Colors)
        ? (rawData.colors ?? rawData.Colors).map(normalizeColor)
        : []),
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

function updateWishlistButtonState(productId: string) {
  const wishlistButton = document.getElementById("addToWishlist") as HTMLButtonElement | null;
  if (!wishlistButton) return;

  const wishlistItems = getWishlistItems();
  const inWishlist = wishlistItems.some((item) => item.id === productId);
  wishlistButton.textContent = inWishlist ? "Remove from Wishlist" : "Add to Wishlist";
}

function toggleWishlist(product: Product) {
  const wishlistItems = getWishlistItems();
  const existingIndex = wishlistItems.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    wishlistItems.splice(existingIndex, 1);
    setWishlistItems(wishlistItems);
    return false;
  }

  wishlistItems.push(product);
  setWishlistItems(wishlistItems);
  return true;
}

function getSelectedColorIndex() {
  const checkedColorInput = document.querySelector("input[name='product-color']:checked") as HTMLInputElement | null;
  if (!checkedColorInput) return 0;

  const selectedIndex = Number(checkedColorInput.value);
  return Number.isNaN(selectedIndex) ? 0 : selectedIndex;
}

function getSelectedProduct(product: Product) {
  if (!Array.isArray(product.colors) || product.colors.length === 0) return product;

  const colorIndex = getSelectedColorIndex();
  const selectedColor = product.colors[colorIndex] ?? product.colors[0];
  if (!selectedColor) return product;

  return {
    ...product,
    colors: [selectedColor],
    images: {
      ...product.images,
      primaryMedium: selectedColor.colorPreviewImageSrc || product.images.primaryMedium,
      primarySmall: selectedColor.colorPreviewImageSrc || product.images.primarySmall
    }
  };
}

function setupColorSelection() {
  const colorOptions = document.querySelector(".product-color-options");
  const selectedColorNameEl = document.getElementById("selected-color-name");
  if (!colorOptions || !selectedColorNameEl) return;

  colorOptions.addEventListener("change", () => {
    const product = getProductData();
    if (!product?.colors?.length) return;

    const selectedIndex = getSelectedColorIndex();
    const selectedColor = product.colors[selectedIndex] ?? product.colors[0];
    if (!selectedColor) return;

    selectedColorNameEl.textContent = selectedColor.colorName;
  });
}

type ProductReview = {
  comment: string;
  createdAt: string;
};

function getReviewsStorageKey(productId: string) {
  return `so-reviews-${productId}`;
}

function getProductReviews(productId: string): ProductReview[] {
  const reviewsData = getLocalStorage(getReviewsStorageKey(productId));
  return Array.isArray(reviewsData) ? reviewsData : [];
}

function saveProductReviews(productId: string, reviews: ProductReview[]) {
  localStorage.setItem(getReviewsStorageKey(productId), JSON.stringify(reviews));
}

function renderProductReviews(productId: string) {
  const reviewList = document.getElementById("review-list") as HTMLUListElement | null;
  if (!reviewList) return;

  const reviews = getProductReviews(productId);
  reviewList.innerHTML = "";

  if (reviews.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "review-list__empty";
    emptyItem.textContent = "No reviews yet. Be the first to comment.";
    reviewList.appendChild(emptyItem);
    return;
  }

  reviews.forEach((review) => {
    const item = document.createElement("li");
    item.className = "review-item";

    const commentEl = document.createElement("p");
    commentEl.textContent = review.comment;

    const dateEl = document.createElement("small");
    dateEl.textContent = new Date(review.createdAt).toLocaleString();

    item.appendChild(commentEl);
    item.appendChild(dateEl);
    reviewList.appendChild(item);
  });
}

function setupReviewForm(productId: string) {
  const form = document.getElementById("review-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const comment = String(formData.get("comment") ?? "").trim();
    if (!comment) return;

    const reviews = getProductReviews(productId);
    reviews.unshift({
      comment,
      createdAt: new Date().toISOString()
    });

    saveProductReviews(productId, reviews);
    form.reset();
    renderProductReviews(productId);
  });
}

function addToCartHandler() {
  const productData = getProductData();
  const product = productData ? getSelectedProduct(productData) : null;
  if (!product) {
    showProductError("Product not found. Unable to add to cart.");
    return;
  }

  addProductToCart(product);
  animateCartIcon();
  showProductMessage(`${product.name} added to cart`);
}

function wishlistHandler() {
  const productData = getProductData();
  const product = productData ? getSelectedProduct(productData) : null;
  if (!product) {
    showProductError("Product not found. Unable to update wishlist.");
    return;
  }

  const wasAdded = toggleWishlist(product);
  updateWishlistButtonState(product.id);
  showProductMessage(wasAdded ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);

document
  .getElementById("addToWishlist")
  ?.addEventListener("click", wishlistHandler);

const currentProduct = getProductData();
if (currentProduct?.id) {
  updateWishlistButtonState(currentProduct.id);
  renderProductReviews(currentProduct.id);
  setupReviewForm(currentProduct.id);
}

setupColorSelection();
