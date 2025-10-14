import { redirect } from "react-router-dom";

export const loader = async () => redirect("/products");

export function Component() {
  // This route now redirects to /products. Component is kept for compatibility.
  return null;
}
Component.displayName = "Products";
