import { apiFetchJson, apiPath } from "./base";

export async function fetchCategories() {
  return apiFetchJson(apiPath("/api/categories"));
}
