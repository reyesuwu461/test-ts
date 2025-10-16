import { expect, test } from "@playwright/test";
import { mockAll } from "./helpers";

// This test ensures that an admin user can delete products even when they are not the owner.

test.beforeEach(async ({ page, context }) => {
  await mockAll(page, context);

  // Mock the product GET and DELETE endpoints
  await page.route("**/api/products/2", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: {
          id: "2",
          vrm: "VRM2",
          manufacturer: "Toyota",
          model: "Corolla",
          type: "Saloon",
          fuel: "Gasoline",
          color: "white",
          vin: "ABCDEFGHIJKL",
          mileage: 5000,
          registrationDate: "2020-06-01",
          price: "19999",
          ownerId: "999", // different owner
        },
      });
    }

    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: {} });
    }
  });

  // Override the /api/me response to be an admin user with a different id
  await page.route("**/api/me", async (route) => {
    await route.fulfill({ json: { id: "1", name: "Admin", email: "admin@example.com", role: "rolos admir" } });
  });
});

test("admin can delete non-owned product", async ({ page }) => {
  await page.goto("/products/2");

  // Admin should see the delete button even though they are not the owner
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Are you sure you want to delete this product?",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page).toHaveURL("/");
});
