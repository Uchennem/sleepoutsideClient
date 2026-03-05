import { getData } from "./productData.mts";
import { getParam } from "./utils.mts";

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
</li>`;
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

    if (breadcrumbEl) {
      breadcrumbEl.textContent = `${categoryLabel}->(${products.length} items)`;
    }

    if (products.length === 0) {
      listEl.innerHTML = `<li class="product-card">No products found.</li>`;
      return;
    }

    listEl.innerHTML = products.map(productCardTemplate).join("");
  } catch {
    if (breadcrumbEl) {
      breadcrumbEl.textContent = `${categoryLabel}->(0 items)`;
    }
    listEl.innerHTML = `<li class="product-card">Unable to load products.</li>`;
  }
}

initProductListPage();
