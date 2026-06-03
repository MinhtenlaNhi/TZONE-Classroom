import { apiFetchJson, apiPath } from "./base";

export async function fetchCart() {
  return apiFetchJson("/api/cart");
}

export async function addToCart(courseId) {
  return apiFetchJson("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({ courseId })
  });
}

export async function removeFromCart(courseId) {
  return apiFetchJson(`/api/cart/${courseId}`, {
    method: "DELETE"
  });
}
