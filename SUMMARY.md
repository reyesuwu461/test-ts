# Resumen del proyecto — TechNova Dashboard

Este documento resume la estructura del proyecto, archivos principales, su funcionalidad y el flujo entre ellos.

Fecha: 16 de octubre de 2025

---

## Visión general

SPA en TypeScript/React (Vite) para gestionar un catálogo de productos (anteriormente vehículos). Usa react-router con loaders/actions, axios para llamadas API, MSW opcional para mocks, y un servidor Express simple como backend (con fallback en memoria o conexión a MongoDB si se configura). Contiene componentes UI reutilizables y pruebas E2E (Playwright).

---

## Archivos raíz y configuración

- `index.html` — HTML de entrada con el `div#root`.
- `package.json` — dependencias y scripts.
- `vite.config.ts` — configuración de Vite.
- `tsconfig*.json` — configuración TypeScript.
- `tailwind.config.ts`, `postcss.config.js` — configuración de TailwindCSS.
- `.storybook/*` — configuración de Storybook.
- `playwright.config.ts` y `tests/*` — configuración y pruebas E2E.

---

## Servidor / API

- `server/index.js`
  - Servidor Express que responde a endpoints `/api/*` (CRUD de productos, listas auxiliares y endpoints de login/register demo).
  - Usa MongoDB si `MONGO_URI` está presente; si no, usa almacenamiento in-memory.
  - Endpoints principales:
    - `GET /api/products` — listado (paginado, filtrado por q).
    - `GET /api/products/:id` — detalle.
    - `POST /api/products` — crear.
    - `PATCH /api/products/:id` — actualizar.
    - `DELETE /api/products/:id` — borrar.
    - `GET /api/manufacturers|models|types|colors` — listas auxiliares.
    - `POST /api/login`, `POST /api/register` — endpoints demo.

---

## Punto de entrada y enrutado

- `src/main.tsx`
  - Importa estilos y fuentes.
  - Inicializa MSW si `VITE_MSW === "true"`.
  - Crea el router y define rutas (Root, index, products, details, destroy, add, login, register, not-found).
  - Monta `ThemeProvider`, `RouterProvider` y `Toaster`.

Flujo: el router usa loaders/actions para cargar datos y proteger rutas (con `privateLoader`).

---

## API cliente

- `src/api.ts`
  - Instancia `axios` con `baseURL` desde `VITE_API_URL`.
  - Interceptor que añade token desde cookie (`js-cookie`) al header `Authorization`.
  - Funciones disponibles: `login`, `register`, `getUser`, `getSummary`, `getChartData`, `getProducts`, `getProduct`, `deleteProduct`, `getManufacturers`, `getModels`, `getTypes`, `getColors`, `createProduct`, `updateProduct`.

Uso: llamadas desde loaders/actions y componentes.

---

## Tipos

- `src/types.ts` — define `Role`, `Session`, `User`, `Summary`, `Product`, `ProductFormData`, `Chart`, `ProductList`.

---

## Utilidades

- `src/lib/private-loader.ts` — wrapper para loaders que requiere token en cookies; redirige a `/login?to=` si no existe.
- `src/lib/intl.ts` — `formatNumber` y `formatCurrency`.
- `src/lib/cn.ts` — `clsx` + `tailwind-merge` helper para componer clases.
- `src/lib/labels.ts` — etiquetas de categoría (`Laptop`, `Monitor`, etc.).

---

## Mocks

- `src/mocks/browser.ts` — MSW worker.
- `src/mocks/handlers.ts` — handlers para MSW.

---

## Rutas principales (`src/routes`)

Cada archivo exporta un `loader` (cuando aplica), opcionalmente `action`, y el `Component` para render:

- `root.tsx`
  - `Root.loader = privateLoader(getUser)` — carga usuario autenticado.
  - Layout con navegación lateral y mobile, header con `ModeToggle` y `UserAvatar`.
  - Rinde `<Outlet />`.

- `index.tsx` (dashboard)
  - `loader` que llama `getSummary` y 3 `getChartData`.
  - Muestra estadísticas y charts (`FuelChart`, `OemChart`, `RegistrationYearChart`).

- `products.tsx`
  - `loader` con params page/q -> `getProducts(page, q)`.
  - Renderiza búsqueda, tabla, paginación.

- `details.tsx`
  - `loader` obtiene `product` (`getProduct(id)`) y `user` (`getUser()`).
  - Muestra detalle y, si user es owner y admin (`rolos admir`), permite editar/borrar.

- `destroy.tsx`
  - `action` que llama `deleteProduct(id)` y redirige a `/products` mostrando un toast.

- `add.tsx`
  - `loader` obtiene listas para selects (manufacturers, models, types, colors) y opcional `vehicle` para edición.
  - `action` crea (`createProduct`) o actualiza (`updateProduct`) y redirige.

- `login.tsx`
  - `action` valida form y llama `login()`. Guarda token en cookie y redirige.

- `register.tsx`
  - `action` similar a login; registra y guarda token.

- `products.backup.tsx`, `products.old.tsx` — versiones antiguas/backup.

---

## Componentes (selección)

- `src/components/theme-provider.tsx` — contexto de tema; aplica `light|dark` en documento y guarda preferencia en localStorage.
- `src/components/toaster.tsx` — wrapper de `sonner` Toaster.
- `src/components/alert-dialog.tsx` — alert dialog basado en Radix UI.
- `src/components/user-avatar.tsx` — avatar + dropdown (logout).
- `src/components/*` — input, label, button, card, table, pagination, breadcrumb, badge, separator, skeleton, sheet, tooltip, charts, statistic, etc.
- `src/components/__stories__/*` — stories para componentes (Storybook).

---

## Tests

- `tests/*` — Playwright E2E tests: `login.spec.ts`, `home.spec.ts`, `details.spec.ts`, `products.spec.ts`, `add.spec.ts`, `dark-mode.spec.ts`.
- `playwright.config.ts` — configuración de Playwright.

---

## Flujo resumido

1. `main.tsx` inicializa MSW (opcional) y el router.
2. `Root.loader` (private) carga `user`. Si ausencia de token -> redirige a `login`.
3. Rutas hijas usan loaders/actions para interactuar con `src/api.ts`.
4. `src/api.ts` llama al backend (`server/index.js` o a la API real configurada en `VITE_API_URL`).
5. El UI muestra notificaciones con `Toaster` y confirma acciones con `AlertDialog`.

---

## Observaciones y próximos pasos sugeridos

- `products.backup.tsx` y `products.old.tsx` se pueden limpiar o eliminar si no son necesarios.
- `server/index.js` sirve como backend dev/demo; para producción conectar MongoDB y endurecer auth.
- Puedo generar un diagrama de flujo o una tabla detallada por cada archivo si quieres un nivel aún más granular.

---

## ¿Qué más?

Si quieres que guarde este resumen en un archivo Markdown en otra ubicación, o que añada secciones (API docs, diagrama o tabla de rutas + endpoints), dímelo y lo agrego.
