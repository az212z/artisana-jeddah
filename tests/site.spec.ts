import { test, expect } from "@playwright/test";

test.describe("ARTISANA International site", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has RTL Arabic document and correct title", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page).toHaveTitle(/أرتيزانا/);
  });

  test("hero renders headline and primary CTA", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("مساحات");
    await expect(page.getByRole("link", { name: /اطلب استشارة أو عرض سعر/ }).first()).toBeVisible();
  });

  test("Google rating is cited", async ({ page }) => {
    await expect(page.getByText(/تقييم 4\.4 على خرائط قوقل/).first()).toBeVisible();
  });

  test("no WhatsApp anywhere (landline only)", async ({ page }) => {
    expect(await page.locator('a[href*="wa.me"]').count()).toBe(0);
    expect(await page.locator('a[href*="whatsapp"]').count()).toBe(0);
    await expect(page.locator('.fab--call')).toBeVisible();
    expect(await page.locator('a[href="tel:0122753477"]').count()).toBeGreaterThan(0);
  });

  test("floating buttons are Call and Maps only", async ({ page }) => {
    await expect(page.locator(".fab--call")).toBeVisible();
    await expect(page.locator(".fab--maps")).toBeVisible();
    expect(await page.locator(".fab").count()).toBe(2);
  });

  test("all images load and have alt text", async ({ page }) => {
    // Scroll the whole page so lazy gallery images load
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    const imgs = page.locator("main img");
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute("alt", /.+/);
      const ok = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      expect(ok).toBeTruthy();
    }
  });

  test("full-screen mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#burgerBtn").click();
    const menu = page.locator("#mobileMenu");
    await expect(menu).toHaveAttribute("data-open", "true");
    const box = await menu.boundingBox();
    expect(box?.width).toBeGreaterThan(380);
    await page.locator("#closeMenuBtn").click();
    await expect(menu).toHaveAttribute("data-open", "false");
  });

  test("quote form validates then succeeds with toast", async ({ page }) => {
    await page.locator("#submitBtn").click();
    await expect(page.locator(".field[data-invalid='true']").first()).toBeVisible();

    await page.fill("#name", "محمد العتيبي");
    await page.fill("#phone", "0501234567");
    await page.selectOption("#service", { index: 1 });
    await page.locator("#submitBtn").click();
    await expect(page.locator("#toast")).toHaveAttribute("data-show", "true");
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflow).toBeFalsy();
  });

  test("JSON-LD InteriorDesigner with rating present", async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain("InteriorDesigner");
    expect(ld).toContain("4.4");
    expect(ld).toContain("+966122753477");
  });
});
