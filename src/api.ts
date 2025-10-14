import axios from "axios";
import Cookies from "js-cookie";
import type {
  Chart,
  Session,
  Summary,
  User,
  Product,
  ProductFormData,
  ProductList,
} from "./types";

const baseURL = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from cookie to Authorization header
import type { AxiosRequestConfig } from "axios";

api.interceptors.request.use((config: AxiosRequestConfig | any) => {
  try {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export async function login(email: string, password: string) {
  const res = await api.post(`/api/login`, { email, password });
  return res.data as Session;
}

export async function register(username: string, email: string, password: string, role?: string, avatar?: number, adminCode?: string) {
  const res = await api.post(`/api/register`, { username, email, password, role, avatar, adminCode });
  return res.data as Session;
}

export async function getUser() {
  const res = await api.get(`/api/me`);
  return res.data as User;
}

export async function getSummary() {
  const res = await api.get(`/api/summary`);
  return res.data as Summary;
}

export async function getChartData(
  type: "FUEL_TYPE" | "OEM" | "REGISTRATION_YEAR",
) {
  const res = await api.get(`/api/chart`, { params: { type } });
  return res.data as Array<Chart>;
}

export async function getProducts(page: number, q: string) {
  const res = await api.get(`/api/products`, { params: { page, q } });
  return res.data as ProductList;
}

export async function getProduct(id: string) {
  const res = await api.get(`/api/products/${id}`);
  return res.data as Product;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
}

export async function getManufacturers() {
  const res = await api.get(`/api/manufacturers`);
  return res.data as Array<string>;
}

export async function getModels() {
  const res = await api.get(`/api/models`);
  return res.data as Array<string>;
}

export async function getTypes() {
  const res = await api.get(`/api/types`);
  return res.data as Array<string>;
}

export async function getColors() {
  const res = await api.get(`/api/colors`);
  return res.data as Array<string>;
}

export async function createProduct(body: ProductFormData) {
  const res = await api.post(`/api/products`, body);
  return res.data as Product;
}

export async function updateProduct(id: string, body: Partial<ProductFormData>) {
  const res = await api.patch(`/api/products/${id}`, body);
  return res.data as Product;
}
