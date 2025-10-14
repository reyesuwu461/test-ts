import { fakerEN_GB as faker } from "@faker-js/faker";
import type { DefaultBodyType, PathParams, StrictResponse } from "msw";
import { delay, http, HttpResponse } from "msw";
import type {
  Chart,
  Session,
  Summary,
  User,
  Product,
  ProductFormData,
  ProductList,
} from "../types";

// In-memory users store with roles
type Role = 'rolos admir' | 'user';
interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: Role;
}

// Admin creation code (used by the register handler). It preferes the Vite env var
// VITE_ADMIN_CODE but falls back to the example secret so it's easy to test locally.
const adminCode = import.meta.env.VITE_ADMIN_CODE ?? 'changeme_admin_code'; 

const users: MockUser[] = [
  {
    id: '1',
    name: 'Admin Rolos',
    email: 'admin@example.com',
    password: 'adminpass', /**  'changeme_admin_code' */
    avatar: 'avatar-admin',
    role: 'rolos admir',
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'userpass',
    avatar: 'avatar-user',
    role: 'user',
  },
];

const defaultUser = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatarGitHub(),
};

const productCount = faker.number.int({ min: 75, max: 125 });

// Generate product mocks (TechNova catalog)
const categories = ["Laptop", "Monitor", "Peripheral", "Accessory"];
let products: Array<Product> = [...Array(productCount).keys()].map(() => ({
  id: faker.string.uuid(),
  // SKU-like code
  vrm: faker.string.alphanumeric(8),
  // brand
  manufacturer: faker.company.name(),
  // product name/model
  model: faker.commerce.productName(),
  // variant or type
  type: faker.commerce.productMaterial(),
  // category (maps to previous 'fuel')
  fuel: faker.helpers.arrayElement(categories),
  color: faker.color.human(),
  // serial number
  vin: faker.string.alphanumeric(12),
  // stock quantity
  mileage: faker.number.int({ min: 0, max: 500 }),
  // release date
  registrationDate: faker.date.past({ years: 5 }).toISOString().split("T")[0],
  price: faker.commerce.price({ min: 50, max: 5000 }),
  // Assign ownerId randomly among existing users (admin or regular)
  ownerId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
}));

const DELAY = undefined;

// Simple session store: token -> userId
const sessions: Record<string, string> = {};

export const handlers = [
  http.post<PathParams, { email: string; password: string }, Session>(
    `${import.meta.env.VITE_API_URL}/api/login`,
    async ({ request }) => {
      await delay(DELAY);
      const body = await request.json();
      const found = users.find(
        (u) => u.email === body.email && u.password === body.password,
      );
      if (found) {
        // Create token and map session
        const token = faker.string.uuid();
        sessions[token] = found.id;
        // Return token and role
        return HttpResponse.json({
          token,
          user: { id: found.id, name: found.name, email: found.email, role: found.role },
        });
      }

      return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
    },
  ),

  http.get<PathParams, DefaultBodyType, User>(
    `${import.meta.env.VITE_API_URL}/api/me`,
    async ({ request }) => {
      await delay(DELAY);

      const auth = request.headers.get("authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (token && sessions[token]) {
        const u = users.find((x) => x.id === sessions[token]);
        if (u) {
          return HttpResponse.json({ id: u.id, name: u.name, email: u.email, avatar: u.avatar ?? "", role: u.role } as unknown as User);
        }
      }

      return HttpResponse.json(defaultUser as unknown as User);
    },
  ),

  // Register endpoint
  http.post<PathParams, { username: string; email: string; password: string; avatar?: number; role?: string; adminCode?: string }, Session>(
    `${import.meta.env.VITE_API_URL}/api/register`,
    async ({ request }) => {
      await delay(DELAY);

      const body = await request.json();
      if (!body.email || !body.password || !body.username) {
        return new HttpResponse(null, { status: 400 }) as StrictResponse<never>;
      }

      // Prevent duplicate email
      if (users.some((u) => u.email === body.email)) {
        return new HttpResponse(null, { status: 409 }) as StrictResponse<never>;
      }

      // Map role and avatar defaults
      const role: Role = body.role === 'rolos admir' ? 'rolos admir' : 'user';
      // If role is admin, require adminCode to match env var/fallback
      if (role === 'rolos admir') {
        const adminCodeFromBody = body.adminCode as string | undefined;
        const expected = adminCode; // top-level constant (prefers VITE_ADMIN_CODE)
        if (!adminCodeFromBody || adminCodeFromBody !== expected) {
          return new HttpResponse(null, { status: 403 }) as StrictResponse<never>;
        }
      }
      const avatarIndex: number | undefined = typeof body.avatar === 'number' ? body.avatar : undefined;

      // Simple avatar assignment: admin gets avatar 1, user avatar 0 if none provided
      const avatar = avatarIndex !== undefined ? `avatar-${avatarIndex}` : role === 'rolos admir' ? 'avatar-admin' : 'avatar-user';

      const newUser: MockUser = {
        id: faker.string.uuid(),
        name: body.username,
        email: body.email,
        password: body.password,
        avatar,
        role,
      };
      users.push(newUser);
      const token = faker.string.uuid();
      sessions[token] = newUser.id;

      return HttpResponse.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    },
  ),

  http.get<PathParams, DefaultBodyType, Summary>(
    `${import.meta.env.VITE_API_URL}/api/summary`,
    async () => {
      await delay(DELAY);

      return HttpResponse.json({
        count: products.length,
        oems: new Set(products.map((p) => p.manufacturer)).size,
        value: products.reduce((total, p) => total + Number(p.price), 0),
      });
    },
  ),

  http.get<PathParams, DefaultBodyType, Array<Chart>>(
    `${import.meta.env.VITE_API_URL}/api/chart`,
    async ({ request }) => {
      await delay(DELAY);

      const url = new URL(request.url);
      const type = url.searchParams.get("type");

      if (type === "FUEL_TYPE") {
        // Return category distribution (uses same type key for compatibility)
        return HttpResponse.json(
          categories.map((c) => ({ key: c.toLowerCase(), value: products.filter((v) => v.fuel === c).length }))
        );
      }

      if (type === "OEM") {
        // Build a list of unique manufacturers
        const oems: Record<string, number> = {};

        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (typeof oems[p.manufacturer] === "undefined") {
            oems[p.manufacturer] = 1;
          } else {
            oems[p.manufacturer]++;
          }
        }

        // Convert the object to an array
        return HttpResponse.json(
          Object.entries(oems)
            .map(([key, value]) => ({ key, value }))
            .sort((a, b) => a.key.localeCompare(b.key)),
        );
      }

      if (type === "REGISTRATION_YEAR") {
        // Find the earliest year
        const minYear = Math.min(
          ...products.map((v) => new Date(v.registrationDate).getFullYear()),
        );

        // Create a map of year > count
        const years: Record<number, number> = {};
        const thisYear = new Date().getFullYear();
        for (let i = minYear; i <= thisYear; i++) {
          years[i] = 0;
        }

        // Count the number of products per year
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          const year = new Date(p.registrationDate).getFullYear();
          if (typeof years[year] === "undefined") {
            years[year] = 1;
          } else {
            years[year]++;
          }
        }

        return HttpResponse.json(
          Object.entries(years)
            .map(([key, value]) => ({ key, value }))
            .sort((a, b) => a.key.localeCompare(b.key)),
        );
      }

      return HttpResponse.json([]);
    },
  ),

  http.get<PathParams, DefaultBodyType, ProductList>(
    `${import.meta.env.VITE_API_URL}/api/products`,
    async ({ request }) => {
      await delay(DELAY);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get("page"));
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const q = url.searchParams.get("q");

      // Filter the results
      const filtered = products.filter((product) => {
        if (q) {
          if (product.manufacturer.toLowerCase().includes(q.toLowerCase())) {
            return true;
          }
          if (product.model.toLowerCase().includes(q.toLowerCase())) {
            return true;
          }
          if (product.type.toLowerCase().includes(q.toLowerCase())) {
            return true;
          }
          return false;
        }
        return true;
      });
      return HttpResponse.json({
        summary: {
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
          page,
          pageSize,
        },
        products: filtered.slice(start, end).map((product) => ({
          id: product.id,
          vrm: product.vrm,
          manufacturer: product.manufacturer,
          model: product.model,
          type: product.type,
          color: product.color,
          fuel: product.fuel,
          price: product.price,
        })),
      });
    },
  ),

  http.get<PathParams, DefaultBodyType, Product>(
    `${import.meta.env.VITE_API_URL}/api/products/:id`,
    async ({ params }) => {
      await delay(DELAY);

      const product = products.find((v) => v.id === params.id);
      if (product === undefined) {
        return new HttpResponse(null, { status: 404 }) as StrictResponse<never>;
      }
      return HttpResponse.json(product);
    },
  ),

  http.delete(
    `${import.meta.env.VITE_API_URL}/api/products/:id`,
    async ({ request, params }) => {
      await delay(DELAY);

      // Read Authorization header: 'Bearer <token>'
      const auth = request.headers.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

      if (!token || !sessions[token]) {
        return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
      }

      const userId = sessions[token];
      const acting = users.find((u) => u.id === userId);
      if (!acting) {
        return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
      }

      // Only allow admin users to delete products they own
      const product = products.find((v) => v.id === params.id);
      if (!product) {
        return new HttpResponse(null, { status: 404 }) as StrictResponse<never>;
      }

      if (acting.role !== 'rolos admir' || product.ownerId !== acting.id) {
        return new HttpResponse(null, { status: 403 }) as StrictResponse<never>;
      }

      // Remove the product from the array
      products = products.filter((v) => v.id !== params.id);

      return HttpResponse.json({});
    },
  ),

  http.patch(
    `${import.meta.env.VITE_API_URL}/api/products/:id`,
    async ({ request, params }) => {
      await delay(DELAY);

      // Read Authorization header: 'Bearer <token>'
      const auth = request.headers.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

      if (!token || !sessions[token]) {
        return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
      }

      const userId = sessions[token];
      const acting = users.find((u) => u.id === userId);
      if (!acting) {
        return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
      }

      const product = products.find((v) => v.id === params.id);
      if (!product) {
        return new HttpResponse(null, { status: 404 }) as StrictResponse<never>;
      }

      // Only admin owners can edit
      if (acting.role !== 'rolos admir' || product.ownerId !== acting.id) {
        return new HttpResponse(null, { status: 403 }) as StrictResponse<never>;
      }

      const body = (await request.json()) as Record<string, unknown>;
      // Apply allowed updates
      const allowed = ['vrm', 'manufacturer', 'model', 'type', 'fuel', 'color', 'price', 'mileage', 'registrationDate', 'vin'];
      for (const key of Object.keys(body)) {
        if (allowed.includes(key)) {
          // assign dynamically; body and product are untyped here
          (product as any)[key] = (body as any)[key];
        }
      }

      return HttpResponse.json(product);
    },
  ),

  http.get<PathParams, DefaultBodyType, Array<string>>(
    `${import.meta.env.VITE_API_URL}/api/manufacturers`,
    async () => {
      await delay(DELAY);

      // Build a set of manufacturers
      const manufacturers = new Set(
        products.map((vehicle) => vehicle.manufacturer),
      );

      return HttpResponse.json(
        [...manufacturers].sort((a, b) => a.localeCompare(b)),
      );
    },
  ),

  http.get<PathParams, DefaultBodyType, Array<string>>(
    `${import.meta.env.VITE_API_URL}/api/models`,
    async () => {
      await delay(DELAY);

  // Build a set of models
  const models = new Set(products.map((vehicle) => vehicle.model));

      return HttpResponse.json([...models].sort((a, b) => a.localeCompare(b)));
    },
  ),

  http.get<PathParams, DefaultBodyType, Array<string>>(
    `${import.meta.env.VITE_API_URL}/api/types`,
    async () => {
      await delay(DELAY);

  // Build a set of types
  const types = new Set(products.map((vehicle) => vehicle.type));

      return HttpResponse.json([...types].sort((a, b) => a.localeCompare(b)));
    },
  ),

  http.get<PathParams, DefaultBodyType, Array<string>>(
    `${import.meta.env.VITE_API_URL}/api/colors`,
    async () => {
      await delay(DELAY);

  // Build a set of colors
  const colors = new Set(products.map((vehicle) => vehicle.color));

      return HttpResponse.json([...colors].sort((a, b) => a.localeCompare(b)));
    },
  ),

  http.post<PathParams, ProductFormData, Product>(
    `${import.meta.env.VITE_API_URL}/api/products`,
    async ({ request }) => {
      await delay(DELAY);

      const body = await request.json();
      // Determine owner from Authorization header
      const auth = request.headers.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const ownerId = token && sessions[token] ? sessions[token] : undefined;

      if (!ownerId) {
        return new HttpResponse(null, { status: 401 }) as StrictResponse<never>;
      }

      const product: Product = { ...body, id: faker.string.uuid(), ownerId };
      // Add to the array
      products.push(product);
      // Return the new product
      return HttpResponse.json(product);
    },
  ),
];
