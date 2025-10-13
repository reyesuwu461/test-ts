<!-- Personal info: replace with your name/contact or leave blank -->
## Personal

Name: Samuel Reyes Castro
Clan/Route: Macondo/Typescript
Contact: 


# vite-spa — Classic Vite + React Router SPA

This repository contains a small single-page app built with Vite, React and React Router 6. It is designed as a learning/demo project and includes a mocked API (MSW) for local development, Storybook stories, and Playwright tests.

Highlights

- React Router 6 data loaders & actions (route-level data fetching)
- UI components built with shadcn/ui primitives and Radix
- Dark/light mode support via Tailwind
- Mocked API in dev using `msw`
- Playwright tests and Storybook stories included

Status: Development/demo — not production hardened.

Project structure (important files)

- `index.html` — app entry
- `src/main.tsx` — app bootstrap and router
- `src/routes/` — route components (login, register, vehicles, etc.)
- `src/components/` — reusable UI components (Card, Input, Button...)
- `src/mocks/` — MSW handlers & setup used in dev
- `public/` — static assets (mock service worker)
- `tests/` — Playwright tests
- `package.json` — scripts & dependencies

Quickstart — Windows (PowerShell)

1) Instalar dependencias

```powershell
npm install
```

2) Levantar servidor de desarrollo (MSW activado)

```powershell
npm run dev
```

3) Abrir en el navegador

Abre http://localhost:5173

Notas sobre MSW

- El proyecto usa un helper para arrancar Vite con la variable `VITE_MSW=true` para iniciar el service worker (esto habilita las respuestas mock en dev). Si arrancas Vite sin esa variable, las rutas esperan un backend real.

Quickstart — Ubuntu / Linux (bash)

1) Requisitos: Node.js + npm

Recomendado: Node 18+ (o la versión que uses localmente). Comprueba la versión:

```bash
node --version
npm --version
```

Si necesitas instalar Node.js en Ubuntu (NodeSource):

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

2) Clonar el repositorio (si aún no lo tienes local)

```bash
# con HTTPS
git clone https://github.com/tuusuario/vite-spa.git

# o con SSH (si tienes claves configuradas)
git clone git@github.com:tuusuario/vite-spa.git

cd vite-spa
```

3) Instalar dependencias

```bash
npm install
```

4) Ejecutar en modo desarrollo

```bash
npm run dev
```

Nota: en bash puedes forzar el worker con la variable de entorno:

```bash
VITE_MSW=true npm run dev
```

5) Abrir en el navegador

Abre http://localhost:5173

Notas y soluciones a problemas comunes

- Si ves errores relacionados con `@vitejs/plugin-react` u otras dependencias faltantes: instala la dependencia faltante, por ejemplo:

```bash
npm install --save-dev @vitejs/plugin-react
```

- Si `npm run dev` indica que la variable `VITE_MSW` no está activa y las rutas devuelven errores, arranca con `VITE_MSW=true` o usa el helper adecuado.

Tests

- Playwright tests están en `tests/`. Para ejecutar:

```powershell
npm run test
```

Recomendaciones antes de subir a GitHub

- Añade un `.gitignore` (no subir `node_modules`, `.env`, builds, etc.)
- No subir credenciales ni `env` con secretos

Minimal `.gitignore` sugerido

```
node_modules/
dist/
build/
.vite/
.vscode/
.env
.env.local
npm-debug.log*

public/mockServiceWorker.js
```