import { defineCollection } from "astro:content";
import { file } from "astro/loaders";

// we can also create collections that load from markdown files in a directory...this is an example of how to do that.
// const posts = defineCollection({
//   loader: glob({ pattern: "**/*.md", base: "./src/content/blog" })
// });

// load our product info from local file for reliable builds
const products = defineCollection({
  loader: file("public/json/tents.json")
});

export const collections = { products };