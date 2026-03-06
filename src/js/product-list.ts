import { getData } from "./productData.mts";
import { getParam } from "./utils.mts";

let currentProducts: any[] = [];

function formatCategoryLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeProducts(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.Result)) return data.Result;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getItemId(item: any) {
  return item.id ?? item.Id ?? "";
}

function getItemImage(item: any) {
  return item.image ?? item.images?.primaryMedium ?? item.Images?.PrimaryMedium ?? "/banner.jpg";
}

function getItemBrand(item: any) {
  return item.brand?.name ?? item.Brand?.Name ?? item.brand ?? item.Brand ?? "Brand";
}

function getItemName(item: any) {
  return item.nameWithoutBrand ?? item.NameWithoutBrand ?? item.name ?? item.Name ?? "Product";
}

function getItemPrice(item: any) {
  return item.finalPrice ?? item.FinalPrice ?? item.price ?? item.ListPrice ?? "Price TBA";
}

function getItemColor(item: any) {
  return item.colors?.[0]?.colorName ?? item.Colors?.[0]?.ColorName ?? "";
}

function getItemDescription(item: any) {
  return item.descriptionHtmlSimple ?? item.DescriptionHtmlSimple ?? item.description ?? item.Description ?? "";
}

function productCardTemplate(item: any) {
  const id = getItemId(item);
  const image = getItemImage(item);
  const brand = getItemBrand(item);
  const name = getItemName(item);
  const price = getItemPrice(item);

  return `<li class="product-card">
  <a href="/products/${id}">
    <img src="${image}" alt="${name}" />
    <h3 class="card__brand">${brand}</h3>
    <h2 class="card__name">${name}</h2>
    <p class="product-card__price">$${price}</p>
  </a>
  <button type="button" class="quick-view-button" data-quick-view-id="${id}">Quick View</button>
</li>`;
}

function openQuickViewModal(item: any) {
  const modal = document.getElementById("quickViewModal") as HTMLElement | null;
  if (!modal) return;

  const imageEl = document.getElementById("quickViewImage") as HTMLImageElement | null;
  const brandEl = document.getElementById("quickViewBrand") as HTMLElement | null;
  const titleEl = document.getElementById("quickViewTitle") as HTMLElement | null;
  const priceEl = document.getElementById("quickViewPrice") as HTMLElement | null;
  const colorEl = document.getElementById("quickViewColor") as HTMLElement | null;
  const descriptionEl = document.getElementById("quickViewDescription") as HTMLElement | null;

  const image = getItemImage(item);
  const brand = getItemBrand(item);
  const name = getItemName(item);
  const price = getItemPrice(item);
  const color = getItemColor(item);
  const description = getItemDescription(item);

  if (imageEl) {
    imageEl.src = image;
    imageEl.alt = name;
  }
  if (brandEl) brandEl.textContent = brand;
  if (titleEl) titleEl.textContent = name;
  if (priceEl) priceEl.textContent = `$${price}`;
  if (colorEl) colorEl.textContent = color;
  if (descriptionEl) descriptionEl.innerHTML = description;

  modal.classList.remove("hidden");
}

function closeQuickViewModal() {
  const modal = document.getElementById("quickViewModal") as HTMLElement | null;
  if (!modal) return;
  modal.classList.add("hidden");
}

function setupQuickViewHandlers() {
  const listEl = document.querySelector(".product-list") as HTMLElement | null;
  const modal = document.getElementById("quickViewModal") as HTMLElement | null;

  if (listEl && !listEl.dataset.quickViewListenerAttached) {
    listEl.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const quickViewButton = target.closest("[data-quick-view-id]") as HTMLButtonElement | null;
      if (!quickViewButton) return;

      const productId = quickViewButton.dataset.quickViewId;
      const product = currentProducts.find((item) => getItemId(item) === productId);
      if (!product) return;

      openQuickViewModal(product);
    });
    listEl.dataset.quickViewListenerAttached = "true";
  }

  if (modal && !modal.dataset.modalListenerAttached) {
    modal.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-close-modal='true']")) {
        closeQuickViewModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeQuickViewModal();
      }
    });

    modal.dataset.modalListenerAttached = "true";
  }
}

async function initProductListPage() {
  const category = getParam("category") || "tents";
  const categoryLabel = formatCategoryLabel(category);
  const breadcrumbEl = document.querySelector(".breadcrumb") as HTMLElement | null;
  const headingEl = document.querySelector(".products h2") as HTMLElement | null;
  const listEl = document.querySelector(".product-list") as HTMLElement | null;

  if (headingEl) {
    headingEl.textContent = `Top Products: ${categoryLabel}`;
  }

  if (!listEl) return;

  try {
    const data = await getData(category);
    const products = normalizeProducts(data);
    currentProducts = products;

    if (breadcrumbEl) {
      breadcrumbEl.textContent = `${categoryLabel}->(${products.length} items)`;
    }

    if (products.length === 0) {
      listEl.innerHTML = `<li class="product-card">No products found.</li>`;
      setupQuickViewHandlers();
      return;
    }

    listEl.innerHTML = products.map(productCardTemplate).join("");
    setupQuickViewHandlers();
  } catch {
    if (breadcrumbEl) {
      breadcrumbEl.textContent = `${categoryLabel}->(0 items)`;
    }
    currentProducts = [];
    listEl.innerHTML = `<li class="product-card">Unable to load products.</li>`;
    setupQuickViewHandlers();
  }
}

initProductListPage();
