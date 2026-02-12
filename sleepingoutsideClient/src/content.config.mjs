import { defineCollection, glob } from "astro:content";

// we can also create collections that load from markdown files in a directory...this is an example of how to do that.
// const posts = defineCollection({
//   loader: glob({ pattern: "**/*.md", base: "./src/content/blog" })
// });

// load our product info from the API
const products = defineCollection({
  loader: async () => {
    try {
      const serverUrl = import.meta.env.PUBLIC_SERVER_URL;
      if (!serverUrl) {
        throw new Error("PUBLIC_SERVER_URL not configured");
      }
      const response = await fetch(
        serverUrl + "products?limit=200"
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Must return an array of entries with an id property, or an object with IDs as keys and entries as values
      return data.results || data;
    } catch (error) {
      console.warn("Failed to fetch products from API, falling back to local file:", error);
      // Fall back to local JSON file if API is unavailable
      const tentsData = await import("../public/json/tents.json", { assert: { type: "json" } });
      return tentsData.default;
    }
  }
});

export const collections = { products };