import { test, expect } from "@playwright/test";
test("review does not execute cleanup; selected sample items produce labeled history", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A little less clutter." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore sample scan" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your cleanup, reviewed." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review files", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "Select npm package downloads",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Preview this cleanup?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Room to breathe." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Simulate cleanup" }).click();
  await expect(
    page.getByText("Your real files haven’t changed.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View history", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sample cleanup PREVIEW" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sample cleanup PREVIEW" }),
  ).toBeVisible();
});
test("search, exclusion, themes and minimum-size layout are usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 960, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore sample scan" }).click();
  await page.getByRole("button", { name: "Review files", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Search findings" })
    .fill("Next.js");
  await expect(
    page.getByRole("button", {
      name: "Inspect Next.js build cache",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Inspect npm package downloads",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Inspect Next.js build cache", exact: true })
    .click();
  await page.getByRole("button", { name: "Ignore this item" }).click();
  await page.getByRole("button", { name: "Ignored", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Inspect Next.js build cache",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "light theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("switch", { name: "Reduce visual effects" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-reduce", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
test("cancelled sample scan creates no cleanup history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore sample scan" }).click();
  await page.getByRole("button", { name: "Cancel scan", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A little less clutter." }),
  ).toBeVisible({ timeout: 7000 });
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your story starts here." }),
  ).toBeVisible();
});

test("application search, sorting and keyboard focus work together", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Applications", exact: true }).click();
  await expect(page.locator(".application-row").first()).toContainText(
    "Visual Studio Code",
  );
  await page.getByLabel("Sort applications").selectOption("name");
  await expect(page.locator(".application-row").first()).toContainText("Figma");
  await page.keyboard.press("Meta+f");
  await expect(
    page.getByRole("searchbox", { name: "Search applications" }),
  ).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Search applications" })
    .fill("no-such-app");
  await expect(
    page.getByText("No matching applications", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator(".application-row")).toHaveCount(3);
});
