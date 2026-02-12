import type {Product} from "./types.mts"

const API_URL = import.meta.env.PUBLIC_SERVER_URL;

function convertToJson(res:Response) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export async function getProducts(category = "tents") {
  return fetch(`${API_URL}products?category=${category}`)
    .then(convertToJson);}

export async function findProductById(id:string): Promise<Product> {
  const response = await fetch(`${API_URL}products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }
  return response.json();
}