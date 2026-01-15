import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve("src/index.html"),
        cart: resolve("src/cart/index.html"),
        checkout: resolve("src/checkout/index.html"),
        product1: resolve("src/product_pages/cedar-ridge-rimrock-2.html"),
        product2: resolve("src/product_pages/marmot-ajax-3.html"),
        product3: resolve("src/product_pages/northface-alpine-3.html"),
        product4: resolve("src/product_pages/northface-talus-4.html"),
      },
    },
  },
});
