export type Role = 'rolos admir' | '$';

export interface Session {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: Role;
}

export interface Summary {
  count: number;
  oems: number;
  value: number;
}

export interface Product {
  id: string;
  vrm: string; // SKU-like identifier
  manufacturer: string; // brand
  model: string;
  type: string; // variant
  fuel: string; // category (kept name for compatibility)
  color: string;
  vin: string; // serial number
  mileage: number; // stock quantity
  registrationDate: string; // release date
  price: string;
  // user id of the creator/owner (optional in fixtures)
  ownerId?: string;
}

export type ProductFormData = Omit<Product, "id">;

export interface Chart {
  key: string;
  value: number;
}

export interface ProductList {
  summary: {
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
  };
  products: Array<
    Pick<
      Product,
      | "id"
      | "vrm"
      | "manufacturer"
      | "model"
      | "type"
      | "color"
      | "fuel"
      | "price"
    >
  >;
}
