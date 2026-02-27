<script lang="ts">
  import { onMount } from "svelte";
  import { getLocalStorage } from "../utils.mts";

  let count = $state(0);

  function updateCount() {
    count = getLocalStorage("so-cart").length;
  }

  onMount(() => {
    updateCount();

    const onStorageUpdate = (event: StorageEvent) => {
      if (event.key === "so-cart" || event.key === null) {
        updateCount();
      }
    };

    const onCartUpdate = () => {
      updateCount();
    };

    window.addEventListener("storage", onStorageUpdate);
    window.addEventListener("so-cart-updated", onCartUpdate);

    return () => {
      window.removeEventListener("storage", onStorageUpdate);
      window.removeEventListener("so-cart-updated", onCartUpdate);
    };
  });
</script>

{#if count > 0}
  <sup class="cart__count" aria-live="polite">{count}</sup>
{/if}
