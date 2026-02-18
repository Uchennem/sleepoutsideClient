<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts } from "../productData.mts";
  import type { Product } from "../types.mts";
  import { getParam } from "../utils.mts";
  import ProductSummary from "./ProductSummary.svelte";

  // declare these out here as state so we can use it in our template below
  let category = $state("");
  let products: Product[] = $state([]);
  let loading = $state(true);
  let error = $state("");

  async function init() {
    try {
      category = getParam("category") || "tents";
      const data = await getProducts(category);
      products = data.results || [];
    } catch (err) {
      error = "Failed to load products";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(init);
</script>

<h2>Top products: {category}</h2>

{#if loading}
  <p>Loading products...</p>
{:else if error}
  <p>{error}</p>
{:else if products.length === 0}
  <p>No products found</p>
{:else}
  <ul class="product-list">
    {#each products as product (product.id)}
      <ProductSummary {product} />
    {/each}
  </ul>
{/if}

<style>
  h2 {
    margin: 1rem 0;
  }

  .product-list {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
</style>
