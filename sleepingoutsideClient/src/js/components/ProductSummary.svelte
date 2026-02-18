<script lang="ts">
  import type { Product } from "../types.mts";

  let { product }: { product: Product } = $props();
</script>

<li class="product-card">
  <a href={`/products/${product.id}`}>
    <img src={product.images.primaryMedium} alt={product.name} />
    <h3 class="card__brand">{product.brand.name}</h3>
    <h2 class="card__name">{product.nameWithoutBrand}</h2>
    <p class="product-card__price">${product.finalPrice}</p>
  </a>
</li>

<style>
  .product-card {
    list-style: none;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: box-shadow 0.3s ease;
  }

  .product-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  a {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  img {
    width: 100%;
    height: auto;
    margin-bottom: 0.5rem;
  }

  .card__brand {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0;
  }

  .card__name {
    font-size: 1rem;
    margin: 0.5rem 0;
  }

  .product-card__price {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2a3f35;
    margin: 0.5rem 0 0 0;
  }
</style>
