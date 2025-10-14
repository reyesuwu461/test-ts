// Font imports
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
// Main app CSS
import "./index.css";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLoading } from "./components/app-loading.tsx";
import { ErrorPage } from "./components/error-page.tsx";
import { NotFound } from "./components/not-found.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "./components/toaster.tsx";
import { Root } from "./routes/root.tsx";

async function enableMocking() {
  if (import.meta.env.VITE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({ onUnhandledRequest: "bypass" });
  }
}

void enableMocking().then(() => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      loader: Root.loader,
      errorElement: <ErrorPage />,
      shouldRevalidate: () => {
        // Only load the user profile once
        return false;
      },
      children: [
        {
          index: true,
          lazy: () => import("./routes/index.tsx"),
          errorElement: <ErrorPage />,
        },
        {
          path: "products",
          lazy: () => import("./routes/products.tsx"),
          errorElement: <ErrorPage />,
        },
        {
          path: "products/:id",
          lazy: () => import("./routes/details.tsx"),
          errorElement: <ErrorPage />,
        },
        {
          path: "products/:id/destroy",
          lazy: () => import("./routes/destroy.tsx"),
          errorElement: <ErrorPage />,
        },
        {
          path: "add",
          lazy: () => import("./routes/add.tsx"),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "login",
      lazy: () => import("./routes/login.tsx"),
      errorElement: <ErrorPage />,
    },
        {
          path: "register",
          lazy: () => import("./routes/register.tsx"),
          errorElement: <ErrorPage />,
        },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} fallbackElement={<AppLoading />} />
        <Toaster />
      </ThemeProvider>
    </React.StrictMode>,
  );
});
