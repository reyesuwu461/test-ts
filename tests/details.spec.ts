import { expect, test } from "@playwright/test";
import { mockAll } from "./helpers";

test.beforeEach(async ({ page, context }) => {
  await mockAll(page, context);

  await page.route("**/api/products/1", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: {
          id: "1",
          vrm: "VRM1",
          manufacturer: "Ford",
          model: "Focus",
          type: "Saloon",
          fuel: "Gasoline",
          color: "black",
          vin: "1234567890",
          mileage: 10000,
          registrationDate: "2021-01-01",
          price: "29999",
        },
      });
    }

    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: {} });
    }
  });
});

test("details", async ({ page }) => {
  await page.goto("/products/1");

  await expect(page.getByRole("heading", { name: "VRM1" })).toBeVisible();
  await expect(page.getByText("Ford Focus")).toBeVisible();

  await expect(page.getByRole("term")).toHaveCount(9);

  await expect(page.getByRole("term").nth(0)).toHaveText("Manufacturer");
  await expect(page.getByRole("definition").nth(0)).toHaveText("Ford");

  await expect(page.getByRole("term").nth(1)).toHaveText("Model");
  await expect(page.getByRole("definition").nth(1)).toHaveText("Focus");

  await expect(page.getByRole("term").nth(2)).toHaveText("Category");
  await expect(page.getByRole("definition").nth(2)).toHaveText("Saloon");

  await expect(page.getByRole("term").nth(3)).toHaveText("Category");
  await expect(page.getByRole("definition").nth(3)).toHaveText("Laptop");

  await expect(page.getByRole("term").nth(4)).toHaveText("Colour");
  await expect(page.getByRole("definition").nth(4)).toHaveText("Black");

  await expect(page.getByRole("term").nth(5)).toHaveText("Stock");
  await expect(page.getByRole("definition").nth(5)).toHaveText("10,000");

  await expect(page.getByRole("term").nth(6)).toHaveText("Price");
  await expect(page.getByRole("definition").nth(6)).toHaveText("£29,999");

  await expect(page.getByRole("term").nth(7)).toHaveText("Release date");
  await expect(page.getByRole("definition").nth(7)).toHaveText("1 January 2021");

  await expect(page.getByRole("term").nth(8)).toHaveText("Serial number");
  await expect(page.getByRole("definition").nth(8)).toHaveText("1234567890");

  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("delete product", async ({ page }) => {
  await page.goto("/products/1");

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Are you sure you want to delete this product?",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();

  // We should end up back on the home page
  await expect(page).toHaveURL("/");
});
